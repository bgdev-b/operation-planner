# Operation Planner Server

Backend API for resource scheduling, availability analysis, and assignment conflict prevention.

## Core Responsibilities

- Persist resources, availability windows, and assignments in SQLite.
- Validate assignment rules before any write operation.
- Return calculated free slots and utilization analytics for a given period.
- Provide a clean REST interface for the frontend timeline.

## Stack

- Node.js + Express 5
- TypeScript
- Zod for request validation
- better-sqlite3 for persistence
- Vitest + Supertest for tests

## Run Locally

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Scripts

- `npm run dev`: Start API in watch mode with `tsx`.
- `npm run build`: Compile TypeScript to `dist/`.
- `npm start`: Run compiled server.
- `npm test`: Run test suite.

## Environment

- `PORT` (optional): API port. Default is `3000`.

SQLite database file is created as `planner.db` in this folder. In test mode, the app uses an in-memory database.

## API Base Path

All routes are served under `/api`.

## Endpoints

### Resources

- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `GET /api/resources/:id/free-slots?from=<ISO>&to=<ISO>`
- `POST /api/resources/:id/availability`

`POST /api/resources` body:

```json
{
	"id": "r-01",
	"name": "Alex",
	"type": "person"
}
```

Note: on resource creation, a default wide availability window is auto-created if none exists.

### Assignments

- `POST /api/assignments`
- `PATCH /api/assignments/:taskId`
- `DELETE /api/assignments/:taskId`

`POST /api/assignments` body:

```json
{
	"taskId": "TASK-123",
	"resourceId": "r-01",
	"start": "2026-03-07T09:00:00.000Z",
	"end": "2026-03-07T11:00:00.000Z"
}
```

`PATCH /api/assignments/:taskId` body:

```json
{
	"resourceId": "r-01",
	"originalStart": "2026-03-07T09:00:00.000Z",
	"originalEnd": "2026-03-07T11:00:00.000Z",
	"start": "2026-03-07T10:00:00.000Z",
	"end": "2026-03-07T12:00:00.000Z"
}
```

`DELETE /api/assignments/:taskId` body:

```json
{
	"resourceId": "r-01",
	"start": "2026-03-07T10:00:00.000Z",
	"end": "2026-03-07T12:00:00.000Z"
}
```

## Validation Rules

The API rejects invalid operations with meaningful HTTP responses:

- `400`: Invalid payload or malformed date range.
- `404`: Resource or assignment not found.
- `409`: Assignment conflicts (overlap or outside allowed availability).

## Testing

```bash
npm test
```

Tests cover domain rules, route behavior, analytics calculations, and edge cases around time handling.
