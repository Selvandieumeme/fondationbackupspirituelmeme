


/* ==========================================================
   CAMPUS WORD 2007 CORE BOOT v2 (VISIBLE START)
   FILE: campusword2007simulateurs.js
   ========================================================== */

const CampusWord2007Simulateur = {};

/* ==========================================================
   STATE
   ========================================================== */

CampusWord2007Simulateur.State = {
    ready: false,

    caret: {
        page: 0,
        block: 0,
        offset: 0
    }
};

/* ==========================================================
   DOCUMENT MODEL (MULTI PAGE)
   ========================================================== */

CampusWord2007Simulateur.Document = {

    pages: [],

    createPage() {

        const page = {
            id: Date.now() + Math.random(),
            blocks: [
                { type: "paragraph", text: "" }
            ]
        };

        return page;
    },

    init() {
        this.pages = [];
        this.pages.push(this.createPage());
    },

    addPage() {
        const page = this.createPage();
        this.pages.push(page);
        return page;
    }
};

/* ==========================================================
   DOM ENGINE (IMPORTANT: REND FIRST PAGE VISIBLE)
   ========================================================== */

CampusWord2007Simulateur.DOM = {

    app: null,
    pagesContainer: null,

    init() {

        this.app = document.getElementById("campusword2007simulateurs");
        this.pagesContainer = document.getElementById("document-pages-container");

        if (!this.pagesContainer) {
            console.error("Missing #document-pages-container in HTML");
            return;
        }
    },

    renderPages() {

        this.pagesContainer.innerHTML = "";

        CampusWord2007Simulateur.Document.pages.forEach((page, index) => {

            const pageEl = document.createElement("div");
            pageEl.className = "document-page";
            pageEl.dataset.page = index;

            const content = document.createElement("div");
            content.className = "page-content";

            const textLayer = document.createElement("div");
            textLayer.className = "page-text-layer";

            textLayer.textContent = page.blocks.map(b => b.text).join("\n");

            content.appendChild(textLayer);
            pageEl.appendChild(content);

            this.pagesContainer.appendChild(pageEl);
        });
    }
};

/* ==========================================================
   CARET
   ========================================================== */

CampusWord2007Simulateur.Caret = {

    moveForward() {
        CampusWord2007Simulateur.State.caret.offset++;
    },

    newLine() {

        const state = CampusWord2007Simulateur.State;
        const doc = CampusWord2007Simulateur.Document;

        const page = doc.pages[state.caret.page];
        if (!page) return;

        const currentBlock = page.blocks[state.caret.block];

        const remaining = currentBlock.text.slice(state.caret.offset);
        currentBlock.text = currentBlock.text.slice(0, state.caret.offset);

        page.blocks.splice(state.caret.block + 1, 0, {
            type: "paragraph",
            text: remaining
        });

        state.caret.block++;
        state.caret.offset = 0;
    }
};

/* ==========================================================
   INPUT ENGINE
   ========================================================== */

CampusWord2007Simulateur.Input = {

    init() {
        document.addEventListener("keydown", (e) => this.handle(e));
    },

    handle(e) {

        const state = CampusWord2007Simulateur.State;
        const doc = CampusWord2007Simulateur.Document;

        if (e.key.length === 1) {

            e.preventDefault();

            const page = doc.pages[state.caret.page];
            const block = page.blocks[state.caret.block];

            block.text =
                block.text.slice(0, state.caret.offset) +
                e.key +
                block.text.slice(state.caret.offset);

            state.caret.offset++;

            CampusWord2007Simulateur.Render.render();
        }

        if (e.key === "Backspace") {
            e.preventDefault();

            const page = doc.pages[state.caret.page];
            const block = page.blocks[state.caret.block];

            if (state.caret.offset > 0) {

                block.text =
                    block.text.slice(0, state.caret.offset - 1) +
                    block.text.slice(state.caret.offset);

                state.caret.offset--;
            }

            CampusWord2007Simulateur.Render.render();
        }

        if (e.key === "Enter") {
            e.preventDefault();
            CampusWord2007Simulateur.Caret.newLine();
            CampusWord2007Simulateur.Render.render();
        }
    }
};

/* ==========================================================
   RENDER ENGINE
   ========================================================== */

CampusWord2007Simulateur.Render = {

    render() {
        CampusWord2007Simulateur.DOM.renderPages();
    }
};

/* ==========================================================
   CORE BOOT
   ========================================================== */

CampusWord2007Simulateur.Core = {

    init() {

        // 1. INIT DOCUMENT (MULTI PAGE READY)
        CampusWord2007Simulateur.Document.init();

        // 2. INIT DOM
        CampusWord2007Simulateur.DOM.init();

        // 3. RENDER FIRST PAGE IMMEDIATELY
        CampusWord2007Simulateur.DOM.renderPages();

        // 4. INPUT ACTIVE
        CampusWord2007Simulateur.Input.init();

        // 5. READY
        CampusWord2007Simulateur.State.ready = true;

        console.log("WORD STARTED ✔ MULTI PAGE ACTIVE");
    }
};

/* ==========================================================
   BOOT
   ========================================================== */

window.addEventListener("load", () => {
    CampusWord2007Simulateur.Core.init();
});


























