import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/donors/eligibility - Check donation eligibility
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const donor = await Donor.findOne({ userId: user._id });
    if (!donor) {
      return NextResponse.json(
        { success: false, message: 'Donor profile not found' },
        { status: 404 }
      );
    }

    const isEligible = donor.checkEligibility();
    const daysRemaining = donor.daysUntilEligible();

    return NextResponse.json({
      success: true,
      data: {
        isEligible,
        daysRemaining,
        lastDonationDate: donor.lastDonationDate,
        message: isEligible
          ? 'You are eligible to donate blood!'
          : `You need to wait ${daysRemaining} more days before your next donation.`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
