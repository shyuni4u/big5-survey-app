# 규칙 기반 직업 추천 설계

작성일: 2026-10-11
상태: 승인됨 (채팅에서 설계 합의 완료)

## 1. 배경과 문제

현재 직업 추천은 브라우저에서 ONNX 모델(`src/lib/onnx.ts`)을 돌려 39/28/69개 전문화 중 softmax 확률 상위 5개를 뽑는다. 그런데 모델은 실제 유저 응답이 아니라 `src/scripts/dummy.js`에 손으로 적은 전문화별 Big5 평균값에 표준편차 10의 가우시안 노이즈를 더한 합성 데이터로만 학습됐다. 그 결과:

- 추천 품질이 손으로 적은 표의 품질에 묶여 있고, 신경망은 표 조회에 노이즈를 섞는 수준이다 (랜덤 입력에서 "가장 가까운 프로필"과 1위 일치율 와우 65%, 로아 64%, 던파 54%).
- 표에 완전히 같은 프로필을 가진 전문화 묶음이 많다 (와우 3묶음, 로아 4묶음, 던파 13묶음 33개). 모델은 이들을 구분할 수 없다.
- 화면의 "적합도 %"는 전체 전문화에 대한 상대 확률이라, 힐러 성향이 완벽한 사람에게 힐러 5개가 12~13%씩 표시된다. 유저는 이를 "안 맞는다"로 읽는다.
- 던파처럼 딜러가 압도적으로 많은 게임에서는 버퍼가 거의 1위에 오르지 못한다.

## 2. 목표와 비목표

목표:

- 성향(Big5)과 전문화의 관계를 사람이 읽고 고칠 수 있는 데이터와 수식으로 정의한다.
- 역할(탱커/힐러/서포터/버퍼/딜러) 적합도를 먼저 반영해 역할 쏠림을 막는다.
- 딜러처럼 수가 많은 역할 안에서도 전문화별 편차가 실제로 나도록 데이터와 테스트로 보장한다.
- 적합도를 0~100 절대값으로 보여 주고, 추천 이유를 한 줄로 설명한다.
- 브라우저 ONNX 추론 경로를 제거한다. 학습 스크립트와 체크포인트는 실데이터 재학습용으로 남긴다.

비목표:

- 실제 유저 데이터로 모델을 재학습하는 일. 데이터가 쌓인 뒤 별도 작업으로 한다.
- 설문 문항, 점수 계산(`personality-calculator.ts`), 공유 링크 포맷 변경.
- 상위 3개에 같은 직업(class)의 전문화가 여럿 나오는 것을 막는 규칙. 1차에서는 두지 않는다.

## 3. 아키텍처 개요

```
설문 응답 → calculateScores → PersonalityScores (E/A/C/N/O, 0~100)
                                      │
                                      ▼
                     recommend(game, scores)  ← 새 모듈 src/lib/recommend.ts (순수, 동기)
                        ├─ roleFit(scores, spec.role)      역할 원형과의 거리 (A·E·N)
                        ├─ specFit(scores, spec.big5, spec.signature)  가중 거리 (5개 특성)
                        └─ score = 0.35·roleFit + 0.65·specFit → 정렬된 Recommendation[]
                                      │
                                      ▼
                       RecommendationSection (상위 3개 단상 UI + 적합도 + 한 줄 이유)
```

전문화별 목표 프로필과 시그니처 특성은 `src/lib/data.ts`의 각 전문화 항목에 필수 필드로 들어간다. 계산 상수(역할 원형, 가중치, 혼합 비율)는 `recommend.ts` 상단 한 곳에 모은다.

## 4. 데이터 모델

### 4.1 타입 변경 (`src/lib/types.ts`)

```ts
export type Trait = 'E' | 'A' | 'C' | 'N' | 'O'

export type GameSpec = {
  name: string
  nameKr: string
  role: 'tanker' | 'dealer' | 'healer' | 'supporter' | 'buffer'
  position?: string
  image?: string
  description: string
  big5: PersonalityScores   // 이 전문화에 가장 잘 맞는 성향의 목표값 (0~100)
  signature: Trait[]        // 이 전문화를 정의하는 특성 1~2개 (가중치 2배)
}

export type Recommendation = {
  label: string   // `${class.name}_${spec.name}` (기존 라벨 규칙 유지)
  score: number   // 0~100 정수
  reason: string  // 한 줄 추천 이유
}
```

`big5`와 `signature`는 필수 필드다. 136개 전문화 중 하나라도 빠지면 타입 검사가 실패한다.

### 4.2 역할 원형 (`recommend.ts` 상수)

역할 적합도는 A·E·N 세 특성만 쓴다. C·O는 역할이 아니라 플레이 스타일을 가르는 축으로 남겨 둔다.

| 역할 | A | E | N | 의도 |
|---|---|---|---|---|
| tanker | 65 | 80 | 25 | 앞장서고 책임지며 스트레스에 강함 |
| healer | 90 | 55 | 25 | 배려와 협력, 침착함 |
| supporter (로아) | 85 | 65 | 30 | 힐러와 유사하되 조금 더 활동적 |
| buffer (던파) | 85 | 60 | 30 | 힐러와 유사 |
| dealer | 40 | 55 | 50 | 넓은 중심값. 스타일 차이는 전문화 단계에서 냄 |

중립 성향(모두 50)은 dealer 원형에 가장 가깝고, 친화성이 높고 신경증이 낮으면 healer/supporter/buffer가, 거기에 외향성까지 높으면 tanker가 올라온다.

### 4.3 전문화 프로필 작성 원칙

역할 축(A·E·N)은 역할별 공통 범위 안에서 쓰고, 스타일 축은 전문화마다 다르게 둔다.

역할별 A·E·N 권장 범위:

| 역할 | A | E | N |
|---|---|---|---|
| tanker | 55~80 | 65~90 | 15~35 |
| healer | 80~95 | 45~75 | 15~35 |
| supporter / buffer | 75~95 | 50~80 | 20~45 |
| dealer | 20~70 | 15~90 | 20~75 |

C와 O는 모든 역할에서 20~95를 자유롭게 쓴다.

딜러를 가르는 플레이 스타일 축 5개 (Big5를 플레이 감각으로 읽은 것):

| 축 | 쓰는 특성 | 높음 | 낮음 |
|---|---|---|---|
| 복잡도 | C↑ O↑ | 긴 로테이션, 자원 관리, 공부가 필요함 (비전 법사, 악마 흑마, 잠행 도적, 소환사) | 단순하고 직관적 (야수 사냥꾼, 분노 전사, 런처) |
| 템포 | E↑ | 근접 돌진, 폭딜, 기동 (분노, 파멸, 풍운, 블레이드) | 거리 두고 꾸준히 (고통, 암살, 사격, 아르틸러리스트) |
| 변동성 수용 | N↓ | 무작위 발동과 한방 도박을 즐김 (무법 도적, 화염 법사, 버서커) | 예측 가능한 안정 딜 (냉기 법사, 사격, 소서리스) |
| 독립성 | A↓ E↓ | 펫·하수인과 혼자 노는 솔로형 (야수, 고통, 부정, 서머너) | 팀 유틸과 시너지를 챙김 (증강 기원사, 고양 주술사, 넨마스터) |
| 변칙성 | O↑ | 변신, 설치물, 괴짜 기믹 (생존 사냥꾼, 위치, 차원술사, 키메라) | 정석 (무기 전사, 런처, 그래플러) |

시그니처 특성은 그 전문화를 가장 잘 설명하는 축 1~2개를 고른다. 예: 비전 법사 `['C','O']`, 무법 도적 `['N','O']`, 분노 전사 `['E','C']`.

던파의 남/여 동명 전직 9쌍(넨마스터, 스트라이커, 브롤러, 그래플러, 레인저, 런처, 메카닉, 스핏파이어, 크루세이더)은 실제 플레이 감각 차이로 프로필을 다르게 쓴다. 예: 남넨마는 보호막·지원 성격이 강해 A를 높이고, 여스트라이커는 빠른 콤보 중심이라 E를 높인다.

### 4.4 데이터 불변 조건 (테스트로 강제)

같은 게임 안에서:

- 모든 전문화에 `big5` 5개 값이 0~100 정수로 있고 `signature`는 1~2개이며 중복이 없다.
- 완전히 같은 `big5` 프로필을 가진 전문화 쌍이 없다.
- 가장 가까운 쌍의 5차원 유클리드 거리가 10 이상이다.
- 각 전문화의 A·E·N이 4.3의 역할별 권장 범위 안에 있다.

## 5. 점수 계산 (`src/lib/recommend.ts`)

입력 `u`는 `PersonalityScores`(0~100). 특성 순서는 E, A, C, N, O.

전문화 적합도:

```
w_t   = 2  (t ∈ signature),  1 (그 외)
d     = sqrt( Σ_t w_t · (u_t − big5_t)²  /  Σ_t w_t )
specFit = max(0, 100 − d)
```

역할 적합도:

```
r     = 역할 원형 (A, E, N)
d     = sqrt( ((u_A − r_A)² + (u_E − r_E)² + (u_N − r_N)²) / 3 )
roleFit = max(0, 100 − d)
```

최종 점수:

```
score = round( ROLE_WEIGHT · roleFit + SPEC_WEIGHT · specFit )
ROLE_WEIGHT = 0.35,  SPEC_WEIGHT = 0.65
```

`recommend(game, scores)`는 그 게임의 모든 전문화에 대해 점수를 내고 내림차순으로 정렬한 `Recommendation[]`을 반환한다. 동점은 라벨 코드포인트 순으로 고정해 결과가 결정적이게 한다. 알 수 없는 게임 키는 빈 배열을 반환한다. 화면은 상위 3개만 쓴다.

상수(`ROLE_ARCHETYPES`, `SIGNATURE_WEIGHT`, `ROLE_WEIGHT`, `SPEC_WEIGHT`, 불변 조건의 최소 거리 10)는 파일 상단 한 곳에 두고, 골든 테스트가 깨지면 이 값과 프로필 데이터를 조정한다.

### 5.1 추천 이유 생성

`reason`은 전문화의 `signature` 특성과 `big5` 값의 방향(50 이상이면 높음, 미만이면 낮음)으로 만든다. 유저 값이 아니라 전문화 프로필을 기준으로 삼아 결과가 결정적이게 한다.

| 특성 | 높음 | 낮음 |
|---|---|---|
| E | 외향적이고 활동적인 | 차분하고 독립적인 |
| A | 배려심 깊고 협력적인 | 경쟁적이고 자기 주도적인 |
| C | 계획적이고 꼼꼼한 | 즉흥적이고 자유로운 |
| N | 신중하고 섬세한 | 담대하고 안정적인 |
| O | 호기심 많고 새로운 것을 즐기는 | 정석을 선호하고 확실한 것을 좋아하는 |

형식: `{구절1}, {구절2} 성향과 잘 맞아요` (시그니처가 하나면 구절 하나). 예: 비전 법사 → "계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요".

## 6. 결과 화면 변경

`ResultPageClient.tsx`:

- `predict` 호출을 `recommend(game, personalityScores)`로 바꾼다. 동기 호출이므로 `isLoadingRecommendations`, `recommendationError` 상태와 관련 분기를 없앤다.
- 결과 저장(Supabase) 흐름, 레이더 차트, 공유 링크, 다른 게임 추천 버튼은 그대로 둔다.

`RecommendationSection.tsx`:

- props에서 `isLoading`, `error`를 없애고 `recommendations: Recommendation[]`만 받는다. 빈 배열이면 기존처럼 아무것도 그리지 않는다.
- 적합도 표시를 `Math.round(score * 100)%`에서 `score%`로 바꾼다 (0~100 정수).
- 각 카드의 `spec.description` 위에 `reason`을 한 줄 더 보여 준다 (데스크톱 단상, 모바일 세로 둘 다).
- 문구: "AI 직업 추천 분석 중..." 카드와 "AI 추천 오류" 카드를 삭제한다. 축하 문구는 "축하합니다! 당신의 성향에 꼭 맞는 직업을 찾았습니다"로 바꾼다. 부제 "당신의 성격에 가장 적합한 {game} 직업 TOP 3"는 유지한다.

## 7. ONNX 정리

삭제:

- `src/lib/onnx.ts`, `src/lib/onnx.test.ts`
- `public/models/wow/`, `public/models/lostark/`, `public/models/dnf/` (model.onnx, labels.json)
- `package.json`의 `onnxruntime-web` 의존성 (`npm uninstall`로 lock 파일까지 갱신)

유지 (실데이터 재학습용):

- `src/scripts/ml/` 전체, `src/scripts/models/*/model.pth`, `src/scripts/model.pth`, `src/scripts/dummy.js`
- `src/scripts/ml/export_onnx.py`가 만드는 labels.json은 지금은 소비처가 없다. 재학습 시점에 추론 경로를 다시 설계한다.

`README.md`의 "AI 기반 직업 추천"과 "모델 및 학습" 절을 규칙 기반 설명으로 바꾸고, 학습 스크립트는 "향후 실데이터 학습용"으로 표기한다. 기술 스택 표의 ONNX 행은 그에 맞게 조정한다.

## 8. 테스트 전략

세 묶음을 `src/lib/recommend.test.ts`에 둔다 (Jest, 기존 설정 그대로).

### 8.1 데이터 불변 조건

4.4의 조건을 게임 세 개 각각에 대해 검사한다. 던파 남/여 동명 전직 9쌍이 서로 다른 프로필을 갖는지도 명시적으로 확인한다.

### 8.2 계산 단위 테스트

- `specFit`: 프로필과 같은 입력이면 100, 시그니처 특성의 차이가 비시그니처보다 거리에 더 크게 반영됨, 결과가 0~100 범위.
- `roleFit`: 중립(50) 입력은 dealer가 최고, A90·E55·N25는 healer가 최고.
- `recommend`: 내림차순 정렬, 동점 시 라벨 순, 알 수 없는 게임은 빈 배열, 반환 개수는 그 게임 전문화 수와 같음, `score`는 정수.
- `reason`: 시그니처 1개/2개, 높음/낮음 조합이 표대로 나온다.

### 8.3 골든 성향 테스트

게임마다 성향 유형을 고정하고 상위 3개의 역할과 대표 전문화를 검사한다. 프로필 값과 상수를 조정할 때 이 테스트가 기준이 된다.

와우 (E, A, C, N, O 순):

| 유형 | 입력 | 기대 |
|---|---|---|
| 힐러형 | 60, 90, 80, 20, 50 | 상위 3개 모두 healer |
| 탱커형 | 85, 65, 85, 20, 50 | 1위 tanker, 상위 3개 중 2개 이상 tanker |
| 복잡 내향 딜러 | 20, 30, 95, 50, 85 | 1위 ∈ {Mage_Arcane, Warlock_Demonology, Warlock_Affliction, Rogue_Subtlety} |
| 도박 외향 딜러 | 85, 35, 40, 20, 70 | 상위 3개 중 2개 이상 ∈ {Rogue_Outlaw, Mage_Fire, Warrior_Fury, Demon Hunter_Havoc} |
| 솔로 펫 플레이어 | 20, 50, 45, 45, 45 | 1위 ∈ {Hunter_Beast Mastery, Warlock_Affliction, Death Knight_Unholy} |
| 팀형 서포트 딜러 | 55, 80, 75, 35, 85 | 상위 3개에 Evoker_Augmentation 포함 |

로스트아크:

| 유형 | 입력 | 기대 |
|---|---|---|
| 서포터형 | 65, 90, 75, 30, 60 | 상위 3개 모두 supporter |
| 리더 탱커형 | 90, 70, 90, 20, 40 | 1위 Warrior (Male)_Warlord |
| 고속 외향 딜러 | 90, 35, 45, 30, 75 | 상위 3개 모두 dealer이고 그중 2개 이상 ∈ {Blade, Reaper, Deadeye, Gunslinger, Slayer, Striker, Battle Master, Glaivier} |
| 계획 파괴자 | 35, 45, 90, 55, 50 | 1위 ∈ {Artillerist, Summoner, Sorceress, Sharpshooter} |
| 변칙 전략가 | 55, 50, 60, 45, 95 | 상위 3개 중 2개 이상 ∈ {Soulfist, Machinist, Arcanist, Aeromancer, Wildsoul, Souleater} |

던파:

| 유형 | 입력 | 기대 |
|---|---|---|
| 버퍼형 | 60, 90, 80, 30, 50 | 1위 buffer, 상위 3개 중 2개 이상 buffer |
| 묵직한 한방 | 75, 30, 45, 70, 35 | 상위 3개 중 2개 이상 ∈ {Berserker, Demon Slayer, Vanguard, Avenger, Inquisitor} |
| 설치·지휘 전략가 | 30, 45, 90, 50, 80 | 상위 3개 중 2개 이상 ∈ {Soul Bender, Mechanic (M/F), Summoner, Elementalist, Necromancer, Dimension Walker} |
| 변칙 괴짜 | 70, 35, 40, 55, 90 | 상위 3개 중 2개 이상 ∈ {Witch, Chimera, Brawler (M/F), Traveler, Creator} |
| 정석 원거리 | 35, 50, 75, 40, 30 | 상위 3개 중 2개 이상 ∈ {Launcher (M/F), Secret Agent, Hunter, Elemental Bomber} |

기대 집합의 전문화 이름은 라벨 `${class}_${spec}`의 spec 부분으로 매칭한다 (M/F 표기는 남/여 둘 다 허용). 기대 집합은 구현 중 프로필을 작성하면서 필요하면 넓힐 수 있지만, 역할 조건(힐러형은 전부 힐러, 버퍼형은 1위 버퍼)은 바꾸지 않는다.

## 9. 손대는 파일

| 파일 | 변경 |
|---|---|
| `src/lib/types.ts` | `Trait`, `Recommendation` 추가, `GameSpec`에 `big5`, `signature` 필수 필드 |
| `src/lib/data.ts` | 136개 전문화에 `big5`, `signature` 작성 |
| `src/lib/recommend.ts` | 신규. 상수, `specFit`, `roleFit`, `buildReason`, `recommend` |
| `src/lib/recommend.test.ts` | 신규. 8절의 세 묶음 |
| `src/app/result/_components/ResultPageClient.tsx` | `predict` → `recommend`, 로딩/에러 상태 제거 |
| `src/components/molecules/RecommendationSection.tsx` | props 축소, 점수 표시, 이유 한 줄, 문구 정리 |
| `src/lib/onnx.ts`, `src/lib/onnx.test.ts`, `public/models/**` | 삭제 |
| `package.json`, `package-lock.json` | `onnxruntime-web` 제거 |
| `README.md` | 추천 방식 설명 갱신 |

## 10. 이후 과제 (이번 범위 밖)

- 실제 유저 응답이 충분히 쌓이면 역할 원형·프로필·가중치를 데이터로 보정하거나 모델을 재학습한다.
- 상위 3개의 직업(class) 중복 제한이 필요하면 정렬 후 후처리로 추가한다.
- 기존 유저가 고른 현재 직업과의 적합도를 함께 보여 주는 기능.
