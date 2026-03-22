# RadioAssist — Frontend

React SPA for automatic radiology report generation.
This repository contains exclusively the frontend.
The backend lives in a separate repository (`radioassist-backend`).

---

## Stack

- **Framework:** React + Vite
- **Lenguaje:** TypeScript
- **Styles:** CSS Modules
- **Backend calls:** React Query (`@tanstack/react-query`)
- **Package manager:** npm
- **Testing:** Vitest + React Testing Library

---

## Product Context

Tool for breast radiologists. The radiologist dictates what they observed
and the AI generates the report using their personal templates.

The main screen is a single view — no navigation during work.
Speed of transition between patients is a top priority.

---

## Technical Decisions

- **React Query (`@tanstack/react-query`)** for all backend calls.
  Handles loading/error/cache automatically. `useMutation` for generating reports,
  `useQuery` for templates and history (cached between navigations).
- **CSS Modules over Tailwind.** Explicit styles colocated with the component.
- **The frontend never calls Anthropic directly.** Always via the backend.
- **The JWT token is stored in localStorage** and automatically included
  in every request via `src/services/api.ts`.

---

## Backend Communication

All backend communication goes through `src/services/api.ts`.
Never use fetch directly in components or hooks — always through this service.

```typescript
// src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Unknown error');
  }

  return res.json();
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

---

## Main Hooks

**`useAuth`** — login, logout, session state, token in localStorage.

**`useReport`** — dictation state and session history. Uses React Query's `useMutation`
to call `POST /api/reports/generate`. This is the most important hook.

```typescript
// src/hooks/useReport.ts
// Responsibilities:
// - Keep current dictation (text) in local useState
// - Keep sessionHistory (messages array) in local useState
// - useMutation for POST /api/reports/generate
// - Distinguish response type 'report' vs 'question'
// - onSuccess: if type === 'report' → invalidateQueries(['history'])
// - Expose newPatient() that clears dictation + history + report
```

**`useSpeech`** — Web Speech API. Activates/deactivates the microphone, accumulates
the transcribed text and exposes it for `useReport` to consume.

**`useTemplates`** — uses `useQuery` to fetch templates (cached)
and `useMutation` to create, edit and delete.

---

## Keyboard Shortcuts

Implement in the `Workbench` component with `useEffect` + `keydown`.

| Shortcut | Action |
|---|---|
| `Space` (hold) | Toggle microphone |
| `Ctrl + Enter` | Generate report |
| `Ctrl + C` | Copy report to clipboard |
| `Ctrl + N` | New patient |

---

## Pages

**`/`** → redirects to `/login` or `/workbench` based on session.

**`/login`** → login form. On successful auth redirects to `/workbench`.

**`/workbench`** → main work screen. Protected route.
  - Left panel: microphone + dictated text (editable)
  - Right panel: generated report (editable before copying)
  - Bottom bar: Generate, Copy, New Patient buttons

**`/settings`** → template and preferences management. Protected route.

---

## State Flow in Workbench

```
useSpeech          →   transcribed text
                            ↓
                       useReport
                            ↓
              POST /api/reports/generate
                            ↓
               type: 'report' | 'question'
                    ↓               ↓
             shows report      shows question
             in right panel    in right panel
                                (waits for
                                 radiologist input)
```

When `type === 'question'`, the radiologist writes/dictates the answer
and generate is called again with the updated history.
The session history is managed internally by `useReport`.

---

## Privacy

The frontend has no special privacy responsibility beyond
not showing or asking for the patient's name in any form.
The patient identification field, if present, is an optional internal ID.

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

For production, point `VITE_API_URL` to the deployed backend:

```env
VITE_API_URL=https://radioassist-backend-production.up.railway.app
```

API docs: https://radioassist-backend-production.up.railway.app/api/docs/

---

## Commands

```bash
npm run dev          # development with Vite
npm run build        # production build
npm run preview      # preview production build
npm test             # run all tests once (Vitest)
npm run test:watch   # interactive watch mode
npm run test:coverage # coverage report
```

---

## Testing

- **Framework:** Vitest + React Testing Library
- Tests live next to the file they test.
  ```
  src/hooks/useReport.ts
  src/hooks/useReport.test.ts  ← here
  ```
- Test **hooks and logic**, not DOM structure or styles.
- Mock `src/services/api.ts` in all tests that make backend calls.
- Wrap tests that use React Query in a test `QueryClientWrapper`.
- The most critical hook to test is `useReport` — covers the full cycle.

---

## Conventions

- One CSS Module file per component, same name: `Workbench.module.css`.
- Hooks encapsulate logic, components only render.
- Do not use `any` in TypeScript unless justified with a comment.
- API errors always caught and shown to the user, never silenced.
- No business logic in components — it belongs in hooks or `api.ts`.