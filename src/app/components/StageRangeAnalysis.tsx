'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface UnitData {
  count: number;
  percentage: string;
}

interface Props {
  stageData: Record<string, Record<string, UnitData>>;
  unitNames: Record<string, string>;
  stageList: string[];
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4'
];

export default function StageRangeAnalysis({ stageData, unitNames, stageList }: Props) {
  const numericStages = stageList.map(s => parseInt(s)).sort((a, b) => a - b);
  const minStage = numericStages[0] || 2001;
  const maxStage = numericStages[numericStages.length - 1] || 5999;

  const [startStage, setStartStage] = useState(minStage);
  const [endStage, setEndStage] = useState(minStage + 10);

  // 범위 내 스테이지들의 통계 집계
  const aggregatedData = useMemo(() => {
    const result: Record<string, { count: number }> = {};
    let totalCount = 0;

    // 범위 내 스테이지들 순회
    for (const stage of stageList) {
      const stageNum = parseInt(stage);
      if (stageNum >= startStage && stageNum <= endStage) {
        const stageStats = stageData[stage];
        if (stageStats) {
          Object.entries(stageStats).forEach(([unitId, data]) => {
            if (!result[unitId]) {
              result[unitId] = { count: 0 };
            }
            result[unitId].count += data.count;
            totalCount += data.count;
          });
        }
      }
    }

    // 퍼센트 계산
    const finalResult: Record<string, UnitData> = {};
    Object.entries(result).forEach(([unitId, data]) => {
      finalResult[unitId] = {
        count: data.count,
        percentage: totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(2) : '0'
      };
    });

    return { units: finalResult, totalCount };
  }, [stageData, stageList, startStage, endStage]);

  // 범위 내 스테이지 개수
  const stagesInRange = stageList.filter(s => {
    const num = parseInt(s);
    return num >= startStage && num <= endStage;
  }).length;

  // 차트 데이터
  const chartData = Object.entries(aggregatedData.units)
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

  // 프리셋 버튼들
  const presets = [
    { label: '2001~2010', start: 2001, end: 2010 },
    { label: '2011~2020', start: 2011, end: 2020 },
    { label: '2021~2030', start: 2021, end: 2030 },
    { label: '2031~2040', start: 2031, end: 2040 },
    { label: '3001~3010', start: 3001, end: 3010 },
    { label: '3011~3020', start: 3011, end: 3020 },
    { label: '5001~5010', start: 5001, end: 5010 },
  ];

  return (
    <div className="space-y-6">
      {/* 범위 설정 UI */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">스테이지 구간 선택</h2>

        {/* 프리셋 버튼 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setStartStage(preset.start);
                setEndStage(preset.end);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                startStage === preset.start && endStage === preset.end
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 직접 입력 */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">시작:</label>
            <input
              type="number"
              value={startStage}
              onChange={(e) => setStartStage(parseInt(e.target.value) || minStage)}
              min={minStage}
              max={maxStage}
              className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-gray-500">~</span>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">끝:</label>
            <input
              type="number"
              value={endStage}
              onChange={(e) => setEndStage(parseInt(e.target.value) || maxStage)}
              min={minStage}
              max={maxStage}
              className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-400">
            ({stagesInRange}개 스테이지, 총 {aggregatedData.totalCount.toLocaleString()}회 선택)
          </div>
        </div>
      </div>

      {/* 결과 없음 */}
      {aggregatedData.totalCount === 0 ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400">해당 구간에 데이터가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 차트 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 파이 차트 */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                스테이지 {startStage}~{endStage} 유닛 사용 비율
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      dataKey="percentage"
                      label={({ name, payload }) => `${name} ${(payload as { percentage: number }).percentage}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.unitId % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 바 차트 */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                스테이지 {startStage}~{endStage} 유닛 선택률
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={70} />
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
          </div>

          {/* 상세 테이블 */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">유닛별 상세 통계</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">순위</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">유닛</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">선택 횟수</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">비율</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">그래프</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((unit, idx) => (
                    <tr key={unit.unitId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">{unit.name}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{unit.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-blue-400 font-medium">{unit.percentage}%</td>
                      <td className="py-3 px-4 w-48">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${unit.percentage}%`,
                              backgroundColor: COLORS[unit.unitId % COLORS.length]
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
