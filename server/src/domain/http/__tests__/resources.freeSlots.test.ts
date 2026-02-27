import { it, describe, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

vi.mock('../../db/resourceRepository.js', () => ({
    getResourceById: vi.fn(() => ({
        id: 'r1',
        name: 'Mock Resource',
        type: 'person'
    }))
}));

vi.mock('../../db/availabilityRepository.js', () => ({
    getAvailabilityByResource: vi.fn(() => [
        {
            start: new Date('2026-02-03T08:00:00Z'),
            end: new Date('2026-02-03T17:00:00Z')
        }
    ])
}));

vi.mock('../../db/assignmentRepository.js', () => ({
    getAssignmentForResource: vi.fn(() => [
        {
            start: new Date('2026-02-03T10:00:00Z'),
            end: new Date('2026-02-03T12:00:00Z')
        }
    ])
}));

describe('GET /api/resources/:id/free-slots', () => {
    const app = createApp();

    it('returns correct free slot using mocks', async () => {
        const response = await request(app)
            .get('/api/resources/r1/free-slots')
            .query({
                from: '2026-02-03T00:00:00Z',
                to: '2026-02-04T00:00:00Z'
            });
        expect(response.status).toBe(200);
        expect(response.body.freeSlot.length).toBe(2);
    });
});