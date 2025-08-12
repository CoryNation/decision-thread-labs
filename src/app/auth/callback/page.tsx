'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AuthCallback() {
  useEffect(() => {
    // When redirected back from Supabase, supabase-js will detect tokens in the URL
    // and persist the session automatically.
    const handle = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // You can route to the app automatically if you want:
        // window.location.href = '/app/projects';
      }
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">You're signed in</h1>
        <p className="mt-2 text-sm text-dtl-charcoal">
          Session established. Continue to your projects.
        </p>
        <div className="mt-6">
          <Link href="/app/projects" className="btn btn-accent w-full">Go to Projects</Link>
        </div>
      </div>
    </section>
  );
}
