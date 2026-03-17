-- Optional: use this AFTER creating auth users and running 001 + 002 + 003 migrations.
-- Auth users must exist first (sign up in app or create via Dashboard).
-- Replace the UUIDs below with your actual auth.users ids (from Supabase Auth or profiles table).

-- Step 1: Get your user IDs from: select id, email from auth.users; or from profiles.
-- Then set one profile as admin, e.g.:
-- update public.profiles set role = 'admin' where email = 'admin@example.com';

-- Step 2: Create agents (replace USER_ID_1 and USER_ID_2 with real auth user UUIDs):
/*
insert into public.agents (user_id, display_name, email, brokerage_name)
values
  ('USER_ID_1', 'Oran Shevach', 'oranshevach@example.com', 'Example Realty'),
  ('USER_ID_2', 'Gal Moshe', 'galmoshe@example.com', 'Example Realty')
on conflict do nothing;
*/

-- Step 3+: Run the Node seed script instead for full automation:
--   Set SUPABASE_SERVICE_ROLE_KEY in .env.local
--   pnpm run seed
-- That creates auth users and all data in one go.
