'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const q = useSearchParams();
  const email = q.get('email') || '';
  const [status, setStatus] = useState<string>('Checking session…');
  const [signedIn, setSignedIn] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(!!session);
      if (!session) {
        setStatus('Please sign in to accept this invite.');
        return;
      }
      setStatus('Accepting invite…');
      const { data, error } = await supabase.rpc('accept_invite', { p_token: token });
      if (error) {
        setStatus(error.message);
      } else if (data) {
        setAccepted(true);
        setStatus('Invite accepted!');
      } else {
        setStatus('This invite is invalid or already used.');
      }
    };
    run();
  }, [token]);

  if (!signedIn) {
    return (
      <section className="max-w-md mx-auto px-4 py-16">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">Accept Invite</h1>
          <p className="mt-2 text-sm text-dtl-charcoal">{status}</p>
          <div className="mt-4"><Link href="/auth" className="btn btn-primary w-full">Sign in</Link></div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Accept Invite</h1>
        <p className="mt-2 text-sm text-dtl-charcoal">{email ? `Invited email: ${email}` : ''}</p>
        <p className="mt-2 text-sm text-dtl-charcoal">{status}</p>
        <div className="mt-4">
          <Link href="/app/projects" className="btn btn-accent w-full">{accepted ? 'Go to Projects' : 'Back to Projects'}</Link>
        </div>
      </div>
    </section>
  );
}
