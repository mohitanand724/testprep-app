# Passmark — Study Abroad Test Prep

## What's in here
- `schema.sql` — run this first, in your Supabase project's SQL Editor (Dashboard → SQL Editor → New Query → paste it in → Run). This creates all the tables and security rules, plus 2 sample exams.
- `app/` — the actual website (Next.js)
- `.env.local` — already filled in with your real Supabase project URL and public key

## Running it locally (to test before deploying)
1. Install Node.js if you don't have it (nodejs.org)
2. In this folder, run:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

## Adding real content (questions, notes, tests)
For now, add content directly in Supabase:
1. Go to your Supabase project → Table Editor
2. Add rows to `topics`, `questions`, `mock_tests`, `test_questions`, and `notes`
3. A proper admin panel for this comes in the next build phase — for now this keeps things simple while we validate the product

## Deploying live (making it a real website)
1. Push this folder to a GitHub repo
2. Go to vercel.com, sign up (free), click "New Project," import your repo
3. Vercel will auto-detect Next.js. Before deploying, add the same two environment variables from `.env.local` in Vercel's project settings
4. Deploy — you'll get a live URL immediately, and can connect your own domain later

## What's built so far
- Home page listing exams
- Exam page listing that exam's mock tests + notes
- Working quiz-taking flow: answer, submit, see score + explanations
- Attempts are saved to the database for logged-in users
- Email magic-link login (no passwords to manage)

## What's not built yet (next steps)
- Admin panel for adding questions/notes without touching the database directly
- Free-test counter enforcement (the `free_tests_used` / `free_tests_limit` columns exist in `profiles` but aren't wired to the UI yet)
- Payment integration for premium
- Dashboard showing a student's test history
