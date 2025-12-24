'use client';

interface ComboData {
  units: number[];
  unitNames: string[];
  count: number;
}

interface Props {
  combos: ComboData[];
}

export default function ComboAnalysis({ combos }: Props) {
  const maxCount = combos[0]?.count || 1;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">인기 유닛 조합 TOP 20</h2>
      <p className="text-gray-400 text-sm mb-4">가장 자주 함께 사용되는 2유닛 조합</p>

      <div className="space-y-3">
        {combos.slice(0, 20).map((combo, idx) => {
          const widthPercent = (combo.count / maxCount) * 100;
          return (
            <div key={idx} className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg"
                style={{ width: `${widthPercent}%` }}
              />
              <div className="relative flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 font-mono w-6">{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600/30 px-3 py-1 rounded-full text-blue-300 text-sm font-medium">
                      {combo.unitNames[0]}
                    </span>
                    <span className="text-gray-500">+</span>
                    <span className="bg-purple-600/30 px-3 py-1 rounded-full text-purple-300 text-sm font-medium">
                      {combo.unitNames[1]}
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
