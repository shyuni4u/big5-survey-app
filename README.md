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
│ ├── onnx.ts \# ONNX 모델 추론 로직  
│ └── utils.ts \# 유틸리티 함수 (cn, 데이터 압축/해제)  
└── scripts/  
 ├── model.py \# PyTorch 모델 정의  
 ├── train.py \# 모델 학습 스크립트  
 ├── export_onnx.py \# ONNX 변환 스크립트  
 └── create-tables.sql \# Supabase 테이블 생성 DDL

## **🧠 모델 및 학습**

- **모델**: 5가지 성격 특성(A, C, E, N, O)을 입력받아 39개의 WoW 직업-전문화 조합 중 하나로 분류하는 다중 분류(Multi-class Classification) 모델입니다.
- **학습**:
  - data.csv 파일의 데이터를 기반으로 train.py 스크립트를 실행하여 모델을 학습합니다.
  - 학습 과정은 TensorBoard를 통해 모니터링할 수 있습니다. (tensorboard.sh 실행)
- **추론**:
  - 학습된 model.pth 파일은 export_onnx.py를 통해 웹 환경에 최적화된 model.onnx 파일로 변환됩니다.
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
