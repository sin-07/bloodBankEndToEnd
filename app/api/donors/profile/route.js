import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import { getAuthUser, errorResponse } from '@/lib/auth';

// GET /api/donors/profile - Get donor profile
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const donor = await Donor.findOne({ userId: user._id }).populate(
      'userId',
      'name email phone city address'
    );

    if (!donor) {
      return NextResponse.json(
        { success: false, message: 'Donor profile not found' },
        { status: 404 }
      );
    }

    // Dynamically recalculate eligibility based on 90-day rule
    const actualEligibility = donor.checkEligibility();
    if (donor.isEligible !== actualEligibility) {
      donor.isEligible = actualEligibility;
      await donor.save();
    }

    return NextResponse.json({
      success: true,
      data: { donor },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/donors/profile - Update donor profile
export async function PUT(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    const body = await request.json();
    const { bloodGroup, dateOfBirth, gender, weight, medicalConditions, emergencyContact } = body;

    let donor = await Donor.findOne({ userId: user._id });

    if (donor) {
      if (bloodGroup) donor.bloodGroup = bloodGroup;
      if (dateOfBirth) donor.dateOfBirth = dateOfBirth;
      if (gender) donor.gender = gender;
      if (weight) donor.weight = weight;
      if (medicalConditions) donor.medicalConditions = medicalConditions;
      if (emergencyContact) donor.emergencyContact = emergencyContact;
      await donor.save();
    } else {
      donor = await Donor.create({
        userId: user._id,
        bloodGroup,
        dateOfBirth,
        gender,
        weight,
        medicalConditions,
        emergencyContact,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Donor profile updated successfully',
      data: { donor },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
