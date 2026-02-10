import type { Database } from 'better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3';

const DatabaseConstructor = BetterSqlite3.default;
export const db: Database = new DatabaseConstructor('planner.db');

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    FOREIGN KEY(resource_id)
    REFERENCES resources(id)
    ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
    task_id TEXT,
    resource_id TEXT,
    start TEXT,
    end TEXT,
    FOREIGN KEY(resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
    );
    `);

