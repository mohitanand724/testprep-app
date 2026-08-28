'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
        setUsernameInput(profile.username);
      }

      const { data } = await supabase
        .from('test_attempts')
        .select('id, score, total_questions, completed_at, mock_tests(title)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      setAttempts(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSaveUsername(e) {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');

    const trimmed = usernameInput.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setUsernameError('Username must be 3-20 characters: letters, numbers, or underscores only.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', userId);
    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        setUsernameError('That username is already taken. Try another.');
      } else {
        setUsernameError('Something went wrong. Please try again.');
      }
      return;
    }

    setUsername(trimmed);
    setUsernameSuccess('Username saved!');
  }

  if (loading) {
    return <div className="container"><p>Loading your results...</p></div>;
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '1.5em' }}>
        <h2 style={{ marginTop: 0 }}>Public Username</h2>
        <p style={{ fontSize: '0.9em', marginTop: 0 }}>
          Set a username to get a shareable public page showing your total tests and average score (no personal details).
        </p>
        <form onSubmit={handleSaveUsername} style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="your-username"
            maxLength={20}
            style={{ padding: '0.5em', flex: '1 1 200px' }}
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : username ? 'Update' : 'Set Username'}
          </button>
        </form>
        {usernameError && <p style={{ color: 'crimson', fontSize: '0.9em' }}>{usernameError}</p>}
        {usernameSuccess && <p style={{ color: 'green', fontSize: '0.9em' }}>{usernameSuccess}</p>}
        {username && (
          <p style={{ fontSize: '0.9em' }}>
            Your public page: <a href={`/u/${username}`}>/u/{username}</a>
          </p>
        )}
      </div>

      <h1>Your Test History</h1>
      {attempts.length === 0 && <p>You haven't taken any tests yet.</p>}
      {attempts.map((a) => (
        <div className="card" key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{a.mock_tests?.title || 'Test'}</strong>
            <p style={{ margin: 0, fontSize: '0.9em' }}>
              {new Date(a.completed_at).toLocaleString()}
            </p>
          </div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            {a.score} / {a.total_questions}
          </div>
        </div>
      ))}
    </div>
  );
}