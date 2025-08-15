'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SiteNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSignedIn(false);
  }

  return (
    <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[15px] font-semibold tracking-wide text-slate-800">
            Decision Thread Labs
          </Link>
          <div className="hidden gap-5 text-sm text-slate-600 md:flex">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/methodology" className="hover:text-slate-900">Methodology</Link>
            <Link href="/services" className="hover:text-slate-900">Services</Link>
            <Link href="/software" className="hover:text-slate-900">Software</Link>
            <Link href="/book" className="hover:text-slate-900">Book</Link>
            <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={signedIn ? '/app/projects' : '/auth'}
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            App
          </Link>

          {signedIn ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
