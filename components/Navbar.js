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
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, padding: '16px 24px' }}>
      {user ? (
        <>
          <a href="/profile" title={user.email} style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#c9a44c',
                color: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
          </a>
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