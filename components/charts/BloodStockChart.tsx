'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { BLOOD_GROUP_COLORS } from '@/lib/utils';

interface BloodStockChartProps {
  data: { _id: string; totalUnits: number }[];
}

export default function BloodStockChart({ data }: BloodStockChartProps) {
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.totalUnits,
  }));

  const colors = data.map((item) => BLOOD_GROUP_COLORS[item._id] || '#6B7280');

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
