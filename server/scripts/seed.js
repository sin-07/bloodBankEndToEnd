const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const Hospital = require('../models/Hospital');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bloodbank';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Donor.deleteMany({});
    await BloodInventory.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bloodbank.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      city: 'Mumbai',
      isActive: true,
    });
    console.log('Admin created: admin@bloodbank.com / admin123');

    // Create donor users
    const donorData = [
      { name: 'Rahul Sharma', email: 'rahul@example.com', city: 'Mumbai', bloodGroup: 'A+', gender: 'male', weight: 72 },
      { name: 'Priya Patel', email: 'priya@example.com', city: 'Delhi', bloodGroup: 'B+', gender: 'female', weight: 58 },
      { name: 'Amit Kumar', email: 'amit@example.com', city: 'Bangalore', bloodGroup: 'O+', gender: 'male', weight: 80 },
      { name: 'Sneha Reddy', email: 'sneha@example.com', city: 'Hyderabad', bloodGroup: 'AB+', gender: 'female', weight: 55 },
      { name: 'Vikram Singh', email: 'vikram@example.com', city: 'Pune', bloodGroup: 'O-', gender: 'male', weight: 75 },
    ];

    for (const d of donorData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: 'donor123',
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'donor',
        city: d.city,
        isActive: true,
      });

      await Donor.create({
        userId: user._id,
        bloodGroup: d.bloodGroup,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: d.gender,
        weight: d.weight,
        totalDonations: Math.floor(Math.random() * 10),
        isEligible: true,
      });
    }
    console.log('Donors created (password: donor123)');

    // Create hospital users
    const hospitalData = [
      { name: 'City Hospital', email: 'city@hospital.com', city: 'Mumbai', state: 'Maharashtra', type: 'private' },
      { name: 'General Hospital', email: 'general@hospital.com', city: 'Delhi', state: 'Delhi', type: 'government' },
    ];

    for (const h of hospitalData) {
      const user = await User.create({
        name: `${h.name} Admin`,
        email: h.email,
        password: 'hospital123',
        phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'hospital',
        city: h.city,
        isActive: true,
      });

      await Hospital.create({
        userId: user._id,
        hospitalName: h.name,
        registrationNumber: `REG${Math.floor(1000 + Math.random() * 9000)}`,
        type: h.type,
        city: h.city,
        state: h.state,
        address: `123 Main Street, ${h.city}`,
        contactPerson: { name: `${h.name} Admin`, phone: user.phone, email: h.email },
        isVerified: true,
      });
    }
    console.log('Hospitals created (password: hospital123)');

    // Create blood inventory
    const components = ['whole_blood', 'packed_rbc', 'platelets', 'plasma'];
    for (const bg of bloodGroups) {
      for (let i = 0; i < 2; i++) {
        const component = components[Math.floor(Math.random() * components.length)];
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - Math.floor(Math.random() * 20));

        const expiryDays = component === 'platelets' ? 5 : component === 'plasma' ? 365 : 42;
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        await BloodInventory.create({
          bloodGroup: bg,
          component,
          units: Math.floor(Math.random() * 10) + 1,
          collectionDate,
          expiryDate,
          source: 'donation',
          status: 'available',
          storageLocation: `Fridge ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
          addedBy: admin._id,
        });
      }
    }
    console.log('Blood inventory created');

    console.log('\n--- Seed Complete ---');
    console.log('Admin:    admin@bloodbank.com / admin123');
    console.log('Donor:    rahul@example.com / donor123');
    console.log('Hospital: city@hospital.com / hospital123');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
