'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

export default function UnitPieChart({ data, unitNames, title }: Props) {
  const chartData = Object.entries(data)
    .map(([unitId, stats]) => ({
      name: unitNames[unitId] || `유닛 ${unitId}`,
      value: stats.count,
      percentage: parseFloat(stats.percentage)
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percentage: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{payload[0].name}</p>
          <p className="text-gray-300">선택 횟수: {payload[0].value.toLocaleString()}</p>
          <p className="text-blue-400">비율: {payload[0].payload.percentage}%</p>
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, payload }) => `${name} ${(payload as { percentage: number }).percentage}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
