'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UnitData {
  count: number;
  percentage: string;
}

interface Props {
  data: Record<string, Record<string, UnitData>>;
  unitNames: Record<string, string>;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4'
];

const GROUP_NAMES: Record<string, string> = {
  '2000': '일반스테이지',
  '3000': '정예스테이지',
  '5000': '운빨던전',
};

export default function StageGroupAnalysis({ data, unitNames }: Props) {
  const groups = Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b));
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || '2000');

  const chartData = Object.entries(data[selectedGroup] || {})
    .map(([unitId, stats]) => ({
      name: unitNames[unitId] || `유닛 ${unitId}`,
      unitId: parseInt(unitId),
      count: stats.count,
      percentage: parseFloat(stats.percentage)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; count: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{d.name}</p>
          <p className="text-gray-300">선택 횟수: {d.count.toLocaleString()}</p>
          <p className="text-blue-400">비율: {d.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">스테이지 그룹별 분석</h2>

      {/* 그룹 선택 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {groups.map(group => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedGroup === group
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {GROUP_NAMES[group] || `${group}번대`}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
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
