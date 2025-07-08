import type { Question, TraitInfo, ResultInterpretation, AboutContent, GameClass } from '@/lib/types'

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

export const GAME_NAME = 'WoW'
export const gameClasses: GameClass[] = [
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
