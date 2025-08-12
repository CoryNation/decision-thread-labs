'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Org = { id: string; name: string; slug: string };
type Member = { user_id: string; role: 'owner'|'editor'|'viewer'; profiles?: { email: string|null, full_name: string|null } };
type Invite = { id: string; email: string; role: string; token: string; created_at: string; accepted_at: string|null };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function OrgSettings() {
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner'|'editor'|'viewer'>('editor');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: orgs } = await supabase.from('organizations').select('*').order('created_at', {ascending: true}).limit(1);
      const current = (orgs || [])[0] || null;
      setOrg(current);
      if (current) {
        const { data: mems } = await supabase.from('memberships').select('user_id, role, profiles(email, full_name)').eq('org_id', current.id).order('role');
        setMembers((mems as any) || []);
        const { data: invs } = await supabase.from('org_invites').select('*').eq('org_id', current.id).order('created_at', {ascending:false});
        setInvites((invs as any) || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  async function createInvite() {
    if (!org) return;
    setStatus('Creating invite...');
    const { data, error } = await supabase.from('org_invites').insert({ org_id: org.id, email, role }).select('*').single();
    if (error) { setStatus(error.message); return; }
    setInvites(v => [data as Invite, ...v]);
    setEmail('');
    setRole('editor');
    setStatus('Invite created. Copy the link below and send to the invitee.');
  }

  function inviteLink(inv: Invite) {
    return `${SITE_URL}/app/invite/${inv.token}?email=${encodeURIComponent(inv.email)}`;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Organization Settings</h1>
      {loading && <div className="mt-4">Loading…</div>}
      {!loading && !org && <div className="mt-4 card p-4">You are not a member of any organization yet.</div>}
      {org && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="card p-4">
            <h2 className="font-semibold">Organization</h2>
            <div className="mt-2 text-sm text-dtl-charcoal">Name: {org.name}</div>
            <div className="text-sm text-dtl-charcoal">Slug: {org.slug}</div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Members</h3>
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m.user_id} className="flex items-center justify-between">
                    <span className="text-sm">{m.profiles?.email ?? m.user_id}</span>
                    <span className="text-xs rounded-full bg-dtl-ow px-2 py-1">{m.role}</span>
                  </li>
                ))}
                {members.length === 0 && <li className="text-sm text-dtl-charcoal">No members yet.</li>}
              </ul>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold">Invite a member</h2>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <input className="border rounded-xl px-3 py-2" placeholder="email@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
              <select className="border rounded-xl px-3 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button onClick={createInvite} className="btn btn-accent">Create invite</button>
              {status && <div className="text-xs text-dtl-charcoal">{status}</div>}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Pending Invites</h3>
              <ul className="space-y-3">
                {invites.map(inv => (
                  <li key={inv.id} className="border rounded-xl p-3">
                    <div className="text-sm"><span className="font-medium">{inv.email}</span> — {inv.role}</div>
                    <div className="text-xs text-dtl-charcoal">Created {new Date(inv.created_at).toLocaleString()}</div>
                    {!inv.accepted_at ? (
                      <div className="mt-2">
                        <div className="text-xs text-dtl-charcoal">Invite link:</div>
                        <input readOnly value={inviteLink(inv)} className="w-full text-xs border rounded-xl px-2 py-1" onFocus={e=>e.currentTarget.select()} />
                      </div>
                    ) : (
                      <div className="text-xs text-green-700 mt-2">Accepted {new Date(inv.accepted_at).toLocaleString()}</div>
                    )}
                  </li>
                ))}
                {invites.length === 0 && <li className="text-sm text-dtl-charcoal">No invites yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
