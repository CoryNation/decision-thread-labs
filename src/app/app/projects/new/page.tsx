'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  async function create() {
    const { data, error } = await supabase.from('projects').insert({ name, description }).select('*').single();
    if (!error && data) router.push(`/app/projects/${data.id}`);
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">New Project</h1>
      <div className="card p-4 space-y-3">
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Project name" value={name} onChange={e=>setName(e.target.value)} />
        <textarea className="w-full border rounded-xl px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button onClick={create} className="btn btn-accent">Create</button>
      </div>
    </section>
  )
}
