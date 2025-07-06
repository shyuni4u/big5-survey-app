# 🧠 Game Recommendation Test

사용자의 선택을 기반으로 게임을 추천해주는 심리 테스트 기반 웹 애플리케이션입니다.  
Next.js 기반으로 개발되었으며, 간단한 설문을 통해 유저 성향을 분석하고 그에 맞는 게임을 추천합니다.

## 🚀 데모

👉 [배포된 링크](https://wow-ai.enzo.kr/)

## 🖼️ 기능 미리보기

- ✅ 설문 기반 테스트 진행
- 🎮 결과에 따른 게임 추천 카드 제공
- 📊 사용자 성향 분석 결과 페이지
- 📱 반응형 UI

## 📂 프로젝트 구조

```
src/
├── app/
│ ├── api/survey-result/route.ts # 테스트 결과를 처리하는 API
│ ├── survey/ # 테스트 질문 페이지
│ ├── result/ # 결과 및 추천 게임 페이지
│ └── layout.tsx, page.tsx # 전체 레이아웃 및 메인 페이지 구성
├── components/
│ ├── molecules/ # 주요 UI 구성 요소 (추천 카드 등)
│ └── ui/ # 버튼, 아코디언 등 공통 컴포넌트
├── public/ # 정적 파일
```

## 🛠️ 기술 스택

- **Next.js (App Router)**
- **React 18**
- **TypeScript**
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Next API Routes**: 서버리스 백엔드 구현

## 📦 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/shyuni4u/big5-survey-app
cd big5-survey-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
http://localhost:3000
```
