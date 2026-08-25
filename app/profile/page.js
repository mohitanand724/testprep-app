'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
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

  if (loading) {
    return <div className="container"><p>Loading your results...</p></div>;
  }

  return (
    <div className="container">
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