import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BloodInventory from '@/lib/models/BloodInventory';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

const LOW_STOCK_THRESHOLD = 5;

// GET /api/inventory/alerts
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const alerts = [];

    for (const bg of bloodGroups) {
      const totalUnits = await BloodInventory.aggregate([
        {
          $match: {
            bloodGroup: bg,
            status: 'available',
            expiryDate: { $gt: new Date() },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$units' },
          },
        },
      ]);

      const units = totalUnits.length > 0 ? totalUnits[0].total : 0;

      if (units < LOW_STOCK_THRESHOLD) {
        alerts.push({
          bloodGroup: bg,
          currentUnits: units,
          threshold: LOW_STOCK_THRESHOLD,
          severity: units === 0 ? 'critical' : 'warning',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
