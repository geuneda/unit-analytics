const fs = require('fs');
const path = require('path');
const readline = require('readline');

const JSON_PATH = '/Users/teamsparta/Desktop/unit-analytics/backup12311509.stage_clear_history.json';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');

const UNIT_NAMES = {
  0: '영웅',
  1: '터렛',
  2: '제우스',
  3: '눈사람',
  4: '고릴라',
  5: '사도',
  6: '거북이',
  7: '지우개',
  8: '우주모함',
  9: '벙커',
  10: '어쌔신',
  11: '또르',
  12: '바람돌이'
};

// 통계 저장 객체
const stats = {
  overall: {}, // 전체 유닛 사용 횟수
  byStage: {}, // 스테이지별 유닛 사용 횟수
  bySlot: { 0: {}, 1: {}, 2: {}, 3: {}, 4: {} }, // 슬롯별 유닛 사용 횟수
  combos: {}, // 유닛 조합 (2개 조합)
  stageGroups: {}, // 스테이지 그룹별 통계 (2000번대, 3000번대 등)
  totalRecords: 0,
  stageList: new Set()
};

// 유닛 초기화
for (let i = 0; i <= 12; i++) {
  stats.overall[i] = 0;
  for (let slot = 0; slot < 5; slot++) {
    stats.bySlot[slot][i] = 0;
  }
}

function processRecord(record) {
  const stageId = record.stage_id;
  if (!stageId) return;

  stats.stageList.add(String(stageId));
  stats.totalRecords++;

  // 스테이지 그룹 (2000번대, 3000번대 등)
  const stageGroup = Math.floor(parseInt(stageId) / 1000) * 1000;
  if (!stats.stageGroups[stageGroup]) {
    stats.stageGroups[stageGroup] = {};
    for (let i = 0; i <= 12; i++) {
      stats.stageGroups[stageGroup][i] = 0;
    }
  }

  // 스테이지별 초기화
  if (!stats.byStage[stageId]) {
    stats.byStage[stageId] = {};
    for (let i = 0; i <= 12; i++) {
      stats.byStage[stageId][i] = 0;
    }
  }

  // 유닛 정보 처리
  const unitsInRecord = [];
  if (record.units_info && Array.isArray(record.units_info)) {
    record.units_info.forEach((unitInfo, slot) => {
      if (slot >= 5) return; // 슬롯 0~4만 처리

      const unit = unitInfo.unit_type;
      if (unit !== undefined && unit !== null && unit >= 0 && unit <= 12) {
        unitsInRecord.push(unit);

        // 전체 통계
        stats.overall[unit]++;

        // 스테이지별 통계
        stats.byStage[stageId][unit]++;

        // 슬롯별 통계
        stats.bySlot[slot][unit]++;

        // 스테이지 그룹별 통계
        stats.stageGroups[stageGroup][unit]++;
      }
    });
  }

  // 유닛 조합 통계 (2개 조합)
  const uniqueUnits = [...new Set(unitsInRecord)].sort((a, b) => a - b);
  for (let i = 0; i < uniqueUnits.length; i++) {
    for (let j = i + 1; j < uniqueUnits.length; j++) {
      const comboKey = `${uniqueUnits[i]}-${uniqueUnits[j]}`;
      stats.combos[comboKey] = (stats.combos[comboKey] || 0) + 1;
    }
  }
}

async function processJSON() {
  console.log('JSON 파일 처리 시작...');
  console.log(`파일 경로: ${JSON_PATH}`);

  const fileStream = fs.createReadStream(JSON_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let buffer = '';
  let recordCount = 0;
  let inObject = false;
  let braceCount = 0;

  for await (const line of rl) {
    const trimmedLine = line.trim();

    // 배열 시작/끝 무시
    if (trimmedLine === '[' || trimmedLine === ']') continue;

    // 각 라인을 처리
    for (const char of line) {
      if (char === '{') {
        if (!inObject) {
          inObject = true;
          buffer = '';
        }
        braceCount++;
      }

      if (inObject) {
        buffer += char;
      }

      if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inObject) {
          // 완전한 JSON 객체 발견
          try {
            // 끝의 쉼표 제거
            let jsonStr = buffer.trim();
            if (jsonStr.endsWith(',')) {
              jsonStr = jsonStr.slice(0, -1);
            }

            const record = JSON.parse(jsonStr);
            processRecord(record);
            recordCount++;

            if (recordCount % 50000 === 0) {
              console.log(`${recordCount.toLocaleString()}개 레코드 처리 중...`);
            }
          } catch (e) {
            // JSON 파싱 에러는 무시
          }

          inObject = false;
          buffer = '';
        }
      }
    }
  }

  console.log(`총 ${recordCount.toLocaleString()}개 레코드 처리 완료`);
  return stats;
}

function calculatePercentages(counts) {
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
  if (total === 0) return {};

  const result = {};
  for (const [key, value] of Object.entries(counts)) {
    result[key] = {
      count: value,
      percentage: ((value / total) * 100).toFixed(2)
    };
  }
  return result;
}

async function main() {
  try {
    // 출력 디렉토리 생성
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    await processJSON();

    // 전체 통계 저장
    const overallStats = {
      unitNames: UNIT_NAMES,
      totalSelections: Object.values(stats.overall).reduce((a, b) => a + b, 0),
      totalRecords: stats.totalRecords,
      units: calculatePercentages(stats.overall)
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'overall-stats.json'),
      JSON.stringify(overallStats, null, 2)
    );
    console.log('overall-stats.json 저장 완료');

    // 스테이지별 통계 저장
    const stageStats = {
      unitNames: UNIT_NAMES,
      stages: {}
    };

    for (const [stageId, counts] of Object.entries(stats.byStage)) {
      stageStats.stages[stageId] = calculatePercentages(counts);
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'stage-stats.json'),
      JSON.stringify(stageStats, null, 2)
    );
    console.log('stage-stats.json 저장 완료');

    // 슬롯별 통계 저장
    const slotStats = {
      unitNames: UNIT_NAMES,
      slots: {}
    };

    for (let slot = 0; slot < 5; slot++) {
      slotStats.slots[slot + 1] = calculatePercentages(stats.bySlot[slot]);
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'slot-stats.json'),
      JSON.stringify(slotStats, null, 2)
    );
    console.log('slot-stats.json 저장 완료');

    // 조합 통계 저장 (상위 50개)
    const sortedCombos = Object.entries(stats.combos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    const comboStats = {
      unitNames: UNIT_NAMES,
      topCombos: sortedCombos.map(([combo, count]) => {
        const [unit1, unit2] = combo.split('-').map(Number);
        return {
          units: [unit1, unit2],
          unitNames: [UNIT_NAMES[unit1], UNIT_NAMES[unit2]],
          count
        };
      })
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'combo-stats.json'),
      JSON.stringify(comboStats, null, 2)
    );
    console.log('combo-stats.json 저장 완료');

    // 스테이지 그룹별 통계 저장
    const stageGroupStats = {
      unitNames: UNIT_NAMES,
      groups: {}
    };

    for (const [groupId, counts] of Object.entries(stats.stageGroups)) {
      stageGroupStats.groups[groupId] = calculatePercentages(counts);
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'stage-group-stats.json'),
      JSON.stringify(stageGroupStats, null, 2)
    );
    console.log('stage-group-stats.json 저장 완료');

    // 스테이지 목록 저장
    const stageList = [...stats.stageList].sort((a, b) => parseInt(a) - parseInt(b));
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'stage-list.json'),
      JSON.stringify(stageList, null, 2)
    );
    console.log('stage-list.json 저장 완료');

    console.log('\n===== 처리 완료 =====');
    console.log(`총 레코드 수: ${stats.totalRecords.toLocaleString()}`);
    console.log(`총 스테이지 수: ${stageList.length}`);
    console.log(`총 유닛 선택 수: ${overallStats.totalSelections.toLocaleString()}`);

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();
