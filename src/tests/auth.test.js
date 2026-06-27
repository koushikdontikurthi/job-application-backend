const request = require('supertest');
const app = require('../app');
const { pool } = require('../db/query');
const TestEmail = `testuser_${Date.now()}@example.com`;

describe('POST /auth/signup', () => {
    it('should create a new user and return 201', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({ email: TestEmail, password: 'secrect123' });

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe(TestEmail);
    });

    it('should return 400 if email is missing', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({ password: 'secrect123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if email already exists', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({ email: TestEmail, password: 'secrect123' });

        expect(res.statusCode).toBe(409);
        expect(res.body.code).toBe('CONFLICT');
    });
});

describe('POST /auth/login', () => {
    it('should return a JWT token on valid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: TestEmail, password: 'secrect123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should return 401 on wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: TestEmail, password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
});


afterAll(async () => {
    await pool.end();
});