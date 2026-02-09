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
    resourceId: string
): Assignment[] {
    const rows = db.prepare<
        [string],
        AssignmentRow
    >(
        `
        SELECT task_id, resource_id, start, end
        FROM assignments
        WHERE resource_id = ?
        `
    ).all(resourceId);

    return rows.map(row => ({
        taskId: row.task_id,
        resourceId: row.resource_id,
        start: new Date(row.start),
        end: new Date(row.end)
    }));
}