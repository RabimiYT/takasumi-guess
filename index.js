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

    const loseMult = 1.5;
    const winMult = 2.8;
    const stepMult = molecule / denominator;

    let currentBet = baseInput;
    let totalLoss = 0;
    let rounds = 0;
    let text = "";

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
            text += `1: ${currentBet}チップ 負けた場合: -${penalty}チップ 勝った場合: +${reward}チップ<br>`;
        } else {
            const netProfit = reward - prevLoss;
            text += `${rounds}: ${currentBet}チップ 負けた場合: -${totalLoss}チップ 勝った場合: ${netProfit}チップ<br>`;
        }

        currentBet = Math.round(currentBet * stepMult);
        if (currentBet < 1) {
            break;
        }
    }

    const percentage = 100 * Math.pow(2 / 3, rounds);

    text += `損失: ${totalLoss}チップ<br>`;
    text += `継続できる回数: ${rounds}回<br>`;
    text += `すべてを失う確率: ${percentage}%<br>`;

    result.innerHTML = text;
}
