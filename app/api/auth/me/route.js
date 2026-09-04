import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, errorResponse } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    let profile = null;
    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city,
          address: user.address,
          avatar: user.avatar,
          isActive: user.isActive,
        },
        profile,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
