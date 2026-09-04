import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donor from '@/lib/models/Donor';
import BloodRequest from '@/lib/models/BloodRequest';
import BloodInventory from '@/lib/models/BloodInventory';
import { exportToCSV } from '@/lib/csv';
import { getAuthUser, requireRole, errorResponse } from '@/lib/auth';

// GET /api/admin/export/[type] - Export reports as CSV
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    requireRole(user, 'admin');

    const { type } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let data = [];
    let headers = [];
    let filename = '';

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (type) {
      case 'donors':
        data = await Donor.find().populate('userId', 'name email phone city');
        headers = [
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'city', title: 'City' },
          { id: 'totalDonations', title: 'Total Donations' },
          { id: 'lastDonationDate', title: 'Last Donation' },
        ];
        data = data.map((d) => ({
          name: d.userId?.name || '',
          email: d.userId?.email || '',
          phone: String(d.userId?.phone || ''),
          bloodGroup: d.bloodGroup,
          city: d.userId?.city || '',
          totalDonations: d.totalDonations,
          lastDonationDate: d.lastDonationDate
            ? d.lastDonationDate.toISOString().split('T')[0]
            : 'Never',
        }));
        filename = 'donors-report';
        break;

      case 'requests':
        const requestQuery = {};
        if (startDate || endDate) requestQuery.createdAt = dateFilter;
        data = await BloodRequest.find(requestQuery).populate('requesterId', 'name email');
        headers = [
          { id: 'patientName', title: 'Patient Name' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'units', title: 'Units' },
          { id: 'urgency', title: 'Urgency' },
          { id: 'status', title: 'Status' },
          { id: 'hospitalName', title: 'Hospital' },
          { id: 'city', title: 'City' },
          { id: 'requestedBy', title: 'Requested By' },
          { id: 'date', title: 'Date' },
        ];
        data = data.map((r) => ({
          patientName: r.patientName,
          bloodGroup: r.bloodGroup,
          units: r.units,
          urgency: r.urgency,
          status: r.status,
          hospitalName: r.hospitalName || '',
          city: r.city,
          requestedBy: r.requesterId?.name || '',
          date: r.createdAt.toISOString().split('T')[0],
        }));
        filename = 'requests-report';
        break;

      case 'inventory':
        data = await BloodInventory.find({ status: 'available' }).populate('addedBy', 'name');
        headers = [
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'component', title: 'Component' },
          { id: 'units', title: 'Units' },
          { id: 'collectionDate', title: 'Collection Date' },
          { id: 'expiryDate', title: 'Expiry Date' },
          { id: 'status', title: 'Status' },
          { id: 'addedBy', title: 'Added By' },
        ];
        data = data.map((i) => ({
          bloodGroup: i.bloodGroup,
          component: i.component,
          units: i.units,
          collectionDate: i.collectionDate.toISOString().split('T')[0],
          expiryDate: i.expiryDate.toISOString().split('T')[0],
          status: i.status,
          addedBy: i.addedBy?.name || '',
        }));
        filename = 'inventory-report';
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid report type. Use: donors, requests, or inventory' },
          { status: 400 }
        );
    }

    const csv = await exportToCSV(data, headers);

    return new Response(csv, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=${filename}.xlsx`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
