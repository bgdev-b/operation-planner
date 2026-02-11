import { db } from './database.js'
import { Resource, ResourceType } from "../Resource.js";

type ResourceRow = {
    id: string;
    name: string;
    type: ResourceType
};

export function saveResource(resource: Resource) {

    db.prepare(
        `
        INSERT OR REPLACE INTO resources (id, name, type)
        VALUES(?,?,?)
        `
    ).run(resource.id, resource.name, resource.type);
}

export function getResourceById(id: string): Resource | null {

    const resourceRow = db.prepare<
        [string],
        ResourceRow
    >(
        `SELECT id, name, type
        FROM resources
        WHERE id = ?`
    ).get(id);

    if (!resourceRow) return null;

    return {
        id: resourceRow.id,
        name: resourceRow.name,
        type: resourceRow.type
    };
}

export function getAllResources(): Resource[] {

    const rows = db.prepare<
        [],
        ResourceRow
    >(
        `SELECT id, name, type FROM resources`
    ).all();

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type
    }));
}
