'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Project = { id: string; name: string; description: string | null };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from('projects').select('id, name, description').order('created_at', { ascending: false });
    setProjects((data || []) as any);
  }

  function startEdit(p: Project) {
    setEditing(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
  }

  async function saveEdit(id: string) {
    const { error } = await supabase.from('projects')
      .update({ name: editName.trim(), description: editDesc.trim() })
      .eq('id', id);
    if (error) { setErr(error.message); return; }
    setEditing(null);
    await load();
  }

  async function del(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setErr(error.message); return; }
    await load();
  }

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link className="btn btn-accent" href="/app/projects/new">New Project</Link>
      </div>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <div key={p.id} className="card p-3 flex flex-col gap-3">
            {editing === p.id ? (
              <>
                <input className="border rounded-xl px-3 py-2" value={editName} onChange={e=>setEditName(e.target.value)} />
                <textarea className="border rounded-xl px-3 py-2" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn btn-accent" onClick={()=>saveEdit(p.id)}>Save</button>
                  <button className="btn" onClick={()=>setEditing(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-dtl-charcoal">{p.description}</div>
                <div className="flex gap-2 mt-2">
                  <Link className="btn" href={`/app/projects/${p.id}`}>Open Canvas</Link>
                  <button className="btn" onClick={()=>startEdit(p)}>Edit</button>
                  <button className="btn text-red-600" onClick={()=>del(p.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
