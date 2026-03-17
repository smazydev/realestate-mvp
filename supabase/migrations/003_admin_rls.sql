-- Admin role: allow users with profiles.role = 'admin' to manage all data

create or replace function public.current_user_role()
returns text as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'agent')
$$ language sql stable security definer;

create or replace function public.current_user_is_admin()
returns boolean as $$
  select public.current_user_role() = 'admin'
$$ language sql stable security definer;

-- Profiles: admin can read all and update any (e.g. set role)
create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.current_user_is_admin());

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.current_user_is_admin());

-- Agents: admin can read all, insert any, update any, delete any
create policy "Admin can read all agents"
  on public.agents for select
  using (public.current_user_is_admin());

create policy "Admin can insert any agent"
  on public.agents for insert
  with check (public.current_user_is_admin());

create policy "Admin can update any agent"
  on public.agents for update
  using (public.current_user_is_admin());

create policy "Admin can delete any agent"
  on public.agents for delete
  using (public.current_user_is_admin());

-- Buyers: admin can read/insert/update/delete all
create policy "Admin can read all buyers"
  on public.buyers for select
  using (public.current_user_is_admin());

create policy "Admin can insert any buyer"
  on public.buyers for insert
  with check (public.current_user_is_admin());

create policy "Admin can update any buyer"
  on public.buyers for update
  using (public.current_user_is_admin());

create policy "Admin can delete any buyer"
  on public.buyers for delete
  using (public.current_user_is_admin());

-- Buyer target locations: admin can do everything (via buyer ownership)
create policy "Admin can read all buyer_target_locations"
  on public.buyer_target_locations for select
  using (public.current_user_is_admin());

create policy "Admin can insert any buyer_target_location"
  on public.buyer_target_locations for insert
  with check (public.current_user_is_admin());

create policy "Admin can update any buyer_target_location"
  on public.buyer_target_locations for update
  using (public.current_user_is_admin());

create policy "Admin can delete any buyer_target_location"
  on public.buyer_target_locations for delete
  using (public.current_user_is_admin());

-- Property searches: admin full access
create policy "Admin can read all property_searches"
  on public.property_searches for select
  using (public.current_user_is_admin());

create policy "Admin can insert any property_search"
  on public.property_searches for insert
  with check (public.current_user_is_admin());

create policy "Admin can update any property_search"
  on public.property_searches for update
  using (public.current_user_is_admin());

create policy "Admin can delete any property_search"
  on public.property_searches for delete
  using (public.current_user_is_admin());

-- Property matches: admin full access
create policy "Admin can read all property_matches"
  on public.property_matches for select
  using (public.current_user_is_admin());

create policy "Admin can insert any property_match"
  on public.property_matches for insert
  with check (public.current_user_is_admin());

create policy "Admin can delete any property_match"
  on public.property_matches for delete
  using (public.current_user_is_admin());

-- Email logs: admin can read all (insert still only own)
create policy "Admin can read all email_logs"
  on public.email_logs for select
  using (public.current_user_is_admin());
