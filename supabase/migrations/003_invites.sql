create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','editor','viewer')),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz default now(),
  accepted_at timestamptz
);

alter table public.org_invites enable row level security;

create policy "invites select if member" on public.org_invites
for select using (public.is_member(org_id));

create policy "invites insert if owner" on public.org_invites
for insert with check (exists(
  select 1 from public.memberships m
  where m.org_id = org_id and m.user_id = auth.uid() and m.role = 'owner'
));

create policy "invites delete if owner" on public.org_invites
for delete using (exists(
  select 1 from public.memberships m
  where m.org_id = org_id and m.user_id = auth.uid() and m.role = 'owner'
));

create or replace function public.accept_invite(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.org_invites;
begin
  select * into v_inv
  from public.org_invites
  where token = p_token and accepted_at is null
  limit 1;

  if not found then
    return false;
  end if;

  insert into public.profiles (id, email, full_name)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), null)
  on conflict (id) do nothing;

  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, auth.uid(), v_inv.role)
  on conflict (org_id, user_id) do nothing;

  update public.org_invites set accepted_at = now() where id = v_inv.id;

  return true;
end;
$$;

revoke all on function public.accept_invite(uuid) from public;
grant execute on function public.accept_invite(uuid) to authenticated;
