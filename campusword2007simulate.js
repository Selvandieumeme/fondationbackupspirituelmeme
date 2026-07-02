

/* =========================================================
   CAMPUS WORD 2007 SIMULATE
   PAGE ENGINE v1.0.0
   ========================================================= */

const PageEngine = {
    pages: [],
    currentPageIndex: 0,
    pageContainer: null,

    init() {

        this.pageContainer = document.getElementById("cw-page-container");

        /* SAFETY CHECK */
        if (!this.pageContainer) {
            console.error("PAGE ENGINE ERROR : #cw-page-container NOT FOUND");
            return;
        }

        /* PREVENT DUPLICATE INITIALIZATION */
        if (this.pages.length > 0) {
            return;
        }

        // CREATE FIRST PAGE AUTOMATICALLY
        this.createPage();

        // ACTIVATE MONITORING SYSTEM
        this.observeTyping();

        console.log("PAGE ENGINE READY");
    },

    createPage() {

        if (!this.pageContainer) return null;

        const page = document.createElement("div");

        page.classList.add("cw-page");
        page.setAttribute("data-role", "page");
        page.setAttribute("contenteditable", "true");
        page.innerHTML = "<br>";

        this.pageContainer.appendChild(page);

        this.pages.push(page);

        this.setCurrentPage(this.pages.length - 1);

        return page;
    },

    setCurrentPage(index) {

        this.currentPageIndex = index;

        this.pages.forEach((p, i) => {
            p.style.display = (i === index) ? "block" : "none";
        });

    },

    getCurrentPage() {
        return this.pages[this.currentPageIndex] || null;
    },

    observeTyping() {

        /* FIX: avoid crash if container missing events */
        if (!this.pageContainer) return;

        this.pageContainer.addEventListener("input", () => {
            this.checkOverflow();
        });

    },

    checkOverflow() {

        const page = this.getCurrentPage();

        if (!page) return;

        // IF CONTENT OVERFLOWS PAGE HEIGHT
        if (page.scrollHeight > page.clientHeight + 50) {
            this.goToNextPage();
        }

    },

    goToNextPage() {

        const nextIndex = this.currentPageIndex + 1;

        // IF PAGE EXISTS
        if (this.pages[nextIndex]) {
            this.setCurrentPage(nextIndex);
        } else {
            this.createPage();
        }

        this.updateStatus();

    },

    updateStatus() {

        const statusPage = document.getElementById("status-page");

        if (statusPage) {
            statusPage.innerText =
                "Page: " + (this.currentPageIndex + 1);
        }

    }

};

/* ================= BOOT ================= */

window.addEventListener("load", () => {

    /* FIX: ensure safe execution timing */
    if (typeof PageEngine !== "undefined") {
        PageEngine.init();
    }

});










/* =========================================================
   CAMPUS WORD 2007 SIMULATE
   CARET ENGINE v1.0.0
   ========================================================= */

const CaretEngine = {
    caret: null,
    blinkInterval: null,
    currentPage: null,

    init() {

        /* SAFETY: ensure PageEngine exists */
        if (typeof PageEngine === "undefined") {
            console.error("CARET ENGINE ERROR: PageEngine not found");
            return;
        }

        this.currentPage = PageEngine.getCurrentPage();

        this.createCaret();
        this.startBlink();
        this.bindEvents();

        console.log("CARET ENGINE READY");
    },

    createCaret() {

        this.caret = document.createElement("div");
        this.caret.id = "cw-caret";

        this.caret.style.position = "absolute";
        this.caret.style.width = "2px";
        this.caret.style.height = "18px";
        this.caret.style.background = "black";

        /* FIX: avoid double blink conflict (CSS already handles animation) */
        this.caret.style.animation = "blink 1s step-end infinite";

        this.caret.style.pointerEvents = "none";
        this.caret.style.zIndex = "9999";

        document.body.appendChild(this.caret);

        this.updatePosition();
    },

    startBlink() {

        /* FIX: prevent duplicate intervals */
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
        }

        this.blinkInterval = setInterval(() => {

            if (!this.caret) return;

            this.caret.style.opacity =
                (this.caret.style.opacity === "0") ? "1" : "0";

        }, 500);
    },

    bindEvents() {

        document.addEventListener("keydown", (e) => {
            this.handleTyping(e);
        });

        document.addEventListener("click", () => {
            this.updatePosition();
        });

        /* FIX: update caret after input changes */
        document.addEventListener("input", () => {
            this.updatePosition();
        });

    },

    handleTyping(e) {

        const page = PageEngine.getCurrentPage();
        if (!page) return;

        page.focus();

        setTimeout(() => {
            this.updatePosition();

            /* SAFETY: check PageEngine exists */
            if (PageEngine && typeof PageEngine.checkOverflow === "function") {
                PageEngine.checkOverflow();
            }

        }, 0);
    },

    updatePosition() {

        const page = PageEngine.getCurrentPage();
        if (!page) return;

        this.currentPage = page;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (!rect) return;

        /* FIX: include scroll offset for correct positioning */
        this.caret.style.left = (rect.left + window.scrollX) + "px";
        this.caret.style.top = (rect.top + window.scrollY) + "px";

    }
};

/* ================= CARET CSS KEYFRAME ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes blink {
    50% { opacity: 0; }
}
`;
document.head.appendChild(style);

/* ================= INIT CARET ================= */
window.addEventListener("load", () => {

    setTimeout(() => {

        CaretEngine.init();

    }, 200);

});
 
        








/* ================= WORD PAGINATION PATCH ================= */

const PagePaginationFix = {

    init() {
        this.bind();
    },

    bind() {
        document.addEventListener("input", () => {
            this.check();
        });
    },

    check() {
        const page = PageEngine.getCurrentPage();
        if (!page) return;

        // detect overflow EXACT like Word behavior
        if (page.scrollHeight > page.clientHeight) {
            this.breakPage();
        }
    },

    breakPage() {
        const current = PageEngine.getCurrentPage();

        if (!current) return;

        // move caret content automatically
        const range = window.getSelection().getRangeAt(0);

        // create next page FIRST
        const nextPage = PageEngine.createPage();

        // move overflow content safely
        const overflowContent = current.innerHTML;

        // split content (simple safe version)
        const cutPoint = overflowContent.length / 2;

        current.innerHTML = overflowContent.substring(0, cutPoint);
        nextPage.innerHTML = overflowContent.substring(cutPoint);

        // focus next page
        PageEngine.setCurrentPage(PageEngine.pages.length - 1);

        setTimeout(() => {
            nextPage.focus();
        }, 0);
    }

};

/* AUTO START PATCH */
window.addEventListener("load", () => {
    setTimeout(() => {
        PagePaginationFix.init();
    }, 300);
});
