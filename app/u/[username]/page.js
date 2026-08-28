import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function PublicProfilePage({ params }) {
  const { username } = params;

  const { data, error } = await supabase
    .from('public_profile_stats')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>User not found</h1>
        <p>No profile exists for "{username}".</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>@{data.username}</h1>
      <p>Total tests taken: {data.total_tests}</p>
      <p>Average score: {data.average_score}</p>
    </div>
  );
}