import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Donor from '@/lib/models/Donor';
import Hospital from '@/lib/models/Hospital';
import { errorResponse } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role, phone, city, address, bloodGroup, hospitalName, registrationNumber, hospitalType } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({ name, email, password, role: role || 'donor', phone, city, address });

    // Create role-specific profile
    if (role === 'donor' && bloodGroup) {
      await Donor.create({ userId: user._id, bloodGroup });
    }

    if (role === 'hospital') {
      await Hospital.create({
        userId: user._id,
        hospitalName: hospitalName || name,
        registrationNumber: registrationNumber || `REG-${Date.now()}`,
        type: hospitalType || 'private',
        city: city || '',
      });
    }

    const token = user.generateToken();

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
