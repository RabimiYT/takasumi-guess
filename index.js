const random = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

let selectedNum = null;
let rotateIndex = 0;

function updateChoiceGuide(extraText = "") {
    const guide = document.getElementById('choiceGuide');
    const currentLabel = selectedNum ? `${selectedNum}` : "未選択";
    const baseText = `選択中: ${currentLabel}（どの数字でも勝率 1/3 = 33.33% / 期待値は同じ）`;
    guide.innerHTML = extraText ? `${baseText}<br>${extraText}` : baseText;
}

function selectNumber(num) {
    selectedNum = num;
    updateChoiceGuide(`「${num}」を基準に選択しました。連敗増額するなら数字をコロコロ変えないのがおすすめです。`);
}

function pickRecommended() {
    const style = document.getElementById('pickStyle').value;
    const choices = ["1", "2", "3"];

    if (style === "fixed2") {
        selectedNum = "2";
        updateChoiceGuide("おすすめ: 【2】（端っこ「1」「3」への偏りを減らし、迷いをなくす定番）");
    } else if (style === "random") {
        selectedNum = random(choices);
        updateChoiceGuide(`おすすめ: 【${selectedNum}】（完全ランダム抽選で選出）`);
    } else if (style === "streak") {
        if (!selectedNum) {
            selectedNum = random(choices);
        }
        updateChoiceGuide(`おすすめ: 【${selectedNum}】を継続（連敗で賭け金を増やすときは同じ数字を貫くのがおすすめ）`);
    } else if (style === "rotate") {
        selectedNum = choices[rotateIndex % choices.length];
        rotateIndex += 1;
        updateChoiceGuide(`おすすめ: 【${selectedNum}】（1 → 2 → 3 順で次の一手を提案）`);
    }
}

function calc() {
    const baseInput = Number(document.getElementById('base').value);
    const molecule = Number(document.getElementById('molecule').value);
    const denominator = Number(document.getElementById('denominator').value);
    const money = Number(document.getElementById('money').value);
    const result = document.getElementById('result');

    if (!Number.isFinite(baseInput) || baseInput < 10) {
        result.innerHTML = "賭けるチップは10以上を指定してください。";
        return;
    }
    if (!Number.isFinite(molecule) || !Number.isFinite(denominator) || molecule <= 0 || denominator <= 0) {
        result.innerHTML = "倍率（分子・分母）は1以上の正数を指定してください。";
        return;
    }
    if (!Number.isFinite(money) || money < Math.round(baseInput * 1.5)) {
        result.innerHTML = "所持チップが不足しています（1回分の罰金以上に設定してください）。";
        return;
    }

    if (!selectedNum) {
        pickRecommended();
    }

    const loseMult = 1.5;
    const winMult = 2.4;
    const stepMult = molecule / denominator;

    let currentBet = baseInput;
    let totalLoss = 0;
    let rounds = 0;
    let text = `狙う数字: ${selectedNum}（当選確率 1/3）<br>`;

    while (true) {
        const penalty = Math.round(currentBet * loseMult);
        const reward = Math.round(currentBet * winMult);

        if (totalLoss + penalty > money) {
            break;
        }

        const prevLoss = totalLoss;
        totalLoss += penalty;
        rounds += 1;

        if (rounds === 1) {
            text += `1: [${selectedNum}] ${currentBet}チップ 負けた場合: -${penalty}チップ 勝った場合: +${reward}チップ<br>`;
        } else {
            const netProfit = reward - prevLoss;
            text += `${rounds}: [${selectedNum}] ${currentBet}チップ 負けた場合: -${totalLoss}チップ 勝った場合: ${netProfit}チップ<br>`;
        }

        currentBet = Math.round(currentBet * stepMult);
        if (currentBet < 1) {
            break;
        }
    }

    const percentage = 100 * Math.pow(2 / 3, rounds);
    const picked = random(["1", "2", "3"]);

    text += `損失: ${totalLoss}チップ<br>`;
    text += `継続できる回数: ${rounds}回<br>`;
    text += `すべてを失う確率: ${percentage}%<br>`;
    text += `お試し抽選結果: ${picked} ${picked === selectedNum ? "（当たり！）" : "（ハズレ）"}`;

    result.innerHTML = text;
}

updateChoiceGuide();
