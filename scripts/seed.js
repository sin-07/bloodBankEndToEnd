/**
 * Standalone Database Seeder Script
 * Usage: node --env-file=.env.local scripts/seed.js
 */
import connectDB from '../lib/db.js';
import User from '../lib/models/User.js';
import Donor from '../lib/models/Donor.js';
import Hospital from '../lib/models/Hospital.js';
import BloodInventory from '../lib/models/BloodInventory.js';
import Donation from '../lib/models/Donation.js';
import BloodRequest from '../lib/models/BloodRequest.js';

async function runSeed() {
  console.log('--- Srishti Blood Bank Database Seeder ---');
  try {
    await connectDB();

    console.log('Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      Donor.deleteMany({}),
      Hospital.deleteMany({}),
      BloodInventory.deleteMany({}),
      Donation.deleteMany({}),
      BloodRequest.deleteMany({}),
    ]);

    console.log('Creating Admin Account...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@bloodbank.com',
      password: 'admin123',
      phone: '+91 98200 12345',
      role: 'admin',
      city: 'Mumbai',
      address: 'Central Blood Bank HQ, Marine Drive',
      isActive: true,
    });

    console.log('Creating Hospital Accounts...');
    const hospitalUsersData = [
      {
        name: 'Apollo Hospital Admin',
        email: 'city@hospital.com',
        password: 'hospital123',
        phone: '+91 98201 55555',
        role: 'hospital',
        city: 'Mumbai',
        address: 'Sector 23, CBD Belapur, Mumbai',
        hospitalName: 'Apollo Multi-Specialty Hospital',
        registrationNumber: 'HOSP-MUM-2023-01',
        type: 'private',
        state: 'Maharashtra',
      },
      {
        name: 'Fortis Health Admin',
        email: 'fortis@hospital.com',
        password: 'hospital123',
        phone: '+91 98202 66666',
        role: 'hospital',
        city: 'Delhi',
        address: 'B-22 Vasant Kunj, New Delhi',
        hospitalName: 'Fortis Memorial Research Institute',
        registrationNumber: 'HOSP-DEL-2022-88',
        type: 'private',
        state: 'Delhi',
      },
      {
        name: 'Lilavati Care Admin',
        email: 'lilavati@hospital.com',
        password: 'hospital123',
        phone: '+91 98203 77777',
        role: 'hospital',
        city: 'Mumbai',
        address: 'Bandra West, Mumbai',
        hospitalName: 'Lilavati Hospital & Research Centre',
        registrationNumber: 'HOSP-MUM-2021-42',
        type: 'charitable',
        state: 'Maharashtra',
      },
    ];

    const hospitals = [];
    for (const h of hospitalUsersData) {
      const user = await User.create({
        name: h.name,
        email: h.email,
        password: h.password,
        phone: h.phone,
        role: 'hospital',
        city: h.city,
        address: h.address,
        isActive: true,
      });

      const hospitalDoc = await Hospital.create({
        userId: user._id,
        hospitalName: h.hospitalName,
        registrationNumber: h.registrationNumber,
        type: h.type,
        city: h.city,
        state: h.state,
        address: h.address,
        contactPerson: {
          name: h.name,
          phone: h.phone,
          email: h.email,
          designation: 'Blood Bank Liaison Officer',
        },
        totalRequests: 4,
        isVerified: true,
      });
      hospitals.push({ user, doc: hospitalDoc });
    }

    console.log('Creating Donor Accounts...');
    const donorsData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'donor123',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        address: '14 Elm Court, Andheri West',
        bloodGroup: 'A+',
        gender: 'male',
        dob: '1992-05-15',
        weight: 74,
        totalDonations: 4,
        lastDonationDaysAgo: 120,
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'donor123',
        phone: '+91 98765 43211',
        city: 'Mumbai',
        address: '88 Heritage Apts, Bandra',
        bloodGroup: 'O+',
        gender: 'female',
        dob: '1995-10-22',
        weight: 60,
        totalDonations: 3,
        lastDonationDaysAgo: 45,
      },
      {
        name: 'Amit Verma',
        email: 'amit@example.com',
        password: 'donor123',
        phone: '+91 98765 43212',
        city: 'Delhi',
        address: 'Flat 402, Rohini Sector 11',
        bloodGroup: 'B+',
        gender: 'male',
        dob: '1989-02-18',
        weight: 78,
        totalDonations: 6,
        lastDonationDaysAgo: 100,
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya@example.com',
        password: 'donor123',
        phone: '+91 98765 43213',
        city: 'Mumbai',
        address: '502 Sunrise Towers, Powai',
        bloodGroup: 'AB-',
        gender: 'female',
        dob: '1998-08-30',
        weight: 55,
        totalDonations: 1,
        lastDonationDaysAgo: 110,
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram@example.com',
        password: 'donor123',
        phone: '+91 98765 43214',
        city: 'Delhi',
        address: '12 Golf Links, New Delhi',
        bloodGroup: 'O-',
        gender: 'male',
        dob: '1990-12-05',
        weight: 82,
        totalDonations: 8,
        lastDonationDaysAgo: 95,
      },
    ];

    const donors = [];
    for (const d of donorsData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: d.password,
        phone: d.phone,
        role: 'donor',
        city: d.city,
        address: d.address,
        isActive: true,
      });

      const lastDonationDate = new Date();
      lastDonationDate.setDate(lastDonationDate.getDate() - d.lastDonationDaysAgo);

      const donorDoc = await Donor.create({
        userId: user._id,
        bloodGroup: d.bloodGroup,
        dateOfBirth: new Date(d.dob),
        gender: d.gender,
        weight: d.weight,
        totalDonations: d.totalDonations,
        lastDonationDate,
        isEligible: d.lastDonationDaysAgo >= 90,
        medicalConditions: [],
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+91 99999 00000',
          relation: 'Family',
        },
      });
      donors.push({ user, doc: donorDoc });
    }

    console.log('Seeding Blood Inventory...');
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components = ['whole_blood', 'packed_rbc', 'platelets', 'plasma'];
    const inventoryItems = [];
    const now = Date.now();

    for (const bg of bloodGroups) {
      for (const comp of components) {
        let expDays = comp === 'platelets' ? 5 : comp === 'plasma' ? 365 : 42;
        let units = comp === 'platelets' ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 15) + 8;

        const collectionDate = new Date(now - Math.floor(Math.random() * 10) * 86400000);
        const expiryDate = new Date(collectionDate.getTime() + expDays * 86400000);

        inventoryItems.push({
          bloodGroup: bg,
          component: comp,
          units,
          collectionDate,
          expiryDate,
          source: 'donation',
          status: 'available',
          storageLocation: `Cold Storage Unit ${bg.slice(0, 1)}`,
          addedBy: admin._id,
        });
      }
    }

    await BloodInventory.insertMany(inventoryItems);

    console.log('Seeding Historical Donations...');
    const primaryDonor = donors[0];
    const pastDonations = [
      { monthsAgo: 1, units: 1, location: 'Srishti Blood Centre, Marine Drive' },
      { monthsAgo: 4, units: 1, location: 'Apollo Hospital Camp, Navi Mumbai' },
      { monthsAgo: 7, units: 1, location: 'Rotary Blood Drive, Andheri' },
      { monthsAgo: 11, units: 1, location: 'Srishti Blood Centre, Marine Drive' },
    ];

    for (const pd of pastDonations) {
      const dDate = new Date();
      dDate.setMonth(dDate.getMonth() - pd.monthsAgo);

      await Donation.create({
        donorId: primaryDonor.doc._id,
        userId: primaryDonor.user._id,
        bloodGroup: primaryDonor.doc.bloodGroup,
        units: pd.units,
        donationDate: dDate,
        location: pd.location,
        status: 'completed',
        healthScreening: {
          hemoglobin: 14.5,
          bloodPressure: '120/80',
          pulse: 72,
          temperature: 98.4,
          weight: 74,
          isCleared: true,
        },
        notes: 'Routine voluntary donation, donor healthy.',
        certificateGenerated: true,
      });
    }

    console.log('Seeding Blood Requests...');
    const requestsData = [
      {
        requesterId: hospitals[0].user._id,
        requesterType: 'hospital',
        patientName: 'Kavita Singh',
        bloodGroup: 'A+',
        units: 2,
        urgency: 'critical',
        reason: 'Emergency Surgery (Accident Trauma)',
        hospitalName: hospitals[0].doc.hospitalName,
        city: hospitals[0].doc.city,
        contactNumber: '+91 98201 55555',
        status: 'pending',
      },
      {
        requesterId: hospitals[0].user._id,
        requesterType: 'hospital',
        patientName: 'Ramesh Patel',
        bloodGroup: 'O+',
        units: 3,
        urgency: 'urgent',
        reason: 'Chemotherapy supportive transfusion',
        hospitalName: hospitals[0].doc.hospitalName,
        city: hospitals[0].doc.city,
        contactNumber: '+91 98201 55555',
        status: 'approved',
      },
      {
        requesterId: hospitals[1].user._id,
        requesterType: 'hospital',
        patientName: 'Sunil Gupta',
        bloodGroup: 'B+',
        units: 1,
        urgency: 'normal',
        reason: 'Elective Orthopedic Knee Replacement',
        hospitalName: hospitals[1].doc.hospitalName,
        city: hospitals[1].doc.city,
        contactNumber: '+91 98202 66666',
        status: 'fulfilled',
        fulfilledDate: new Date(),
        fulfilledFrom: 'inventory',
      },
      {
        requesterId: donors[1].user._id,
        requesterType: 'donor',
        patientName: 'Suresh Verma',
        bloodGroup: 'AB-',
        units: 2,
        urgency: 'urgent',
        reason: 'Severe Anemia Care',
        hospitalName: 'Lilavati Hospital & Research Centre',
        city: 'Mumbai',
        contactNumber: '+91 98765 43211',
        status: 'pending',
      },
    ];

    for (const req of requestsData) {
      await BloodRequest.create(req);
    }

    console.log('\n=============================================');
    console.log(' SUCCESS: Database Seeded Successfully!');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log(' - Admin:    admin@bloodbank.com / admin123');
    console.log(' - Donor:    rahul@example.com / donor123');
    console.log(' - Hospital: city@hospital.com / hospital123');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed Failed:', err);
    process.exit(1);
  }
}

runSeed();
