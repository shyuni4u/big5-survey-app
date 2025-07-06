// dummyDataGenerator.js

function clamp(value, min_val, max_val) {
    /**
     * 값을 주어진 최소값과 최대값 범위 내로 제한합니다.
     */
    return Math.max(min_val, Math.min(value, max_val));
}

function generateBig5Score(traitType) {
    /**
     * Big5 성격 특성 점수(1-5점)를 생성합니다.
     * 성실성, 친화성은 높은 값으로 편향되고, 신경증은 낮은 값으로 편향되며,
     * 개방성, 외향성은 정규 분포에 가깝게 생성됩니다.
     */
    if (traitType === "conscientiousness" || traitType === "agreeableness") {
        // 성실성, 친화성은 높은 값(4-5)으로 편향된 분포를 따릅니다.
        // random.triangular(low, high, mode) 대신 Math.random()을 사용하여 유사하게 구현
        let score = Math.random() * (5 - 1) + 1; // 1 to 5
        if (Math.random() < 0.7) { // 높은 값으로 편향될 확률
            score = Math.random() * (5 - 3) + 3; // 3 to 5
        }
        return clamp(Math.round(score), 1, 5);
    } else if (traitType === "neuroticism") {
        // 신경증은 정규 분포에 가깝지만, 스트레스에 강한 역할에 대한 낮은 점수 경향을 반영합니다.
        // Math.gauss 대신 Box-Muller 변환을 사용하여 정규 분포를 유사하게 생성
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v); // Standard normal (mean 0, stdev 1)

        let mean = 2.5; // 평균
        let stdDev = 1.2; // 표준 편차
        let score = z * stdDev + mean;
        return clamp(Math.round(score), 1, 5);
    } else { // openness, extraversion
        // 개방성, 외향성은 대략적인 정규 분포를 따릅니다.
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        let mean = 3.0;
        let stdDev = 1.0;
        let score = z * stdDev + mean;
        return clamp(Math.round(score), 1, 5);
    }
}

// World of Warcraft 직업 및 전문화 목록과 각 역할
const wowSpecs = [
    {"class": "Death Knight", "spec": "Blood", "role": "Tank"},
    {"class": "Death Knight", "spec": "Frost", "role": "DPS"},
    {"class": "Death Knight", "spec": "Unholy", "role": "DPS"},
    {"class": "Demon Hunter", "spec": "Vengeance", "role": "Tank"},
    {"class": "Demon Hunter", "spec": "Havoc", "role": "DPS"},
    {"class": "Druid", "spec": "Balance", "role": "DPS"},
    {"class": "Druid", "spec": "Feral", "role": "DPS"},
    {"class": "Druid", "spec": "Guardian", "role": "Tank"},
    {"class": "Druid", "spec": "Restoration", "role": "Healer"},
    {"class": "Evoker", "spec": "Augmentation", "role": "DPS"},
    {"class": "Evoker", "spec": "Devastation", "role": "DPS"},
    {"class": "Evoker", "spec": "Preservation", "role": "Healer"},
    {"class": "Hunter", "spec": "BeastMastery", "role": "DPS"},
    {"class": "Hunter", "spec": "Marksmanship", "role": "DPS"},
    {"class": "Hunter", "spec": "Survival", "role": "DPS"},
    {"class": "Mage", "spec": "Arcane", "role": "DPS"},
    {"class": "Mage", "spec": "Fire", "role": "DPS"},
    {"class": "Mage", "spec": "Frost", "role": "DPS"},
    {"class": "Monk", "spec": "Brewmaster", "role": "Tank"},
    {"class": "Monk", "spec": "Mistweaver", "role": "Healer"},
    {"class": "Monk", "spec": "Windwalker", "role": "DPS"},
    {"class": "Paladin", "spec": "Holy", "role": "Healer"},
    {"class": "Paladin", "spec": "Protection", "role": "Tank"},
    {"class": "Paladin", "spec": "Retribution", "role": "DPS"},
    {"class": "Priest", "spec": "Discipline", "role": "Healer"},
    {"class": "Priest", "spec": "Holy", "role": "Healer"},
    {"class": "Priest", "spec": "Shadow", "role": "DPS"},
    {"class": "Rogue", "spec": "Assassination", "role": "DPS"},
    {"class": "Rogue", "spec": "Outlaw", "role": "DPS"},
    {"class": "Rogue", "spec": "Subtlety", "role": "DPS"},
    {"class": "Shaman", "spec": "Elemental", "role": "DPS"},
    {"class": "Shaman", "spec": "Enhancement", "role": "DPS"},
    {"class": "Shaman", "spec": "Restoration", "role": "Healer"},
    {"class": "Warlock", "spec": "Affliction", "role": "DPS"},
    {"class": "Warlock", "spec": "Demonology", "role": "DPS"},
    {"class": "Warlock", "spec": "Destruction", "role": "DPS"},
    {"class": "Warrior", "spec": "Arms", "role": "DPS"},
    {"class": "Warrior", "spec": "Fury", "role": "DPS"},
    {"class": "Warrior", "spec": "Protection", "role": "Tank"}
];

// 각 전문화에 대한 이상적인 Big5 성격 프로필 (1-5점)
const specIdeals = {
    "Blood Death Knight": {"O": 3, "C": 5, "E": 4, "A": 3, "N": 1},
    "Frost Death Knight": {"O": 2, "C": 3, "E": 3, "A": 2, "N": 3},
    "Unholy Death Knight": {"O": 3, "C": 4, "E": 3, "A": 2, "N": 3},
    "Vengeance Demon Hunter": {"O": 3, "C": 4, "E": 4, "A": 3, "N": 2},
    "Havoc Demon Hunter": {"O": 3, "C": 3, "E": 4, "A": 2, "N": 3},
    "Balance Druid": {"O": 4, "C": 3, "E": 3, "A": 3, "N": 3},
    "Feral Druid": {"O": 4, "C": 4, "E": 2, "A": 2, "N": 3},
    "Guardian Druid": {"O": 4, "C": 4, "E": 4, "A": 4, "N": 2},
    "Restoration Druid": {"O": 4, "C": 4, "E": 3, "A": 5, "N": 2},
    "Augmentation Evoker": {"O": 5, "C": 4, "E": 4, "A": 4, "N": 2},
    "Devastation Evoker": {"O": 3, "C": 3, "E": 3, "A": 3, "N": 3},
    "Preservation Evoker": {"O": 4, "C": 4, "E": 3, "A": 5, "N": 2},
    "BeastMastery Hunter": {"O": 2, "C": 2, "E": 1, "A": 2, "N": 3},
    "Marksmanship Hunter": {"O": 3, "C": 4, "E": 2, "A": 2, "N": 3},
    "Survival Hunter": {"O": 3, "C": 3, "E": 3, "A": 2, "N": 3},
    "Arcane Mage": {"O": 4, "C": 5, "E": 2, "A": 2, "N": 3},
    "Fire Mage": {"O": 4, "C": 4, "E": 3, "A": 2, "N": 3},
    "Frost Mage": {"O": 3, "C": 3, "E": 2, "A": 3, "N": 2},
    "Brewmaster Monk": {"O": 3, "C": 4, "E": 4, "A": 3, "N": 2},
    "Mistweaver Monk": {"O": 3, "C": 4, "E": 3, "A": 5, "N": 2},
    "Windwalker Monk": {"O": 3, "C": 4, "E": 4, "A": 2, "N": 3},
    "Holy Paladin": {"O": 3, "C": 4, "E": 3, "A": 5, "N": 2},
    "Protection Paladin": {"O": 3, "C": 5, "E": 4, "A": 4, "N": 1},
    "Retribution Paladin": {"O": 2, "C": 3, "E": 3, "A": 3, "N": 3},
    "Discipline Priest": {"O": 4, "C": 5, "E": 3, "A": 4, "N": 2},
    "Holy Priest": {"O": 3, "C": 4, "E": 3, "A": 5, "N": 2},
    "Shadow Priest": {"O": 4, "C": 4, "E": 2, "A": 2, "N": 4},
    "Assassination Rogue": {"O": 3, "C": 4, "E": 1, "A": 1, "N": 3},
    "Outlaw Rogue": {"O": 3, "C": 3, "E": 3, "A": 2, "N": 3},
    "Subtlety Rogue": {"O": 4, "C": 5, "E": 1, "A": 1, "N": 3},
    "Elemental Shaman": {"O": 4, "C": 3, "E": 3, "A": 3, "N": 3},
    "Enhancement Shaman": {"O": 3, "C": 3, "E": 4, "A": 3, "N": 3},
    "Restoration Shaman": {"O": 3, "C": 4, "E": 3, "A": 5, "N": 2},
    "Affliction Warlock": {"O": 4, "C": 4, "E": 1, "A": 1, "N": 4},
    "Demonology Warlock": {"O": 4, "C": 3, "E": 1, "A": 2, "N": 3},
    "Destruction Warlock": {"O": 3, "C": 3, "E": 1, "A": 1, "N": 3},
    "Arms Warrior": {"O": 2, "C": 4, "E": 3, "A": 2, "N": 3},
    "Fury Warrior": {"O": 2, "C": 3, "E": 4, "A": 2, "N": 3},
    "Protection Warrior": {"O": 2, "C": 5, "E": 4, "A": 3, "N": 1}
};

// "Class Spec" 문자열을 wowSpecs 배열의 객체로 매핑하는 헬퍼 딕셔너리
const wowSpecMap = {};
wowSpecs.forEach(s => {
    // specIdeals의 키 형식과 일치하도록 "전문화 직업" 형식으로 키를 생성
    wowSpecMap[`${s.spec} ${s.class}`] = s;
});

function scorePersonalityMatch(personality, idealProfile) {
    /**
     * 주어진 성격 프로필이 이상적인 프로필과 얼마나 잘 일치하는지 점수를 매깁니다.
     * 점수가 낮을수록 더 잘 일치합니다 (절대 오차의 합).
     */
    let score = 0;
    score += Math.abs(personality.openness - idealProfile.O);
    score += Math.abs(personality.conscientiousness - idealProfile.C);
    score += Math.abs(personality.extraversion - idealProfile.E);
    score += Math.abs(personality.agreeableness - idealProfile.A);
    score += Math.abs(personality.neuroticism - idealProfile.N);
    return score;
}

function generateDummyData(numEntries) {
    /**
     * 지정된 수만큼의 더미 데이터를 생성합니다.
     */
    const data = [];
    for (let i = 0; i < numEntries; i++) {
        const personality = {
            openness: generateBig5Score("openness"),
            conscientiousness: generateBig5Score("conscientiousness"),
            extraversion: generateBig5Score("extraversion"),
            agreeableness: generateBig5Score("agreeableness"),
            neuroticism: generateBig5Score("neuroticism")
        };

        let bestSpecName = null;
        let minDiffScore = Infinity;

        // 모든 전문화에 대해 성격 일치 점수를 계산하여 가장 적합한 전문화를 찾습니다.
        for (const specName in specIdeals) {
            const idealProfile = specIdeals[specName];
            const currentDiffScore = scorePersonalityMatch(personality, idealProfile);
            if (currentDiffScore < minDiffScore) {
                minDiffScore = currentDiffScore;
                bestSpecName = specName;
            } else if (currentDiffScore === minDiffScore) {
                // 점수가 같을 경우 무작위로 선택하여 다양성을 높입니다.
                if (Math.random() > 0.5) {
                    bestSpecName = specName;
                }
            }
        }

        // 선택된 전문화의 세부 정보를 가져옵니다.
        // bestSpecName이 유효한 키인지 확인
        const chosenSpecInfo = wowSpecMap[bestSpecName];

        // chosenSpecInfo가 undefined인 경우를 대비한 방어 로직 (이전 오류 방지)
        if (!chosenSpecInfo) {
            console.error(`Error: No spec info found for bestSpecName: ${bestSpecName}. Skipping this entry.`);
            continue; // 이 항목을 건너뛰고 다음 항목으로 진행
        }

        // 현재 시간을 ISO 8601 형식으로 생성 (UTC)
        const createdAt = new Date().toISOString();

        const entry = {
            id: i + 1,
            app: "wow",
            created_at: createdAt,
            answers: {
                E: personality.extraversion * 20, // 1-5점을 20-100으로 변환 (예시)
                A: personality.agreeableness * 20,
                C: personality.conscientiousness * 20,
                N: personality.neuroticism * 20,
                O: personality.openness * 20
            },
            class: chosenSpecInfo.class,
            specialization: chosenSpecInfo.spec
        };
        data.push(entry);
    }
    return data;
}

// 10,000개의 더미 데이터 생성
const dummyData = generateDummyData(10000);

// JSON 형식으로 출력
console.log(JSON.stringify(dummyData));


// Command: node dummy.js > dummy_data.csv