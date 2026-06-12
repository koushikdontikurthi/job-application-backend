const request = require('supertest');
const app = require('../app');

describe('POST /auth/signup', () => {
    it('should create a new user and return 201', async () => {
        // test goes here
    });

    it('should return 400 if email is missing', async () => {
        // test goes here
    });

    it('should return 409 if email already exists', async () => {
        // test goes here
    });
});

describe('POST /auth/login', () => {
    it('should return a JWT token on valid credentials', async () => {
        // test goes here
    });

    it('should return 401 on wrong password', async () => {
        // test goes here
    });
});