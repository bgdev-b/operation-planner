import { Assignment } from "./Assignment.js";
import { Conflict } from "./Conflict.js";
import { ValidationResult } from "./ValidationResult.js";
import {
    detectInvalidTimeRange,
    detectOverlappingAssignment,
    detectUnavailability
} from "./Rules.js";
import { TimeRange } from "./TimeRange.js";


export function validateAssignment(
    availabilitySlot: TimeRange[],
    existingAssignment: TimeRange[],
    newAssignment: Assignment
): ValidationResult {

    const conflicts: Conflict[] = [];

    const invalidRange = detectInvalidTimeRange(newAssignment);
    if (invalidRange) conflicts.push(invalidRange);

    const overlapConflict = detectOverlappingAssignment(
        existingAssignment,
        newAssignment
    );
    if (overlapConflict) conflicts.push(overlapConflict);

    const unavailabilityConflict = detectUnavailability(
        availabilitySlot,
        newAssignment
    );
    if (unavailabilityConflict) conflicts.push(unavailabilityConflict);

    return conflicts.length > 0
        ? { valid: false, conflicts }
        : { valid: true };
}