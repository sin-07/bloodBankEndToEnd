import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import Donation from '@/lib/models/Donation';
import User from '@/lib/models/User';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/donors/appointments
// Donor: own pending/upcoming appointments
// Admin: all appointments (optionally filtered by status)
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};

    if (user.role === 'admin') {
      // Admin sees all appointments, defaulting to pending
      if (status) query.status = status;
      else query.status = 'pending';
    } else {
      // Donor sees only their own appointments
      query.userId = user._id;
      if (status) query.status = status;
    }

    const appointments = await Donation.find(query)
      .populate('donorId', 'bloodGroup totalDonations')
      .populate('userId', 'name email phone')
      .sort({ donationDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Donation.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/donors/appointments
// Donor self-books a donation appointment (status = 'pending')
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'donor');

    const body = await request.json();
    const { location, preferredDate, notes } = body;

    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location is required' },
        { status: 400 }
      );
    }

    // Find donor profile
    const donor = await Donor.findOne({ userId: user._id });
    if (!donor) {
      return NextResponse.json(
        { success: false, message: 'Donor profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    // Check if donor already has a pending appointment
    const existing = await Donation.findOne({ userId: user._id, status: 'pending' });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You already have a pending appointment. Please wait for it to be processed.' },
        { status: 400 }
      );
    }

    const appointment = await Donation.create({
      donorId: donor._id,
      userId: user._id,
      bloodGroup: donor.bloodGroup,
      units: 1,
      location,
      donationDate: preferredDate ? new Date(preferredDate) : new Date(),
      status: 'pending',
      notes: notes || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully. Please visit the donation center on the selected date.',
        data: { appointment },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
