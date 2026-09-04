import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/inventory - Get inventory
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const component = searchParams.get('component');
    const status = searchParams.get('status') || 'available';

    const query = { status };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (component) query.component = component;

    // Exclude expired items
    query.expiryDate = { $gt: new Date() };

    const inventory = await BloodInventory.find(query)
      .populate('addedBy', 'name')
      .sort({ expiryDate: 1 });

    return NextResponse.json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/inventory - Add blood units (admin)
export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { bloodGroup, component, units, collectionDate, source, donationId, storageLocation, notes } = body;

    const collection = collectionDate ? new Date(collectionDate) : new Date();
    let expiryDays = 42;

    switch (component) {
      case 'platelets':
        expiryDays = 5;
        break;
      case 'plasma':
      case 'cryoprecipitate':
        expiryDays = 365;
        break;
      case 'packed_rbc':
        expiryDays = 42;
        break;
      default:
        expiryDays = 42;
    }

    const expiryDate = new Date(collection.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const inventory = await BloodInventory.create({
      bloodGroup,
      component: component || 'whole_blood',
      units,
      collectionDate: collection,
      expiryDate,
      source: source || 'donation',
      donationId,
      storageLocation,
      notes,
      addedBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Blood units added to inventory',
        data: { inventory },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
