// ==========================================
// STAT LAB — APPLICATION LOGIC
// ==========================================

const NAV_ITEMS = [
    { id: "overview", title: "Overview", number: "00" },
    { id: "dataset", title: "Dataset", number: "01" },
    { id: "variables", title: "Random variables", number: "02" },
    { id: "hypotheses", title: "Hypotheses", number: "03" },
    { id: "sampling", title: "Sampling", number: "04" },
    { id: "methods", title: "Methods", number: "05" },
    { id: "generator", title: "Generator", number: "06" },
    { id: "conclusions", title: "Conclusions", number: "07" },
    { id: "references", title: "Sources", number: "08" }
];

let currentLab = null;


// ==========================================
// 1. INITIALIZATION
// ==========================================

function init() {
    const selector = document.getElementById("labSelect");

    // Создаём список лабораторных
    selector.innerHTML = LABS.map(lab => `
        <option value="${lab.id}">
            LAB ${lab.number} — ${escapeHTML(lab.title)}
        </option>
    `).join("");

    // Начальная лабораторная
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
// 3. RENDER LAB
// ==========================================

function renderLab(labId) {

    currentLab = LABS.find(lab => lab.id === labId);

    if (!currentLab) {
        console.error("Laboratory not found:", labId);
        return;
    }

    document.title =
        `STAT LAB — ${currentLab.title}`;

    document.getElementById("breadcrumb").innerHTML = `
        RESEARCH /
        <strong>LAB ${currentLab.number} — ${escapeHTML(currentLab.title)}</strong>
    `;

    document.getElementById("labStatus").textContent =
        currentLab.status;

    renderNavigation();
    renderContent();

    document.querySelector(".main").scrollTo({
        top: 0,
        behavior: "instant"
    });

    attachInteractions();
}


// ==========================================
// 4. NAVIGATION
// ==========================================

function renderNavigation() {

    const nav = document.getElementById("sectionNav");

    nav.innerHTML = `
        <div class="nav-label">RESEARCH STRUCTURE</div>

        ${NAV_ITEMS.map(item => `
            <a href="#${item.id}" class="nav-link">
                <span class="nav-number">${item.number}</span>
                ${item.title}
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
// 5. MAIN CONTENT
// ==========================================

function renderContent() {

    const lab = currentLab;

    document.getElementById("pageContent").innerHTML = `

        ${renderOverview(lab)}

        ${renderDataset(lab)}

        ${renderVariables(lab)}

        ${renderHypotheses(lab)}

        ${renderSampling(lab)}

        ${renderMethods(lab)}

        ${renderGenerator(lab)}

        ${renderConclusions(lab)}

        ${renderReferences(lab)}

        <footer class="footer">
            <span>STAT LAB</span>
            <span>LAB ${lab.number}</span>
            <span>APPLIED STATISTICS</span>
        </footer>

    `;

    observeSections();
}


// ==========================================
// 6. OVERVIEW
// ==========================================

function renderOverview(lab) {

    const metrics = lab.dataset.metrics || [];

    return `

        <section class="hero" id="overview">

            <div class="hero-content">

                <div class="eyebrow">
                    APPLIED STATISTICS · RESEARCH ${lab.number}
                </div>

                <h1>
                    ${escapeHTML(lab.title)}
                </h1>

                <p>
                    ${escapeHTML(lab.description)}
                </p>

                <div class="hero-meta">

                    <span>
                        <b>${metrics[0]?.value || "—"}</b>
                        Observations
                    </span>

                    <span>
                        <b>${lab.variables.length}</b>
                        Random variables
                    </span>

                    <span>
                        <b>${lab.hypotheses.length}</b>
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

    `;
}


// ==========================================
// 7. DATASET
// ==========================================

function renderDataset(lab) {

    const data = lab.dataset;

    return `

        <section class="section" id="dataset">

            ${sectionHeader(
                "01 / DATA PROFILE",
                "Dataset exploration",
                "Описание и первичная проверка исходных данных."
            )}

            <div class="grid two-col">

                <div class="card">

                    <h3>${escapeHTML(data.name)}</h3>

                    <p class="muted">
                        ${escapeHTML(data.description)}
                    </p>

                    <div class="divider"></div>

                    <p>
                        <strong>Source:</strong>
                        ${escapeHTML(data.source)}
                    </p>

                    ${data.url ? `
                        <a href="${escapeHTML(data.url)}"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="text-link">
                            Open source ↗
                        </a>
                    ` : ""}

                </div>

                <div class="card">

                    <h3>Dataset composition</h3>

                    ${data.groups.length
                        ? data.groups.map(group => `
                            <div class="composition-item">

                                <div class="composition-label">
                                    <span>${escapeHTML(group.label)}</span>
                                    <strong>${group.value.toLocaleString("ru-RU")}</strong>
                                </div>

                                <div class="progress">
                                    <div class="progress-fill"
                                         style="width:${group.value /
                                             data.groups.reduce(
                                                 (sum, x) => sum + x.value, 0
                                             ) * 100}%">
                                    </div>
                                </div>

                            </div>
                        `).join("")
                        : emptyState("Группы данных пока не добавлены.")
                    }

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
// 11. HYPOTHESES
// ==========================================

function renderHypotheses(lab) {

    return `

        <section class="section" id="hypotheses">

            ${sectionHeader(
                "03 / STATISTICAL INFERENCE",
                "Гипотезы и зависимости",
                "Результаты статистических проверок."
            )}

            ${lab.hypotheses.length
                ? lab.hypotheses.map(h => `

                    <div class="card hypothesis">

                        <span class="tag">
                            ${escapeHTML(h.method)}
                        </span>

                        <h3>${escapeHTML(h.title)}</h3>

                        <div class="formula">
                            ${escapeHTML(h.statement)}
                        </div>

                        <div class="hypothesis-result">
                            ${escapeHTML(h.result)}
                        </div>

                        <p>${escapeHTML(h.detail)}</p>

                        <small class="muted">
                            p-value: ${escapeHTML(h.pValue)}
                        </small>

                    </div>

                `).join("")
                : emptyState("Гипотезы пока не добавлены.")
            }

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

    if (!quality?.chart?.values?.length) {
        return `
            <section class="section" id="sampling">
                ${sectionHeader(
                    "04 / SAMPLING",
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
                "04 / INTERACTIVE EXPERIMENT",
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

        </section>
    `;
}


// ==========================================
// 13. METHODS
// ==========================================

function renderMethods(lab) {

    return `

        <section class="section" id="methods">

            ${sectionHeader(
                "05 / METHODOLOGY",
                "Методы исследования",
                "Использованные математические и статистические методы."
            )}

            <div class="grid three-col">

                ${lab.methods.length
                    ? lab.methods.map(method => `

                        <div class="card">

                            <span class="tag">METHOD</span>

                            <h3>${escapeHTML(method.title)}</h3>

                            <p class="muted">
                                ${escapeHTML(method.description)}
                            </p>

                        </div>

                    `).join("")
                    : emptyState("Методы пока не добавлены.")
                }

            </div>

        </section>

    `;
}


// ==========================================
// 14. GENERATOR
// ==========================================

function renderGenerator(lab) {

    return `

        <section class="section" id="generator">

            <div class="future">

                <span class="tag">
                    SPRINT 02 / ${escapeHTML(lab.generator.status)}
                </span>

                <h2>Random Number Generator</h2>

                <p>
                    ${escapeHTML(lab.generator.description)}
                </p>

            </div>

        </section>

    `;
}


// ==========================================
// 15. CONCLUSIONS
// ==========================================

function renderConclusions(lab) {

    return `

        <section class="section" id="conclusions">

            ${sectionHeader(
                "07 / RESULTS",
                "Итоги исследования",
                "Основные результаты и интерпретация."
            )}

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
                "08 / SOURCES",
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

    const sizeInput = document.getElementById("sampleSizeInput");
    const repeatInput = document.getElementById("repeatInput");

    const sizeOutput = document.getElementById("sampleSizeOutput");
    const repeatOutput = document.getElementById("repeatOutput");

    const runButton = document.getElementById("runSampling");

    if (!sizeInput || !repeatInput || !runButton) {
        return;
    }

    // Обновляем числовые значения рядом с ползунками
    sizeInput.addEventListener("input", () => {
        sizeOutput.textContent = sizeInput.value;
    });

    repeatInput.addEventListener("input", () => {
        repeatOutput.textContent = repeatInput.value;
    });

    // Запускаем эксперимент
    runButton.addEventListener("click", runSamplingExperiment);

}


// ==========================================
// 19. SAMPLING CHART
// ==========================================

function renderSamplingChart(sampling) {

    const chart = document.getElementById("samplingChart");

    if (!chart) return;

    const points = sampling.points;

    const series = [
        { key: "wr", color: "#945165", label: "With replacement" },
        { key: "wor", color: "#c2a46c", label: "Without replacement" },
        { key: "seWor", color: "#788c7d", label: "Theoretical SE · WOR" }
    ];

    const width = 680;
    const height = 260;

    const left = 50;
    const right = 25;
    const top = 20;
    const bottom = 45;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const maxValue = Math.max(
        ...points.flatMap(p => series.map(s => p[s.key]))
    ) * 1.15;

    let svg = "";

    // Сетка
    for (let i = 0; i <= 4; i++) {

        const value = maxValue * i / 4;
        const y = top + plotHeight - value / maxValue * plotHeight;

        svg += `
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
                ${value.toFixed(2)}
            </text>
        `;
    }

    // Линии графика
    series.forEach(item => {

        const coordinates = points.map((point, index) => {

            const x = left +
                index * plotWidth / (points.length - 1);

            const y = top + plotHeight -
                point[item.key] / maxValue * plotHeight;

            return { x, y, n: point.n };

        });

        const path = coordinates.map(
            p => `${p.x},${p.y}`
        ).join(" ");

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
                />
            `;

        });

    });

    // Подписи размеров выборок
    points.forEach((point, index) => {

        const x = left +
            index * plotWidth / (points.length - 1);

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

    chart.innerHTML = `

        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="Sampling convergence chart"
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
// 20. SCROLL OBSERVER
// ==========================================

function observeSections() {

    if (!("IntersectionObserver" in window)) return;

    const links = [
        ...document.querySelectorAll(".nav-link")
    ];

    const sections = links
        .map(link =>
            document.getElementById(
                link.getAttribute("href").slice(1)
            )
        )
        .filter(Boolean);

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                links.forEach(link => {

                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") ===
                        `#${entry.target.id}`
                    );

                });

            });

        },
        {
            root: document.querySelector(".main"),
            rootMargin: "-20% 0px -70% 0px"
        }
    );

    sections.forEach(section => observer.observe(section));

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
                meanOfMeans
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
// HISTOGRAM OF SAMPLE MEANS
// ==========================================

function drawSamplingHistogram(
    values,
    populationMean,
    simulationMean
) {

    const binCount = 22;

    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
        min -= 0.05;
        max += 0.05;
    }

    const padding = (max - min) * 0.08;

    min -= padding;
    max += padding;

    const bins = Array(binCount).fill(0);

    values.forEach(value => {

        const index = Math.min(
            binCount - 1,
            Math.floor(
                (value - min) / (max - min) * binCount
            )
        );

        bins[index]++;

    });

    const maxFrequency = Math.max(...bins) || 1;

    const width = 740;
    const height = 310;

    const left = 58;
    const right = 20;
    const top = 25;
    const bottom = 55;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const barStep = plotWidth / binCount;

    let elements = "";

    // Горизонтальная сетка
    for (let i = 0; i <= 4; i++) {

        const value = maxFrequency * i / 4;

        const y = top + plotHeight -
            value / maxFrequency * plotHeight;

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

    // Столбцы гистограммы
    bins.forEach((frequency, index) => {

        const barHeight =
            frequency / maxFrequency * plotHeight;

        const x = left + index * barStep;

        const y = top + plotHeight - barHeight;

        const barWidth = barStep - 2;

        elements += `

            <rect
                x="${x + 1}"
                y="${y}"
                width="${barWidth}"
                height="${barHeight}"
                rx="3"
                class="chart-bar"
            >
                <title>
                    ${frequency} observations
                </title>
            </rect>

        `;

    });

    // Координата среднего на графике
    function calculateX(value) {

        return left +
            (value - min) / (max - min) * plotWidth;

    }

    const populationX = calculateX(populationMean);
    const simulationX = calculateX(simulationMean);

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

        <text
            x="${left}"
            y="${height - 18}"
            class="chart-label"
        >
            ${min.toFixed(3)}
        </text>

        <text
            x="${width - right}"
            y="${height - 18}"
            text-anchor="end"
            class="chart-label"
        >
            ${max.toFixed(3)}
        </text>

        <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${width - right}"
            y2="${top + plotHeight}"
            class="axis-line"
        />

    `;

    return `

        <svg
            viewBox="0 0 ${width} ${height}"
            class="chart"
            role="img"
            aria-label="Histogram of simulated sample means"
        >
            ${elements}
        </svg>

        <div class="chart-legend">

            <span>
                <i style="background:#945165"></i>
                Sample means
            </span>

            <span>
                <i style="background:#788C7D"></i>
                Population mean
            </span>

            <span>
                <i style="background:#B89A62"></i>
                Simulated mean
            </span>

        </div>

    `;

}

// ==========================================
// START APPLICATION
// ==========================================

init();