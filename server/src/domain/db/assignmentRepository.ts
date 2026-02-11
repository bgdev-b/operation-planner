import { db } from "./database.js";
import { Assignment } from "../Assignment.js";

type AssignmentRow = {
    task_id: string;
    resource_id: string;
    start: string;
    end: string;
};

export function saveAssignment(assignment: Assignment): void {
    db.prepare<
        [string, string, string, string],
        void
    >(
        `
        INSERT INTO assignments (task_id, resource_id, start, end)
        VALUES (?,?,?,?)
        `
    ).run(
        assignment.taskId,
        assignment.resourceId,
        assignment.start.toISOString(),
        assignment.end.toISOString()
    );
}

export function getAssignmentForResource(
    resourceId: string,
    from?: Date,
    to?: Date
): Assignment[] {
    if (from && to) {
        const rows = db.prepare<
            [string, string, string],
            AssignmentRow
        >(
            `
            SELECT task_id, resource_id, start, end
            FROM assignments
            WHERE resource_id = ?
            AND end > ?
            AND start < ?
            ORDER BY start ASC
            `
        ).all(
            resourceId,
            from.toISOString(),
            to.toISOString()
        );

        return rows.map(row => ({
            taskId: row.task_id,
            resourceId: row.resource_id,
            start: new Date(row.start),
            end: new Date(row.end)
        }));
    }

    // If no date range specified, return all assignments for the resource
    const rows = db.prepare<
        [string],
        AssignmentRow
    >(
        `
        SELECT task_id, resource_id, start, end
        FROM assignments
        WHERE resource_id = ?
        ORDER BY start ASC
        `
    ).all(resourceId);

    return rows.map(row => ({
        taskId: row.task_id,
        resourceId: row.resource_id,
        start: new Date(row.start),
        end: new Date(row.end)
    }));
}