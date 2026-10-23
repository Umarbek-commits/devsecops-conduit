# ![RealWorld Example App](logo.png)

> Full-stack [RealWorld](https://github.com/gothinkster/realworld) implementation powered by the React Router v7 framework, TypeScript, Tailwind CSS v4, and the official RealWorld API schema.

### Demo (coming soon) &nbsp;&nbsp;&nbsp;&nbsp; [Spec](https://github.com/gothinkster/realworld)

This project showcases a production-style CRUD application with authentication, feed management, markdown authoring, and responsive UI patterns. It follows idiomatic **React Router data APIs** (loaders/actions), keeps networking type-safe through OpenAPI-generated clients, and leans on SSR-first rendering for great SEO and performance.

For more background on the RealWorld initiative or to pair this frontend with other backends, visit the main [RealWorld](https://github.com/gothinkster/realworld) repository.

# How it works

This application uses modern web technologies and leverages React Router’s server + client data APIs for streaming SSR, nested routing, and optimistic UI patterns.

## Architecture Overview

### Core Technologies

- **React Router v7** – Framework mode with loader/action data APIs, SSR, and flat-routes
- **TypeScript** – End-to-end type safety (components, loaders, API wrappers)
- **Tailwind CSS v4** – Utility-first styling via the new `@tailwindcss/vite` plugin
- **OpenAPI tooling** – `openapi-typescript` + `openapi-fetch` for strongly typed API calls

### Key Architectural Patterns

#### 1. **SSR by Default**
- All routes stream HTML from the server before hydrating on the client.
- Subsequent navigation reuses loaders/actions for granular fetching.

#### 2. **Type-Safe API Layer**
- OpenAPI schema (`openapi/schema.yml`) generates `app/consts/schema.d.ts`.
- `openapi-fetch` + custom middleware ensure consistent headers and error handling.

#### 3. **Flexible Data Loading**
- Each route module exports loaders/actions for data mutations and fetching.
- Shared logic extracted into `app/hooks` and `app/libs` helpers.

#### 4. **Authentication Flow**
- JWT stored via secure HTTP-only cookie (`app/session.server.ts`).
- Loaders/actions gate access by checking `SESSION_SECRET`-backed sessions.
- Client API calls reuse the issued token through a fetch middleware.

#### 5. **Styling and Components**
- Tailwind v4 is configured once in `app/app.css`.
- Shared UI primitives live under `app/components` (buttons, navigation, avatars, etc.).

### Project Structure

```
app/
├── app.css                  # Tailwind v4 entry point
├── components/              # Presentational + reusable UI pieces
├── consts/                  # Global constants + generated API schema
├── hooks/                   # Custom hooks (session, fetcher, user state)
├── libs/
│   ├── actions/             # Shared loaders/actions helpers
│   ├── api/                 # Typed OpenAPI client + middleware
│   └── schemas/             # zod schemas for forms
├── routes/                  # File-system routes (fs-routes powered)
│   ├── _home.*              # Feed + tabbed home routes
│   ├── article.$slug.tsx    # Article detail
│   ├── editor.($slug.)      # Article craete/edit page
│   ├── login.tsx            # Login page
│   ├── register.tsx         # register page
│   ├── settings/            # Change User profile
│   ├── editor.($slug)/      # Create/update editor
│   ├── profile.$username.*  # Profile feeds
│   └── api.*                # Server-only API proxy routes
├── routes.ts                # `flatRoutes()` entry
├── root.tsx                 # Root layout, error boundary, document head
├── session.server.ts        # Cookie/session helpers
└── store/                   # Zustand-like user store for cross-route sharing
```

### Features

- ✅ **Authentication** - Register, login, logout with JWT
- ✅ **Articles** - Create, read, update, delete articles
- ✅ **Comments** - Add and delete comments to articles
- ✅ **Favorites** - Favorite/unfavorite articles
- ✅ **Follow** - Follow/unfollow users
- ✅ **Profiles** - View user profile pages
- ✅ **Editor** - Create/Edit markdown articles
- ✅ **Pagination** - Paginated article feeds
- ✅ **Tags** - Filter articles by tag
- ✅ **Feeds** - Your feed / Global feed

# Getting Started

## Prerequisites

- Node.js 22 (the Dockerfile targets Node 22)
- npm 9+ (lockfile committed as `package-lock.json`; pnpm/yarn will work but are not configured in CI)

## Installation

```sh
npm ci
```

## Environment Variables

Create a local `.env` file in the frontend project directory using `.env.example` as a template. Generate a separate local key with `openssl rand -hex 32`, then put its output in `SESSION_SECRET` in that ignored `.env` file. Do not use a production key for local development.

```env
SESSION_SECRET=
REACT_PUBLIC_API_ENDPOINT=http://127.0.0.1:8000/api
```

- `SESSION_SECRET` signs the HTTP-only session cookie. It must be non-empty; the server refuses to start if it is missing or blank.
- `REACT_PUBLIC_API_ENDPOINT` configures the OpenAPI client (`app/libs/api`). It may be the backend origin or an origin ending in `/api`; the client adds `/api` when needed and avoids duplicating it.

Replace the blank `SESSION_SECRET` only in your ignored local `.env` with the output of `openssl rand -hex 32`. The blank value in `.env.example` is intentional and is not a usable key.

Restart the dev server whenever these values change.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the React Router dev server with hot reloading (port logged in terminal, defaults to 5173). |
| `npm run build` | Create optimized client + server bundles in `./build`. |
| `npm run start` | Serve the production build via `react-router-serve` (defaults to port 3000, respects `PORT`). |
| `npm run typecheck` | Generate loader/action types (`react-router typegen`) and run `tsc --noEmit`. |
| `npm run openapi` | Regenerate `app/consts/schema.d.ts` from `openapi/schema.yml`. Run this after editing the schema. |
| `npm run test:session` | Verify missing session keys are rejected and reproduce the empty-key signing failure. |

## Development

```sh
npm run dev
```

Open the logged local URL (usually http://localhost:5173). API requests go directly to `REACT_PUBLIC_API_ENDPOINT`, so ensure CORS is properly configured if you switch to a self-hosted backend.

## Build & Preview

```sh
npm run build
npm run start
```

`npm run start` consumes the generated `build/server/index.js` output. Set `PORT` if you need something other than 3000.

## Docker

```
docker build -t realworld-remix .
docker run --rm -p 3000:3000 --env-file .env \
  -e REACT_PUBLIC_API_ENDPOINT=https://api.realworld.show/api \
  realworld-remix
```

The multi-stage Dockerfile installs dependencies and builds with Node 22. It uses a local API URL only while prerendering static auth pages; configure `REACT_PUBLIC_API_ENDPOINT` for the running container as shown above. Provide secrets at runtime (do not bake them into the image).

# Tech Stack

- **Framework**: React Router v7 (framework mode)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + custom CSS tokens
- **Networking**: `openapi-fetch` and Zod validation helpers
- **State Management**: Route loaders/actions and lightweight stores in `app/store`
- **Authentication**: JWT via secure cookies + API middleware token forwarding

# Troubleshooting

- Missing types after modifying routes? Run `npm run typecheck` to refresh `react-router` typegen output.
- API requests failing locally? Double-check `REACT_PUBLIC_API_ENDPOINT` and ensure CORS allows your dev origin.
- `Zero-length key is not supported` or a session configuration error? Generate a new local key with `openssl rand -hex 32`, set it in the ignored `frontend/.env`, and restart the server. The server does not substitute a default key. The session cookie is Secure in production and usable over local HTTP in development.

# License

MIT
