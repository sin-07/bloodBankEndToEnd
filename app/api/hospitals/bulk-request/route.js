import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, errorResponse } from '@/lib/auth';

// POST /api/hospitals/bulk-request
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    const { requests } = await request.json();

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide an array of blood requests' },
        { status: 400 }
      );
    }

    const hospital = await Hospital.findOne({ userId: user._id });
    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Hospital profile not found' },
        { status: 404 }
      );
    }

    const createdRequests = [];

    for (const reqData of requests) {
      const bloodRequest = await BloodRequest.create({
        requesterId: user._id,
        requesterType: 'hospital',
        patientName: reqData.patientName,
        bloodGroup: reqData.bloodGroup,
        units: reqData.units,
        urgency: reqData.urgency || 'normal',
        reason: reqData.reason,
        hospitalName: hospital.hospitalName,
        city: hospital.city,
        contactNumber: hospital.contactPerson?.phone || '',
      });
      createdRequests.push(bloodRequest);
    }

    // Update hospital's total requests
    hospital.totalRequests += createdRequests.length;
    await hospital.save();

    return NextResponse.json(
      {
        success: true,
        message: `${createdRequests.length} blood requests created successfully`,
        data: { requests: createdRequests },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
