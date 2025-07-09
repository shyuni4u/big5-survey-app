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
const wowClassSpecsBig5Profiles = {
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

/**
 * World of Warcraft 직업 추천을 위한 Big5 더미 데이터를 생성합니다.
 * @param {number} numSamplesPerSpec - 각 전문화별로 생성할 샘플의 수.
 * @returns {Array<Object>} 생성된 더미 데이터 배열.
 */
function generateWoWBig5DummyData(numSamplesPerSpec = 5) {
    const dummyData = [];

    for (const className in wowClassSpecsBig5Profiles) {
        for (const specializationName in wowClassSpecsBig5Profiles[className]) {
            const specInfo = wowClassSpecsBig5Profiles[className][specializationName];

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
const generatedDummyData = generateWoWBig5DummyData(39000);

// 생성된 데이터를 콘솔에 JSON 형식으로 출력합니다.
// 이 데이터를 파일로 저장하거나 다른 애플리케이션에서 사용할 수 있습니다.
// node .\dummy.js > survey_results_rows2.csv
console.log(convertToCSV(generatedDummyData));