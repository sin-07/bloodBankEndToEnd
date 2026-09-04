import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Donor from '@/lib/models/Donor';
import Donation from '@/lib/models/Donation';
import BloodRequest from '@/lib/models/BloodRequest';
import BloodInventory from '@/lib/models/BloodInventory';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Dashboard stats
export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const [
      totalDonors,
      totalHospitals,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      totalDonations,
      activeUsers,
    ] = await Promise.all([
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ isActive: true }),
    ]);

    // Blood stock summary
    const bloodStock = await BloodInventory.aggregate([
      {
        $match: {
          status: 'available',
          expiryDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate total units in stock
    const totalUnits = bloodStock.reduce((acc, item) => acc + (item.totalUnits || 0), 0);

    // Recent requests
    const recentRequests = await BloodRequest.find()
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const donationTrends = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          donationDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' },
          },
          count: { $sum: 1 },
          units: { $sum: '$units' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Request distribution by urgency
    const requestsByUrgency = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format trends with friendly month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = donationTrends.map((item) => ({
      ...item,
      monthName: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    }));

    // Low stock alerts (under 10 units)
    const lowStockAlerts = bloodStock
      .filter((item) => item.totalUnits < 10)
      .map((item) => ({
        bloodGroup: item._id,
        units: item.totalUnits,
      }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalDonors,
          totalHospitals,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          totalDonations,
          activeUsers,
          totalUnits,
        },
        totalDonors,
        totalHospitals,
        totalRequests,
        pendingRequests,
        fulfilledRequests,
        totalDonations,
        totalUnits,
        bloodStock,
        recentRequests,
        donationTrends: formattedTrends,
        requestsByUrgency,
        lowStockAlerts,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
