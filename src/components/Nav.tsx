'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Nav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setEmail(data.user?.email ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const linkCls = (href: string) =>
    `px-3 py-2 rounded-md text-sm ${
      pathname === href ? 'text-dtl-teal font-semibold' : 'text-slate-700 hover:text-slate-900'
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Decision Thread Labs
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={linkCls('/')}>Home</Link>
            <Link href="/methodology" className={linkCls('/methodology')}>Methodology</Link>
            <Link href="/services" className={linkCls('/services')}>Services</Link>
            <Link href="/software" className={linkCls('/software')}>Software</Link>
            <Link href="/book" className={linkCls('/book')}>Book</Link>
            <Link href="/blog" className={linkCls('/blog')}>Blog</Link>
            <Link href="/contact" className={linkCls('/contact')}>Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              <Link href="/app" className="px-3 py-2 text-sm rounded-md bg-dtl-navy text-white hover:opacity-90">
                App
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  location.href = '/';
                }}
                className="px-3 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="px-3 py-2 text-sm rounded-md bg-dtl-teal text-white hover:opacity-90"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
