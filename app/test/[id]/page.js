'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
export default function TestPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  useEffect(() => {
    async function load() {
      const { data: tq } = await supabase
        .from('test_questions')
        .select('position, questions(*)')
        .eq('test_id', params.id)
        .order('position');
      setQuestions(tq?.map((row) => row.questions) || []);
    }
    load();
  }, [params.id]);
  function selectAnswer(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }
  async function submit() {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct += 1;
    });
    setScore(correct);
    setSubmitted(true);
    // Save the attempt if the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: attempt } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: params.id,
          score: correct,
          total_questions: questions.length,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attempt) {
        const rows = questions.map((q) => ({
          attempt_id: attempt.id,
          question_id: q.id,
          selected_answer: answers[q.id] ?? null,
          is_correct: answers[q.id] === q.correct_answer,
        }));
        await supabase.from('attempt_answers').insert(rows);
      }
    }
  }
  if (submitted) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Score: {score} / {questions.length}</h1>
          <p>Review your answers below.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1.5rem 0' }}>
            <a href="/" className="btn">Back to homepage</a>
            <a href={`/test/${params.id}`} className="btn" onClick={() => window.location.reload()}>Retake this test</a>
          </div>
          {questions.map((q) => (
            <div key={q.id} style={{ textAlign: 'left', marginTop: '1rem' }}>
              <strong>{q.question_text}</strong>
              <p>Correct answer: {q.options[q.correct_answer]}</p>
              {q.explanation && <p><em>{q.explanation}</em></p>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <h1>Mock Test</h1>
      {questions.map((q) => (
        <div className="card" key={q.id}>
          <p><strong>{q.question_text}</strong></p>
          {q.options.map((opt, i) => (
            <label key={i} style={{ display: 'block', margin: '0.5rem 0' }}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === i}
                onChange={() => selectAnswer(q.id, i)}
              />{' '}
              {opt}
            </label>
          ))}
        </div>
      ))}
      {questions.length > 0 && (
        <button className="btn" onClick={submit}>Submit test</button>
      )}
    </div>
  );
}