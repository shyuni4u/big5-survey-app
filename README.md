# Game Class Recommendation Test

게임 직업을 추천해주는 심리 테스트 기반 웹 애플리케이션입니다.  
Next.js 기반으로 개발되었으며, 간단한 설문을 통해 유저 성향을 분석하고 그에 맞는 게임 직업을 추천합니다.

## 데모

[배포된 링크](https://wow-ai.enzo.kr/)

## 기능 미리보기

- 설문 기반 테스트 진행
- 결과에 따른 게임 추천 카드 제공
- 사용자 성향 분석 결과 페이지
- 반응형 UI

## 프로젝트 구조

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

## 기술 스택

- **Next.js (App Router)**
- **React 18**
- **TypeScript**
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Next API Routes**: 서버리스 백엔드 구현

## 설치 및 실행

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

## TODO

- [ ] 데이터 학습
- [ ] 모델 사용하여 직업 추천
- [ ] 피드백 받는 양식보다는 주기적으로 데이터를 학습을 다시 진행하여 모델 적용

## 학습 계획

| 항목              | 내용                                                     |
| --------------- | ------------------------------------------------------ |
| 문제 유형    | 다중 분류 (Multi-class Classification)|
| 입력 데이터   | E, A, C, N, O (5차원 벡터)|
| 출력 레이블   | `class + specialization` 조합|
| 모델 후보    | LightGBM, XGBoost, 또는 간단한 MLP (PyTorch / scikit-learn)|
| 학습 주기    | 주간 또는 누적 1000건 이상일 때|
| 예상 학습 시간 | 2\~3만 건이면 CPU에서도 수 분 내로 학습 가능|
| 데이터 편향 | 같은 답변에 `class`가 다양하게 나올 수 있으므로, Top-3 예측이나 softmax 확률을 사용하면 UX가 좋아짐|
| 모델 전환  | 모델을 무중단 교체하려면 `/model/reload` API를 두거나 버전 관리 필요|
| 평가 기준  | accuracy 뿐 아니라 confusion matrix나 top-k accuracy도 고려|

- 전처리 (Label Encoding 등)
- 모델 학습 (train.py)
- 모델 파일 저장 (model.pkl, model.onnx 등)
- 추론 서버에서 새 모델 로드
- API에 반영 (/predict 등)
