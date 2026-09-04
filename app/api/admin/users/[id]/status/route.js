import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// PUT /api/admin/users/[id]/status - Update user status
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    requireRole(authUser, 'admin');

    const { isActive } = await request.json();

    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
