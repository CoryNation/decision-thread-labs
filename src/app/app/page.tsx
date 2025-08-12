'use client';
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AppHome() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(!!session);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Decision Thread App</h1>
      <p className="text-dtl-charcoal">Quick actions</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/app/projects" className="btn btn-accent">Open Projects</Link>
        <Link href="/app/settings" className="btn btn-primary">App Settings</Link>
        <Link href="/app/settings/organization" className="btn btn-primary">Organization</Link>
        {!signedIn && <Link href="/auth" className="btn btn-primary">Sign in</Link>}
      </div>
    </section>
  )
}
