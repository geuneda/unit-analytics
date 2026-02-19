'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

interface CountPercentage {
  count: number;
  percentage: string;
}

interface MinionDetail {
  byRarity: Record<string, number>;
  byRank: Record<string, number>;
  byEnhanceLevel: Record<string, number>;
}

interface MinionCombo {
  minions: number[];
  minionNames: string[];
  count: number;
}

interface MinionStats {
  minionNames: Record<string, string>;
  rarityNames: Record<string, string>;
  totalRecordsWithMinions: number;
  totalMinionSelections: number;
  overall: Record<string, CountPercentage>;
  detail: Record<string, MinionDetail>;
  combos: MinionCombo[];
  byStageGroup: Record<string, Record<string, CountPercentage>>;
}

interface MinionStageStats {
  minionNames: Record<string, string>;
  stages: Record<string, Record<string, CountPercentage>>;
}

interface Props {
  data: MinionStats;
  stageData: MinionStageStats | null;
  stageList: string[];
}

const MINION_COLORS: Record<string, string> = {
  '2101': '#FF6B6B',
  '2201': '#4ECDC4',
  '2202': '#45B7D1',
  '2301': '#96CEB4',
  '2401': '#FFEAA7',
  '2501': '#DDA0DD',
};

const RARITY_COLORS: Record<string, string> = {
  '0': '#9CA3AF',
  '1': '#60A5FA',
  '2': '#A78BFA',
  '3': '#FBBF24',
  '4': '#F87171',
};

const GROUP_NAMES: Record<string, string> = {
  '2000': '일반스테이지',
  '3000': '정예스테이지',
  '5000': '운빨던전',
  '7000': '이벤트',
};

type DetailView = 'overview' | 'detail' | 'combo' | 'stage' | 'range';

export default function MinionAnalysis({ data, stageData, stageList }: Props) {
  const [view, setView] = useState<DetailView>('overview');
  const [selectedMinion, setSelectedMinion] = useState<string | null>(null);

  const overallChartData = Object.entries(data.overall)
    .map(([id, stats]) => ({
      name: data.minionNames[id] || `미니언 ${id}`,
      minionId: id,
      count: stats.count,
      percentage: parseFloat(stats.percentage),
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const views = [
    { id: 'overview' as const, label: '전체 사용률' },
    { id: 'detail' as const, label: '상세 정보' },
    { id: 'combo' as const, label: '미니언 조합' },
    { id: 'stage' as const, label: '챕터별' },
    { id: 'range' as const, label: '구간별' },
  ];

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
          <p className="text-gray-400 text-sm">미니언 보유 기록</p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.totalRecordsWithMinions.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            전체의 {((data.totalRecordsWithMinions / 322188) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
          <p className="text-gray-400 text-sm">총 미니언 선택</p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.totalMinionSelections.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
          <p className="text-gray-400 text-sm">평균 미니언 수</p>
          <p className="text-2xl font-bold text-white mt-1">
            {(data.totalMinionSelections / data.totalRecordsWithMinions).toFixed(2)}
          </p>
          <p className="text-gray-500 text-xs mt-1">기록당</p>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              view === v.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 전체 사용률 */}
      {view === 'overview' && (
        <OverviewView data={overallChartData} minionNames={data.minionNames} />
      )}

      {/* 상세 정보 */}
      {view === 'detail' && (
        <DetailView
          data={data}
          selectedMinion={selectedMinion}
          onSelectMinion={setSelectedMinion}
          overallChartData={overallChartData}
        />
      )}

      {/* 미니언 조합 */}
      {view === 'combo' && (
        <ComboView combos={data.combos} />
      )}

      {/* 챕터별 */}
      {view === 'stage' && (
        <StageView data={data} />
      )}

      {/* 구간별 */}
      {view === 'range' && stageData && (
        <RangeView
          stageData={stageData.stages}
          minionNames={data.minionNames}
          stageList={stageList}
        />
      )}
    </div>
  );
}

// --- 전체 사용률 뷰 ---
function OverviewView({ data, minionNames }: {
  data: Array<{ name: string; minionId: string; count: number; percentage: number }>;
  minionNames: Record<string, string>;
}) {
  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; count: number; percentage: number } }>;
  }) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 파이 차트 */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">미니언 사용 비율</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="count"
                label={({ name, payload }) => `${name} ${(payload as { percentage: number }).percentage}%`}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 바 차트 */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">미니언 선택률 순위</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} interval={0} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 테이블 */}
      <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">미니언별 상세 통계</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">순위</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">미니언</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">선택 횟수</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">비율</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">그래프</th>
              </tr>
            </thead>
            <tbody>
              {data.map((minion, idx) => (
                <tr key={minion.minionId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                  <td className="py-3 px-4 text-white font-medium">{minion.name}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-sm">{minion.minionId}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{minion.count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-blue-400 font-medium">{minion.percentage}%</td>
                  <td className="py-3 px-4 w-48">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${minion.percentage}%`,
                          backgroundColor: MINION_COLORS[minion.minionId] || '#888'
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
    </div>
  );
}

// --- 상세 정보 뷰 ---
function DetailView({ data, selectedMinion, onSelectMinion, overallChartData }: {
  data: MinionStats;
  selectedMinion: string | null;
  onSelectMinion: (id: string | null) => void;
  overallChartData: Array<{ name: string; minionId: string; count: number; percentage: number }>;
}) {
  const activeMinionId = selectedMinion || overallChartData[0]?.minionId;
  const detail = activeMinionId ? data.detail[activeMinionId] : null;

  const rarityData = detail
    ? Object.entries(detail.byRarity)
        .map(([rarity, count]) => ({
          name: data.rarityNames[rarity] || `희귀도 ${rarity}`,
          rarity,
          count,
        }))
        .sort((a, b) => parseInt(a.rarity) - parseInt(b.rarity))
    : [];

  const rankData = detail
    ? Object.entries(detail.byRank)
        .map(([rank, count]) => ({
          name: `랭크 ${rank}`,
          rank: parseInt(rank),
          count,
        }))
        .sort((a, b) => a.rank - b.rank)
    : [];

  const enhanceData = detail
    ? Object.entries(detail.byEnhanceLevel)
        .map(([level, count]) => ({
          name: `Lv.${level}`,
          level: parseInt(level),
          count,
        }))
        .sort((a, b) => a.level - b.level)
    : [];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-white">{label}</p>
          <p className="text-gray-300">{payload[0].value.toLocaleString()}회</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 미니언 선택 버튼 */}
      <div className="flex gap-2 flex-wrap">
        {overallChartData.map(m => (
          <button
            key={m.minionId}
            onClick={() => onSelectMinion(m.minionId)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMinionId === m.minionId
                ? 'text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={activeMinionId === m.minionId ? { backgroundColor: MINION_COLORS[m.minionId] || '#888' } : {}}
          >
            {m.name} ({m.percentage}%)
          </button>
        ))}
      </div>

      {detail && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 희귀도 분포 */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">희귀도 분포</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rarityData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {rarityData.map((entry) => (
                      <Cell key={entry.rarity} fill={RARITY_COLORS[entry.rarity] || '#888'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1">
              {rarityData.map(r => {
                const total = rarityData.reduce((sum, x) => sum + x.count, 0);
                return (
                  <div key={r.rarity} className="flex justify-between text-sm">
                    <span className="text-gray-400">{r.name}</span>
                    <span className="text-white">
                      {r.count.toLocaleString()} ({((r.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 랭크 분포 */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">랭크 분포</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1">
              {rankData.map(r => {
                const total = rankData.reduce((sum, x) => sum + x.count, 0);
                return (
                  <div key={r.rank} className="flex justify-between text-sm">
                    <span className="text-gray-400">{r.name}</span>
                    <span className="text-white">
                      {r.count.toLocaleString()} ({((r.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 강화 레벨 분포 */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">강화 레벨 분포</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enhanceData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={50} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 조합 뷰 ---
function ComboView({ combos }: { combos: MinionCombo[] }) {
  const maxCount = combos[0]?.count || 1;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-2">미니언 조합 순위</h3>
      <p className="text-gray-400 text-sm mb-4">가장 자주 함께 사용되는 2미니언 조합</p>
      <div className="space-y-3">
        {combos.map((combo, idx) => {
          const widthPercent = (combo.count / maxCount) * 100;
          return (
            <div key={idx} className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-lg"
                style={{ width: `${widthPercent}%` }}
              />
              <div className="relative flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 font-mono w-6">{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600/30 px-3 py-1 rounded-full text-emerald-300 text-sm font-medium">
                      {combo.minionNames[0]}
                    </span>
                    <span className="text-gray-500">+</span>
                    <span className="bg-teal-600/30 px-3 py-1 rounded-full text-teal-300 text-sm font-medium">
                      {combo.minionNames[1]}
                    </span>
                  </div>
                </div>
                <span className="text-white font-semibold">{combo.count.toLocaleString()}회</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 챕터별 뷰 ---
function StageView({ data }: { data: MinionStats }) {
  const groups = Object.keys(data.byStageGroup).sort((a, b) => parseInt(a) - parseInt(b));
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || '2000');

  const groupData = data.byStageGroup[selectedGroup] || {};
  const chartData = Object.entries(groupData)
    .map(([id, stats]) => ({
      name: data.minionNames[id] || `미니언 ${id}`,
      minionId: id,
      count: stats.count,
      percentage: parseFloat(stats.percentage),
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; count: number; percentage: number } }>;
  }) => {
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
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {GROUP_NAMES[selectedGroup] || `${selectedGroup}번대`} 미니언 사용 비율
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="count"
                  label={({ name, payload }) => `${name} ${(payload as { percentage: number }).percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {GROUP_NAMES[selectedGroup] || `${selectedGroup}번대`} 미니언 선택률
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} interval={0} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 구간별 뷰 ---
function RangeView({ stageData, minionNames, stageList }: {
  stageData: Record<string, Record<string, CountPercentage>>;
  minionNames: Record<string, string>;
  stageList: string[];
}) {
  const numericStages = stageList.map(s => parseInt(s)).sort((a, b) => a - b);
  const minStage = numericStages[0] || 2001;
  const maxStage = numericStages[numericStages.length - 1] || 5999;

  const [startStage, setStartStage] = useState(minStage);
  const [endStage, setEndStage] = useState(minStage + 10);

  const aggregatedData = useMemo(() => {
    const result: Record<string, { count: number }> = {};
    let totalCount = 0;

    for (const stage of stageList) {
      const stageNum = parseInt(stage);
      if (stageNum >= startStage && stageNum <= endStage) {
        const stageStats = stageData[stage];
        if (stageStats) {
          Object.entries(stageStats).forEach(([minionId, data]) => {
            if (!result[minionId]) {
              result[minionId] = { count: 0 };
            }
            result[minionId].count += data.count;
            totalCount += data.count;
          });
        }
      }
    }

    const finalResult: Record<string, CountPercentage> = {};
    Object.entries(result).forEach(([minionId, data]) => {
      finalResult[minionId] = {
        count: data.count,
        percentage: totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(2) : '0'
      };
    });

    return { minions: finalResult, totalCount };
  }, [stageData, stageList, startStage, endStage]);

  const stagesInRange = stageList.filter(s => {
    const num = parseInt(s);
    return num >= startStage && num <= endStage;
  }).length;

  const chartData = Object.entries(aggregatedData.minions)
    .map(([id, stats]) => ({
      name: minionNames[id] || `미니언 ${id}`,
      minionId: id,
      count: stats.count,
      percentage: parseFloat(stats.percentage)
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const presets = [
    { label: '2001~2010', start: 2001, end: 2010 },
    { label: '2011~2020', start: 2011, end: 2020 },
    { label: '2021~2030', start: 2021, end: 2030 },
    { label: '2031~2040', start: 2031, end: 2040 },
    { label: '2041~2060', start: 2041, end: 2060 },
    { label: '3001~3010', start: 3001, end: 3010 },
    { label: '3011~3020', start: 3011, end: 3020 },
    { label: '5001~5010', start: 5001, end: 5010 },
  ];

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; count: number; percentage: number } }>;
  }) => {
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
    <div className="space-y-6">
      {/* 범위 설정 */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">스테이지 구간 선택</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => { setStartStage(preset.start); setEndStage(preset.end); }}
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

      {aggregatedData.totalCount === 0 ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400">해당 구간에 미니언 데이터가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 파이 차트 */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                스테이지 {startStage}~{endStage} 미니언 사용 비율
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ name, payload }) => `${name} ${(payload as { percentage: number }).percentage}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
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
                스테이지 {startStage}~{endStage} 미니언 선택률
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} interval={0} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.minionId} fill={MINION_COLORS[entry.minionId] || '#888'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 상세 테이블 */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">미니언별 상세 통계</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">순위</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">미니언</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">선택 횟수</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">비율</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">그래프</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((minion, idx) => (
                    <tr key={minion.minionId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">{minion.name}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{minion.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-blue-400 font-medium">{minion.percentage}%</td>
                      <td className="py-3 px-4 w-48">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${minion.percentage}%`,
                              backgroundColor: MINION_COLORS[minion.minionId] || '#888'
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
