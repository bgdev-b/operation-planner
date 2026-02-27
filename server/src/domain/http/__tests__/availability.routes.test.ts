import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { db } from '../../db/database.js';
import { saveResource } from '../../db/resourceRepository.js';

describe('POST /api/resources/:id/availability', () => {
    const app = createApp();

    beforeEach(() => {
        db.exec('DELETE FROM resource_availability');
        db.exec('DELETE FROM resources');

        saveResource({ id: 'r1', name: 'Alice', type: 'person' });
    });

    it('creates a valid availability slot', async () => {
        const response = await request(app)
            .post('/api/resources/r1/availability')
            .send({
                start: '2026-02-03T08:00:00Z',
                end: '2026-02-03T17:00:00Z'
            });

        expect(response.status).toBe(201);
    });

    it('returns 400 when body is invalid', async () => {
        const response = await request(app)
            .post('/api/resources/r1/availability')
            .send({ start: 'not-a-date' });

        expect(response.status).toBe(400);
    });

    it('returns 404 when resource does not exist', async () => {
        const response = await request(app)
            .post('/api/resources/nonexistent/availability')
            .send({
                start: '2026-02-03T08:00:00Z',
                end: '2026-02-03T17:00:00Z'
            });

        expect(response.status).toBe(404);
    });

    it('returns 400 when start is after end', async () => {
        const response = await request(app)
            .post('/api/resources/r1/availability')
            .send({
                start: '2026-02-03T17:00:00Z',
                end: '2026-02-03T08:00:00Z'
            });

        expect(response.status).toBe(400);
    });

    it('returns 409 when slot overlaps an existing one', async () => {
        await request(app)
            .post('/api/resources/r1/availability')
            .send({
                start: '2026-02-03T08:00:00Z',
                end: '2026-02-03T17:00:00Z'
            });

        const response = await request(app)
            .post('/api/resources/r1/availability')
            .send({
                start: '2026-02-03T12:00:00Z',
                end: '2026-02-03T20:00:00Z'
            });

        expect(response.status).toBe(409);
    });
});
