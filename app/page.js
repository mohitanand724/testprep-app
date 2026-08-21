import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default async function Home() {
  const { data: exams } = await supabase.from('exams').select('*');
  return (
    <div className="container">
      <div className="hero">
        <p className="hero-eyebrow">Boarding pass to your next exam</p>
        <h1>Passmark</h1>
        <p>Free mock tests and notes for students headed abroad.</p>
      </div>
      {exams?.map((exam) => (
        <div className="ticket" key={exam.id}>
          <div className="ticket-main">
            <p className="ticket-eyebrow">Destination exam</p>
            <h2>{exam.name}</h2>
            <p>{exam.description}</p>
            <Link className="btn" href={`/exam/${exam.slug}`}>
              View mock tests
            </Link>
          </div>
          <div className="ticket-stub">
            <span className="ticket-stub-code">{exam.slug?.toUpperCase()}</span>
            <span className="ticket-stub-label">Gate open</span>
          </div>
        </div>
      ))}
    </div>
  );
}