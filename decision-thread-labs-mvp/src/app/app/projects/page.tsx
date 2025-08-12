'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Project = { id: string; name: string; description: string | null }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('projects').select('*').limit(20);
      if (!error && data) setProjects(data as Project[]);
    };
    load();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/app/projects/new" className="btn btn-primary">New Project</Link>
      </div>
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
