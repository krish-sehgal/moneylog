# Money Log — frontend

React + TypeScript + Vite app for Money Log.

## Scripts

```bash
npm install     # first time only
npm run dev     # dev server with HMR
npm run build   # typecheck + production build
npm run preview # serve the production build
npm run lint    # oxlint
```

## State

The app is a blank shell: `src/App.tsx` renders an empty page and `src/index.css`
holds the base reset. Nothing is wired to the API yet.

The backend lives in `../backend` and runs on `http://localhost:8000`
(`POST /api/v1/auth/login`, `GET/POST /api/v1/transactions`).
