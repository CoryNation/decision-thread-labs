-- Enable extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Core tables
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  data_residency text default 'US',
  allow_export_csv boolean default true,
  allow_export_pdf boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.memberships (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner','editor','viewer')) not null,
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  statement text,
  owner_user_id uuid references public.profiles(id),
  status text check (status in ('queued','in_progress','decided','blocked')) default 'queued',
  priority int default 0,
  supplier_who text, supplier_storage text, supplier_comm text,
  input_what text, input_local_storage text, input_preprocess text,
  process_to_information text, decision_upon_info text, decision_comm text,
  output_what text, output_storage text, output_comm text,
  customer_who text, handoff_notes text,
  queued_at timestamptz default now(),
  started_at timestamptz, decided_at timestamptz,
  x numeric default 0, y numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.decision_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  from_id uuid references public.decisions(id) on delete cascade,
  to_id uuid references public.decisions(id) on delete cascade,
  kind text check (kind in ('precedes','depends_on','informs')) not null,
  weight numeric default 1
);

create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  kind text,
  url text,
  owner text,
  refresh_cadence text
);

create table if not exists public.metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  captured_at timestamptz default now(),
  lead_time_ms bigint,
  wait_time_ms bigint,
  wip_count int
);
