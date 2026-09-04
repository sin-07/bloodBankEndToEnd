import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donation from '@/lib/models/Donation';
import User from '@/lib/models/User';
import { generateDonationCertificate } from '@/lib/pdf';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/donors/donations/[id]/certificate
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const donation = await Donation.findById(params.id);
    if (!donation) {
      return NextResponse.json(
        { success: false, message: 'Donation not found' },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== 'admin' && donation.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    if (donation.status !== 'completed') {
      return NextResponse.json(
        { success: false, message: 'Certificate only available for completed donations' },
        { status: 400 }
      );
    }

    const donor = await User.findById(donation.userId);

    const pdfBuffer = await generateDonationCertificate({
      donorName: donor.name,
      bloodGroup: donation.bloodGroup,
      units: donation.units,
      donationDate: donation.donationDate,
      location: donation.location,
      donationId: donation._id.toString(),
    });

    // Mark certificate as generated
    donation.certificateGenerated = true;
    await donation.save();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=donation-certificate-${donation._id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return errorResponse(error);
  }
}
