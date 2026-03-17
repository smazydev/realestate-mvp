-- Seller leads: agents and admin can manage

create table public.seller_leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  property_address text not null,
  owner_name text,
  assigned_agent_id uuid references public.agents (id) on delete set null,
  tags text[] not null default '{}',
  city text,
  state text,
  zip text,
  source text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_seller_leads_agent_id on public.seller_leads (agent_id);
create index idx_seller_leads_assigned_agent_id on public.seller_leads (assigned_agent_id);
create index idx_seller_leads_city on public.seller_leads (city);
create index idx_seller_leads_status on public.seller_leads (status);

create trigger seller_leads_updated_at
  before update on public.seller_leads
  for each row execute function public.set_updated_at();

-- RLS: agents see own leads, admin sees all
alter table public.seller_leads enable row level security;

create policy "Agents can read own seller_leads"
  on public.seller_leads for select
  using (agent_id = public.current_agent_id());

create policy "Agents can insert own seller_leads"
  on public.seller_leads for insert
  with check (agent_id = public.current_agent_id());

create policy "Agents can update own seller_leads"
  on public.seller_leads for update
  using (agent_id = public.current_agent_id());

create policy "Agents can delete own seller_leads"
  on public.seller_leads for delete
  using (agent_id = public.current_agent_id());

create policy "Admin can read all seller_leads"
  on public.seller_leads for select
  using (public.current_user_is_admin());

create policy "Admin can insert any seller_lead"
  on public.seller_leads for insert
  with check (public.current_user_is_admin());

create policy "Admin can update any seller_lead"
  on public.seller_leads for update
  using (public.current_user_is_admin());

create policy "Admin can delete any seller_lead"
  on public.seller_leads for delete
  using (public.current_user_is_admin());
