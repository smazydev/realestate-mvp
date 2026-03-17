-- Property Matchmaker MVP: initial schema
-- Run in Supabase SQL editor or via supabase db push

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- Profiles: extends auth.users, stores role
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'agent' check (role in ('admin', 'agent')),
  created_at timestamptz not null default now()
);

-- Agents: one per user (for agent role)
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  email text not null,
  brokerage_name text,
  created_at timestamptz not null default now()
);

create index idx_agents_user_id on public.agents (user_id);

-- Buyers: belong to an agent
create table public.buyers (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  buyer_name text not null,
  budget_min numeric,
  budget_max numeric,
  notes text,
  status text,
  buyer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_buyers_agent_id on public.buyers (agent_id);

-- Buyer target locations: cities, neighborhoods, zip
create table public.buyer_target_locations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers (id) on delete cascade,
  city text,
  neighborhood text,
  zip_code text,
  created_at timestamptz not null default now()
);

create index idx_buyer_target_locations_buyer_id on public.buyer_target_locations (buyer_id);

-- Property searches: saved address/search records per agent
create table public.property_searches (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  raw_address text not null,
  normalized_address text,
  city text,
  neighborhood text,
  zip_code text,
  lat double precision,
  lng double precision,
  price numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_property_searches_agent_id on public.property_searches (agent_id);
create index idx_property_searches_city on public.property_searches (city);
create index idx_property_searches_zip_code on public.property_searches (zip_code);

-- Property matches: link property_search -> buyer with score and reasons
create table public.property_matches (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.property_searches (id) on delete cascade,
  buyer_id uuid not null references public.buyers (id) on delete cascade,
  match_score integer,
  match_reasons jsonb,
  created_at timestamptz not null default now(),
  unique (property_id, buyer_id)
);

create index idx_property_matches_property_id on public.property_matches (property_id);
create index idx_property_matches_buyer_id on public.property_matches (buyer_id);

-- Email logs: sent emails for audit
create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.property_searches (id) on delete set null,
  buyer_id uuid references public.buyers (id) on delete set null,
  sender_agent_id uuid not null references public.agents (id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body text,
  status text not null default 'sent',
  provider_message_id text,
  created_at timestamptz not null default now()
);

create index idx_email_logs_sender_agent_id on public.email_logs (sender_agent_id);

-- Updated_at trigger for buyers and property_searches
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger buyers_updated_at
  before update on public.buyers
  for each row execute function public.set_updated_at();

create trigger property_searches_updated_at
  before update on public.property_searches
  for each row execute function public.set_updated_at();

-- Create profile on signup (Supabase Auth hook or trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    'agent'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: get current user's agent_id (for RLS)
create or replace function public.current_agent_id()
returns uuid as $$
  select id from public.agents where user_id = auth.uid()
$$ language sql stable security definer;
