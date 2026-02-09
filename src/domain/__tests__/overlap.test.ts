import { describe, it, expect } from 'vitest';
import { Resource } from '../Resource.js';
import { Assignment } from '../Assignment.js';
import { detectOverlappingAssignment } from '../Rules.js';

describe('detectOverlappingAssignment', () => {
    it('detects overlap when assignments intersect', () => {
        const resource: Resource = {
            id: 'r1',
            name: 'Alice',
            type: 'person',
            availability: []
        };

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
            resource,
            [existing],
            incoming
        );

        expect(conflict).not.toBeNull();
    });
});