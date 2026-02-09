import request from 'supertest';
import { expect, describe, it, beforeEach } from 'vitest';
import { createApp } from '../http/app.js';
import { db } from '../db/database.js';
import { saveResource } from '../db/resourceRepository.js';
import { saveAssignment } from '../db/assignmentRepository.js';

describe('POST /api/assign', () => {
    const app = createApp();

    beforeEach(() => {
        db.exec('DELETE FROM assignments');
        db.exec('DELETE FROM resources');

        saveResource({
            id: 'r1',
            name: 'Alice',
            type: 'person',
            availability: [
                {
                    start: new Date('2026-01-01T00:00:00Z'),
                    end: new Date('2027-12-31T23:59:59Z')
                }
            ]
        });
    });

    it('create a valid assignment', async () => {
        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't1',
                resourceId: 'r1',
                start: '2026-02-03T10:00:00Z',
                end: '2026-02-03T12:00:00Z'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });

    it('reject assignment with overlapping time slot', async () => {
        // Create existing assignment
        saveAssignment({
            taskId: 't1',
            resourceId: 'r1',
            start: new Date('2026-02-03T10:00:00Z'),
            end: new Date('2026-02-03T12:00:00Z')
        });

        // Try to create overlapping assignment
        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't2',
                resourceId: 'r1',
                start: '2026-02-03T11:00:00Z',
                end: '2026-02-03T13:00:00Z'
            });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.conflicts).toHaveLength(1);
        expect(response.body.conflicts[0].type).toBe('OVERLAPPING_ASSIGNMENT');
    });

    it('reject assignment outside resource availability', async () => {
        // Update resource with availability window
        db.exec('DELETE FROM resources');
        saveResource({
            id: 'r2',
            name: 'Bob',
            type: 'person',
            availability: [
                {
                    start: new Date('2026-02-03T08:00:00Z'),
                    end: new Date('2026-02-03T17:00:00Z')
                }
            ]
        });


        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't1',
                resourceId: 'r2',
                start: '2026-02-03T18:00:00Z',
                end: '2026-02-03T19:00:00Z'
            });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.conflicts).toHaveLength(1);
        expect(response.body.conflicts[0].type).toBe('RESOURCE_UNAVAILABLE');
    });

    it('reject assignment with multiple conflicts', async () => {

        db.exec('DELETE FROM resources');
        saveResource({
            id: 'r3',
            name: 'Charlie',
            type: 'person',
            availability: [
                {
                    start: new Date('2026-02-03T08:00:00Z'),
                    end: new Date('2026-02-03T17:00:00Z')
                }
            ]
        });

        saveAssignment({
            taskId: 't1',
            resourceId: 'r3',
            start: new Date('2026-02-03T10:00:00Z'),
            end: new Date('2026-02-03T12:00:00Z')
        });

        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't2',
                resourceId: 'r3',
                start: '2026-02-03T11:00:00Z',
                end: '2026-02-03T18:00:00Z'
            });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.conflicts.length).toBeGreaterThanOrEqual(2);
    });

    it('return 404 when resource does not exist', async () => {
        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't1',
                resourceId: 'non-existent',
                start: '2026-02-03T10:00:00Z',
                end: '2026-02-03T12:00:00Z'
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Resource not found');
    });

    it('return 400 for invalid input data', async () => {
        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't1',
                resourceId: 'r1',
                start: 'invalid-date',
                end: '2026-02-03T12:00:00Z'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input');
    });

    it('return 400 for missing required fields', async () => {
        const response = await request(app)
            .post('/api/assign')
            .send({
                taskId: 't1',
                resourceId: 'r1'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input');
    });
});


