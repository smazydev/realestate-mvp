-- RLS: enable and policies for tenant isolation (agent-scoped)

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.buyers enable row level security;
alter table public.buyer_target_locations enable row level security;
alter table public.property_searches enable row level security;
alter table public.property_matches enable row level security;
alter table public.email_logs enable row level security;

-- Profiles: users can read/update own row
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Service role / trigger inserts profile; anon cannot insert. Allow insert only from trigger (already runs as definer).
-- No insert policy for authenticated users; profile is created by trigger.

-- Agents: users can manage their own agent row
create policy "Users can read own agent"
  on public.agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own agent"
  on public.agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agent"
  on public.agents for update
  using (auth.uid() = user_id);

-- Buyers: agent can CRUD own buyers only
create policy "Agents can read own buyers"
  on public.buyers for select
  using (agent_id = public.current_agent_id());

create policy "Agents can insert own buyers"
  on public.buyers for insert
  with check (agent_id = public.current_agent_id());

create policy "Agents can update own buyers"
  on public.buyers for update
  using (agent_id = public.current_agent_id());

create policy "Agents can delete own buyers"
  on public.buyers for delete
  using (agent_id = public.current_agent_id());

-- Buyer target locations: via buyer ownership
create policy "Agents can read own buyer locations"
  on public.buyer_target_locations for select
  using (
    exists (
      select 1 from public.buyers b
      where b.id = buyer_target_locations.buyer_id and b.agent_id = public.current_agent_id()
    )
  );

create policy "Agents can insert locations for own buyers"
  on public.buyer_target_locations for insert
  with check (
    exists (
      select 1 from public.buyers b
      where b.id = buyer_target_locations.buyer_id and b.agent_id = public.current_agent_id()
    )
  );

create policy "Agents can update own buyer locations"
  on public.buyer_target_locations for update
  using (
    exists (
      select 1 from public.buyers b
      where b.id = buyer_target_locations.buyer_id and b.agent_id = public.current_agent_id()
    )
  );

create policy "Agents can delete own buyer locations"
  on public.buyer_target_locations for delete
  using (
    exists (
      select 1 from public.buyers b
      where b.id = buyer_target_locations.buyer_id and b.agent_id = public.current_agent_id()
    )
  );

-- Property searches: agent-scoped
create policy "Agents can read own property_searches"
  on public.property_searches for select
  using (agent_id = public.current_agent_id());

create policy "Agents can insert own property_searches"
  on public.property_searches for insert
  with check (agent_id = public.current_agent_id());

create policy "Agents can update own property_searches"
  on public.property_searches for update
  using (agent_id = public.current_agent_id());

create policy "Agents can delete own property_searches"
  on public.property_searches for delete
  using (agent_id = public.current_agent_id());

-- Property matches: agents can read matches for their properties; insert/delete from server (same-agent only)
create policy "Agents can read matches for own properties"
  on public.property_matches for select
  using (
    exists (
      select 1 from public.property_searches ps
      where ps.id = property_matches.property_id and ps.agent_id = public.current_agent_id()
    )
  );

create policy "Agents can insert matches for own properties and own buyers"
  on public.property_matches for insert
  with check (
    exists (select 1 from public.property_searches ps where ps.id = property_matches.property_id and ps.agent_id = public.current_agent_id())
    and exists (select 1 from public.buyers b where b.id = property_matches.buyer_id and b.agent_id = public.current_agent_id())
  );

create policy "Agents can delete matches for own properties"
  on public.property_matches for delete
  using (
    exists (
      select 1 from public.property_searches ps
      where ps.id = property_matches.property_id and ps.agent_id = public.current_agent_id()
    )
  );

-- Email logs: agent can only see own sent emails
create policy "Agents can read own email_logs"
  on public.email_logs for select
  using (sender_agent_id = public.current_agent_id());

create policy "Agents can insert own email_logs"
  on public.email_logs for insert
  with check (sender_agent_id = public.current_agent_id());
