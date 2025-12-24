'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UnitData {
  count: number;
  percentage: string;
}

interface Props {
  data: Record<string, UnitData>;
  unitNames: Record<string, string>;
  title: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4'
];

export default function UnitBarChart({ data, unitNames, title }: Props) {
  const chartData = Object.entries(data)
    .map(([unitId, stats]) => ({
      name: unitNames[unitId] || `유닛 ${unitId}`,
      unitId: parseInt(unitId),
      count: stats.count,
      percentage: parseFloat(stats.percentage)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; count: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{data.name}</p>
          <p className="text-gray-300">선택 횟수: {data.count.toLocaleString()}</p>
          <p className="text-blue-400">비율: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `${value}%`} />
            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.unitId % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
