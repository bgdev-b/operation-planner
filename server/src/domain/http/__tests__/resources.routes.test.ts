import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { db } from '../../db/database.js';
import { saveResource } from '../../db/resourceRepository.js';

describe('Resources routes', () => {
    const app = createApp();

    beforeEach(() => {
        db.exec('DELETE FROM assignments');
        db.exec('DELETE FROM resource_availability');
        db.exec('DELETE FROM resources');
    });

    describe('GET /api/resources', () => {
        it('returns empty array when no resources exist', async () => {
            const response = await request(app).get('/api/resources');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('returns list of resources', async () => {
            saveResource({ id: 'r1', name: 'Alice', type: 'person' });
            saveResource({ id: 'r2', name: 'Bob', type: 'person' });

            const response = await request(app).get('/api/resources');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });
    });

    describe('POST /api/resources', () => {
        it('creates a resource and returns 201', async () => {
            const response = await request(app)
                .post('/api/resources')
                .send({ id: 'r1', name: 'Alice', type: 'person' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Alice');
        });

        it('returns 400 when body is invalid', async () => {
            const response = await request(app)
                .post('/api/resources')
                .send({ name: 'Alice' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/resources/:id', () => {
        it('returns the resource when it exists', async () => {
            saveResource({ id: 'r1', name: 'Alice', type: 'person' });

            const response = await request(app).get('/api/resources/r1');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe('r1');
            expect(response.body.name).toBe('Alice');
        });

        it('returns 404 when resource does not exist', async () => {
            const response = await request(app).get('/api/resources/nonexistent');

            expect(response.status).toBe(404);
        });
    });
});
