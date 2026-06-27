/* ==========================================================
   CAMPUS WORD 2007 CORE BASE v1
   FILE: campusword2007.js
   ========================================================== */

const CampusWord2007 = {};

/* ==========================================================
   STATE (GLOBAL ENGINE STATE)
   ========================================================== */

CampusWord2007.State = {
    ready: false,

    caret: {
        page: 0,
        block: 0,
        offset: 0
    },

    selection: {
        active: false,
        start: null,
        end: null
    }
};

/* ==========================================================
   DOCUMENT MODEL (MULTI PAGE FOUNDATION)
   ========================================================== */

CampusWord2007.Document = {

    pages: [],

    createPage() {
        return {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
            blocks: [
                {
                    type: "paragraph",
                    text: ""
                }
            ]
        };
    },

    init() {
        this.pages = [];
        this.pages.push(this.createPage());
    },

    addPage() {
        const page = this.createPage();
        this.pages.push(page);
        return page;
    },

    getPage(index) {
        return this.pages[index] || null;
    }
};

/* ==========================================================
   CARET ENGINE (GLOBAL POSITIONING)
   ========================================================== */

CampusWord2007.CaretEngine = {

    set(page, block, offset) {
        CampusWord2007.State.caret = { page, block, offset };
    },

    get() {
        return CampusWord2007.State.caret;
    },

    moveForward() {
        const c = CampusWord2007.State.caret;
        c.offset++;
    },

    moveToNextBlock() {
        const c = CampusWord2007.State.caret;
        c.block++;
        c.offset = 0;
    },

    moveToNextPage() {
        const c = CampusWord2007.State.caret;
        c.page++;
        c.block = 0;
        c.offset = 0;

        if (!CampusWord2007.Document.getPage(c.page)) {
            CampusWord2007.Document.addPage();
        }
    }
};

/* ==========================================================
   SELECTION ENGINE (GLOBAL RANGE)
   ========================================================== */

CampusWord2007.SelectionEngine = {

    start(pos) {
        const s = CampusWord2007.State.selection;
        s.active = true;
        s.start = structuredClone(pos);
        s.end = structuredClone(pos);
    },

    update(pos) {
        const s = CampusWord2007.State.selection;
        if (!s.active) return;
        s.end = structuredClone(pos);
    },

    clear() {
        CampusWord2007.State.selection = {
            active: false,
            start: null,
            end: null
        };
    },

    get() {
        return CampusWord2007.State.selection;
    }
};

/* ==========================================================
   INPUT ENGINE (KEYBOARD CORE)
   ========================================================== */

CampusWord2007.InputEngine = {

    init() {
        document.addEventListener("keydown", (e) => this.handleKey(e));
    },

    handleKey(e) {

        const key = e.key;

        if (key.length === 1) {
            e.preventDefault();
            this.insertText(key);
            return;
        }

        switch (key) {
            case "Backspace":
                e.preventDefault();
                this.deleteText();
                break;

            case "Enter":
                e.preventDefault();
                this.newLine();
                break;
        }
    },

    insertText(char) {
        const c = CampusWord2007.State.caret;
        const page = CampusWord2007.Document.getPage(c.page);
        if (!page) return;

        const block = page.blocks[c.block];
        if (!block) return;

        block.text =
            block.text.slice(0, c.offset) +
            char +
            block.text.slice(c.offset);

        c.offset++;

        CampusWord2007.RenderEngine.render();
    },

    deleteText() {
        const c = CampusWord2007.State.caret;
        const page = CampusWord2007.Document.getPage(c.page);
        if (!page) return;

        const block = page.blocks[c.block];
        if (!block || c.offset <= 0) return;

        block.text =
            block.text.slice(0, c.offset - 1) +
            block.text.slice(c.offset);

        c.offset--;

        CampusWord2007.RenderEngine.render();
    },

    newLine() {
        const c = CampusWord2007.State.caret;
        const page = CampusWord2007.Document.getPage(c.page);
        if (!page) return;

        const current = page.blocks[c.block];

        const remaining = current.text.slice(c.offset);
        current.text = current.text.slice(0, c.offset);

        page.blocks.splice(c.block + 1, 0, {
            type: "paragraph",
            text: remaining
        });

        CampusWord2007.CaretEngine.moveToNextBlock();
        CampusWord2007.RenderEngine.render();
    }
};

/* ==========================================================
   RENDER ENGINE (MINIMAL FOUNDATION)
   ========================================================== */

CampusWord2007.RenderEngine = {

    render() {
        // foundation only: prepare for DOM binding later
        console.log(
            "RENDER PAGES:",
            CampusWord2007.Document.pages.map(p => p.blocks.map(b => b.text))
        );
    }
};

/* ==========================================================
   CORE BOOTSTRAP
   ========================================================== */

CampusWord2007.Core = {

    init() {

        CampusWord2007.Document.init();
        CampusWord2007.InputEngine.init();

        CampusWord2007.State.ready = true;

        CampusWord2007.RenderEngine.render();

        console.log("WORD CORE READY ✔");
    }
};

/* ==========================================================
   BOOT
   ========================================================== */

window.addEventListener("load", () => {
    CampusWord2007.Core.init();
});


















