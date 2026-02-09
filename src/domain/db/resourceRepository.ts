import { db } from './database.js'
import { Resource, ResourceType } from "../Resource.js";

type ResourceRow = {
    id: string;
    name: string;
    type: ResourceType
};

type AvailabilityRow = {
    start: string;
    end: string;
};

export function saveResource(resource: Resource) {

    db.prepare<
        [string, string, ResourceType],
        void
    >(
        `INSERT OR REPLACE INTO resources (id, name, type)
        VALUES (?,?,?)
        `
    ).run(resource.id, resource.name, resource.type)

    db.prepare<
        [string], void
    >(
        `DELETE FROM resource_availability
    WHERE resource_id = ?`
    ).run(resource.id);

    const insertAvailability = db.prepare<
        [string, string, string],
        void
    >(
        `INSERT INTO resource_availability
        (resource_id, start, end)
        VALUES (?,?,?)`
    );

    for (const slot of resource.availability) {
        insertAvailability.run(
            resource.id,
            slot.start.toISOString(),
            slot.end.toISOString()
        );
    }
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

    const AvailabilityRows = db.prepare<
        [string],
        AvailabilityRow
    >(
        `SELECT start, end
        FROM resource_availability
        WHERE resource_id = ?
        ORDER by start ASC`
    ).all(id);

    return {
        id: resourceRow.id,
        name: resourceRow.name,
        type: resourceRow.type,
        availability: AvailabilityRows.map(a => ({
            start: new Date(a.start),
            end: new Date(a.end)
        }))
    };
}

export function getAllResources(): Resource[] {

    const rows = db.prepare<
        [],
        ResourceRow
    >(
        `SELECT id, name, type from resources`
    ).all();

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        availability: []
    }));
}
