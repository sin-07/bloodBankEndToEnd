import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/hospitals/requests
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query = { requesterId: user._id };
    if (status) query.status = status;

    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await BloodRequest.countDocuments(query);

    // Stats
    const stats = {
      total: await BloodRequest.countDocuments({ requesterId: user._id }),
      pending: await BloodRequest.countDocuments({ requesterId: user._id, status: 'pending' }),
      approved: await BloodRequest.countDocuments({ requesterId: user._id, status: 'approved' }),
      fulfilled: await BloodRequest.countDocuments({ requesterId: user._id, status: 'fulfilled' }),
    };

    return NextResponse.json({
      success: true,
      data: {
        requests,
        stats,
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
