import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import Donation from '@/lib/models/Donation';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// PUT /api/donors/donations/:id/approve
// Admin approves a pending donation appointment → marks as completed + updates donor stats + adds to inventory
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
        { success: false, message: `Cannot approve a donation with status '${donation.status}'` },
        { status: 400 }
      );
    }

    // Read optional health screening data from request body
    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      // body is optional
    }

    const { healthScreening, units } = body;

    // Apply optional fields before saving
    if (healthScreening) donation.healthScreening = healthScreening;
    if (units) donation.units = units;

    // Update donor stats FIRST (before changing status, so a partial failure doesn't corrupt state)
    const donor = await Donor.findById(donation.donorId);
    if (donor) {
      donor.lastDonationDate = donation.donationDate;
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      donor.isEligible = false;
      await donor.save();
    }

    // Add units to blood inventory (whole blood expires ~42 days after collection)
    const collectionDate = new Date();
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 42);

    await BloodInventory.create({
      bloodGroup: donation.bloodGroup,
      units: donation.units || 1,
      source: 'donation',
      donationId: donation._id,
      addedBy: user._id,
      collectionDate,
      expiryDate,
    });

    // Mark donation as completed LAST — all side effects succeeded
    donation.status = 'completed';
    await donation.save();

    return NextResponse.json({
      success: true,
      message: 'Donation approved and recorded successfully',
      data: { donation },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
