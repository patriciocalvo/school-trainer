-- ============================================================
-- 002_quizzes_and_roles.sql
-- School Trainer — quizzes table, teacher role, seed data
-- Idempotent: safe to run multiple times
-- ============================================================

-- ── profiles: add role + email columns ───────────────────────
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles
      add column role text not null default 'student'
      constraint profiles_role_check check (role in ('student', 'teacher'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles add column email text;
  end if;
end $$;

-- Update trigger to also store email on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

-- ── quizzes table ─────────────────────────────────────────────
create table if not exists public.quizzes (
  id            text primary key,
  title         text not null,
  subject       text not null,
  topic         text not null,
  subtopic      text,
  difficulty    int not null default 1 check (difficulty in (1, 2, 3)),
  questions     jsonb not null default '[]'::jsonb,
  is_published  bool not null default true,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists quizzes_subject_topic_idx
  on public.quizzes (subject, topic);

create index if not exists quizzes_published_idx
  on public.quizzes (is_published);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'quizzes_set_updated_at'
  ) then
    create trigger quizzes_set_updated_at
      before update on public.quizzes
      for each row execute procedure public.set_updated_at();
  end if;
end $$;

alter table public.quizzes enable row level security;

-- students: see only published quizzes
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes'
      and policyname = 'Students can view published quizzes'
  ) then
    create policy "Students can view published quizzes"
      on public.quizzes for select
      using (
        is_published = true
        or exists (
          select 1 from public.profiles
          where user_id = auth.uid() and role = 'teacher'
        )
      );
  end if;
end $$;

-- teachers: full CRUD on their own quizzes
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes'
      and policyname = 'Teachers can insert quizzes'
  ) then
    create policy "Teachers can insert quizzes"
      on public.quizzes for insert
      with check (
        exists (
          select 1 from public.profiles
          where user_id = auth.uid() and role = 'teacher'
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes'
      and policyname = 'Teachers can update own quizzes'
  ) then
    create policy "Teachers can update own quizzes"
      on public.quizzes for update
      using (
        created_by = auth.uid()
        and exists (
          select 1 from public.profiles
          where user_id = auth.uid() and role = 'teacher'
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes'
      and policyname = 'Teachers can delete own quizzes'
  ) then
    create policy "Teachers can delete own quizzes"
      on public.quizzes for delete
      using (
        created_by = auth.uid()
        and exists (
          select 1 from public.profiles
          where user_id = auth.uid() and role = 'teacher'
        )
      );
  end if;
end $$;

-- ── quiz_attempts: teachers can see all attempts ─────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts'
      and policyname = 'Teachers can view all attempts'
  ) then
    create policy "Teachers can view all attempts"
      on public.quiz_attempts for select
      using (
        auth.uid() = user_id
        or exists (
          select 1 from public.profiles
          where user_id = auth.uid() and role = 'teacher'
        )
      );
  end if;
end $$;

-- Drop the old student-only select policy if it exists (replaced by the one above)
do $$ begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts'
      and policyname = 'Users can view own attempts'
  ) then
    drop policy "Users can view own attempts" on public.quiz_attempts;
  end if;
end $$;

-- ── seed: insert the 3 existing quizzes ──────────────────────

insert into public.quizzes (id, title, subject, topic, subtopic, difficulty, questions, is_published, created_by)
values (
  'vb-basico-01',
  'V y B: el pasado con -aba y palabras del día a día',
  'lengua',
  'ortografia',
  'v-vs-b',
  1,
  $json$[{"text":"Cuando contamos lo que hacíamos antes, los verbos terminados en -AR usan -ABA y se escriben siempre con B. Ejemplos: jugaba, miraba, saltaba. ¿Cuál de estas palabras está escrita CORRECTAMENTE?","options":[{"key":"a","text":"yo saltava"},{"key":"b","text":"ella mirava"},{"key":"c","text":"él jugaba"},{"key":"d","text":"nosotros cantávamos"},{"key":"e","text":"vos corrava"}],"answer":"c"},{"text":"Completá la oración con la forma correcta: \"Todos los días yo ___ a la pelota con mis amigos en el recreo.\"","options":[{"key":"a","text":"jugava"},{"key":"b","text":"jugáva"},{"key":"c","text":"jugeba"},{"key":"d","text":"jugaba"},{"key":"e","text":"juegaba"}],"answer":"d"},{"text":"Tu amiga te cuenta algo de cuando era chica: \"Mi mamá me ___ cuentos antes de dormir.\"","options":[{"key":"a","text":"contava"},{"key":"b","text":"cuentaba"},{"key":"c","text":"contaba"},{"key":"d","text":"contáva"},{"key":"e","text":"conteba"}],"answer":"c"},{"text":"Leé estas cinco palabras y encontrá la que está MAL escrita.","options":[{"key":"a","text":"boca"},{"key":"b","text":"beso"},{"key":"c","text":"varco"},{"key":"d","text":"bola"},{"key":"e","text":"bien"}],"answer":"c"},{"text":"Ahora con la V. Leé estas cinco palabras y encontrá la que está MAL escrita.","options":[{"key":"a","text":"vaca"},{"key":"b","text":"verde"},{"key":"c","text":"biento"},{"key":"d","text":"vaso"},{"key":"e","text":"vida"}],"answer":"c"},{"text":"En el partido del sábado, el equipo de Mateo ___ muy bien: hacía goles y no dejaba pasar nada.","options":[{"key":"a","text":"jugava"},{"key":"b","text":"jugáva"},{"key":"c","text":"juegaba"},{"key":"d","text":"jugeba"},{"key":"e","text":"jugaba"}],"answer":"e"},{"text":"TUBO (con B) es el caño por donde pasa el agua o la pasta de dientes. TUVO (con V) es el pasado de \"tener\". ¿Cuál oración está bien escrita?","options":[{"key":"a","text":"Mi hermano tubo fiebre ayer."},{"key":"b","text":"El tuvo de la canilla goteaba."},{"key":"c","text":"Ella tubo mucho sueño en clase."},{"key":"d","text":"El tubo de pasta de dientes está vacío."},{"key":"e","text":"El gato tubo tres gatitos."}],"answer":"d"},{"text":"La palabra BIEN (= de manera correcta) siempre se escribe con B. ¿Cuál de estas oraciones está CORRECTAMENTE escrita?","options":[{"key":"a","text":"Vos hacés tus tareas vien."},{"key":"b","text":"¡Qué vien que salió el dibujo!"},{"key":"c","text":"Me fue muy vien en el examen."},{"key":"d","text":"Hoy me siento muy bien."},{"key":"e","text":"El partido salió vien."}],"answer":"d"},{"text":"Repaso: leé las cinco oraciones y encontrá la ÚNICA que está bien escrita.","options":[{"key":"a","text":"Cuando era chico, yo corrava todos los días."},{"key":"b","text":"Mi hermana tubo una bicicleta roja."},{"key":"c","text":"En el recreo nosotros saltávamos a la soga."},{"key":"d","text":"El perro de mi abuela ladraba mucho de noche."},{"key":"e","text":"Ella cantava muy vien en el acto del colegio."}],"answer":"d"},{"text":"Desafío: ¿cuál de estas oraciones tiene DOS errores?","options":[{"key":"a","text":"Ella cantaba y bailaba en el escenario."},{"key":"b","text":"Mi mamá cocinava y yo comía vien."},{"key":"c","text":"El tubo de la canilla perdía agua."},{"key":"d","text":"En invierno yo tomaba chocolate caliente."},{"key":"e","text":"Mi abuelo tenía una vaca en el campo."}],"answer":"b"}]$json$::jsonb,
  true,
  null
) on conflict (id) do nothing;

insert into public.quizzes (id, title, subject, topic, subtopic, difficulty, questions, is_published, created_by)
values (
  'h-basico-01',
  '✏️ La H: palabras que sí y palabras que no',
  'lengua',
  'ortografia',
  'letra-h',
  1,
  $json$[{"text":"🤫 La H es una letra \"muda\": se escribe pero no suena. Por eso muchas veces la olvidamos al escribir. ¿Cuál de estas palabras está escrita CORRECTAMENTE?","options":[{"key":"a","text":"uevo"},{"key":"b","text":"elado"},{"key":"c","text":"oja"},{"key":"d","text":"ormiga"},{"key":"e","text":"hola"}],"answer":"e"},{"text":"Completá la oración: \"Mañana a las diez de la ___ voy al cumpleaños de Sofía.\"","options":[{"key":"a","text":"ora"},{"key":"b","text":"orra"},{"key":"c","text":"orha"},{"key":"d","text":"hora"},{"key":"e","text":"horra"}],"answer":"d"},{"text":"👋 OLA es una ola del mar. HOLA es el saludo. ¿Cuál de estas oraciones usa la palabra CORRECTA en el espacio en blanco? \"Cuando llegué al colegio le dije ___ a mi maestra.\"","options":[{"key":"a","text":"ola"},{"key":"b","text":"olla"},{"key":"c","text":"hoola"},{"key":"d","text":"holla"},{"key":"e","text":"hola"}],"answer":"e"},{"text":"Ahora al revés. En la playa las ___ eran tan altas que nos mojamos todos.","options":[{"key":"a","text":"holas"},{"key":"b","text":"hollas"},{"key":"c","text":"olas"},{"key":"d","text":"ollas"},{"key":"e","text":"hoolas"}],"answer":"c"},{"text":"🥚 Cuando una palabra lleva H, todas las palabras de su familia también la llevan. HUEVO → huevos, huevito. ¿Cuál oración está bien escrita?","options":[{"key":"a","text":"Mi mamá hizo uevos revueltos para el desayuno."},{"key":"b","text":"Compramos una docena de uevos en el almacén."},{"key":"c","text":"Los uevos de gallina son blancos o marrones."},{"key":"d","text":"Mi mamá hizo huevos revueltos para el desayuno."},{"key":"e","text":"Trajeron uevos frescos del campo."}],"answer":"d"},{"text":"¿Cuál de estas palabras lleva H?","options":[{"key":"a","text":"luna"},{"key":"b","text":"sol"},{"key":"c","text":"hormiga"},{"key":"d","text":"arena"},{"key":"e","text":"mesa"}],"answer":"c"},{"text":"La palabra AHORA siempre lleva H en el medio. ¿Cuál de estas oraciones está bien escrita?","options":[{"key":"a","text":"Aora mismo voy a buscar la mochila."},{"key":"b","text":"Voy aora al kiosco a comprar un alfajor."},{"key":"c","text":"Aora termino la tarea, te juro."},{"key":"d","text":"Ahora voy a buscar la mochila."},{"key":"e","text":"Déjame, aora lo hago."}],"answer":"d"},{"text":"🌿 HIERBA lleva H al principio. Si sabés eso, ¿cuál de estas formas del plural está bien escrita?","options":[{"key":"a","text":"iervas"},{"key":"b","text":"hiervas"},{"key":"c","text":"hierbas"},{"key":"d","text":"ierbas"},{"key":"e","text":"hierrbas"}],"answer":"c"},{"text":"🔍 Repaso: leé las cinco oraciones y encontrá la ÚNICA que está bien escrita.","options":[{"key":"a","text":"Me comí un elado de dulce de leche en el recreo."},{"key":"b","text":"El perro enterró el ueso en el jardín."},{"key":"c","text":"Aora mismo voy al kiosco."},{"key":"d","text":"Mi abuela siempre hace las mejores empanadas."},{"key":"e","text":"El pájaro se posó sobre una oja del árbol."}],"answer":"d"},{"text":"🏆 Desafío: ¿cuál de estas oraciones tiene DOS palabras mal escritas?","options":[{"key":"a","text":"Hola, ¿cómo estás? Hace mucho frío hoy."},{"key":"b","text":"El ijo de mi vecino izo un gol en el partido del sábado."},{"key":"c","text":"Las olas del mar eran muy altas ayer."},{"key":"d","text":"Mi hermano siempre hace la tarea antes de cenar."},{"key":"e","text":"Hoy comimos huevos con tostadas en el desayuno."}],"answer":"b"}]$json$::jsonb,
  true,
  null
) on conflict (id) do nothing;

insert into public.quizzes (id, title, subject, topic, subtopic, difficulty, questions, is_published, created_by)
values (
  'matematica-tablas-01',
  '🔢 Tablas del 2 al 5: ¿las sabés de memoria?',
  'matematica',
  'tablas',
  'tablas-2-al-5',
  1,
  $json$[{"text":"🍎 Hay 2 canastas y en cada una hay 4 manzanas. ¿Cuántas manzanas hay en total?","options":[{"key":"a","text":"6"},{"key":"b","text":"8"},{"key":"c","text":"10"},{"key":"d","text":"4"},{"key":"e","text":"2"}],"answer":"b"},{"text":"¿Cuánto es 3 × 7?","options":[{"key":"a","text":"18"},{"key":"b","text":"24"},{"key":"c","text":"10"},{"key":"d","text":"21"},{"key":"e","text":"27"}],"answer":"d"},{"text":"⚽ En cada equipo de fútbol juegan 5 jugadores de campo. ¿Cuántos jugadores hay en 4 equipos?","options":[{"key":"a","text":"9"},{"key":"b","text":"25"},{"key":"c","text":"20"},{"key":"d","text":"16"},{"key":"e","text":"15"}],"answer":"c"},{"text":"¿Cuánto es 4 × 8?","options":[{"key":"a","text":"36"},{"key":"b","text":"28"},{"key":"c","text":"24"},{"key":"d","text":"32"},{"key":"e","text":"40"}],"answer":"d"},{"text":"🎈 Hay 6 pibes en la fiesta y cada uno trajo 3 globos. ¿Cuántos globos hay en total?","options":[{"key":"a","text":"9"},{"key":"b","text":"15"},{"key":"c","text":"24"},{"key":"d","text":"21"},{"key":"e","text":"18"}],"answer":"e"},{"text":"¿Cuánto es 5 × 9?","options":[{"key":"a","text":"40"},{"key":"b","text":"54"},{"key":"c","text":"35"},{"key":"d","text":"50"},{"key":"e","text":"45"}],"answer":"e"},{"text":"🍕 Cada pizza tiene 4 porciones. Si Tomás compró 7 pizzas, ¿cuántas porciones hay?","options":[{"key":"a","text":"11"},{"key":"b","text":"24"},{"key":"c","text":"28"},{"key":"d","text":"32"},{"key":"e","text":"21"}],"answer":"c"},{"text":"¿Cuánto es 2 × 9?","options":[{"key":"a","text":"11"},{"key":"b","text":"16"},{"key":"c","text":"20"},{"key":"d","text":"18"},{"key":"e","text":"14"}],"answer":"d"},{"text":"🔍 Repaso: ¿cuál de estas cuentas da 24?","options":[{"key":"a","text":"3 × 9"},{"key":"b","text":"4 × 5"},{"key":"c","text":"2 × 10"},{"key":"d","text":"5 × 6"},{"key":"e","text":"3 × 8"}],"answer":"e"},{"text":"🏆 Desafío: en el almacén de la esquina venden alfajores en cajitas de 4. Si comprás 6 cajitas, ¿cuántos alfajores tenés? ¿Y si le regalás 8 a tu amiga, cuántos te quedan?","options":[{"key":"a","text":"Me quedan 14"},{"key":"b","text":"Me quedan 16"},{"key":"c","text":"Me quedan 18"},{"key":"d","text":"Me quedan 20"},{"key":"e","text":"Me quedan 10"}],"answer":"b"}]$json$::jsonb,
  true,
  null
) on conflict (id) do nothing;
