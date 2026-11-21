/* STAT LAB — воспроизводимая случайность и дискретные выборки. */
(function initialiseStatLabRandom(global) {
    "use strict";

    function createSeededRandom(seed = 12345) {
        let state = seed >>> 0;
        return function random() {
            state += 0x6D2B79F5;
            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    function buildCdf(probabilities) {
        if (!Array.isArray(probabilities) || probabilities.length === 0 ||
            !probabilities.every(value => Number.isFinite(value) && value >= 0)) {
            throw new Error("Вероятности должны быть неотрицательными числами.");
        }
        const total = probabilities.reduce((sum, value) => sum + value, 0);
        if (!(total > 0)) throw new Error("Сумма вероятностей должна быть положительной.");
        let cumulative = 0;
        const cdf = probabilities.map(probability => {
            cumulative += probability / total;
            return cumulative;
        });
        cdf[cdf.length - 1] = 1;
        return cdf;
    }

    function inverseCdfSample(values, cdf, randomValue) {
        if (!Array.isArray(values) || values.length !== cdf.length) {
            throw new Error("Размеры массива значений и CDF не совпадают.");
        }
        for (let index = 0; index < cdf.length; index++) {
            if (randomValue < cdf[index]) return values[index];
        }
        return values[values.length - 1];
    }

    function generateQualitySample(qualities, probabilities, size, seed = null) {
        if (!Array.isArray(qualities) || !Array.isArray(probabilities) ||
            qualities.length === 0 || qualities.length !== probabilities.length) {
            throw new Error("Некорректные данные генератора.");
        }
        if (!Number.isInteger(size) || size < 1) {
            throw new Error("Размер выборки должен быть положительным целым числом.");
        }
        if (seed !== null && (!Number.isSafeInteger(seed) || seed < 0 || seed > 4294967295)) {
            throw new Error("Seed должен быть целым числом от 0 до 4294967295.");
        }
        const cdf = buildCdf(probabilities);
        const random = seed === null ? Math.random : createSeededRandom(seed);
        return Array.from({ length: size }, () => inverseCdfSample(qualities, cdf, random()));
    }

    function sampleHistogram(sample, values) {
        const counts = Object.fromEntries(values.map(value => [value, 0]));
        sample.forEach(value => { counts[value] = (counts[value] || 0) + 1; });
        const total = sample.length || 1;
        return values.map(value => ({
            quality: value,
            count: counts[value] || 0,
            frequency: (counts[value] || 0) / total
        }));
    }

    global.StatLabRandom = Object.freeze({
        createSeededRandom,
        buildCdf,
        inverseCdfSample,
        generateQualitySample,
        sampleHistogram
    });
})(window);