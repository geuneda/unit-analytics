'use client';

import { useState, useEffect } from 'react';
import UnitPieChart from './components/UnitPieChart';
import UnitBarChart from './components/UnitBarChart';
import StageSelector from './components/StageSelector';
import SlotAnalysis from './components/SlotAnalysis';
import ComboAnalysis from './components/ComboAnalysis';
import StageGroupAnalysis from './components/StageGroupAnalysis';
import StageRangeAnalysis from './components/StageRangeAnalysis';

interface UnitData {
  count: number;
  percentage: string;
}

interface OverallStats {
  unitNames: Record<string, string>;
  totalSelections: number;
  totalRecords: number;
  units: Record<string, UnitData>;
}

interface StageStats {
  unitNames: Record<string, string>;
  stages: Record<string, Record<string, UnitData>>;
}

interface SlotStats {
  unitNames: Record<string, string>;
  slots: Record<string, Record<string, UnitData>>;
}

interface ComboStats {
  unitNames: Record<string, string>;
  topCombos: Array<{
    units: number[];
    unitNames: string[];
    count: number;
  }>;
}

interface StageGroupStats {
  unitNames: Record<string, string>;
  groups: Record<string, Record<string, UnitData>>;
}

export default function Home() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [stageStats, setStageStats] = useState<StageStats | null>(null);
  const [slotStats, setSlotStats] = useState<SlotStats | null>(null);
  const [comboStats, setComboStats] = useState<ComboStats | null>(null);
  const [stageGroupStats, setStageGroupStats] = useState<StageGroupStats | null>(null);
  const [stageList, setStageList] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overall' | 'stage' | 'range' | 'slot' | 'combo' | 'group'>('overall');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/overall-stats.json').then(r => r.json()),
      fetch('/data/stage-stats.json').then(r => r.json()),
      fetch('/data/slot-stats.json').then(r => r.json()),
      fetch('/data/combo-stats.json').then(r => r.json()),
      fetch('/data/stage-group-stats.json').then(r => r.json()),
      fetch('/data/stage-list.json').then(r => r.json()),
    ]).then(([overall, stage, slot, combo, group, stages]) => {
      setOverallStats(overall);
      setStageStats(stage);
      setSlotStats(slot);
      setComboStats(combo);
      setStageGroupStats(group);
      setStageList(stages);
      setSelectedStage(stages[0] || '');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">데이터 로딩 중...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overall', label: '전체 통계', icon: '📊' },
    { id: 'stage', label: '스테이지별', icon: '🎯' },
    { id: 'range', label: '구간별', icon: '📏' },
    { id: 'group', label: '챕터별', icon: '📁' },
    { id: 'slot', label: '슬롯별', icon: '🎰' },
    { id: 'combo', label: '유닛 조합', icon: '🤝' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">유닛 분석 대시보드</h1>
            {overallStats && (
              <div className="flex gap-6 text-sm">
                <div className="text-gray-400">
                  총 플레이 기록: <span className="text-white font-semibold">{overallStats.totalRecords.toLocaleString()}</span>
                </div>
                <div className="text-gray-400">
                  총 유닛 선택: <span className="text-white font-semibold">{overallStats.totalSelections.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 전체 통계 */}
        {activeTab === 'overall' && overallStats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UnitPieChart
                data={overallStats.units}
                unitNames={overallStats.unitNames}
                title="전체 유닛 사용 비율"
              />
              <UnitBarChart
                data={overallStats.units}
                unitNames={overallStats.unitNames}
                title="유닛별 선택률 순위"
              />
            </div>

            {/* 유닛 상세 테이블 */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">유닛별 상세 통계</h2>
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
                    {Object.entries(overallStats.units)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([unitId, stats], idx) => (
                        <tr key={unitId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-4 text-white font-medium">{overallStats.unitNames[unitId]}</td>
                          <td className="py-3 px-4 text-right text-gray-300">{stats.count.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-blue-400 font-medium">{stats.percentage}%</td>
                          <td className="py-3 px-4 w-48">
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${parseFloat(stats.percentage)}%` }}
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
        )}

        {/* 스테이지별 통계 */}
        {activeTab === 'stage' && stageStats && (
          <div className="space-y-8">
            <StageSelector
              stages={stageList}
              selectedStage={selectedStage}
              onStageChange={setSelectedStage}
            />

            {selectedStage && stageStats.stages[selectedStage] && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UnitPieChart
                  data={stageStats.stages[selectedStage]}
                  unitNames={stageStats.unitNames}
                  title={`스테이지 ${selectedStage} 유닛 사용 비율`}
                />
                <UnitBarChart
                  data={stageStats.stages[selectedStage]}
                  unitNames={stageStats.unitNames}
                  title={`스테이지 ${selectedStage} 유닛 선택률`}
                />
              </div>
            )}
          </div>
        )}

        {/* 구간별 통계 */}
        {activeTab === 'range' && stageStats && (
          <StageRangeAnalysis
            stageData={stageStats.stages}
            unitNames={stageStats.unitNames}
            stageList={stageList}
          />
        )}

        {/* 챕터별 통계 */}
        {activeTab === 'group' && stageGroupStats && (
          <StageGroupAnalysis
            data={stageGroupStats.groups}
            unitNames={stageGroupStats.unitNames}
          />
        )}

        {/* 슬롯별 통계 */}
        {activeTab === 'slot' && slotStats && (
          <SlotAnalysis
            data={slotStats.slots}
            unitNames={slotStats.unitNames}
          />
        )}

        {/* 유닛 조합 */}
        {activeTab === 'combo' && comboStats && (
          <ComboAnalysis combos={comboStats.topCombos} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          유닛 분석 대시보드 • 데이터 기준: Clear History
        </div>
      </footer>
    </div>
  );
}
