-- ============================================================
-- 001_initial.sql
-- School Trainer — initial schema
-- Run this in your Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on public.profiles for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      using (auth.uid() = user_id);
  end if;
end $$;

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- ── quiz_attempts ────────────────────────────────────────────
create table if not exists public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  quiz_id          text not null,
  subject          text not null,
  topic            text not null,
  score            int not null check (score >= 0),
  total_questions  int not null check (total_questions > 0),
  answers_json     jsonb,
  completed_at     timestamptz not null default now()
);

create index if not exists quiz_attempts_user_quiz_idx
  on public.quiz_attempts (user_id, quiz_id);

create index if not exists quiz_attempts_user_date_idx
  on public.quiz_attempts (user_id, completed_at desc);

alter table public.quiz_attempts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users can view own attempts'
  ) then
    create policy "Users can view own attempts"
      on public.quiz_attempts for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users can insert own attempts'
  ) then
    create policy "Users can insert own attempts"
      on public.quiz_attempts for insert
      with check (auth.uid() = user_id);
  end if;
end $$;
