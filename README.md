# StudyForge — AI-Powered Interactive Study Assistant

An interactive study tool built for the Flam Frontend Internship assignment. Unlike chatbots that render raw, unstructured text bubbles, StudyForge turns free-form notes and topics into validated, interactive **Flashcards** and **Quizzes** with comprehensive failure handling, client-side re-test rounds, and zero exposure of API credentials to the browser.

---
## UI Design 
<img width="1881" height="845" alt="Screenshot 2026-09-25 145401" src="https://github.com/user-attachments/assets/db8d5984-0a65-4a21-b7b5-2b6a2f8bcceb" />
<img width="1887" height="841" alt="Screenshot 2026-09-25 145438" src="https://github.com/user-attachments/assets/d0d31664-a5bd-4939-9d7e-05f4afb080a9" />

## 1. Overview
- **Interactive Flashcards**: 3D flipping, Got it / Missed tracking, deck progress, card shuffle, and "Study missed only" adaptive rounds.
- **Interactive Quizzes**: Multiple-choice questions with instant feedback and explanations, live score calculation, results breakdown, and "Re-test wrong answers" rounds.
- **Resilient AI Integration**: Strict server-side schema prompt, JSON output mode, client-side code-fence extraction and shape validation, dropping invalid items while retaining valid ones, and stale-response guards.
- **Privacy & Security**: All LLM calls pass through an Express proxy backend (`/api/generate`). The API key is never bundled or sent to the browser.

---

## 2. Setup & Installation

### Prerequisites
- Node.js (v18 or newer recommended, tested on Node v24)
- npm (v9 or newer)
- A Gemini API key (Free tier available at [Google AI Studio](https://aistudio.google.com/))

### Quick Start
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd flam-frontend-assignment
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your `GEMINI_API_KEY`:
   ```env
   PORT=3001
   GEMINI_API_KEY=AIzaSy...your_key_here
  LLM_MODEL=gemini-3.8-flash
   MOCK_MODE=none
   ```
4. Run both frontend and backend concurrently:
   ```bash
   npm start
   ```
5. Open your browser at `http://localhost:5173`.

---

## 3. Usage Guide
1. **Enter Topic or Notes**: Paste lecture notes, study text, or type a simple topic (e.g. *"Photosynthesis"*, *"Operating Systems Scheduling"*).
2. **Select Mode & Count**:
   - Choose **Flashcards** or **Quiz**.
   - Choose the number of items (5, 8, 10, or 15).
3. **Generate**: Click **Generate Study Set** or press `Ctrl + Enter` (`Cmd + Enter` on macOS).
4. **Interactive Study**:
   - **Flashcards**: Click or press `Space` to flip. Mark cards as **Got it** or **Missed**. When complete, click **Study Missed Only** to repeat just the missed cards.
   - **Quiz**: Click or press `1-4` to select options. Read the instant explanation. At the results screen, click **Re-test Wrong Answers** to drill down on missed questions.

---

## 4. Architecture

```
[ Browser / React App ]
      │
      │  POST /api/generate (Vite Dev Proxy)
      ▼
[ Express Backend Proxy (Port 3001) ] ── Reads .env (GEMINI_API_KEY)
      │
      │  Google Gemini REST API (JSON mode, 25s timeout)
      ▼
[ Google Gemini Model ]
      │
      │  Returns JSON String
      ▼
[ Express Backend Proxy ]
      │  Returns { raw: string }
      ▼
[ React Client (useGenerate hook) ]
      │
      ├── 1. parseModelOutput.ts (strips ```json code fences, parses JSON)
      ├── 2. validateResult.ts (checks shape, drops invalid items, assigns stable IDs)
      └── 3. Error Boundary + ResultView (renders FlashcardDeck or Quiz)
```

### Why the API key is kept on the server
Placing API keys in frontend code or client-side `.env` files (e.g. `VITE_GEMINI_KEY`) embeds the key into the client JavaScript bundle, allowing any visitor to extract and abuse the key. Running a lightweight Express proxy ensures the key remains strictly on the server while also enforcing input length limits, timeouts, and rate-limit normalization.

---

## 5. Data Shape

### Flashcards Schema
```json
{
  "title": "Photosynthesis Basics",
  "mode": "flashcards",
  "cards": [
    {
      "question": "What is the primary pigment used in photosynthesis?",
      "answer": "Chlorophyll",
      "hint": "Gives plants their green color"
    }
  ]
}
```

### Quiz Schema
```json
{
  "title": "Photosynthesis Basics",
  "mode": "quiz",
  "questions": [
    {
      "question": "Where does the light-dependent reaction occur?",
      "options": ["Stroma", "Thylakoid Membrane", "Cytoplasm", "Mitochondria"],
      "correctIndex": 1,
      "explanation": "Light reactions occur within the thylakoid membranes of chloroplasts."
    }
  ]
}
```

---

## 6. Failure Handling Matrix

| Failure Mode | Detection Strategy | UI Experience / Recovery |
|---|---|---|
| **Malformed JSON** | `JSON.parse` fails even after fence stripping & brace extraction | Shows clear error: *"The AI returned something unreadable."* with a **Try Again** button. |
| **Wrong Shape** | JSON parses, but lacks required fields or invalid types | Shows *"The AI's response wasn't in the expected format."* with a **Try Again** button. |
| **Partially Valid** | Some items are malformed, but at least 1 valid item exists | Renders valid items with an alert notice: *"X items were skipped because the AI returned them incorrectly"*. |
| **Empty Response** | Empty payload, empty array, or zero valid items | Treated as a visible error state with retry. Never leaves blank screen. |
| **Slow Response / Timeout** | 30s client `AbortController` timeout + 25s server timeout | Displays loading state with an active **Cancel** button. If timed out, shows friendly timeout notice + Retry. |
| **Failed Request (4xx / 5xx / 429)** | Server maps status codes to normalized error codes (`RATE_LIMITED`, `UPSTREAM_ERROR`, etc.) | Category-specific messages (e.g., rate limit notice, server down) + Retry. |
| **Missing API Key** | Backend detects missing `GEMINI_API_KEY` | Normalized `MISSING_KEY` error instructing setup without leaking secrets. |
| **Stale Overwrite** | `useRef` incrementing request ID + aborting prior `AbortController` | Older, slower network responses are discarded and cannot overwrite newer ones. |
| **Render Crash** | Unexpected component exceptions | Caught by React `ErrorBoundary` around `ResultView` with a friendly reload option. |

---

## 7. How to Test Failures with `MOCK_MODE`

The server supports a `MOCK_MODE` setting in `.env` (or via the client-side Mock Selector in the app header).

Supported values:
- `malformed`: Returns corrupted, unparseable JSON text. Demonstrates client JSON parse recovery & user-friendly error with retry.
- `fenced`: Returns valid JSON wrapped inside markdown triple-backtick code fences (` ```json ... ``` `). Demonstrates regex fence stripping in `parseModelOutput.ts`.
- `wrong_shape`: Returns JSON missing the required `cards`/`questions` arrays. Demonstrates schema error detection in `validateResult.ts`.
- `bad_correct_index`: Returns quiz questions with `correctIndex` pointing out of bounds. Demonstrates index validation and item dropping.
- `empty`: Returns an empty response (`{}`). Demonstrates zero-item error handling.
- `partial`: Returns 4 items where 2 are valid and 2 are intentionally broken. Demonstrates partial validity notice banner and preservation of valid items.
- `slow`: Simulates a hanging response that exceeds client timeout. Demonstrates client-side 30s timeout and active **Cancel** button.
- `500`: Simulates an internal server / upstream error (`500 UPSTREAM_ERROR`).
- `429`: Simulates an upstream rate limit error (`429 RATE_LIMITED`).

### Automated Testing
To run the full Vitest suite with fixtures for all schema shapes, failure modes, and localStorage validation:
```bash
npm test
```

---

## 8. AI-Usage Note (Honest Disclosure)
- **AI Tools Used**: Google DeepMind Antigravity AI Assistant was utilized to assist in scaffolding the project structure, drafting the initial prompt template, authoring comprehensive CSS design tokens, and reviewing test fixtures.
- **Human Review & Authorship**: All architecture, state machines (`useReducer`), request concurrency guards, hand-written validation schemas, error boundary guards, and interactive component flows were reviewed, tested, and validated step-by-step to ensure complete explainability in live interviews.

---

## 9. Known Limitations
- Free tier Gemini API has rate limits (RPM); handling is surfaced to user as `RATE_LIMITED`.
- Notes exceeding 8,000 characters are capped to prevent token exhaustion and excessive latencies.
- Client-side re-test rounds operate on current in-memory state; refreshing resets to the saved deck if localStorage is enabled.

---

## 10. What I'd Do Next
- Add export to Anki (.apkg) / Quizlet format.
- Add AI refinement loop ("Make questions harder", "Add 5 more cards on Section 2").
- Add voice narration / speech synthesis for flashcard study on mobile.
- Add customizable spaced repetition scheduling (Leitner system or SM-2).

---

## 11. Time Spent
Time spent: approximately 8 hours, including the JavaScript conversion, validation flows, upload handling, responsive styling, and test pass.
