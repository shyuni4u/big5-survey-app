import type { Question, TraitInfo, ResultInterpretation, AboutContent, GameClass, Game } from '@/lib/types'

export const questions: Question[] = [
  // 외향성 (Extraversion) - E
  {
    text: '나는 파티나 모임에서 분위기를 주도하는 편이다.',
    trait: 'E',
    reverse: false,
    weight: 1.2, // 활동성, 리더십을 나타내는 강한 지표
  },
  {
    text: '사람들과 함께 있을 때 에너지가 넘친다.',
    trait: 'E',
    reverse: false,
    weight: 1.5, // 외향성의 가장 핵심적인 정의
  },
  {
    text: '대화의 중심에 서는 것을 즐긴다.',
    trait: 'E',
    reverse: false,
    weight: 1.2, // 사교성, 주목성을 나타내는 강한 지표
  },
  {
    text: '새로운 사람들에게 먼저 말을 거는 것이 어렵지 않다.',
    trait: 'E',
    reverse: false,
    weight: 1.2, // 적극성, 사교성을 나타내는 강한 지표
  },
  {
    text: '혼자 조용히 시간을 보내는 것을 더 선호한다.',
    trait: 'E',
    reverse: true,
    weight: 1.5, // 내향성(외향성의 반대)의 핵심적인 정의
  },
  {
    text: '주목받는 것을 별로 좋아하지 않는다.',
    trait: 'E',
    reverse: true,
    weight: 1.2, // 내향성의 강한 지표
  },
  {
    text: '말수가 적고 과묵한 편이다.',
    trait: 'E',
    reverse: true,
    weight: 1.2, // 내향성의 강한 지표
  },
  {
    text: '대규모 사교 모임에서는 쉽게 지친다.',
    trait: 'E',
    reverse: true,
    weight: 1.5, // 내향성의 핵심적인 특징 (에너지 소모)
  },
  // 친화성 (Agreeableness) - A
  {
    text: '다른 사람들의 감정에 깊이 공감한다.',
    trait: 'A',
    reverse: false,
    weight: 1.5, // 친화성의 핵심인 '공감'을 직접적으로 측정
  },
  {
    text: '타인을 돕는 것에서 큰 기쁨을 느낀다.',
    trait: 'A',
    reverse: false,
    weight: 1.2, // 이타심을 나타내는 강한 지표
  },
  {
    text: '사람들을 신뢰하고 그들의 좋은 면을 보려고 한다.',
    trait: 'A',
    reverse: false,
    weight: 1.2, // 신뢰, 긍정성을 나타내는 강한 지표
  },
  {
    text: '갈등을 피하고 조화로운 관계를 중시한다.',
    trait: 'A',
    reverse: false,
    weight: 1.0, // 관계 조화를 나타내지만, 때로는 소극성으로도 해석될 수 있어 표준 가중치 부여
  },
  {
    text: '다른 사람의 일에 별로 관심이 없다.',
    trait: 'A',
    reverse: true,
    weight: 1.5, // 공감 부족을 직접적으로 보여주는 핵심 역문항
  },
  {
    text: '사람들의 단점을 잘 찾아내는 편이다.',
    trait: 'A',
    reverse: true,
    weight: 1.2, // 비판적, 냉소적 태도를 보여주는 강한 역문항
  },
  {
    text: '내 이익을 위해 다른 사람과 경쟁하는 것을 마다하지 않는다.',
    trait: 'A',
    reverse: true,
    weight: 1.2, // 낮은 친화성(경쟁성)을 보여주는 강한 역문항
  },
  {
    text: '때로는 다른 사람에게 무례하게 굴 때가 있다.',
    trait: 'A',
    reverse: true,
    weight: 1.0, // 직접적인 행동이지만, 상황에 따라 해석이 달라질 수 있어 표준 가중치 부여
  },
  // 성실성 (Conscientiousness) - C
  {
    text: '나는 항상 계획을 세우고 준비한다.',
    trait: 'C',
    reverse: false,
    weight: 1.2, // 계획성을 보여주는 강한 지표
  },
  {
    text: '맡은 일은 끝까지 철저하게 해낸다.',
    trait: 'C',
    reverse: false,
    weight: 1.5, // 성실성의 핵심인 '책임감', '완수'를 측정
  },
  {
    text: '주변을 항상 깔끔하게 정리정돈한다.',
    trait: 'C',
    reverse: false,
    weight: 1.2, // 체계성, 정리정돈을 나타내는 강한 지표
  },
  {
    text: '규칙을 잘 지키고 의무를 다하려고 노력한다.',
    trait: 'C',
    reverse: false,
    weight: 1.5, // '의무감', '규칙준수'라는 핵심 요소를 측정
  },
  {
    text: '물건을 제자리에 두지 않고 아무데나 두는 경향이 있다.',
    trait: 'C',
    reverse: true,
    weight: 1.2, // 낮은 체계성을 보여주는 강한 역문항
  },
  {
    text: '일을 미루다가 마감 기한에 닥쳐서 하는 경우가 많다.',
    trait: 'C',
    reverse: true,
    weight: 1.5, // 낮은 성실성(미루는 습관)의 가장 대표적인 행동
  },
  {
    text: '다소 부주의하고 실수가 잦은 편이다.',
    trait: 'C',
    reverse: true,
    weight: 1.2, // 신중함 부족을 나타내는 강한 역문항
  },
  {
    text: '즉흥적으로 행동하는 것을 좋아한다.',
    trait: 'C',
    reverse: true,
    weight: 1.0, // 낮은 계획성을 나타내지만, 개방성(O)과도 관련이 있어 표준 가중치 부여
  },
  // 신경증 (Neuroticism) - N
  {
    text: '사소한 일에도 걱정을 많이 하는 편이다.',
    trait: 'N',
    reverse: false,
    weight: 1.5, // 신경증의 핵심인 '불안', '걱정'을 직접 측정
  },
  {
    text: '스트레스를 받으면 쉽게 예민해진다.',
    trait: 'N',
    reverse: false,
    weight: 1.2, // 스트레스에 대한 민감도를 나타내는 강한 지표
  },
  {
    text: '기분 변화가 잦고 감정 기복이 심하다.',
    trait: 'N',
    reverse: false,
    weight: 1.5, // '감정의 불안정성'이라는 핵심 요소를 측정
  },
  {
    text: '종종 우울하거나 슬픈 감정을 느낀다.',
    trait: 'N',
    reverse: false,
    weight: 1.2, // 우울감을 나타내는 강한 지표
  },
  {
    text: '나는 대부분의 시간을 편안하고 안정적으로 느낀다.',
    trait: 'N',
    reverse: true,
    weight: 1.5, // 정서적 안정성(낮은 신경증)의 핵심
  },
  {
    text: '스트레스 상황에서도 침착함을 유지하는 편이다.',
    trait: 'N',
    reverse: true,
    weight: 1.2, // 스트레스 대처 능력을 보여주는 강한 역문항
  },
  {
    text: '나는 자신감이 넘치는 사람이다.',
    trait: 'N',
    reverse: true,
    weight: 1.0, // 낮은 신경증과 관련되지만, 외향성(E)과도 관련이 있어 표준 가중치 부여
  },
  {
    text: '좀처럼 화를 내거나 짜증을 내지 않는다.',
    trait: 'N',
    reverse: true,
    weight: 1.2, // 분노 조절, 낮은 적대감을 나타내는 강한 역문항
  },
  // 개방성 (Openness) - O
  {
    text: '새로운 경험이나 모험을 즐긴다.',
    trait: 'O',
    reverse: false,
    weight: 1.2, // 행동적 개방성을 나타내는 강한 지표
  },
  {
    text: '예술, 음악, 문학에 깊은 감명을 받는다.',
    trait: 'O',
    reverse: false,
    weight: 1.5, // 심미적 개방성(미적 감수성)의 핵심 지표
  },
  {
    text: '풍부한 상상력을 가지고 있고 공상에 잠기곤 한다.',
    trait: 'O',
    reverse: false,
    weight: 1.2, // 상상력, 창의성을 나타내는 강한 지표
  },
  {
    text: '추상적이거나 철학적인 아이디어에 대해 생각하는 것을 좋아한다.',
    trait: 'O',
    reverse: false,
    weight: 1.5, // 지적 개방성(지적 호기심)의 핵심 지표
  },
  {
    text: '익숙하고 예측 가능한 일상을 선호한다.',
    trait: 'O',
    reverse: true,
    weight: 1.2, // 경험에 대한 폐쇄성을 나타내는 강한 역문항
  },
  {
    text: '추상적인 개념을 이해하는 데 어려움을 느낀다.',
    trait: 'O',
    reverse: true,
    weight: 1.2, // 지적 개방성이 낮음을 보여주는 강한 역문항
  },
  {
    text: '전통적인 가치와 방식을 중요하게 생각한다.',
    trait: 'O',
    reverse: true,
    weight: 1.0, // 보수성을 나타내며, 낮은 개방성과 관련 있지만 문화적 영향도 고려하여 표준 가중치 부여
  },
  {
    text: '나의 관심 분야는 비교적 좁고 한정적이다.',
    trait: 'O',
    reverse: true,
    weight: 1.0, // 낮은 개방성의 결과일 수 있으나, 성실성(C)의 전문성과도 관련될 수 있어 표준 가중치 부여
  },
]

export const traitInfo: Record<string, TraitInfo> = {
  E: {
    name: '외향성',
    icon: '🔥',
    color: 'rgba(0, 122, 204, 0.8)', // Blue
    description: '사교성, 활동성, 긍정적 정서 수준',
  },
  A: {
    name: '친화성',
    icon: '💎',
    color: 'rgba(10, 180, 130, 0.8)', // Green
    description: '타인에 대한 공감, 협조, 신뢰 수준',
  },
  C: {
    name: '성실성',
    icon: '🛡️',
    color: 'rgba(100, 100, 220, 0.8)', // Indigo
    description: '자기 통제, 계획성, 책임감 수준',
  },
  N: {
    name: '신경증',
    icon: '⚡',
    color: 'rgba(220, 50, 50, 0.8)', // Red
    description: '부정적 정서를 경험하는 경향성',
  },
  O: {
    name: '개방성',
    icon: '⚔️',
    color: 'rgba(0, 200, 200, 0.8)', // Cyan
    description: '새로운 경험과 아이디어에 대한 호기심',
  },
}

export const resultInterpretations: Record<string, ResultInterpretation> = {
  E: {
    high: '점수가 높을수록 당신은 사교적이고, 활동적이며, 다른 사람들과의 교류에서 에너지를 얻는 경향이 있습니다. 파티나 모임의 중심에 있는 것을 즐깁니다.',
    low: '점수가 낮을수록 당신은 내향적이며, 조용하고, 혼자만의 시간을 통해 에너지를 재충전하는 경향이 있습니다. 소규모의 깊은 관계를 선호합니다.',
  },
  A: {
    high: '점수가 높을수록 당신은 타인에게 친절하고, 공감 능력이 뛰어나며, 협조적입니다. 조화로운 관계를 중요하게 생각하고 다른 사람을 돕는 것을 좋아합니다.',
    low: '점수가 낮을수록 당신은 개인의 의견을 중시하고, 경쟁적이며, 분석적이고 비판적인 시각을 가질 수 있습니다. 타인의 의견에 쉽게 동조하지 않습니다.',
  },
  C: {
    high: '점수가 높을수록 당신은 체계적이고, 책임감이 강하며, 목표 지향적입니다. 계획을 세워 일을 처리하고 신뢰할 수 있는 사람이라는 평을 듣습니다.',
    low: '점수가 낮을수록 당신은 즉흥적이고, 자유분방하며, 엄격한 계획보다는 유연한 접근을 선호합니다. 때로는 충동적으로 행동할 수 있습니다.',
  },
  N: {
    high: '점수가 높을수록 당신은 감정적으로 예민하고, 걱정이 많으며, 스트레스에 민감하게 반응할 수 있습니다. 다양한 감정을 풍부하게 경험합니다.',
    low: '점수가 낮을수록 당신은 정서적으로 안정되어 있고, 침착하며, 스트레스 상황에 잘 대처합니다. 감정의 기복이 적고 자신감이 있는 편입니다.',
  },
  O: {
    high: '점수가 높을수록 당신은 상상력이 풍부하고, 호기심이 많으며, 새로운 경험과 아이디어에 개방적입니다. 예술, 문화, 지적 탐구에 대한 관심이 높습니다.',
    low: '점수가 낮을수록 당신은 현실적이고, 실용적이며, 전통과 익숙한 것을 선호합니다. 변화보다는 안정을 추구하는 경향이 있습니다.',
  },
}

export const aboutContent: AboutContent[] = [
  {
    title: 'Big5 성격 모델이란?',
    content:
      "Big5 성격 모델은 현대 심리학에서 가장 널리 인정받는 성격 이론입니다. 이 모델은 성격을 5가지 핵심 차원(외향성, 친화성, 성실성, 신경증, 개방성)으로 설명합니다. 특정 '유형'으로 사람을 분류하는 대신, 각 개인이 5가지 차원의 스펙트럼 위 어디에 위치하는지를 보여줌으로써 성격을 더 미묘하고 다차원적으로 이해할 수 있게 돕습니다.",
  },
  {
    title: '점수는 어떻게 계산되나요?',
    content:
      "각 문항에 대한 답변은 1점에서 5점까지의 점수로 변환됩니다. 일부 문항은 '역채점' 문항으로, 점수가 반대로 계산됩니다 (예: 1점은 5점으로, 2점은 4점으로). 이는 응답 편향을 줄이고 테스트의 정확도를 높이기 위함입니다. 각 성격 특성에 해당하는 문항들의 점수를 합산하여 최종 점수가 산출되며, 이 점수는 백분율로 변환되어 다른 사람들과 비교할 수 있는 상대적인 위치를 보여줍니다.",
  },
  {
    title: '테스트 결과 활용하기',
    content:
      '이 테스트 결과는 자기 이해를 위한 훌륭한 출발점입니다. 자신의 강점과 약점을 파악하고, 대인 관계 스타일을 이해하며, 경력 개발이나 개인적인 성장 목표를 설정하는 데 도움이 될 수 있습니다. 하지만 이 결과가 당신의 모든 것을 정의하는 것은 아닙니다. 성격은 변화하고 발전할 수 있으며, 이 테스트는 그 여정을 돕는 하나의 도구임을 기억해주세요.',
  },
]

export const games: Game[] = [
  {
    id: 'DNF',
    name: '던전앤파이터',
    image: '/icons/dnf.png',
  },
  {
    id: 'LostArk',
    name: '로스트아크',
    image: '/icons/lostark.png',
  },
  {
    id: 'WoW',
    name: '와우',
    image: '/icons/wow.png',
  },
]
export const wowClasses: GameClass[] = [
  {
    name: 'Death Knight',
    nameKr: '죽음의 기사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_deathknight.jpg',
    color: '#c41f3b',
    specs: [
      {
        name: 'Blood',
        nameKr: '혈기',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_deathknight_bloodpresence.jpg',
        description: '생명력을 흡수하고 강력한 방어 기술로 아군을 보호하는 탱커 전문화입니다.',
      },
      {
        name: 'Frost',
        nameKr: '냉기',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_deathknight_frostpresence.jpg',
        description: '얼음 룬을 활용해 빠르고 강력한 근접 딜을 가하는 딜러 전문화입니다.',
      },
      {
        name: 'Unholy',
        nameKr: '부정',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_deathknight_unholypresence.jpg',
        description: '언데드 소환과 질병으로 지속 피해를 입히는 딜러 전문화입니다.',
      },
    ],
  },
  {
    name: 'Demon Hunter',
    nameKr: '악마사냥꾼',
    image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_demonhunter.jpg',
    color: '#a330c9',
    specs: [
      {
        name: 'Havoc',
        nameKr: '파멸',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_demonhunter_specdps.jpg',
        description: '양날 검과 악마의 힘을 이용해 빠르고 파괴적인 피해를 가하는 딜러입니다.',
      },
      {
        name: 'Vengeance',
        nameKr: '복수',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_demonhunter_spectank.jpg',
        description: '방어와 생존에 집중한 근접 탱커 스타일 전문화입니다.',
      },
    ],
  },
  {
    name: 'Druid',
    nameKr: '드루이드',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_druid.jpg',
    color: '#ff7d0a',
    specs: [
      {
        name: 'Balance',
        nameKr: '조화',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_nature_starfall.jpg',
        description: '자연의 힘을 이용해 광역 및 단일 대상 마법 딜을 하는 원거리 딜러입니다.',
      },
      {
        name: 'Feral',
        nameKr: '야성',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_druid_catform.jpg',
        description: '표범 형태로 빠르고 연속적인 근접 딜을 넣는 딜러입니다.',
      },
      {
        name: 'Guardian',
        nameKr: '수호',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_racial_bearform.jpg',
        description: '곰 형태로 변신해 높은 방어력과 생존력을 자랑하는 탱커입니다.',
      },
      {
        name: 'Restoration',
        nameKr: '회복',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_nature_healingtouch.jpg',
        description: '치유 마법과 재생 오라로 아군을 회복시키는 힐러 전문화입니다.',
      },
    ],
  },
  {
    name: 'Evoker',
    nameKr: '기원사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_evoker.jpg',
    color: '#33937f',
    specs: [
      {
        name: 'Augmentation',
        nameKr: '증강',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_evoker_augmentation.jpg',
        description: '증강 전문화는 아군의 능력을 강화하여 전투력을 향상시키는 독특한 지원형 딜러입니다.',
      },
      {
        name: 'Devastation',
        nameKr: '황폐',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_evoker_devastation.jpg',
        description: '황폐 전문화는 용의 불과 마법을 융합하여 강력한 마법 피해를 입히는 원거리 딜러입니다.',
      },
      {
        name: 'Preservation',
        nameKr: '보존',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/classicon_evoker_preservation.jpg',
        description: '보존 전문화는 시간과 생명의 마법을 사용하여 아군을 치유하고 보호하는 힐러입니다.',
      },
    ],
  },
  {
    name: 'Hunter',
    nameKr: '사냥꾼',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_hunter.jpg',
    color: '#abd473',
    specs: [
      {
        name: 'Beast Mastery',
        nameKr: '야수 조련',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_hunter_bestialdiscipline.jpg',
        description: '야수를 소환해 함께 싸우는 근거리/원거리 딜러입니다.',
      },
      {
        name: 'Marksmanship',
        nameKr: '사격',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_hunter_focusedaim.jpg',
        description: '활이나 총으로 강력한 단일 대상 원거리 피해를 주는 딜러입니다.',
      },
      {
        name: 'Survival',
        nameKr: '생존',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_hunter_camouflage.jpg',
        description: '트랩과 생존 기술로 근접 딜도 수행 가능한 특수 딜러입니다.',
      },
    ],
  },
  {
    name: 'Mage',
    nameKr: '마법사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_mage.jpg',
    color: '#69ccf0',
    specs: [
      {
        name: 'Arcane',
        nameKr: '비전',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_holy_magicalsentry.jpg',
        description: '비전 마법을 집중적으로 활용해 단일 대상에 강력한 마법 피해를 입히는 원거리 딜러입니다.',
      },
      {
        name: 'Fire',
        nameKr: '화염',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_fire_firebolt02.jpg',
        description: '화염 마법으로 폭발적인 피해를 입히는 광역 딜러입니다.',
      },
      {
        name: 'Frost',
        nameKr: '냉기',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_frost_frostbolt02.jpg',
        description: '냉기 마법으로 적을 둔화시키고 제어하는 데 탁월한 원거리 딜러입니다.',
      },
    ],
  },
  {
    name: 'Monk',
    nameKr: '수도사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_monk.jpg',
    color: '#00ff96',
    specs: [
      {
        name: 'Brewmaster',
        nameKr: '양조',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_monk_brewmaster_spec.jpg',
        description: '양조 수도사는 회피와 자가 치유 능력을 활용해 피해를 분산시키는 탱커입니다.',
      },
      {
        name: 'Mistweaver',
        nameKr: '운무',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_monk_mistweaver_spec.jpg',
        description: '운무 수도사는 치유 안개와 기술을 통해 아군을 회복시키는 힐러입니다.',
      },
      {
        name: 'Windwalker',
        nameKr: '풍운',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_monk_windwalker_spec.jpg',
        description: '빠른 근접 공격과 콤보 기반 기술을 사용하는 근접 딜러입니다.',
      },
    ],
  },
  {
    name: 'Paladin',
    nameKr: '성기사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_paladin.jpg',
    color: '#f58cba',
    specs: [
      {
        name: 'Holy',
        nameKr: '신성',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_holy_holybolt.jpg',
        description: '빛의 힘으로 아군을 치유하고 지원하는 힐러입니다.',
      },
      {
        name: 'Protection',
        nameKr: '보호',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_paladin_shieldofthetemplar.jpg',
        description: '강력한 방패와 축복으로 아군을 지키는 탱커입니다.',
      },
      {
        name: 'Retribution',
        nameKr: '징벌',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_holy_auraoflight.jpg',
        description: '빛의 심판으로 적을 처단하는 근접 딜러입니다.',
      },
    ],
  },
  {
    name: 'Priest',
    nameKr: '사제',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_priest.jpg',
    color: '#ffffff',
    specs: [
      {
        name: 'Discipline',
        nameKr: '수양',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_holy_powerwordshield.jpg',
        description: '공격과 방어를 병행하며 아군을 치유하는 하이브리드 힐러입니다.',
      },
      {
        name: 'Holy',
        nameKr: '신성',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_holy_guardianspirit.jpg',
        description: '빛의 마법으로 아군을 치유하고 보호하는 순수 힐러입니다.',
      },
      {
        name: 'Shadow',
        nameKr: '암흑',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_shadow_shadowwordpain.jpg',
        description: '어둠의 힘으로 정신 공격과 도트를 사용하는 원거리 딜러입니다.',
      },
    ],
  },
  {
    name: 'Rogue',
    nameKr: '도적',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_rogue.jpg',
    color: '#fff569',
    specs: [
      {
        name: 'Assassination',
        nameKr: '암살',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_rogue_deadlybrew.jpg',
        description: '독과 출혈로 적을 서서히 죽이는 도트 기반 근접 딜러입니다.',
      },
      {
        name: 'Outlaw',
        nameKr: '무법',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_rogue_waylay.jpg',
        description: '적의 허점을 찔러 빠르게 피해를 입히는 공격적인 근접 딜러입니다.',
      },
      {
        name: 'Subtlety',
        nameKr: '잠행',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_stealth.jpg',
        description: '은신과 급습을 활용해 빠르게 적을 처치하는 암살형 딜러입니다.',
      },
    ],
  },
  {
    name: 'Shaman',
    nameKr: '주술사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_shaman.jpg',
    color: '#0070de',
    specs: [
      {
        name: 'Elemental',
        nameKr: '정기',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_nature_lightning.jpg',
        description: '자연의 힘으로 원거리에서 마법 피해를 입히는 딜러입니다.',
      },
      {
        name: 'Enhancement',
        nameKr: '고양',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_shaman_improvedstormstrike.jpg',
        description: '근접 무기를 강화해 강력한 공격을 퍼붓는 근접 딜러입니다.',
      },
      {
        name: 'Restoration',
        nameKr: '복원',
        role: 'healer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_nature_magicimmunity.jpg',
        description: '토템과 자연 마법을 통해 아군을 치유하는 힐러입니다.',
      },
    ],
  },
  {
    name: 'Warlock',
    nameKr: '흑마법사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_warlock.jpg',
    color: '#9482c9',
    specs: [
      {
        name: 'Affliction',
        nameKr: '고통',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_shadow_deathcoil.jpg',
        description: '어둠의 저주와 도트로 적을 서서히 괴롭히는 마법 딜러입니다.',
      },
      {
        name: 'Demonology',
        nameKr: '악마',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_shadow_metamorphosis.jpg',
        description: '악마를 소환하고 조종해 싸우는 펫 기반 딜러입니다.',
      },
      {
        name: 'Destruction',
        nameKr: '파괴',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/spell_shadow_rainoffire.jpg',
        description: '폭발적인 마법으로 강력한 피해를 입히는 원거리 딜러입니다.',
      },
    ],
  },
  {
    name: 'Warrior',
    nameKr: '전사',
    image: 'https://render.worldofwarcraft.com/us/icons/56/class_warrior.jpg',
    color: '#c79c6e',
    specs: [
      {
        name: 'Arms',
        nameKr: '무기',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_warrior_savageblow.jpg',
        description: '대검이나 도끼를 활용한 강력한 일격이 특징인 근접 딜러입니다.',
      },
      {
        name: 'Fury',
        nameKr: '분노',
        role: 'dealer',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_warrior_innerrage.jpg',
        description: '이중 무기를 휘둘러 연속적인 피해를 입히는 광전사 스타일 딜러입니다.',
      },
      {
        name: 'Protection',
        nameKr: '방어',
        role: 'tanker',
        image: 'https://render.worldofwarcraft.com/us/icons/56/ability_warrior_defensivestance.jpg',
        description: '방패와 전투 기술로 적의 공격을 막아내는 튼튼한 탱커입니다.',
      },
    ],
  },
]

export const lostarkClasses: GameClass[] = [
  {
    name: 'Assassin (Female)',
    nameKr: '암살자 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-assassin.png',
    color: '#7b48a3',
    specs: [
      {
        name: 'Blade',
        nameKr: '블레이드',
        role: 'dealer',
        image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Blade-border.png',
        description: '세 자루의 검을 사용하여 혼돈의 힘을 제어하며 적들을 빠르고 현란하게 공격합니다.',
      },
      {
        name: 'Reaper',
        nameKr: '리퍼',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Reaper-border.png',
        description: '단검과 그림자 기술을 사용하여 적의 배후를 노리는 암살의 귀재입니다.',
      },
      {
        name: 'Shadowhunter',
        nameKr: '데모닉',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Demonic-border.png',
        description: '내재된 악마의 힘을 해방하여 파괴적인 힘으로 적들을 섬멸합니다.',
      },
      {
        name: 'Souleater',
        nameKr: '소울이터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Souleater-border.png',
        description: '거대한 낫을 사용하여 망자의 영혼을 베고, 그 힘을 흡수하여 강력한 공격을 펼칩니다.',
      },
    ],
  },
  {
    name: 'Hunter (Female)',
    nameKr: '헌터 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-hunter_female.png',
    color: '#7199a9',
    specs: [
      {
        name: 'Gunslinger',
        nameKr: '건슬링어',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Gunslinger-border.png',
        description: '세 가지 총기를 사용하여 전장을 지배하는 민첩하고 치명적인 여성 명사수입니다.',
      },
    ],
  },
  {
    name: 'Hunter (Male)',
    nameKr: '헌터 (남)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-hunter_male.png',
    color: '#7199a9',
    specs: [
      {
        name: 'Artillerist',
        nameKr: '블래스터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Blaster-border.png',
        description: '거대한 메카닉 런처와 중화기를 사용하여 막강한 화력을 퍼붓는 포격 전문가입니다.',
      },
      {
        name: 'Deadeye',
        nameKr: '데빌헌터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Devilhunter-border.png',
        description: '세 가지 총기를 자유자재로 바꾸며 스타일리시한 전투를 펼치는 명사수입니다.',
      },
      {
        name: 'Machinist',
        nameKr: '스카우터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Scouter-border.png',
        description: '최첨단 드론과 합작하여 전투를 펼치며, 하이퍼 싱크 상태로 변신할 수 있습니다.',
      },
      {
        name: 'Sharpshooter',
        nameKr: '호크아이',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Hawkeye-border.png',
        description: '기계 활과 특수 화살을 사용하여 민첩하고 정교한 공격을 하는 명궁입니다.',
      },
    ],
  },
  {
    name: 'Mage (Female)',
    nameKr: '마법사 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-magician.png',
    color: '#a371b8',
    specs: [
      {
        name: 'Bard',
        nameKr: '바드',
        role: 'supporter',
        image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Bard-border.png',
        description: '신성한 하프 연주로 아군을 치유하고 적을 공격하는 선율의 지휘자입니다.',
      },
      {
        name: 'Summoner',
        nameKr: '서머너',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Summoner-border.png',
        description: '다양한 정령을 소환하여 함께 전투를 벌이는 강력한 원소 마법사입니다.',
      },
      {
        name: 'Arcanist',
        nameKr: '아르카나',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Arcana-border.png',
        description: '마법이 깃든 카드를 사용하여 변칙적이고 화려한 공격을 구사합니다.',
      },
      {
        name: 'Sorceress',
        nameKr: '소서리스',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Sorceress-border.png',
        description: '강력한 원소 마법으로 넓은 범위의 적들을 한 번에 쓸어버리는 정통 마법사입니다.',
      },
    ],
  },
  {
    name: 'Martial Artist (Female)',
    nameKr: '무도가 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-fighter_female.png',
    color: '#c1834c',
    specs: [
      {
        name: 'Battle Master',
        nameKr: '배틀마스터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Battlemaster-border.png',
        description: '빠른 몸놀림과 강력한 연계기로 적을 몰아붙이는 근접 전투의 달인입니다.',
      },
      {
        name: 'Glaivier',
        nameKr: '창술사',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Lancemaster-border.png',
        description: '창과 언월도를 자유자재로 바꾸며 예측불허의 공격을 구사합니다.',
      },
      {
        name: 'Infighter',
        nameKr: '인파이터',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Infighter-border.png',
        description: '묵직한 헤비 건틀렛을 사용하여 파괴적인 충격 에너지를 적에게 쏟아붓습니다.',
      },
      {
        name: 'Soulfist',
        nameKr: '기공사',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Soulmaster-border.png',
        description: '내공을 활용하여 근거리와 원거리를 오가며 다채로운 공격을 펼칩니다.',
      },
    ],
  },
  {
    name: 'Martial Artist (Male)',
    nameKr: '무도가 (남)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-fighter_male.png',
    color: '#c1834c',
    specs: [
      {
        name: 'Breaker',
        nameKr: '브레이커',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Breaker-border.png',
        description: '헤비 건틀렛을 사용하며, 묵직하고 강력한 한 방으로 모든 것을 파괴합니다.',
      },
      {
        name: 'Striker',
        nameKr: '스트라이커',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Striker-border.png',
        description: '강력한 발차기와 번개 같은 움직임으로 적을 제압하는 남성 무도가입니다.',
      },
    ],
  },
  {
    name: 'Specialist (Female)',
    nameKr: '스페셜리스트 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-specialist.png',
    color: '#e8ab5a',
    specs: [
      {
        name: 'Artist',
        nameKr: '도화가',
        role: 'supporter',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Artist-border.png',
        description: '환영의 힘이 담긴 붓으로 아군을 돕거나 적을 공격하는 전략적인 서포터입니다.',
      },
      {
        name: 'Aeromancer',
        nameKr: '기상술사',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Aeromancer-border.png',
        description: '우산을 사용하여 날씨를 자유자재로 바꾸며 다채로운 스킬을 구사합니다.',
      },
      {
        name: 'Wildsoul',
        nameKr: '환수사',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Wildsoul-border.png',
        description: '환수의 힘이 봉인된 두루마리를 바탕으로 환수를 소환하거나 환수로 변신하여 전투를 펼칩니다.',
      },
    ],
  },
  {
    name: 'Warrior (Female)',
    nameKr: '전사 (여)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-warrior.png',
    color: '#a45141',
    specs: [
      {
        name: 'Slayer',
        nameKr: '슬레이어',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Slayer-border.png',
        description: '대검을 사용하는 호쾌한 스타일의 여성 전사로, 적을 무자비하게 베어버립니다.',
      },
      {
        name: 'Valkyrie',
        nameKr: '발키리',
        role: 'supporter',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Valkyrie-border.png',
        description: '빛의 힘으로 아군을 치유하고 전장을 이끄는 서포트형 클래스입니다.',
      },
    ],
  },
  {
    name: 'Warrior (Male)',
    nameKr: '전사 (남)',
    image: 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-warrior.png',
    color: '#a45141',
    specs: [
      {
        name: 'Berserker',
        nameKr: '버서커',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Berserker-border.png',
        description: '거대한 대검을 사용하여 적을 섬멸하는 분노의 화신입니다.',
      },
      {
        name: 'Destroyer',
        nameKr: '디스트로이어',
        role: 'dealer',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Destroyer-border.png',
        description: '강력한 중력 해머로 적을 분쇄하는 파괴적인 전사입니다.',
      },
      {
        name: 'Holy Knight',
        nameKr: '홀리나이트',
        role: 'supporter',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Holyknight-border.png',
        description: '신념의 검과 신앙의 힘으로 아군을 지원하고 전장을 이끄는 서포터입니다.',
      },
      {
        name: 'Warlord',
        nameKr: '워로드',
        role: 'tanker',
        image:
          'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/information/class/mark-Warlord-border.png',
        description: '건랜스와 방패를 이용해 아군을 보호하고 전장을 지휘하는 든든한 방패입니다.',
      },
    ],
  },
]

export const dnfClasses: GameClass[] = [
  // 총검사
  {
    name: 'Agent',
    nameKr: '총검사',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_14.png',
    color: '#7b7268',
    specs: [
      {
        name: 'Hitman',
        nameKr: '히트맨',
        role: 'dealer',
        position: '-400px 0',
        description: '장도와 SMG를 이용해 적을 섬멸하는 총검사',
      },
      {
        name: 'Secret Agent',
        nameKr: '요원',
        role: 'dealer',
        position: '0 0',
        description: '빠르고 절도있는 총검술을 활용하는 비밀 요원',
      },
      {
        name: 'Specialist',
        nameKr: '스페셜리스트',
        role: 'dealer',
        position: '-600px 0',
        description: '코어 에너지를 활용하여 적을 무력화시키는 전문가',
      },
      {
        name: 'Troubleshooter',
        nameKr: '트러블 슈터',
        role: 'dealer',
        position: '-200px 0',
        description: '총검과 샷건, 폭탄으로 적을 제압하는 전장의 해결사',
      },
    ],
  },
  // 아처
  {
    name: 'Archer',
    nameKr: '아처',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_16.png',
    color: '#83d3c3',
    specs: [
      {
        name: 'Chimera',
        nameKr: '키메라',
        role: 'dealer',
        position: '-800px 0',
        description: '요수화의 힘을 극한으로 제어하여, 근접 전투에서 강력한 힘을 발휘하는 전사',
      },
      {
        name: 'Hunter',
        nameKr: '헌터',
        role: 'dealer',
        position: '-400px 0',
        description: "매의 형상을 한 기계 '팔케'와 함께 전장을 누비며 적을 사냥하는 명사수",
      },
      {
        name: 'Muse',
        nameKr: '뮤즈',
        role: 'buffer',
        position: '-200px 0',
        description: '활을 악기처럼 연주하여 아군에게 강력한 버프를 제공하는 음악가이자 버퍼',
      },
      {
        name: 'Traveler',
        nameKr: '트래블러',
        role: 'dealer',
        position: '-200px 0',
        description: '신비한 힘이 깃든 도구를 활용하여 화려하고 강력한 공격을 하는 자유로운 여행가',
      },
      {
        name: 'Vigilante',
        nameKr: '비질란테',
        role: 'dealer',
        position: '-600px 0',
        description: '인간과 요수의 힘을 동시에 사용하여 변칙적인 근접 공격을 펼치는 추격자',
      },
    ],
  },
  // 격투가 (여)
  {
    name: 'Fighter (F)',
    nameKr: '격투가 (여)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_04.png',
    color: '#e29412',
    specs: [
      {
        name: 'Brawler',
        nameKr: '스트리트파이터',
        role: 'dealer',
        position: '-400px 0',
        description: '이기기 위한 싸움에 특화되어 독, 바늘 등 다양한 암기와 도구를 사용',
      },
      {
        name: 'Grappler',
        nameKr: '그래플러',
        role: 'dealer',
        position: '-600px 0',
        description: '강력한 잡기 기술을 연계하여 적을 제압하는 데 특화된 유술가',
      },
      {
        name: 'Nen Master',
        nameKr: '넨마스터',
        role: 'dealer',
        position: '0px 0',
        description: '넨의 힘을 다루어 아군을 보호하고, 빛의 힘으로 적을 공격하는 격투가',
      },
      {
        name: 'Striker',
        nameKr: '스트라이커',
        role: 'dealer',
        position: '-200px 0',
        description: '극한의 단련을 통해 강력한 발차기와 일격 필살의 기술을 사용하는 정통파 격투가',
      },
    ],
  },
  // 격투가 (남)
  {
    name: 'Fighter (M)',
    nameKr: '격투가 (남)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_03.png',
    color: '#c97811',
    specs: [
      {
        name: 'Brawler',
        nameKr: '스트리트파이터',
        role: 'dealer',
        position: '-400px 0',
        description: '살아남기 위해 수단과 방법을 가리지 않는 뒷골목 싸움의 달인',
      },
      {
        name: 'Grappler',
        nameKr: '그래플러',
        role: 'dealer',
        position: '-600px 0',
        description: '강력한 잡기 기술로 적에게 반격의 틈을 주지 않고 제압하는 유술가',
      },
      {
        name: 'Nen Master',
        nameKr: '넨마스터',
        role: 'dealer',
        position: '0 0',
        description: '넨의 힘으로 아군을 보호하고 빛의 힘으로 적을 공격하는 격투가',
      },
      {
        name: 'Striker',
        nameKr: '스트라이커',
        role: 'dealer',
        position: '-200px 0',
        description: '자신의 몸을 극한까지 단련하여 빠르고 강력한 타격을 하는 정통파 격투가',
      },
    ],
  },
  // 거너 (여)
  {
    name: 'Gunner (F)',
    nameKr: '거너 (여)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_06.png',
    color: '#a1a5ad',
    specs: [
      {
        name: 'Launcher',
        nameKr: '런처',
        role: 'dealer',
        position: '-200px 0',
        description: '남성 런처보다 가볍고 빠르게 중화기를 운용하며 전장을 지배',
      },
      {
        name: 'Mechanic',
        nameKr: '메카닉',
        role: 'dealer',
        position: '-400px 0',
        description: 'G-시리즈라 불리는 특수 로봇을 운용하여 전투를 효율적으로 이끄는 지휘관',
      },
      {
        name: 'Paramedic',
        nameKr: '패러메딕',
        role: 'buffer',
        position: '-800px 0',
        description: '아군을 치유하고 보호하는 능력을 갖춘 의무병이자 버퍼',
      },
      {
        name: 'Ranger',
        nameKr: '레인저',
        role: 'dealer',
        position: '0 0',
        description: '건블레이드를 활용한 체술과 리볼버 사격술을 구사하는 무법지대의 황녀',
      },
      {
        name: 'Spitfire',
        nameKr: '스핏파이어',
        role: 'dealer',
        position: '-600px 0',
        description: '공중에서 니트로 모터를 활용하여 다양한 속성의 탄환으로 적을 섬멸',
      },
    ],
  },
  // 거너 (남)
  {
    name: 'Gunner (M)',
    nameKr: '거너 (남)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_05.png',
    color: '#848a93',
    specs: [
      {
        name: 'Blitz',
        nameKr: '어썰트',
        role: 'dealer',
        position: '-800px 0',
        description: '개조된 신체를 바탕으로 한 기동성과 강력한 화력을 동시에 갖춘 특수 요원',
      },
      {
        name: 'Launcher',
        nameKr: '런처',
        role: 'dealer',
        position: '-200px 0',
        description: '핸드캐논, 레이저 라이플 등 각종 중화기를 이용하여 전장을 초토화',
      },
      {
        name: 'Mechanic',
        nameKr: '메카닉',
        role: 'dealer',
        position: '-400px 0',
        description: '다양한 로봇과 기계 장치를 소환하여 전투를 유리하게 이끄는 전략가',
      },
      {
        name: 'Ranger',
        nameKr: '레인저',
        role: 'dealer',
        position: '0 0',
        description: '리볼버를 이용한 빠른 사격과 화려한 체술을 결합하여 적을 제압',
      },
      {
        name: 'Spitfire',
        nameKr: '스핏파이어',
        role: 'dealer',
        position: '-600px 0',
        description: '다양한 종류의 탄환을 사용하여 전술적인 원거리 공격을 수행',
      },
    ],
  },
  // 나이트
  {
    name: 'Knight',
    nameKr: '나이트',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_12.png',
    color: '#f4c3c3',
    specs: [
      {
        name: 'Chaos',
        nameKr: '카오스',
        role: 'dealer',
        position: '-200px 0',
        description: '악마의 피를 가진 반인반마 기사',
      },
      {
        name: 'Dragon Knight',
        nameKr: '드래곤나이트',
        role: 'dealer',
        position: '-600px 0',
        description: '드래곤과 함께 전장을 누비는 용기사',
      },
      {
        name: 'Elven Knight',
        nameKr: '엘븐나이트',
        role: 'dealer',
        position: '0 0',
        description: '자연으로부터 강력한 힘을 부여 받은 요정 기사',
      },
      {
        name: 'Paladin',
        nameKr: '팔라딘',
        role: 'dealer',
        position: '-400px 0',
        description: '빛의 힘을 부여 받은 신념의 수호 기사',
      },
    ],
  },
  // 마창사
  {
    name: 'Lancer',
    nameKr: '마창사',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_13.png',
    color: '#49448a',
    specs: [
      {
        name: 'Dragoon',
        nameKr: '드래고니안 랜서',
        role: 'dealer',
        position: '-400px 0',
        description: '서번트 랜스를 활용하여 마수를 사냥하는 마수 사냥꾼',
      },
      {
        name: 'Impaler',
        nameKr: '다크 랜서',
        role: 'dealer',
        position: '-600px 0',
        description: '마창의 기운에 투창술을 접목하여 사용하는 마창사',
      },
      {
        name: 'Skirmisher',
        nameKr: '듀얼리스트',
        role: 'dealer',
        position: '-200px 0',
        description: '마창의 힘을 대인 전투에 특화시킨 창술의 달인',
      },
      {
        name: 'Vanguard',
        nameKr: '뱅가드',
        role: 'dealer',
        position: '0 0',
        description: '늘 전투의 최전방에서 다수의 적과 싸우며 파괴하는 마창사',
      },
    ],
  },
  // 마법사 (여)
  {
    name: 'Mage (F)',
    nameKr: '마법사 (여)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_08.png',
    color: '#a965c8',
    specs: [
      {
        name: 'Battle Mage',
        nameKr: '배틀메이지',
        role: 'dealer',
        position: '-400px 0',
        description: '체술과 마법을 결합하여 빠르고 현란한 근접 전투를 펼치는 전투 마법사',
      },
      {
        name: 'Elementalist',
        nameKr: '엘레멘탈마스터',
        role: 'dealer',
        position: '0 0',
        description: '불, 물, 빛, 어둠의 4대 원소 마법을 극한까지 연마한 정통 마법사',
      },
      {
        name: 'Enchantress',
        nameKr: '인챈트리스',
        role: 'buffer',
        position: '-800px 0',
        description: '저주와 인형술을 사용하여 아군의 능력을 극대화하고 적을 약화시키는 버퍼',
      },
      {
        name: 'Summoner',
        nameKr: '소환사',
        role: 'dealer',
        position: '-200px 0',
        description: '다양한 정령과 계약하여 강력한 소환수 군단을 이끌고 전투에 임함',
      },
      {
        name: 'Witch',
        nameKr: '마도학자',
        role: 'dealer',
        position: '-600px 0',
        description: '다양한 연금술과 마법 기계들을 활용하여 예측 불허의 공격을 하는 괴짜 마법사',
      },
    ],
  },
  // 마법사 (남)
  {
    name: 'Mage (M)',
    nameKr: '마법사 (남)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_07.png',
    color: '#3466cb',
    specs: [
      {
        name: 'Blood Mage',
        nameKr: '블러드 메이지',
        role: 'dealer',
        position: '-400px 0',
        description: '생명의 근원인 혈기를 흡수하고 조종하여 강력한 힘을 발휘하는 마법사',
      },
      {
        name: 'Dimension Walker',
        nameKr: '디멘션워커',
        role: 'dealer',
        position: '-800px 0',
        description: '차원의 저편에서 불가사의한 존재와 계약하여 그 힘을 빌려 싸우는 마법사',
      },
      {
        name: 'Elemental Bomber',
        nameKr: '엘레멘탈 바머',
        role: 'dealer',
        position: '0 0',
        description: '마법의 힘을 원소 구슬 형태로 압축하여 파괴적인 마법 공격을 하는 마법사',
      },
      {
        name: 'Glacial Master',
        nameKr: '빙결사',
        role: 'dealer',
        position: '-200px 0',
        description: '얼음 무기를 생성하여 근접전을 벌이고 강력한 냉기 마법으로 적을 얼리는 마법사',
      },
      {
        name: 'Swift Master',
        nameKr: '스위프트 마스터',
        role: 'dealer',
        position: '-600px 0',
        description: '바람의 힘을 이용하여 전장을 빠르게 이동하며 강력한 돌풍으로 적을 섬멸하는 마법사',
      },
    ],
  },
  // 프리스트 (여)
  {
    name: 'Priest (F)',
    nameKr: '프리스트 (여)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_10.png',
    color: '#f0b5d4',
    specs: [
      {
        name: 'Crusader',
        nameKr: '크루세이더',
        role: 'buffer',
        position: '0 0',
        description: '신성력을 바탕으로 아군을 보호하고 적을 섬멸하는 신앙심 깊은 프리스트',
      },
      {
        name: 'Inquisitor',
        nameKr: '이단심판관',
        role: 'dealer',
        position: '-200px 0',
        description: '거병과 성화를 이용하여 이단들을 처단하는 냉혹한 심판관',
      },
      {
        name: 'Mistress',
        nameKr: '미스트리스',
        role: 'dealer',
        position: '-600px 0',
        description: '원죄의 힘을 자유자재로 다루며 타락의 낫으로 적의 영혼을 거두는 자',
      },
      {
        name: 'Shaman',
        nameKr: '무녀',
        role: 'dealer',
        position: '-400px 0',
        description: '신룡의 힘을 빌어 적을 물리치고 아군에게 신탁을 내려주는 신녀',
      },
    ],
  },
  // 프리스트 (남)
  {
    name: 'Priest (M)',
    nameKr: '프리스트 (남)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_09.png',
    color: '#c4a66a',
    specs: [
      {
        name: 'Avenger',
        nameKr: '어벤저',
        role: 'dealer',
        position: '-600px 0',
        description: '악을 처단하기 위해 악마의 힘을 받아들여 파괴적인 악마로 변신하여 싸움',
      },
      {
        name: 'Crusader',
        nameKr: '크루세이더',
        role: 'buffer',
        position: '0 0',
        description: '신성한 빛의 힘으로 아군을 치유하고 강력한 버프를 제공하는 파티의 수호자',
      },
      {
        name: 'Exorcist',
        nameKr: '퇴마사',
        role: 'dealer',
        position: '-400px 0',
        description: '거대한 무기와 주술을 사용하여 마물을 퇴치하는 전투 프리스트',
      },
      {
        name: 'Monk',
        nameKr: '인파이터',
        role: 'dealer',
        position: '-200px 0',
        description: '신체를 극한까지 단련하여 신의 힘을 실은 주먹으로 적을 섬멸하는 권격가',
      },
    ],
  },
  // 외전
  {
    name: 'Side Story',
    nameKr: '외전',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_15.png',
    color: '#6e7a7a',
    specs: [
      {
        name: 'Creator',
        nameKr: '크리에이터',
        role: 'dealer',
        position: '-200px 0',
        description: '마우스를 이용해 사물을 생성, 소멸시키며 시공간을 제어하는 마법사',
      },
      {
        name: 'Dark Knight',
        nameKr: '다크나이트',
        role: 'dealer',
        position: '0 0',
        description: '모든 귀검사의 힘을 흡수하여 시공의 틈을 넘나드는 존재',
      },
    ],
  },
  // 귀검사 (여)
  {
    name: 'Slayer (F)',
    nameKr: '귀검사 (여)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_02.png',
    color: '#d14335',
    specs: [
      {
        name: 'Dark Templar',
        nameKr: '다크템플러',
        role: 'dealer',
        position: '-600px 0',
        description: '암흑의 힘을 이용하여 적을 속박하고 무력화시키는 데 능한 암살자형 검사',
      },
      {
        name: 'Demon Slayer',
        nameKr: '데몬슬레이어',
        role: 'dealer',
        position: '-200px 0',
        description: '마인의 힘이 깃든 마검을 사용하여 파괴적인 공격을 하는 검사',
      },
      {
        name: 'Spectre',
        nameKr: '블레이드',
        role: 'dealer',
        position: '-800px 0',
        description: '빠른 납도술과 와이어를 이용해 전장을 누비는 스타일리시한 전투가 특징',
      },
      {
        name: 'Sword Master',
        nameKr: '소드마스터',
        role: 'dealer',
        position: '0 0',
        description: '마법의 힘을 검술에 접목하여 4대 원소의 힘을 자유자재로 사용하는 마검사',
      },
      {
        name: 'Vagabond',
        nameKr: '베가본드',
        role: 'dealer',
        position: '-400px 0',
        description: '내공을 활용하여 보조무기인 광검을 다루며 화려한 이도류 검술을 사용',
      },
    ],
  },
  // 귀검사 (남)
  {
    name: 'Slayer (M)',
    nameKr: '귀검사 (남)',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_01.png',
    color: '#a42c23',
    specs: [
      {
        name: 'Asura',
        nameKr: '아수라',
        role: 'dealer',
        position: '-600px 0',
        description: '파동의 힘을 느끼기 위해 스스로 시력을 포기한 귀검사',
      },
      {
        name: 'Berserker',
        nameKr: '버서커',
        role: 'dealer',
        position: '-400px 0',
        description: '강력한 힘을 위해 부작용을 감수하며 카잔증후군을 받아들인 귀검사',
      },
      {
        name: 'Blade Master',
        nameKr: '웨펀마스터',
        role: 'dealer',
        position: '0 0',
        description: '귀수에 깃든 귀신을 억누르며 검술 연마에 매진하는 귀검사',
      },
      {
        name: 'Ghostblade',
        nameKr: '검귀',
        role: 'dealer',
        position: '-800px 0',
        description: '자신의 원귀와 협력하여 빠르고 화려한 연계 공격을 구사하는 귀검사',
      },
      {
        name: 'Soul Bender',
        nameKr: '소울브링어',
        role: 'dealer',
        position: '-200px 0',
        description: '귀신과 소통함으로써 그 힘을 활용할 수 있게 된 귀검사',
      },
    ],
  },
  // 도적
  {
    name: 'Thief',
    nameKr: '도적',
    image: 'https://bbscdn.df.nexon.com/pg/characters/img/thum/thum_char_11.png',
    color: '#a089bd',
    specs: [
      {
        name: 'Kunoichi',
        nameKr: '쿠노이치',
        role: 'dealer',
        position: '-400px 0',
        description: '인법을 사용하여 화려한 육체 기술과 강력한 화염술을 구사하는 닌자',
      },
      {
        name: 'Necromancer',
        nameKr: '사령술사',
        role: 'dealer',
        position: '-200px 0',
        description: '망자의 원혼을 소환하고 발라크르의 힘을 빌려 적을 섬멸하는 흑마법의 대가',
      },
      {
        name: 'Rogue',
        nameKr: '로그',
        role: 'dealer',
        position: '0px 0',
        description: '날렵한 몸놀림을 바탕으로 단검과 쌍검을 사용하여 적의 배후를 노리는 도적',
      },
      {
        name: 'Shadow Dancer',
        nameKr: '섀도우댄서',
        role: 'dealer',
        position: '-600px 0',
        description: '그림자 속에 숨어 적의 배후를 급습하여 치명적인 암살 기술을 사용하는 암살자',
      },
    ],
  },
]

export const getGameClasses = (game: string) => {
  switch (game.toLowerCase()) {
    case 'dnf':
      return dnfClasses
    case 'lostark':
      return lostarkClasses
    case 'wow':
      return wowClasses
    default:
      return []
  }
}
