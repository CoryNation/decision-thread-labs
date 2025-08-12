'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Project = { id: string; name: string; description: string | null }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(!!session);
      if (!session) {
        setMessage('Please sign in to view your projects.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('projects').select('*').limit(20);
      if (error) {
        setMessage('No access yet. If this is your first time, create an org and membership in Supabase.');
      } else {
        setProjects(data as Project[]);
      }
      setLoading(false);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/app/projects/new" className="btn btn-primary">New Project</Link>
      </div>
      {loading && <div className="mt-6">Loading…</div>}
      {!loading && message && (
        <div className="mt-6 card p-4">
          <p className="text-dtl-charcoal">{message}</p>
          {!signedIn && <div className="mt-3"><Link className="text-dtl-teal underline" href="/auth">Go to Sign in</Link></div>}
        </div>
      )}
      <ul className="mt-6 grid md:grid-cols-2 gap-4">
        {projects.map(p => (
          <li key={p.id} className="card p-4">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-dtl-charcoal">{p.description}</p>
            <div className="mt-3">
              <Link className="text-dtl-teal underline" href={`/app/projects/${p.id}`}>Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
