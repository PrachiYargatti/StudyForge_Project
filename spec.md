# SPEC.md — Study Assistant (Flashcards + Quiz)

**Assignment:** Flam Frontend Internship — AI-Powered Interactive Tool
**Chosen project:** Study assistant
**Deadline:** Sunday, 27 Sept 2026, 11:00 PM (submit early; late submissions are not considered)
**Time budget:** ~8 hours hard cap. If time runs out, stop and write "what I'd do next" in the README.

> Goal: a clean, solid core beats a pile of half-working features. Most of the score is in how unpredictable AI output becomes reliable UI, and how failure is handled.

---

## 1. Product Summary

The user pastes notes or types a topic into a free-form text box, chooses **Flashcards** or **Quiz**, and the AI returns **structured JSON**. The app validates it and renders interactive, stateful components:

- **Flashcards:** flip through cards, mark "Got it" / "Missed", re-study only missed cards.
- **Quiz:** answer multiple-choice questions, see score and explanations, **re-test only the wrong answers**.

**Hard rule: this is NOT a chatbot.** The model's raw text is never printed. Only validated, parsed data is rendered as components.

---

## 2. Assignment Requirements Checklist (must all be met)

| # | Requirement | How this project satisfies it |
|---|-------------|-------------------------------|
| 1 | React, hooks, functional components | Vite + React, `useReducer`/`useState`/`useRef`/`useEffect`, no class components |
| 2 | Free-form text input | Textarea for notes or topic |
| 3 | Real LLM API | Gemini / Groq / OpenRouter (free tier), or Ollama locally |
| 4 | Model returns structured data; app parses and renders interactive stateful UI | JSON deck → flip cards, quiz, retest |
| 5 | Handles bad output: malformed JSON, wrong shape, empty, slow, failed; no crashes; error or retry; no stale overwrite | Section 6 |
| 6 | Loading, error, and empty states | Shared `LoadingState`, `ErrorState`, `EmptyState` |
| 7 | Works on mobile | Mobile-first CSS, tested at 360–390px |
| 8 | README: setup, AI-usage note, known limitations, time spent | Section 11 |
| 9 | API key NOT in the browser (explicitly checked) | Small Express backend proxy holds the key |
| 10 | Not a chatbot | No chat history, no message bubbles, no raw text output |
| 11 | `npm install && npm start` works | Root script runs frontend and backend together |
| 12 | Public GitHub repo, small meaningful commits | Section 12 |
| 13 | Short screen recording | Section 13 |
| 14 | Original work, honest AI-usage note | Section 11 |

---

## 3. Tech Stack

- **Frontend:** React 18 + Vite (TypeScript optional; JavaScript is fine, TS is not graded — pick what you can explain confidently).
- **Styling:** plain CSS with CSS variables (or Tailwind). Keep it simple; enables dark mode cheaply and also add the flipping animation for flashcard and wherever you want its needed.
- **Backend:** Node + Express, one endpoint `POST /api/generate`. (Alternative: a serverless function if deploying to Vercel.)
- **LLM provider:** one of Gemini, Groq, OpenRouter (free tiers) or Ollama. Provider, model, and key come from `.env`. Model choice does not affect the score.
- **Validation:** a hand-written validator (`validateResult`) — preferred because it is easy to explain in the interview. Zod is acceptable if you can explain what it does.
- **SDKs:** if you use an AI SDK, be ready to explain what it does for structured output. Using plain `fetch` to the provider avoids that risk.
- **Scripts (package.json):**
  - `npm install`
  - `npm start` → runs server and Vite dev server together (e.g. `concurrently`)
  - `npm run build`

---

## 4. Project Structure

```
study-assistant/
├── src/
│   ├── components/
│   │   ├── PromptInput.jsx        # textarea, mode toggle, count, submit
│   │   ├── ResultView.jsx         # routes validated data to the right view
│   │   ├── FlashcardDeck.jsx      # flip, next/prev, got it / missed
│   │   ├── Quiz.jsx               # question, options, feedback, next
│   │   ├── QuizResults.jsx        # score + retest wrong answers
│   │   ├── ErrorState.jsx         # shared error + retry
│   │   ├── LoadingState.jsx       # skeleton/spinner + cancel
│   │   └── EmptyState.jsx         # first-visit / nothing-yet screen
│   ├── hooks/
│   │   └── useGenerate.js         # request lifecycle, stale guard, abort, timeout
│   ├── lib/
│   │   ├── api.js                 # ONLY place the frontend calls the backend
│   │   ├── validateResult.js      # shape checking + cleaning
│   │   └── parseModelOutput.js    # strip code fences, extract JSON, JSON.parse
│   ├── types/result.js            # JSDoc/TS types for the data shape
│   ├── App.jsx
│   └── main.jsx
├── server/
│   └── index.js                   # holds API key, calls LLM, normalizes errors
├── .env.example
├── .gitignore                     # includes .env
├── README.md
└── package.json
```

**Architecture rules**
- The browser talks only to `/api/generate`, never to the LLM.
- Validation lives in `lib/`, separate from components, so it can be pointed to in the interview.
- Error/loading/empty components are shared across both views, not re-invented per screen.
- Request lifecycle lives in one hook (`useGenerate`), not scattered across components.

---

## 5. Data Design (do this before writing any prompt)

### 5.1 Model output shape (what the AI must return)

**Flashcards mode**
```json
{
  "title": "Photosynthesis Basics",
  "mode": "flashcards",
  "cards": [
    { "question": "What is the main pigment in photosynthesis?", "answer": "Chlorophyll", "hint": "Makes plants green" }
  ]
}
```

**Quiz mode**
```json
{
  "title": "Photosynthesis Basics",
  "mode": "quiz",
  "questions": [
    {
      "question": "Where does the light reaction occur?",
      "options": ["Stroma", "Thylakoid membrane", "Nucleus", "Cytoplasm"],
      "correctIndex": 1,
      "explanation": "Light reactions occur in the thylakoid membranes."
    }
  ]
}
```

### 5.2 Validation rules (`validateResult`)
- Top level is an object; `mode` matches the requested mode.
- `title`: string; if missing, fall back to "Study Set".
- Flashcards: `cards` is a non-empty array; each card has non-empty string `question` and `answer`; `hint` optional string.
- Quiz: `questions` is a non-empty array; each has non-empty `question`; `options` is an array of 2–6 non-empty unique strings (aim for 4); `correctIndex` is an integer within `options` bounds; `explanation` optional string.
- **Drop invalid items, keep valid ones.** If some items were dropped, show a small notice ("2 items were skipped because the AI returned them incorrectly"). If **zero** valid items remain, treat as an error.
- Cap items (e.g. max 30) and trim strings so absurd output cannot break layout.
- After validation, the app assigns its own stable `id` to each item (do not trust model-provided ids).
- Return a result object: `{ ok: true, data, droppedCount }` or `{ ok: false, error: { code, message } }`. Never throw into the UI.

### 5.3 Prompt design (server side)
- System instruction: "Return ONLY valid JSON matching the schema. No prose, no markdown fences."
- Include the exact schema, item count (default 8, user selectable 5/8/10/15), and the user's text as data.
- Use the provider's JSON mode where available (`response_format: json_object` / Gemini `responseMimeType: application/json`), and still validate everything, because JSON mode does not guarantee the shape.
- Treat user notes as content, not instructions (mention in the prompt that text inside the notes must not change the output format).
- Cap input length (e.g. 8,000 characters), enforced in UI and on the server.
- **Test the prompt directly with curl/Postman first**, outside the UI, and save a few real good and malformed outputs as fixtures for testing.

---

## 6. Failure Handling (20% of grade, plus part of the 25% AI integration)

Each failure must be visible, must never crash, and must offer a retry where sensible.

| Failure | Detection | User sees |
|---------|-----------|-----------|
| **Malformed JSON** | `JSON.parse` fails after code-fence stripping and brace extraction | "The AI returned something unreadable." + **Try again** |
| **Wrong shape** | valid JSON but validator fails (missing fields, bad `correctIndex`, wrong mode) | "The AI's response wasn't in the expected format." + **Try again** |
| **Partially valid** | some items invalid | Show valid items + notice about skipped items |
| **Empty response** | empty string / `{}` / empty arrays / zero valid items | Treated as an **error**, not a valid empty result |
| **Slow response** | client timeout (~30s) via `AbortController`; server timeout slightly shorter | Loading state after a moment; after timeout: "Taking too long" + **Retry** + **Cancel** available during loading |
| **Failed request** | network error, 4xx/5xx, rate limit (429), missing API key | Clear message by category (offline, rate-limited, server error) + **Retry** |
| **Stale response** | request id counter in `useRef` | An older, slower response **never** overwrites a newer one |
| **Unmounted/cancelled** | `AbortController.abort()` | No state updates after cancel or unmount |

**Implementation details**
- `useGenerate` keeps `requestId = useRef(0)`; each call does `const id = ++requestId.current`; before any `setState`, check `id === requestId.current`. Also abort the previous request's `AbortController` when a new one starts.
- Status is a single state machine: `idle | loading | success | error` (via `useReducer`), so impossible states (loading + error) cannot occur.
- Server returns normalized errors: `{ error: { code, message } }` with codes such as `MISSING_KEY`, `RATE_LIMITED`, `TIMEOUT`, `UPSTREAM_ERROR`, `BAD_REQUEST`.
- Optional: one automatic silent retry on the server for malformed JSON before surfacing an error. If added, document it.
- Add a React **Error Boundary** around the result view as a last-resort guard so an unexpected render error shows a fallback instead of a white screen.
- **Never render** raw model text. Never use `dangerouslySetInnerHTML`.
- Keep the user's input on error (don't clear the textarea).
- **Test hook:** a `MOCK_MODE` env flag (or dev-only dropdown) on the server that returns each failure type on demand: malformed, wrong shape, empty, slow, 500, partial. Use it for the demo recording and for your own testing.

---

## 7. Features

### 7.1 Core (must be finished and polished before anything else)

**Input**
- Textarea (notes or topic), character counter with limit, placeholder examples.
- Mode toggle: Flashcards / Quiz. Item-count selector.
- Submit disabled when the input is empty/whitespace or a request is in flight.
- Submit with `Ctrl/Cmd + Enter`.

**Flashcards**
- Card flips on click/tap and via `Space`/`Enter` (CSS 3D flip, respects `prefers-reduced-motion`).
- Prev/Next, progress indicator ("3 / 8").
- Mark each card **Got it** or **Missed**.
- Summary at the end: known vs missed counts.
- **Study missed only** button → new round containing only missed cards (repeat until all known or user stops).
- Shuffle button.

**Quiz**
- One question at a time, options as large tappable buttons.
- Select an answer → immediate feedback (correct/incorrect highlight) + explanation; then Next.
- Progress indicator and running score.
- Results screen: score, list of wrong questions with correct answers.
- **Re-test wrong answers** button → new round with only the questions answered wrong; repeat until all correct or user stops. Show round number.
- **Restart all** and **New topic** actions.

**States**
- Empty state (first visit): short explanation + clickable example prompts.
- Loading state: skeleton/spinner, "Generating your study set…", Cancel button.
- Error state: clear message, Retry (re-sends the same input), Edit input.
- Success state: title, count, the interactive view.

**Responsive / mobile**
- Mobile-first, works at 360px width; no horizontal scroll.
- Touch targets ≥ 44px; textarea and buttons usable with on-screen keyboard.
- Test in browser device emulation and, if possible, on a real phone.

**Accessibility basics**
- Semantic elements, labels on inputs, focus visible, `aria-live` region for loading/error announcements, buttons not divs, sufficient contrast.

### 7.2 Stretch (only after core is solid; pick in this order)
1. **Save/reload session** — persist current deck + progress in `localStorage` (wrapped in try/catch, validated again on load — stored data is untrusted too).
2. **Dark mode** — CSS variables, follows system preference with a toggle.
3. **Keyboard navigation** — arrows for prev/next, `Space` to flip, `1–4` to choose quiz options, `?` shortcut hint.
4. **Animation polish** — card flip, transitions (respect reduced motion).
5. **Refinement loop** — follow-up input like "make it harder" / "add 5 more on chapter 2" that sends the existing deck plus instruction and validates the result. Only attempt if time remains.
6. **Streaming** — skip unless everything else is done; it complicates validation.

Do **not** start a stretch goal with core bugs open.

---

## 8. State Design

- `useGenerate` (hook): `{ status, data, error, droppedCount, generate(input, options), cancel, retry }`.
- Deck state: current round's items + `index`.
- Flashcards: `{ index, flipped, results: { [id]: 'known' | 'missed' } , round }`.
- Quiz: `{ index, selected, answers: { [id]: { choice, correct } }, round, finished }`.
- Re-test rounds derive from the previous round's results (filter by `missed`/wrong), never from re-calling the AI.
- Use `useReducer` for the deck/quiz logic (clear transitions, easy to explain); `useState` for simple UI flags.
- Reset deck state when a new deck arrives (key the view by deck id).

---

## 9. Backend Spec (`server/index.js`)

- `POST /api/generate` body: `{ input: string, mode: "flashcards" | "quiz", count: number }`.
- Validate the body: non-empty string, length cap, allowed mode, count within range → else `400 BAD_REQUEST`.
- Read `LLM_API_KEY`, `LLM_MODEL`, `LLM_PROVIDER`, `PORT` from env. Missing key → `500 MISSING_KEY` with a friendly message (never leak the key or stack traces).
- Call the provider with a timeout (`AbortController`), JSON mode where supported.
- Return the model's content to the client as `{ raw: string }` or parsed JSON; **the client always validates** (server-side parsing is a convenience, not trust).
- Map upstream failures: 429 → `RATE_LIMITED`, timeout → `TIMEOUT`, other → `UPSTREAM_ERROR`.
- Log errors server-side without logging the key or full user notes.
- CORS/proxy: use Vite dev proxy (`/api` → server port) so the frontend needs no hard-coded URL.
- `.env` is git-ignored; `.env.example` lists every variable with placeholder values.

---

## 10. UI/UX & Product Sense (15%)

- Clear, single-purpose screen flow: **Input → Loading → Study set → Results/Retest**.
- Obvious primary action on every screen; secondary actions (New topic, Restart) visible but quieter.
- Friendly, specific microcopy (not "Error 500").
- Consistent spacing, type scale, and colors via CSS variables.
- Don't lose user work: keep input on errors; confirm before discarding an in-progress deck when starting a new one.
- Sensible defaults (8 items, flashcards mode).

---

## 11. README.md Requirements (must include all)

1. **Overview** — what it does, screenshot/GIF, live demo link if deployed.
2. **Setup** — prerequisites, `npm install`, copy `.env.example` → `.env`, add key, `npm start`, URL to open. Must work from a fresh clone.
3. **Usage** — how to generate flashcards/quiz, retest wrong answers.
4. **Architecture** — brief diagram/description: browser → `/api/generate` → LLM; where validation lives; why key is on the server.
5. **Data shape** — the JSON schemas from Section 5.
6. **Failure handling** — table of failure modes and how each is handled (Section 6), and how to trigger them with `MOCK_MODE`.
7. **AI-usage note (honest)** — which tools (e.g. Claude/Copilot/Cursor) were used and for what (e.g. scaffolding, prompt drafting, CSS help), and what you wrote/decided yourself. Being honest counts in your favor.
8. **Known limitations** — e.g. model may produce inaccurate facts, no auth, long notes truncated, no streaming, rate limits on free tier.
9. **What I'd do next** — especially anything cut for time.
10. **Time spent** — honest total and rough breakdown (≤ 8 hours).

---

## 12. Git & Commit Plan

Small, meaningful commits (not one large commit). Suggested sequence:

1. `chore: scaffold Vite React app and project structure`
2. `docs: add spec and README skeleton`
3. `feat(server): express proxy with env-based key and /api/generate`
4. `feat(server): normalized error responses and timeout`
5. `feat(lib): parseModelOutput and validateResult with fixtures`
6. `feat: useGenerate hook with stale-response guard and abort`
7. `feat: PromptInput with mode, count, and limits`
8. `feat: loading, error, and empty states`
9. `feat: flashcard deck with flip and known/missed tracking`
10. `feat: study-missed-only flashcard rounds`
11. `feat: quiz flow with feedback and explanations`
12. `feat: quiz results and re-test wrong answers`
13. `feat: mock mode for simulating failure cases`
14. `fix/style: mobile layout pass`
15. `feat: error boundary and partial-validity notice`
16. `feat(stretch): localStorage session save/reload`
17. `feat(stretch): dark mode and keyboard shortcuts`
18. `docs: finalize README, limitations, time spent`

Never commit `.env` or a real API key. If a key leaks, revoke it immediately.

---

## 13. Testing & Demo

**Manual test matrix (record results before submitting)**
- Valid notes → flashcards; valid notes → quiz; topic only (e.g. "Photosynthesis").
- Empty input, whitespace-only, over-limit input.
- Each failure via `MOCK_MODE`: malformed JSON, JSON wrapped in ```json fences (should be recovered), wrong shape, `correctIndex` out of range, duplicate options, empty arrays, partially valid, slow (timeout), 500, 429, server down, missing key.
- Rapid double submit and submit-then-submit-again: verify newer result wins.
- Cancel during loading; navigate away during loading.
- Mobile 360px and 390px; landscape; keyboard-only run-through.
- Retest loop: miss some → retest → all correct → completion state.

**Optional automated tests:** unit tests for `parseModelOutput` and `validateResult` using the saved fixtures (fast to write, strong signal).

**Screen recording (short, 2–4 min)**
1. Generate flashcards, flip, mark missed, study missed only.
2. Generate a quiz, get some wrong, re-test wrong answers.
3. Show failure handling: malformed JSON, wrong shape, timeout, and stale-response protection.
4. Show mobile view.
5. Show that the API key is not in the browser (Network tab shows only `/api/generate`; `.env` is git-ignored).

---

## 14. Time Plan (~8 hours)

| Block | Time | Output |
|-------|------|--------|
| Data shapes + prompt tested outside UI | 0:45 | schemas, saved good/bad fixtures |
| Scaffold + backend proxy | 1:00 | working `/api/generate`, env setup |
| Parse + validate + `useGenerate` | 1:15 | failure handling core, stale guard |
| Flashcards UI + retest | 1:15 | flip, known/missed, missed-only rounds |
| Quiz UI + retest wrong | 1:15 | feedback, results, retest rounds |
| Loading/error/empty + mobile pass | 0:45 | shared states, responsive |
| Mock mode + testing failures | 0:45 | verified matrix |
| README, recording, cleanup | 1:00 | submission ready |
| **Total** | **~8:00** | Stretch only if ahead of schedule |

If behind: cut stretch goals first, then polish, never the failure handling.

---

## 15. Evaluation Mapping

| Area | Weight | Where it's earned |
|------|--------|-------------------|
| React & frontend architecture | 25% | hooks, `useReducer`, `useGenerate`, component split, shared states, Error Boundary |
| AI integration & data handling | 25% | strict prompt, JSON mode, backend proxy, key safety, validation and cleaning, normalized errors |
| Handling bad AI output | 20% | Section 6 in full, `MOCK_MODE`, stale guard, partial validity |
| UI/UX & product sense | 15% | clear flow, retest loops, microcopy, mobile, accessibility |
| Communication & understanding | 15% | README, honest AI note, clear commits, explainable code |

---

## 16. Interview Preparation

Expect to: demo the app, walk through code, review an AI-generated snippet, fix a bug the interviewers introduce, and add a small feature live. Be ready to explain:

- Why the key lives on the server and how the proxy works.
- Exactly how `useGenerate` prevents stale overwrites (`useRef` counter + `AbortController`) and why both.
- How `validateResult` works and why "drop invalid items, error on zero" was chosen.
- Why JSON mode alone isn't trusted.
- How retest rounds are derived from state.
- Why `useReducer` was chosen for the status/deck state.
- Any library or SDK used, and what it does under the hood.

Likely live feature requests to practice: add a "shuffle" button, add a timer to the quiz, add a "hint" toggle, add a new field (e.g. difficulty) end to end (prompt → validator → UI), add a keyboard shortcut.

**Rule: do not ship code you don't understand.** If AI wrote a piece, read it, run it, and be able to re-derive it.

---

## 17. Originality & Integrity

- Build this yourself; docs, tutorials, and AI assistants are fine as references.
- Do not submit an existing project, tutorial result, or someone else's code.
- Be honest in the README about AI assistance.

---

## 18. Final Submission Checklist

- [ ] Fresh clone → `npm install && npm start` works with only `.env` filled in
- [ ] `.env` is git-ignored; `.env.example` present; **no key in repo history or in the browser bundle/network calls**
- [ ] Not a chatbot: no raw model text rendered anywhere
- [ ] Flashcards: flip, known/missed, study missed only
- [ ] Quiz: feedback, results, re-test wrong answers
- [ ] Handled: malformed JSON, wrong shape, empty, slow (timeout + cancel), failed request, stale response
- [ ] Loading, error, and empty states present
- [ ] Works on mobile (360px), no horizontal scroll
- [ ] No console errors in normal use
- [ ] README complete: setup, usage, AI-usage note, limitations, what's next, time spent
- [ ] Small, meaningful commit history
- [ ] Screen recording done and linked
- [ ] (Optional, preferred) deployed on Vercel/Netlify+serverless with env var set on the platform
- [ ] Submitted via the submission form **before Sun, 27 Sept 2026, 11:00 PM** (aim for the evening of 26 Sept for buffer)
- [ ] I can explain every file in the repo