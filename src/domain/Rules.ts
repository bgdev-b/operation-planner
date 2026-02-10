import { Assignment } from './Assignment.js';
import { Conflict } from './Conflict.js';
import { TimeRange } from './TimeRange.js';

export function detectInvalidTimeRange(
    assignment: Assignment
): Conflict | null {

    if (assignment.start >= assignment.end) {
        return {
            type: 'INVALID_TIME_RANGE',
            resourceId: assignment.resourceId,
            taskId: assignment.taskId,
            message: 'Start time must be before end time'
        };
    }

    return null;
}

export function detectOverlappingAssignment(
    existingAssignment: TimeRange[],
    newAssignment: Assignment
): Conflict | null {

    const overlaps = existingAssignment.some(a =>
        newAssignment.start < a.end &&
        newAssignment.end > a.start
    );

    if (overlaps) {
        return {
            type: 'OVERLAPPING_ASSIGNMENT',
            resourceId: newAssignment.resourceId,
            taskId: newAssignment.taskId,
            message: 'Resource is already assigned in this time range'
        };
    }

    return null;
}

export function detectUnavailability(
    AvailabilitySlot: TimeRange[],
    newAssignment: Assignment
): Conflict | null {

    const isAvailable = AvailabilitySlot.some(slot =>
        newAssignment.start >= slot.start &&
        newAssignment.end <= slot.end
    );

    if (!isAvailable) {
        return {
            type: 'RESOURCE_UNAVAILABLE',
            resourceId: newAssignment.resourceId,
            taskId: newAssignment.taskId,
            message: 'Assignment is outside resource availability'
        };
    }

    return null;
}   
