// ==========================================
// STAT LAB — DATA CONFIGURATION
// Здесь хранятся данные всех лабораторных.
// ==========================================

window.LABS = [

    // ======================================
    // LAB 01 — WINE QUALITY
    // ======================================

    {
        id: "lab-01",
        number: "01",
        title: "Wine Quality",
        subtitle: "Wine Quality as a stochastic system",
        status: "Research stage",

        description:
            "Исследование физико-химических характеристик и сенсорной оценки качества вина.",

        dataset: {
            name: "Wine Quality",
            source: "UCI Machine Learning Repository",
            url: "https://archive.ics.uci.edu/dataset/186/wine+quality",

            description:
                "Объединённый набор данных красных и белых вин Vinho Verde. Содержит физико-химические измерения и сенсорные оценки.",

            metrics: [
                { label: "Observations", value: "6 497" },
                { label: "Variables", value: "13" },
                { label: "Missing values", value: "0" },
                { label: "Duplicates", value: "1 177" }
            ],

            groups: [
                { label: "Red wine", value: 1599 },
                { label: "White wine", value: 4898 }
            ]
        },

        // Три случайные величины
        variables: [

            {
                id: "quality",
                code: "RV 01",
                symbol: "Q",

                name: "Quality",
                type: "Discrete · Ordinal",
                unit: "Score",

                description:
                    "Сенсорная оценка качества вина. Каждую пробу оценивала группа дегустаторов; итоговая оценка представляет собой медиану их оценок.",

                nature:
                    "Случайность относится к выбору образца вина из исследуемой совокупности. Для уже зафиксированной строки датасета значение является наблюдаемым.",

                formula: "P(Q = k) = nₖ / N",

                statistics: [
                    { label: "Mean", value: "5.818" },
                    { label: "Median", value: "6.000" },
                    { label: "Variance", value: "0.763" },
                    { label: "Std. dev.", value: "0.873" },
                    { label: "Mode", value: "6" },
                    { label: "Range", value: "3–9" }
                ],

                chart: {
                    type: "bar",
                    title: "Empirical distribution",
                    labels: ["3", "4", "5", "6", "7", "8", "9"],
                    values: [30, 216, 2138, 2836, 1079, 193, 5],
                    unit: "observations"
                },

                conclusion:
                    "Наиболее часто встречается оценка 6 — 43,65% наблюдений. Распределение статистически отличается от нормального."
            },

            {
                id: "alcohol",
                code: "RV 02",
                symbol: "X₁",

                name: "Alcohol",
                type: "Continuous",
                unit: "% об.",

                description:
                    "Содержание этанола в образце вина.",

                nature:
                    "Содержание алкоголя зависит от сахаристости сусла, температуры, активности дрожжей и условий ферментации. Для случайно выбранного образца эти факторы не заданы полностью.",

                formula: "X = alcohol, X > 0",

                statistics: [
                    { label: "Red mean", value: "10.423" },
                    { label: "White mean", value: "10.514" },
                    { label: "Red variance", value: "1.1356" },
                    { label: "White variance", value: "1.5144" }
                ],

                chart: {
                    type: "bar",
                    title: "Mean alcohol content",
                    labels: ["Red wine", "White wine"],
                    values: [10.423, 10.514],
                    unit: "% об."
                },

                conclusion:
                    "Среднее содержание алкоголя немного выше в белом вине. Среди рассмотренных моделей логнормальная имеет наименьший AIC."
            },

            {
                id: "acidity",
                code: "RV 03",
                symbol: "X₂",

                name: "Volatile acidity",
                type: "Continuous",
                unit: "g/dm³",

                description:
                    "Концентрация летучих кислот в образце вина.",

                nature:
                    "Формирование летучей кислотности зависит от активности уксуснокислых бактерий, температуры ферментации и доступа кислорода.",

                formula: "X = volatile acidity, X > 0",

                statistics: [
                    { label: "Mean", value: "0.3397" },
                    { label: "Median", value: "0.2900" },
                    { label: "Variance", value: "0.0271" },
                    { label: "Std. dev.", value: "0.1646" },
                    { label: "Skewness", value: "1.4948" },
                    { label: "Kurtosis", value: "2.8223" }
                ],

                chart: {
                    type: "bar",
                    title: "Mean volatile acidity",
                    labels: ["Red wine", "White wine"],
                    values: [0.5278, 0.2782],
                    unit: "g/dm³"
                },

                conclusion:
                    "Распределение имеет выраженную положительную асимметрию и тяжёлый правый хвост."
            }

        ],

        // Проверенные в исследовании гипотезы
        hypotheses: [

            {
                id: "quality-color",
        
                title:
                    "Различается ли среднее качество красного и белого вина?",
        
                method:
                    "t-критерий Уэлча",
        
                h0:
                    "Среднее качество красного и белого вина одинаково: μred = μwhite.",
        
                h1:
                    "Среднее качество красного и белого вина различается: μred ≠ μwhite.",
        
                pValue: 8.17e-24,
        
                pValueText: "8.17 × 10⁻²⁴",
        
                metrics: [
        
                    {
                        label: "Разность средних (красное − белое)",
                        value: "−0.2419"
                    },
        
                    {
                        label: "95% доверительный интервал",
                        value: "[−0.2886; −0.1952]"
                    },
        
                    {
                        label: "Коэффициент d Коэна",
                        value: "−0.2790"
                    }
        
                ],
        
                conclusion:
                    "Среднее качество красного и белого вина статистически различается. В данной выборке средняя оценка красного вина ниже."
        
            },
        
        
            {
                id: "alcohol-quality",
        
                title:
                    "Связано ли содержание алкоголя с оценкой качества?",
        
                method:
                    "Корреляционный анализ Пирсона и Спирмена",
        
                h0:
                    "Коэффициент корреляции между содержанием алкоголя и качеством равен нулю.",
        
                h1:
                    "Коэффициент корреляции между содержанием алкоголя и качеством отличается от нуля.",
        
                pValue: null,
        
                pValueUpperBound: 0.05,
        
                pValueText:
                    "p < 0.05 (точное значение не сохранено)",
        
                metrics: [
        
                    {
                        label: "Пирсон r — красное вино",
                        value: "0.4762"
                    },
        
                    {
                        label: "Пирсон r — белое вино",
                        value: "0.4356"
                    }
        
                ],
        
                conclusion:
                    "В сохранённых результатах связь отмечена как статистически значимая. Точное p-value и отдельные результаты тестирования для каждой группы не сохранены."
        
            },
        
        
            {
                id: "acidity-color",
        
                title:
                    "Различается ли летучая кислотность красного и белого вина?",
        
                method:
                    "Критерий Манна — Уитни",
        
                h0:
                    "Распределения летучей кислотности в двух группах одинаковы.",
        
                h1:
                    "Распределения летучей кислотности в двух группах различаются.",
        
                pValue: null,
        
                pValueText:
                    "Численное значение не сохранено: численное переполнение.",
        
                metrics: [
        
                    {
                        label: "Статистика U",
                        value: "7 059 623.5"
                    },
        
                    {
                        label: "Медиана — красное вино",
                        value: "0.52"
                    },
        
                    {
                        label: "Медиана — белое вино",
                        value: "0.26"
                    }
        
                ],
        
                conclusion:
                    "Исходный расчёт не сохранил численное значение p-value. Для формального решения при выбранном уровне значимости необходимо повторить вычисление."
        
            }
        
        ],

        // Эмпирическая проверка состоятельности
        sampling: {

            title: "Quality · sampling experiment",

            description:
                "Сравнение стандартных отклонений выборочных средних при отборе с возвращением и без возвращения.",

            trueMean: "5.8184",

            points: [
                { n: 10, wr: 0.27235, wor: 0.28996, seWor: 0.27593 },
                { n: 30, wr: 0.16180, wor: 0.15578, seWor: 0.15907 },
                { n: 50, wr: 0.12424, wor: 0.12299, seWor: 0.12302 },
                { n: 100, wr: 0.08866, wor: 0.08528, seWor: 0.08665 },
                { n: 300, wr: 0.04953, wor: 0.05115, seWor: 0.04924 },
                { n: 500, wr: 0.03823, wor: 0.03778, seWor: 0.03752 },
                { n: 1000, wr: 0.02756, wor: 0.02553, seWor: 0.02540 }
            ]
        },

        methods: [
            {
                title: "EDA",
                description:
                    "Первичный анализ структуры датасета, диапазонов, пропусков, дубликатов и распределений."
            },
            {
                title: "Min-Max",
                description:
                    "Масштабирование значений в заданный диапазон."
            },
            {
                title: "Z-score",
                description:
                    "Стандартизация относительно среднего и стандартного отклонения."
            },
            {
                title: "Distribution fitting",
                description:
                    "Сравнение теоретических распределений с помощью AIC и KS."
            },
            {
                title: "Statistical inference",
                description:
                    "Проверка гипотез и исследование зависимостей."
            }
        ],

        conclusions: [
            "Все три величины имеют различную природу и форму распределений.",
            "Оценка качества имеет дискретную порядковую шкалу.",
            "Содержание алкоголя положительно связано с оценкой качества.",
            "Летучая кислотность имеет выраженную положительную асимметрию.",
            "Разброс выборочных средних уменьшается при росте объёма выборки."
        ],

        references: [
            {
                title: "UCI Machine Learning Repository",
                description: "Wine Quality Dataset",
                url: "https://archive.ics.uci.edu/dataset/186/wine+quality"
            },
            {
                title: "Cortez et al. (2009)",
                description:
                    "Modeling wine preferences by data mining from physicochemical properties.",
                url: "https://doi.org/10.1016/j.dss.2009.05.016"
            }
        ],

        generator: {
            status: "ready",
        
            description:
                "Условный генератор оценки качества при заданной крепости. " +
                "Распределение строится по k ближайшим винам обучающей выборки (k = 720).",
        
            method: "inverse_cdf",
            k: 720,
        
            // Демо-точка из ноутбука 01_generator / 05_generator_convergence
            demo: {
                alcohol: 12.0,
                unit: "% об.",
                qualities: [3, 4, 5, 6, 7, 8, 9],
                probabilities: [
                    0.002519,
                    0.013854,
                    0.075567,
                    0.505038,
                    0.322418,
                    0.078086,
                    0.002519
                ],
                mean: 6.375315,
                variance: 0.670222
            },
        
            // Сходимость оценок (из 05_generator_convergence)
            convergence: [
                { n: 10,     mean_rmse: 0.265768, mean_rmse_theory: 0.258886, variance_rmse: 0.407098, variance_rmse_theory: 0.375721 },
                { n: 30,     mean_rmse: 0.152308, mean_rmse_theory: 0.149468, variance_rmse: 0.217039, variance_rmse_theory: 0.211567 },
                { n: 100,    mean_rmse: 0.083704, mean_rmse_theory: 0.081867, variance_rmse: 0.121348, variance_rmse_theory: 0.114931 },
                { n: 300,    mean_rmse: 0.047256, mean_rmse_theory: 0.047266, variance_rmse: 0.066813, variance_rmse_theory: 0.066203 },
                { n: 1000,   mean_rmse: 0.025967, mean_rmse_theory: 0.025889, variance_rmse: 0.035098, variance_rmse_theory: 0.036232 },
                { n: 3000,   mean_rmse: 0.015582, mean_rmse_theory: 0.014947, variance_rmse: 0.020598, variance_rmse_theory: 0.020914 },
                { n: 10000,  mean_rmse: 0.008417, mean_rmse_theory: 0.008187, variance_rmse: 0.010864, variance_rmse_theory: 0.011454 },
                { n: 30000,  mean_rmse: 0.004653, mean_rmse_theory: 0.004727, variance_rmse: 0.006317, variance_rmse_theory: 0.006613 },
                { n: 100000, mean_rmse: 0.002574, mean_rmse_theory: 0.002589, variance_rmse: 0.003719, variance_rmse_theory: 0.003622 }
            ],
        
            // Сравнение с test (из 04_generator_comparison)
            realComparison: {
                n: 1302,
                tv: 0.0294,
                realMean: 5.8295,
                modelMean: 5.7816,
                realVariance: 0.7313,
                modelVariance: 0.7383
            },
        
            // Rejection sampling (из 06_rejection_generator)
            rejection: {
                acceptRateEmpirical: 0.2840,
                acceptRateTheory: 0.2829,
                medianMsInverse: 1.92,
                medianMsRejection: 4.29
            },
        
            math: {
                title: "Метод обратной функции распределения",
                formula: "P(Q* = qⱼ | x) = pⱼ(x)",
                note:
                    "Интервалы длины pⱼ на [0,1). U ~ Uniform[0,1) выбирает оценку. " +
                    "Среднее генератора совпадает со средним kNN-соседей."
            }
        }

    },

    // ======================================
    // LAB 02 — TEMPLATE
    // ======================================

    {
        id: "lab-02",
        number: "02",
        title: "Laboratory 02",
        subtitle: "Research title",

        status: "Not started",

        description:
            "Краткое описание второго исследования.",

        dataset: {
            name: "Dataset name",
            source: "Data source",
            url: "",
            description: "Описание датасета.",
            metrics: [],
            groups: []
        },

        variables: [],
        hypotheses: [],
        sampling: null,
        methods: [],
        conclusions: [],
        references: [],

        generator: {
            status: "planned",
            description: "Будущий модуль генератора."
        }
    },

    // ======================================
    // LAB 03 — TEMPLATE
    // ======================================

    {
        id: "lab-03",
        number: "03",
        title: "Laboratory 03",
        subtitle: "Research title",

        status: "Not started",
        description: "Краткое описание исследования.",

        dataset: {
            name: "Dataset name",
            source: "Data source",
            url: "",
            description: "Описание датасета.",
            metrics: [],
            groups: []
        },

        variables: [],
        hypotheses: [],
        sampling: null,
        methods: [],
        conclusions: [],
        references: [],

        generator: {
            status: "planned",
            description: "Будущий модуль генератора."
        }
    },

    // ======================================
    // LAB 04 — TEMPLATE
    // ======================================

    {
        id: "lab-04",
        number: "04",
        title: "Laboratory 04",
        subtitle: "Research title",

        status: "Not started",
        description: "Краткое описание исследования.",

        dataset: {
            name: "Dataset name",
            source: "Data source",
            url: "",
            description: "Описание датасета.",
            metrics: [],
            groups: []
        },

        variables: [],
        hypotheses: [],
        sampling: null,
        methods: [],
        conclusions: [],
        references: [],

        generator: {
            status: "planned",
            description: "Будущий модуль генератора."
        }
    }

];