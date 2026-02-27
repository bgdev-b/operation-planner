import { describe, it, expect } from 'vitest';
import { validateAssignment } from '../ValidateAssignment.js';
import { Assignment } from '../Assignment.js';

const defaultAvailability = [
    {
        start: new Date('2026-02-03T08:00:00Z'),
        end: new Date('2026-02-03T17:00:00Z')
    }
];

describe('validateAssignment', () => {
    it('returns valid when assignment fits within availability with no conflicts', () => {
        const incoming: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T09:00:00Z'),
            end: new Date('2026-02-03T11:00:00Z')
        };

        const result = validateAssignment(defaultAvailability, [], incoming);

        expect(result.valid).toBe(true);
    });

    it('returns conflict when assignment overlaps an existing one', () => {
        const existing: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T09:00:00Z'),
            end: new Date('2026-02-03T11:00:00Z')
        };

        const incoming: Assignment = {
            taskId: 't2',
            resourceId: 'r1',
            start: new Date('2026-02-03T10:00:00Z'),
            end: new Date('2026-02-03T12:00:00Z')
        };

        const result = validateAssignment(defaultAvailability, [existing], incoming);

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.conflicts).toHaveLength(1);
            expect(result.conflicts[0]!.type).toBe('OVERLAPPING_ASSIGNMENT');
        }
    });

    it('returns conflict when assignment is outside availability', () => {
        const incoming: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T18:00:00Z'),
            end: new Date('2026-02-03T20:00:00Z')
        };

        const result = validateAssignment(defaultAvailability, [], incoming);

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.conflicts[0]!.type).toBe('RESOURCE_UNAVAILABLE');
        }
    });

    it('returns conflict when start is after end', () => {
        const incoming: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T12:00:00Z'),
            end: new Date('2026-02-03T10:00:00Z')
        };

        const result = validateAssignment(defaultAvailability, [], incoming);

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.conflicts[0]!.type).toBe('INVALID_TIME_RANGE');
        }
    });

    it('returns multiple conflicts when overlap and unavailability both fail', () => {
        const existing: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T10:00:00Z'),
            end: new Date('2026-02-03T12:00:00Z')
        };

        const incoming: Assignment = {
            taskId: 't2',
            resourceId: 'r1',
            start: new Date('2026-02-03T11:00:00Z'),
            end: new Date('2026-02-03T18:00:00Z')
        };

        const result = validateAssignment(defaultAvailability, [existing], incoming);

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.conflicts.length).toBe(2);
        }
    });
});