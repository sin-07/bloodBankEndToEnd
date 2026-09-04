import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { units, status, storageLocation, notes } = await request.json();

    const inventory = await BloodInventory.findById(params.id);
    if (!inventory) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (units !== undefined) inventory.units = units;
    if (status) inventory.status = status;
    if (storageLocation) inventory.storageLocation = storageLocation;
    if (notes) inventory.notes = notes;

    await inventory.save();

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      data: { inventory },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/inventory/[id] - Discard blood unit
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const inventory = await BloodInventory.findById(params.id);
    if (!inventory) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    inventory.status = 'discarded';
    await inventory.save();

    return NextResponse.json({
      success: true,
      message: 'Blood unit discarded successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
