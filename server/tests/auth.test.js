const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Models
const User = require('../models/User');

// Create a minimal express app for testing
let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup minimal app
  app = express();
  app.use(express.json());

  // Mount auth routes
  const authRoutes = require('../routes/authRoutes');
  app.use('/api/auth', authRoutes);

  // Error handler
  const { errorHandler } = require('../middleware/errorHandler');
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new donor user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'donor',
          city: 'Mumbai',
          bloodGroup: 'A+',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          weight: 70,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('John Doe');
      expect(res.body.data.user.role).toBe('donor');
    });

    it('should register a hospital user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hospital Admin',
          email: 'hospital@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'hospital',
          city: 'Delhi',
          hospitalName: 'City Hospital',
          registrationNumber: 'REG001',
          hospitalType: 'private',
          state: 'Delhi',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe('hospital');
    });

    it('should not register with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'donor',
        city: 'Mumbai',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'donor',
          city: 'Mumbai',
          bloodGroup: 'A+',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          weight: 70,
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'donor',
          city: 'Mumbai',
          bloodGroup: 'A+',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          weight: 70,
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'donor',
          city: 'Mumbai',
          bloodGroup: 'A+',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          weight: 70,
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('John Doe');
    });

    it('should deny access without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
