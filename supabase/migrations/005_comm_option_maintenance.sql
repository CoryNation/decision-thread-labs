-- Helper function: rename a project-level comm option and update decisions.comm_methods accordingly
create or replace function public.rename_comm_option(p_project_id uuid, p_old_label text, p_new_label text)
returns void language plpgsql security definer as $$
begin
  update public.project_comm_options
    set label = p_new_label
    where project_id = p_project_id and label = p_old_label;

  update public.decisions
    set comm_methods = array_replace(comm_methods, p_old_label, p_new_label)
    where project_id = p_project_id;
end; $$;

-- Helper function: delete a project-level comm option and remove from decisions.comm_methods
create or replace function public.delete_comm_option(p_project_id uuid, p_label text)
returns void language plpgsql security definer as $$
begin
  delete from public.project_comm_options
    where project_id = p_project_id and label = p_label;

  update public.decisions
    set comm_methods = array_remove(comm_methods, p_label)
    where project_id = p_project_id;
end; $$;

-- Allow calling these if user is owner/editor of the project's org
grant execute on function public.rename_comm_option(uuid, text, text) to anon, authenticated;
grant execute on function public.delete_comm_option(uuid, text) to anon, authenticated;
