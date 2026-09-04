import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/blood-requests/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const bloodRequest = await BloodRequest.findById(params.id)
      .populate('requesterId', 'name email phone')
      .populate('matchedDonors.userId', 'name phone');

    if (!bloodRequest) {
      return NextResponse.json(
        { success: false, message: 'Blood request not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      user.role !== 'admin' &&
      bloodRequest.requesterId._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { request: bloodRequest },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
