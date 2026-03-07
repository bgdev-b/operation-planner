# Operation Planner

Operation Planner is a full-stack scheduling application focused on one hard problem: assigning work without conflicts.

The app combines a timeline-first UI with strict backend validation, so every move, resize, create, or delete action is both interactive and reliable.

## Why This Project Stands Out

- Interactive Gantt timeline with drag, resize, pinch-zoom, and live "now" marker.
- Conflict-aware assignment engine with overlap and availability validation.
- Right-click delete and drag-to-create workflows for fast planning.
- Real analytics and free-slot calculation for operational visibility.
- Monorepo structure with clean TypeScript code on both client and server.

## Demo Flow

1. Open a resource.
2. Select a date range and time window.
3. Drag on the timeline to create a task.
4. Move or resize assignments.
5. Right-click an assignment to delete.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router, react-day-picker, @use-gesture/react
- Backend: Node.js, Express 5, TypeScript, Zod, better-sqlite3
- Testing: Vitest, Supertest
- Data: SQLite (`planner.db`)

## Repository Structure

```text
.
|- client/   React app (UI, timeline interactions, analytics)
|- server/   Express API (validation, persistence, scheduling logic)
`- README.md
```

## Quick Start

### 1. Start the API

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3000` by default.

### 2. Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173` and proxies `/api` to the backend.

## Build and Test

### Frontend

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm run build
npm test
```

## API Snapshot

- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `GET /api/resources/:id/free-slots?from=...&to=...`
- `POST /api/resources/:id/availability`
- `POST /api/assignments`
- `PATCH /api/assignments/:taskId`
- `DELETE /api/assignments/:taskId`

For full details, see `server/README.md`.

## Notes for Recruiters

This project demonstrates practical product thinking, not just CRUD:

- A UX designed for speed in real scheduling scenarios.
- Domain rules enforced server-side to prevent invalid state.
- Incremental refactor into reusable hooks and clear module boundaries.
- End-to-end behavior from interaction to persistence.
