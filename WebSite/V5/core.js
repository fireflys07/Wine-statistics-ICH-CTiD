/* STAT LAB — базовые утилиты приложения. */
(function initialiseStatLabCore(global) {
    "use strict";

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function isFiniteNumber(value) {
        return typeof value === "number" && Number.isFinite(value);
    }

    global.StatLabCore = Object.freeze({ escapeHTML, isFiniteNumber });
})(window);
