import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import Donor from '@/lib/models/Donor';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/email';
import { getAuthUser, errorResponse } from '@/lib/auth';

// Helper: auto-match donors
async function autoMatchDonors(bloodGroup, city) {
  const donors = await Donor.find({
    bloodGroup,
    isEligible: true,
  }).populate('userId', 'name email phone city');

  return donors
    .filter((d) => d.userId?.city?.toLowerCase() === city.toLowerCase())
    .slice(0, 5)
    .map((d) => ({
      donorId: d._id,
      userId: d.userId._id,
      name: d.userId.name,
      bloodGroup: d.bloodGroup,
      phone: d.userId.phone,
    }));
}

// Helper: notify matched donors
async function notifyMatchedDonors(matchedDonors, request) {
  for (const donor of matchedDonors) {
    const user = await User.findById(donor.userId);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: `Urgent Blood Request - ${request.bloodGroup} needed`,
        html: `
          <h2>Blood Donation Request</h2>
          <p>Dear ${donor.name},</p>
          <p>A ${request.urgency} blood request has been made for <strong>${request.bloodGroup}</strong> blood type.</p>
          <ul>
            <li>Patient: ${request.patientName}</li>
            <li>Units needed: ${request.units}</li>
            <li>Hospital: ${request.hospitalName || 'N/A'}</li>
            <li>City: ${request.city}</li>
          </ul>
          <p>Please log in to the Srishti Blood Bank portal for more details.</p>
        `,
      });
    }
  }
}

// GET /api/blood-requests - Get all blood requests
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const bloodGroup = searchParams.get('bloodGroup');
    const urgency = searchParams.get('urgency');

    const query = {};

    // Non-admin users only see their own requests
    if (user.role !== 'admin') {
      query.requesterId = user._id;
    }

    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await BloodRequest.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        requests,
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

// POST /api/blood-requests - Create blood request
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    const body = await request.json();
    const { patientName, bloodGroup, units, urgency, reason, hospitalName, city, contactNumber } = body;

    const bloodRequest = await BloodRequest.create({
      requesterId: user._id,
      requesterType: user.role,
      patientName,
      bloodGroup,
      units,
      urgency: urgency || 'normal',
      reason,
      hospitalName,
      city,
      contactNumber,
    });

    // Auto-match donors
    const matchedDonors = await autoMatchDonors(bloodGroup, city);
    if (matchedDonors.length > 0) {
      bloodRequest.matchedDonors = matchedDonors;
      await bloodRequest.save();
    }

    // Notify donors for urgent/critical requests
    if (['urgent', 'critical'].includes(urgency) && matchedDonors.length > 0) {
      await notifyMatchedDonors(matchedDonors, bloodRequest);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Blood request created successfully',
        data: {
          request: bloodRequest,
          matchedDonors: matchedDonors.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
