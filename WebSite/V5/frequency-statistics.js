/* STAT LAB — статистика частотных таблиц. */
(function initialiseStatLabFrequencyStatistics(global) {
    "use strict";

function getNormalizationDataset(lab) {

    const variable = Array.isArray(lab?.variables)
        ? lab.variables.find(item => item.id === "quality")
        : null;

    const chart = variable?.chart;

    if (
        !Array.isArray(chart?.labels) ||
        !Array.isArray(chart?.values) ||
        chart.labels.length !== chart.values.length ||
        chart.labels.length < 2
    ) {
        return null;
    }

    const values = chart.labels.map(Number);
    const frequencies = chart.values.map(Number);

    const valid =
        values.every(Number.isFinite) &&
        frequencies.every(value =>
            Number.isFinite(value) && value >= 0
        );

    if (!valid) return null;

    const total = frequencies.reduce(
        (sum, value) => sum + value,
        0
    );

    if (total < 2) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (max <= min) return null;

    // Среднее с учётом частот.
    const weightedSum = values.reduce(
        (sum, value, index) =>
            sum + value * frequencies[index],
        0
    );

    const mean = weightedSum / total;

    // Сумма квадратов отклонений.
    const squaredSum = values.reduce(
        (sum, value, index) =>
            sum +
            frequencies[index] * (value - mean) ** 2,
        0
    );

    // Выборочная дисперсия: делим на N - 1.
    const sampleVariance = squaredSum / (total - 1);

    const sampleSD = Math.sqrt(sampleVariance);

    if (!Number.isFinite(sampleSD) || sampleSD === 0) {
        return null;
    }

    return {
        variable,
        values,
        frequencies,
        total,
        min,
        max,
        mean,
        sampleSD
    };
}


// Расчёт среднего и стандартного отклонения
// для преобразованных значений с учётом частот.

function calculateWeightedStats(values, frequencies) {

    const total = frequencies.reduce(
        (sum, value) => sum + value,
        0
    );

    const mean = values.reduce(
        (sum, value, index) =>
            sum + value * frequencies[index],
        0
    ) / total;

    const squaredSum = values.reduce(
        (sum, value, index) =>
            sum +
            frequencies[index] * (value - mean) ** 2,
        0
    );

    const sampleSD = total > 1
        ? Math.sqrt(squaredSum / (total - 1))
        : 0;

    return {
        total,
        mean,
        sampleSD
    };
}

// ==========================================
// NORMALIZATION CHART
// ==========================================

function calculateEDAFromFrequencies(chart) {

    if (
        !Array.isArray(chart?.labels) ||
        !Array.isArray(chart?.values) ||
        chart.labels.length !== chart.values.length ||
        chart.labels.length < 2
    ) {
        return null;
    }

    const values = chart.labels.map(Number);
    const frequencies = chart.values.map(Number);

    const valid =
        values.every(Number.isFinite) &&
        frequencies.every(value =>
            Number.isFinite(value) &&
            value >= 0
        );

    if (!valid) return null;

    const total = frequencies.reduce(
        (sum, frequency) => sum + frequency,
        0
    );

    if (total < 2) return null;

    // Среднее с учётом частот.
    const mean = values.reduce(
        (sum, value, index) =>
            sum + value * frequencies[index],
        0
    ) / total;

    // Выборочная дисперсия.
    const squaredSum = values.reduce(
        (sum, value, index) =>
            sum + frequencies[index] * (value - mean) ** 2,
        0
    );

    const variance = squaredSum / (total - 1);
    const standardDeviation = Math.sqrt(variance);

    // Медиана с учётом частот.
    function getValueAtRank(rank) {

        let cumulativeFrequency = 0;

        for (let i = 0; i < values.length; i++) {

            cumulativeFrequency += frequencies[i];

            if (cumulativeFrequency > rank) {
                return values[i];
            }
        }

        return null;
    }

    const median = total % 2 === 0
        ? (
            getValueAtRank(total / 2 - 1) +
            getValueAtRank(total / 2)
        ) / 2
        : getValueAtRank(Math.floor(total / 2));

    // Мода — значение с максимальной частотой.
    const maxFrequency = Math.max(...frequencies);
    const modeIndex = frequencies.indexOf(maxFrequency);

    return {
        total,
        mean,
        median,
        mode: values[modeIndex],
        variance,
        standardDeviation,
        min: Math.min(...values),
        max: Math.max(...values)
    };
}
// ==========================================
// EDA — IQR AND OUTLIER DETECTION
// ==========================================

function calculateIQRFromFrequencies(chart) {

    if (
        !Array.isArray(chart?.labels) ||
        !Array.isArray(chart?.values) ||
        chart.labels.length !== chart.values.length
    ) {
        return null;
    }

    // Преобразуем таблицу в пары:
    // значение + количество наблюдений.

    const pairs = chart.labels.map((label, index) => ({
        value: Number(label),
        frequency: Number(chart.values[index])
    }));

    const valid = pairs.every(item =>
        Number.isFinite(item.value) &&
        Number.isInteger(item.frequency) &&
        item.frequency >= 0
    );

    if (!valid) return null;

    pairs.sort((a, b) => a.value - b.value);

    const observedPairs = pairs.filter(
        item => item.frequency > 0
    );

    const total = observedPairs.reduce(
        (sum, item) => sum + item.frequency,
        0
    );

    if (total < 2 || observedPairs.length < 2) return null;

    // Возвращает значение на заданной позиции
    // в упорядоченной эмпирической совокупности.
    // rank начинается с 1.

    function getValueAtRank(rank) {

        let cumulative = 0;

        for (const item of observedPairs) {

            cumulative += item.frequency;

            if (cumulative >= rank) {
                return item.value;
            }
        }

        return null;
    }

    // Используем определение квантиля nearest rank.
    const q1 = getValueAtRank(Math.ceil(total * 0.25));

    const q2 = total % 2 === 0
        ? (
            getValueAtRank(total / 2) +
            getValueAtRank(total / 2 + 1)
        ) / 2
        : getValueAtRank(Math.ceil(total / 2));

    const q3 = getValueAtRank(Math.ceil(total * 0.75));

    const iqr = q3 - q1;

    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    // Категории, попадающие за границы IQR.
    const outlierGroups = observedPairs.filter(item =>
        item.value < lowerFence ||
        item.value > upperFence
    );

    const outlierCount = outlierGroups.reduce(
        (sum, item) => sum + item.frequency,
        0
    );

    const inlierValues = observedPairs
        .filter(item =>
            item.value >= lowerFence &&
            item.value <= upperFence
        )
        .map(item => item.value);

    return {

        pairs: observedPairs,
        total,

        min: observedPairs[0].value,
        max: observedPairs[observedPairs.length - 1].value,

        q1,
        q2,
        q3,
        iqr,

        lowerFence,
        upperFence,

        outlierGroups,
        outlierCount,

        outlierShare: outlierCount / total * 100,

        lowerWhisker: inlierValues.length
            ? Math.min(...inlierValues)
            : null,

        upperWhisker: inlierValues.length
            ? Math.max(...inlierValues)
            : null
    };
}

// ==========================================
// EDA — GROUP COMPARISON DATA
// ==========================================

    global.StatLabFrequencyStatistics = Object.freeze({
        getNormalizationDataset,
        calculateWeightedStats,
        calculateEDAFromFrequencies,
        calculateIQRFromFrequencies
    });
})(window);
