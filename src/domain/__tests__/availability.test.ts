import { describe, it, expect } from 'vitest';
import { detectUnavailability } from '../Rules.js';
import { Resource } from '../Resource.js';
import { Assignment } from '../Assignment.js';

describe('detectUnavailability', () => {
    it('fails when assignment is outside availability', () => {
        const resource: Resource = {
            id: 'r1',
            name: 'Alice',
            type: 'person',
            availability: [
                {
                    start: new Date('2026-02-03T08:00:00'),
                    end: new Date('2026-02-03T17:00:00')
                }
            ]
        };

        const assignment: Assignment = {
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T18:00:00'),
            end: new Date('2026-02-03T19:00:00')
        };

        const conflict = detectUnavailability(resource, assignment);

        expect(conflict).not.toBeNull();
    });
});