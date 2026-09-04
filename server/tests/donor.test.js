const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

const User = require('../models/User');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');

let app, mongoServer, donorToken, adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());

  const authRoutes = require('../routes/authRoutes');
  const donorRoutes = require('../routes/donorRoutes');
  app.use('/api/auth', authRoutes);
  app.use('/api/donors', donorRoutes);

  const { errorHandler } = require('../middleware/errorHandler');
  app.use(errorHandler);

  // Create admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'donor',
      city: 'Mumbai',
      bloodGroup: 'O+',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      weight: 75,
    });
  // Manually set admin role
  await User.findByIdAndUpdate(adminRes.body.data.user._id, { role: 'admin' });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'password123' });
  adminToken = adminLogin.body.data.token;

  // Create donor
  const donorRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Donor',
      email: 'jane@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'donor',
      city: 'Mumbai',
      bloodGroup: 'A+',
      dateOfBirth: '1995-06-15',
      gender: 'female',
      weight: 60,
    });
  donorToken = donorRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Donor Endpoints', () => {
  describe('GET /api/donors/profile', () => {
    it('should return donor profile', async () => {
      const res = await request(app)
        .get('/api/donors/profile')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.bloodGroup).toBe('A+');
    });
  });

  describe('GET /api/donors/eligibility', () => {
    it('should check eligibility', async () => {
      const res = await request(app)
        .get('/api/donors/eligibility')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('isEligible');
    });
  });

  describe('GET /api/donors/donations', () => {
    it('should return empty donation history', async () => {
      const res = await request(app)
        .get('/api/donors/donations')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('PUT /api/donors/profile', () => {
    it('should update donor profile', async () => {
      const res = await request(app)
        .put('/api/donors/profile')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ weight: 65 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.weight).toBe(65);
    });
  });
});
