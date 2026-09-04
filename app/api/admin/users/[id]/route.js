import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Donor from '@/lib/models/Donor';
import Donation from '@/lib/models/Donation';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const targetUser = await User.findById(params.id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete associated profiles
    if (targetUser.role === 'donor') {
      await Donor.deleteOne({ userId: targetUser._id });
      await Donation.deleteMany({ userId: targetUser._id });
    }
    if (targetUser.role === 'hospital') {
      await Hospital.deleteOne({ userId: targetUser._id });
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
