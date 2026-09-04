import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import Donation from '@/lib/models/Donation';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/donors/donations - Get donation history
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query = { userId: user._id };
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .sort({ donationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Donation.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/donors/donations] Error:', error.message, error.stack);
    return errorResponse(error);
  }
}

// POST /api/donors/donations - Create donation (admin)
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { donorId, bloodGroup, units, location, healthScreening } = body;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return NextResponse.json(
        { success: false, message: 'Donor not found' },
        { status: 404 }
      );
    }

    // Check eligibility
    if (!donor.checkEligibility()) {
      return NextResponse.json(
        {
          success: false,
          message: `Donor needs to wait ${donor.daysUntilEligible()} more days`,
        },
        { status: 400 }
      );
    }

    const donation = await Donation.create({
      donorId,
      userId: donor.userId,
      bloodGroup: bloodGroup || donor.bloodGroup,
      units: units || 1,
      location,
      status: 'completed',
      healthScreening,
    });

    // Update donor stats
    donor.lastDonationDate = donation.donationDate;
    donor.totalDonations += 1;
    donor.isEligible = false;
    await donor.save();

    // Add to inventory (whole blood expires ~42 days after collection)
    const collectionDate = new Date();
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 42);

    await BloodInventory.create({
      bloodGroup: donation.bloodGroup,
      units: donation.units,
      source: 'donation',
      donationId: donation._id,
      addedBy: user._id,
      collectionDate,
      expiryDate,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Donation recorded successfully',
        data: { donation },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
