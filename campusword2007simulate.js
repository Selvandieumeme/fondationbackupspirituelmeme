/* ==========================================================
   CAMPUS WORD 2007 SIMULATE
   ENGINE CORE FOUNDATION (CLEAN START)
   - Initialize system
   - Create first page dynamically
   - Prepare multi-page structure
========================================================== */

const CampusWord = {};

/* =========================
   STATE (SINGLE SOURCE OF TRUTH)
========================= */
CampusWord.State = {
    pages: [],
    currentPage: 0,
    initialized: false
};

/* =========================
   DOM REFERENCES
========================= */
CampusWord.DOM = {
    container: null,
    caret: null
};

/* =========================
   INIT ENGINE (ENTRY POINT)
========================= */
CampusWord.init = function () {

    if (this.State.initialized) return;

    this.DOM.container = document.getElementById("documentContainer");
    this.DOM.caret = document.getElementById("globalCaret");

    this.createPage();        // 🔥 FIRST PAGE AUTO GENERATION
    this.setActivePage(0);

    this.State.initialized = true;

    console.log("CampusWord Engine Initialized");
};

/* =========================
   CREATE PAGE (DYNAMIC)
========================= */
CampusWord.createPage = function () {

    const page = document.createElement("div");
    page.className = "page";

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;

    page.appendChild(content);
    this.DOM.container.appendChild(page);

    this.State.pages.push(content);

    return content;
};

/* =========================
   SET ACTIVE PAGE
========================= */
CampusWord.setActivePage = function (index) {
    this.State.currentPage = index;
};

/* =========================
   GET ACTIVE PAGE
========================= */
CampusWord.getActivePage = function () {
    return this.State.pages[this.State.currentPage];
};

/* =========================
   BOOTSTRAP (AUTO START)
========================= */
window.addEventListener("DOMContentLoaded", () => {
    CampusWord.init();
});