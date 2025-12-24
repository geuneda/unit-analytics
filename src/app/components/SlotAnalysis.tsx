'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export default function SlotAnalysis({ data, unitNames }: Props) {
  // 각 슬롯의 TOP 3 유닛 계산
  const slotTopUnits = Object.entries(data).map(([slot, units]) => {
    const sorted = Object.entries(units)
      .map(([unitId, stats]) => ({
        unitId: parseInt(unitId),
        name: unitNames[unitId],
        percentage: parseFloat(stats.percentage),
        count: stats.count
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    return { slot: parseInt(slot), topUnits: sorted };
  });

  // 슬롯별 전체 데이터 (차트용)
  const chartData = Object.entries(unitNames).map(([unitId, name]) => {
    const row: Record<string, string | number> = { name };
    Object.entries(data).forEach(([slot, units]) => {
      row[`슬롯${slot}`] = parseFloat(units[unitId]?.percentage || '0');
    });
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">슬롯별 유닛 배치 분석</h2>

      {/* TOP 3 유닛 카드 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {slotTopUnits.map(({ slot, topUnits }) => (
          <div key={slot} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">슬롯 {slot}</h3>
            {topUnits.map((unit, idx) => (
              <div key={unit.unitId} className="flex items-center justify-between py-1">
                <span className="text-gray-300">
                  {idx + 1}. {unit.name}
                </span>
                <span className="text-white font-medium">{unit.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 슬롯별 유닛 분포 차트 */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="슬롯1" fill="#FF6B6B" />
            <Bar dataKey="슬롯2" fill="#4ECDC4" />
            <Bar dataKey="슬롯3" fill="#45B7D1" />
            <Bar dataKey="슬롯4" fill="#FFEAA7" />
            <Bar dataKey="슬롯5" fill="#DDA0DD" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
