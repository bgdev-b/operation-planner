import { describe, it, expect } from 'vitest';
import { detectUnavailability, detectOverlappingAssignment, detectInvalidTimeRange } from '../Rules.js';
import { Assignment } from '../Assignment.js';

describe('Rules', () => {
    describe('detectInvalidTimeRange', () => {
        it('detects when start time is after end time', () => {
            const assignment: Assignment = {
                taskId: 't1',
                resourceId: 'r1',
                start: new Date('2026-02-03T12:00:00'),
                end: new Date('2026-02-03T10:00:00')
            };

            const conflict = detectInvalidTimeRange(assignment);

            expect(conflict).not.toBeNull();
            expect(conflict?.type).toBe('INVALID_TIME_RANGE');
        });

        it('detects when start time equals end time', () => {
            const assignment: Assignment = {
                taskId: 't1',
                resourceId: 'r1',
                start: new Date('2026-02-03T10:00:00'),
                end: new Date('2026-02-03T10:00:00')
            };

            const conflict = detectInvalidTimeRange(assignment);

            expect(conflict).not.toBeNull();
        });

        it('returns null when time range is valid', () => {
            const assignment: Assignment = {
                taskId: 't1',
                resourceId: 'r1',
                start: new Date('2026-02-03T10:00:00'),
                end: new Date('2026-02-03T12:00:00')
            };

            const conflict = detectInvalidTimeRange(assignment);

            expect(conflict).toBeNull();
        });
    });

    describe('detectUnavailability', () => {
        it('fails when assignment is outside availability', () => {
            const availability = [
                {
                    start: new Date('2026-02-03T08:00:00'),
                    end: new Date('2026-02-03T17:00:00')
                }
            ];

            const assignment: Assignment = {
                taskId: 't1',
                resourceId: 'r1',
                start: new Date('2026-02-03T18:00:00'),
                end: new Date('2026-02-03T19:00:00')
            };

            const conflict = detectUnavailability(availability, assignment);

            expect(conflict).not.toBeNull();
        });
    });

    describe('detectOverlappingAssignment', () => {
        it('detects overlap when assignments intersect', () => {
            const existing: Assignment = {
                taskId: 't1',
                resourceId: 'r1',
                start: new Date('2026-02-03T10:00:00'),
                end: new Date('2026-02-03T12:00:00')
            };

            const incoming: Assignment = {
                taskId: 't2',
                resourceId: 'r1',
                start: new Date('2026-02-03T11:00:00'),
                end: new Date('2026-02-03T13:00:00')
            };

            const conflict = detectOverlappingAssignment(
                [existing],
                incoming
            );

            expect(conflict).not.toBeNull();
        });
    });
});
