import { Assignment } from './Assignment.js';
import { Conflict } from './Conflict.js';
import { Resource } from './Resource.js';

export function detectOverlappingAssignment(
    resource: Resource,
    existingAssignments: Assignment[],
    newAssignment: Assignment
): Conflict | null {
    const overlaps = existingAssignments.some(a =>
        a.resourceId === resource.id &&
        newAssignment.start < a.end &&
        newAssignment.end > a.start
    );

    if (overlaps) {
        return {
            type: 'OVERLAPPING_ASSIGNMENT',
            resourceId: resource.id,
            taskId: newAssignment.taskId,
            message: 'Resource is already assigned in this time range'
        };
    }

    return null;
};

export function detectUnavailability(
    resource: Resource,
    newAssignment: Assignment
): Conflict | null {
    const isAvailable = resource.availability.some(
        range => newAssignment.start >= range.start &&
            newAssignment.end <= range.end
    );

    if (!isAvailable) {
        return {
            type: 'RESOURCE_UNAVAILABLE',
            resourceId: resource.id,
            taskId: newAssignment.taskId,
            message: 'Resource is out of range'
        };
    }

    return null;
};

