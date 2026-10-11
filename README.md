# **🎮 게임 직업 추천 테스트**

**Big5 성격 모델**을 기반으로 사용자의 성향을 분석하고, **World of Warcraft (WoW)** 게임에 가장 적합한 직업과 전문화를 추천해주는 웹 애플리케이션입니다. Big5 성향과 전문화별 플레이 스타일 프로필을 비교하는 규칙 기반 점수로 직업을 추천합니다.

## **✨ 주요 기능**

- **Big5 성격 테스트**: 과학적으로 검증된 40개의 문항을 통해 사용자의 5가지 성격 특성(외향성, 친화성, 성실성, 신경증, 개방성)을 분석합니다.
- **성향 기반 직업 추천**:
  - 전문화마다 목표 Big5 프로필과 시그니처 특성(가중치 2배)을 `src/lib/data.ts`에 정의합니다.
  - 역할(탱커/힐러/서포터/버퍼/딜러) 적합도와 전문화 적합도를 35:65로 섞어 0~100 적합도를 내고, **상위 3개 직업·전문화**와 한 줄 추천 이유를 보여 줍니다. 계산은 `src/lib/recommend.ts`에 있으며 브라우저에서 동기적으로 실행됩니다.
- **상세 결과 분석**:
  - 성격 프로필을 시각적인 **레이더 차트**로 제공합니다.
  - 각 성격 특성에 대한 점수와 해석을 **개별 카드 형태**로 보여주어 이해를 돕습니다.
- **데이터 저장 및 관리**:
  - **Supabase**를 데이터베이스로 사용하여 사용자의 설문 결과를 저장하고, 이를 프로필 보정과 향후 모델 학습에 활용합니다.
- **결과 공유 기능**: 테스트 결과를 다른 사람과 쉽게 공유할 수 있도록 URL 복사 및 네이티브 공유 기능을 제공합니다.
- **반응형 UI**: 데스크톱, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면을 제공합니다.

## **🛠️ 기술 스택**

| 분야              | 기술                                                                    |
| :---------------- | :---------------------------------------------------------------------- |
| **프론트엔드**    | Next.js, React, TypeScript, Tailwind CSS                                |
| **UI 컴포넌트**   | shadcn/ui (Radix UI 기반), class-variance-authority, clsx, lucide-react |
| **데이터 시각화** | chart.js                                                                |
| **학습 스크립트(향후)** | Python, PyTorch, scikit-learn, pandas, TensorBoard                      |
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
│ ├── recommend.ts \# 규칙 기반 직업 추천 점수 계산 (모집단 정규화 포함)  
│ └── utils.ts \# 유틸리티 함수 (cn, 데이터 압축/해제)  
└── scripts/  
 ├── profile-calibration.js \# 실데이터 보정 리포트 (설문 내보내기와 전문화 프로필 비교)  
 ├── dataset/ \# 학습 데이터셋 빌더 (Supabase 실데이터 + 합성 데이터)  
 ├── profiles/ \# 전문화별 Big5 추정 프로필 (합성 데이터의 중심값)  
 ├── ml/model.py \# PyTorch 모델 정의  
 ├── ml/train.py \# 모델 학습 스크립트  
 ├── ml/export_onnx.py \# ONNX + labels.json 변환 스크립트  
 ├── models/<game>/ \# 게임별 학습 체크포인트(model.pth)  
 └── create-tables.sql \# Supabase 테이블 생성 DDL

## **🧠 추천 방식**

- **데이터**: `src/lib/data.ts`의 각 전문화에 `big5`(E/A/C/N/O 목표값 0~100)와 `signature`(가중치 2배 특성 1~2개)가 있습니다. 같은 게임 안에서 프로필이 같은 전문화가 없도록 테스트(`src/lib/recommend.test.ts`)가 거리 10 이상을 강제합니다. 새 직업을 추가할 때는 두 필드가 필수라 빠지면 타입 검사가 실패합니다.
- **점수**: 설문 원점수는 매칭 전에 응답자 모집단 기준(`src/lib/recommend.ts`의 `POPULATION_BASELINE`, 2026-10-11 내보내기 2,310명의 평균·표준편차)으로 정규화해 "게이머 평균 50, 표준편차 25" 척도로 바꿉니다. `data.ts`의 `big5` 값은 이 정규화된 척도 위의 값입니다. 그 다음 역할 적합도(A·E·N으로 역할 원형과의 거리)와 전문화 적합도(시그니처 가중 거리)를 35:65로 섞습니다. 상수는 `src/lib/recommend.ts` 상단에 있습니다.
- **검증**: 게임별 성향 유형(힐러형, 탱커형, 도박 외향 딜러 등)에 대한 골든 테스트가 상위 3개의 역할과 전문화를 고정합니다.
- **실데이터 보정**: Supabase SQL Editor에서 `select app, class, specialization, answers from survey_results;` 결과를 CSV 또는 JSON으로 내보낸 뒤 `node src/scripts/profile-calibration.js survey_results.csv` 를 실행하면, 응답자 모집단의 평균·표준편차(`POPULATION_BASELINE` 갱신용), 실데이터 평균(정규화 척도)이 프로필과 크게 다른 전문화, 서로 가까운 전문화 쌍(실데이터에서 갈리는 특성 포함)을 출력합니다. 이 리포트를 보고 값을 조정하고 테스트로 확인합니다.

### 학습 스크립트 (향후 실데이터 모델 학습용, 현재 앱은 사용하지 않음)

실제 설문 데이터로는 전문화별 Big5 평균이 거의 구분되지 않아(전문화 내 표준편차 15~20, 전문화 평균 간 편차 3) 지금은 규칙 기반 추천을 씁니다. 아래 도구는 데이터가 충분히 쌓였을 때 모델을 다시 학습하기 위해 남겨 둔 것입니다.

- **모델**: 5가지 성격 특성(A, C, E, N, O)을 입력받아 게임별 직업-전문화 조합(WoW 40, 로스트아크 30, 던전앤파이터 71) 중 하나로 분류하는 다중 분류(Multi-class Classification) 모델입니다. 게임마다 모델을 따로 학습합니다.
- **학습 데이터**: `npm run dataset -- --env .env.local` 이 Supabase `survey_results`의 실데이터를 받아 `src/scripts/data/<game>.csv`를 만듭니다.
  - 클래스/전문화 이름은 `src/lib/data.ts` 기준으로 정규화하고, 거기 없는 라벨이나 깨진 답변은 버립니다.
  - 전문화마다 목표 건수(기본 500)에 모자란 만큼 합성 데이터를 보충합니다. 합성 데이터의 중심값은 실데이터가 50건 이상이면 실데이터 평균, 그 미만이면 `src/scripts/profiles/<game>.json`의 추정 프로필과 실데이터 평균을 건수 비율로 섞은 값입니다. 표준편차는 10, 시드는 고정(`--seed`)이라 재현 가능합니다.
  - 새 직업을 추가할 때는 `data.ts`와 `profiles/<game>.json`에 함께 넣어야 합니다. 프로필이 빠지면 빌더가 실패합니다.
- **학습** (`src/scripts` 디렉터리에서, `python -m venv venv` 후 `pip install -r requirements.txt`):
  - `venv/Scripts/python.exe ml/train.py --csv data/wow.csv --model models/wow/model.pth --log-dir runs/wow`
  - 체크포인트의 라벨 집합이 CSV와 다르면(직업 추가/삭제) 자동으로 처음부터 학습합니다. 검증 정확도가 가장 높았던 가중치만 저장됩니다.
  - 학습 과정은 TensorBoard로 볼 수 있습니다. (`venv/Scripts/tensorboard.exe --logdir=runs`)
- **내보내기**:
  - `venv/Scripts/python.exe ml/export_onnx.py --model models/wow/model.pth --onnx <출력 경로>/model.onnx` 가 `model.onnx`와 출력 인덱스 → 라벨 매핑 `labels.json`을 함께 씁니다. 두 파일은 항상 같이 갱신해야 합니다. 브라우저 추론 경로(`src/lib/onnx.ts`, `public/models/`, `onnxruntime-web`)는 규칙 기반 추천으로 바뀌면서 제거됐으므로, 모델을 다시 쓰려면 추론 경로를 새로 붙여야 합니다.

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
