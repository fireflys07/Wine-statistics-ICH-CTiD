/* STAT LAB — численные функции статистического вывода. */
(function initialiseStatLabInference(global) {
    "use strict";

function logGamma(z) {

    const coefficients = [
        676.5203681218851,
        -1259.1392167224028,
        771.3234287776531,
        -176.6150291621406,
        12.507343278686905,
        -0.13857109526572012,
        9.984369578019572e-6,
        1.5056327351493116e-7
    ];

    if (z < 0.5) {
        return Math.log(Math.PI) -
            Math.log(Math.sin(Math.PI * z)) -
            logGamma(1 - z);
    }

    z -= 1;

    let x = 0.9999999999998099;

    for (let i = 0; i < coefficients.length; i++) {
        x += coefficients[i] / (z + i + 1);
    }

    const t = z + coefficients.length - 0.5;

    return (
        0.5 * Math.log(2 * Math.PI) +
        (z + 0.5) * Math.log(t) -
        t +
        Math.log(x)
    );
}


// Неполная регуляризованная бета-функция.

function betaContinuedFraction(a, b, x) {

    const maxIterations = 200;
    const epsilon = 3e-14;
    const fpMin = 1e-300;

    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;

    let c = 1;
    let d = 1 - qab * x / qap;

    if (Math.abs(d) < fpMin) d = fpMin;

    d = 1 / d;

    let h = d;

    for (let m = 1; m <= maxIterations; m++) {

        const m2 = 2 * m;

        let aa =
            m * (b - m) * x /
            ((qam + m2) * (a + m2));

        d = 1 + aa * d;
        if (Math.abs(d) < fpMin) d = fpMin;

        c = 1 + aa / c;
        if (Math.abs(c) < fpMin) c = fpMin;

        d = 1 / d;
        h *= d * c;

        aa =
            -(a + m) * (qab + m) * x /
            ((a + m2) * (qap + m2));

        d = 1 + aa * d;
        if (Math.abs(d) < fpMin) d = fpMin;

        c = 1 + aa / c;
        if (Math.abs(c) < fpMin) c = fpMin;

        d = 1 / d;

        const delta = d * c;
        h *= delta;

        if (Math.abs(delta - 1) < epsilon) {
            break;
        }
    }

    return h;
}


function regularizedBeta(x, a, b) {

    if (x <= 0) return 0;
    if (x >= 1) return 1;

    const factor = Math.exp(
        logGamma(a + b) -
        logGamma(a) -
        logGamma(b) +
        a * Math.log(x) +
        b * Math.log(1 - x)
    );

    if (x < (a + 1) / (a + b + 2)) {

        return (
            factor *
            betaContinuedFraction(a, b, x) /
            a
        );

    }

    return 1 -
        factor *
        betaContinuedFraction(b, a, 1 - x) /
        b;
}


// Функция распределения Стьюдента.

function studentTCDF(t, degreesOfFreedom) {

    const df = degreesOfFreedom;

    if (!(df > 0)) return NaN;

    if (t === 0) return 0.5;

    const x = df / (df + t * t);

    const beta = regularizedBeta(
        x,
        df / 2,
        0.5
    );

    return t > 0
        ? 1 - beta / 2
        : beta / 2;
}

// Двустороннее p-value распределения Стьюдента.

function studentTTwoSidedP(t, df) {

    const x = df / (df + t * t);

    return regularizedBeta(
        x,
        df / 2,
        0.5
    );
}


// Квантиль распределения Стьюдента.
// Используется для доверительного интервала.

function studentTQuantile(probability, df) {

    let low = -100;
    let high = 100;

    for (let i = 0; i < 100; i++) {

        const middle = (low + high) / 2;

        if (studentTCDF(middle, df) < probability) {
            low = middle;
        } else {
            high = middle;
        }

    }

    return (low + high) / 2;
}


// Приближение функции ошибок.

function erfApproximation(x) {

    const sign = x < 0 ? -1 : 1;

    x = Math.abs(x);

    const p = 0.3275911;

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;

    const t = 1 / (1 + p * x);

    const y = 1 - (
        (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
        t *
        Math.exp(-x * x)
    );

    return sign * y;
}


function normalCDF(x) {

    return 0.5 * (
        1 + erfApproximation(x / Math.sqrt(2))
    );
}

    global.StatLabInference = Object.freeze({
        logGamma,
        regularizedBeta,
        studentTCDF,
        studentTTwoSidedP,
        studentTQuantile,
        normalCDF
    });
})(window);
