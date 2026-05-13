-- ============================================================
-- 004_fix_rls_after_rename.sql
-- Fix RLS policies broken by table rename (profiles → st_profiles)
-- Also relax delete/update to not require created_by ownership,
-- so teachers can manage all quizzes (not only their own).
-- ============================================================

-- ── st_quizzes ────────────────────────────────────────────────

drop policy if exists "Students can view published quizzes"  on public.st_quizzes;
drop policy if exists "Teachers can insert quizzes"          on public.st_quizzes;
drop policy if exists "Teachers can update own quizzes"      on public.st_quizzes;
drop policy if exists "Teachers can delete own quizzes"      on public.st_quizzes;

create policy "Students can view published quizzes"
  on public.st_quizzes for select
  using (
    is_published = true
    or exists (
      select 1 from public.st_profiles
      where user_id = auth.uid() and role = 'teacher'
    )
  );

create policy "Teachers can insert quizzes"
  on public.st_quizzes for insert
  with check (
    exists (
      select 1 from public.st_profiles
      where user_id = auth.uid() and role = 'teacher'
    )
  );

create policy "Teachers can update quizzes"
  on public.st_quizzes for update
  using (
    exists (
      select 1 from public.st_profiles
      where user_id = auth.uid() and role = 'teacher'
    )
  );

create policy "Teachers can delete quizzes"
  on public.st_quizzes for delete
  using (
    exists (
      select 1 from public.st_profiles
      where user_id = auth.uid() and role = 'teacher'
    )
  );

-- ── st_quiz_attempts ──────────────────────────────────────────

drop policy if exists "Teachers can view all attempts"  on public.st_quiz_attempts;

create policy "Teachers can view all attempts"
  on public.st_quiz_attempts for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.st_profiles
      where user_id = auth.uid() and role = 'teacher'
    )
  );

-- ── handle_new_user trigger ───────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.st_profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;
