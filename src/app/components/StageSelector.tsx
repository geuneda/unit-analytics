'use client';

import { useState, useMemo } from 'react';

interface Props {
  stages: string[];
  selectedStage: string;
  onStageChange: (stage: string) => void;
}

export default function StageSelector({ stages, selectedStage, onStageChange }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  // 스테이지를 그룹별로 정리
  const groupedStages = useMemo(() => {
    const groups: Record<number, string[]> = {};
    stages.forEach(stage => {
      const group = Math.floor(parseInt(stage) / 1000) * 1000;
      if (!groups[group]) groups[group] = [];
      groups[group].push(stage);
    });
    return groups;
  }, [stages]);

  const filteredStages = useMemo(() => {
    if (!searchTerm) return stages;
    return stages.filter(stage => stage.includes(searchTerm));
  }, [stages, searchTerm]);

  const groupNames: Record<number, string> = {
    2000: '일반스테이지',
    3000: '정예스테이지',
    5000: '운빨던전',
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">스테이지 선택</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="스테이지 번호 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {searchTerm ? (
          <div className="grid grid-cols-4 gap-2">
            {filteredStages.map(stage => (
              <button
                key={stage}
                onClick={() => onStageChange(stage)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStage === stage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        ) : (
          Object.entries(groupedStages).map(([group, stageList]) => (
            <div key={group} className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                {groupNames[parseInt(group)] || `${group}번대`} ({stageList.length}개)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {stageList.map(stage => (
                  <button
                    key={stage}
                    onClick={() => onStageChange(stage)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStage === stage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
