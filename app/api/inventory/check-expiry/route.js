import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// POST /api/inventory/check-expiry
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const result = await BloodInventory.updateMany(
      {
        status: 'available',
        expiryDate: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} expired units marked`,
      data: { expiredCount: result.modifiedCount },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
