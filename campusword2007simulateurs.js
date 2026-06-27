/* ==========================================================
   CAMPUS WORD 2007 SIMULATOR
   CORE BASE v1
   FILE: campusword2007simulateurs.js
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
   CARET ENGINE
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
   SELECTION ENGINE
   ========================================================== */

CampusWord2007Simulateur.SelectionEngine = {

    start(position){

        const s = CampusWord2007Simulateur.State.selection;

        s.active = true;
        s.start = position;
        s.end = position;
    },

    update(position){

        const s = CampusWord2007Simulateur.State.selection;

        if(!s.active) return;

        s.end = position;
    },

    clear(){

        CampusWord2007Simulateur.State.selection = {
            active: false,
            start: null,
            end: null
        };
    },

    get(){

        return CampusWord2007Simulateur.State.selection;
    }
};

/* ==========================================================
   INPUT ENGINE
   ========================================================== */

CampusWord2007Simulateur.InputEngine = {

    init(){

        document.addEventListener("keydown", (e) => {

            this.handleKey(e);
        });
    },

    handleKey(e){

        e.preventDefault();

        if(e.key.length === 1){

            this.insertText(e.key);
        }

        if(e.key === "Backspace"){

            this.deleteText();
        }

        if(e.key === "Enter"){

            this.newLine();
        }
    },

    insertText(char){

        console.log("INSERT:", char, CampusWord2007Simulateur.State.caret);
    },

    deleteText(){

        console.log("DELETE:", CampusWord2007Simulateur.State.caret);
    },

    newLine(){

        console.log("NEW LINE");

        CampusWord2007Simulateur.CaretEngine.nextPage();
    }
};

/* ==========================================================
   RENDER ENGINE (PLACEHOLDER)
   ========================================================== */

CampusWord2007Simulateur.RenderEngine = {

    render(){

        console.log(
            "RENDER:",
            CampusWord2007Simulateur.Document.pages.length
        );
    }
};

/* ==========================================================
   CORE
   ========================================================== */

CampusWord2007Simulateur.Core = {

    init(){

        CampusWord2007Simulateur.Document.init();

        CampusWord2007Simulateur.InputEngine.init();

        CampusWord2007Simulateur.State.documentReady = true;

        CampusWord2007Simulateur.RenderEngine.render();

        console.log("CAMPUS WORD READY ✔");
    }
};

/* ==========================================================
   BOOT SYSTEM
   ========================================================== */

window.addEventListener("load", () => {

    CampusWord2007Simulateur.Core.init();
});