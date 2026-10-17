# **🎮 게임 직업 추천 테스트**

**Big5 성격 모델**을 기반으로 사용자의 성향을 분석하고, **World of Warcraft (WoW)** 게임에 가장 적합한 직업과 전문화를 추천해주는 웹 애플리케이션입니다. Next.js와 Python을 결합하여, 과학적인 성격 분석과 AI 기반 직업 추천 기능을 제공합니다.

## **✨ 주요 기능**

- **Big5 성격 테스트**: 과학적으로 검증된 40개의 문항을 통해 사용자의 5가지 성격 특성(외향성, 친화성, 성실성, 신경증, 개방성)을 분석합니다.
- **AI 기반 직업 추천**:
  - PyTorch로 학습된 모델을 **ONNX (Open Neural Network Exchange)** 형식으로 변환하여 웹 환경에서 빠르고 효율적인 추론을 수행합니다.
  - 분석된 성격 프로필을 바탕으로 사용자에게 가장 적합한 **상위 3개의 WoW 직업 및 전문화**를 추천합니다.
- **상세 결과 분석**:
  - 성격 프로필을 시각적인 **레이더 차트**로 제공합니다.
  - 각 성격 특성에 대한 점수와 해석을 **개별 카드 형태**로 보여주어 이해를 돕습니다.
- **데이터 저장 및 관리**:
  - **Supabase**를 데이터베이스로 사용하여 사용자의 설문 결과를 저장하고, 이를 모델 학습 데이터로 활용합니다.
- **결과 공유 기능**: 테스트 결과를 다른 사람과 쉽게 공유할 수 있도록 URL 복사 및 네이티브 공유 기능을 제공합니다.
- **반응형 UI**: 데스크톱, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면을 제공합니다.

## **🛠️ 기술 스택**

| 분야              | 기술                                                                    |
| :---------------- | :---------------------------------------------------------------------- |
| **프론트엔드**    | Next.js, React, TypeScript, Tailwind CSS                                |
| **UI 컴포넌트**   | shadcn/ui (Radix UI 기반), class-variance-authority, clsx, lucide-react |
| **데이터 시각화** | chart.js                                                                |
| **AI/ML**         | Python, PyTorch, ONNX, scikit-learn, pandas, TensorBoard                |
| **데이터베이스**  | Supabase (PostgreSQL)                                                   |
| **데이터 처리**   | pako (데이터 압축/해제)                                                 |
| **배포**          | Vercel                                                                  |

## **🚀 설치 및 실행**

1. **저장소 클론**  
   git clone https://github.com/shyuni4u/big5-survey-app.git  
   cd big5-survey-app

2. **의존성 설치**  
   npm install

3. 환경변수 설정  
   .env.local 파일을 생성하고 Supabase 관련 환경 변수를 추가합니다.  
   SUPABASE_URL=YOUR_SUPABASE_URL  
   SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY  
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY (학습 데이터셋 빌드에만 필요, 서버/클라이언트 코드에서는 쓰지 않음)  
   NEXT_PUBLIC_KAKAO_AD_UNIT=YOUR_ADFIT_UNIT

4. **개발 서버 실행**  
   npm run dev

5. 브라우저에서 확인  
   http://localhost:3000

## **📁 프로젝트 구조**

src  
├── app/  
│ ├── (main)/ \# 메인 페이지 및 레이아웃  
│ ├── survey/ \# 설문조사 페이지  
│ └── result/ \# 결과 분석 페이지  
├── api/  
│ └── survey-result/ \# 설문 결과 저장 API  
├── components/  
│ ├── atoms/ \# 가장 작은 단위의 UI (Header, Footer)  
│ ├── molecules/ \# 여러 컴포넌트 조합 (About, ResultCard)  
│ └── ui/ \# shadcn/ui 기반 공통 컴포넌트  
├── lib/  
│ ├── data.ts \# 설문 문항, 직업 정보 등 핵심 데이터  
│ ├── onnx.ts \# ONNX 모델 추론 로직  
│ └── utils.ts \# 유틸리티 함수 (cn, 데이터 압축/해제)  
└── scripts/  
 ├── dataset/ \# 학습 데이터셋 빌더 (Supabase 실데이터 + 합성 데이터)  
 ├── profiles/ \# 전문화별 Big5 추정 프로필 (합성 데이터의 중심값)  
 ├── ml/model.py \# PyTorch 모델 정의  
 ├── ml/train.py \# 모델 학습 스크립트  
 ├── ml/export_onnx.py \# ONNX + labels.json 변환 스크립트  
 ├── models/<game>/ \# 게임별 학습 체크포인트(model.pth)  
 └── create-tables.sql \# Supabase 테이블 생성 DDL

## **🧠 모델 및 학습**

- **모델**: 5가지 성격 특성(A, C, E, N, O)을 입력받아 게임별 직업-전문화 조합(WoW 40, 로스트아크 30, 던전앤파이터 71) 중 하나로 분류하는 다중 분류(Multi-class Classification) 모델입니다. 게임마다 모델을 따로 학습합니다.
- **학습 데이터**: `npm run dataset -- --env .env.local` 이 Supabase `survey_results`의 실데이터를 받아 `src/scripts/data/<game>.csv`를 만듭니다.
  - 클래스/전문화 이름은 `src/lib/data.ts` 기준으로 정규화하고, 거기 없는 라벨이나 깨진 답변은 버립니다.
  - 전문화마다 목표 건수(기본 500)에 모자란 만큼 합성 데이터를 보충합니다. 합성 데이터의 중심값은 실데이터가 50건 이상이면 실데이터 평균, 그 미만이면 `src/scripts/profiles/<game>.json`의 추정 프로필과 실데이터 평균을 건수 비율로 섞은 값입니다. 표준편차는 10, 시드는 고정(`--seed`)이라 재현 가능합니다.
  - 새 직업을 추가할 때는 `data.ts`와 `profiles/<game>.json`에 함께 넣어야 합니다. 프로필이 빠지면 빌더가 실패합니다.
- **학습** (`src/scripts` 디렉터리에서, `python -m venv venv` 후 `pip install -r requirements.txt`):
  - `venv/Scripts/python.exe ml/train.py --csv data/wow.csv --model models/wow/model.pth --log-dir runs/wow`
  - 체크포인트의 라벨 집합이 CSV와 다르면(직업 추가/삭제) 자동으로 처음부터 학습합니다. 검증 정확도가 가장 높았던 가중치만 저장됩니다.
  - 학습 과정은 TensorBoard로 볼 수 있습니다. (`venv/Scripts/tensorboard.exe --logdir=runs`)
- **추론**:
  - `venv/Scripts/python.exe ml/export_onnx.py --model models/wow/model.pth --onnx ../../public/models/wow/model.onnx` 가 `model.onnx`와 출력 인덱스 → 라벨 매핑 `labels.json`을 함께 씁니다. 두 파일은 항상 같이 갱신해야 하며, `src/lib/onnx.test.ts`가 `data.ts`의 라벨 집합과 `labels.json`이 일치하는지 검사합니다.
  - 클라이언트 측에서는 onnxruntime-web 라이브러리를 사용해 변환된 모델을 로드하고, 사용자의 성격 분석 결과를 입력하여 실시간으로 직업을 추천받습니다.

## **📝 개발 로드맵**

### 🎯 우선 순위 높음
- **PWA 지원 (오프라인 테스트)**: 네트워크 연결이 불안정한 환경에서도 테스트 진행 가능
- **다국어 지원 (i18n)**: 한국어, 영어 등 다중 언어 지원으로 글로벌 서비스 확장
- **성능 모니터링 (Web Vitals)**: 사용자 경험 최적화를 위한 성능 지표 모니터링
- **A/B 테스트 프레임워크**: 다양한 UI/UX 개선안 검증을 위한 실험 환경 구축

### 🔧 기술 부채 해결
- **CI/CD**: 자동 테스트 및 배포 파이프라인 구축
- **데이터 학습, 추론, 배포 파이프라인 자동화** (비용 최적화 필요)

### 📋 기능 확장 계획
- **다중 게임 지원**: Lost Ark, 던전앤파이터 등 추가 게임 직업 추천
- **사용자 계정 시스템**: 개인화된 추천 기록 관리
- **소셜 기능**: 친구와 결과 비교, 커뮤니티 기능

## **🤝 기여하기**

이 프로젝트에 기여하고 싶으시다면:

1. 이슈를 먼저 확인해주세요
2. Fork 후 feature 브랜치를 생성해주세요
3. 변경사항을 커밋하고 테스트를 실행해주세요
4. Pull Request를 제출해주세요

## **📄 라이센스**

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## GA4 방문·완료·공유 측정

배포 환경의 `NEXT_PUBLIC_GA_ID`에 GA4 웹 스트림의 측정 ID(`G-...`)를 설정하고 다시 빌드합니다. 값이 없으면 Google 스크립트를 불러오거나 이벤트를 전송하지 않습니다.

연결된 Google 태그의 설치 ID가 측정 ID와 다르면 `NEXT_PUBLIC_GOOGLE_TAG_ID`도 설정합니다. 웹 스트림 > 태그 설정 구성 > 설치 안내 > 직접 설치의 ID를 사용합니다. 현재 이 스트림의 설치 ID는 `G-JJZRZVQ1NK`, 수집 대상 측정 ID는 `G-2FW5XLPK5V`입니다. 설치 ID로 스크립트 로드·초기화를 하고, 이벤트는 `send_to`로 측정 대상에 보냅니다. 환경변수 변경 후에는 재배포가 필요합니다.

수집 진단 시 스크립트 태그의 존재만으로 성공을 판단하지 마세요. 실제 `gtag/js` 응답이 JavaScript/200인지, `g/collect` 요청이 올바른 측정 ID로 전송되고 성공하는지, 마지막으로 GA 실시간 보고서에 이벤트가 표시되는지 확인합니다. 이 프로젝트의 과거 측정 ID 스크립트는 404를 반환했으며, 이벤트 큐만 검사하는 테스트로는 이 오류를 발견할 수 없었습니다.

실제 전송 검증은 `TEST_LIVE_GA=1`과 `TEST_BASE_URL`을 지정한 뒤 `node tests/analytics-live.cjs`로 실행합니다. 이 테스트는 Google에 테스트용 방문·설문 완료·공유 유입·카드 다운로드 이벤트를 실제 전송하므로 일반 CI에서는 실행하지 않습니다. 설문 학습용 DB에는 제출하지 않으며, 결과 요약은 `test-results/analytics-live.json`에 기록합니다. 보고서 수신 여부는 여전히 GA 화면에서 확인해야 합니다.

- `page_view`: 페이지 방문 (앱에서 수동 전송)
- `survey_start`: 새 설문의 첫 답변
- `survey_complete`: 40개 문항 답변 완료 (결과 링크 조회와 구분)
- `share`: 링크 복사 성공 또는 네이티브 공유 API 성공. 실제 상대방 수신을 의미하지 않습니다.
- `share_card_download`: PNG 다운로드 요청 성공. 사용자가 사진첩에 저장했는지는 알 수 없습니다.
- `share_landing`: 공유 링크 또는 카드 QR로 유입된 페이지 조회
- `share_test_start`: 공유받은 결과의 '나도 테스트하기' 클릭

공유 링크는 `utm_source=play_persona`, `utm_medium=referral`, `utm_campaign=result_share`를 사용하며 `utm_content`로 `native`, `copy_link`, `card_qr`를 구분합니다. 카드 QR은 성격 결과 없이 해당 게임의 새 설문으로 연결됩니다. 공유 유입 경로는 같은 탭에서 30분간 이벤트의 `acquisition_source`로 이어집니다.

GA4 관리 > 데이터 스트림 > 웹 스트림 > 향상된 측정에서 자동 페이지 조회(특히 브라우저 기록 변경)를 끄고 앱의 수동 `page_view`를 사용하세요. 자동 수집의 중복을 방지하고 결과 데이터가 담긴 전체 URL의 자동 전송을 피하기 위한 설정입니다. 앱 이벤트의 URL에서는 결과 점수·현재 직업·답변을 제거합니다.

GA4에서 `survey_complete`를 주요 이벤트로 지정하고, 필요하면 `game`, `method`, `acquisition_source`, `landing_page`를 이벤트 범위 맞춤 측정기준으로 등록합니다. 보고서 > 획득에서 소스/매체와 캠페인을 확인하고, 탐색에서 `share_landing → survey_start → survey_complete` 퍼널을 구성합니다. 광고 차단이나 동의 설정에 따라 측정이 누락될 수 있습니다.

실시간 보고서에서 본인 방문을 확인한 뒤 설문 완료와 공유 유입을 각각 테스트하세요. 로컬 테스트는 이벤트 큐와 QR 디코딩을 검증하며, GA 계정에 실제 수신됐는지는 실시간 보고서에서 별도 확인해야 합니다.
