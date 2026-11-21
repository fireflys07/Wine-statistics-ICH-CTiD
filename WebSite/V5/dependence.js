/* STAT LAB — корреляционный анализ. */
(function initialiseStatLabDependence(global) {
    "use strict";

function calculatePearson(points) {
    const n = points.length;

    const meanX = points.reduce((s, p) => s + p.x, 0) / n;
    const meanY = points.reduce((s, p) => s + p.y, 0) / n;

    let covariance = 0;
    let varianceX = 0;
    let varianceY = 0;

    points.forEach(p => {
        const dx = p.x - meanX;
        const dy = p.y - meanY;

        covariance += dx * dy;
        varianceX += dx ** 2;
        varianceY += dy ** 2;
    });

    const denominator = Math.sqrt(varianceX * varianceY);

    return denominator === 0 ? 0 : covariance / denominator;
}


// Преобразование значений в ранги.
// Одинаковые значения получают средний ранг.

function calculateRanks(values) {
    const sorted = values
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value);

    const ranks = Array(values.length);

    let i = 0;

    while (i < sorted.length) {
        let j = i;

        while (
            j + 1 < sorted.length &&
            sorted[j + 1].value === sorted[i].value
        ) {
            j++;
        }

        const averageRank = (i + 1 + j + 1) / 2;

        for (let k = i; k <= j; k++) {
            ranks[sorted[k].index] = averageRank;
        }

        i = j + 1;
    }

    return ranks;
}


// Коэффициент корреляции Спирмена.

function calculateSpearman(points) {
    const ranksX = calculateRanks(points.map(p => p.x));
    const ranksY = calculateRanks(points.map(p => p.y));

    const rankedPoints = ranksX.map((x, i) => ({
        x,
        y: ranksY[i]
    }));

    return calculatePearson(rankedPoints);
}


// Интерпретация коэффициента корреляции.

function interpretCorrelation(value) {
    const abs = Math.abs(value);

    let strength;

    if (abs < 0.1) strength = "практически отсутствует";
    else if (abs < 0.3) strength = "слабая";
    else if (abs < 0.5) strength = "умеренная";
    else if (abs < 0.7) strength = "заметная";
    else if (abs < 0.9) strength = "высокая";
    else strength = "очень высокая";

    const direction = value > 0
        ? "положительная"
        : value < 0
            ? "отрицательная"
            : "нулевая";

    return `${strength} ${direction} связь`;
}


// Построение диаграммы рассеяния.

    global.StatLabDependence = Object.freeze({
        calculatePearson,
        calculateSpearman,
        interpretCorrelation
    });
})(window);
