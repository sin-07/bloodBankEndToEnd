import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/hospitals - Get all hospitals (admin)
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const city = searchParams.get('city');
    const isVerified = searchParams.get('isVerified');

    const query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (isVerified !== null && isVerified !== undefined) query.isVerified = isVerified === 'true';

    const hospitals = await Hospital.find(query)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Hospital.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        hospitals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
