# Operation Planner Client

Frontend application for interactive scheduling and assignment management.

## Highlights

- Timeline-driven planning UI.
- Drag, resize, and create assignments directly in the Gantt view.
- Right-click assignment deletion.
- Date-range selection with `react-day-picker` presets.
- Availability analytics and free-slot insights.
- Responsive black-and-green visual identity.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- react-day-picker
- @use-gesture/react

## Run Locally

```bash
npm install
npm run dev
```

Frontend is served on `http://localhost:5173`.

## Backend Connectivity

Vite proxy is configured so calls to `/api` are forwarded to `http://localhost:3000`.

Make sure the backend is running before testing timeline actions.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Type-check and build production assets.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint.

## Project Structure

```text
src/
|- api/          HTTP client helpers
|- components/   UI components (timeline, analytics, picker, lists)
|- hooks/        Interaction logic (drag/create/delete, zoom)
|- pages/        Route-level pages
|- styles/       CSS files
|- types/        Shared frontend models
`- utils/        Time and scale helpers
```

## Portfolio Notes

This frontend was designed to showcase product-level behavior:

- Smooth interaction loops (create, move, resize, delete).
- Consistent optimistic-feeling UI with server-backed validation.
- Clear separation of concerns using reusable hooks.
