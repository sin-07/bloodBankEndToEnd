import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, errorResponse } from '@/lib/auth';

const LOW_STOCK_THRESHOLD = 5;

// GET /api/inventory/summary
export async function GET(request) {
  try {
    await connectDB();
    await getAuthUser(request);

    // Aggregate by blood group and component
    const summary = await BloodInventory.aggregate([
      {
        $match: {
          status: 'available',
          expiryDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: { bloodGroup: '$bloodGroup', component: '$component' },
          totalUnits: { $sum: '$units' },
          count: { $sum: 1 },
          nearestExpiry: { $min: '$expiryDate' },
        },
      },
      {
        $sort: { '_id.bloodGroup': 1, '_id.component': 1 },
      },
    ]);

    // Build per-blood-group totals (the shape the frontend expects)
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodStock = bloodGroups.map((bg) => {
      const bgItems = summary.filter((s) => s._id.bloodGroup === bg);
      const totalUnits = bgItems.reduce((sum, s) => sum + s.totalUnits, 0);
      return { _id: bg, totalUnits };
    });

    // Low stock alerts
    const lowStockAlerts = [];

    for (const entry of bloodStock) {
      if (entry.totalUnits < LOW_STOCK_THRESHOLD) {
        lowStockAlerts.push({
          bloodGroup: entry._id,
          currentUnits: entry.totalUnits,
          threshold: LOW_STOCK_THRESHOLD,
          severity: entry.totalUnits === 0 ? 'critical' : 'warning',
        });
      }
    }

    // Expiring soon (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoon = await BloodInventory.find({
      status: 'available',
      expiryDate: { $gt: new Date(), $lte: sevenDaysFromNow },
    }).sort({ expiryDate: 1 });

    return NextResponse.json({
      success: true,
      data: { summary, bloodStock, lowStockAlerts, expiringSoon },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
