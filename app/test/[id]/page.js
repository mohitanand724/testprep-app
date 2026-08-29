'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function TestPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const storageKey = `passmark_test_progress_${params.id}`;

  useEffect(() => {
    async function load() {
      const { data: tq } = await supabase
        .from('test_questions')
        .select('position, questions(*)')
        .eq('test_id', params.id)
        .order('position');
      setQuestions(tq?.map((row) => row.questions) || []);

      const { data: test } = await supabase
        .from('mock_tests')
        .select('duration_minutes')
        .eq('id', params.id)
        .single();

      // Check for saved progress in this browser
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers || {});
          if (typeof parsed.timeLeft === 'number') {
            setTimeLeft(parsed.timeLeft);
          } else if (test?.duration_minutes) {
            setTimeLeft(test.duration_minutes * 60);
          }
        } catch {
          if (test?.duration_minutes) setTimeLeft(test.duration_minutes * 60);
        }
      } else if (test?.duration_minutes) {
        setTimeLeft(test.duration_minutes * 60);
      }
      setLoaded(true);
    }
    load();
  }, [params.id]);

  // Save progress to browser storage whenever answers or timeLeft change
  useEffect(() => {
    if (!loaded || submitted) return;
    localStorage.setItem(storageKey, JSON.stringify({ answers, timeLeft }));
  }, [answers, timeLeft, loaded, submitted]);

  // Countdown ticker + auto-submit when time runs out
  useEffect(() => {
    if (submitted || timeLeft === null) return;
    if (timeLeft <= 0) {
      submit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

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
    localStorage.removeItem(storageKey); // clear saved progress once finished

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mock Test</h1>
        {timeLeft !== null && (
          <div
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              padding: '6px 14px',
              borderRadius: 8,
              backgroundColor: timeLeft <= 60 ? '#a33' : '#c9a44c',
              color: timeLeft <= 60 ? '#fff' : '#1a1a2e',
            }}
          >
            {formatTime(timeLeft)}
          </div>
        )}
      </div>
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