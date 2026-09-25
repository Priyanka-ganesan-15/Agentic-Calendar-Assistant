# Agentic Calendar Assistant

An AI-powered personal calendar assistant built as a full-stack project. The application lets an authenticated user connect Google Calendar, ask scheduling questions in natural language, and create, reschedule, or cancel meetings through a conversational agent.

## Project specification

### Problem

Calendar management is repetitive when it requires switching between availability searches, event details, attendee selection, and meeting-link creation. This project explores whether an agent can provide a simpler interface while still keeping calendar actions user-scoped and explicit.

### Goals

- Provide a focused chat interface for common calendar workflows.
- Let the agent retrieve real calendar data instead of generating meeting details from conversation alone.
- Support both read operations and carefully scoped calendar mutations.
- Preserve conversation history and durable meeting preferences for each user.
- Keep authentication, provider credentials, and user data separated across the appropriate services.
- Build a realistic local development setup with a Next.js frontend, Express API, PostgreSQL, and Docker Compose.



## Accomplishments

### Product capabilities

- Implemented Descope sign-up, sign-in, session validation, and sign-out.
- Added a Google Calendar connection flow using a Descope outbound connection.
- Built a streaming chat experience using Server-Sent Events (SSE).
- Added per-user conversation threads and message history.
- Added Mastra working memory for durable preferences such as timezone, default meeting length, and usual invitees.
- Added Google Calendar tools for:
  - Listing upcoming meetings or today's meetings.
  - Checking free/busy information.
  - Creating meetings with optional attendees, descriptions, and Google Meet links.
  - Rescheduling meetings.
  - Cancelling meetings and notifying attendees.
- Added GitHub-flavored Markdown rendering for assistant responses.
- Added PostgreSQL persistence for local users and calendar connection status.
- Added request validation with Zod for chat and thread identifiers.

## Challenges and solutions

### Maintaining trustworthy calendar state

An LLM can produce plausible but incorrect meeting details. The agent is instructed not to invent calendar information, and all event availability and mutation results come from Google Calendar tools. The service also formats provider responses into a smaller, predictable event shape before returning them to the agent.

### Handling credentials without owning token storage

The application needs a Google access token to call Calendar but should not persist provider credentials in its own database. Descope supplies the user-scoped connection and token when a calendar operation is needed; PostgreSQL stores only connection status and local user records.

### Streaming failures after the response begins

Once SSE headers are sent, a traditional HTTP error response is no longer available. The API therefore emits an `error` SSE event and closes the stream. The frontend can display that failure without treating it as a malformed normal response.

### Separating short-term context from durable preferences

Recent messages are useful for the current conversation, while preferences such as a default meeting length should survive across threads. Mastra memory is configured with a recent-message window and resource-scoped working memory to support both needs.

### Keeping agent behavior bounded

The system prompt defines concise response behavior, tool-use expectations, Google Meet defaults, and a prohibition on invented details. Zod schemas validate the HTTP boundary, while the calendar tools define the actions available to the model.

### Technology stack

| Area | Technologies |
|---|---|
| Frontend | Next.js 16 App Router, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Node.js, `tsx` |
| Authentication | Descope Next.js SDK and Node SDK |
| Agent | Mastra, Google Gemini via `@google/genai` |
| Calendar | Google Calendar API via `googleapis` |
| Validation | Zod |
| Persistence | PostgreSQL 16 for app data; LibSQL for Mastra memory |
| Local infrastructure | Docker Compose |


### Setup

Install each application independently because the repository is not configured as an npm workspace:

```sh
cd backend
npm install

cd ../frontend
npm install
```

Start PostgreSQL from the repository root:

```sh
docker compose up -d postgres
```

The Compose database is available at:

```text
postgresql://postgres:postgres@localhost:5442/Agentic_calendar_app_db
```

Create `backend/.env` and `frontend/.env.local`, then run the migration:

```sh
cd backend
npm run migrate
```

Start the API and frontend in separate terminals:

```sh
# backend/
npm run dev

# frontend/
npm run dev
```

Open `http://localhost:3000/sign-in`. The API defaults to `http://localhost:4000`.

### Environment variables

Backend variables:

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `DESCOPE_PROJECT_ID` | Yes | Descope project identifier. |
| `DESCOPE_MANAGEMENT_KEY` | Yes | Server-side Descope credential. |
| `GOOGLE_API_KEY` | Yes for chat | Gemini API key. |
| `PORT` | No | API port, default `4000`. |
| `APP_URL` | No | Frontend origin, default `http://localhost:3000`. |
| `DESCOPE_CALENDAR_CONNECTION_ID` | No | Calendar outbound connection ID, default `google-calendar`. |
| `AI_MODEL` | No | Gemini model, default `gemini-2.5-flash`. |

Frontend variables:

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID` | Yes | Descope project identifier for the browser. |
| `NEXT_PUBLIC_API_URL` | No | Backend URL, default `http://localhost:4000`. |

Never expose `DESCOPE_MANAGEMENT_KEY`, Google credentials, or other server secrets through `NEXT_PUBLIC_*` variables.

## Validation and build commands

```sh
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run lint
npm run build
```

## Current limitations and next steps

- The root route is still the default Next.js starter route; the primary experience currently lives at `/sign-in` and `/dashboard`.
- The project currently supports Google Calendar only.
- Calendar tool schemas validate shape, but the agent still needs stronger server-side validation for temporal rules such as end times after start times and timezone edge cases.
- The local Mastra database depends on the backend process working directory and needs an explicit persistence strategy for deployment.
- Descope and Google Cloud setup remain manual; deployment, observability, rate limiting, and automated end-to-end tests are not included yet.
- The MCP modules exist in the backend but are not mounted by the current API entry point.

Potential next increments are stronger calendar validation, confirmation steps for destructive actions, automated integration tests with mocked provider responses, deployment configuration, and support for additional calendar providers.

## Status

Personal project in active development. The current implementation is a working local prototype focused on agent orchestration, secure provider access, streaming UX, and durable conversational context.
