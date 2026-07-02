/* ==========================================================
   CAMPUS WORD 2007 SIMULATE
   CORE ENGINE v1.0
   CLEAN FOUNDATION (NO OVERCOMPLEXITY)
========================================================== */

const CampusWord2007 = {};

/* =========================
   GLOBAL STATE
========================= */
CampusWord2007.State = {
    pages: [],
    currentPageIndex: 0,
    caretIndex: 0,
    initialized: false
};

/* =========================
   DOM CACHE
========================= */
CampusWord2007.DOM = {
    container: null,
    caret: null
};

/* =========================
   INIT ENGINE
========================= */
CampusWord2007.init = function () {

    if (this.State.initialized) return;

    this.DOM.container = document.getElementById("documentContainer");
    this.DOM.caret = document.getElementById("globalCaret");

    this.createPage();           // first page
    this.placeCaretAtStart();    // caret visible at start

    this.bindEvents();

    this.State.initialized = true;
};

/* =========================
   CREATE PAGE (MULTI PAGE CORE)
========================= */
CampusWord2007.createPage = function () {

    const page = document.createElement("div");
    page.className = "page";

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;

    content.dataset.pageIndex = this.State.pages.length;

    page.appendChild(content);
    this.DOM.container.appendChild(page);

    this.State.pages.push(content);

    this.setActivePage(this.State.pages.length - 1);

    return content;
};

/* =========================
   SET ACTIVE PAGE
========================= */
CampusWord2007.setActivePage = function (index) {
    this.State.currentPageIndex = index;
};

/* =========================
   GET ACTIVE PAGE
========================= */
CampusWord2007.getActivePage = function () {
    return this.State.pages[this.State.currentPageIndex];
};

/* =========================
   CARET POSITION (BASIC VERSION)
========================= */
CampusWord2007.placeCaretAtStart = function () {

    const page = this.getActivePage();
    page.focus();

    const range = document.createRange();
    const sel = window.getSelection();

    range.setStart(page, 0);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);

    this.updateCaretVisual();
};

/* =========================
   UPDATE CARET VISUAL POSITION
   (SIMPLIFIED ENGINE HOOK)
========================= */
CampusWord2007.updateCaretVisual = function () {

    const sel = window.getSelection();

    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    this.DOM.caret.style.left = rect.left + "px";
    this.DOM.caret.style.top = rect.top + "px";
};

/* =========================
   TEXT INPUT HANDLER
========================= */
CampusWord2007.onInput = function () {

    this.updateCaretVisual();

    this.checkPageOverflow();
};

/* =========================
   PAGE OVERFLOW CHECK (BASIC)
========================= */
CampusWord2007.checkPageOverflow = function () {

    const page = this.getActivePage();

    if (page.scrollHeight > page.clientHeight) {
        this.createPage();
    }
};

/* =========================
   KEYBOARD ENGINE
========================= */
CampusWord2007.bindEvents = function () {

    document.addEventListener("selectionchange", () => {
        this.updateCaretVisual();
    });

    document.addEventListener("input", () => {
        this.onInput();
    });

    document.addEventListener("keydown", (e) => {

        // ENTER → natural flow (handled by contentEditable)

        // BACKSPACE safety hook
        if (e.key === "Backspace") {
            this.updateCaretVisual();
        }

        // manual overflow check fallback
        setTimeout(() => this.checkPageOverflow(), 0);
    });

    window.addEventListener("resize", () => {
        this.updateCaretVisual();
    });
};

/* =========================
   BOOT SYSTEM
========================= */
window.addEventListener("DOMContentLoaded", () => {
    CampusWord2007.init();
});