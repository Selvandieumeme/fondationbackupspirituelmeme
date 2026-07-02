

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











 
        

