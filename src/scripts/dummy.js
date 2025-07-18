/**
 * 주어진 평균과 표준 편차를 사용하여 대략적인 정규 분포를 따르는 난수를 생성합니다.
 * Box-Muller 변환을 사용하여 더 정확한 가우시안 분포를 시뮬레이션합니다.
 * @param {number} mean - 분포의 평균.
 * @param {number} stdDev - 분포의 표준 편차.
 * @returns {number} 생성된 난수.
 */
function randomGaussian(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // (0,1) 범위의 난수
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
}

/**
 * Big5 점수를 생성하고 지정된 최소/최대 값으로 클리핑합니다.
 * @param {number} baseMean - 특성의 기본 평균 점수.
 * @param {number} stdDev - 특성의 표준 편차.
 * @param {number} minVal - 점수의 최소 허용 값.
 * @param {number} maxVal - 점수의 최대 허용 값.
 * @returns {number} 반올림된 Big5 점수.
 */
function getBig5Score(baseMean, stdDev, minVal, maxVal) {
    let score = randomGaussian(baseMean, stdDev);
    return Math.round(Math.max(minVal, Math.min(maxVal, score)));
}

// 모든 Big5 점수에 대한 고정된 표준 편차 및 최소/최대 값 정의
const BIG5_STD_DEV = 10;
const BIG5_MIN_VAL = 0;
const BIG5_MAX_VAL = 100;

// 각 WoW 직업/전문화에 대한 Big5 특성 프로필 정의
// 각 특성 값은 해당 특성의 '기본 평균'을 나타냅니다.
// 실제 점수는 이 평균을 중심으로 BIG5_STD_DEV를 사용하여 생성됩니다.
const gameClassSpecsBig5Profiles = {
    "Death Knight": {
        "Blood": { role: "Tank", A: 60, C: 85, E: 85, N: 20, O: 50, desc: "그룹을 주도하고 책임감을 느끼는 리더형 탱커" },
        "Frost": { role: "DPS", A: 30, C: 80, E: 40, N: 50, O: 50, desc: "효율적인 피해량과 전략적 플레이를 선호하는 딜러" },
        "Unholy": { role: "DPS", A: 25, C: 60, E: 20, N: 50, O: 75, desc: "솔로 플레이와 복잡한 메커니즘을 즐기는 딜러" },
    },
    "Demon Hunter": {
        "Vengeance": { role: "Tank", A: 60, C: 65, E: 80, N: 25, O: 80, desc: "민첩하고 새로운 전략에 개방적인 탱커" },
        "Havoc": { role: "DPS", A: 35, C: 55, E: 50, N: 50, O: 70, desc: "빠른 판단과 높은 피해량을 선호하는 딜러" },
    },
    "Druid": {
        "Balance": { role: "DPS", A: 55, C: 60, E: 45, N: 50, O: 85, desc: "다양한 마법과 유연한 플레이를 즐기는 딜러" },
        "Feral": { role: "DPS", A: 30, C: 75, E: 25, N: 50, O: 60, desc: "은신과 정교한 공격을 선호하는 딜러" },
        "Guardian": { role: "Tank", A: 80, C: 85, E: 80, N: 20, O: 55, desc: "직관적이고 안정적인 플레이를 선호하는 탱커" },
        "Restoration": { role: "Healer", A: 90, C: 85, E: 75, N: 15, O: 50, desc: "아군을 배려하고 그룹을 지원하는 힐러" },
    },
    "Evoker": {
        "Augmentation": { role: "DPS", A: 70, C: 80, E: 50, N: 40, O: 90, desc: "독특한 지원 플레이와 새로운 전략에 개방적인 딜러" },
        "Devastation": { role: "DPS", A: 50, C: 75, E: 55, N: 50, O: 80, desc: "폭발적인 마법과 효율적인 피해량을 선호하는 딜러" },
        "Preservation": { role: "Healer", A: 85, C: 80, E: 70, N: 20, O: 50, desc: "아군을 보호하고 치유하는 데 집중하는 힐러" },
    },
    "Hunter": {
        "Beast Mastery": { role: "DPS", A: 50, C: 55, E: 20, N: 50, O: 50, desc: "솔로 플레이와 펫과의 유대를 즐기는 딜러" },
        "Marksmanship": { role: "DPS", A: 30, C: 80, E: 25, N: 50, O: 55, desc: "정밀한 사격과 쿨다운 관리를 선호하는 딜러" },
        "Survival": { role: "DPS", A: 40, C: 60, E: 40, N: 50, O: 70, desc: "덫과 폭탄을 활용하는 근접 전투를 즐기는 딜러" },
    },
    "Mage": {
        "Arcane": { role: "DPS", A: 30, C: 90, E: 20, N: 50, O: 85, desc: "복잡한 주문 로테이션과 지적인 도전을 즐기는 딜러" },
        "Fire": { role: "DPS", A: 35, C: 65, E: 50, N: 50, O: 60, desc: "폭발적인 피해와 빠른 판단을 선호하는 딜러" },
        "Frost": { role: "DPS", A: 50, C: 75, E: 25, N: 25, O: 55, desc: "안정적이고 제어 지향적인 플레이를 선호하는 딜러" },
    },
    "Monk": {
        "Brewmaster": { role: "Tank", A: 60, C: 65, E: 80, N: 20, O: 75, desc: "유연하고 기동성 있는 탱킹을 즐기는 탱커" },
        "Mistweaver": { role: "Healer", A: 85, C: 80, E: 70, N: 15, O: 50, desc: "아군을 치유하고 지원하는 데 집중하는 힐러" },
        "Windwalker": { role: "DPS", A: 35, C: 75, E: 50, N: 50, O: 70, desc: "기동성과 콤보 공격을 즐기는 근접 딜러" },
    },
    "Paladin": {
        "Holy": { role: "Healer", A: 90, C: 85, E: 75, N: 15, O: 50, desc: "신성한 힘으로 아군을 보호하고 치유하는 힐러" },
        "Protection": { role: "Tank", A: 80, C: 90, E: 85, N: 20, O: 55, desc: "정의를 수호하고 아군을 보호하는 탱커" },
        "Retribution": { role: "DPS", A: 30, C: 60, E: 55, N: 50, O: 50, desc: "강력하고 화려한 공격을 선호하는 딜러" },
    },
    "Priest": {
        "Discipline": { role: "Healer", A: 85, C: 85, E: 70, N: 20, O: 70, desc: "피해를 통해 아군을 치유하는 복잡한 플레이를 즐기는 힐러" },
        "Holy": { role: "Healer", A: 95, C: 80, E: 75, N: 15, O: 50, desc: "치유에 집중하고 아군을 지원하는 힐러" },
        "Shadow": { role: "DPS", A: 25, C: 60, E: 20, N: 70, O: 75, desc: "어둠의 힘과 지속 피해를 선호하는 딜러" },
    },
    "Rogue": {
        "Assassination": { role: "DPS", A: 20, C: 80, E: 15, N: 50, O: 55, desc: "독과 출혈을 활용한 정교한 암살을 즐기는 딜러" },
        "Outlaw": { role: "DPS", A: 35, C: 55, E: 45, N: 50, O: 70, desc: "무작위성과 기동성 있는 전투를 즐기는 딜러" },
        "Subtlety": { role: "DPS", A: 20, C: 85, E: 15, N: 50, O: 80, desc: "은신과 그림자 마법을 활용한 복잡한 플레이를 즐기는 딜러" },
    },
    "Shaman": {
        "Elemental": { role: "DPS", A: 50, C: 75, E: 25, N: 50, O: 80, desc: "원소 마법과 지속 피해를 선호하는 시전자 딜러" },
        "Enhancement": { role: "DPS", A: 55, C: 60, E: 50, N: 50, O: 60, desc: "근접 공격과 원소의 힘을 결합한 딜러" },
        "Restoration": { role: "Healer", A: 85, C: 80, E: 70, N: 15, O: 50, desc: "원소의 힘으로 아군을 치유하고 지원하는 힐러" },
    },
    "Warlock": {
        "Affliction": { role: "DPS", A: 25, C: 80, E: 15, N: 50, O: 75, desc: "지속 피해와 악마 하수인을 활용한 솔로 플레이를 즐기는 딜러" },
        "Demonology": { role: "DPS", A: 25, C: 85, E: 20, N: 50, O: 80, desc: "악마 군단을 지휘하는 전략적인 플레이를 즐기는 딜러" },
        "Destruction": { role: "DPS", A: 30, C: 75, E: 40, N: 50, O: 60, desc: "폭발적인 화염 마법과 자원 관리를 선호하는 딜러" },
    },
    "Warrior": {
        "Arms": { role: "DPS", A: 30, C: 80, E: 40, N: 50, O: 50, desc: "느리지만 강력한 공격과 전략적인 전투를 선호하는 딜러" },
        "Fury": { role: "DPS", A: 35, C: 60, E: 70, N: 50, O: 50, desc: "광란의 전투와 높은 생존력을 즐기는 딜러" },
        "Protection": { role: "Tank", A: 80, C: 95, E: 85, N: 15, O: 55, desc: "전선에서 아군을 보호하고 전투를 주도하는 탱커" },
    },
};

/*
const lostarkGameClassSpecsBig5Profiles = {
    "Warrior (Male)": {
        "Berserker": { role: "dealer", O: 40, C: 40, E: 80, A: 20, N: 40, desc: "묵직한 강타자" },
        "Warlord": { role: "tanker", O: 40, C: 90, E: 90, A: 80, N: 20, desc: "선봉장 리더" },
        "Destroyer": { role: "dealer", O: 40, C: 80, E: 60, A: 20, N: 40, desc: "묵직한 강타자" },
        "Holy Knight": { role: "supporter", O: 60, C: 80, E: 80, A: 90, N: 40, desc: "선봉장 리더/반응형 수호자" },
    },
    "Warrior (Female)": {
        "Slayer": { role: "dealer", O: 80, C: 40, E: 90, A: 40, N: 40, desc: "고속 전투가" },
        "Valkyrie": { role: "supporter", O: 60, C: 80, E: 80, A: 90, N: 40, desc: "선봉장 리더/반응형 수호자" },
    },
    "Martial Artist (Female)": {
        "Battle Master": { role: "dealer", O: 90, C: 60, E: 80, A: 40, N: 40, desc: "고속 전투가" },
        "Infighter": { role: "dealer", O: 60, C: 80, E: 80, A: 40, N: 40, desc: "묵직한 강타자" },
        "Soulfist": { role: "dealer", O: 90, C: 80, E: 60, A: 60, N: 40, desc: "비정형 전략가" },
        "Glaivier": { role: "dealer", O: 90, C: 60, E: 80, A: 40, N: 40, desc: "비정형 전략가/고속 전투가" },
    },
    "Martial Artist (Male)": {
        "Striker": { role: "dealer", O: 90, C: 60, E: 90, A: 40, N: 40, desc: "고속 전투가" },
        "Breaker": { role: "dealer", O: 40, C: 80, E: 80, A: 20, N: 40, desc: "묵직한 강타자" },
    },
    "Hunter (Male)": {
        "Deadeye": { role: "dealer", O: 90, C: 40, E: 90, A: 40, N: 40, desc: "고속 전투가" },
        "Artillerist": { role: "dealer", O: 40, C: 90, E: 40, A: 40, N: 60, desc: "계획적 파괴자" },
        "Sharpshooter": { role: "dealer", O: 80, C: 80, E: 60, A: 60, N: 60, desc: "계획적 파괴자" },
        "Machinist": { role: "dealer", O: 90, C: 80, E: 60, A: 60, N: 60, desc: "비정형 전략가" },
    },
    "Hunter (Female)": {
        "Gunslinger": { role: "dealer", O: 90, C: 40, E: 90, A: 40, N: 40, desc: "고속 전투가" },
    },
    "Mage (Female)": {
        "Bard": { role: "supporter", O: 80, C: 80, E: 80, A: 90, N: 40, desc: "반응형 수호자" },
        "Summoner": { role: "dealer", O: 60, C: 90, E: 40, A: 60, N: 60, desc: "계획적 파괴자" },
        "Arcanist": { role: "dealer", O: 90, C: 40, E: 80, A: 40, N: 40, desc: "비정형 전략가" },
        "Sorceress": { role: "dealer", O: 60, C: 90, E: 60, A: 60, N: 60, desc: "계획적 파괴자" },
    },
    "Assassin (Female)": {
        "Blade": { role: "dealer", O: 90, C: 60, E: 80, A: 20, N: 40, desc: "고속 전투가" },
        "Shadowhunter": { role: "dealer", O: 80, C: 60, E: 80, A: 20, N: 40, desc: "고속 전투가/묵직한 강타자" },
        "Reaper": { role: "dealer", O: 90, C: 40, E: 80, A: 20, N: 40, desc: "고속 전투가" },
        "Souleater": { role: "dealer", O: 90, C: 60, E: 60, A: 40, N: 40, desc: "비정형 전략가" },
    },
    "Specialist (Female)": {
        "Artist": { role: "supporter", O: 90, C: 80, E: 80, A: 90, N: 40, desc: "반응형 수호자" },
        "Aeromancer": { role: "dealer", O: 90, C: 60, E: 60, A: 60, N: 60, desc: "비정형 전략가" },
        "Wildsoul": { role: "dealer", O: 90, C: 60, E: 60, A: 60, N: 60, desc: "비정형 전략가" },
    },
};
*/

/*
const gameClassSpecsBig5Profiles = {
    "Slayer (M)": {
        "Blade Master": { role: "dealer", O: 75, C: 75, E: 75, A: 35, N: 50, desc: "숙련된 검술, 콤보, 균형" },
        "Soul Bender": { role: "dealer", O: 75, C: 90, E: 35, A: 50, N: 50, desc: "설치형, 디버프, 전략적" },
        "Berserker": { role: "dealer", O: 35, C: 35, E: 75, A: 35, N: 75, desc: "저돌적, 고위험 고수익, 단순함" },
        "Asura": { role: "dealer", O: 35, C: 75, E: 50, A: 75, N: 35, desc: "광범위, 제어, 안정적 딜링" },
        "Ghostblade": { role: "dealer", O: 75, C: 75, E: 75, A: 35, N: 50, desc: "빠른 연계, 스타일리시, 원귀 협력" },
    },
    "Slayer (F)": {
        "Sword Master": { role: "dealer", O: 90, C: 75, E: 75, A: 50, N: 50, desc: "원소 검술, 유연함, 다재다능" },
        "Demon Slayer": { role: "dealer", O: 50, C: 50, E: 75, A: 35, N: 75, desc: "강력한 한방, 파괴적, 마검" },
        "Vagabond": { role: "dealer", O: 75, C: 50, E: 90, A: 35, N: 50, desc: "화려함, 이도류, 빠른 속도" },
        "Dark Templar": { role: "dealer", O: 75, C: 90, E: 35, A: 35, N: 50, desc: "암살, 홀딩, 제어" },
        "Spectre": { role: "dealer", O: 75, C: 75, E: 75, A: 35, N: 50, desc: "빠른 연계, 스타일리시, 반응 속도" },
    },
    "Fighter (M)": {
        "Nen Master": { role: "dealer", O: 50, C: 75, E: 75, A: 75, N: 35, desc: "넨 보호막, 공수 균형, 지원" },
        "Striker": { role: "dealer", O: 50, C: 75, E: 90, A: 35, N: 50, desc: "정통파, 강력한 한방, 근접전" },
        "Brawler": { role: "dealer", O: 90, C: 35, E: 75, A: 15, N: 75, desc: "상태이상, 비열함, 변칙적" },
        "Grappler": { role: "dealer", O: 35, C: 75, E: 75, A: 35, N: 50, desc: "잡기 연계, 제압, 근접전" },
    },
    "Fighter (F)": {
        "Nen Master": { role: "dealer", O: 50, C: 75, E: 75, A: 75, N: 35, desc: "넨 개화, 공수 균형, 유틸리티" },
        "Striker": { role: "dealer", O: 50, C: 75, E: 75, A: 35, N: 50, desc: "콤보 중심, 근접전, 높은 숙련도" },
        "Brawler": { role: "dealer", O: 90, C: 35, E: 75, A: 15, N: 75, desc: "독, 상태이상, 변칙적" },
        "Grappler": { role: "dealer", O: 35, C: 75, E: 75, A: 35, N: 50, desc: "잡기 연계, 제압, 유술" },
    },
    "Gunner (M)": {
        "Ranger": { role: "dealer", O: 75, C: 75, E: 90, A: 35, N: 50, desc: "스타일리시, 높은 조작 요구, 컨트롤" },
        "Launcher": { role: "dealer", O: 35, C: 75, E: 35, A: 50, N: 35, desc: "장거리, 중화기, 포격" },
        "Mechanic": { role: "dealer", O: 75, C: 90, E: 35, A: 50, N: 50, desc: "로봇 소환, 설치형, 전략가" },
        "Spitfire": { role: "dealer", O: 90, C: 75, E: 75, A: 50, N: 50, desc: "속성탄, 전술적, 유틸리티" },
        "Blitz": { role: "dealer", O: 50, C: 50, E: 90, A: 35, N: 75, desc: "기동성, 돌진, 화력" },
    },
    "Gunner (F)": {
        "Ranger": { role: "dealer", O: 75, C: 75, E: 90, A: 35, N: 50, desc: "건블레이드, 체술, 스타일리시" },
        "Launcher": { role: "dealer", O: 35, C: 75, E: 35, A: 50, N: 35, desc: "장거리, 포격, 위치 선정" },
        "Mechanic": { role: "dealer", O: 75, C: 90, E: 35, A: 50, N: 50, desc: "G-시리즈, 로봇 소환, 지휘관" },
        "Spitfire": { role: "dealer", O: 90, C: 75, E: 90, A: 50, N: 50, desc: "공중전, 속성탄, 기동성" },
        "Paramedic": { role: "buffer", O: 50, C: 90, E: 75, A: 90, N: 35, desc: "치유, 보호, 버퍼" },
    },
    "Mage (M)": {
        "Elemental Bomber": { role: "dealer", O: 75, C: 75, E: 50, A: 35, N: 50, desc: "원소 폭격, 광역 딜링, 파괴적" },
        "Glacial Master": { role: "dealer", O: 75, C: 75, E: 75, A: 50, N: 50, desc: "얼음, 제어, 근접 마법" },
        "Blood Mage": { role: "dealer", O: 75, C: 50, E: 50, A: 35, N: 90, desc: "혈기, 흡수, 고위험" },
        "Swift Master": { role: "dealer", O: 75, C: 50, E: 90, A: 50, N: 50, desc: "바람, 기동성, 속도" },
        "Dimension Walker": { role: "dealer", O: 90, C: 90, E: 35, A: 35, N: 75, desc: "차원, 계약, 이질적" },
    },
    "Mage (F)": {
        "Elementalist": { role: "dealer", O: 75, C: 90, E: 35, A: 50, N: 50, desc: "광역 마법, 복잡한 캐스팅, 자원 관리" },
        "Summoner": { role: "dealer", O: 75, C: 90, E: 35, A: 50, N: 50, desc: "지휘, 다중 관리, 전략적" },
        "Battle Mage": { role: "dealer", O: 75, C: 75, E: 90, A: 35, N: 50, desc: "체이서, 근접 마법, 콤보" },
        "Witch": { role: "dealer", O: 90, C: 35, E: 75, A: 50, N: 75, desc: "설치물, 예측불허, 괴짜" },
        "Enchantress": { role: "buffer", O: 75, C: 75, E: 50, A: 90, N: 50, desc: "독특함, 전략적, 디버프 활용" },
    },
    "Priest (M)": {
        "Crusader": { role: "buffer", O: 35, C: 90, E: 75, A: 90, N: 35, desc: "안정적, 체계적, 파티의 중심" },
        "Monk": { role: "dealer", O: 50, C: 90, E: 75, A: 35, N: 50, desc: "빠른 연타, 콤보, 신의 주먹" },
        "Exorcist": { role: "dealer", O: 50, C: 75, E: 50, A: 50, N: 50, desc: "물리/마법, 거병, 주술" },
        "Avenger": { role: "dealer", O: 50, C: 50, E: 75, A: 35, N: 90, desc: "악마화, 변신, 파괴적" },
    },
    "Priest (F)": {
        "Crusader": { role: "buffer", O: 35, C: 90, E: 75, A: 90, N: 35, desc: "신성력, 보호, 버퍼" },
        "Inquisitor": { role: "dealer", O: 35, C: 75, E: 75, A: 15, N: 75, desc: "성화, 심판, 처단" },
        "Shaman": { role: "dealer", O: 50, C: 75, E: 50, A: 75, N: 50, desc: "부적, 신룡, 원거리 마법" },
        "Mistress": { role: "dealer", O: 50, C: 50, E: 75, A: 50, N: 75, desc: "변신, 돌진, 유틸리티" },
    },
    "Thief": {
        "Rogue": { role: "dealer", O: 75, C: 75, E: 75, A: 35, N: 50, desc: "히트엔드, 빠른 속도, 콤보" },
        "Necromancer": { role: "dealer", O: 75, C: 90, E: 35, A: 35, N: 90, desc: "발라크르, 사령술, 지휘" },
        "Kunoichi": { role: "dealer", O: 90, C: 90, E: 75, A: 35, N: 50, desc: "인법, 화염, 육도윤회" },
        "Shadow Dancer": { role: "dealer", O: 75, C: 90, E: 50, A: 15, N: 50, desc: "백어택, 암살, 그림자" },
    },
    "Knight": {
        "Elven Knight": { role: "dealer", O: 50, C: 90, E: 75, A: 75, N: 35, desc: "체인러시, 연계, 방패" },
        "Chaos": { role: "dealer", O: 75, C: 75, E: 50, A: 35, N: 75, desc: "악마 소환, 지휘, 하이브리드" },
        "Paladin": { role: "dealer", O: 35, C: 75, E: 75, A: 90, N: 35, desc: "빛, 지원, 안정성" },
        "Dragon Knight": { role: "dealer", O: 75, C: 50, E: 90, A: 50, N: 50, desc: "드래곤 탑승, 공중전, 파트너" },
    },
    "Lancer": {
        "Vanguard": { role: "dealer", O: 35, C: 50, E: 75, A: 35, N: 75, desc: "저돌적, 광역 제압, 파괴적" },
        "Skirmisher": { role: "dealer", O: 75, C: 75, E: 90, A: 35, N: 50, desc: "신기루, 빠른 속도, 대인전" },
        "Dragoon": { role: "dealer", O: 50, C: 75, E: 75, A: 35, N: 50, desc: "마수 사냥, 공중 제압, 서번트 랜스" },
        "Impaler": { role: "dealer", O: 75, C: 75, E: 50, A: 35, N: 75, desc: "어둠, 투창, 제어" },
    },
    "Agent": {
        "Secret Agent": { role: "dealer", O: 50, C: 90, E: 50, A: 35, N: 35, desc: "정밀 사격, 암살, 냉철함" },
        "Troubleshooter": { role: "dealer", O: 50, C: 50, E: 90, A: 35, N: 75, desc: "폭탄, 샷건, 광역 제압" },
        "Hitman": { role: "dealer", O: 75, C: 75, E: 90, A: 50, N: 50, desc: "스타일리시, 오로라, 팀 시너지" },
        "Specialist": { role: "dealer", O: 90, C: 75, E: 50, A: 50, N: 50, desc: "코어 에너지, 첨단 기술, 전략적" },
    },
    "Archer": {
        "Muse": { role: "buffer", O: 75, C: 75, E: 90, A: 75, N: 50, desc: "리드미컬, 높은 조작 요구, 신속함" },
        "Traveler": { role: "dealer", O: 90, C: 50, E: 90, A: 50, N: 50, desc: "자유로움, 신기루, 여행가" },
        "Hunter": { role: "dealer", O: 50, C: 75, E: 50, A: 75, N: 35, desc: "팔케, 사냥, 명사수" },
        "Vigilante": { role: "dealer", O: 75, C: 75, E: 75, A: 35, N: 75, desc: "요수화, 변신, 근접전" },
        "Chimera": { role: "dealer", O: 75, C: 30, E: 80, A: 50, N: 75, desc: "다재다능, 변형, 전략적" },
    },
    "Side Story": {
        "Dark Knight": { role: "dealer", O: 90, C: 90, E: 50, A: 35, N: 75, desc: "콤보 확장, 복잡성, 시공간" },
        "Creator": { role: "dealer", O: 90, C: 75, E: 35, A: 50, N: 50, desc: "마우스 컨트롤, 창조, 시간 왜곡" },
    },
};
*/
/**
 * World of Warcraft 직업 추천을 위한 Big5 더미 데이터를 생성합니다.
 * @param {number} numSamplesPerSpec - 각 전문화별로 생성할 샘플의 수.
 * @returns {Array<Object>} 생성된 더미 데이터 배열.
 */
function generateBig5DummyData(numSamplesPerSpec = 5) {
    const dummyData = [];

    for (const className in gameClassSpecsBig5Profiles) {
        for (const specializationName in gameClassSpecsBig5Profiles[className]) {
            const specInfo = gameClassSpecsBig5Profiles[className][specializationName];

            for (let i = 0; i < numSamplesPerSpec; i++) {
                const A = getBig5Score(specInfo.A, BIG5_STD_DEV, BIG5_MIN_VAL, BIG5_MAX_VAL);
                const C = getBig5Score(specInfo.C, BIG5_STD_DEV, BIG5_MIN_VAL, BIG5_MAX_VAL);
                const E = getBig5Score(specInfo.E, BIG5_STD_DEV, BIG5_MIN_VAL, BIG5_MAX_VAL);
                const N = getBig5Score(specInfo.N, BIG5_STD_DEV, BIG5_MIN_VAL, BIG5_MAX_VAL);
                const O = getBig5Score(specInfo.O, BIG5_STD_DEV, BIG5_MIN_VAL, BIG5_MAX_VAL);

                dummyData.push({
                    app: "wow",
                    answers: JSON.stringify({ A, C, E, N, O }),
                    class: className,
                    specialization: specializationName,
                });
            }
        }
    }
    return dummyData;
}

/**
 * CSV 필드 내의 특수 문자(쉼표, 큰따옴표, 개행)를 이스케이프하고
 * 필요한 경우 필드를 큰따옴표로 묶습니다.
 * @param {string | number | boolean} str - 이스케이프할 문자열 값.
 * @returns {string} CSV 형식에 맞게 이스케이프되고 묶인 문자열.
 */
function escapeCsvString(str) {
    // 값을 문자열로 변환
    str = String(str);
    // 쉼표, 큰따옴표, 개행 문자가 포함되어 있으면 큰따옴표로 묶고 내부 큰따옴표는 이중으로 이스케이프
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        const escapedStr = str.replace(/"/g, '""'); // 내부 큰따옴표 이스케이프
        return `"${escapedStr}"`; // 전체 문자열을 큰따옴표로 묶음
    }
    return str; // 특수 문자가 없으면 그대로 반환
}

// 데이터를 CSV 형식으로 변환하는 함수
function convertToCSV(data) {
    // 헤더를 "answers" 컬럼 하나로 변경
    const headers = ["app", "answers", "class", "specialization"];
    const csvRows = [];

    // 헤더 추가 (escapeCsvString 적용)
    csvRows.push(headers.map(header => escapeCsvString(header)).join(","));

    // 데이터 행 추가 (answers 객체를 JSON 문자열로 변환 후 이스케이프)
    data.forEach(row => {
        const values = [
            escapeCsvString(row.app),
            escapeCsvString(row.answers), // answers 객체를 JSON 문자열로 변환
            escapeCsvString(row.class),
            escapeCsvString(row.specialization)
        ];
        csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
}

// 사용 예시: 각 전문화별로 10개의 더미 데이터를 생성합니다.
const generatedDummyData = generateBig5DummyData(39000);

// 생성된 데이터를 콘솔에 JSON 형식으로 출력합니다.
// 이 데이터를 파일로 저장하거나 다른 애플리케이션에서 사용할 수 있습니다.
// node dummy.js > data.csv
console.log(convertToCSV(generatedDummyData));