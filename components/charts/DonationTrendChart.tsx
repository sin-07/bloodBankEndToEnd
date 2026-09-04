'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DonationTrendChartProps {
  data: {
    _id: { year: number; month: number };
    count: number;
    units: number;
  }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DonationTrendChart({ data }: DonationTrendChartProps) {
  const chartData = data.map((item) => ({
    name: `${MONTHS[item._id.month - 1]} ${item._id.year}`,
    donations: item.count,
    units: item.units,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="donations" fill="#DC2626" name="Donations" radius={[4, 4, 0, 0]} />
        <Bar dataKey="units" fill="#F97316" name="Units" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
