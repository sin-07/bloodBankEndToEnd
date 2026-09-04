import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/hospitals/profile
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const hospital = await Hospital.findOne({ userId: user._id }).populate(
      'userId',
      'name email phone city address'
    );

    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Hospital profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { hospital },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/hospitals/profile
export async function PUT(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    const { hospitalName, type, city, state, address, contactPerson } = await request.json();

    const hospital = await Hospital.findOneAndUpdate(
      { userId: user._id },
      { hospitalName, type, city, state, address, contactPerson },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Hospital profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital profile updated',
      data: { hospital },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
