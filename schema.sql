-- ============================================================
-- Study-Abroad Test-Prep Platform — Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (extends Supabase's built-in auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  is_premium boolean default false,
  free_tests_used int default 0,
  free_tests_limit int default 5,
  created_at timestamptz default now()
);

-- 2. EXAMS (IELTS, TOEFL, GRE, etc.)
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

-- 3. TOPICS (sections within an exam — e.g. "Reading", "Writing Task 2")
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

-- 4. QUESTIONS
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  question_text text not null,
  options jsonb not null,           -- e.g. ["Option A", "Option B", "Option C", "Option D"]
  correct_answer int not null,      -- index into options
  explanation text,
  created_at timestamptz default now()
);

-- 5. MOCK TESTS
create table public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  title text not null,
  duration_minutes int default 30,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- 6. Which questions belong to which test, and in what order
create table public.test_questions (
  test_id uuid references public.mock_tests(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  position int not null,
  primary key (test_id, question_id)
);

-- 7. NOTES (short notes per topic)
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  title text not null,
  content text not null,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- 8. TEST ATTEMPTS (a student taking a mock test)
create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  test_id uuid references public.mock_tests(id) on delete cascade,
  score int,
  total_questions int,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- 9. Individual answers within an attempt
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.test_attempts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_answer int,
  is_correct boolean
);

-- ============================================================
-- ROW LEVEL SECURITY — locks every table down by default,
-- then opens specific, narrow rules.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.mock_tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.notes enable row level security;
alter table public.test_attempts enable row level security;
alter table public.attempt_answers enable row level security;

-- Profiles: a user can only see/edit their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Content tables (exams, topics, questions, mock_tests, test_questions, notes):
-- readable by anyone (including logged-out visitors), never writable
-- from the browser — content gets added by you via the Supabase dashboard
-- or the service_role key, never the public anon key.
create policy "Anyone can read exams" on public.exams for select using (true);
create policy "Anyone can read topics" on public.topics for select using (true);
create policy "Anyone can read questions" on public.questions for select using (true);
create policy "Anyone can read mock tests" on public.mock_tests for select using (true);
create policy "Anyone can read test_questions" on public.test_questions for select using (true);
create policy "Anyone can read free notes" on public.notes for select using (true);

-- Test attempts: a user can only see and create their OWN attempts
create policy "Users can view own attempts"
  on public.test_attempts for select using (auth.uid() = user_id);
create policy "Users can create own attempts"
  on public.test_attempts for insert with check (auth.uid() = user_id);
create policy "Users can update own attempts"
  on public.test_attempts for update using (auth.uid() = user_id);

-- Attempt answers: a user can only see/create answers tied to their own attempt
create policy "Users can view own answers"
  on public.attempt_answers for select
  using (attempt_id in (select id from public.test_attempts where user_id = auth.uid()));
create policy "Users can create own answers"
  on public.attempt_answers for insert
  with check (attempt_id in (select id from public.test_attempts where user_id = auth.uid()));

-- ============================================================
-- Auto-create a profile row whenever someone signs up
-- ============================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Sample seed data so the app has something to show right away
-- ============================================================
insert into public.exams (name, slug, description) values
  ('IELTS', 'ielts', 'International English Language Testing System'),
  ('TOEFL', 'toefl', 'Test of English as a Foreign Language');

insert into public.topics (exam_id, name, slug)
  select id, 'Reading', 'reading' from public.exams where slug = 'ielts';
insert into public.topics (exam_id, name, slug)
  select id, 'Vocabulary', 'vocabulary' from public.exams where slug = 'toefl';
-- ============================
-- Corrected schema matching app code
-- ============================

drop table if exists public.attempt_answers cascade;
drop table if exists public.test_attempts cascade;
drop table if exists public.test_questions cascade;
drop table if exists public.options cascade;
drop table if exists public.questions cascade;
drop table if exists public.mock_tests cascade;
drop table if exists public.notes cascade;

create table public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) not null,
  title text not null,
  duration_minutes integer default 30,
  is_premium boolean default false,
  created_at timestamp with time zone default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  options text[] not null,
  correct_answer integer not null,
  explanation text
);

create table public.test_questions (
  test_id uuid references public.mock_tests(id) not null,
  question_id uuid references public.questions(id) not null,
  position integer not null,
  primary key (test_id, question_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) not null,
  title text not null,
  content text
);

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  test_id uuid references public.mock_tests(id) not null,
  score integer not null,
  total_questions integer not null,
  completed_at timestamp with time zone default now()
);

create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.test_attempts(id) not null,
  question_id uuid references public.questions(id) not null,
  selected_answer integer,
  is_correct boolean
);

-- Sample test with 2 questions
insert into public.mock_tests (id, exam_id, title, duration_minutes, is_premium)
  select gen_random_uuid(), id, 'IELTS Reading Practice Test 1', 30, false
  from public.exams where slug = 'ielts';

with t as (select id from public.mock_tests where title = 'IELTS Reading Practice Test 1'),
q1 as (
  insert into public.questions (id, question_text, options, correct_answer, explanation)
  values (gen_random_uuid(), 'What is the capital of Australia?',
    array['Sydney','Canberra','Melbourne','Perth'], 1,
    'Canberra is the capital, not Sydney or Melbourne.')
  returning id
),
q2 as (
  insert into public.questions (id, question_text, options, correct_answer, explanation)
  values (gen_random_uuid(), 'Which word means "happy"?',
    array['Sad','Joyful','Angry','Tired'], 1,
    '"Joyful" is a synonym for happy.')
  returning id
)
insert into public.test_questions (test_id, question_id, position)
select t.id, q1.id, 1 from t, q1
union all
select t.id, q2.id, 2 from t, q2;