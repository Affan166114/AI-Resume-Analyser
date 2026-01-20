# AI-Resume-Analyser

A React Router (v7) + Vite + TailwindCSS app that analyzes resumes using Puter.js for authentication, file storage (fs), key-value storage (kv), and AI-powered feedback. Users can upload a resume, preview it, and receive structured feedback including an overall score, ATS score, and category-based suggestions.

## Features

- Upload and preview PDF resumes
- AI feedback grouped by categories with scores and tips
- ATS score with contextual suggestions
- Authentication via Puter.js
- Persistent storage via Puter fs and kv
- Responsive UI with TailwindCSS 4

## Tech Stack

- React 19, React Router v7 (@react-router/dev)
- Vite 6 with vite-tsconfig-paths
- TailwindCSS 4 (via @tailwindcss/vite)
- Zustand for app state (usePuterStore)
- TypeScript 5
- Puter.js (loaded via script tag)

## Project Structure
app/
  Components/
    ATS.tsx
    Details.tsx
    Summary.tsx
    ScoreGauge.tsx
    ... (other UI pieces, e.g., Accordion)
  lib/
    puter.ts       // Zustand store wrapping window.puter (auth, fs, kv, ai)
    utils.ts       // helpers (e.g., cn, formatSize)
  routes/
    auth.tsx       // login/logout with redirect
    home.tsx       // landing
    upload.tsx     // upload flow; writes to fs/kv
    resume.tsx     // preview + feedback (Summary, ATS, Details)
    wipe.tsx       // optional cleanup route
  routes.ts
  root.tsx         // layout, loads Puter.js <script>, initializes store
app.css
tsconfig.json
vite.config.ts
package.json



## Getting Started

- Prerequisites
  - Node.js 18+ recommended
  - pnpm or npm

- Install
  - pnpm: `pnpm install`
  - npm: `npm install`

- Development
  - pnpm: `pnpm dev`
  - npm: `npm run dev`
  - Open the local URL printed by Vite.

- Type-check
  - pnpm: `pnpm typecheck`
  - npm: `npm run typecheck`

- Production build and serve
  - pnpm: `pnpm build && pnpm start`
  - npm: `npm run build && npm start`

Scripts (from package.json):
- `dev`: react-router dev
- `build`: react-router build
- `start`: react-router-serve ./build/server/index.js
- `typecheck`: react-router typegen && tsc

## Configuration Notes

- TypeScript paths
  - `~/*` → `./app/*` (tsconfig.json)
  - Vite resolves via `vite-tsconfig-paths`
  - Prefer imports like: `import { usePuterStore } from "~/lib/puter";`

- TailwindCSS
  - Enabled via `@tailwindcss/vite`
  - Styles in [app/app.css](cci:7://file:///d:/web%20development/projects/AI-Resume-Analyser/app/app.css:0:0-0:0) and utility classes within components

- Puter.js
  - Loaded in [app/root.tsx](cci:7://file:///d:/web%20development/projects/AI-Resume-Analyser/app/root.tsx:0:0-0:0):
    ```tsx
    <script src="[https://js.puter.com/v2/"></script](https://js.puter.com/v2/"></script)>
    ```
  - `usePuterStore` (app/lib/puter.ts) exposes:
    - `auth`: `isAuthenticated`, `signIn`, `signOut`, `getUser`, `checkAuthStatus`, etc.
    - `fs`: `write`, `read`, `upload`, `delete`, `readDir`
    - `kv`: `get`, `set`, `delete`, `list`, `flush`
    - `ai`: `chat`, `img2txt`, `feedback`
    - `init()`: called in [Layout](cci:1://file:///d:/web%20development/projects/AI-Resume-Analyser/app/root.tsx:27:0-50:1) to bootstrap Puter

## App Flow

1. Upload
   - User uploads a resume in `/upload`
   - File and preview are persisted with Puter `fs`
   - Metadata and feedback stored in Puter `kv`

2. Resume Page
   - `/resume/:id` fetches data from `kv`
   - Reads binary from `fs`, creates object URLs for preview/PDF
   - Renders:
     - [Summary](cci:1://file:///d:/web%20development/projects/AI-Resume-Analyser/app/Components/Summary.tsx:23:0-43:1): overall score + category highlights
     - [ATS](cci:1://file:///d:/web%20development/projects/AI-Resume-Analyser/app/Components/ATS.tsx:12:0-74:1): ATS score + actionable tips
     - [Details](cci:1://file:///d:/web%20development/projects/AI-Resume-Analyser/app/Components/Details.tsx:108:0-159:2): per-category tips with explanations

3. Auth
   - `/auth` handles login/logout
   - Redirects to `?next=` after successful login
   - Routes can guard access (e.g., [resume.tsx](cci:7://file:///d:/web%20development/projects/AI-Resume-Analyser/app/routes/resume.tsx:0:0-0:0) redirects if unauthenticated)

## Deployment

- Build output
  - `pnpm build`
  - `npm run build`

## Configuration Notes
Path aliases:
   - ~/* → ./app/* (configured in tsconfig.json)
   - Vite resolves paths via vite-tsconfig-paths plugin
- TailwindCSS 4 is enabled by tailwindcss/vite in vite.config.ts
- Puter.js is loaded in app/root.tsx:
    <script src="https://js.puter.com/v2/"></script>
The Zustand store in app/lib/puter.ts depends on window.puter.

## Puter Integration
app/lib/puter.ts exposes usePuterStore with:
- auth: signIn, signOut, isAuthenticated, getUser, etc.
- fs: write, read, upload, delete, readDir
- kv: get, set, delete, list, flush
- ai: chat, img2txt, feedback
- init(): called in Layout via useEffect to bootstrap Puter

Auth redirect example:
    resume.tsx redirects unauthenticated users to /auth?next=/resume/:id

Storage/preview example:
    Reads blob via fs.read, creates object URLs for PDF and preview image