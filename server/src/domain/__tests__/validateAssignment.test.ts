import { describe, it, expect } from 'vitest';
import { validateAssignment } from '../ValidateAssignment.js';
import { Assignment } from '../Assignment.js';

describe('validateAssignment', () => {
    it('returns multiple conflicts when rules fail', () => {
        const availability = [
            {
                start: new Date('2026-02-03T08:00:00'),
                end: new Date('2026-02-03T17:00:00')
            }
        ];

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
            end: new Date('2026-02-03T18:00:00')
        };

        const result = validateAssignment(
            availability,
            [existing],
            incoming
        );

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.conflicts.length).toBe(2);
        }
    });
});