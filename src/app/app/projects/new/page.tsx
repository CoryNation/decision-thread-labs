'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<{id:string; name:string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('memberships')
        .select('org_id, organizations(name)')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000');
      const rows = (data || []).map((r: any) => ({ id: r.org_id, name: r.organizations?.name || 'Org' }));
      setOrgs(rows);
      if (rows.length) setOrgId(rows[0].id);
    })();
  }, []);

  async function create() {
    setErr(null);
    if (!title.trim() || !orgId) { setErr('Please provide a title and organization.'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('projects')
      .insert({ name: title.trim(), description: description.trim(), org_id: orgId })
      .select('id')
      .single();
    setSaving(false);
    if (error) { setErr(error.message); return; }
    router.push(`/app/projects/${data!.id}`);
  }

  return (
    <section className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">New Project</h1>
      <div className="max-w-xl space-y-4">
        <label className="block">
          <div className="text-sm text-dtl-charcoal">Project Title</div>
          <input className="w-full border rounded-xl px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-sm text-dtl-charcoal">Description</div>
          <textarea className="w-full border rounded-xl px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-sm text-dtl-charcoal">Organization</div>
          <select className="w-full border rounded-xl px-3 py-2" value={orgId || ''} onChange={e=>setOrgId(e.target.value)}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button className="btn btn-accent" onClick={create} disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>
    </section>
  );
}
