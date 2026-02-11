# Operation Planner Backend

Backend API for managing task assignments and resources with conflict validation.

## Features

- ✅ Task and resource management
- ✅ Intelligent resource-to-task assignment
- ✅ Resource availability validation
- ✅ Overlap conflict detection
- ✅ SQLite database persistence
- ✅ REST API with Express.js
- ✅ TypeScript for type safety
- ✅ Comprehensive unit test suite

## Prerequisites

- Node.js 16+
- npm or yarn

## Installation

```bash
npm install
```

## Development

Compile TypeScript:

```bash
npm run build
```

Run in development mode:

```bash
npm start
```

## Testing

Run unit tests:

```bash
npm test
```

## Project Structure

```
src/
├── index.ts                    # Entry point
├── domain/                     # Business logic
│   ├── models/                # Types and interfaces
│   ├── db/                    # Data access
│   ├── http/                  # Routes and DTOs
│   └── __tests__/            # Unit tests
```

## API Endpoints

### Assignments
- `POST /assignments` - Create new assignment
- `GET /assignments` - List all assignments
- `GET /assignments/:id` - Get specific assignment

### Resources
- `GET /resources` - List available resources
- `GET /resources/:id` - Get specific resource

## Validations

The system performs the following validations:

1. **Resource Availability**: Verifies that the resource is available on the task date
2. **Task Overlap**: Detects if the resource already has assignments in that period
3. **Business Rules**: Validates specific assignment rules

## Technologies

- **TypeScript** - Typed programming language
- **Express.js** - Web framework
- **SQLite** - Database
- **Jest** - Testing framework

## License

MIT
