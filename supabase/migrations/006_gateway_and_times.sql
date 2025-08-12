alter table public.decision_links drop constraint if exists decision_links_kind_check;
alter table public.decision_links
  add constraint decision_links_kind_check
  check (kind in ('precedes','depends_on','informs','data'));

do $$ begin
  alter table public.decisions drop constraint if exists decisions_kind_check;
exception when undefined_object then null; end $$;

alter table public.decisions
  add constraint decisions_kind_check
  check (kind in ('decision','data','opportunity','gateway'));

do $$ begin
  alter table public.decisions add column if not exists queue_time_min integer;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.decisions add column if not exists action_time_min integer;
exception when duplicate_column then null; end $$;
