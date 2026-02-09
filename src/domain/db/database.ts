import Database from 'better-sqlite3';

export const db: Database.Database = new Database('planner.db');

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    );

    CREATE TABLE IF NOT EXISTS resources_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT NOT NUll,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    FOREIGN KEY(resource_ id)
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


try {
    db.exec(`ALTER TABLE resources ADD COLUMN availability TEXT`);
} catch (e) {
}