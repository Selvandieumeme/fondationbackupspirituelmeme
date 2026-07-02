




/* =========================================================
   CAMPUS WORD 2007 SIMULATE
   ENGINE CORE FIXED v1.0.1
   (PageEngine + CaretEngine STABLE BOOT)
   ========================================================= */

/* ================= PAGE ENGINE ================= */
const PageEngine = {
    pages: [],
    currentPageIndex: 0,
    pageContainer: null,
    isReady: false,

    init() {

        this.pageContainer = document.getElementById("cw-page-container");

        // SAFETY CHECK
        if (!this.pageContainer) {
            console.error("PAGE ENGINE ERROR: container not found");
            return;
        }

        this.createPage();
        this.observeTyping();

        this.isReady = true;

        console.log("PAGE ENGINE READY");
    },

    createPage() {
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
        document.addEventListener("input", () => {
            this.checkOverflow();
        });
    },

    checkOverflow() {
        const page = this.getCurrentPage();
        if (!page) return;

        if (page.scrollHeight > page.clientHeight + 50) {
            this.goToNextPage();
        }
    },

    goToNextPage() {
        const nextIndex = this.currentPageIndex + 1;

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
            statusPage.innerText = "Page: " + (this.currentPageIndex + 1);
        }
    }
};

/* ================= CARET ENGINE ================= */
const CaretEngine = {
    caret: null,
    blinkInterval: null,
    currentPage: null,
    isReady: false,

    init() {

        // WAIT FOR PAGE ENGINE
        if (!PageEngine.isReady) {
            setTimeout(() => this.init(), 100);
            return;
        }

        this.currentPage = PageEngine.getCurrentPage();

        if (!this.currentPage) {
            console.warn("CARET: waiting for page...");
            setTimeout(() => this.init(), 100);
            return;
        }

        this.createCaret();
        this.startBlink();
        this.bindEvents();

        this.isReady = true;

        console.log("CARET ENGINE READY");
    },

    createCaret() {
        this.caret = document.createElement("div");
        this.caret.id = "cw-caret";
        this.caret.style.position = "absolute";
        this.caret.style.width = "2px";
        this.caret.style.height = "18px";
        this.caret.style.background = "black";

        document.body.appendChild(this.caret);

        this.updatePosition();
    },

    startBlink() {
        this.blinkInterval = setInterval(() => {
            this.caret.style.opacity =
                this.caret.style.opacity === "0" ? "1" : "0";
        }, 500);
    },

    bindEvents() {
        document.addEventListener("keydown", () => {
            this.handleTyping();
        });

        document.addEventListener("click", () => {
            this.updatePosition();
        });
    },

    handleTyping() {
        const page = PageEngine.getCurrentPage();
        if (!page) return;

        page.focus();

        setTimeout(() => {
            this.updatePosition();
            PageEngine.checkOverflow();
        }, 0);
    },

    updatePosition() {
        const page = PageEngine.getCurrentPage();
        if (!page) return;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect) {
            this.caret.style.left = rect.left + "px";
            this.caret.style.top = rect.top + "px";
        }
    }
};

/* ================= BOOT SYSTEM (FIXED ORDER) ================= */
window.addEventListener("load", () => {

    // STEP 1: PAGE ENGINE FIRST
    PageEngine.init();

    // STEP 2: CARET ENGINE AFTER SAFE DELAY
    setTimeout(() => {
        CaretEngine.init();
    }, 300);

});














 
        

