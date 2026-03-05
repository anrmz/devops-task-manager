// Simple integration tests for the Task Manager API
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('Task API', () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('GET /health should return 200', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
    });

    it('GET /tasks should return an array', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /tasks should create a task', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({ title: 'Test Task' });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Test Task');
    });

    it('POST /tasks should fail without title', async () => {
        const res = await request(app).post('/tasks').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
