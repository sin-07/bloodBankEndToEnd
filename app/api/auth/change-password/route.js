import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, errorResponse } from '@/lib/auth';

export async function PUT(request) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    const { currentPassword, newPassword } = await request.json();

    const user = await User.findById(authUser._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
