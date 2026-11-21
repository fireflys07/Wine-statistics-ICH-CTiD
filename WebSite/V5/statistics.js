/*
 * STAT LAB — описательная статистика.
 * Независимый от DOM модуль с проверкой входных числовых данных.
 */
(function initialiseStatLabStatistics(global) {
    "use strict";

    function assertNumericSample(values, minimumLength = 1) {
        if (!Array.isArray(values) || values.length < minimumLength ||
            !values.every(Number.isFinite)) {
            throw new TypeError("Ожидалась числовая выборка достаточного размера.");
        }
    }

    function mean(values) {
        assertNumericSample(values);
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function sampleVariance(values) {
        assertNumericSample(values, 2);
        const average = mean(values);
        return values.reduce(
            (sum, value) => sum + (value - average) ** 2,
            0
        ) / (values.length - 1);
    }

    function median(values) {
        assertNumericSample(values);
        const sorted = [...values].sort((first, second) => first - second);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2
            ? sorted[middle]
            : (sorted[middle - 1] + sorted[middle]) / 2;
    }

    global.StatLabStatistics = Object.freeze({
        mean,
        sampleVariance,
        median
    });
})(window);