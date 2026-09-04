import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import { getAuthUser, errorResponse } from '@/lib/auth';

// PUT /api/blood-requests/[id]/cancel
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const bloodRequest = await BloodRequest.findById(params.id);
    if (!bloodRequest) {
      return NextResponse.json(
        { success: false, message: 'Blood request not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      user.role !== 'admin' &&
      bloodRequest.requesterId.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    if (bloodRequest.status === 'fulfilled') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a fulfilled request' },
        { status: 400 }
      );
    }

    bloodRequest.status = 'cancelled';
    await bloodRequest.save();

    return NextResponse.json({
      success: true,
      message: 'Request cancelled successfully',
      data: { request: bloodRequest },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
