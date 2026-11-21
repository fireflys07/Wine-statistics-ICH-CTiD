/* STAT LAB — shared UI components. */
(function initialiseStatLabComponents(global) {
    "use strict";
    const escapeHTML = global.StatLabCore.escapeHTML;

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

    global.StatLabComponents = Object.freeze({ sectionHeader, emptyState });
})(window);
