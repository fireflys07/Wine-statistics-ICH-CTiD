// ==========================================
// НАВИГАЦИЯ И СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==========================================

const NAV_ITEMS = [
    { id: "overview", title: "Обзор", number: "00" },
    { id: "dataset", title: "Датасет", number: "01" },
    { id: "variables", title: "Случайные величины", number: "02" },
    { id: "dependence", title: "Анализ зависимости", number: "03" },
    { id: "hypotheses", title: "Проверка гипотез", number: "04" },
    { id: "sampling", title: "Выборки", number: "05" },
    { id: "methods", title: "Методы исследования", number: "06" },
    { id: "distribution-fitting", title: "Модели распределений", number: "06A" },
    { id: "generator", title: "Генератор", number: "07" },
    { id: "conclusions", title: "Выводы", number: "08" },
    { id: "references", title: "Источники", number: "09" }
];

let currentLab = null;

let generatorTrainingRows = [];

let generatorTestRows = [];

let generatorTrainingLabId = null;

let activeGeneratorDemo = null;

// Кэш загруженных данных.
// При повторном открытии лабораторной CSV не скачиваются заново.
let generatorDatasetCache = null;

let generatorDatasetPromise = null;

// Наблюдатель за активной секцией.
let sectionObserver = null;

// Наблюдатель за новыми элементами интерфейса.
let uiTranslationObserver = null;


// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================

function init() {

    if (
        typeof LABS === "undefined" ||
        !Array.isArray(LABS) ||
        LABS.length === 0
    ) {
        console.error("Не найдены данные лабораторных работ.");
        return;
    }

    document.documentElement.lang = "ru";

    const selector = document.getElementById("labSelect");

    if (!selector) {
        console.error("Не найден элемент #labSelect в index.html.");
        return;
    }

    selector.innerHTML = LABS.map(lab => `
        <option value="${escapeHTML(lab.id)}">
            ЛАБОРАТОРНАЯ ${escapeHTML(lab.number)} — ${escapeHTML(lab.title)}
        </option>
    `).join("");

    selector.addEventListener("change", event => {
        renderLab(event.target.value);
    });

    renderLab(LABS[0].id);
}


// ==========================================
// 2. SECURITY / FORMATTING
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}
// ==========================================
// ПЕРЕВОД ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА
// ==========================================

const UI_TRANSLATIONS = [

    ["Random Number Generator", "Генератор случайных чисел"],
    ["Distribution fitting laboratory", "Лаборатория подбора распределений"],
    ["Distribution of sample means", "Распределение выборочных средних"],
    ["Hypothesis testing laboratory", "Лаборатория проверки гипотез"],
    ["Correlation laboratory", "Лаборатория корреляции"],
    ["Sampling simulator", "Симулятор выборок"],
    ["Dataset exploration", "Исследование датасета"],

    ["RESEARCH STRUCTURE", "СТРУКТУРА ИССЛЕДОВАНИЯ"],
    ["RESEARCH BRIEF", "КРАТКО ОБ ИССЛЕДОВАНИИ"],
    ["RESEARCH VARIABLES", "ИССЛЕДУЕМЫЕ ВЕЛИЧИНЫ"],
    ["RESEARCH QUESTIONS", "ИССЛЕДОВАТЕЛЬСКИЕ ВОПРОСЫ"],
    ["APPLIED STATISTICS", "ПРИКЛАДНАЯ СТАТИСТИКА"],

    ["DATASET DESCRIPTION", "ОПИСАНИЕ ДАТАСЕТА"],
    ["DATA PROFILE", "ПРОФИЛЬ ДАННЫХ"],
    ["DATA SOURCE", "ИСТОЧНИК ДАННЫХ"],
    ["ORIGINAL DATASET", "ИСХОДНЫЙ ДАТАСЕТ"],
    ["DATA PROVIDER", "ПОСТАВЩИК ДАННЫХ"],
    ["DATASET METRICS", "ПОКАЗАТЕЛИ ДАТАСЕТА"],
    ["DATA COMPOSITION", "СОСТАВ ДАННЫХ"],
    ["DATA STRUCTURE", "СТРУКТУРА ДАННЫХ"],
    ["DATA QUALITY", "КАЧЕСТВО ДАННЫХ"],

    ["RANDOM VARIABLES", "СЛУЧАЙНЫЕ ВЕЛИЧИНЫ"],
    ["STOCHASTIC NATURE", "СТОХАСТИЧЕСКАЯ ПРИРОДА"],
    ["DESCRIPTIVE STATISTICS", "ОПИСАТЕЛЬНАЯ СТАТИСТИКА"],
    ["EMPIRICAL DISTRIBUTION", "ЭМПИРИЧЕСКОЕ РАСПРЕДЕЛЕНИЕ"],
    ["GROUP SUMMARY", "СВОДНЫЕ ПОКАЗАТЕЛИ ГРУПП"],
    ["GROUP COMPARISON", "СРАВНЕНИЕ ГРУПП"],
    ["OUTLIER DETECTION", "ПОИСК ПОТЕНЦИАЛЬНЫХ ВЫБРОСОВ"],
    ["POTENTIAL OUTLIERS", "ПОТЕНЦИАЛЬНЫЕ ВЫБРОСЫ"],
    ["RESEARCH INTERPRETATION", "ИНТЕРПРЕТАЦИЯ РЕЗУЛЬТАТОВ"],

    ["NULL HYPOTHESIS", "НУЛЕВАЯ ГИПОТЕЗА"],
    ["ALTERNATIVE HYPOTHESIS", "АЛЬТЕРНАТИВНАЯ ГИПОТЕЗА"],
    ["STATISTICAL TEST", "СТАТИСТИЧЕСКИЙ КРИТЕРИЙ"],

    ["PROBABILITY DENSITY FUNCTIONS", "ПЛОТНОСТИ ВЕРОЯТНОСТИ"],
    ["THEORETICAL MOMENTS", "ТЕОРЕТИЧЕСКИЕ МОМЕНТЫ"],
    ["NORMAL DISTRIBUTION", "НОРМАЛЬНОЕ РАСПРЕДЕЛЕНИЕ"],
    ["LOGNORMAL DISTRIBUTION", "ЛОГНОРМАЛЬНОЕ РАСПРЕДЕЛЕНИЕ"],
    ["EXPONENTIAL DISTRIBUTION", "ЭКСПОНЕНЦИАЛЬНОЕ РАСПРЕДЕЛЕНИЕ"],
    ["SAMPLING CONVERGENCE", "СХОДИМОСТЬ ВЫБОРОЧНЫХ ОЦЕНОК"],

    ["Distribution fitting", "Подбор распределений"],
    ["Statistical inference", "Статистический вывод"],
    ["EDA Explorer", "Исследовательский анализ данных (EDA)"],
    ["Correlation laboratory", "Лаборатория корреляции"],

    ["Explore dataset", "Открыть датасет"],
    ["Explore variable", "Открыть описание величины"],
    ["View statistical hypotheses", "Перейти к проверке гипотез"],
    ["Open original dataset", "Открыть исходный датасет"],
    ["Variables not added yet.", "Переменные ещё не добавлены."],
    ["Research questions not added yet.", "Исследовательские вопросы ещё не добавлены."],

    ["Distribution of sample means", "Распределение выборочных средних"],
    ["Sample means histogram", "Гистограмма выборочных средних"],
    ["Sample size", "Объём выборки"],
    ["Sampling method", "Способ отбора"],
    ["Number of experiments", "Количество повторений"],

    ["With replacement", "С возвращением"],
    ["Without replacement", "Без возвращения"],

    ["SIMULATION COMPLETE", "МОДЕЛИРОВАНИЕ ЗАВЕРШЕНО"],
    ["RUN SIMULATION", "ЗАПУСТИТЬ МОДЕЛИРОВАНИЕ"],

    ["Population mean", "Среднее генеральной совокупности"],
    ["Mean of sample means", "Среднее выборочных средних"],
    ["Empirical SE", "Эмпирическая стандартная ошибка"],
    ["Theoretical SE", "Теоретическая стандартная ошибка"],
    ["Simulated mean", "Среднее моделирования"],
    ["Experiment results", "Результаты эксперимента"],

    [
        "Difference between empirical and theoretical SE",
        "Разница между эмпирической и теоретической стандартной ошибкой"
    ],

    ["Red std. deviation", "Стандартное отклонение — красное вино"],
    ["White std. deviation", "Стандартное отклонение — белое вино"],
    ["Red variance", "Дисперсия — красное вино"],
    ["White variance", "Дисперсия — белое вино"],
    ["Red mean", "Среднее — красное вино"],
    ["White mean", "Среднее — белое вино"],

    ["Mean alcohol content", "Среднее содержание алкоголя"],
    ["Mean volatile acidity", "Средняя летучая кислотность"],

    ["Alcohol content (% vol.)", "Содержание алкоголя (% об.)"],
    ["Alcohol (%)", "Содержание алкоголя (%)"],

    ["Observed mean", "Среднее исходной группы"],
    ["Observed variance", "Дисперсия исходной группы"],
    ["Probability density", "Плотность вероятности"],

    ["Pearson r", "Коэффициент Пирсона r"],
    ["Spearman ρ", "Коэффициент Спирмена ρ"],
    ["Pearson", "Пирсон"],
    ["Spearman", "Спирмен"],

    ["Quality", "Оценка качества"],
    ["Volatile acidity", "Летучая кислотность"],
    ["Alcohol", "Содержание алкоголя"],

    ["Discrete · Ordinal", "Дискретная · порядковая"],
    ["Continuous", "Непрерывная"],
    ["Score", "Балл"],

    ["Observations", "Наблюдения"],
    ["Random variables", "Случайные величины"],
    ["Hypotheses", "Гипотезы"],
    ["Variables", "Переменные"],
    ["Groups", "Группы"],
    ["Missing values", "Пропущенные значения"],
    ["Duplicates", "Дубликаты"],

    ["Mean", "Среднее"],
    ["Median", "Медиана"],
    ["Variance", "Дисперсия"],
    ["Std. dev.", "Стандартное отклонение"],
    ["Mode", "Мода"],
    ["Range", "Размах"],
    ["Skewness", "Асимметрия"],
    ["Kurtosis", "Эксцесс"],

    ["Red wine", "Красное вино"],
    ["White wine", "Белое вино"],

    ["Lower fence", "Нижняя граница"],
    ["Upper fence", "Верхняя граница"],

    ["Research stage", "Этап исследования"],
    ["planned", "запланирован"],
    ["READY", "ГОТОВО"],
    ["INTERACTIVE", "ИНТЕРАКТИВНО"],
    ["METHOD", "МЕТОД"],
    ["EXPERIMENT", "ЭКСПЕРИМЕНТ"],

    ["Random variables not added yet.", "Случайные величины ещё не добавлены."],
    ["Data visualization", "Визуализация данных"],
    ["Unknown type", "Тип не указан"],

    ["observations", "наблюдений"],
    ["records", "записей"],

    ["not defined", "не определена"],
    ["Open ↗", "Открыть ↗"],
    ["as a stochastic system", "как стохастическая система"],

    ["Cortez et al. (2009)", "Cortez et al. (2009)"],

    [
        "Modeling wine preferences by data mining from physicochemical properties.",
        "Моделирование предпочтений в отношении вина на основе физико-химических характеристик."
    ]

].sort((a, b) => b[0].length - a[0].length);


// Экранирование символов для регулярного выражения.
function escapeRegExp(value) {

    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

}


// Перевод отдельной строки интерфейса.
function translateUIString(value) {

    let text = String(value ?? "");

    // Эти названия не переводим.
    const protectedPhrases = [

        ["UCI Machine Learning Repository", "__KEEP_SOURCE__"],

        ["Wine Quality Dataset", "__KEEP_DATASET_FULL__"],

        ["Wine Quality", "__KEEP_DATASET__"],

        ["STAT LAB", "__KEEP_BRAND__"]

    ];

    protectedPhrases.forEach(([phrase, token]) => {

        text = text.replace(
            new RegExp(escapeRegExp(phrase), "gi"),
            token
        );

    });

    // Отдельная корректировка фразы о распределении quality.
    text = text.replace(
        /наблюдений quality/gi,
        "наблюдений с оценкой качества"
    );

    UI_TRANSLATIONS.forEach(([source, target]) => {

        text = text.replace(
            new RegExp(escapeRegExp(source), "gi"),
            target
        );

    });

    // Возвращаем защищённые названия.
    protectedPhrases.forEach(([phrase, token]) => {

        text = text.replaceAll(token, phrase);

    });

    return text;
}


// Перевод текста внутри HTML-элемента.
function translateDOMSubtree(root) {

    if (!root) return;

    const translateTextNode = node => {

        // Формулы, код и исходные фрагменты не переводим.
        if (
            node.parentElement?.closest(
                ".formula, code, pre, script, style"
            )
        ) {
            return;
        }

        node.nodeValue = translateUIString(node.nodeValue);
    };

    if (root.nodeType === 3) {
        translateTextNode(root);
        return;
    }

    if (
        root.nodeType === 1 &&
        root.matches(".formula, code, pre, script, style")
    ) {
        return;
    }

    const walker = document.createTreeWalker(
        root,
        window.NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        translateTextNode(node);
    }

    const elements = [];

    if (root.nodeType === 1) {
        elements.push(root);
    }

    if (typeof root.querySelectorAll === "function") {

        elements.push(
            ...root.querySelectorAll(
                "[aria-label], [title], [placeholder]"
            )
        );

    }

    elements.forEach(element => {

        ["aria-label", "title", "placeholder"].forEach(attribute => {

            if (element.hasAttribute(attribute)) {

                element.setAttribute(
                    attribute,
                    translateUIString(
                        element.getAttribute(attribute)
                    )
                );

            }

        });

    });

}


// Автоматический перевод динамически добавленных элементов.
function observeUITranslations(root) {

    if (!root) return;

    if (uiTranslationObserver) {
        uiTranslationObserver.disconnect();
        uiTranslationObserver = null;
    }

    translateDOMSubtree(root);

    if (typeof window.MutationObserver !== "function") {
        return;
    }

    uiTranslationObserver = new window.MutationObserver(records => {

        records.forEach(record => {

            record.addedNodes.forEach(node => {
                translateDOMSubtree(node);
            });

        });

    });

    uiTranslationObserver.observe(root, {
        childList: true,
        subtree: true
    });

}

// ==========================================
// ОТРИСОВКА ЛАБОРАТОРНОЙ
// ==========================================

function renderLab(labId) {

    currentLab = LABS.find(lab => lab.id === labId);

    if (!currentLab) {
        console.error("Лабораторная не найдена:", labId);
        return;
    }

    document.title = `STAT LAB — ${currentLab.title}`;

    const breadcrumb = document.getElementById("breadcrumb");

    if (breadcrumb) {

        breadcrumb.innerHTML = `
            ИССЛЕДОВАНИЕ /
            <strong>
                ЛАБОРАТОРНАЯ ${escapeHTML(currentLab.number)} —
                ${escapeHTML(currentLab.title)}
            </strong>
        `;

    }

    const status = document.getElementById("labStatus");

    if (status) {
        status.textContent = translateUIString(currentLab.status);
    }

    renderNavigation();
    renderContent();

    document.querySelector(".main")?.scrollTo({
        top: 0,
        behavior: "auto"
    });

    attachInteractions();
}


// ==========================================
// ПОСТРОЕНИЕ НАВИГАЦИИ
// ==========================================

function renderNavigation() {

    const nav = document.getElementById("sectionNav");

    if (!nav) {
        console.error("Не найден элемент #sectionNav.");
        return;
    }

    nav.innerHTML = `

        <div class="nav-label">
            СТРУКТУРА ИССЛЕДОВАНИЯ
        </div>

        ${NAV_ITEMS.map(item => `

            <a
                href="#${escapeHTML(item.id)}"
                class="nav-link"
            >

                <span class="nav-number">
                    ${escapeHTML(item.number)}
                </span>

                ${escapeHTML(item.title)}

            </a>

        `).join("")}

    `;

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const target = document.getElementById(
                link.getAttribute("href").slice(1)
            );

            target?.scrollIntoView({
                behavior: "smooth"
            });

        });

    });

}


// ==========================================
// ОСНОВНОЙ КОНТЕНТ
// ==========================================

function renderContent() {

    const page = document.getElementById("pageContent");

    if (!page) {
        console.error("Не найден элемент #pageContent.");
        return;
    }

    const lab = currentLab;

    page.innerHTML = `

        ${renderOverview(lab)}

        ${renderDataset(lab)}

        ${renderVariables(lab)}

        ${renderDependence(lab)}

        ${renderHypotheses(lab)}

        ${renderSampling(lab)}

        ${renderMethods(lab)}

        ${renderDistributionFitting(lab)}

        ${renderGenerator(lab)}

        ${renderConclusions(lab)}

        ${renderReferences(lab)}

        <footer class="footer">

            <span>STAT LAB</span>

            <span>ЛАБОРАТОРНАЯ ${escapeHTML(lab.number)}</span>

            <span>ПРИКЛАДНАЯ СТАТИСТИКА</span>

        </footer>

    `;

    // Переводим весь сформированный интерфейс.
    observeUITranslations(page);

    observeSections();
}


// ==========================================
// HIGHLIGHT ACTIVE SECTION IN NAV
// ==========================================

function observeSections() {

    if (sectionObserver) {
        sectionObserver.disconnect();
        sectionObserver = null;
    }

    const links = document.querySelectorAll("#sectionNav .nav-link");
    const sections = Array.from(links)
        .map(link => {
            const id = link.getAttribute("href")?.slice(1);
            return id ? document.getElementById(id) : null;
        })
        .filter(Boolean);

    if (!sections.length || typeof IntersectionObserver !== "function") {
        return;
    }

    const setActive = (id) => {
        links.forEach(link => {
            const match = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", match);
        });
    };

    sectionObserver = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visible.length) {
                setActive(visible[0].target.id);
            }
        },
        {
            root: document.querySelector(".main") || null,
            rootMargin: "-10% 0px -60% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    sections.forEach(section => sectionObserver.observe(section));
}


// ==========================================
// 6. OVERVIEW
// ==========================================


function renderOverview(lab) {
    const metrics = lab.dataset.metrics || [];
    const variables = lab.variables || [];
    const hypotheses = lab.hypotheses || [];

    return `
        <section class="hero" id="overview">
            <div class="hero-content">

                <div class="eyebrow">
                    APPLIED STATISTICS · RESEARCH ${escapeHTML(lab.number)}
                </div>

                <h1>${escapeHTML(lab.title)}</h1>

                <p>${escapeHTML(lab.description)}</p>

                <div class="hero-meta">
                    <span>
                        <b>${metrics[0]?.value || "—"}</b>
                        Observations
                    </span>

                    <span>
                        <b>${variables.length}</b>
                        Random variables
                    </span>

                    <span>
                        <b>${hypotheses.length}</b>
                        Hypotheses
                    </span>
                </div>

            </div>
        </section>

        <section class="grid metrics">
            ${metrics.map(metric => `
                <div class="card metric">
                    <div class="metric-label">
                        ${escapeHTML(metric.label)}
                    </div>

                    <div class="metric-value">
                        ${escapeHTML(metric.value)}
                    </div>
                </div>
            `).join("")}
        </section>

        <section class="grid two-col">

            <div class="card">
                <span class="tag">RESEARCH BRIEF</span>

                <h3>Цель исследования</h3>

                <p>${escapeHTML(lab.subtitle || lab.description)}</p>

                <div class="divider"></div>

                <p class="muted">
                    Исходный набор данных:
                    <strong>${escapeHTML(lab.dataset.name)}</strong>
                </p>

                <a href="#dataset" class="text-link">
                    Explore dataset ↗
                </a>
            </div>

            <div class="card">
                <span class="tag">RESEARCH VARIABLES</span>

                <h3>Исследуемые величины</h3>

                ${variables.length ? `
                    ${variables.map(variable => `
                        <div class="composition-item">
                            <div class="composition-label">
                                <span>
                                    ${escapeHTML(variable.code)}
                                    ·
                                    ${escapeHTML(variable.name)}
                                </span>

                                <strong>
                                    ${escapeHTML(variable.symbol)}
                                </strong>
                            </div>

                            <p class="muted">
                                ${escapeHTML(variable.type)}
                            </p>

                            <a
                                href="#variable-${variable.id}"
                                class="text-link"
                            >
                                Explore variable ↗
                            </a>
                        </div>
                    `).join("")}
                ` : emptyState("Variables not added yet.")}
            </div>

        </section>

        <section class="card">
            <span class="tag">RESEARCH QUESTIONS</span>

            <h3>Основные исследовательские вопросы</h3>

            ${hypotheses.length ? `
                <ol class="conclusion-list">
                    ${hypotheses.map(hypothesis => `
                        <li>${escapeHTML(hypothesis.title)}</li>
                    `).join("")}
                </ol>
            ` : emptyState("Research questions not added yet.")}

            <a href="#hypotheses" class="text-link">
                View statistical hypotheses ↗
            </a>
        </section>
    `;
}



// ==========================================
// ПРОФИЛЬ ДАТАСЕТА
// ==========================================

function renderDataset(lab) {

    const data = lab.dataset || {};

    const groups = Array.isArray(data.groups)
        ? data.groups
        : [];

    const metrics = Array.isArray(data.metrics)
        ? data.metrics
        : [];

    const variables = Array.isArray(lab.variables)
        ? lab.variables
        : [];

    // Ищем количество наблюдений в характеристиках датасета.
    const observationsMetric = metrics.find(metric =>
        /observation/i.test(metric.label)
    );

    // Ищем количество переменных исходного датасета.
    const variablesMetric = metrics.find(metric =>
        /variables/i.test(metric.label)
    );

    const observationsValue = observationsMetric?.value || "—";

    const variableCount = variablesMetric?.value || "—";

    const parsedObservations = Number(
        String(observationsValue).replace(/\s/g, "")
    );

    const total = Number.isFinite(parsedObservations) &&
        parsedObservations > 0
            ? parsedObservations
            : groups.reduce(
                (sum, group) => sum + Number(group.value || 0),
                0
            );

    return `

        <section class="section" id="dataset">

            ${sectionHeader(
                "01 / ПРОФИЛЬ ДАННЫХ",
                "Исследование датасета",
                "Структура, состав и качество исходного набора данных."
            )}


            <div class="card">

                <div class="section-head">

                    <div>

                        <span class="tag">ИСТОЧНИК ДАННЫХ</span>

                        <h3>${escapeHTML(data.name || "Не указан")}</h3>

                    </div>

                    <span class="muted">
                        ИСХОДНЫЙ ДАТАСЕТ
                    </span>

                </div>


                <p class="muted">
                    ${escapeHTML(data.description || "")}
                </p>


                <div class="divider"></div>


                <div class="grid two-col">

                    <div>

                        <small class="muted">
                            ИСТОЧНИК
                        </small>

                        <p>
                            <strong>
                                ${escapeHTML(data.source || "Не указан")}
                            </strong>
                        </p>

                    </div>


                    <div>

                        <small class="muted">
                            КОЛИЧЕСТВО НАБЛЮДЕНИЙ
                        </small>

                        <p>
                            <strong>
                                ${total.toLocaleString("ru-RU")}
                            </strong>
                        </p>

                    </div>

                </div>


                ${data.url ? `

                    <a
                        href="${escapeHTML(data.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-link"
                    >
                        Открыть исходный датасет ↗
                    </a>

                ` : ""}

            </div>


            <div class="grid metrics">

                ${metrics.map(metric => `

                    <div class="card metric">

                        <div class="metric-label">
                            ${escapeHTML(metric.label)}
                        </div>

                        <div class="metric-value">
                            ${escapeHTML(metric.value)}
                        </div>

                    </div>

                `).join("")}

            </div>


            <div class="card">

                <div class="section-head">

                    <div>

                        <span class="tag">СОСТАВ ДАННЫХ</span>

                        <h3>Распределение наблюдений</h3>

                    </div>

                    <span class="muted">
                        ${total.toLocaleString("ru-RU")} записей
                    </span>

                </div>


                ${groups.length ? `

                    ${groups.map(group => {

                        const groupValue = Number(group.value);

                        const percentage = total > 0
                            ? groupValue / total * 100
                            : 0;

                        return `

                            <div class="composition-item">

                                <div class="composition-label">

                                    <span>
                                        ${escapeHTML(group.label)}
                                    </span>

                                    <strong>
                                        ${groupValue.toLocaleString("ru-RU")}
                                        · ${percentage.toFixed(1)}%
                                    </strong>

                                </div>

                                <div class="progress">

                                    <div
                                        class="progress-fill"
                                        style="width:${percentage}%"
                                    ></div>

                                </div>

                            </div>

                        `;

                    }).join("")}

                ` : emptyState(
                    "Группы данных пока не добавлены."
                )}

            </div>


            <div class="grid two-col">


                <div class="card">

                    <span class="tag">СТРУКТУРА</span>

                    <h3>Структура исследования</h3>

                    <div class="statistics-grid">

                        <div class="stat">

                            <small>Количество наблюдений</small>

                            <strong>
                                ${total.toLocaleString("ru-RU")}
                            </strong>

                        </div>


                        <div class="stat">

                            <small>Переменных в датасете</small>

                            <strong>
                                ${escapeHTML(variableCount)}
                            </strong>

                        </div>


                        <div class="stat">

                            <small>Количество групп</small>

                            <strong>
                                ${groups.length}
                            </strong>

                        </div>


                        <div class="stat">

                            <small>Исследуемых величин</small>

                            <strong>
                                ${variables.length}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="card">

                    <span class="tag">КАЧЕСТВО ДАННЫХ</span>

                    <h3>Контроль качества данных</h3>


                    ${metrics.filter(metric =>
                        /missing|duplicate/i.test(metric.label)
                    ).length ? `

                        ${metrics.filter(metric =>
                            /missing|duplicate/i.test(metric.label)
                        ).map(metric => `

                            <div class="composition-item">

                                <div class="composition-label">

                                    <span>
                                        ${escapeHTML(metric.label)}
                                    </span>

                                    <strong>
                                        ${escapeHTML(metric.value)}
                                    </strong>

                                </div>

                            </div>

                        `).join("")}

                    ` : emptyState(
                        "Информация о пропусках и дубликатах не добавлена."
                    )}

                </div>

            </div>

        </section>

    `;
}




// ==========================================
// 8. RANDOM VARIABLES
// ==========================================

function renderVariables(lab) {

    if (!lab.variables.length) {
        return `
            <section class="section" id="variables">
                ${sectionHeader(
                    "02 / VARIABLES",
                    "Random variables",
                    "Исследуемые случайные величины."
                )}
                ${emptyState("Добавь случайные величины в data.js.")}
            </section>
        `;
    }

    return `

        <section class="section" id="variables">

            ${sectionHeader(
                "02 / RANDOM VARIABLES",
                "Исследуемые величины",
                "Каждая величина рассматривается отдельно."
            )}

            <div class="variable-grid">

                ${lab.variables.map(variable => `
                    <a href="#variable-${variable.id}"
                       class="card variable-card">

                        <span class="nav-number">
                            ${escapeHTML(variable.code)}
                        </span>

                        <h3>${escapeHTML(variable.name)}</h3>

                        <p>${escapeHTML(variable.type)}</p>

                        <div class="variable-footer">
                            <strong>${escapeHTML(variable.symbol)}</strong>
                            <span>Explore ↗</span>
                        </div>

                    </a>
                `).join("")}

            </div>

            ${lab.variables.map((variable, index) => `
                ${renderVariable(variable, index)}
            `).join("")}

        </section>

    `;
}


// ==========================================
// 9. SINGLE VARIABLE
// ==========================================

function renderVariable(variable, index) {

    return `

        <article class="section" id="variable-${variable.id}">

            ${sectionHeader(
                `${index + 1} / ${variable.code}`,
                variable.name,
                variable.type + " · " + variable.unit
            )}

            <div class="grid two-col">

                <div class="card">

                    <span class="tag">DESCRIPTION</span>

                    <h3>Природа величины</h3>

                    <p>
                        ${escapeHTML(variable.description)}
                    </p>

                    <div class="divider"></div>

                    <span class="tag">STOCHASTIC NATURE</span>

                    <p>
                        ${escapeHTML(variable.nature)}
                    </p>

                    <div class="formula">
                        ${escapeHTML(variable.formula)}
                    </div>

                </div>


                <div class="card">

                    <span class="tag">STATISTICS</span>

                    <h3>Описательные характеристики</h3>

                    <div class="statistics-grid">

                        ${variable.statistics.map(stat => `
                            <div class="stat">

                                <small>
                                    ${escapeHTML(stat.label)}
                                </small>

                                <strong>
                                    ${escapeHTML(stat.value)}
                                </strong>

                            </div>
                        `).join("")}

                    </div>

                </div>

            </div>


            ${variable.chart ? `

                <div class="card chart-card">

                    <div class="section-head">

                        <div>
                            <span class="tag">DISTRIBUTION</span>
                            <h3>${escapeHTML(variable.chart.title)}</h3>
                        </div>

                        <span class="muted">
                            ${escapeHTML(variable.chart.unit)}
                        </span>

                    </div>

                    ${renderBarChart(variable.chart)}

                </div>

            ` : ""}


            <div class="note">
                <strong>Вывод исследования.</strong>
                ${escapeHTML(variable.conclusion)}
            </div>

        </article>

    `;
}


// ==========================================
// 10. SVG BAR CHART
// ==========================================

function renderBarChart(chart) {

    const labels = chart.labels;
    const values = chart.values;

    if (!labels.length || !values.length ||
        labels.length !== values.length ||
        values.some(v => !Number.isFinite(v) || v < 0)) {
        return emptyState("Недостаточно данных для графика.");
    }

    const width = 680;
    const height = 270;

    const left = 48;
    const right = 20;
    const top = 30;
    const bottom = 55;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const maxValue = Math.max(...values) * 1.15 || 1;

    const step = plotWidth / values.length;
    const barWidth = Math.min(54, step * 0.62);

    let elements = "";

    // Горизонтальные линии сетки
    for (let i = 0; i <= 4; i++) {

        const value = maxValue * i / 4;
        const y = top + plotHeight - (value / maxValue) * plotHeight;

        elements += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 8}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${value.toFixed(1)}
            </text>
        `;
    }

    values.forEach((value, index) => {

        const x = left + index * step + (step - barWidth) / 2;

        const barHeight = value / maxValue * plotHeight;

        const y = top + plotHeight - barHeight;

        elements += `

            <rect
                x="${x}"
                y="${y}"
                width="${barWidth}"
                height="${barHeight}"
                rx="5"
                class="chart-bar"
            />

            <text
                x="${x + barWidth / 2}"
                y="${y - 8}"
                text-anchor="middle"
                class="chart-value"
            >
                ${value.toLocaleString("ru-RU")}
            </text>

            <text
                x="${x + barWidth / 2}"
                y="${height - 22}"
                text-anchor="middle"
                class="chart-label"
            >
                ${escapeHTML(labels[index])}
            </text>

        `;

    });

    return `

        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="${escapeHTML(chart.title)}"
        >

            ${elements}

            <line
                x1="${left}"
                y1="${top + plotHeight}"
                x2="${width - right}"
                y2="${top + plotHeight}"
                class="axis-line"
            />

        </svg>

    `;
}

// ==========================================
// DEPENDENCE ANALYSIS
// ==========================================

function renderDependence(lab) {
    const alcohol = lab.variables.find(v => v.id === "alcohol");
    const acidity = lab.variables.find(v => v.id === "acidity");

    if (!alcohol || !acidity) {
        return `
            <section class="section" id="dependence">
                ${sectionHeader(
                    "03 / DEPENDENCE ANALYSIS",
                    "Анализ зависимости",
                    "Исследование статистической связи между случайными величинами."
                )}
                ${emptyState("Для анализа нужны две переменные.")}
            </section>
        `;
    }

    return `
        <section class="section" id="dependence">

            ${sectionHeader(
                "03 / DEPENDENCE ANALYSIS",
                "Интерактивный анализ зависимости",
                "Исследуй, как сила статистической связи и размер выборки влияют на корреляцию."
            )}

            <div class="grid two-col">

                <div class="card">
                    <span class="tag">VARIABLE X</span>
                    <h3>${escapeHTML(alcohol.name)}</h3>
                    <p>${escapeHTML(alcohol.description)}</p>
                    <div class="formula">${escapeHTML(alcohol.symbol)}</div>
                </div>

                <div class="card">
                    <span class="tag">VARIABLE Y</span>
                    <h3>${escapeHTML(acidity.name)}</h3>
                    <p>${escapeHTML(acidity.description)}</p>
                    <div class="formula">${escapeHTML(acidity.symbol)}</div>
                </div>

            </div>

            <div class="card dependence-card">

                <div class="experiment-top">
                    <div>
                        <span class="tag">EXPERIMENT 002</span>
                        <h3>Correlation laboratory</h3>
                        <p class="muted">
                            Демонстрационная модель корреляции на синтетических данных.
                        </p>
                    </div>

                    <span class="experiment-status">
                        ● INTERACTIVE
                    </span>
                </div>

                <div class="dependence-controls">

                    <div class="control-field">
                        <label for="dependenceScenario">
                            Сценарий зависимости
                        </label>

                        <select id="dependenceScenario" class="select">
                            <option value="0">Связь отсутствует</option>
                            <option value="0.25">Слабая положительная</option>
                            <option value="0.65" selected>Умеренная положительная</option>
                            <option value="-0.55">Умеренная отрицательная</option>
                        </select>
                    </div>

                    <div class="control-field">
                        <label for="dependenceSize">
                            Размер выборки
                            <output id="dependenceSizeOutput">100</output>
                        </label>

                        <input
                            id="dependenceSize"
                            type="range"
                            min="30"
                            max="300"
                            step="10"
                            value="100"
                        />

                        <div class="range-labels">
                            <span>30</span>
                            <span>300</span>
                        </div>
                    </div>

                </div>

                <div id="dependenceResult">

                    <div class="dependence-metrics">
                        <div class="result-metric">
                            <small>Sample size</small>
                            <strong>100</strong>
                        </div>
                        <div class="result-metric">
                            <small>Pearson r</small>
                            <strong>—</strong>
                        </div>
                        <div class="result-metric">
                            <small>Spearman ρ</small>
                            <strong>—</strong>
                        </div>
                    </div>

                    <div class="empty-state">
                        Подготовка демонстрационного эксперимента...
                    </div>

                </div>

            </div>

            <div class="grid two-col">

                <div class="card">
                    <span class="tag">PEARSON</span>
                    <h3>Линейная корреляция</h3>

                    <div class="formula">
                        r = Cov(X, Y) / (σₓ · σᵧ)
                    </div>

                    <p>
                        Коэффициент Пирсона оценивает направление и силу
                        линейной связи. Принимает значения от −1 до +1.
                    </p>
                </div>

                <div class="card">
                    <span class="tag">SPEARMAN</span>
                    <h3>Ранговая корреляция</h3>

                    <div class="formula">
                        ρ = Corr(rank(X), rank(Y))
                    </div>

                    <p>
                        Коэффициент Спирмена оценивает монотонную связь
                        между переменными на основе их рангов.
                    </p>
                </div>

            </div>

            <div class="note">
                <strong>Важно.</strong>
                Корреляция не доказывает причинно-следственную связь.
                Нулевая корреляция также не означает независимость
                случайных величин.
            </div>

        </section>
    `;
}
// ==========================================
// 11. HYPOTHESES
// ==========================================

function renderHypotheses(lab) {

    const hypotheses = Array.isArray(lab.hypotheses)
        ? lab.hypotheses
        : [];

    if (!hypotheses.length) {
        return `
            <section class="section" id="hypotheses">

                ${sectionHeader(
                    "04 / HYPOTHESIS TESTING",
                    "Проверка статистических гипотез",
                    "Исследование статистических предположений."
                )}

                ${emptyState(
                    "Гипотезы пока не добавлены в data.js."
                )}

            </section>
        `;
    }

    return `
        <section class="section" id="hypotheses">

            ${sectionHeader(
                "04 / HYPOTHESIS TESTING",
                "Проверка статистических гипотез",
                "Выбирай гипотезу и уровень значимости, чтобы изучить процесс статистического решения."
            )}

            <div class="card hypothesis-lab">

                <div class="experiment-top">

                    <div>
                        <span class="tag">EXPERIMENT 003</span>

                        <h3>Hypothesis testing laboratory</h3>

                        <p class="muted">
                            Статистические результаты текущего исследования.
                        </p>
                    </div>

                    <span class="experiment-status">
                        ● INTERACTIVE
                    </span>

                </div>

                <div class="hypothesis-controls">

                    <div class="control-field">

                        <label for="hypothesisSelect">
                            Исследуемая гипотеза
                        </label>

                        <select id="hypothesisSelect" class="select">

                            ${hypotheses.map(hypothesis => `
                                <option value="${escapeHTML(hypothesis.id)}">
                                    ${escapeHTML(hypothesis.title)}
                                </option>
                            `).join("")}

                        </select>

                    </div>

                    <div class="control-field">

                        <label>Уровень значимости (α)</label>

                        <div class="alpha-options">

                            <button
                                type="button"
                                class="hypothesis-alpha-button"
                                data-alpha="0.01"
                                aria-pressed="false"
                            >
                                0.01
                            </button>

                            <button
                                type="button"
                                class="hypothesis-alpha-button is-selected"
                                data-alpha="0.05"
                                aria-pressed="true"
                            >
                                0.05
                            </button>

                            <button
                                type="button"
                                class="hypothesis-alpha-button"
                                data-alpha="0.10"
                                aria-pressed="false"
                            >
                                0.10
                            </button>

                        </div>

                    </div>

                </div>

                <div id="hypothesisResult"></div>

            </div>

            <div class="grid two-col">

                <div class="card">

                    <span class="tag">NULL HYPOTHESIS</span>

                    <h3>Нулевая гипотеза H₀</h3>

                    <p>
                        Предположение об отсутствии эффекта,
                        различий или статистической связи.
                    </p>

                </div>

                <div class="card">

                    <span class="tag">ALTERNATIVE HYPOTHESIS</span>

                    <h3>Альтернативная гипотеза H₁</h3>

                    <p>
                        Предположение о наличии эффекта,
                        различий или статистической связи.
                    </p>

                </div>

            </div>

            <div class="note">

                <strong>Как читать уровень значимости?</strong>

                α — заранее заданный порог вероятности ошибки первого рода.
                Если p-value не превышает α, нулевая гипотеза отклоняется.

                Это не вероятность того, что H₀ истинна.

            </div>

        </section>
    `;
}


// ==========================================
// 12. SAMPLING
// ==========================================

function renderSampling(lab) {
    const quality = lab.variables.find(
        variable => variable.id === "quality"
    );
    // Данные для графика зависимости ошибки от размера выборки.
    const sampling = lab.sampling;

    // График строим только при наличии хотя бы двух точек.
    const hasSamplingTrend =
    Array.isArray(sampling?.points) &&
    sampling.points.length >= 2;

    if (!quality?.chart?.values?.length) {
        return `
            <section class="section" id="sampling">
                ${sectionHeader(
                    "05 / SAMPLING",
                    "Sampling experiment",
                    "Исследование выборочных оценок."
                )}
                ${emptyState("Данные для эксперимента отсутствуют.")}
            </section>
        `;
    }

    return `
        <section class="section" id="sampling">

            ${sectionHeader(
                "05 / INTERACTIVE EXPERIMENT",
                "Sampling simulator",
                "Исследуй влияние размера выборки и способа отбора на точность оценки."
            )}

            <div class="card experiment-card">

                <div class="experiment-top">
                    <div>
                        <span class="tag">EXPERIMENT 001</span>
                        <h3>Distribution of sample means</h3>
                        <p class="muted">
                            Генеральная совокупность:
                            ${quality.chart.values.reduce((a, b) => a + b, 0)}
                            наблюдений quality.
                        </p>
                    </div>

                    <span class="experiment-status">
                        ● READY
                    </span>
                </div>

                <div class="experiment-controls">

                    <div class="control-field">
                        <label for="samplingMode">
                            Sampling method
                        </label>

                        <select id="samplingMode" class="select">
                            <option value="with">
                                With replacement
                            </option>
                            <option value="without">
                                Without replacement
                            </option>
                        </select>
                    </div>

                    <div class="control-field">

                        <label for="sampleSizeInput">
                            Sample size
                            <output id="sampleSizeOutput">100</output>
                        </label>

                        <input
                            id="sampleSizeInput"
                            type="range"
                            min="10"
                            max="2000"
                            step="10"
                            value="100"
                        >

                        <div class="range-labels">
                            <span>10</span>
                            <span>2000</span>
                        </div>

                    </div>

                    <div class="control-field">

                        <label for="repeatInput">
                            Number of experiments
                            <output id="repeatOutput">1000</output>
                        </label>

                        <input
                            id="repeatInput"
                            type="range"
                            min="100"
                            max="3000"
                            step="100"
                            value="1000"
                        >

                        <div class="range-labels">
                            <span>100</span>
                            <span>3000</span>
                        </div>

                    </div>

                    <button
                        id="runSampling"
                        class="primary-button"
                        type="button"
                    >
                        <span>↗</span>
                        RUN SIMULATION
                    </button>

                </div>

                <div id="samplingResult" class="simulation-result">

                    <div class="empty-state">
                        Измени параметры эксперимента и нажми
                        RUN SIMULATION.
                    </div>

                </div>

                </div>

                ${hasSamplingTrend ? `
                    <div class="card chart-card sampling-trend-card">
    
                        <div class="section-head">
                            <div>
                                <span class="tag">SAMPLING CONVERGENCE</span>
                                <h3>Влияние размера выборки на стандартную ошибку</h3>
                            </div>
                        </div>
    
                        <div id="samplingChart"></div>
    
                        <div class="note">
                            <strong>Как читать график?</strong>
    
                            При увеличении размера выборки стандартная ошибка
                            среднего уменьшается. При отборе без возвращения
                            дополнительно учитывается поправка на конечную
                            генеральную совокупность.
                        </div>
    
                    </div>
                ` : ""}
    
            </section>
        `;
    }

// ==========================================
// DISTRIBUTION FITTING — DATA
// ==========================================

function getAlcoholDistributionData(lab, group) {

    const variable = lab.variables?.find(
        item => item.id === "alcohol"
    );

    if (!variable) return null;

    const prefix = group === "red" ? "Red" : "White";

    const getStatistic = label => {

        const item = variable.statistics?.find(
            stat => stat.label.toLowerCase() === label.toLowerCase()
        );

        if (!item) return null;

        const value = Number(item.value);

        return Number.isFinite(value) ? value : null;
    };

    const mean = getStatistic(`${prefix} mean`);
    const variance = getStatistic(`${prefix} variance`);

    if (
        mean === null ||
        variance === null ||
        mean <= 0 ||
        variance <= 0
    ) {
        return null;
    }

    const sd = Math.sqrt(variance);

    // Моментные оценки параметров логнормального распределения.
    const logVariance = Math.log(
        1 + variance / mean ** 2
    );

    const logSigma = Math.sqrt(logVariance);
    const logMu = Math.log(mean) - logVariance / 2;

    const groupLabel = group === "red" ? "red" : "white";

    const groupItem = lab.dataset?.groups?.find(item =>
        item.label.toLowerCase().includes(groupLabel)
    );
    
    const sampleSize = Number(groupItem?.value);
    
    if (!Number.isFinite(sampleSize) || sampleSize <= 0) {
        return null;
    }

    return {

        group,
        mean,
        variance,
        sampleSize,
        sd,

        normal: {
            mu: mean,
            sigma: sd
        },

        lognormal: {
            mu: logMu,
            sigma: logSigma
        },

        exponential: {
            lambda: 1 / mean
        }

    };
}

// ==========================================
// DISTRIBUTION FITTING — INTERFACE
// ==========================================

function renderDistributionFitting(lab) {

    const initial = getAlcoholDistributionData(lab, "red");

    if (!initial) {

        return `
            <section class="section" id="distribution-fitting">
    
                ${sectionHeader(
                    "06A / DISTRIBUTION MODELS",
                    "Сравнение распределений",
                    "Интерактивное исследование теоретических моделей."
                )}
    
                <div class="card">
    
                    <span class="tag">NOT AVAILABLE</span>
    
                    <h3>Недостаточно исходных характеристик</h3>
    
                    <p class="muted">
                        Для сравнения моделей необходимы среднее
                        и дисперсия исследуемой величины.
                        Они пока не добавлены в текущую лабораторную.
                    </p>
    
                </div>
    
            </section>
        `;
    }

    return `
        <section class="section" id="distribution-fitting">

            ${sectionHeader(
                "06A / DISTRIBUTION MODELS",
                "Сравнение теоретических распределений",
                "Изучение формы нормального, логнормального и экспоненциального распределений."
            )}

            <div class="card distribution-lab">

                <div class="experiment-top">

                    <div>
                        <span class="tag">EXPERIMENT 006</span>

                        <h3>Distribution fitting laboratory</h3>

                        <p class="muted">
                            Сравнивай теоретические плотности и меняй
                            параметры математических моделей.
                        </p>
                    </div>

                    <span class="experiment-status">
                        ● INTERACTIVE
                    </span>

                </div>


                <div class="distribution-group-control">

                    <div class="control-field">

                        <label for="distributionGroup">
                            Группа наблюдений
                        </label>

                        <select
                            id="distributionGroup"
                            class="select"
                        >

                            <option value="red">
                                Red wine
                            </option>

                            <option value="white">
                                White wine
                            </option>

                        </select>

                    </div>

                    <button
                        type="button"
                        id="resetDistributionParameters"
                        class="distribution-reset"
                    >
                        Сбросить параметры
                    </button>

                </div>


                <div class="distribution-observed" id="distributionObserved"></div>


                <div class="distribution-model-controls">

                    <div class="distribution-model-control">

                        <span class="tag">NORMAL DISTRIBUTION</span>

                        <h4>Нормальное распределение</h4>

                        <div class="distribution-range">

                            <label for="normalMu">
                                Среднее μ
                                <output id="normalMuOutput">
                                    ${initial.normal.mu.toFixed(3)}
                                </output>
                            </label>

                            <input
                                type="range"
                                id="normalMu"
                                min="8"
                                max="13"
                                step="0.01"
                                value="${initial.normal.mu}"
                            />

                        </div>

                        <div class="distribution-range">

                            <label for="normalSigma">
                                Стандартное отклонение σ
                                <output id="normalSigmaOutput">
                                    ${initial.normal.sigma.toFixed(3)}
                                </output>
                            </label>

                            <input
                                type="range"
                                id="normalSigma"
                                min="0.3"
                                max="2.5"
                                step="0.01"
                                value="${initial.normal.sigma}"
                            />

                        </div>

                    </div>


                    <div class="distribution-model-control">

                        <span class="tag">LOGNORMAL DISTRIBUTION</span>

                        <h4>Логнормальное распределение</h4>

                        <div class="distribution-range">

                            <label for="lognormalMu">
                                Параметр μ log
                                <output id="lognormalMuOutput">
                                    ${initial.lognormal.mu.toFixed(3)}
                                </output>
                            </label>

                            <input
                                type="range"
                                id="lognormalMu"
                                min="2"
                                max="2.7"
                                step="0.001"
                                value="${initial.lognormal.mu}"
                            />

                        </div>

                        <div class="distribution-range">

                            <label for="lognormalSigma">
                                Параметр σ log
                                <output id="lognormalSigmaOutput">
                                    ${initial.lognormal.sigma.toFixed(3)}
                                </output>
                            </label>

                            <input
                                type="range"
                                id="lognormalSigma"
                                min="0.03"
                                max="0.35"
                                step="0.001"
                                value="${initial.lognormal.sigma}"
                            />

                        </div>

                    </div>


                    <div class="distribution-model-control">

                        <span class="tag">EXPONENTIAL DISTRIBUTION</span>

                        <h4>Экспоненциальное распределение</h4>

                        <div class="distribution-range">

                            <label for="exponentialLambda">
                                Интенсивность λ
                                <output id="exponentialLambdaOutput">
                                    ${initial.exponential.lambda.toFixed(3)}
                                </output>
                            </label>

                            <input
                                type="range"
                                id="exponentialLambda"
                                min="0.04"
                                max="0.2"
                                step="0.001"
                                value="${initial.exponential.lambda}"
                            />

                        </div>

                    </div>

                </div>


                <div id="distributionFittingResult">

                    <div class="empty-state">
                        Подготовка теоретических моделей...
                    </div>

                </div>

            </div>


            <div class="note">

                <strong>Важно.</strong>

                Начальные параметры рассчитаны методом моментов
                по агрегированным характеристикам alcohol.

                Теоретические кривые не являются эмпирическими
                распределениями Wine Quality. Для расчёта AIC,
                KS и полноценного сравнения моделей необходимы
                индивидуальные наблюдения.

            </div>

        </section>
    `;
}

// ==========================================
// DISTRIBUTION FITTING — PDF FUNCTIONS
// ==========================================

// Плотность нормального распределения.

function normalPDF(x, mu, sigma) {

    if (sigma <= 0) return 0;

    const coefficient =
        1 / (sigma * Math.sqrt(2 * Math.PI));

    const exponent =
        -0.5 * ((x - mu) / sigma) ** 2;

    return coefficient * Math.exp(exponent);
}


// Плотность логнормального распределения.

function lognormalPDF(x, mu, sigma) {

    if (x <= 0 || sigma <= 0) return 0;

    const coefficient =
        1 / (x * sigma * Math.sqrt(2 * Math.PI));

    const exponent =
        -((Math.log(x) - mu) ** 2) /
        (2 * sigma ** 2);

    return coefficient * Math.exp(exponent);
}


// Плотность экспоненциального распределения.

function exponentialPDF(x, lambda) {

    if (x < 0 || lambda <= 0) return 0;

    return lambda * Math.exp(-lambda * x);
}

// ==========================================
// DISTRIBUTION FITTING — SVG CHART
// ==========================================

function drawDistributionChart(models, observedMean) {

    const width = 760;
    const height = 350;

    const left = 65;
    const right = 25;
    const top = 25;
    const bottom = 60;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const normal = models.normal;
    const lognormal = models.lognormal;
    const exponential = models.exponential;

    const logMean = Math.exp(
        lognormal.mu + lognormal.sigma ** 2 / 2
    );

    const logVariance = (
        Math.exp(lognormal.sigma ** 2) - 1
    ) * Math.exp(
        2 * lognormal.mu + lognormal.sigma ** 2
    );

    const logSD = Math.sqrt(logVariance);

    // Автоматически выбираем диапазон X.
    const xMax = Math.max(
        normal.mu + 4 * normal.sigma,
        logMean + 4 * logSD,
        3 / exponential.lambda,
        observedMean + 4
    );

    const samples = 180;

    const calculateCurves = [];

    for (let i = 0; i <= samples; i++) {

        const x = i / samples * xMax;

        calculateCurves.push({

            x,

            normal: normalPDF(
                x,
                normal.mu,
                normal.sigma
            ),

            lognormal: lognormalPDF(
                x,
                lognormal.mu,
                lognormal.sigma
            ),

            exponential: exponentialPDF(
                x,
                exponential.lambda
            )

        });
    }

    const maxDensity = Math.max(
        ...calculateCurves.flatMap(point => [
            point.normal,
            point.lognormal,
            point.exponential
        ])
    );

    const yMax = maxDensity * 1.15;

    const scaleX = value =>
        left + value / xMax * plotWidth;

    const scaleY = value =>
        top + plotHeight -
        value / yMax * plotHeight;

    let svg = "";

    // Сетка Y.
    for (let i = 0; i <= 4; i++) {

        const value = yMax * i / 4;
        const y = scaleY(value);

        svg += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 10}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${value.toFixed(3)}
            </text>
        `;
    }

    // Подписи X.
    for (let i = 0; i <= 5; i++) {

        const value = xMax * i / 5;
        const x = scaleX(value);

        svg += `
            <text
                x="${x}"
                y="${height - 30}"
                text-anchor="middle"
                class="chart-label"
            >
                ${value.toFixed(1)}
            </text>
        `;
    }

    // Формируем кривые распределений.
    const series = [
        {
            key: "normal",
            className: "distribution-curve-normal"
        },
        {
            key: "lognormal",
            className: "distribution-curve-lognormal"
        },
        {
            key: "exponential",
            className: "distribution-curve-exponential"
        }
    ];

    series.forEach(item => {

        const path = calculateCurves.map((point, index) => {

            const x = scaleX(point.x);
            const y = scaleY(point[item.key]);

            return `${index === 0 ? "M" : "L"} ${x} ${y}`;

        }).join(" ");

        svg += `
            <path
                d="${path}"
                class="${item.className}"
            />
        `;
    });

    // Среднее исходной группы.
    const meanX = scaleX(observedMean);

    svg += `
        <line
            x1="${meanX}"
            y1="${top}"
            x2="${meanX}"
            y2="${top + plotHeight}"
            class="distribution-observed-marker"
        />

        <text
            x="${meanX}"
            y="${top - 8}"
            text-anchor="middle"
            class="chart-label"
        >
            Observed mean
        </text>

        <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${width - right}"
            y2="${top + plotHeight}"
            class="axis-line"
        />

        <text
            x="${width / 2}"
            y="${height - 5}"
            text-anchor="middle"
            class="chart-label"
        >
            Alcohol content (% vol.)
        </text>

        <text
            x="15"
            y="${height / 2}"
            text-anchor="middle"
            transform="rotate(-90 15 ${height / 2})"
            class="chart-label"
        >
            Probability density
        </text>
    `;

    return `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart distribution-chart"
            role="img"
            aria-label="Comparison of normal, lognormal and exponential probability density functions"
        >
            ${svg}
        </svg>

        <div class="distribution-legend">

            <span>
                <i class="legend-line distribution-legend-normal"></i>
                Normal
            </span>

            <span>
                <i class="legend-line distribution-legend-lognormal"></i>
                Lognormal
            </span>

            <span>
                <i class="legend-line distribution-legend-exponential"></i>
                Exponential
            </span>

            <span>
                <i class="legend-line distribution-legend-observed"></i>
                Observed mean
            </span>

        </div>
    `;
}

// ==========================================
// DISTRIBUTION FITTING — MODEL STATISTICS
// ==========================================

function calculateDistributionModelStats(models) {

    const normal = models.normal;
    const lognormal = models.lognormal;
    const exponential = models.exponential;

    // Нормальное распределение.
    const normalStats = {
        mean: normal.mu,
        variance: normal.sigma ** 2
    };

    // Логнормальное распределение.
    const lognormalStats = {
        mean: Math.exp(
            lognormal.mu + lognormal.sigma ** 2 / 2
        ),

        variance: (
            Math.exp(lognormal.sigma ** 2) - 1
        ) * Math.exp(
            2 * lognormal.mu + lognormal.sigma ** 2
        )
    };

    // Экспоненциальное распределение.
    const exponentialStats = {
        mean: 1 / exponential.lambda,
        variance: 1 / exponential.lambda ** 2
    };

    return [
        {
            name: "Normal",
            parameters:
                `μ = ${normal.mu.toFixed(3)}, σ = ${normal.sigma.toFixed(3)}`,
            ...normalStats
        },

        {
            name: "Lognormal",
            parameters:
                `μlog = ${lognormal.mu.toFixed(3)}, σlog = ${lognormal.sigma.toFixed(3)}`,
            ...lognormalStats
        },

        {
            name: "Exponential",
            parameters:
                `λ = ${exponential.lambda.toFixed(3)}`,
            ...exponentialStats
        }
    ];
}

// ==========================================
// DISTRIBUTION FITTING — UPDATE
// ==========================================

function updateDistributionFitting() {

    const groupSelect =
        document.getElementById("distributionGroup");

    const result =
        document.getElementById("distributionFittingResult");

    if (!groupSelect || !result || !currentLab) return;

    const observed = getAlcoholDistributionData(
        currentLab,
        groupSelect.value
    );

    if (!observed) {
        result.innerHTML = emptyState(
            "Недостаточно данных для сравнения распределений."
        );
        return;
    }

    // Считываем параметры трёх моделей.
    const models = {

        normal: {
            mu: Number(
                document.getElementById("normalMu").value
            ),

            sigma: Number(
                document.getElementById("normalSigma").value
            )
        },

        lognormal: {
            mu: Number(
                document.getElementById("lognormalMu").value
            ),

            sigma: Number(
                document.getElementById("lognormalSigma").value
            )
        },

        exponential: {
            lambda: Number(
                document.getElementById("exponentialLambda").value
            )
        }

    };

    // Проверка параметров.
    const parameters = [
        models.normal.mu,
        models.normal.sigma,
        models.lognormal.mu,
        models.lognormal.sigma,
        models.exponential.lambda
    ];

    if (
        !parameters.every(Number.isFinite) ||
        models.normal.sigma <= 0 ||
        models.lognormal.sigma <= 0 ||
        models.exponential.lambda <= 0
    ) {
        result.innerHTML = emptyState(
            "Параметры распределений должны быть корректными положительными числами."
        );
        return;
    }

    // Обновляем числовые значения возле ползунков.
    const outputs = [
        ["normalMuOutput", models.normal.mu],
        ["normalSigmaOutput", models.normal.sigma],
        ["lognormalMuOutput", models.lognormal.mu],
        ["lognormalSigmaOutput", models.lognormal.sigma],
        ["exponentialLambdaOutput", models.exponential.lambda]
    ];

    outputs.forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value.toFixed(3);
        }

    });

    // Рассчитываем теоретические характеристики моделей.
    const modelStats = calculateDistributionModelStats(models);

    // Таблица сравнения.
    const tableRows = modelStats.map(model => `

        <tr>

            <td>
                <strong>${escapeHTML(model.name)}</strong>
            </td>

            <td>
                ${escapeHTML(model.parameters)}
            </td>

            <td>
                ${model.mean.toFixed(4)}
            </td>

            <td>
                ${model.variance.toFixed(4)}
            </td>

        </tr>

    `).join("");

    result.innerHTML = `

        <div class="distribution-observed-metrics">

            <div class="result-metric">

                <small>Observed mean</small>

                <strong>${observed.mean.toFixed(4)}</strong>

            </div>

            <div class="result-metric">

                <small>Observed variance</small>

                <strong>${observed.variance.toFixed(4)}</strong>

            </div>

            <div class="result-metric">

                <small>Sample size</small>

                <strong>
                    ${observed.sampleSize.toLocaleString("ru-RU")}  
                </strong>

            </div>

        </div>


        <div class="distribution-chart-block">

            <div class="section-head">

                <div>
                    <span class="tag">PROBABILITY DENSITY FUNCTIONS</span>

                    <h3>Сравнение форм распределений</h3>
                </div>

            </div>

            ${drawDistributionChart(models, observed.mean)}

        </div>


        <div class="distribution-table-wrap">

            <div class="section-head">

                <div>
                    <span class="tag">THEORETICAL MOMENTS</span>

                    <h3>Характеристики моделей</h3>
                </div>

            </div>

            <div class="distribution-table-scroll">

                <table class="distribution-table">

                    <thead>

                        <tr>
                            <th>Модель</th>
                            <th>Параметры</th>
                            <th>Теоретическое среднее</th>
                            <th>Теоретическая дисперсия</th>
                        </tr>

                    </thead>

                    <tbody>
                        ${tableRows}
                    </tbody>

                </table>

            </div>

        </div>


        <div class="note">

            <strong>Интерпретация.</strong>

            Среднее и дисперсия каждой модели зависят от её параметров.
            При начальной настройке Normal и Lognormal согласуются
            с первыми двумя моментами выбранной группы.

            Exponential согласуется со средним, но его дисперсия
            может существенно отличаться от наблюдаемой.

            Это позволяет сравнивать математические свойства моделей,
            но не определяет, какая из них лучше описывает исходные данные.

        </div>

    `;
}

// ==========================================
// DISTRIBUTION FITTING — RESET
// ==========================================

function resetDistributionParameters() {

    const groupSelect =
        document.getElementById("distributionGroup");

    if (!groupSelect || !currentLab) return;

    const data = getAlcoholDistributionData(
        currentLab,
        groupSelect.value
    );

    if (!data) return;

    const values = {
        normalMu: data.normal.mu,
        normalSigma: data.normal.sigma,
        lognormalMu: data.lognormal.mu,
        lognormalSigma: data.lognormal.sigma,
        exponentialLambda: data.exponential.lambda
    };

    Object.entries(values).forEach(([id, value]) => {

        const input = document.getElementById(id);

        if (input) {
            input.value = value;
        }

    });

    updateDistributionFitting();
}
// ==========================================
// МЕТОДЫ ИССЛЕДОВАНИЯ
// ==========================================

function renderMethods(lab) {

    const methods = Array.isArray(lab.methods)
        ? lab.methods
        : [];

    const variables = Array.isArray(lab.variables)
        ? lab.variables
        : [];

    // Проверяем, есть ли данные для нормализации.
    const hasNormalizationData =
        Boolean(getNormalizationDataset(lab));

    return `

        <section class="section" id="methods">

            ${sectionHeader(
                "06 / МЕТОДОЛОГИЯ",
                "Методы исследования",
                "Изучение данных, распределений и статистических характеристик."
            )}


            <div class="grid three-col">

                ${methods.length

                    ? methods.map(method => `

                        <div class="card">

                            <span class="tag">МЕТОД</span>

                            <h3>
                                ${escapeHTML(method.title)}
                            </h3>

                            <p class="muted">
                                ${escapeHTML(method.description)}
                            </p>

                        </div>

                    `).join("")

                    : emptyState("Методы пока не добавлены.")

                }

            </div>


            ${hasNormalizationData ? `

                <div class="card normalization-lab">

                    <div class="experiment-top">

                        <div>

                            <span class="tag">
                                ЭКСПЕРИМЕНТ 004
                            </span>

                            <h3>
                                Интерактивная нормализация
                            </h3>

                            <p class="muted">
                                Изучение методов Min–Max и Z-score
                                на распределении оценки качества вина.
                            </p>

                        </div>

                        <span class="experiment-status">
                            ● ИНТЕРАКТИВНО
                        </span>

                    </div>


                    <div class="normalization-controls">

                        <div class="control-field">

                            <label for="normalizationMethod">
                                Метод преобразования
                            </label>

                            <select
                                id="normalizationMethod"
                                class="select"
                            >

                                <option value="minmax">
                                    Min–Max
                                </option>

                                <option value="zscore">
                                    Z-score
                                </option>

                            </select>

                        </div>


                        <div
                            class="control-field"
                            id="normalizationLowerControl"
                        >

                            <label for="normalizationTargetMin">
                                Нижняя граница
                            </label>

                            <input
                                id="normalizationTargetMin"
                                class="select"
                                type="number"
                                step="any"
                                value="0"
                            >

                        </div>


                        <div
                            class="control-field"
                            id="normalizationUpperControl"
                        >

                            <label for="normalizationTargetMax">
                                Верхняя граница
                            </label>

                            <input
                                id="normalizationTargetMax"
                                class="select"
                                type="number"
                                step="any"
                                value="1"
                            >

                        </div>

                    </div>


                    <div
                        id="normalizationResult"
                        class="normalization-result"
                    >

                        <div class="empty-state">
                            Измени параметры эксперимента,
                            чтобы увидеть результат.
                        </div>

                    </div>

                </div>

            ` : `

                <div class="card normalization-lab">

                    <span class="tag">НОРМАЛИЗАЦИЯ</span>

                    <h3>
                        Эксперимент пока недоступен
                    </h3>

                    <p class="muted">
                        Для нормализации необходимы числовые значения
                        и частоты наблюдений.
                    </p>

                </div>

            `}


            ${variables.length ? `

                <div class="card eda-explorer-card">

                    <div class="experiment-top">

                        <div>

                            <span class="tag">
                                ЭКСПЕРИМЕНТ 005
                            </span>

                            <h3>
                                Исследовательский анализ данных
                            </h3>

                            <p class="muted">
                                Изучение описательных характеристик
                                исследуемых случайных величин.
                            </p>

                        </div>

                        <span class="experiment-status">
                            ● ИНТЕРАКТИВНО
                        </span>

                    </div>


                    <div class="eda-controls">

                        <div class="control-field">

                            <label for="edaVariableSelect">
                                Исследуемая величина
                            </label>

                            <select
                                id="edaVariableSelect"
                                class="select"
                            >

                                ${variables.map(variable => `

                                    <option value="${escapeHTML(variable.id)}">
                                        ${escapeHTML(variable.name)}
                                    </option>

                                `).join("")}

                            </select>

                        </div>

                    </div>


                    <div id="edaExplorerResult"></div>

                </div>

            ` : `

                <div class="card eda-explorer-card">

                    <span class="tag">
                        ИССЛЕДОВАТЕЛЬСКИЙ АНАЛИЗ ДАННЫХ
                    </span>

                    <h3>
                        Нет исследуемых величин
                    </h3>

                    <p class="muted">
                        Добавь переменные в data.js, чтобы начать исследование.
                    </p>

                </div>

            `}

        </section>

    `;
}

// ==========================================
// NORMALIZATION DATA AND STATISTICS
// ==========================================

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

function drawNormalizationChart(
    values,
    frequencies,
    transformedValues
) {

    const width = 760;
    const height = 330;

    const left = 68;
    const right = 25;
    const top = 25;
    const bottom = 65;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const minValue = Math.min(...transformedValues);
    const maxValue = Math.max(...transformedValues);

    const span = maxValue - minValue || 1;

    const xPadding = span * 0.12;

    const xMin = minValue - xPadding;
    const xMax = maxValue + xPadding;

    const maxFrequency = Math.max(...frequencies);
    const yMax = maxFrequency * 1.12;

    const scaleX = value =>
        left +
        ((value - xMin) / (xMax - xMin)) * plotWidth;

    const scaleY = value =>
        top +
        plotHeight -
        (value / yMax) * plotHeight;

    // Определяем расстояние между соседними точками.
    const sortedValues = [...transformedValues]
        .sort((a, b) => a - b);

    const gaps = sortedValues
        .slice(1)
        .map((value, index) =>
            value - sortedValues[index]
        );

    const minGap = gaps.length
        ? Math.min(...gaps)
        : span;

    const barWidth = Math.max(
        8,
        Math.min(
            54,
            (minGap / (xMax - xMin)) *
            plotWidth * 0.58
        )
    );

    let svg = "";

    // Сетка графика.
    for (let i = 0; i <= 4; i++) {

        const value = yMax * i / 4;
        const y = scaleY(value);

        svg += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 10}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${Math.round(value).toLocaleString("ru-RU")}
            </text>
        `;
    }

    // Столбцы распределения.
    transformedValues.forEach((value, index) => {

        const x = scaleX(value);
        const y = scaleY(frequencies[index]);

        const barHeight =
            top + plotHeight - y;

        svg += `
            <rect
                x="${x - barWidth / 2}"
                y="${y}"
                width="${barWidth}"
                height="${barHeight}"
                rx="4"
                class="normalization-bar"
            >
                <title>
                    Исходное значение: ${values[index]};
                    преобразованное: ${value.toFixed(4)};
                    частота: ${frequencies[index]}
                </title>
            </rect>

            <text
                x="${x}"
                y="${Math.max(14, y - 8)}"
                text-anchor="middle"
                class="chart-label"
            >
                ${frequencies[index].toLocaleString("ru-RU")}
            </text>

            <text
                x="${x}"
                y="${height - 37}"
                text-anchor="middle"
                class="chart-label"
            >
                ${value.toFixed(2)}
            </text>
        `;
    });

    svg += `
        <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${width - right}"
            y2="${top + plotHeight}"
            class="axis-line"
        />

        <text
            x="${width / 2}"
            y="${height - 8}"
            text-anchor="middle"
            class="chart-label"
        >
            Преобразованное значение
        </text>
    `;

    return `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart normalization-chart"
            role="img"
            aria-label="Эмпирическое распределение после нормализации"
        >
            ${svg}
        </svg>
    `;
}

// ==========================================
// NORMALIZATION EXPERIMENT
// ==========================================

function updateNormalizationExperiment() {

    const methodSelect =
        document.getElementById("normalizationMethod");

    const result =
        document.getElementById("normalizationResult");

    const lowerInput =
        document.getElementById("normalizationTargetMin");

    const upperInput =
        document.getElementById("normalizationTargetMax");

    const lowerControl =
        document.getElementById("normalizationLowerControl");

    const upperControl =
        document.getElementById("normalizationUpperControl");

    const controlsContainer =
        document.querySelector(".normalization-controls");

    if (!methodSelect || !result || !currentLab) return;

    const dataset = getNormalizationDataset(currentLab);

    if (!dataset) {
        result.innerHTML = emptyState(
            "Недостаточно данных для нормализации."
        );
        return;
    }

    const method = methodSelect.value;
    const isMinMax = method === "minmax";

    // Для Z-score пользовательские границы не нужны.
    if (lowerControl) {
        lowerControl.hidden = !isMinMax;
    }

    if (upperControl) {
        upperControl.hidden = !isMinMax;
    }

    if (controlsContainer) {
        controlsContainer.classList.toggle(
            "is-zscore",
            !isMinMax
        );
    }

    let transformedValues;
    let formula;
    let explanation;

    // ======================================
    // MIN-MAX
    // ======================================

    if (isMinMax) {

        const rawMin = lowerInput?.value;
        const rawMax = upperInput?.value;

        const targetMin = rawMin === ""
            ? NaN
            : Number(rawMin);

        const targetMax = rawMax === ""
            ? NaN
            : Number(rawMax);

        if (
            !Number.isFinite(targetMin) ||
            !Number.isFinite(targetMax) ||
            targetMax <= targetMin
        ) {

            result.innerHTML = `
                <div class="note normalization-error">
                    Верхняя граница должна быть числом
                    больше нижней границы.
                </div>
            `;

            return;
        }

        transformedValues = dataset.values.map(value => {

            return targetMin +
                (
                    (value - dataset.min) /
                    (dataset.max - dataset.min)
                ) *
                (targetMax - targetMin);

        });

        formula =
            "x′ = a + ((x − x_min) / (x_max − x_min)) · (b − a)";

        explanation =
            `Минимум исходных данных становится ${targetMin}, ` +
            `максимум — ${targetMax}. ` +
            "Порядок значений и относительные расстояния сохраняются.";

    }

    // ======================================
    // Z-SCORE
    // ======================================

    else {

        transformedValues = dataset.values.map(value => {

            return (
                (value - dataset.mean) /
                dataset.sampleSD
            );

        });

        formula = "z = (x − x̄) / s";

        explanation =
            "После стандартизации среднее становится близким к 0, " +
            "а выборочное стандартное отклонение — равным 1. " +
            "Значения не ограничены диапазоном [0; 1].";
    }

    // ======================================
    // СТАТИСТИКИ ПОСЛЕ ПРЕОБРАЗОВАНИЯ
    // ======================================

    const transformedStats = calculateWeightedStats(
        transformedValues,
        dataset.frequencies
    );

    const transformedMin = Math.min(...transformedValues);
    const transformedMax = Math.max(...transformedValues);

    const metrics = [

        {
            label: "Количество наблюдений",
            value: dataset.total.toLocaleString("ru-RU")
        },

        {
            label: "Среднее: до → после",
            value:
                `${dataset.mean.toFixed(3)} → ` +
                `${transformedStats.mean.toFixed(3)}`
        },

        {
            label: "Std. dev.: до → после",
            value:
                `${dataset.sampleSD.toFixed(3)} → ` +
                `${transformedStats.sampleSD.toFixed(3)}`
        },

        {
            label: "Диапазон после преобразования",
            value:
                `${transformedMin.toFixed(3)} – ` +
                `${transformedMax.toFixed(3)}`
        }

    ];

    const metricsHTML = metrics.map(metric => `

        <div class="result-metric">

            <small>
                ${escapeHTML(metric.label)}
            </small>

            <strong>
                ${escapeHTML(metric.value)}
            </strong>

        </div>

    `).join("");

    // ======================================
    // ТАБЛИЦА ПРЕОБРАЗОВАННЫХ ЗНАЧЕНИЙ
    // ======================================

    const tableRows = dataset.values.map((value, index) => `

        <tr>

            <td>${value}</td>

            <td>
                ${dataset.frequencies[index].toLocaleString("ru-RU")}
            </td>

            <td>
                ${(
                    dataset.frequencies[index] /
                    dataset.total * 100
                ).toFixed(2)}%
            </td>

            <td>
                ${transformedValues[index].toFixed(4)}
            </td>

        </tr>

    `).join("");

    const formulaHTML = `
        <div class="formula normalization-formula">
            ${escapeHTML(formula)}
        </div>
    `;

    // ======================================
    // ВЫВОД РЕЗУЛЬТАТА
    // ======================================

    result.innerHTML = `

        <div class="normalization-metrics">

            ${metricsHTML}

        </div>


        <div class="simulation-chart">

            <div class="section-head">

                <div>

                    <span class="tag">
                        TRANSFORMED DISTRIBUTION
                    </span>

                    <h3>Как изменилось распределение</h3>

                </div>

            </div>

            ${drawNormalizationChart(
                dataset.values,
                dataset.frequencies,
                transformedValues
            )}

        </div>


        ${formulaHTML}


        <div class="normalization-table-wrap">

            <table class="normalization-table">

                <thead>

                    <tr>
                        <th>Исходное значение</th>
                        <th>Частота</th>
                        <th>Вероятность</th>
                        <th>После преобразования</th>
                    </tr>

                </thead>

                <tbody>
                    ${tableRows}
                </tbody>

            </table>

        </div>


        <div class="note">

            <strong>Интерпретация.</strong>

            ${escapeHTML(explanation)}

            Частоты и эмпирические вероятности при линейном
            преобразовании не меняются.

        </div>

    `;
}

// ==========================================
// EDA — STATISTICAL CALCULATIONS
// ==========================================

// Рассчитываем статистики по таблице частот.
// Используем, когда у нас есть значения и их количество.

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

function getGroupComparisonData(variable, lab) {

    const chart = variable?.chart;

    if (
        !Array.isArray(chart?.labels) ||
        !Array.isArray(chart?.values)
    ) {
        return null;
    }

    // Ищем именно две группы: Red wine и White wine.
    const redIndex = chart.labels.findIndex(label =>
        String(label).toLowerCase().includes("red")
    );

    const whiteIndex = chart.labels.findIndex(label =>
        String(label).toLowerCase().includes("white")
    );

    if (redIndex === -1 || whiteIndex === -1) {
        return null;
    }

    const redMean = Number(chart.values[redIndex]);
    const whiteMean = Number(chart.values[whiteIndex]);

    if (!Number.isFinite(redMean) || !Number.isFinite(whiteMean)) {
        return null;
    }

    // Ищем дисперсии групп в сохранённых статистиках.
    const statistics = Array.isArray(variable.statistics)
        ? variable.statistics
        : [];

    const getVariance = group => {

        const item = statistics.find(stat =>
            new RegExp(`${group}\\s+variance`, "i").test(stat.label)
        );

        if (!item) return null;

        const value = Number(item.value);

        return Number.isFinite(value) && value >= 0
            ? value
            : null;
    };

    const redVariance = getVariance("red");
    const whiteVariance = getVariance("white");

    // Размеры групп берём из описания датасета.
    const groups = lab?.dataset?.groups || [];

    const getGroupSize = group => {

        const item = groups.find(entry =>
            entry.label.toLowerCase().includes(group)
        );

        return item ? Number(item.value) : null;
    };

    const difference = whiteMean - redMean;

    const relativeDifference = redMean !== 0
        ? difference / Math.abs(redMean) * 100
        : null;

    let direction;

    if (difference > 0) {
        direction = "Выше в белом вине";
    } else if (difference < 0) {
        direction = "Выше в красном вине";
    } else {
        direction = "Средние значения совпадают";
    }

    return {

        unit: chart.unit || "",

        red: {
            label: chart.labels[redIndex],
            mean: redMean,
            variance: redVariance,
            standardDeviation: redVariance === null
                ? null
                : Math.sqrt(redVariance),
            size: getGroupSize("red")
        },

        white: {
            label: chart.labels[whiteIndex],
            mean: whiteMean,
            variance: whiteVariance,
            standardDeviation: whiteVariance === null
                ? null
                : Math.sqrt(whiteVariance),
            size: getGroupSize("white")
        },

        difference,
        relativeDifference,
        direction
    };
}

// ==========================================
// EDA — GROUP MEAN COMPARISON CHART
// ==========================================

function drawGroupComparisonChart(data) {

    const width = 760;
    const height = 190;

    const left = 135;
    const right = 75;

    const plotWidth = width - left - right;

    const maxValue = Math.max(
        data.red.mean,
        data.white.mean
    );

    const chartMax = maxValue > 0
        ? maxValue * 1.2
        : 1;

    const scaleX = value =>
        left + value / chartMax * plotWidth;

    const rows = [
        {
            label: "Red wine",
            value: data.red.mean,
            className: "group-bar-red",
            y: 48
        },
        {
            label: "White wine",
            value: data.white.mean,
            className: "group-bar-white",
            y: 112
        }
    ];

    let svg = "";

    // Вертикальная сетка.
    for (let i = 0; i <= 4; i++) {

        const value = chartMax * i / 4;
        const x = scaleX(value);

        svg += `
            <line
                x1="${x}"
                y1="20"
                x2="${x}"
                y2="150"
                class="grid-line"
            />

            <text
                x="${x}"
                y="174"
                text-anchor="middle"
                class="chart-label"
            >
                ${value.toFixed(2)}
            </text>
        `;
    }

    // Столбцы групп.
    rows.forEach(row => {

        const barWidth = scaleX(row.value) - left;

        svg += `
            <text
                x="${left - 12}"
                y="${row.y + 17}"
                text-anchor="end"
                class="chart-label"
            >
                ${row.label}
            </text>

            <rect
                x="${left}"
                y="${row.y}"
                width="${barWidth}"
                height="27"
                rx="5"
                class="${row.className}"
            >
                <title>
                    ${row.label}: ${row.value}
                </title>
            </rect>

            <text
                x="${Math.min(scaleX(row.value) + 8, width - 65)}"
                y="${row.y + 18}"
                class="chart-label"
            >
                ${row.value.toFixed(3)}
            </text>
        `;
    });

    return `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart group-comparison-chart"
            role="img"
            aria-label="Сравнение средних значений красного и белого вина"
        >
            ${svg}
        </svg>
    `;
}

// ==========================================
// EDA — GROUP COMPARISON RENDERING
// ==========================================

function renderGroupComparison(variable, lab) {

    const data = getGroupComparisonData(variable, lab);

    if (!data) {

        return `
            <div class="group-comparison-unavailable">

                <span class="tag">GROUP COMPARISON</span>

                <h3>Сравнение групп недоступно</h3>

                <p>
                    Для выбранной величины нет сохранённых
                    групповых средних красного и белого вина.
                </p>

                <p class="muted">
                    Для такого анализа нужны значения обеих групп
                    или заранее рассчитанные групповые характеристики.
                </p>

            </div>
        `;
    }

    const differenceText =
        `${data.difference > 0 ? "+" : ""}${data.difference.toFixed(4)}`;

    const relativeText = data.relativeDifference === null
        ? "Не рассчитано"
        : `${data.relativeDifference > 0 ? "+" : ""}${data.relativeDifference.toFixed(2)}%`;

    // Показатели разброса отображаем только тогда,
    // когда обе групповые дисперсии сохранены.

    const hasVariance =
        data.red.variance !== null &&
        data.white.variance !== null;

    const spreadHTML = hasVariance
        ? `
            <div class="group-spread-grid">

                <div class="result-metric">
                    <small>Red variance</small>
                    <strong>${data.red.variance.toFixed(4)}</strong>
                </div>

                <div class="result-metric">
                    <small>White variance</small>
                    <strong>${data.white.variance.toFixed(4)}</strong>
                </div>

                <div class="result-metric">
                    <small>Red std. deviation</small>
                    <strong>${data.red.standardDeviation.toFixed(4)}</strong>
                </div>

                <div class="result-metric">
                    <small>White std. deviation</small>
                    <strong>${data.white.standardDeviation.toFixed(4)}</strong>
                </div>

            </div>
        `
        : `
            <div class="note">

                <strong>Разброс групп.</strong>

                Раздельные дисперсии красного и белого вина
                для этой переменной не сохранены.

                Поэтому сравниваем только средние значения.

            </div>
        `;

    // Размеры групп.
    const sampleSizeHTML =
        data.red.size !== null && data.white.size !== null
            ? `
                <div class="group-sample-sizes">

                    <span>
                        Red wine:
                        <strong>${data.red.size.toLocaleString("ru-RU")}</strong>
                    </span>

                    <span>
                        White wine:
                        <strong>${data.white.size.toLocaleString("ru-RU")}</strong>
                    </span>

                </div>
            `
            : "";

    return `

        <div class="group-comparison-section">

            <div class="section-head">

                <div>

                    <span class="tag">RED VS WHITE</span>

                    <h3>Сравнение групп</h3>

                </div>

            </div>


            <div class="group-comparison-chart-wrap">

                <div class="group-chart-heading">

                    <span>
                        ${escapeHTML(variable.name)} · среднее
                    </span>

                    <span class="muted">
                        ${escapeHTML(data.unit)}
                    </span>

                </div>

                ${drawGroupComparisonChart(data)}

                ${sampleSizeHTML}

            </div>


            <div class="group-comparison-metrics">

                <div class="result-metric">

                    <small>Red wine · mean</small>

                    <strong>${data.red.mean.toFixed(4)}</strong>

                </div>

                <div class="result-metric">

                    <small>White wine · mean</small>

                    <strong>${data.white.mean.toFixed(4)}</strong>

                </div>

                <div class="result-metric">

                    <small>Difference · White − Red</small>

                    <strong>${differenceText}</strong>

                </div>

                <div class="result-metric">

                    <small>Relative difference</small>

                    <strong>${relativeText}</strong>

                </div>

            </div>


            ${spreadHTML}


            <div class="note">

                <strong>Интерпретация.</strong>

                ${escapeHTML(data.direction)}.

                Разница средних составляет
                ${differenceText} ${escapeHTML(data.unit)}.

                Относительная разница рассчитана относительно
                среднего значения красного вина.

                Это описательное сравнение, а не результат
                проверки статистической значимости.

            </div>


            <div class="group-comparison-limitation">

                <strong>Ограничение интерпретации.</strong>

                Диаграмма показывает только средние значения.
                Она не отражает форму распределения, асимметрию,
                выбросы и перекрытие индивидуальных наблюдений.
                Для этого нужны исходные значения каждой пробы.

            </div>

        </div>

    `;
}

// ==========================================
// EDA — IQR BOXPLOT
// ==========================================

function drawIQRBoxplot(data) {

    const width = 760;
    const height = 185;

    const left = 45;
    const right = 35;

    const minX = data.min - 0.5;
    const maxX = data.max + 0.5;

    const scaleX = value =>
        left +
        (value - minX) / (maxX - minX) *
        (width - left - right);

    const centerY = 76;
    const boxHeight = 34;
    const axisY = 113;

    const q1X = scaleX(data.q1);
    const q3X = scaleX(data.q3);
    const medianX = scaleX(data.q2);

    const lowerX = scaleX(data.lowerWhisker);
    const upperX = scaleX(data.upperWhisker);

    const boxWidth = Math.max(3, q3X - q1X);

    let elements = "";

    // Нижняя и верхняя части усов.

    elements += `
        <line
            x1="${lowerX}"
            y1="${centerY}"
            x2="${q1X}"
            y2="${centerY}"
            class="iqr-whisker"
        />

        <line
            x1="${q3X}"
            y1="${centerY}"
            x2="${upperX}"
            y2="${centerY}"
            class="iqr-whisker"
        />

        <line
            x1="${lowerX}"
            y1="${centerY - 9}"
            x2="${lowerX}"
            y2="${centerY + 9}"
            class="iqr-whisker"
        />

        <line
            x1="${upperX}"
            y1="${centerY - 9}"
            x2="${upperX}"
            y2="${centerY + 9}"
            class="iqr-whisker"
        />

        <rect
            x="${q1X}"
            y="${centerY - boxHeight / 2}"
            width="${boxWidth}"
            height="${boxHeight}"
            rx="4"
            class="iqr-box"
        >
            <title>
                Q1 = ${data.q1}; Q3 = ${data.q3}
            </title>
        </rect>

        <line
            x1="${medianX}"
            y1="${centerY - boxHeight / 2}"
            x2="${medianX}"
            y2="${centerY + boxHeight / 2}"
            class="iqr-median"
        />
    `;

    // Потенциальные выбросы.

    data.outlierGroups.forEach((item, index) => {

        const x = scaleX(item.value);
        const y = 35 + (index % 2) * 12;

        elements += `
            <circle
                cx="${x}"
                cy="${y}"
                r="5"
                class="iqr-outlier-point"
            >
                <title>
                    Значение ${item.value};
                    наблюдений: ${item.frequency}
                </title>
            </circle>
        `;
    });

    // Шкала значений.

    elements += `
        <line
            x1="${left}"
            y1="${axisY}"
            x2="${width - right}"
            y2="${axisY}"
            class="axis-line"
        />
    `;

    data.pairs.forEach(item => {

        const x = scaleX(item.value);

        elements += `
            <line
                x1="${x}"
                y1="${axisY}"
                x2="${x}"
                y2="${axisY + 5}"
                class="axis-line"
            />

            <text
                x="${x}"
                y="${axisY + 22}"
                text-anchor="middle"
                class="chart-label"
            >
                ${item.value}
            </text>
        `;
    });

    return `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart iqr-boxplot"
            role="img"
            aria-label="Диаграмма размаха и потенциальные выбросы"
        >
            ${elements}
        </svg>
    `;
}

// ==========================================
// EDA — IQR ANALYSIS RENDERING
// ==========================================

function renderIQRAnalysis(variable) {

    // Полный частотный ряд должен содержать
    // именно количество индивидуальных наблюдений.
    const hasFrequencyData =
        variable.chart?.unit === "observations";

    if (!hasFrequencyData) {

        return `

            <div class="eda-iqr-unavailable">

                <span class="tag">IQR ANALYSIS</span>

                <h3>Обнаружение выбросов недоступно</h3>

                <p>
                    Для этой величины сохранены агрегированные
                    статистики, но отсутствуют индивидуальные
                    наблюдения или полное эмпирическое распределение.
                </p>

                <p class="muted">
                    Для расчёта квартилей и выявления выбросов
                    необходимы исходные значения.
                </p>

            </div>

        `;
    }

    const data = calculateIQRFromFrequencies(variable.chart);

    if (!data) {
        return emptyState(
            "Не удалось рассчитать межквартильный размах."
        );
    }

    // Карточки статистических характеристик.

    const metrics = [

        { label: "Q1 · Первый квартиль", value: data.q1 },

        { label: "Median · Медиана", value: data.q2 },

        { label: "Q3 · Третий квартиль", value: data.q3 },

        { label: "IQR · Размах", value: data.iqr },

        { label: "Lower fence", value: data.lowerFence.toFixed(2) },

        { label: "Upper fence", value: data.upperFence.toFixed(2) }

    ];

    const metricsHTML = metrics.map(metric => `

        <div class="result-metric">

            <small>${escapeHTML(String(metric.label))}</small>

            <strong>${escapeHTML(String(metric.value))}</strong>

        </div>

    `).join("");

    // Таблица потенциальных выбросов.

    const outlierRows = data.outlierGroups.map(item => `

        <tr>

            <td>${item.value}</td>

            <td>${item.frequency.toLocaleString("ru-RU")}</td>

            <td>
                ${(item.frequency / data.total * 100).toFixed(2)}%
            </td>

            <td>
                ${item.value < data.lowerFence
                    ? "Ниже нижней границы"
                    : "Выше верхней границы"}
            </td>

        </tr>

    `).join("");

    const outlierTable = data.outlierGroups.length
        ? `

            <div class="iqr-table-wrap">

                <table class="iqr-table">

                    <thead>

                        <tr>
                            <th>Значение</th>
                            <th>Частота</th>
                            <th>Доля</th>
                            <th>Расположение</th>
                        </tr>

                    </thead>

                    <tbody>
                        ${outlierRows}
                    </tbody>

                </table>

            </div>

        `
        : `
            <div class="note">
                Потенциальные выбросы по правилу 1.5 × IQR не обнаружены.
            </div>
        `;

    return `

        <div class="eda-iqr-section">

            <div class="section-head">

                <div>

                    <span class="tag">OUTLIER DETECTION</span>

                    <h3>Межквартильный анализ</h3>

                </div>

            </div>


            <div class="iqr-metrics">

                ${metricsHTML}

            </div>


            <div class="iqr-chart-block">

                <h4>Диаграмма размаха</h4>

                <p class="muted">
                    Точки за пределами усов обозначают
                    потенциально необычные значения.
                </p>

                ${drawIQRBoxplot(data)}

            </div>


            <div class="iqr-summary">

                <div>

                    <span class="tag">POTENTIAL OUTLIERS</span>

                    <strong>
                        ${data.outlierCount.toLocaleString("ru-RU")}
                    </strong>

                    <p class="muted">
                        ${data.outlierShare.toFixed(2)}% от всех наблюдений
                    </p>

                </div>

            </div>


            <h4>Обнаруженные значения</h4>

            ${outlierTable}


            <div class="note">

                <strong>Интерпретация.</strong>

                Выявленные значения выходят за границы
                Q1 − 1.5 × IQR и Q3 + 1.5 × IQR.

                Это потенциальные выбросы, но не доказательство
                ошибки измерения или некорректной записи.

                Для порядковой переменной Quality результат
                следует интерпретировать с учётом дискретной
                природы шкалы.

            </div>

        </div>

    `;
}

// Форматирование чисел для интерфейса.
function formatEDANumber(value, digits = 3) {

    return Number(value).toLocaleString("ru-RU", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

// ==========================================
// EDA — EXPLORER RENDERING
// ==========================================

function updateEDAExplorer() {

    const select = document.getElementById("edaVariableSelect");

    const result = document.getElementById("edaExplorerResult");

    if (!select || !result || !currentLab) return;

    const variable = currentLab.variables.find(
        item => item.id === select.value
    );

    if (!variable) {
        result.innerHTML = emptyState(
            "Не удалось найти выбранную величину."
        );
        return;
    }

    // Проверяем, есть ли полное частотное распределение.
    const hasFrequencyData =
        variable.chart?.unit === "observations";

    const calculatedStats = hasFrequencyData
        ? calculateEDAFromFrequencies(variable.chart)
        : null;

    // ======================================
    // STATISTICS
    // ======================================

    let statistics = [];

    if (calculatedStats) {

        statistics = [

            {
                label: "Observations",
                value: calculatedStats.total.toLocaleString("ru-RU")
            },

            {
                label: "Mean",
                value: formatEDANumber(calculatedStats.mean)
            },

            {
                label: "Median",
                value: formatEDANumber(calculatedStats.median)
            },

            {
                label: "Mode",
                value: formatEDANumber(calculatedStats.mode)
            },

            {
                label: "Variance (sample)",
                value: formatEDANumber(calculatedStats.variance)
            },

            {
                label: "Std. deviation (sample)",
                value: formatEDANumber(
                    calculatedStats.standardDeviation
                )
            },

            {
                label: "Minimum",
                value: formatEDANumber(calculatedStats.min)
            },

            {
                label: "Maximum",
                value: formatEDANumber(calculatedStats.max)
            }

        ];

    } else {

        statistics = variable.statistics || [];

    }

    const statisticsHTML = statistics.map(stat => `

        <div class="result-metric">

            <small>
                ${escapeHTML(stat.label)}
            </small>

            <strong>
                ${escapeHTML(String(stat.value))}
            </strong>

        </div>

    `).join("");

    // ======================================
    // CHART INFORMATION
    // ======================================

    let chartHTML = "";

    if (variable.chart) {

        const chartTitle = variable.chart.title || "Data visualization";

        const isDistribution = hasFrequencyData;

        const chartDescription = isDistribution

            ? "Эмпирическое распределение: высота столбца отражает количество наблюдений с соответствующей оценкой."

            : "Сравнение агрегированных показателей по группам. Это не распределение индивидуальных наблюдений.";

        chartHTML = `

            <div class="eda-chart-block">

                <div class="section-head">

                    <div>
                        <span class="tag">
                            ${isDistribution
                                ? "EMPIRICAL DISTRIBUTION"
                                : "GROUP SUMMARY"}
                        </span>

                        <h3>${escapeHTML(chartTitle)}</h3>
                    </div>

                    <span class="muted">
                        ${escapeHTML(variable.chart.unit || "")}
                    </span>

                </div>

                <p class="muted eda-chart-description">
                    ${chartDescription}
                </p>

                ${renderBarChart(variable.chart)}

            </div>

        `;

    } else {

        chartHTML = emptyState(
            "Для этой величины график пока не предусмотрен."
        );

    }

    // ======================================
    // DATA AVAILABILITY
    // ======================================

    let availabilityHTML;

    if (hasFrequencyData && calculatedStats) {

        availabilityHTML = `
            <div class="note">

                <strong>Доступность данных.</strong>

                Для этой величины сохранено полное эмпирическое
                частотное распределение. Описательные характеристики
                рассчитаны непосредственно по значениям и частотам.

            </div>
        `;

    } else {

        availabilityHTML = `
            <div class="note">

                <strong>Ограничение данных.</strong>

                Для этой величины сохранены агрегированные
                статистики и групповые показатели.

                Исходные индивидуальные наблюдения пока не подключены.
                Поэтому построить полноценную гистограмму, вычислить
                квартили и автоматически обнаружить выбросы
                на текущем этапе нельзя.

            </div>
        `;

    }

    // ======================================
    // IQR ANALYSIS
    // ======================================

    const iqrHTML = renderIQRAnalysis(variable);

    // Сравнение средних красного и белого вина.
    const groupComparisonHTML = renderGroupComparison(
    variable,
    currentLab
);
    // ======================================
    // FINAL OUTPUT
    // ======================================

    result.innerHTML = `

        <div class="eda-variable-heading">

            <div>

                <span class="tag">
                    ${escapeHTML(variable.code || "VARIABLE")}
                </span>

                <h3>${escapeHTML(variable.name)}</h3>

                <p class="muted">
                    ${escapeHTML(variable.description || "")}
                </p>

            </div>

            <div class="eda-variable-type">

                <span>${escapeHTML(variable.type || "Unknown type")}</span>

                <strong>${escapeHTML(variable.unit || "")}</strong>

            </div>

        </div>


        <div class="eda-statistics">

            <div class="section-head">

                <div>
                    <span class="tag">DESCRIPTIVE STATISTICS</span>
                    <h3>Описательные характеристики</h3>
                </div>

            </div>

            <div class="eda-statistics-grid">

                ${statisticsHTML || emptyState(
                    "Статистические характеристики отсутствуют."
                )}

            </div>

        </div>


        ${chartHTML}

        ${iqrHTML}

        ${groupComparisonHTML}

        <div class="eda-conclusion">

            <span class="tag">RESEARCH INTERPRETATION</span>

            <p>
                ${escapeHTML(
                    variable.conclusion ||
                    "Вывод по этой величине пока не добавлен."
                )}
            </p>

        </div>


        ${availabilityHTML}

    `;
}

// ==========================================
// 14. GENERATOR
// ==========================================

function renderGenerator(lab) {
    const g = lab.generator;
    if (!g || g.status === "planned" || !g.demo) {
        return `
            <section class="section" id="generator">
                <div class="future">
                    <span class="tag">SPRINT 02 / planned</span>
                    <h2>Генератор</h2>
                    <p>${escapeHTML(g?.description || "Модуль ещё не подключён.")}</p>
                </div>
            </section>
        `;
    }

    const demo = g.demo;
    const cdfExplorer = renderGeneratorCdfExplorer(demo);
    const probs = demo.qualities.map((q, i) => `
        <div class="composition-item">
            <div class="composition-label">
                <span>Оценка ${q}</span>
                <strong>${(demo.probabilities[i] * 100).toFixed(2)}%</strong>
            </div>
            <div class="progress">
                <div class="progress-fill" style="width:${demo.probabilities[i] * 100}%"></div>
            </div>
        </div>
    `).join("");

    const convRows = (g.convergence || []).map(row => `
        <tr>
            <td>${row.n.toLocaleString("ru-RU")}</td>
            <td>${row.mean_rmse.toFixed(5)}</td>
            <td>${row.mean_rmse_theory.toFixed(5)}</td>
            <td>${row.variance_rmse.toFixed(5)}</td>
            <td>${row.variance_rmse_theory.toFixed(5)}</td>
        </tr>
    `).join("");

    return `
        <section class="section" id="generator">
            ${sectionHeader(
                "07 / GENERATOR",
                "Генератор оценок качества",
                "Условное распределение quality при заданной крепости (k = " + g.k + ")."
            )}

            <div class="card">
                <span class="tag">МОДЕЛЬ</span>
                <h3 id="generatorModelTitle">
                    Условное распределение:
                    alcohol = ${demo.alcohol} ${escapeHTML(demo.unit)}
                </h3>
                <p class="muted">${escapeHTML(g.description)}</p>

                <div
                    class="experiment-metrics generator-model-metrics"
                    id="generatorModelMetrics"
                    style="margin-top:18px"
                    <div class="result-metric">
                        <small>Среднее модели</small>
                        <strong>${demo.mean.toFixed(4)}</strong>
                    </div>
                    <div class="result-metric">
                        <small>Дисперсия модели</small>
                        <strong>${demo.variance.toFixed(4)}</strong>
                    </div>
                    <div class="result-metric">
                        <small>k соседей</small>
                        <strong>${g.k}</strong>
                    </div>
                    <div class="result-metric">
                        <small>Метод</small>
                        <strong>${escapeHTML(g.method)}</strong>
                    </div>
                </div>

                <div class="divider"></div>
                <h3>Вероятности оценок</h3>

                <div id="generatorProbabilityList">
                    ${probs}
                </div>

                <div id="generatorCdfExplorerMount">
                    ${cdfExplorer}
                </div>
            </div>

            <div class="card experiment-card">
                <div class="experiment-top">
                    <div>
                        <span class="tag">ЭКСПЕРИМЕНТ</span>
                        <h3>Сэмплирование inverse CDF</h3>
                        <p
                            class="muted"
                            id="generatorSampleDescription"
                        >
                            Генерация целых оценок из распределения соседей
                            при ${demo.alcohol}% об.
                        </p>
                    </div>
                    <span class="experiment-status">● ИНТЕРАКТИВНО</span>
                </div>

                <div class="experiment-controls">
                    <div class="control-field">
                        <label for="generatorSampleSize">
                            Размер выборки
                            <output id="generatorSampleSizeOutput">1000</output>
                        </label>
                        <input id="generatorSampleSize" type="range" min="50" max="5000" step="50" value="1000">
                        <div class="range-labels"><span>50</span><span>5000</span></div>
                    </div>
                    <button id="runGenerator" class="primary-button" type="button" disabled>
                        <span>↗</span> СГЕНЕРИРОВАТЬ
                    </button>
                </div>

                <div id="generatorResult" class="simulation-result">
                    <div class="empty-state">Нажми «Сгенерировать», чтобы получить выборку.</div>
                </div>
            </div>

            ${g.convergence?.length ? `
    <div class="card generator-convergence-card">

        <div class="experiment-top">
            <div>
                <span class="tag">CONVERGENCE ANALYSIS</span>
                <h3>Сходимость генератора</h3>
                <p class="muted">
                    Как увеличение размера выборки уменьшает ошибку
                    оценки среднего и дисперсии.
                </p>
            </div>
            <span class="experiment-status">● READY</span>
        </div>

        <div class="generator-convergence-switch">

            <button
                type="button"
                class="generator-metric-button is-active"
                data-generator-metric="mean"
                aria-pressed="true"
            >
                Среднее
            </button>

            <button
                type="button"
                class="generator-metric-button"
                data-generator-metric="variance"
                aria-pressed="false"
            >
                Дисперсия
            </button>

        </div>

        <div
            id="generatorConvergenceChart"
            class="generator-convergence-chart"
        >
            <div class="empty-state">
                Подготовка графика...
            </div>
        </div>

        <div
            id="generatorConvergenceSummary"
            class="note"
        >
        </div>

        <details class="generator-convergence-details">

            <summary>Посмотреть численные результаты</summary>

            <div class="normalization-table-wrap">

                <table class="normalization-table">

                    <thead>
                        <tr>
                            <th>n</th>
                            <th>RMSE mean</th>
                            <th>Теория mean</th>
                            <th>RMSE var</th>
                            <th>Теория var</th>
                        </tr>
                    </thead>

                    <tbody>${convRows}</tbody>

                </table>

            </div>

        </details>

    </div>
    ` : ""}

            ${g.realComparison ? `
                <div class="card">
                    <span class="tag">СРАВНЕНИЕ С TEST</span>
                    <h3>Реальные оценки vs модель</h3>
                    <div class="experiment-metrics">
                        <div class="result-metric"><small>n test</small><strong>${g.realComparison.n}</strong></div>
                        <div class="result-metric"><small>TV (real/model)</small><strong>${g.realComparison.tv}</strong></div>
                        <div class="result-metric"><small>Mean real / model</small>
                            <strong>${g.realComparison.realMean} / ${g.realComparison.modelMean}</strong>
                        </div>
                        <div class="result-metric"><small>Var real / model</small>
                            <strong>${g.realComparison.realVariance} / ${g.realComparison.modelVariance}</strong>
                        </div>
                    </div>
                    <div class="note">
                        Генератор слегка занижает среднее на test (~0.05 балла).
                        Диапазоны симуляций отражают только случайность генерации при фиксированных pⱼ.
                    </div>
                </div>
            ` : ""}
        </section>
    `;

}

// ==========================================
// GENERATOR — INVERSE CDF EXPLORER
// ==========================================

function renderGeneratorCdfExplorer(demo) {

    const cdf = buildCdf(demo.probabilities);

    const initialU = 0.72;

    let lower = 0;
    let selectedIndex = 0;

    const items = demo.qualities.map((quality, index) => {

        const upper = cdf[index];

        const probability = upper - lower;

        if (initialU >= lower && initialU < upper) {
            selectedIndex = index;
        }

        const item = {
            quality,
            lower,
            upper,
            probability
        };

        lower = upper;

        return item;
    });

    const segments = items.map((item, index) => `
        <div
            class="generator-cdf-segment ${
                index === selectedIndex ? "is-selected" : ""
            }"
            data-cdf-segment="${index}"
            style="width:${item.probability * 100}%"
            title="Q = ${item.quality}; P = ${(item.probability * 100).toFixed(3)}%"
        ></div>
    `).join("");

    const rows = items.map((item, index) => `
        <div
            class="generator-cdf-row ${
                index === selectedIndex ? "is-selected" : ""
            }"
            data-cdf-row="${index}"
        >
            <strong>Q = ${item.quality}</strong>

            <span>
                ${(item.probability * 100).toFixed(3)}%
            </span>

            <span>
                [${item.lower.toFixed(5)}; ${item.upper.toFixed(5)})
            </span>
        </div>
    `).join("");

    const selected = items[selectedIndex];

    return `
        <div class="generator-cdf-explorer">

            <div class="divider"></div>

            <span class="tag">INVERSE CDF EXPLORER</span>

            <h3>Как случайное число выбирает оценку?</h3>

            <p class="muted">
                Изменяй U и наблюдай, в какой интервал
                накопленной вероятности оно попадает.
            </p>

            <div class="generator-cdf-control">

                <label for="generatorUniformInput">
                    Случайное число U
                    <output id="generatorUniformOutput">
                        ${initialU.toFixed(4)}
                    </output>
                </label>

                <input
                    id="generatorUniformInput"
                    type="range"
                    min="0"
                    max="0.9999"
                    step="0.0001"
                    value="${initialU}"
                >

                <div class="range-labels">
                    <span>0</span>
                    <span>1</span>
                </div>

            </div>

            <div class="generator-cdf-track" id="generatorCdfTrack">
                ${segments}
            </div>

            <div class="generator-cdf-selection" id="generatorCdfSelection">

                <span class="tag">ВЫБРАННАЯ ОЦЕНКА</span>

                <strong>
                    U = ${initialU.toFixed(4)}
                    → Q* = ${selected.quality}
                </strong>

                <p>
                    Интервал:
                    [${selected.lower.toFixed(5)};
                    ${selected.upper.toFixed(5)})
                </p>

                <p>
                    Вероятность этой оценки:
                    ${(selected.probability * 100).toFixed(3)}%
                </p>

            </div>

            <div class="generator-cdf-rows" id="generatorCdfRows">
                ${rows}
            </div>

            <div class="note">
                U имеет равномерное распределение на [0, 1).
                Генератор выбирает первую оценку Qⱼ,
                для которой накопленная вероятность Cⱼ больше U.
            </div>

        </div>
    `;
}


// Обновление выбора оценки при перемещении U.
function updateGeneratorCdfExplorer() {

    const demo = getActiveGeneratorDemo();

    const input = document.getElementById(
        "generatorUniformInput"
    );

    const output = document.getElementById(
        "generatorUniformOutput"
    );

    const selection = document.getElementById(
        "generatorCdfSelection"
    );

    if (!demo || !input || !output || !selection) {
        return;
    }

    const u = Number(input.value);
    const cdf = buildCdf(demo.probabilities);

    let lower = 0;
    let selectedIndex = demo.qualities.length - 1;

    const items = demo.qualities.map((quality, index) => {

        const upper = cdf[index];

        const item = {
            quality,
            lower,
            upper,
            probability: upper - lower
        };

        if (u >= lower && u < upper) {
            selectedIndex = index;
        }

        lower = upper;

        return item;
    });

    const selected = items[selectedIndex];

    output.textContent = u.toFixed(4);

    selection.innerHTML = `
        <span class="tag">ВЫБРАННАЯ ОЦЕНКА</span>

        <strong>
            U = ${u.toFixed(4)}
            → Q* = ${selected.quality}
        </strong>

        <p>
            Интервал:
            [${selected.lower.toFixed(5)};
            ${selected.upper.toFixed(5)})
        </p>

        <p>
            Вероятность этой оценки:
            ${(selected.probability * 100).toFixed(3)}%
        </p>
    `;

    document.querySelectorAll("[data-cdf-row]").forEach(row => {

        const active =
            Number(row.dataset.cdfRow) === selectedIndex;

        row.classList.toggle("is-selected", active);

    });

    document.querySelectorAll("[data-cdf-segment]").forEach(segment => {

        const active =
            Number(segment.dataset.cdfSegment) === selectedIndex;

        segment.classList.toggle("is-selected", active);

    });
}

// ==========================================
// GENERATOR — CONVERGENCE CHART
// ==========================================

function drawGeneratorConvergenceChart(convergence, metric = "mean") {

    const config = metric === "variance"
        ? {
            empirical: "variance_rmse",
            theory: "variance_rmse_theory",
            title: "RMSE оценки дисперсии"
        }
        : {
            empirical: "mean_rmse",
            theory: "mean_rmse_theory",
            title: "RMSE оценки среднего"
        };

    // Оставляем только корректные положительные значения.
    const points = convergence
        .map(row => ({
            n: Number(row.n),
            empirical: Number(row[config.empirical]),
            theory: Number(row[config.theory])
        }))
        .filter(point =>
            Number.isFinite(point.n) &&
            point.n > 0 &&
            Number.isFinite(point.empirical) &&
            point.empirical > 0 &&
            Number.isFinite(point.theory) &&
            point.theory > 0
        )
        .sort((a, b) => a.n - b.n);

    if (points.length < 2) {
        return emptyState("Недостаточно данных для построения графика.");
    }

    const width = 760;
    const height = 360;

    const left = 85;
    const right = 25;
    const top = 25;
    const bottom = 65;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const minN = points[0].n;
    const maxN = points[points.length - 1].n;

    const allErrors = points.flatMap(point => [
        point.empirical,
        point.theory
    ]);

    // Используем логарифмическую шкалу по обеим осям.
    // Это позволяет увидеть характер сходимости n^(-1/2).
    const minError = Math.min(...allErrors) * 0.8;
    const maxError = Math.max(...allErrors) * 1.2;

    const logMinN = Math.log10(minN);
    const logMaxN = Math.log10(maxN);

    const logMinError = Math.log10(minError);
    const logMaxError = Math.log10(maxError);

    const scaleX = n =>
        left +
        (Math.log10(n) - logMinN) /
        (logMaxN - logMinN) *
        plotWidth;

    const scaleY = value =>
        top + plotHeight -
        (Math.log10(value) - logMinError) /
        (logMaxError - logMinError) *
        plotHeight;

    let svg = "";

    // Горизонтальная сетка и логарифмическая шкала RMSE.
    for (let i = 0; i <= 4; i++) {

        const logValue =
            logMinError + i * (logMaxError - logMinError) / 4;

        const value = Math.pow(10, logValue);
        const y = scaleY(value);

        const label = value < 0.01
            ? value.toFixed(4)
            : value.toFixed(3);

        svg += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 10}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${label}
            </text>
        `;
    }

    // Подписи оси X — степени десяти.
    const xTicks = [10, 100, 1000, 10000, 100000]
        .filter(value => value >= minN && value <= maxN);

    xTicks.forEach(value => {

        const x = scaleX(value);

        svg += `
            <line
                x1="${x}"
                y1="${top}"
                x2="${x}"
                y2="${top + plotHeight}"
                class="grid-line"
            />

            <text
                x="${x}"
                y="${height - 38}"
                text-anchor="middle"
                class="chart-label"
            >
                ${value.toLocaleString("ru-RU")}
            </text>
        `;
    });

    // Строим координаты эмпирической и теоретической ошибок.
    const empiricalPath = points
        .map(point => `${scaleX(point.n)},${scaleY(point.empirical)}`)
        .join(" ");

    const theoryPath = points
        .map(point => `${scaleX(point.n)},${scaleY(point.theory)}`)
        .join(" ");

    svg += `
        <polyline
            points="${empiricalPath}"
            class="generator-line generator-line-empirical"
        />

        <polyline
            points="${theoryPath}"
            class="generator-line generator-line-theory"
        />
    `;

    // Маркеры и подсказки для каждой точки.
    points.forEach(point => {

        const x = scaleX(point.n);

        svg += `
            <circle
                cx="${x}"
                cy="${scaleY(point.empirical)}"
                r="4"
                class="generator-point generator-point-empirical"
            >
                <title>
                    n = ${point.n};
                    эмпирический RMSE = ${point.empirical.toFixed(6)}
                </title>
            </circle>

            <circle
                cx="${x}"
                cy="${scaleY(point.theory)}"
                r="4"
                class="generator-point generator-point-theory"
            >
                <title>
                    n = ${point.n};
                    теоретический RMSE = ${point.theory.toFixed(6)}
                </title>
            </circle>
        `;
    });

    return `
        <div class="generator-chart-title">
            ${config.title}
        </div>

        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart generator-convergence-svg"
            role="img"
            aria-label="${config.title}, логарифмические шкалы"
        >

            ${svg}

            <line
                x1="${left}"
                y1="${top + plotHeight}"
                x2="${width - right}"
                y2="${top + plotHeight}"
                class="axis-line"
            />

            <text
                x="${width / 2}"
                y="${height - 8}"
                text-anchor="middle"
                class="chart-label"
            >
                Размер выборки n · логарифмическая шкала
            </text>

            <text
                x="17"
                y="${height / 2}"
                text-anchor="middle"
                transform="rotate(-90 17 ${height / 2})"
                class="chart-label"
            >
                RMSE · логарифмическая шкала
            </text>

        </svg>

        <div class="generator-convergence-legend">

            <span>
                <i class="generator-legend-empirical"></i>
                Эмпирический RMSE
            </span>

            <span>
                <i class="generator-legend-theory"></i>
                Теоретический RMSE
            </span>

        </div>
    `;
}


// ==========================================
// GENERATOR — CONVERGENCE UPDATE
// ==========================================

function updateGeneratorConvergence(metric = "mean") {

    const chart = document.getElementById(
        "generatorConvergenceChart"
    );

    const summary = document.getElementById(
        "generatorConvergenceSummary"
    );

    const convergence = currentLab?.generator?.convergence;

    if (!chart || !summary || !Array.isArray(convergence)) {
        return;
    }

    const isVariance = metric === "variance";

    const empiricalKey = isVariance
        ? "variance_rmse"
        : "mean_rmse";

    const theoryKey = isVariance
        ? "variance_rmse_theory"
        : "mean_rmse_theory";

    const points = convergence
        .filter(row =>
            Number(row.n) > 0 &&
            Number(row[empiricalKey]) > 0 &&
            Number(row[theoryKey]) > 0
        )
        .sort((a, b) => a.n - b.n);

    chart.innerHTML = drawGeneratorConvergenceChart(
        points.map(row => ({
            n: row.n,
            [empiricalKey]: row[empiricalKey],
            [theoryKey]: row[theoryKey]
        })),
        metric
    );

    if (points.length < 2) {
        summary.textContent = "Недостаточно данных для анализа сходимости.";
        return;
    }

    const first = points[0];
    const last = points[points.length - 1];

    const empiricalStart = Number(first[empiricalKey]);
    const empiricalEnd = Number(last[empiricalKey]);

    const theoryStart = Number(first[theoryKey]);
    const theoryEnd = Number(last[theoryKey]);

    const empiricalFactor = empiricalStart / empiricalEnd;
    const theoryFactor = theoryStart / theoryEnd;

    const metricName = isVariance
        ? "дисперсии"
        : "среднего";

    summary.innerHTML = `
        <strong>Интерпретация сходимости.</strong>

        При увеличении размера выборки
        с ${Number(first.n).toLocaleString("ru-RU")}
        до ${Number(last.n).toLocaleString("ru-RU")}

        эмпирическая ошибка оценки ${metricName}
        уменьшилась примерно в
        ${empiricalFactor.toFixed(1)} раза.

        Теоретическая ошибка уменьшилась примерно в
        ${theoryFactor.toFixed(1)} раза.

        Эмпирические значения близки к теоретическим,
        что согласуется с ожидаемым поведением генератора.
    `;

    // Обновляем состояние кнопок переключения.
    document.querySelectorAll("[data-generator-metric]")
        .forEach(button => {

            const active = button.dataset.generatorMetric === metric;

            button.classList.toggle("is-active", active);

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });
}

// ==========================================
// 15. CONCLUSIONS
// ==========================================

function renderConclusions(lab) {

    return `

        <section class="section" id="conclusions">

            ${sectionHeader(
                "08 / RESULTS",
                "Итоги исследования",
                "Основные результаты и интерпретация."
            )}

            <div class="card generator-training-card">

                <span class="tag">DATA SOURCE</span>

                <h3>Обучающая выборка Wine Quality</h3>

                <p class="muted">
                    Исходные данные автоматически загружаются
                    из локальных CSV-файлов проекта.
                </p>

                <div id="generatorTrainingStatus" class="note">
                    Ожидание загрузки данных...
                </div>

                <div class="generator-knn-controls" id="generatorKnnControls" hidden>

                    <div class="control-field">

                        <label for="generatorAlcoholInput">
                            Крепость вина
                            <output id="generatorAlcoholOutput">12.00</output>
                        </label>

                        <input
                            type="range"
                            id="generatorAlcoholInput"
                            min="8"
                            max="14"
                            step="0.1"
                            value="12"
                            disabled
                        >

                    </div>

                    <div class="control-field">

                        <label for="generatorKInput">
                            Количество соседей k
                            <output id="generatorKOutput">720</output>
                        </label>

                        <input
                            type="range"
                            id="generatorKInput"
                            min="10"
                            max="2000"
                            step="1"
                            value="720"
                            disabled
                        >

                    </div>

                    </div>

                        <button
                            type="button"
                            id="reloadGeneratorData"
                            class="distribution-reset"
                        >
                            Повторить загрузку данных
                        </button>

                    </div>

                    <div class="card generator-evaluation-card">

            <div class="experiment-top">

                <div>
                    <span class="tag">MODEL VALIDATION</span>

                    <h3>Проверка на независимой выборке</h3>

                    <p class="muted">
                        Сравнение вероятностных прогнозов kNN
                        с реальными оценками тестовой выборки.
                    </p>
                </div>

                <span class="experiment-status">
                    ● TEST
                </span>

            </div>

            <div class="generator-evaluation-controls">

                <div class="control-field">

                    <label for="generatorEvaluationGroup">
                        Исследуемая группа
                    </label>

                    <select
                        id="generatorEvaluationGroup"
                        class="select"
                        disabled
                    >
                        <option value="all">Все вина</option>
                        <option value="red">Красное вино</option>
                        <option value="white">Белое вино</option>
                    </select>

                </div>

                <button
                    type="button"
                    id="runGeneratorEvaluation"
                    class="primary-button"
                    disabled
                >
                    ПРОВЕРИТЬ МОДЕЛЬ
                </button>

            </div>

            <div
                id="generatorEvaluationResult"
                class="generator-evaluation-result"
            >

                <div class="empty-state">
                    Сначала дождись загрузки обучающей и тестовой выборок.
                </div>

            </div>

        </div>

            <div class="card">

                ${lab.conclusions.length
                    ? `
                        <ol class="conclusion-list">

                            ${lab.conclusions.map(item => `
                                <li>${escapeHTML(item)}</li>
                            `).join("")}

                        </ol>
                    `
                    : emptyState("Выводы пока не добавлены.")
                }

            </div>

        </section>

    `;
}


// ==========================================
// 16. REFERENCES
// ==========================================

function renderReferences(lab) {

    return `

        <section class="section" id="references">

            ${sectionHeader(
                "09 / SOURCES",
                "Источники",
                "Литература, публикации и источники данных."
            )}

            <div class="card">

                ${lab.references.length
                    ? lab.references.map(ref => `

                        <div class="reference">

                            <div>
                                <strong>
                                    ${escapeHTML(ref.title)}
                                </strong>

                                <p class="muted">
                                    ${escapeHTML(ref.description)}
                                </p>
                            </div>

                            ${ref.url ? `
                                <a href="${escapeHTML(ref.url)}"
                                   target="_blank"
                                   rel="noopener noreferrer">
                                    Open ↗
                                </a>
                            ` : ""}

                        </div>

                    `).join("")
                    : emptyState("Источники пока не добавлены.")
                }

            </div>

        </section>

    `;
}


// ==========================================
// 17. REUSABLE COMPONENTS
// ==========================================

function sectionHeader(eyebrow, title, description) {

    return `

        <div class="section-head">

            <div>
                <div class="eyebrow">
                    ${escapeHTML(eyebrow)}
                </div>

                <h2>${escapeHTML(title)}</h2>
            </div>

            <p>${escapeHTML(description)}</p>

        </div>

    `;
}


function emptyState(message) {

    return `

        <div class="empty-state">
            ${escapeHTML(message)}
        </div>

    `;

}


// ==========================================
// 18. INTERACTIONS
// ==========================================

function attachInteractions() {

    // ======================================
    // SAMPLING CONVERGENCE CHART
    // ======================================

    if (currentLab?.sampling?.points?.length) {
        renderSamplingChart(currentLab.sampling);
    }


    // ======================================
    // DEPENDENCE EXPERIMENT
    // ======================================

    const dependenceScenario =
        document.getElementById("dependenceScenario");

    const dependenceSize =
        document.getElementById("dependenceSize");

    if (dependenceScenario && dependenceSize) {

        dependenceScenario.addEventListener(
            "change",
            updateDependenceExperiment
        );

        dependenceSize.addEventListener(
            "input",
            updateDependenceExperiment
        );

        updateDependenceExperiment();
    }


    // ======================================
    // EDA EXPLORER
    // ======================================

    const edaVariableSelect =
        document.getElementById("edaVariableSelect");

    if (edaVariableSelect) {

        edaVariableSelect.addEventListener(
            "change",
            updateEDAExplorer
        );

        updateEDAExplorer();
    }


    // ======================================
    // GENERATOR — AUTOMATIC DATA LOADING
    // ======================================

    const generatorAlcoholInput = document.getElementById(
        "generatorAlcoholInput"
    );

    const generatorKInput = document.getElementById(
        "generatorKInput"
    );

    const generatorSampleSize = document.getElementById(
        "generatorSampleSize"
    );

    const generatorSampleSizeOutput = document.getElementById(
        "generatorSampleSizeOutput"
    );

    const generatorRunButton = document.getElementById(
        "runGenerator"
    );

    const reloadGeneratorButton = document.getElementById(
        "reloadGeneratorData"
    );


    // Изменение крепости.
    generatorAlcoholInput?.addEventListener(
        "input",
        updateGeneratorKnnModel
    );


    // Изменение количества соседей.
    generatorKInput?.addEventListener(
        "input",
        updateGeneratorKnnModel
    );


    // Размер генерируемой выборки.
    if (generatorSampleSize) {

        if (generatorSampleSizeOutput) {
            generatorSampleSizeOutput.textContent =
                generatorSampleSize.value;
        }

        generatorSampleSize.addEventListener("input", () => {

            if (generatorSampleSizeOutput) {
                generatorSampleSizeOutput.textContent =
                    generatorSampleSize.value;
            }

        });
    }


    // Запуск генератора.
    generatorRunButton?.addEventListener(
        "click",
        runGeneratorExperiment
    );

    // Запуск независимой проверки модели.
    const evaluationButton = document.getElementById(
        "runGeneratorEvaluation"
    );

    evaluationButton?.addEventListener(
        "click",
        runGeneratorEvaluation
    );


    // Повторное подключение файлов.
    reloadGeneratorButton?.addEventListener(
        "click",
        loadGeneratorTrainingData
    );


    // Автоматически загружаем CSV при открытии лабораторной.
    if (
        document.getElementById("generatorTrainingStatus")
    ) {
        loadGeneratorTrainingData();
    }


    // Обновление inverse CDF через делегирование.
    // Сам контейнер остаётся на месте, даже когда его содержимое меняется.
    const cdfMount = document.getElementById(
        "generatorCdfExplorerMount"
    );

    cdfMount?.addEventListener("input", event => {

        if (event.target?.id === "generatorUniformInput") {
            updateGeneratorCdfExplorer();
        }

    });
        // ======================================
        // GENERATOR CONVERGENCE
        // ======================================

        const convergenceButtons = document.querySelectorAll(
            "[data-generator-metric]"
        );

        if (convergenceButtons.length) {

            convergenceButtons.forEach(button => {

                button.addEventListener("click", () => {
                    updateGeneratorConvergence(
                        button.dataset.generatorMetric
                    );
                });

            });

            updateGeneratorConvergence("mean");
        }

        // ======================================
        // HYPOTHESIS TESTING
        // ======================================

        const hypothesisSelect =
            document.getElementById("hypothesisSelect");

        if (hypothesisSelect) {

            hypothesisSelect.addEventListener(
                "change",
                updateHypothesisExperiment
            );

            const alphaButtons = document.querySelectorAll(
                ".hypothesis-alpha-button"
            );

            alphaButtons.forEach(button => {

                button.addEventListener("click", () => {

                    alphaButtons.forEach(item => {
                        item.classList.remove("is-selected");
                        item.setAttribute("aria-pressed", "false");
                    });

                    button.classList.add("is-selected");
                    button.setAttribute("aria-pressed", "true");

                    updateHypothesisExperiment();
                });

            });

            updateHypothesisExperiment();
        }


        // ======================================
        // NORMALIZATION
        // ======================================

        const normalizationMethod =
            document.getElementById("normalizationMethod");

        if (normalizationMethod) {

            const lowerInput =
                document.getElementById("normalizationTargetMin");

            const upperInput =
                document.getElementById("normalizationTargetMax");

            normalizationMethod.addEventListener(
                "change",
                updateNormalizationExperiment
            );

            lowerInput?.addEventListener(
                "input",
                updateNormalizationExperiment
            );

            upperInput?.addEventListener(
                "input",
                updateNormalizationExperiment
            );

            updateNormalizationExperiment();
        }


        // ======================================
        // DISTRIBUTION FITTING
        // ======================================

        const distributionGroupSelect =
            document.getElementById("distributionGroup");

        if (distributionGroupSelect) {

            distributionGroupSelect.addEventListener(
                "change",
                resetDistributionParameters
            );

            const parameterIds = [
                "normalMu",
                "normalSigma",
                "lognormalMu",
                "lognormalSigma",
                "exponentialLambda"
            ];

            parameterIds.forEach(id => {

                const input = document.getElementById(id);

                input?.addEventListener(
                    "input",
                    updateDistributionFitting
                );

            });

            const resetButton = document.getElementById(
                "resetDistributionParameters"
            );

            resetButton?.addEventListener(
                "click",
                resetDistributionParameters
            );

            updateDistributionFitting();
        }


        // ======================================
        // SAMPLING EXPERIMENT
        // ======================================

        const sizeInput =
            document.getElementById("sampleSizeInput");

        const repeatInput =
            document.getElementById("repeatInput");

        const sizeOutput =
            document.getElementById("sampleSizeOutput");

        const repeatOutput =
            document.getElementById("repeatOutput");

        const runButton =
            document.getElementById("runSampling");


        if (sizeInput) {

            if (sizeOutput) {
                sizeOutput.textContent = sizeInput.value;
            }

            sizeInput.addEventListener("input", () => {
                if (sizeOutput) {
                    sizeOutput.textContent = sizeInput.value;
                }
            });
        }


        if (repeatInput) {

            if (repeatOutput) {
                repeatOutput.textContent = repeatInput.value;
            }

            repeatInput.addEventListener("input", () => {
                if (repeatOutput) {
                    repeatOutput.textContent = repeatInput.value;
                }
            });
        }


        if (runButton) {

            runButton.addEventListener(
                "click",
                runSamplingExperiment
            );
        }

}
// ==========================================
// DEPENDENCE EXPERIMENT
// ==========================================


function runGeneratorExperiment() {
    const demo = getActiveGeneratorDemo();
    const result = document.getElementById("generatorResult");
    if (!demo || !result) return;

    const n = Number(document.getElementById("generatorSampleSize")?.value || 1000);
    if (!Number.isFinite(n) || n < 2) return;

    const sample = generateQualitySample(demo.qualities, demo.probabilities, n);
    const hist = sampleHistogram(sample, demo.qualities);

    const mean = sample.reduce((s, v) => s + v, 0) / n;
    const variance = sample.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);

    const maxFreq = Math.max(...hist.map(h => h.frequency), 1e-9);

    result.innerHTML = `
        <div class="result-heading">
            <span class="tag">ГОТОВО</span>
            <span class="muted">${n.toLocaleString("ru-RU")} оценок</span>
        </div>
        <div class="experiment-metrics">
            ${renderResultMetric("Среднее выборки", mean.toFixed(4))}
            ${renderResultMetric("Среднее модели", demo.mean.toFixed(4))}
            ${renderResultMetric("Дисперсия выборки", variance.toFixed(4))}
            ${renderResultMetric("Дисперсия модели", demo.variance.toFixed(4))}
        </div>
        <div class="simulation-chart" style="margin-top:20px">
            <h3>Частоты сгенерированных оценок</h3>
            ${hist.map(h => `
                <div class="composition-item">
                    <div class="composition-label">
                        <span>${h.quality}</span>
                        <strong>${h.count} · ${(h.frequency * 100).toFixed(2)}%</strong>
                    </div>
                    <div class="progress">
                        <div class="progress-fill" style="width:${(h.frequency / maxFreq) * 100}%"></div>
                    </div>
                </div>
            `).join("")}
        </div>
        <div class="note">
            Сравни частоты с модельными вероятностями выше.
            При большом n они должны сходиться (закон больших чисел).
        </div>
    `;
}

// Генератор псевдослучайных чисел с фиксированным seed.
// Позволяет получать одинаковые демонстрационные данные
// при одинаковых параметрах эксперимента.

function createSeededRandom(seed = 12345) {
    let state = seed >>> 0;

    return function () {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 4294967296;
    };
}


// Стандартное нормальное распределение.
// Метод Бокса — Мюллера.

function randomNormal(random) {
    const u1 = Math.max(random(), Number.EPSILON);
    const u2 = random();

    return Math.sqrt(-2 * Math.log(u1)) *
        Math.cos(2 * Math.PI * u2);
}


// Создание демонстрационных парных наблюдений.

function generateDependenceData(size, targetCorrelation) {
    const random = createSeededRandom(20261111);

    const points = [];

    for (let i = 0; i < size; i++) {
        const z1 = randomNormal(random);
        const z2 = randomNormal(random);

        const x = 10.5 + z1 * 1.1;

        const y = 0.34 + (
            targetCorrelation * z1 +
            Math.sqrt(1 - targetCorrelation ** 2) * z2
        ) * 0.16;

        points.push({ x, y });
    }

    return points;
}


// Коэффициент корреляции Пирсона.

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

function drawDependenceScatter(points) {
    const width = 740;
    const height = 340;

    const left = 65;
    const right = 25;
    const top = 25;
    const bottom = 55;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xPadding = (xMax - xMin || 1) * 0.08;
    const yPadding = (yMax - yMin || 1) * 0.08;

    const minX = xMin - xPadding;
    const maxX = xMax + xPadding;
    const minY = yMin - yPadding;
    const maxY = yMax + yPadding;

    const scaleX = value =>
        left + (value - minX) / (maxX - minX) * plotWidth;

    const scaleY = value =>
        top + plotHeight -
        (value - minY) / (maxY - minY) * plotHeight;

    let elements = "";

    // Сетка и подписи осей.

    for (let i = 0; i <= 4; i++) {
        const y = top + plotHeight - i * plotHeight / 4;
        const value = minY + i * (maxY - minY) / 4;

        elements += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 10}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${value.toFixed(2)}
            </text>
        `;
    }

    for (let i = 0; i <= 4; i++) {
        const x = left + i * plotWidth / 4;
        const value = minX + i * (maxX - minX) / 4;

        elements += `
            <text
                x="${x}"
                y="${height - 25}"
                text-anchor="middle"
                class="chart-label"
            >
                ${value.toFixed(2)}
            </text>
        `;
    }

    // Точки наблюдений.

    points.forEach((point, index) => {
        elements += `
            <circle
                cx="${scaleX(point.x)}"
                cy="${scaleY(point.y)}"
                r="3.5"
                class="scatter-point"
            >
                <title>
                    Observation ${index + 1}:
                    X = ${point.x.toFixed(3)},
                    Y = ${point.y.toFixed(3)}
                </title>
            </circle>
        `;
    });

    return `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="Scatter plot of synthetic observations"
        >
            ${elements}

            <line
                x1="${left}"
                y1="${top + plotHeight}"
                x2="${width - right}"
                y2="${top + plotHeight}"
                class="axis-line"
            />

            <text
                x="${width / 2}"
                y="${height - 3}"
                text-anchor="middle"
                class="chart-label"
            >
                Alcohol (%)
            </text>

            <text
                x="15"
                y="${height / 2}"
                text-anchor="middle"
                transform="rotate(-90 15 ${height / 2})"
                class="chart-label"
            >
                Volatile acidity
            </text>
        </svg>
    `;
}


// Обновление всего эксперимента.

function updateDependenceExperiment() {
    const scenario = document.getElementById("dependenceScenario");
    const sizeInput = document.getElementById("dependenceSize");
    const output = document.getElementById("dependenceSizeOutput");
    const result = document.getElementById("dependenceResult");

    if (!scenario || !sizeInput || !result) return;

    const targetCorrelation = Number(scenario.value);
    const size = Number(sizeInput.value);

    output.textContent = size;

    const points = generateDependenceData(
        size,
        targetCorrelation
    );

    const pearson = calculatePearson(points);
    const spearman = calculateSpearman(points);

    result.innerHTML = `
        <div class="dependence-metrics">

            <div class="result-metric">
                <small>Sample size</small>
                <strong>${size}</strong>
            </div>

            <div class="result-metric">
                <small>Pearson r</small>
                <strong>${pearson.toFixed(4)}</strong>
            </div>

            <div class="result-metric">
                <small>Spearman ρ</small>
                <strong>${spearman.toFixed(4)}</strong>
            </div>

        </div>

        <div class="simulation-chart">

            <div class="section-head">
                <div>
                    <span class="tag">SCATTER PLOT</span>
                    <h3>Распределение парных наблюдений</h3>
                </div>
            </div>

            ${drawDependenceScatter(points)}

        </div>

        <div class="note">
            <strong>Интерпретация Пирсона:</strong>
            ${interpretCorrelation(pearson)}.

            <br>

            <strong>Интерпретация Спирмена:</strong>
            ${interpretCorrelation(spearman)}.
        </div>
    `;
}

// ==========================================
// Математика для генератора
// ==========================================

function buildCdf(probabilities) {

    if (!Array.isArray(probabilities) || probabilities.length === 0) {
        throw new Error("Массив вероятностей пуст.");
    }

    const values = probabilities.map(Number);

    if (values.some(p => !Number.isFinite(p) || p < 0)) {
        throw new Error("Вероятности должны быть конечными и неотрицательными.");
    }

    const total = values.reduce((sum, p) => sum + p, 0);

    if (total <= 0) {
        throw new Error("Сумма вероятностей должна быть больше нуля.");
    }

    // Нормализуем вероятности.
    // Это также компенсирует небольшую погрешность округления.
    let cumulative = 0;

    const cdf = values.map(probability => {
        cumulative += probability / total;
        return cumulative;
    });

    // Гарантируем точную правую границу.
    cdf[cdf.length - 1] = 1;

    return cdf;
}

function inverseCdfSample(qualities, cdf, u) {

    if (
        !Array.isArray(qualities) ||
        qualities.length !== cdf.length
    ) {
        throw new Error("Размеры массивов qualities и CDF не совпадают.");
    }

    // Находим первую границу, которая строго больше U.
    for (let i = 0; i < cdf.length; i++) {

        if (u < cdf[i]) {
            return qualities[i];
        }
    }

    return qualities[qualities.length - 1];
}

function generateQualitySample(qualities, probabilities, n) {

    if (
        !Array.isArray(qualities) ||
        qualities.length === 0 ||
        qualities.length !== probabilities.length
    ) {
        throw new Error("Некорректные данные генератора.");
    }

    if (!Number.isInteger(n) || n < 1) {
        throw new Error("Размер выборки должен быть положительным целым числом.");
    }

    // Важное улучшение:
    // строим CDF один раз, а не для каждого элемента.
    const cdf = buildCdf(probabilities);

    const sample = new Array(n);

    for (let i = 0; i < n; i++) {

        sample[i] = inverseCdfSample(
            qualities,
            cdf,
            Math.random()
        );

    }

    return sample;
}
function sampleHistogram(sample, qualities) {
    const counts = Object.fromEntries(qualities.map(q => [q, 0]));
    sample.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const n = sample.length || 1;
    return qualities.map(q => ({
        quality: q,
        count: counts[q] || 0,
        frequency: (counts[q] || 0) / n
    }));
}
// ==========================================
// GENERATOR — CSV PARSER
// ==========================================

function detectGeneratorDelimiter(source) {

    const firstLine = source
        .split(/\r?\n/)
        .find(line => line.trim());

    if (!firstLine) return ",";

    let commas = 0;
    let semicolons = 0;
    let insideQuotes = false;

    for (let i = 0; i < firstLine.length; i++) {

        const char = firstLine[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (!insideQuotes) {

            if (char === ",") commas++;
            if (char === ";") semicolons++;

        }
    }

    return semicolons > commas ? ";" : ",";
}


// Разбираем CSV с учётом кавычек и разделителей внутри текста.

function parseGeneratorCSV(source) {

    const text = String(source).replace(/^\uFEFF/, "");

    const delimiter = detectGeneratorDelimiter(text);

    const table = [];

    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        if (char === '"') {

            // Двойные кавычки внутри CSV-ячейки.
            if (insideQuotes && text[i + 1] === '"') {

                cell += '"';
                i++;

            } else {

                insideQuotes = !insideQuotes;

            }

        } else if (char === delimiter && !insideQuotes) {

            row.push(cell.trim());
            cell = "";

        } else if (char === "\n" && !insideQuotes) {

            row.push(cell.trim());

            if (row.some(value => value !== "")) {
                table.push(row);
            }

            row = [];
            cell = "";

        } else if (char !== "\r") {

            cell += char;

        }
    }

    // Последняя строка.
    row.push(cell.trim());

    if (row.some(value => value !== "")) {
        table.push(row);
    }

    if (table.length < 2) {
        throw new Error("CSV не содержит строк с наблюдениями.");
    }

    const headers = table[0].map(header =>
        header
            .trim()
            .toLowerCase()
            .replace(/[\s_\-()]/g, "")
    );

    const alcoholIndex = headers.indexOf("alcohol");
    const qualityIndex = headers.indexOf("quality");

    if (alcoholIndex === -1 || qualityIndex === -1) {
        throw new Error(
            "Не найдены столбцы alcohol и quality."
        );
    }

    function parseNumber(value) {

        let normalized = String(value)
            .trim()
            .replace(/\s/g, "");

        // Поддержка десятичной запятой в CSV с разделителем ";".
        if (delimiter === ";" && /^\-?\d+,\d+$/.test(normalized)) {
            normalized = normalized.replace(",", ".");
        }

        if (normalized === "") return NaN;

        return Number(normalized);
    }

    const observations = table.slice(1);

    const rows = [];

    observations.forEach(record => {

        const alcohol = parseNumber(record[alcoholIndex]);
        const quality = parseNumber(record[qualityIndex]);

        if (
            Number.isFinite(alcohol) &&
            alcohol > 0 &&
            Number.isInteger(quality)
        ) {

            rows.push({
                alcohol,
                quality
            });

        }

    });

    if (rows.length < 2) {
        throw new Error(
            "Не удалось получить достаточное количество корректных наблюдений."
        );
    }

    return {
        rows,
        invalidCount: observations.length - rows.length,
        delimiter
    };
}


// ==========================================
// GENERATOR — kNN MODEL
// ==========================================

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

// ==========================================
// GENERATOR — EVALUATION VIEW
// ==========================================

function renderGeneratorEvaluation(result) {

    const maxProbability = Math.max(
        ...result.actualDistribution.map(item => item.probability),
        ...result.predictedDistribution.map(item => item.probability),
        0.000001
    );

    const rows = result.qualities.map(quality => {

        const actual = result.actualDistribution.find(
            item => item.quality === quality
        )?.probability || 0;

        const predicted = result.predictedDistribution.find(
            item => item.quality === quality
        )?.probability || 0;

        return `
            <div class="generator-validation-row">

                <strong>Q = ${quality}</strong>

                <div class="generator-validation-bars">

                    <div class="generator-validation-bar">
                        <span>Реальные</span>

                        <div class="generator-validation-track">
                            <i style="width:${actual / maxProbability * 100}%"></i>
                        </div>

                        <b>${(actual * 100).toFixed(2)}%</b>
                    </div>

                    <div class="generator-validation-bar">
                        <span>Модель</span>

                        <div class="generator-validation-track">
                            <i class="model-bar"
                               style="width:${predicted / maxProbability * 100}%"></i>
                        </div>

                        <b>${(predicted * 100).toFixed(2)}%</b>
                    </div>

                </div>

            </div>
        `;
    }).join("");

    const groupLabels = {
        all: "Все вина",
        red: "Красное вино",
        white: "Белое вино"
    };

    return `

        <div class="generator-validation-heading">

            <span class="tag">EVALUATION COMPLETE</span>

            <span class="muted">
                ${groupLabels[result.group]} ·
                ${result.n.toLocaleString("ru-RU")} тестовых наблюдений ·
                k = ${result.k}
            </span>

        </div>


        <div class="generator-validation-metrics">

            <div class="generator-validation-metric">
                <small>TV distance</small>
                <strong>${result.tv.toFixed(4)}</strong>
                <span>Меньше — лучше</span>
            </div>

            <div class="generator-validation-metric">
                <small>Brier score</small>
                <strong>${result.brierScore.toFixed(4)}</strong>
                <span>Меньше — лучше</span>
            </div>

            <div class="generator-validation-metric">
                <small>Разница средних</small>
                <strong>${result.meanDifference > 0 ? "+" : ""}${result.meanDifference.toFixed(4)}</strong>
                <span>Модель − реальные данные</span>
            </div>

            <div class="generator-validation-metric">
                <small>Разница дисперсий</small>
                <strong>${result.varianceDifference > 0 ? "+" : ""}${result.varianceDifference.toFixed(4)}</strong>
                <span>Модель − реальные данные</span>
            </div>

            <div class="generator-validation-metric">
                <small>Реальное среднее</small>
                <strong>${result.actualMean.toFixed(4)}</strong>
                <span>Тестовая выборка</span>
            </div>

            <div class="generator-validation-metric">
                <small>Модельное среднее</small>
                <strong>${result.predictedMean.toFixed(4)}</strong>
                <span>Усреднённые прогнозы</span>
            </div>

            <div class="generator-validation-metric">
                <small>Реальная дисперсия</small>
                <strong>${result.actualVariance.toFixed(4)}</strong>
                <span>Тестовая выборка</span>
            </div>

            <div class="generator-validation-metric">
                <small>Zero probability rate</small>
                <strong>${(result.zeroProbabilityRate * 100).toFixed(2)}%</strong>
                <span>Реальный класс не найден среди соседей</span>
            </div>

        </div>


        <div class="generator-validation-chart">

            <div class="section-head">
                <div>
                    <span class="tag">DISTRIBUTION COMPARISON</span>
                    <h3>Реальные данные и прогноз модели</h3>
                </div>
            </div>

            <div class="generator-validation-legend">

                <span>
                    <i></i>
                    Реальные данные
                </span>

                <span>
                    <i class="model-legend"></i>
                    Модель kNN
                </span>

            </div>

            ${rows}

        </div>


        <div class="note">

            <strong>Интерпретация.</strong>

            Total Variation Distance показывает расхождение
            между маргинальными распределениями качества.

            Brier score учитывает качество вероятностных прогнозов
            для отдельных тестовых образцов.

            Zero probability rate показывает долю наблюдений,
            для которых ближайшие соседи не содержали
            фактическую оценку качества.

            Эти показатели необходимо анализировать совместно.
            Низкая ошибка по среднему не гарантирует хорошего
            воспроизведения всего распределения.

        </div>

    `;
}


// ==========================================
// GENERATOR — RUN EVALUATION
// ==========================================

function runGeneratorEvaluation() {

    const resultElement = document.getElementById(
        "generatorEvaluationResult"
    );

    const groupSelect = document.getElementById(
        "generatorEvaluationGroup"
    );

    const button = document.getElementById(
        "runGeneratorEvaluation"
    );

    if (
        !resultElement ||
        !generatorTrainingRows.length ||
        !generatorTestRows.length
    ) {
        return;
    }

    const group = groupSelect?.value || "all";

    const k = Number(
        document.getElementById("generatorKInput")?.value ||
        currentLab?.generator?.k ||
        720
    );

    if (button) {
        button.disabled = true;
        button.textContent = "ВЫЧИСЛЕНИЕ...";
    }

    try {

        resultElement.innerHTML = `
            <div class="empty-state">
                Выполняется проверка ${group === "all" ? "всей тестовой выборки" : "выбранной группы"}...
            </div>
        `;

        const evaluation = evaluateGeneratorOnTest(
            generatorTrainingRows,
            generatorTestRows,
            k,
            group
        );

        resultElement.innerHTML =
            renderGeneratorEvaluation(evaluation);

    } catch (error) {

        console.error("Ошибка проверки kNN:", error);

        resultElement.innerHTML = `
            <div class="note">
                Ошибка проверки модели: ${escapeHTML(error.message)}
            </div>
        `;

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "ПРОВЕРИТЬ МОДЕЛЬ";
        }

    }
}

// ==========================================
// GENERATOR — ACTIVE MODEL
// ==========================================

function getActiveGeneratorDemo() {

    if (
        activeGeneratorDemo &&
        generatorTrainingLabId === currentLab?.id
    ) {
        return activeGeneratorDemo;
    }

    return currentLab?.generator?.demo || null;
}


// Обновляем визуальное представление условной модели.

function updateGeneratorModelView(model) {

    if (!model) return;

    const title = document.getElementById(
        "generatorModelTitle"
    );

    const metrics = document.getElementById(
        "generatorModelMetrics"
    );

    const probabilityList = document.getElementById(
        "generatorProbabilityList"
    );

    const cdfMount = document.getElementById(
        "generatorCdfExplorerMount"
    );

    const sampleDescription = document.getElementById(
        "generatorSampleDescription"
    );

    if (title) {

        title.textContent =
            `Условное распределение: alcohol = ${model.alcohol.toFixed(2)} ${model.unit}, k = ${model.k}`;
    }

    if (metrics) {

        metrics.innerHTML = `
            <div class="result-metric">
                <small>Среднее модели</small>
                <strong>${model.mean.toFixed(4)}</strong>
            </div>

            <div class="result-metric">
                <small>Дисперсия модели</small>
                <strong>${model.variance.toFixed(4)}</strong>
            </div>

            <div class="result-metric">
                <small>Количество соседей</small>
                <strong>${model.k}</strong>
            </div>

            <div class="result-metric">
                <small>Метод</small>
                <strong>kNN + inverse CDF</strong>
            </div>
        `;
    }

    if (probabilityList) {

        probabilityList.innerHTML = model.qualities.map(
            (quality, index) => {

                const probability = model.probabilities[index];

                return `
                    <div class="composition-item">

                        <div class="composition-label">

                            <span>Оценка ${quality}</span>

                            <strong>
                                ${(probability * 100).toFixed(2)}%
                            </strong>

                        </div>

                        <div class="progress">

                            <div
                                class="progress-fill"
                                style="width:${probability * 100}%"
                            ></div>

                        </div>

                    </div>
                `;
            }
        ).join("");
    }

    // Перестраиваем CDF для нового условного распределения.
    if (
        cdfMount &&
        typeof renderGeneratorCdfExplorer === "function"
    ) {

        cdfMount.innerHTML =
            renderGeneratorCdfExplorer(model);
    }

    if (sampleDescription) {

        sampleDescription.textContent =
            `Генерация оценок из распределения k ближайших вин при alcohol = ${model.alcohol.toFixed(2)}% об.`;
    }

    // Старый результат больше не соответствует новой модели.
    const result = document.getElementById("generatorResult");

    if (result) {

        result.innerHTML = `
            <div class="empty-state">
                Модель обновлена. Запусти генерацию новой выборки.
            </div>
        `;
    }
}


// Пересчитываем условную модель при изменении параметров.

function updateGeneratorKnnModel() {

    const alcoholInput = document.getElementById(
        "generatorAlcoholInput"
    );

    const kInput = document.getElementById(
        "generatorKInput"
    );

    const alcoholOutput = document.getElementById(
        "generatorAlcoholOutput"
    );

    const kOutput = document.getElementById(
        "generatorKOutput"
    );

    if (
        !generatorTrainingRows.length ||
        !alcoholInput ||
        !kInput
    ) {
        return;
    }

    const alcohol = Number(alcoholInput.value);
    const k = Number(kInput.value);

    const model = calculateKnnQualityDistribution(
        generatorTrainingRows,
        alcohol,
        k
    );

    model.unit = currentLab?.generator?.demo?.unit || "% об.";

    activeGeneratorDemo = model;
    generatorTrainingLabId = currentLab?.id;

    if (alcoholOutput) {
        alcoholOutput.textContent = alcohol.toFixed(2);
    }

    if (kOutput) {
        kOutput.textContent = model.k;
    }

    updateGeneratorModelView(model);
}


// ==========================================
// GENERATOR — FETCH CSV
// ==========================================

async function fetchGeneratorCSV(path) {

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Не удалось загрузить ${path}. HTTP ${response.status}`
        );
    }

    const source = await response.text();

    return parseGeneratorCSV(source);
}


// ==========================================
// GENERATOR — TRAIN / TEST SPLIT
// ==========================================

function splitGeneratorRows(
    rows,
    testFraction = 0.2,
    seed = 20261112
) {

    const random = createSeededRandom(seed);

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


// ==========================================
// GENERATOR — LOAD AND CACHE DATASET
// ==========================================

async function getGeneratorDataset() {

    if (generatorDatasetCache) {
        return generatorDatasetCache;
    }

    // Не запускаем параллельно несколько одинаковых загрузок.
    if (generatorDatasetPromise) {
        return generatorDatasetPromise;
    }

    generatorDatasetPromise = (async () => {

        const [redData, whiteData] = await Promise.all([

            fetchGeneratorCSV(
                "./data/winequality-red.csv"
            ),

            fetchGeneratorCSV(
                "./data/winequality-white.csv"
            )

        ]);

        // Помечаем тип вина, чтобы сохранить происхождение записей.
        const redRows = redData.rows.map(row => ({
            ...row,
            wineType: "red"
        }));

        const whiteRows = whiteData.rows.map(row => ({
            ...row,
            wineType: "white"
        }));

        // Делим красное и белое вино отдельно.
        // Так пропорции групп сохраняются и в train, и в test.
        const redSplit = splitGeneratorRows(
            redRows,
            0.2,
            20261112
        );

        const whiteSplit = splitGeneratorRows(
            whiteRows,
            0.2,
            20261113
        );

        const dataset = {

            train: [
                ...redSplit.train,
                ...whiteSplit.train
            ],

            test: [
                ...redSplit.test,
                ...whiteSplit.test
            ],

            redCount: redRows.length,
            whiteCount: whiteRows.length,

            invalidCount:
                redData.invalidCount +
                whiteData.invalidCount

        };

        generatorDatasetCache = dataset;

        return dataset;

    })().catch(error => {

        // При ошибке разрешаем повторить загрузку.
        generatorDatasetPromise = null;

        throw error;
    });

    return generatorDatasetPromise;
}


// ==========================================
// GENERATOR — AUTOMATIC DATA CONNECTION
// ==========================================

async function loadGeneratorTrainingData() {

    const status = document.getElementById(
        "generatorTrainingStatus"
    );

    const controls = document.getElementById(
        "generatorKnnControls"
    );

    if (!status || !controls || !currentLab) {
        return;
    }

    const requestedLabId = currentLab.id;

    status.textContent =
        "Загружаем красное и белое вино из папки data...";

    controls.hidden = true;

    try {

        const dataset = await getGeneratorDataset();

        // Пользователь мог переключить лабораторную,
        // пока CSV загружались.
        if (
            currentLab?.id !== requestedLabId ||
            !document.getElementById("generatorTrainingStatus")
        ) {
            return;
        }

        generatorTrainingRows = dataset.train;
        generatorTestRows = dataset.test;

        generatorTrainingLabId = currentLab.id;
        activeGeneratorDemo = null;

        const alcoholValues = generatorTrainingRows.map(
            row => row.alcohol
        );

        const minAlcohol = Math.min(...alcoholValues);
        const maxAlcohol = Math.max(...alcoholValues);

        const alcoholInput = document.getElementById(
            "generatorAlcoholInput"
        );

        const kInput = document.getElementById(
            "generatorKInput"
        );

        if (!alcoholInput || !kInput) {
            throw new Error(
                "Не найдены элементы управления kNN."
            );
        }

        // Диапазон крепости определяем автоматически.
        alcoholInput.min = (
            Math.floor(minAlcohol * 10) / 10
        ).toFixed(1);

        alcoholInput.max = (
            Math.ceil(maxAlcohol * 10) / 10
        ).toFixed(1);

        alcoholInput.step = "0.1";

        const initialAlcohol = Number(
            currentLab.generator.demo.alcohol
        );

        alcoholInput.value = Math.min(
            Number(alcoholInput.max),
            Math.max(
                Number(alcoholInput.min),
                initialAlcohol
            )
        );

        // Ограничиваем k объёмом обучающей выборки.
        const maxK = Math.min(
            2000,
            generatorTrainingRows.length
        );

        kInput.min = 1;
        kInput.max = maxK;
        kInput.step = 1;

        kInput.value = Math.min(
            currentLab.generator.k || 720,
            maxK
        );

        alcoholInput.disabled = false;
        kInput.disabled = false;

        controls.hidden = false;

        const evaluationButton = document.getElementById(
            "runGeneratorEvaluation"
        );
        
        const evaluationGroup = document.getElementById(
            "generatorEvaluationGroup"
        );
        
        if (evaluationButton) {
            evaluationButton.disabled = false;
        }
        
        if (evaluationGroup) {
            evaluationGroup.disabled = false;
        }

        status.textContent =
            `Загружено ${(
                dataset.redCount + dataset.whiteCount
            ).toLocaleString("ru-RU")} наблюдений. ` +
            `Красное: ${dataset.redCount}. ` +
            `Белое: ${dataset.whiteCount}. ` +
            `Обучение: ${dataset.train.length.toLocaleString("ru-RU")}. ` +
            `Проверка: ${dataset.test.length.toLocaleString("ru-RU")}. ` +
            `Некорректных строк: ${dataset.invalidCount}. ` +
            `В kNN используются только обучающие данные.`;

        // Считаем первую условную модель.
        const runButton = document.getElementById("runGenerator");

        if (runButton) {
            runButton.disabled = false;
        }

        updateGeneratorKnnModel();

    } catch (error) {

        console.error(
            "Ошибка подключения Wine Quality:",
            error
        );

        status.textContent =
            `Ошибка загрузки: ${error.message}. ` +
            `Проверь расположение CSV-файлов в папке data.`;
        }
}



// ==========================================
// HYPOTHESIS TESTING EXPERIMENT
// ==========================================

function updateHypothesisExperiment() {

    const select = document.getElementById("hypothesisSelect");
    const result = document.getElementById("hypothesisResult");

    if (!select || !result || !currentLab) return;

    // Берём гипотезу непосредственно из текущей лабораторной.
    const hypothesis = currentLab.hypotheses.find(
        item => item.id === select.value
    );

    if (!hypothesis) return;

    // Определяем выбранный пользователем уровень значимости.
    const activeAlpha = document.querySelector(
        ".hypothesis-alpha-button.is-selected"
    );

    const alpha = activeAlpha
        ? Number(activeAlpha.dataset.alpha)
        : 0.05;

    let decisionTitle;
    let decisionDescription;
    let decisionClass;

    // ======================================
    // CASE 1. EXACT P-VALUE
    // ======================================

    if (typeof hypothesis.pValue === "number") {

        if (hypothesis.pValue <= alpha) {

            decisionTitle = "Отклоняем H₀";

            decisionDescription =
                "p-value не превышает выбранный уровень значимости. Есть статистические основания отвергнуть нулевую гипотезу.";

            decisionClass = "decision-reject";

        } else {

            decisionTitle = "Нет оснований отклонить H₀";

            decisionDescription =
                "p-value превышает уровень значимости. Оснований отвергнуть нулевую гипотезу недостаточно.";

            decisionClass = "decision-neutral";
        }

    }

    // ======================================
    // CASE 2. ONLY UPPER BOUND IS KNOWN
    // ======================================

    else if (
        typeof hypothesis.pValueUpperBound === "number" &&
        alpha >= hypothesis.pValueUpperBound
    ) {

        decisionTitle = "Отклоняем H₀";

        decisionDescription =
            `Известно, что p-value меньше ${hypothesis.pValueUpperBound}. Этого достаточно для отклонения H₀ при α = ${alpha}.`;

        decisionClass = "decision-reject";

    }

    // ======================================
    // CASE 3. INSUFFICIENT INFORMATION
    // ======================================

    else {

        decisionTitle = "Недостаточно численных данных";

        decisionDescription =
            `Сохранённые результаты не позволяют определить решение при α = ${alpha}. Необходимо получить точное p-value.`;

        decisionClass = "decision-unknown";
    }

    // ======================================
    // METRICS
    // ======================================

    const metricsHTML = (hypothesis.metrics || []).map(metric => `
        <div class="result-metric">

            <small>${escapeHTML(metric.label)}</small>

            <strong>${escapeHTML(metric.value)}</strong>

        </div>
    `).join("");

    const pValueDisplay = hypothesis.pValueText ||
        (
            typeof hypothesis.pValue === "number"
                ? hypothesis.pValue.toExponential(3)
                : "Не указано"
        );

    // ======================================
    // RESULT RENDERING
    // ======================================

    result.innerHTML = `

        <div class="hypothesis-statements">

            <div>

                <span class="tag">H₀ / NULL HYPOTHESIS</span>

                <p>${escapeHTML(hypothesis.h0)}</p>

            </div>

            <div>

                <span class="tag">H₁ / ALTERNATIVE HYPOTHESIS</span>

                <p>${escapeHTML(hypothesis.h1)}</p>

            </div>

        </div>


        <div class="hypothesis-test-info">

            <span class="tag">STATISTICAL TEST</span>

            <strong>${escapeHTML(hypothesis.method)}</strong>

        </div>


        <div class="hypothesis-result-metrics">

            ${metricsHTML || emptyState("Численные показатели отсутствуют.")}

        </div>


        <div class="hypothesis-decision ${decisionClass}">

            <div>

                <span class="tag">
                    DECISION · α = ${alpha.toFixed(2)}
                </span>

                <h3>${decisionTitle}</h3>

                <p>${decisionDescription}</p>

            </div>

            <div class="hypothesis-pvalue">

                <small>p-value</small>

                <strong>${escapeHTML(pValueDisplay)}</strong>

            </div>

        </div>


        <div class="note">

            <strong>Вывод исследования.</strong>

            ${escapeHTML(
                hypothesis.conclusion || hypothesis.detail || ""
            )}

        </div>

    `;
}
// ==========================================
// 19. SAMPLING CHART
// ==========================================

function renderSamplingChart(sampling) {

    const chart = document.getElementById("samplingChart");

    if (!chart) return;

    const series = [
        {
            key: "wr",
            color: "#945165",
            label: "С возвращением"
        },
        {
            key: "wor",
            color: "#c2a46c",
            label: "Без возвращения"
        },
        {
            key: "seWor",
            color: "#788c7d",
            label: "Теоретическая ошибка · без возвращения"
        }
    ];

    // Проверяем структуру данных, чтобы некорректная точка
    // не превращала весь график в NaN.
    const points = Array.isArray(sampling?.points)
        ? sampling.points
            .filter(point =>
                Number.isFinite(Number(point.n)) &&
                Number(point.n) > 0 &&
                series.every(item =>
                    Number.isFinite(Number(point[item.key])) &&
                    Number(point[item.key]) >= 0
                )
            )
            .map(point => ({
                n: Number(point.n),
                wr: Number(point.wr),
                wor: Number(point.wor),
                seWor: Number(point.seWor)
            }))
            .sort((a, b) => a.n - b.n)
        : [];

    if (points.length < 2) {
        chart.innerHTML = emptyState(
            "Недостаточно корректных точек для графика сходимости."
        );
        return;
    }

    const minN = points[0].n;
    const maxN = points[points.length - 1].n;

    if (minN === maxN) {
        chart.innerHTML = emptyState(
            "Для построения графика нужны разные размеры выборки."
        );
        return;
    }

    const allValues = points.flatMap(point =>
        series.map(item => point[item.key])
    );

    const maxValue = Math.max(...allValues) * 1.15 || 1;

    const width = 680;
    const height = 280;

    const left = 58;
    const right = 25;
    const top = 20;
    const bottom = 48;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    // X теперь пропорциональна реальному n.
    // Например, расстояние между 10 и 30 будет меньше,
    // чем расстояние между 500 и 1000.
    const scaleX = n =>
        left + ((n - minN) / (maxN - minN)) * plotWidth;

    const scaleY = value =>
        top + plotHeight - (value / maxValue) * plotHeight;

    let svg = "";

    // Горизонтальная сетка и шкала стандартной ошибки.
    for (let i = 0; i <= 4; i++) {
        const value = maxValue * i / 4;
        const y = scaleY(value);

        svg += `
            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 9}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${value.toFixed(3)}
            </text>
        `;
    }

    // Рисуем три серии: эмпирические SE и теоретическую SE без возвращения.
    series.forEach(item => {
        const coordinates = points.map(point => ({
            x: scaleX(point.n),
            y: scaleY(point[item.key]),
            n: point.n,
            value: point[item.key]
        }));

        const path = coordinates
            .map(point => `${point.x},${point.y}`)
            .join(" ");

        svg += `
            <polyline
                points="${path}"
                fill="none"
                stroke="${item.color}"
                stroke-width="2.5"
            />
        `;

        coordinates.forEach(point => {
            svg += `
                <circle
                    cx="${point.x}"
                    cy="${point.y}"
                    r="4"
                    fill="${item.color}"
                >
                    <title>
                        n = ${point.n}; SE = ${point.value.toFixed(5)}
                    </title>
                </circle>
            `;
        });
    });

    // Подписи размеров выборки стоят в реальных координатах X.
    points.forEach(point => {
        const x = scaleX(point.n);

        svg += `
            <text
                x="${x}"
                y="${height - 15}"
                text-anchor="middle"
                class="chart-label"
            >
                ${point.n}
            </text>
        `;
    });

    // Ось X.
    svg += `
        <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${width - right}"
            y2="${top + plotHeight}"
            class="axis-line"
        />
    `;

    chart.innerHTML = `
        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="Стандартная ошибка в зависимости от размера выборки"
        >
            ${svg}
        </svg>

        <div class="chart-legend">
            ${series.map(item => `
                <span>
                    <i style="background:${item.color}"></i>
                    ${item.label}
                </span>
            `).join("")}
        </div>
    `;
}


// ==========================================
// МЕТОДЫ ИССЛЕДОВАНИЯ
// ==========================================

function renderMethods(lab) {

    const methods = Array.isArray(lab.methods)
        ? lab.methods
        : [];

    const variables = Array.isArray(lab.variables)
        ? lab.variables
        : [];

    // Проверяем, есть ли данные для нормализации.
    const hasNormalizationData =
        Boolean(getNormalizationDataset(lab));

    return `

        <section class="section" id="methods">

            ${sectionHeader(
                "06 / МЕТОДОЛОГИЯ",
                "Методы исследования",
                "Изучение данных, распределений и статистических характеристик."
            )}


            <div class="grid three-col">

                ${methods.length

                    ? methods.map(method => `

                        <div class="card">

                            <span class="tag">МЕТОД</span>

                            <h3>
                                ${escapeHTML(method.title)}
                            </h3>

                            <p class="muted">
                                ${escapeHTML(method.description)}
                            </p>

                        </div>

                    `).join("")

                    : emptyState("Методы пока не добавлены.")

                }

            </div>


            ${hasNormalizationData ? `

                <div class="card normalization-lab">

                    <div class="experiment-top">

                        <div>

                            <span class="tag">
                                ЭКСПЕРИМЕНТ 004
                            </span>

                            <h3>
                                Интерактивная нормализация
                            </h3>

                            <p class="muted">
                                Изучение методов Min–Max и Z-score
                                на распределении оценки качества вина.
                            </p>

                        </div>

                        <span class="experiment-status">
                            ● ИНТЕРАКТИВНО
                        </span>

                    </div>


                    <div class="normalization-controls">

                        <div class="control-field">

                            <label for="normalizationMethod">
                                Метод преобразования
                            </label>

                            <select
                                id="normalizationMethod"
                                class="select"
                            >

                                <option value="minmax">
                                    Min–Max
                                </option>

                                <option value="zscore">
                                    Z-score
                                </option>

                            </select>

                        </div>


                        <div
                            class="control-field"
                            id="normalizationLowerControl"
                        >

                            <label for="normalizationTargetMin">
                                Нижняя граница
                            </label>

                            <input
                                id="normalizationTargetMin"
                                class="select"
                                type="number"
                                step="any"
                                value="0"
                            >

                        </div>


                        <div
                            class="control-field"
                            id="normalizationUpperControl"
                        >

                            <label for="normalizationTargetMax">
                                Верхняя граница
                            </label>

                            <input
                                id="normalizationTargetMax"
                                class="select"
                                type="number"
                                step="any"
                                value="1"
                            >

                        </div>

                    </div>


                    <div
                        id="normalizationResult"
                        class="normalization-result"
                    >

                        <div class="empty-state">
                            Измени параметры эксперимента,
                            чтобы увидеть результат.
                        </div>

                    </div>

                </div>

            ` : `

                <div class="card normalization-lab">

                    <span class="tag">НОРМАЛИЗАЦИЯ</span>

                    <h3>
                        Эксперимент пока недоступен
                    </h3>

                    <p class="muted">
                        Для нормализации необходимы числовые значения
                        и частоты наблюдений.
                    </p>

                </div>

            `}


            ${variables.length ? `

                <div class="card eda-explorer-card">

                    <div class="experiment-top">

                        <div>

                            <span class="tag">
                                ЭКСПЕРИМЕНТ 005
                            </span>

                            <h3>
                                Исследовательский анализ данных
                            </h3>

                            <p class="muted">
                                Изучение описательных характеристик
                                исследуемых случайных величин.
                            </p>

                        </div>

                        <span class="experiment-status">
                            ● ИНТЕРАКТИВНО
                        </span>

                    </div>


                    <div class="eda-controls">

                        <div class="control-field">

                            <label for="edaVariableSelect">
                                Исследуемая величина
                            </label>

                            <select
                                id="edaVariableSelect"
                                class="select"
                            >

                                ${variables.map(variable => `

                                    <option value="${escapeHTML(variable.id)}">
                                        ${escapeHTML(variable.name)}
                                    </option>

                                `).join("")}

                            </select>

                        </div>

                    </div>


                    <div id="edaExplorerResult"></div>

                </div>

            ` : `

                <div class="card eda-explorer-card">

                    <span class="tag">
                        ИССЛЕДОВАТЕЛЬСКИЙ АНАЛИЗ ДАННЫХ
                    </span>

                    <h3>
                        Нет исследуемых величин
                    </h3>

                    <p class="muted">
                        Добавь переменные в data.js, чтобы начать исследование.
                    </p>

                </div>

            `}

        </section>

    `;
}


// ==========================================
// SAMPLING SIMULATOR
// ==========================================

function runSamplingExperiment() {

    const quality = currentLab.variables.find(
        variable => variable.id === "quality"
    );

    if (!quality?.chart) return;

    const labels = quality.chart.labels.map(Number);
    const counts = quality.chart.values.map(Number);

    // Восстанавливаем эмпирическую совокупность
    const population = [];

    labels.forEach((value, index) => {

        for (let i = 0; i < counts[index]; i++) {
            population.push(value);
        }

    });

    const N = population.length;

    const n = Number(
        document.getElementById("sampleSizeInput").value
    );

    const repetitions = Number(
        document.getElementById("repeatInput").value
    );

    const mode = document.getElementById("samplingMode").value;

    if (
        !Number.isInteger(n) ||
        !Number.isInteger(repetitions) ||
        n < 1 ||
        n > N ||
        repetitions < 2
    ) {
        return;
    }

    // Генеральные характеристики
    const populationMean =
        population.reduce((sum, value) => sum + value, 0) / N;

    const populationVariance =
        population.reduce(
            (sum, value) => sum + (value - populationMean) ** 2,
            0
        ) / N;

    const sampleMeans = [];

    // Массив индексов для отбора без возвращения.
    // Его можно использовать повторно: перестановка
    // остаётся равномерно случайной после каждого опыта.
    const indices = Uint32Array.from(
        { length: N },
        (_, i) => i
    );

    // ======================================
    // МНОГОКРАТНОЕ МОДЕЛИРОВАНИЕ
    // ======================================

    for (let repetition = 0;
         repetition < repetitions;
         repetition++) {

        let sum = 0;

        if (mode === "with") {

            // Отбор С возвращением
            for (let i = 0; i < n; i++) {

                const randomIndex = Math.floor(
                    Math.random() * N
                );

                sum += population[randomIndex];

            }

        } else {

            // Отбор БЕЗ возвращения:
            // частичный алгоритм Фишера — Йетса.

            for (let i = 0; i < n; i++) {

                const randomIndex =
                    i + Math.floor(Math.random() * (N - i));

                const temp = indices[i];

                indices[i] = indices[randomIndex];
                indices[randomIndex] = temp;

                sum += population[indices[i]];

            }

        }

        sampleMeans.push(sum / n);

    }

    // ======================================
    // ЭМПИРИЧЕСКИЕ ХАРАКТЕРИСТИКИ
    // ======================================

    const meanOfMeans =
        sampleMeans.reduce((sum, value) => sum + value, 0)
        / repetitions;

    const empiricalSE = Math.sqrt(
        sampleMeans.reduce(
            (sum, value) => sum + (value - meanOfMeans) ** 2,
            0
        ) / (repetitions - 1)
    );

    // ======================================
    // ТЕОРЕТИЧЕСКАЯ СТАНДАРТНАЯ ОШИБКА
    // ======================================

    let theoreticalSE;

    if (mode === "with") {

        theoreticalSE = Math.sqrt(
            populationVariance / n
        );

    } else {

        theoreticalSE = Math.sqrt(
            (populationVariance / n) *
            ((N - n) / (N - 1))
        );

    }

    const bias = meanOfMeans - populationMean;

    const relativeError = theoreticalSE > 0
        ? Math.abs(empiricalSE - theoreticalSE)
            / theoreticalSE * 100
        : null;

    // ======================================
    // ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ
    // ======================================

    const result = document.getElementById("samplingResult");

    result.innerHTML = `

        <div class="result-heading">
            <span class="tag">SIMULATION COMPLETE</span>
            <span class="muted">
                ${repetitions.toLocaleString("ru-RU")} experiments
            </span>
        </div>

        <div class="experiment-metrics">

            ${renderResultMetric(
                "Population mean",
                populationMean.toFixed(5)
            )}

            ${renderResultMetric(
                "Mean of sample means",
                meanOfMeans.toFixed(5)
            )}

            ${renderResultMetric(
                "Empirical SE",
                empiricalSE.toFixed(5)
            )}

            ${renderResultMetric(
                "Theoretical SE",
                theoreticalSE.toFixed(5)
            )}

        </div>

        <div class="simulation-chart">

            <div class="section-head">
                <div>
                    <span class="tag">DISTRIBUTION</span>
                    <h3>Sample means histogram</h3>
                </div>

                <span class="muted">
                    ${mode === "with"
                        ? "With replacement"
                        : "Without replacement"}
                </span>
            </div>

            ${drawSamplingHistogram(
                sampleMeans,
                populationMean,
                meanOfMeans,
                theoreticalSE
            )}

        </div>

        <div class="note">
            <strong>Experiment results.</strong><br>

            Bias: ${bias.toFixed(6)}.<br>

            Difference between empirical and theoretical SE:
            ${relativeError === null
                ? "not defined"
                : relativeError.toFixed(2) + "%"}.
        </div>

    `;

}


// ==========================================
// METRIC CARD
// ==========================================

function renderResultMetric(label, value) {

    return `
        <div class="result-metric">

            <small>${escapeHTML(label)}</small>

            <strong>${escapeHTML(value)}</strong>

        </div>
    `;

}


// ==========================================
// ГИСТОГРАММА ВЫБОРОЧНЫХ СРЕДНИХ
// ==========================================

function drawSamplingHistogram(
    values,
    populationMean,
    simulationMean,
    theoreticalSE
) {

    if (!Array.isArray(values) || values.length === 0) {

        return emptyState(
            "Нет результатов моделирования."
        );

    }

    const binCount = 22;

    let min = Math.min(
        ...values,
        populationMean,
        simulationMean
    );

    let max = Math.max(
        ...values,
        populationMean,
        simulationMean
    );

    // Добавляем область для нормального приближения.
    if (
        Number.isFinite(theoreticalSE) &&
        theoreticalSE > 0
    ) {

        min = Math.min(
            min,
            populationMean - 4 * theoreticalSE
        );

        max = Math.max(
            max,
            populationMean + 4 * theoreticalSE
        );

    }

    if (min === max) {

        min -= 0.05;
        max += 0.05;

    }

    const padding = (max - min) * 0.04;

    min -= padding;
    max += padding;

    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);

    // Формируем частоты эмпирической гистограммы.
    values.forEach(value => {

        const index = Math.min(
            binCount - 1,
            Math.max(
                0,
                Math.floor((value - min) / binWidth)
            )
        );

        bins[index]++;

    });

    // ======================================
    // ТЕОРЕТИЧЕСКОЕ НОРМАЛЬНОЕ ПРИБЛИЖЕНИЕ
    // ======================================

    const curvePoints = [];

    if (
        Number.isFinite(theoreticalSE) &&
        theoreticalSE > 0
    ) {

        const curveSteps = 140;

        for (let i = 0; i <= curveSteps; i++) {

            const x = min + (max - min) *
                i / curveSteps;

            // Переводим плотность в ожидаемую частоту.
            const expectedFrequency =
                values.length *
                binWidth *
                normalPDF(
                    x,
                    populationMean,
                    theoreticalSE
                );

            curvePoints.push({
                x,
                y: expectedFrequency
            });

        }

    }

    const maxHistogram = Math.max(...bins);

    const maxCurve = curvePoints.length
        ? Math.max(...curvePoints.map(point => point.y))
        : 0;

    const maxFrequency = Math.max(
        maxHistogram,
        maxCurve,
        1
    );

    // ======================================
    // SVG CANVAS
    // ======================================

    const width = 760;
    const height = 330;

    const left = 62;
    const right = 25;
    const top = 25;
    const bottom = 62;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const yMax = maxFrequency * 1.12;

    const scaleX = value =>
        left +
        ((value - min) / (max - min)) *
        plotWidth;

    const scaleY = value =>
        top +
        plotHeight -
        value / yMax * plotHeight;

    let elements = "";

    // ======================================
    // СЕТКА
    // ======================================

    for (let i = 0; i <= 4; i++) {

        const value = yMax * i / 4;

        const y = scaleY(value);

        elements += `

            <line
                x1="${left}"
                y1="${y}"
                x2="${width - right}"
                y2="${y}"
                class="grid-line"
            />

            <text
                x="${left - 9}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-label"
            >
                ${Math.round(value)}
            </text>

        `;

    }

    // ======================================
    // СТОЛБЦЫ ГИСТОГРАММЫ
    // ======================================

    const barStep = plotWidth / binCount;

    bins.forEach((frequency, index) => {

        const barHeight =
            frequency / yMax * plotHeight;

        const x = left + index * barStep;

        const y =
            top + plotHeight - barHeight;

        elements += `

            <rect
                x="${x + 1}"
                y="${y}"
                width="${barStep - 2}"
                height="${barHeight}"
                rx="3"
                class="chart-bar"
            >

                <title>
                    Частота наблюдений: ${frequency}
                </title>

            </rect>

        `;

    });

    // ======================================
    // НОРМАЛЬНАЯ КРИВАЯ
    // ======================================

    if (curvePoints.length) {

        const path = curvePoints.map((point, index) => {

            return `${index === 0 ? "M" : "L"} ` +
                `${scaleX(point.x)} ${scaleY(point.y)}`;

        }).join(" ");

        elements += `

            <path
                d="${path}"
                class="sampling-normal-curve"
            />

        `;

    }

    // ======================================
    // ВЕРТИКАЛЬНЫЕ ЛИНИИ СРЕДНИХ
    // ======================================

    const populationX = scaleX(populationMean);
    const simulationX = scaleX(simulationMean);

    elements += `

        <line
            x1="${populationX}"
            y1="${top}"
            x2="${populationX}"
            y2="${top + plotHeight}"
            class="population-line"
        />

        <line
            x1="${simulationX}"
            y1="${top}"
            x2="${simulationX}"
            y2="${top + plotHeight}"
            class="simulation-line"
        />

        <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${width - right}"
            y2="${top + plotHeight}"
            class="axis-line"
        />

        <text
            x="${left}"
            y="${height - 22}"
            class="chart-label"
        >
            ${min.toFixed(3)}
        </text>

        <text
            x="${width - right}"
            y="${height - 22}"
            text-anchor="end"
            class="chart-label"
        >
            ${max.toFixed(3)}
        </text>

        <text
            x="${width / 2}"
            y="${height - 5}"
            text-anchor="middle"
            class="chart-label"
        >
            Среднее значение выборки
        </text>

    `;

    return `

        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="Гистограмма выборочных средних с нормальным приближением"
        >
            ${elements}
        </svg>


        <div class="chart-legend">

            <span>
                <i class="legend-histogram"></i>
                Выборочные средние
            </span>

            <span>
                <i class="legend-normal"></i>
                Нормальное приближение
            </span>

            <span>
                <i class="legend-population"></i>
                Среднее генеральной совокупности
            </span>

            <span>
                <i class="legend-simulation"></i>
                Среднее моделирования
            </span>

        </div>

    `;

}


// ==========================================
// Запуск приложения
// ==========================================
// Запускаем приложение только после готовности документа.

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        { once: true }
    );

} else {

    init();

}