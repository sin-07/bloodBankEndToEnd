import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donation from '@/lib/models/Donation';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// PUT /api/donors/donations/:id/reject
// Admin rejects a pending donation appointment
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { id } = params;

    const donation = await Donation.findById(id);
    if (!donation) {
      return NextResponse.json(
        { success: false, message: 'Donation not found' },
        { status: 404 }
      );
    }

    if (donation.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Cannot reject a donation with status '${donation.status}'` },
        { status: 400 }
      );
    }

    // Read optional rejection reason from request body
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch (_) {
      // body is optional
    }

    donation.status = 'rejected';
    if (reason) donation.notes = reason;
    await donation.save();

    return NextResponse.json({
      success: true,
      message: 'Donation appointment rejected',
      data: { donation },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
