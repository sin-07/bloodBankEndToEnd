import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodRequest from '@/lib/models/BloodRequest';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// Helper: reduce inventory stock
async function reduceInventoryStock(bloodGroup, units) {
  let remainingUnits = units;
  const inventoryItems = await BloodInventory.find({
    bloodGroup,
    status: 'available',
    expiryDate: { $gt: new Date() },
  }).sort({ expiryDate: 1 }); // Use oldest first (FIFO)

  for (const item of inventoryItems) {
    if (remainingUnits <= 0) break;

    if (item.units <= remainingUnits) {
      remainingUnits -= item.units;
      item.status = 'issued';
      item.units = 0;
    } else {
      item.units -= remainingUnits;
      remainingUnits = 0;
    }
    await item.save();
  }

  return remainingUnits === 0;
}

// PUT /api/blood-requests/[id]/status
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { status, adminNotes, fulfilledFrom } = await request.json();

    const bloodRequest = await BloodRequest.findById(params.id);
    if (!bloodRequest) {
      return NextResponse.json(
        { success: false, message: 'Blood request not found' },
        { status: 404 }
      );
    }

    bloodRequest.status = status;
    if (adminNotes) bloodRequest.adminNotes = adminNotes;

    // If fulfilling from inventory, reduce stock
    if (status === 'fulfilled') {
      bloodRequest.fulfilledFrom = fulfilledFrom || 'inventory';
      bloodRequest.fulfilledDate = new Date();

      if (fulfilledFrom === 'inventory' || !fulfilledFrom) {
        const success = await reduceInventoryStock(
          bloodRequest.bloodGroup,
          bloodRequest.units
        );
        if (!success) {
          return NextResponse.json(
            { success: false, message: 'Insufficient inventory stock' },
            { status: 400 }
          );
        }
      }
    }

    await bloodRequest.save();

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
      data: { request: bloodRequest },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
