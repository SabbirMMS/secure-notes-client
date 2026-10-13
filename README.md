# Secure Notes Client

A small React client for the secure notes REST API. The backend is a separate service.

## Setup

1. Install the dependencies listed in `package.json` with your package manager.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin (for example, `http://localhost:5003`).
3. Start the backend separately, then run `npm run dev` in this folder.

The browser calls `${VITE_API_URL}/api/...`. The backend must allow the frontend origin through CORS. For a production deployment, set `VITE_API_URL` in the hosting environment before building. `vercel.json` rewrites client-side routes to `index.html`.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — create a production build in `dist/`.
- `npm run preview` — preview a production build locally.

## Routes

- `/login`, `/register` — authentication.
- `/notes` — create, edit, delete, and page through your notes; login required.
- `/posts` — public posts; signed-in users can create posts and delete their own posts. Admins can delete any post.
- `/users/:id/posts` — public posts and interests for one user, paginated with `hasMore`.
- `/admin/users` — manage users; admin required.
- `/admin/notes` — list all notes, optionally filtered by owner ID; admin required.
- `/admin/interests` — paginated interest groups, optionally filtered by interest; admin required.

The root route goes to `/notes` when signed in and `/login` otherwise.

## Token storage

The client stores the bearer token in `localStorage` under `secure-notes-token`. This keeps login across reloads, but JavaScript on the page can read the token, so an XSS bug could expose it. An `httpOnly` cookie would keep the token out of JavaScript but requires backend cookie handling and CSRF protection. The backend remains responsible for enforcing authorization.
