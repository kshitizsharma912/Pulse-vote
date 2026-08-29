# PulseVote Frontend

Beginner-friendly React + Vite frontend for the PulseVote FastAPI backend.

## Stack

- React
- Vite
- React Router
- Axios
- React Context
- Plain CSS

## Backend

Local FastAPI base URL:

`http://127.0.0.1:8000`

The frontend uses:

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/polls/`
- `GET /api/polls/{poll_code}`
- `POST /api/votes/`

## Setup

1. Copy `.env.example` to `.env`.
2. Change `VITE_API_BASE_URL` only if your backend runs somewhere else.
3. Install packages:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

Open the Vite URL shown in the terminal.

## Authentication

The JWT is saved in:

- `localStorage["pulsevote_token"]`

The user object is saved in:

- `localStorage["pulsevote_user"]`

Axios automatically sends:

`Authorization: Bearer <token>`

for requests when a token exists.

## Important backend contract note

The prompt gives the exact endpoint names and the vote request body, but it does not provide the complete JSON schema for creating a poll or the exact poll response shape.

This frontend currently sends create-poll data as:

```json
{
  "question": "Example question",
  "options": ["Option A", "Option B"]
}
```

If your FastAPI Pydantic schema uses different field names or nested objects, update the one request in `src/pages/CreatePoll.jsx`.

The Poll page accepts common option fields (`id`/`option_id` and `text`/`name`/`value`) so it can work with several straightforward response shapes.

## Backend work still required

These are intentionally not implemented as fake frontend APIs:

1. FastAPI CORS configuration.
2. Safe admin promotion mechanism; public registration should remain `user`.
3. `/me` endpoint for restoring user data from a JWT.
4. Poll-result vote-count endpoint.
5. WebSocket live results.
6. Poll closing time/status.
7. Edit/delete poll endpoints.
8. Admin poll management.
9. Production deployment configuration.

## CORS

The FastAPI backend must allow the Vite frontend origin during development, for example:

`http://localhost:5173`

or whatever origin Vite displays.

Do not add a frontend proxy and assume it solves production CORS; configure FastAPI CORS explicitly.

## Security note

This frontend only stores the JWT in localStorage because that is the authentication requirement provided for this project. For a production system, consider the security trade-offs of browser token storage and use an appropriate authentication architecture.
