

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

        // CREATE FIRST PAGE AUTOMATICALLY
        this.createPage();

        // ACTIVATE MONITORING SYSTEM
        this.observeTyping();

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
        return this.pages[this.currentPageIndex];
    },

    observeTyping() {
        document.addEventListener("input", () => {
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
    PageEngine.init();
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
        this.caret.style.animation = "blink 1s step-end infinite";

        document.body.appendChild(this.caret);

        this.updatePosition();
    },

    startBlink() {
        this.blinkInterval = setInterval(() => {
            if (this.caret.style.opacity === "0") {
                this.caret.style.opacity = "1";
            } else {
                this.caret.style.opacity = "0";
            }
        }, 500);
    },

    bindEvents() {
        document.addEventListener("keydown", (e) => {
            this.handleTyping(e);
        });

        document.addEventListener("click", () => {
            this.updatePosition();
        });
    },

    handleTyping(e) {
        const page = PageEngine.getCurrentPage();
        if (!page) return;

        // allow text typing inside page
        page.focus();

        setTimeout(() => {
            this.updatePosition();
            PageEngine.checkOverflow();
        }, 0);
    },

    updatePosition() {
        const page = PageEngine.getCurrentPage();
        if (!page) return;

        this.currentPage = page;

        const selection = window.getSelection();

        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect) {
            this.caret.style.left = rect.left + "px";
            this.caret.style.top = rect.top + "px";
        }
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






 
        

