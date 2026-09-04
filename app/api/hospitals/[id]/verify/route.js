import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// PUT /api/hospitals/[id]/verify
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const hospital = await Hospital.findByIdAndUpdate(
      params.id,
      { isVerified: true },
      { new: true }
    );

    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital verified successfully',
      data: { hospital },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
