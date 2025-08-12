-- Add new columns to decisions
do $$ begin
  alter table public.decisions add column if not exists kind text check (kind in ('decision','data','opportunity')) default 'decision';
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists inputs_format text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists inputs_transformed boolean default false;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists process_goal text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists process_support_needed boolean default false;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists outputs_format text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists comm_methods text[] default '{}'::text[];
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists estimated_duration_min integer;
exception when duplicate_column then null; end $$;

-- Relax decision_links.kind to include 'data'
do $$ begin
  alter table public.decision_links drop constraint if exists decision_links_kind_check;
exception when others then null; end $$;
alter table public.decision_links
  add constraint decision_links_kind_check
  check (kind in ('precedes','depends_on','informs','data'));

-- Project-level communication options
create table if not exists public.project_comm_options (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  created_at timestamptz default now(),
  unique (project_id, label)
);

alter table public.project_comm_options enable row level security;

-- Policies
create policy if not exists "comm options read if member" on public.project_comm_options
for select using (public.is_member(project_id));

create policy if not exists "comm options insert if editor" on public.project_comm_options
for insert with check (
  exists (
    select 1 from public.memberships m
    join public.projects p on p.org_id = m.org_id
    where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
  )
);

-- Seed defaults
insert into public.project_comm_options (project_id, label)
select p.id, opts.label
from public.projects p
cross join (values ('Email'), ('Verbal'), ('Form'), ('Notification'), ('Other')) as opts(label)
on conflict (project_id, label) do nothing;
