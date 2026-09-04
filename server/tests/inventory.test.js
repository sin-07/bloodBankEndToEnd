const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');

let app, mongoServer, adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());

  const authRoutes = require('../routes/authRoutes');
  const inventoryRoutes = require('../routes/inventoryRoutes');
  app.use('/api/auth', authRoutes);
  app.use('/api/inventory', inventoryRoutes);

  const { errorHandler } = require('../middleware/errorHandler');
  app.use(errorHandler);

  // Create admin user
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '1234567890',
      role: 'donor',
      city: 'Mumbai',
      bloodGroup: 'O+',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      weight: 75,
    });
  await User.findByIdAndUpdate(res.body.data.user._id, { role: 'admin' });
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });
  adminToken = loginRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await BloodInventory.deleteMany({});
});

describe('Inventory Endpoints', () => {
  describe('POST /api/inventory', () => {
    it('should add blood units', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloodGroup: 'A+',
          component: 'whole_blood',
          units: 5,
          source: 'donation',
          storageLocation: 'Fridge A',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.bloodGroup).toBe('A+');
      expect(res.body.data.units).toBe(5);
      expect(res.body.data.expiryDate).toBeDefined();
    });

    it('should calculate expiry for platelets (5 days)', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloodGroup: 'B+',
          component: 'platelets',
          units: 2,
          source: 'donation',
        });

      expect(res.statusCode).toBe(201);
      const expiry = new Date(res.body.data.expiryDate);
      const collection = new Date(res.body.data.collectionDate);
      const diffDays = Math.round(
        (expiry.getTime() - collection.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBe(5);
    });
  });

  describe('GET /api/inventory', () => {
    it('should return inventory', async () => {
      // Add some units first
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloodGroup: 'A+',
          component: 'whole_blood',
          units: 5,
          source: 'donation',
        });

      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by blood group', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bloodGroup: 'A+', component: 'whole_blood', units: 3, source: 'donation' });
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bloodGroup: 'B+', component: 'whole_blood', units: 2, source: 'donation' });

      const res = await request(app)
        .get('/api/inventory?bloodGroup=A+')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every((item) => item.bloodGroup === 'A+')).toBe(true);
    });
  });

  describe('GET /api/inventory/summary', () => {
    it('should return stock summary', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bloodGroup: 'O+', component: 'whole_blood', units: 3, source: 'donation' });

      const res = await request(app)
        .get('/api/inventory/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('bloodStock');
      expect(res.body.data).toHaveProperty('lowStockAlerts');
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should remove blood unit', async () => {
      const addRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bloodGroup: 'AB+', component: 'whole_blood', units: 1, source: 'donation' });

      const id = addRes.body.data._id;
      const res = await request(app)
        .delete(`/api/inventory/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('removed');
    });
  });
});
