'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthButtons() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email ?? null);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    setStatus('Redirecting to Google...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // We rely on Supabase Auth "Site URL" for redirect.
      // If you want to be explicit later, you can add:
      // options: { redirectTo: window.location.origin }
    });
    if (error) setStatus(error.message);
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Sending magic link...');
    // Rely on Supabase Auth "Site URL" to avoid invalid redirect path issues.
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setStatus(error.message);
    else setStatus('Check your email for a login link.');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus(null);
  }

  if (userEmail) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-dtl-charcoal">
          Signed in as <span className="font-medium">{userEmail}</span>
        </div>
        <button onClick={signOut} className="btn btn-primary">Sign out</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={signInWithGoogle} className="btn btn-accent w-full">Continue with Google</button>
      <div className="text-center text-xs text-dtl-charcoal">or</div>
      <form onSubmit={signInWithEmail} className="space-y-2">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border rounded-2xl px-3 py-2"
        />
        <button type="submit" className="btn btn-primary w-full">Email me a magic link</button>
      </form>
      {status && <div className="text-xs text-dtl-charcoal">{status}</div>}
    </div>
  );
}
