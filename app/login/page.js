'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setSent(true);
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Log in</h1>
        {sent ? (
          <p>Check your email for a login link.</p>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
            />
            <button className="btn" type="submit">Send login link</button>
          </form>
        )}
      </div>
    </div>
  );
}
