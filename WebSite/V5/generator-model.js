/* STAT LAB — вероятностная kNN-модель генератора. */
(function initialiseStatLabGeneratorModel(global) {
    "use strict";

function calculateKnnQualityDistribution(
    trainingRows,
    targetAlcohol,
    requestedK
) {

    if (!Array.isArray(trainingRows) || trainingRows.length === 0) {
        throw new Error("Обучающая выборка пуста.");
    }

    if (!Number.isFinite(targetAlcohol)) {
        throw new Error("Некорректное значение alcohol.");
    }

    const k = Math.max(
        1,
        Math.min(
            trainingRows.length,
            Math.floor(requestedK)
        )
    );

    // Расстояние в одномерном пространстве признака alcohol.
    const nearest = trainingRows
        .map((row, index) => ({
            ...row,
            distance: Math.abs(row.alcohol - targetAlcohol),
            originalIndex: index
        }))
        .sort((a, b) =>
            a.distance - b.distance ||
            a.originalIndex - b.originalIndex
        )
        .slice(0, k);

    // Все классы качества, присутствующие в обучающей выборке.
    const qualities = [
        ...new Set(trainingRows.map(row => row.quality))
    ].sort((a, b) => a - b);

    const counts = new Map(
        qualities.map(quality => [quality, 0])
    );

    nearest.forEach(row => {
        counts.set(
            row.quality,
            (counts.get(row.quality) || 0) + 1
        );
    });

    // Условные вероятности оценок среди k соседей.
    const probabilities = qualities.map(
        quality => counts.get(quality) / nearest.length
    );

    // Математическое ожидание условного распределения.
    const mean = qualities.reduce(
        (sum, quality, index) =>
            sum + quality * probabilities[index],
        0
    );

    // Дисперсия условного распределения.
    const variance = qualities.reduce(
        (sum, quality, index) =>
            sum + probabilities[index] * (quality - mean) ** 2,
        0
    );

    return {
        alcohol: targetAlcohol,
        unit: "% об.",
        k: nearest.length,
        qualities,
        probabilities,
        mean,
        variance
    };
}

// ==========================================
// GENERATOR — FAST NEAREST NEIGHBORS
// ==========================================

function getNearestKnnRows(sortedRows, targetAlcohol, k) {

    // Ищем первое наблюдение, у которого alcohol >= targetAlcohol.
    let low = 0;
    let high = sortedRows.length;

    while (low < high) {

        const middle = Math.floor((low + high) / 2);

        if (sortedRows[middle].alcohol < targetAlcohol) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }

    let left = low - 1;
    let right = low;

    const nearest = [];

    while (nearest.length < k) {

        if (left < 0) {

            nearest.push(sortedRows[right]);
            right++;

            continue;
        }

        if (right >= sortedRows.length) {

            nearest.push(sortedRows[left]);
            left--;

            continue;
        }

        const leftDistance = Math.abs(
            sortedRows[left].alcohol - targetAlcohol
        );

        const rightDistance = Math.abs(
            sortedRows[right].alcohol - targetAlcohol
        );

        // При одинаковом расстоянии выбираем меньший alcohol.
        if (leftDistance <= rightDistance) {

            nearest.push(sortedRows[left]);
            left--;

        } else {

            nearest.push(sortedRows[right]);
            right++;
        }
    }

    return nearest;
}


// ==========================================
// GENERATOR — TEST EVALUATION
// ==========================================

function evaluateGeneratorOnTest(
    trainingRows,
    testRows,
    requestedK,
    group = "all"
) {

    // Выбираем нужную группу.
    const train = group === "all"
        ? trainingRows
        : trainingRows.filter(row => row.wineType === group);

    const test = group === "all"
        ? testRows
        : testRows.filter(row => row.wineType === group);

    if (train.length === 0 || test.length === 0) {
        throw new Error("Недостаточно наблюдений для проверки модели.");
    }

    const k = Math.min(
        Math.max(1, Math.floor(requestedK)),
        train.length
    );

    // Сортируем обучение один раз.
    const sortedTrain = [...train].sort(
        (a, b) => a.alcohol - b.alcohol
    );

    // Классы качества, которые присутствуют в выбранной группе.
    const qualities = [
        ...new Set([
            ...train.map(row => row.quality),
            ...test.map(row => row.quality)
        ])
    ].sort((a, b) => a - b);

    const actualCounts = new Map(
        qualities.map(q => [q, 0])
    );

    const predictedProbabilitySums = new Map(
        qualities.map(q => [q, 0])
    );

    let brierSum = 0;
    let zeroProbabilityCount = 0;

    // Проходим по каждому независимому тестовому наблюдению.
    test.forEach(testRow => {

        const neighbors = getNearestKnnRows(
            sortedTrain,
            testRow.alcohol,
            k
        );

        const neighborCounts = new Map(
            qualities.map(q => [q, 0])
        );

        neighbors.forEach(row => {

            neighborCounts.set(
                row.quality,
                neighborCounts.get(row.quality) + 1
            );

        });

        // Вероятности классов для данного тестового объекта.
        const probabilities = new Map();

        qualities.forEach(q => {

            const probability =
                neighborCounts.get(q) / neighbors.length;

            probabilities.set(q, probability);

            predictedProbabilitySums.set(
                q,
                predictedProbabilitySums.get(q) + probability
            );

        });

        // Наблюдаемое качество.
        actualCounts.set(
            testRow.quality,
            (actualCounts.get(testRow.quality) || 0) + 1
        );

        // Мультиномиальная ошибка Brier.
        // Чем ближе к нулю, тем лучше вероятностный прогноз.
        let observationBrier = 0;

        qualities.forEach(q => {

            const predicted = probabilities.get(q);

            const observed = testRow.quality === q ? 1 : 0;

            observationBrier += (predicted - observed) ** 2;

        });

        brierSum += observationBrier;

        // Проверяем, была ли реальная оценка представлена
        // среди ближайших соседей.
        if ((probabilities.get(testRow.quality) || 0) === 0) {
            zeroProbabilityCount++;
        }

    });

    const n = test.length;

    // Наблюдаемое и предсказанное маргинальные распределения.
    const actualDistribution = qualities.map(q => ({
        quality: q,
        probability: actualCounts.get(q) / n
    }));

    const predictedDistribution = qualities.map(q => ({
        quality: q,
        probability: predictedProbabilitySums.get(q) / n
    }));

    // Total Variation Distance.
    // Значение 0 означает полное совпадение распределений.
    const tv = 0.5 * qualities.reduce((sum, q) => {

        const actual =
            actualCounts.get(q) / n;

        const predicted =
            predictedProbabilitySums.get(q) / n;

        return sum + Math.abs(actual - predicted);

    }, 0);

    // Математическое ожидание реального тестового распределения.
    const actualMean = actualDistribution.reduce(
        (sum, item) =>
            sum + item.quality * item.probability,
        0
    );

    // Математическое ожидание модельного распределения.
    const predictedMean = predictedDistribution.reduce(
        (sum, item) =>
            sum + item.quality * item.probability,
        0
    );

    // Дисперсия реального распределения.
    const actualVariance = actualDistribution.reduce(
        (sum, item) =>
            sum +
            (item.quality - actualMean) ** 2 *
            item.probability,
        0
    );

    // Дисперсия модельного распределения.
    const predictedVariance = predictedDistribution.reduce(
        (sum, item) =>
            sum +
            (item.quality - predictedMean) ** 2 *
            item.probability,
        0
    );

    return {

        group,
        n,
        k,

        qualities,

        actualDistribution,
        predictedDistribution,

        tv,

        actualMean,
        predictedMean,

        actualVariance,
        predictedVariance,

        meanDifference: predictedMean - actualMean,

        varianceDifference:
            predictedVariance - actualVariance,

        brierScore: brierSum / n,

        zeroProbabilityRate:
            zeroProbabilityCount / n

    };
}

function splitGeneratorRows(
    rows,
    testFraction = 0.2,
    seed = 20261112
) {

    const random = global.StatLabRandom.createSeededRandom(seed);

    const shuffled = [...rows];

    // Перемешивание Фишера — Йейтса.
    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    // Выделяем 20% для проверки.
    const testSize = Math.ceil(
        shuffled.length * testFraction
    );

    return {
        test: shuffled.slice(0, testSize),
        train: shuffled.slice(testSize)
    };
}

    global.StatLabGeneratorModel = Object.freeze({
        calculateKnnQualityDistribution,
        evaluateGeneratorOnTest,
        splitGeneratorRows
    });
})(window);
