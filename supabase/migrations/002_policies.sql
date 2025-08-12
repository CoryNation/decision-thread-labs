alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_links enable row level security;
alter table public.data_sources enable row level security;
alter table public.metrics_snapshots enable row level security;

create policy "read own profile" on public.profiles
for select using (id = auth.uid());
create policy "insert own profile" on public.profiles
for insert with check (id = auth.uid());
create policy "update own profile" on public.profiles
for update using (id = auth.uid());

create or replace function public.is_member(org uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

create policy "org read if member" on public.organizations
for select using (public.is_member(id));

create policy "org update if owner" on public.organizations
for update using (exists(select 1 from memberships m where m.org_id = id and m.user_id = auth.uid() and m.role = 'owner'));

create policy "member read if same org" on public.memberships
for select using (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid()));

create policy "member write owner only" on public.memberships
for all using (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid() and m.role = 'owner'))
with check (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid() and m.role = 'owner'));

create policy "project read if member" on public.projects
for select using (public.is_member(org_id));

create policy "project insert if editor" on public.projects
for insert with check (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','editor')));

create policy "project update if editor" on public.projects
for update using (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','editor')));

create policy "project delete if owner" on public.projects
for delete using (exists(select 1 from memberships m where m.org_id = org_id and m.user_id = auth.uid() and m.role = 'owner'));

create policy "decisions read if member" on public.decisions
for select using (public.is_member((select org_id from public.projects p where p.id = project_id)));

create policy "decisions write if editor" on public.decisions
for all using (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
))
with check (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
));

create policy "links read if member" on public.decision_links
for select using (public.is_member((select org_id from public.projects p where p.id = project_id)));

create policy "links write if editor" on public.decision_links
for all using (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
))
with check (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
));

create policy "sources read if member" on public.data_sources
for select using (public.is_member((select org_id from public.projects p where p.id = project_id)));

create policy "sources write if editor" on public.data_sources
for all using (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
))
with check (exists(
  select 1 from memberships m join projects p on p.org_id = m.org_id
  where p.id = project_id and m.user_id = auth.uid() and m.role in ('owner','editor')
));

create policy "metrics read if member" on public.metrics_snapshots
for select using (public.is_member((select org_id from public.projects p where p.id = project_id)));
