/* ==========================================================
   CAMPUS WORD 2007 SIMULATOR
   CORE BASE v1 (NO COMPLEXITY)
   ========================================================== */

const CampusWord2007Simulateur = {};

/* ==========================================================
   STATE (GLOBAL MEMORY)
   ========================================================== */

CampusWord2007Simulateur.State = {

    documentReady: false,

    currentPageIndex: 0,

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

CampusWord2007Simulateur.Document = {

    pages: [],

    createPage(){

        return {
            id: Date.now() + Math.random(),
            blocks: []
        };
    },

    init(){

        this.pages = [];
        this.pages.push(this.createPage());
    },

    addPage(){

        const page = this.createPage();
        this.pages.push(page);

        return page;
    },

    getPage(index){

        return this.pages[index] || null;
    }
};

/* ==========================================================
   CARET ENGINE (LOGIC ONLY)
   ========================================================== */

CampusWord2007Simulateur.CaretEngine = {

    moveTo(page, block, offset){

        CampusWord2007Simulateur.State.caret = {
            page,
            block,
            offset
        };
    },

    get(){

        return CampusWord2007Simulateur.State.caret;
    },

    nextChar(){

        CampusWord2007Simulateur.State.caret.offset++;
    },

    nextPage(){

        CampusWord2007Simulateur.State.caret.page++;
        CampusWord2007Simulateur.State.caret.block = 0;
        CampusWord2007Simulateur.State.caret.offset = 0;
    }
};

/* ==========================================================
   SELECTION ENGINE (SIMPLE RANGE)
   ========================================================== */

CampusWord2007Simulateur.SelectionEngine = {

    start(position){

        CampusWord2007Simulateur.State.selection.active = true;
        CampusWord2007Simulateur.State.selection.start = position;
        CampusWord2007Simulateur.State.selection.end = position;
    },

    update(position){

        if(!CampusWord2007Simulateur.State.selection.active) return;

        CampusWord2007Simulateur.State.selection.end = position;
    },

    clear(){

        CampusWord2007Simulateur.State.selection.active = false;
        CampusWord2007Simulateur.State.selection.start = null;
        CampusWord2007Simulateur.State.selection.end = null;
    },

    get(){

        return CampusWord2007Simulateur.State.selection;
    }
};

/* ==========================================================
   INPUT ENGINE (KEYBOARD BASIC)
   ========================================================== */

CampusWord2007Simulateur.InputEngine = {

    init(){

        document.addEventListener("keydown", (e) => {

            this.handleKey(e);
        });
    },

    handleKey(e){

        // STOP browser scroll behavior
        e.preventDefault();

        const key = e.key;

        if(key.length === 1){

            this.insertText(key);
        }

        if(key === "Backspace"){

            this.deleteText();
        }

        if(key === "Enter"){

            this.newLine();
        }
    },

    insertText(char){

        // BASE LOGIC ONLY (no DOM yet)
        const caret = CampusWord2007Simulateur.State.caret;

        console.log("Insert:", char, caret);
    },

    deleteText(){

        console.log("Delete at:", CampusWord2007Simulateur.State.caret);
    },

    newLine(){

        console.log("New Line at:", CampusWord2007Simulateur.State.caret);

        CampusWord2007Simulateur.CaretEngine.nextPage();
    }
};

/* ==========================================================
   RENDER ENGINE (PLACEHOLDER ONLY)
   ========================================================== */

CampusWord2007Simulateur.RenderEngine = {

    render(){

        const doc = CampusWord2007Simulateur.Document;

        console.log("Rendering pages:", doc.pages.length);
    }
};

/* ==========================================================
   CORE INITIALIZER
   ========================================================== */

CampusWord2007Simulateur.Core = {

    init(){

        CampusWord2007Simulateur.Document.init();

        CampusWord2007Simulateur.InputEngine.init();

        CampusWord2007Simulateur.State.documentReady = true;

        CampusWord2007Simulateur.RenderEngine.render();

        console.log("Campus Word CORE v1 READY");
    }
};

/* ==========================================================
   START SYSTEM
   ========================================================== */

window.addEventListener("load", () => {

    CampusWord2007Simulateur.Core.init();
});