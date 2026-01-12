# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

게임 클리어 기록 데이터를 분석하여 유닛 사용 통계를 시각화하는 Next.js 대시보드입니다. CSV 형태의 게임 클리어 데이터를 처리하여 JSON 통계 파일을 생성하고, 이를 웹에서 시각화합니다.

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# CSV 데이터 처리 (새 데이터 업데이트 시)
node scripts/process-csv.js

# JSON 데이터 처리 (MongoDB export JSON 파일)
node scripts/process-json.js
```

## 아키텍처

### 데이터 파이프라인

1. **CSV 입력** → `scripts/process-csv.js` → **JSON 출력** (`public/data/`)
2. **MongoDB JSON 입력** → `scripts/process-json.js` → **JSON 출력** (`public/data/`)
3. 프론트엔드는 `public/data/*.json` 파일을 fetch하여 시각화

### 데이터 파일 구조 (public/data/)

| 파일명 | 용도 |
|--------|------|
| `overall-stats.json` | 전체 유닛 사용 통계 |
| `stage-stats.json` | 스테이지별 유닛 통계 |
| `stage-group-stats.json` | 챕터별(1000단위 그룹) 통계 |
| `slot-stats.json` | 슬롯별(1~5) 유닛 배치 통계 |
| `combo-stats.json` | 2유닛 조합 TOP 50 |
| `stage-list.json` | 스테이지 ID 목록 |

### 프론트엔드 구조

- `src/app/page.tsx`: 메인 페이지 (탭 기반 SPA)
- `src/app/components/`: 차트 및 분석 컴포넌트
  - `UnitPieChart.tsx`, `UnitBarChart.tsx`: Recharts 기반 차트
  - `StageSelector.tsx`: 스테이지 선택 UI
  - `SlotAnalysis.tsx`, `ComboAnalysis.tsx`, `StageGroupAnalysis.tsx`, `StageRangeAnalysis.tsx`: 분석 뷰

### 유닛 ID 매핑 (0~12)

```
0:영웅, 1:터렛, 2:제우스, 3:눈사람, 4:고릴라, 5:사도, 6:거북이,
7:지우개, 8:우주모함, 9:벙커, 10:어쌔신, 11:또르, 12:바람돌이
```

## 기술 스택

- Next.js 16 + React 19 (App Router, Client Components)
- Tailwind CSS 4
- Recharts (차트 라이브러리)
- Vercel 배포 (GitHub push 시 자동 배포)

## 데이터 업데이트 절차

### CSV 파일 사용 시
1. CSV 파일을 프로젝트 루트에 `Clear_history.csv`로 배치 (또는 `scripts/process-csv.js`의 `CSV_PATH` 수정)
2. `node scripts/process-csv.js` 실행
3. `public/data/` 폴더에 JSON 파일 생성 확인
4. `npm run dev`로 로컬 확인 후 배포

### MongoDB JSON 파일 사용 시
1. MongoDB에서 export한 JSON 파일 준비 (또는 `scripts/process-json.js`의 `JSON_PATH` 수정)
2. `node scripts/process-json.js` 실행
3. `public/data/` 폴더에 JSON 파일 생성 확인
4. `npm run dev`로 로컬 확인 후 배포
