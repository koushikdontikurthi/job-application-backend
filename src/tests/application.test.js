const request = require('supertest');
const app = require('../app');
const { pool } = require('../db/query');

let token;
let jobId;

beforeAll(async () => {
    const email = `apptest_${Date.now()}@example.com`;
    await request(app).post('/auth/signup').send({ email, password: 'secret123' });
    const loginRes = await request(app).post('/auth/login').send({ email, password: 'secret123' });
    token = loginRes.body.token;

    const jobRes = await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Job', company: 'Test Co' });
    jobId = jobRes.body.job.id;
});

describe('POST /applications', () => {
    it('should create a new application and return 201', async () => {
        const res = await request(app)
            .post('/applications')
            .set('Authorization', `Bearer ${token}`)
            .send({ jobId });

        expect(res.statusCode).toBe(201);
        expect(res.body.application.job_id).toBe(jobId);
    });

    it('should return 401 without token', async () => {
        const res = await request(app)
            .post('/applications')
            .send({ jobId });

        expect(res.statusCode).toBe(401);
    });

    it('should return 400 if jobId is missing', async () => {
        const res = await request(app)
            .post('/applications')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 200 if applying to same job twice', async () => {
        const res = await request(app)
            .post('/applications')
            .set('Authorization', `Bearer ${token}`)
            .send({ jobId });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Application already exists');
    });
});

afterAll(async () => {
    await pool.end();
});
