# 유닛 분석 대시보드

게임 클리어 기록 데이터를 분석하여 유닛 사용 통계를 시각화하는 대시보드입니다.

## 기능

- **전체 통계**: 모든 스테이지의 유닛 사용 비율
- **스테이지별**: 개별 스테이지의 유닛 사용 통계
- **구간별**: 스테이지 범위(예: 2020~2030)를 지정하여 분석
- **챕터별**: 일반/정예/운빨던전 그룹별 통계
- **슬롯별**: 각 슬롯(1~5)에 배치된 유닛 분석
- **유닛 조합**: 자주 함께 사용되는 2유닛 조합 TOP 20

## 데이터 업데이트 방법

새로운 CSV 데이터로 통계를 업데이트하려면 아래 단계를 따르세요.

### 1. CSV 파일 준비

CSV 파일은 아래 형식이어야 합니다:
- `stage_id`: 스테이지 번호 (예: 2001, 3015, 5003)
- `units_info[0].unit_type` ~ `units_info[4].unit_type`: 슬롯 1 ~ 5의 유닛 ID (0 ~ 12)

**유닛 ID 매핑:**
| ID | 유닛명 |
|----|--------|
| 0 | 영웅 |
| 1 | 터렛 |
| 2 | 제우스 |
| 3 | 눈사람 |
| 4 | 고릴라 |
| 5 | 사도 |
| 6 | 거북이 |
| 7 | 지우개 |
| 8 | 우주모함 |
| 9 | 벙커 |
| 10 | 어쌔신 |
| 11 | 또르 |
| 12 | 바람돌이 |

### 2. 처리 스크립트 실행

```bash
# 프로젝트 클론
git clone https://github.com/geuneda/unit-analytics.git
cd unit-analytics

# 의존성 설치
npm install

# CSV 파일을 프로젝트 루트에 복사
cp /path/to/your/Clear_history.csv ./Clear_history.csv

# 데이터 처리 스크립트 실행
node scripts/process-csv.js
```

스크립트가 실행되면 `public/data/` 폴더에 다음 JSON 파일들이 생성됩니다:
- `overall-stats.json` - 전체 통계
- `stage-stats.json` - 스테이지별 통계
- `stage-group-stats.json` - 챕터별 통계
- `slot-stats.json` - 슬롯별 통계
- `combo-stats.json` - 유닛 조합 통계
- `stage-list.json` - 스테이지 목록

### 3. 로컬에서 확인

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 데이터가 잘 표시되는지 확인합니다.

### 4. 배포

**GitHub에 푸시하면 Vercel에서 자동 배포됩니다:**

```bash
git add .
git commit -m "데이터 업데이트"
git push
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 기술 스택

- [Next.js 15](https://nextjs.org/) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- [Recharts](https://recharts.org/) - 차트 라이브러리
- [Vercel](https://vercel.com/) - 배포

## 라이선스

MIT
