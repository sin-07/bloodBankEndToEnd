import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, errorResponse } from '@/lib/auth';

export async function PUT(request) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    const { name, phone, city, address } = await request.json();

    const user = await User.findByIdAndUpdate(
      authUser._id,
      { name, phone, city, address },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city,
          address: user.address,
        },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
