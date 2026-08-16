import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default async function Home() {
  const { data: exams } = await supabase.from('exams').select('*');

  return (
    <div className="container">
      <h1>Passmark</h1>
      <p>Free mock tests and notes for students headed abroad.</p>

      {exams?.map((exam) => (
        <div className="card" key={exam.id}>
          <h2>{exam.name}</h2>
          <p>{exam.description}</p>
          <Link className="btn" href={`/exam/${exam.slug}`}>
            View mock tests
          </Link>
        </div>
      ))}
    </div>
  );
}
