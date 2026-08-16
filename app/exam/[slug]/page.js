import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

export default async function ExamPage({ params }) {
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('slug', params.slug)
    .single();

  const { data: tests } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('exam_id', exam?.id);

  const { data: topics } = await supabase
    .from('topics')
    .select('*, notes(*)')
    .eq('exam_id', exam?.id);

  return (
    <div className="container">
      <h1>{exam?.name}</h1>

      <h2>Mock Tests</h2>
      {tests?.length ? (
        tests.map((t) => (
          <div className="card" key={t.id}>
            <h3>{t.title}</h3>
            <p>{t.duration_minutes} minutes {t.is_premium ? '· Premium' : '· Free'}</p>
            <Link className="btn" href={`/test/${t.id}`}>Start test</Link>
          </div>
        ))
      ) : (
        <p>No mock tests added yet — add some rows to the `mock_tests` table in Supabase.</p>
      )}

      <h2>Notes</h2>
      {topics?.map((topic) =>
        topic.notes?.map((note) => (
          <div className="card" key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
