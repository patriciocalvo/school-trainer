-- ============================================================
-- 003_rename_tables.sql
-- School Trainer — prefix all app tables with st_
-- ============================================================

alter table if exists public.profiles      rename to st_profiles;
alter table if exists public.quiz_attempts rename to st_quiz_attempts;
alter table if exists public.quizzes       rename to st_quizzes;

-- Update the trigger function to point to the renamed profiles table
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.st_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
