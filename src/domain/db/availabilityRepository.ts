import { db } from "./database.js";
import { AvailabilitySlot } from "../AvailabilitySlot.js";

type AvailabilityRow = {
    id: number;
    start: string;
    end: string;
}

export function createAvailabilitySlot(
    resourceId: string,
    start: Date,
    end: Date
): AvailabilitySlot {

    const result = db.prepare(
        `INSERT INTO resource_availability
        (resource_id, start, end)
        VALUES (?,?,?)
        `
    ).run(
        resourceId,
        start.toISOString(),
        end.toISOString(),
    );

    return {
        id: Number(result.lastInsertRowid),
        resourceId,
        start,
        end
    };
}

export function updateAvailabilitySlot(
    id: number,
    start: Date,
    end: Date
): void {

    db.prepare(
        `UPDATE resource_availability
        SET start = ?, end = ?
        WHERE id = ?`
    ).run(
        start.toISOString(),
        end.toISOString(),
        id
    );
}

export function deleteAvailabilitySlot(
    id: number
): void {
    db.prepare(
        `DELETE FROM resource_availability
        WHERE id = ?`
    ).run(id);
}

export function getAvailabilityByResource(
    resourceId: string
): AvailabilitySlot[] {

    const rows = db.prepare<
        [string],
        AvailabilityRow
    >(
        `
        SELECT id, start, end
        FROM resource_availability
        WHERE resource_id = ?
        ORDER BY start ASC`
    ).all(resourceId);

    return rows.map(row => ({
        id: row.id,
        resourceId,
        start: new Date(row.start),
        end: new Date(row.end)
    }));
}