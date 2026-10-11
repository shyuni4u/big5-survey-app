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
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL  
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

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
│ ├── recommend.ts \# 규칙 기반 직업 추천 점수 계산  
│ └── utils.ts \# 유틸리티 함수 (cn, 데이터 압축/해제)  
└── scripts/  
 ├── model.py \# PyTorch 모델 정의  
 ├── train.py \# 모델 학습 스크립트  
 ├── export_onnx.py \# ONNX 변환 스크립트  
 └── create-tables.sql \# Supabase 테이블 생성 DDL

## **🧠 추천 방식**

- **데이터**: `src/lib/data.ts`의 각 전문화에 `big5`(E/A/C/N/O 목표값 0~100)와 `signature`(가중치 2배 특성 1~2개)가 있습니다. 같은 게임 안에서 프로필이 같은 전문화가 없도록 테스트(`src/lib/recommend.test.ts`)가 거리 10 이상을 강제합니다.
- **점수**: 역할 적합도(A·E·N으로 역할 원형과의 거리)와 전문화 적합도(시그니처 가중 거리)를 35:65로 섞습니다. 상수는 `src/lib/recommend.ts` 상단에 있습니다.
- **검증**: 게임별 성향 유형(힐러형, 탱커형, 도박 외향 딜러 등)에 대한 골든 테스트가 상위 3개의 역할과 전문화를 고정합니다.
- **학습 스크립트**: `src/scripts/ml/`의 PyTorch 학습·ONNX 변환 스크립트와 체크포인트는 실제 설문 데이터가 충분히 쌓였을 때 재학습하기 위해 남겨 둔 것으로, 현재 앱은 사용하지 않습니다.
- **실데이터 보정**: Supabase SQL Editor에서 `select app, class, specialization, answers from survey_results;` 결과를 CSV 또는 JSON으로 내보낸 뒤 `node src/scripts/profile-calibration.js survey_results.csv` 를 실행하면, 응답자 모집단의 평균·표준편차(`src/lib/recommend.ts`의 `POPULATION_BASELINE` 갱신용), 실데이터 평균이 프로필과 크게 다른 전문화, 서로 가까운 전문화 쌍(실데이터에서 갈리는 특성 포함)을 출력합니다. 이 리포트를 보고 값을 조정하고 테스트로 확인합니다.

## **📝 향후 계획 (TODO)**

- \[ \] 다국어 지원 (한국어, 영어, 등)
- \[ \] 데이터 학습, 추론, 배포 파이프라인 자동화 (비용이 문제 ..)

## 코드 리뷰를 위한 Gemini 연동
