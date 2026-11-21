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
                title:
                    "Различается ли средняя оценка красного и белого вина?",

                method: "Welch t-test",

                statement:
                    "H₀: μred = μwhite",

                result:
                    "H₀ отвергается",

                pValue: "8.17 × 10⁻²⁴",

                detail:
                    "Разность средних (red − white) = −0.2419. 95% CI [−0.2886; −0.1952]. Cohen's d = −0.2790."
            },

            {
                title:
                    "Связано ли содержание алкоголя с оценкой качества?",

                method: "Pearson / Spearman",

                statement:
                    "Alcohol × Quality",

                result:
                    "Связь значима",

                pValue: "p < 0.05",

                detail:
                    "Pearson r: 0.4762 для красного и 0.4356 для белого вина."
            },

            {
                title:
                    "Различается ли летучая кислотность?",

                method: "Mann–Whitney U",

                statement:
                    "Red wine ≠ White wine",

                result:
                    "Распределения различаются",

                pValue: "Численное underflow",

                detail:
                    "U = 7 059 623.5. Медианы: 0.52 для красного и 0.26 для белого."
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
            status: "planned",
            description:
                "Модуль генератора будет подключён после выбора алгоритма и его математического обоснования."
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