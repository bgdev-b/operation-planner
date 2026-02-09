import { Assignment } from "./Assignment.js";
import { Resource } from "./Resource.js";
import { Conflict } from "./Conflict.js";
import { ValidationResult } from "./ValidationResult.js";
import { detectOverlappingAssignment, detectUnavailability } from "./Rules.js";

export function validateAssignment(
    resource: Resource,
    existingAssignments: Assignment[],
    newAssignment: Assignment
): ValidationResult {
    const conflicts: Conflict[] = [];

    const overlapConflict = detectOverlappingAssignment(
        resource,
        existingAssignments,
        newAssignment
    );
    if (overlapConflict) {
        conflicts.push(overlapConflict);
    }

    const unavailabilityConflict = detectUnavailability(
        resource,
        newAssignment
    );
    if (unavailabilityConflict) {
        conflicts.push(unavailabilityConflict)
    }

    if (conflicts.length > 0) {
        return { valid: false, conflicts };
    }

    return { valid: true }
}