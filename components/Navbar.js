'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '16px 24px' }}>
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <>
          <a href="/login">Log in</a>
          <a href="/signup">Sign up</a>
        </>
      )}
    </nav>
  );
}