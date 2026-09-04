import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import User from '@/lib/models/User';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/donors - Get all donors (admin)
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const bloodGroup = searchParams.get('bloodGroup');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;

    let donors = Donor.find(query)
      .populate('userId', 'name email phone city isActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const results = await donors;

    // Filter by city/search on populated fields
    let filtered = results;
    if (city) {
      filtered = filtered.filter((d) => d.userId?.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.userId?.name?.toLowerCase().includes(searchLower) ||
          d.userId?.email?.toLowerCase().includes(searchLower)
      );
    }

    const total = await Donor.countDocuments(query);

    // Recalculate isEligible dynamically for each donor (90-day rule)
    // and persist any changed values back to DB in bulk
    const bulkOps = [];
    for (const donor of filtered) {
      const actualEligibility = donor.checkEligibility();
      if (donor.isEligible !== actualEligibility) {
        donor.isEligible = actualEligibility;
        bulkOps.push({
          updateOne: {
            filter: { _id: donor._id },
            update: { $set: { isEligible: actualEligibility } },
          },
        });
      }
    }
    if (bulkOps.length > 0) {
      await Donor.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      data: {
        donors: filtered,
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
