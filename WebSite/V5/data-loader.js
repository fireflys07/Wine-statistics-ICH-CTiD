/*
 * STAT LAB — загрузка и разбор исходных данных.
 */
(function initialiseStatLabData(global) {
    "use strict";

    function detectDelimiter(source) {
        const firstLine = String(source).split(/\r?\n/).find(line => line.trim());
        if (!firstLine) return ",";

        let commas = 0;
        let semicolons = 0;
        let insideQuotes = false;

        for (const character of firstLine) {
            if (character === '"') {
                insideQuotes = !insideQuotes;
            } else if (!insideQuotes && character === ",") {
                commas++;
            } else if (!insideQuotes && character === ";") {
                semicolons++;
            }
        }

        return semicolons > commas ? ";" : ",";
    }

    function parseDelimitedTable(source, delimiter) {
        const table = [];
        let row = [];
        let cell = "";
        let insideQuotes = false;

        for (let index = 0; index < source.length; index++) {
            const character = source[index];

            if (character === '"') {
                if (insideQuotes && source[index + 1] === '"') {
                    cell += '"';
                    index++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (character === delimiter && !insideQuotes) {
                row.push(cell.trim());
                cell = "";
            } else if (character === "\n" && !insideQuotes) {
                row.push(cell.trim());
                if (row.some(value => value !== "")) table.push(row);
                row = [];
                cell = "";
            } else if (character !== "\r") {
                cell += character;
            }
        }

        row.push(cell.trim());
        if (row.some(value => value !== "")) table.push(row);
        return table;
    }

    function parseNumber(value, delimiter) {
        let normalized = String(value).trim().replace(/\s/g, "");
        if (delimiter === ";" && /^-?\d+,\d+$/.test(normalized)) {
            normalized = normalized.replace(",", ".");
        }
        return normalized === "" ? NaN : Number(normalized);
    }

    function parseWineQualityCSV(source) {
        const text = String(source).replace(/^\uFEFF/, "");
        const delimiter = detectDelimiter(text);
        const table = parseDelimitedTable(text, delimiter);

        if (table.length < 2) {
            throw new Error("CSV не содержит строк с наблюдениями.");
        }

        const headers = table[0].map(header => header.trim().toLowerCase().replace(/[\s_\-()]/g, ""));
        const alcoholIndex = headers.indexOf("alcohol");
        const qualityIndex = headers.indexOf("quality");
        const volatileAcidityIndex = headers.indexOf("volatileacidity");

        if (alcoholIndex === -1 || qualityIndex === -1 || volatileAcidityIndex === -1) {
            throw new Error("Не найдены необходимые столбцы: alcohol, quality, volatile acidity.");
        }

        const observations = table.slice(1);
        const rows = observations.reduce((validRows, record) => {
            const alcohol = parseNumber(record[alcoholIndex], delimiter);
            const quality = parseNumber(record[qualityIndex], delimiter);
            const volatileAcidity = parseNumber(record[volatileAcidityIndex], delimiter);

            if (Number.isFinite(alcohol) && alcohol > 0 && Number.isInteger(quality) &&
                Number.isFinite(volatileAcidity) && volatileAcidity >= 0) {
                validRows.push({ alcohol, quality, volatileAcidity });
            }
            return validRows;
        }, []);

        if (rows.length < 2) {
            throw new Error("Не удалось получить достаточное количество корректных наблюдений.");
        }

        return { rows, invalidCount: observations.length - rows.length, delimiter };
    }

    global.StatLabData = Object.freeze({ parseWineQualityCSV });
})(window);