.

/* =========================================================
   CAMPUS WORD 2007 — CORE ENGINE (PRODUCTION FOUNDATION)
   SAFE • RESPONSIVE • MULTI-DEVICE • SCALABLE
========================================================= */

const CampusWord2007Simulateur = {

    /* =========================
       STATE CORE
    ========================= */
    state: {
        pages: [],
        activePageIndex: 0,
        zoom: 100,
        wordCount: 0,
        language: "English"
    },


/* =========================
   SAFE INIT ENTRY (MOBILE FIXED)
========================= */
init() {

    document.addEventListener("DOMContentLoaded", () => {

        this.cacheDOM();
        this.bindUI();
        this.createFirstPage();
        this.updateStatus();

        /* =====================================================
           ANDROID / MOBILE CARET FIX (NON-DESTRUCTIVE ADDON)
        ===================================================== */
        const tryFocusEditor = () => {

            const editor = document.querySelector(".cwPageContent");

            if (editor) {

                editor.setAttribute("tabindex", "0");

                /* Force focus on mobile (critical for Android keyboard) */
                setTimeout(() => {
                    editor.focus({ preventScroll: true });
                }, 300);

            }
        };

        /* First focus attempt */
        tryFocusEditor();

        /* Ensure focus when user touches screen */
        document.addEventListener("touchstart", () => {
            tryFocusEditor();
        }, { passive: true });

    });
},








    /* =========================
       SAFE DOM CACHE (NO CRASH)
    ========================= */
    cacheDOM() {

        const get = (id) => document.getElementById(id);

        this.workspace = get("cwDocumentContainer");

        this.statusReady = get("cwStatusReady");
        this.wordCountEl = get("cwWordCountValue");
        this.pageCurrentEl = get("cwCurrentPage");
        this.pageTotalEl = get("cwTotalPages");
        this.zoomValueEl = get("cwZoomValue");

        this.zoomInBtn = get("cwZoomIn");
        this.zoomOutBtn = get("cwZoomOut");

    },


    /* =========================
       UI EVENTS (SAFE BINDING)
    ========================= */
    bindUI() {

        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener("click", () => {
                this.setZoom(this.state.zoom + 10);
            });
        }

        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener("click", () => {
                this.setZoom(this.state.zoom - 10);
            });
        }

        /* OPTIONAL: mobile safe zoom gestures (future-ready hook) */
        this.enableTouchSupport();

    },


    /* =========================
       TOUCH SUPPORT (DEVICE READY)
    ========================= */
    enableTouchSupport() {
        // placeholder for future pinch zoom / swipe
        this.touchEnabled = true;
    },






/* =========================
   CREATE FIRST PAGE (SAFE)
========================= */
createFirstPage() {

    if (!this.workspace) return;

    const page = document.createElement("div");
    page.className = "cwPage active";

    const content = document.createElement("div");
    content.className = "cwPageContent";
    content.contentEditable = true;

    content.addEventListener("input", () => {

        requestAnimationFrame(() => {

            this.calculateWordCount(content.innerText);

            this.checkPageOverflow(content);

        });

    });

    page.appendChild(content);
    this.workspace.appendChild(page);

    this.state.pages.push(page);

    this.updatePageStatus();

},








checkPageOverflow(contentEl) {

    const page = contentEl.parentElement;
    if (!page) return;

    // plis presizyon pase clientHeight (evite bug mobile)
    const PAGE_LIMIT = page.clientHeight - 5;

    // verifye vrè overflow la
    if (contentEl.scrollHeight > PAGE_LIMIT) {

        this.createNewPageAndMoveOverflow(contentEl);
    }
},








createNewPageAndMoveOverflow(contentEl) {

    const currentPage = contentEl.parentElement;
    if (!currentPage) return;

    const currentContent = contentEl;

    // 1. pran dènye liy (text after last line break)
    const text = currentContent.innerText;

    const lines = text.split("\n");

    if (lines.length <= 1) return;

    const lastLine = lines.pop();

    // 2. retire dènye liy la nan paj aktyèl la
    currentContent.innerText = lines.join("\n");

    // 3. kreye nouvo paj
    const newPage = document.createElement("div");
    newPage.className = "cwPage";

    const newContent = document.createElement("div");
    newContent.className = "cwPageContent";
    newContent.contentEditable = true;

    // 4. mete dènye liy lan nan nouvo paj
    newContent.innerText = lastLine;

    // 5. rebind event san chanje non yo
    newContent.addEventListener("input", () => {

        requestAnimationFrame(() => {
            this.calculateWordCount(newContent.innerText);
            this.checkPageOverflow(newContent);
        });

    });

    newPage.appendChild(newContent);
    this.workspace.appendChild(newPage);

    this.state.pages.push(newPage);

    // 6. focus nouvo paj la
    setTimeout(() => {
        newContent.focus();
    }, 0);

    this.updatePageStatus();
},















    /* =========================
       WORD COUNT ENGINE (ROBUST)
    ========================= */
    calculateWordCount(text = "") {

        const clean = text.trim();

        const words = clean.length
            ? clean.split(/\s+/).filter(Boolean).length
            : 0;

        this.state.wordCount = words;

        if (this.wordCountEl) {
            this.wordCountEl.textContent = words;
        }
    },


    /* =========================
       ZOOM ENGINE (DEVICE SAFE)
    ========================= */
    setZoom(value) {

        const zoom = Math.max(50, Math.min(200, value));
        this.state.zoom = zoom;

        if (this.workspace) {


      this.workspace.style.zoom = zoom / 100;
   



            /* IMPORTANT: stable origin for all devices */
            this.workspace.style.transformOrigin = "top center";
        }

        if (this.zoomValueEl) {
            this.zoomValueEl.textContent = zoom + "%";
        }
    },


    /* =========================
       STATUS UPDATE (SAFE UI)
    ========================= */
    updateStatus() {

        if (this.statusReady) {
            this.statusReady.textContent = "Ready";
        }

        if (this.wordCountEl) {
            this.wordCountEl.textContent = "0";
        }
    },


    /* =========================
       PAGE STATUS ENGINE
    ========================= */
    updatePageStatus() {

        if (this.pageCurrentEl) {
            this.pageCurrentEl.textContent = "1";
        }

        if (this.pageTotalEl) {
            this.pageTotalEl.textContent = this.state.pages.length || 1;
        }
    }

};


/* =========================================================
   BOOTSTRAP (SAFE START)
========================================================= */
CampusWord2007Simulateur.init();












/* =========================================================
   WORD 2007 RULER ENGINE — PRO INTERACTIVE VERSION
========================================================= */

const WordRulerEngine = {

    state: {
        zoom: 100,
        leftMargin: 70,
        rightMargin: 70,
        dragging: null
    },

    init() {

        this.top = document.getElementById("cwRulerTop");
        this.left = document.getElementById("cwRulerLeft");
        this.scroll = document.getElementById("cwWorkspaceScroll");

        if (!this.top || !this.left || !this.scroll) return;

        this.render();
        this.bind();
    },

    bind() {

        window.addEventListener("resize", () => this.render());
        window.addEventListener("orientationchange", () => this.render());

        this.createMarginHandles();
    },

    setZoom(z) {
        this.state.zoom = z;
        this.render();
    },

    render() {

        this.top.innerHTML = "";
        this.left.innerHTML = "";

        const step = 20 * (this.state.zoom / 100);

        const width = window.innerWidth;
        const height = window.innerHeight;

        /* ================= TOP RULER ================= */
        for (let x = 0; x < width; x += step) {

            const mark = document.createElement("div");
            mark.className = "cwRulerMark";

            mark.style.position = "absolute";
            mark.style.left = x + "px";
            mark.style.height = "100%";
            mark.style.width = "1px";
            mark.style.background = "#8aa6c7";

            if ((x / step) % 5 === 0) {
                mark.innerHTML = `<span>${Math.round(x / 10)}</span>`;
            }

            this.top.appendChild(mark);
        }

        /* ================= LEFT RULER ================= */
        for (let y = 0; y < height; y += step) {

            const mark = document.createElement("div");
            mark.className = "cwRulerMark";

            mark.style.position = "absolute";
            mark.style.top = y + "px";
            mark.style.width = "100%";
            mark.style.height = "1px";
            mark.style.background = "#8aa6c7";

            this.left.appendChild(mark);
        }

        this.updateMargins();
    },

    createMarginHandles() {

        const doc = document.getElementById("cwDocumentContainer");
        if (!doc) return;

        if (document.getElementById("cwMarginLeft")) return;

        const left = document.createElement("div");
        left.id = "cwMarginLeft";
        left.className = "cwMarginHandle";

        const right = document.createElement("div");
        right.id = "cwMarginRight";
        right.className = "cwMarginHandle";

        doc.appendChild(left);
        doc.appendChild(right);

        this.enableDrag(left, "left");
        this.enableDrag(right, "right");
    },

    enableDrag(el, type) {

        const move = (clientX) => {

            const rect = this.scroll.getBoundingClientRect();

            let x = clientX - rect.left;

            if (type === "left") {
                this.state.leftMargin = Math.max(20, x);
            } else {
                this.state.rightMargin = Math.max(20, rect.width - x);
            }

            this.updateMargins();
        };

        /* TOUCH */
        el.addEventListener("touchstart", (e) => {
            this.state.dragging = type;
        });

        document.addEventListener("touchmove", (e) => {
            if (this.state.dragging === type) {
                move(e.touches[0].clientX);
            }
        });

        document.addEventListener("touchend", () => {
            this.state.dragging = null;
        });

        /* MOUSE */
        el.addEventListener("mousedown", () => {
            this.state.dragging = type;
        });

        document.addEventListener("mousemove", (e) => {
            if (this.state.dragging === type) {
                move(e.clientX);
            }
        });

        document.addEventListener("mouseup", () => {
            this.state.dragging = null;
        });
    },

    updateMargins() {

        const left = document.getElementById("cwMarginLeft");
        const right = document.getElementById("cwMarginRight");

        if (left) left.style.left = this.state.leftMargin + "px";
        if (right) right.style.right = this.state.rightMargin + "px";
    }
};













/* =========================================================
   ANDROID PAGINATION WATCHDOG FIX (SAFE PRODUCTION)
========================================================= */

(function () {

    const workspace = document.getElementById("cwWorkspaceScroll");
    const container = document.getElementById("cwDocumentContainer");

    if (!workspace || !container) return;

    let lastHeight = 0;
    let ticking = false;

    function forceReflow() {

        const h = workspace.clientHeight;
        if (h === lastHeight) return;
        lastHeight = h;

        // 🔥 SAFE reflow trigger (NO layout break)
        container.style.transform = "translateZ(0)";

        requestAnimationFrame(() => {

            // 🔥 only force repaint (NOT display toggle)
            container.offsetHeight;

            // 🔥 SAFE hook only (no crash if missing)
            if (window.CampusWord2007Simulateur &&
                typeof window.CampusWord2007Simulateur.checkPageOverflow === "function") {

                // trigger re-evaluation on current active page
                const active = document.querySelector(".cwPageContent");
                if (active) {
                    window.CampusWord2007Simulateur.checkPageOverflow(active);
                }
            }
        });
    }

    function schedule() {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            ticking = false;
            forceReflow();
        });
    }

    /* =========================
       ANDROID CRITICAL EVENTS
    ========================== */

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    window.visualViewport?.addEventListener("resize", schedule);

    document.addEventListener("focusin", schedule, { passive: true });
    document.addEventListener("touchstart", schedule, { passive: true });

    workspace?.addEventListener("scroll", schedule);

    /* backup watchdog (low frequency safe) */
    setInterval(forceReflow, 1500);

})();
















/* =========================================================
   RIBBON TAB SWITCH ENGINE (WORD 2007 STYLE)
========================================================= */

(function () {

    const tabButtons = document.querySelectorAll(".cwTabBtn");
    const panels = document.querySelectorAll(".cwRibbonPanel");

    function activateTab(target) {

        /* remove active from all buttons */
        tabButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.target === target) {
                btn.classList.add("active");
            }
        });

        /* hide all panels */
        panels.forEach(panel => {
            panel.classList.remove("active");

            /* 🔥 FIX: switched from data-panel → id system */
            if (panel.id === target) {
                panel.classList.add("active");
            }
        });

        /* 🔥 FIX ADD: fallback HOME if target not found */
        const panelExists = document.getElementById(target);
        const btnExists = document.querySelector(`.cwTabBtn[data-target="${target}"]`);

        if (!panelExists  && !btnExists) {
            document.querySelectorAll(".cwTabBtn, .cwRibbonPanel").forEach(el => {
                el.classList.remove("active");
            });

            document.querySelector('.cwTabBtn[data-target="tab-home"]')?.classList.add("active");
            document.getElementById("tab-home")?.classList.add("active");
        }
    }

    /* click binding */
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            activateTab(target);
        });
    });

    /* default open HOME if exists */
    activateTab("tab-home");

})();


















document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("cwOfficeButton");
    const menu = document.getElementById("cwOfficeMenu");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        menu.classList.remove("active");
    });

});





































































































/* =========================================================
   CAMPUS WORD 2007 — GLOBAL TEXT FORMAT COMMAND ENGINE
   PHASE 1: BOLD + ITALIC + UNDERLINE + STRIKE
   SAFE WITH CURRENT EDITOR ARCHITECTURE
========================================================= */

document.addEventListener("click", function(e){



const button = e.target.closest(
    '[data-action="bold"],' +
    '[data-action="italic"],' +
    '[data-action="underline"],' +
    '[data-action="strike"]' 

);
    


    if(!button) return;



    const selection = window.getSelection();


    if(!selection) return;


    if(selection.rangeCount === 0) return;


    if(selection.toString().trim() === "") return;



    const range = selection.getRangeAt(0);



    const action = button.dataset.action;


    const formatMap = {

        "bold": "strong",

        "italic": "em",

        "underline": "u",

        "strike": "s"

    };



    const tagName = formatMap[action];


    if(!tagName) return;



    /*
       VERIFY IF TEXT ALREADY HAS SAME FORMAT
    */

    const parent =
        selection.anchorNode.parentElement;



    if(
        parent &&
        parent.tagName.toLowerCase() === tagName
    ){

        const text = parent.innerHTML;


        parent.outerHTML = text;


        button.classList.remove("active");


        return;

    }



    /*
       APPLY FORMAT
    */


    const wrapper =
        document.createElement(tagName);



    wrapper.appendChild(
        range.extractContents()
    );



    range.insertNode(wrapper);



    /*
       KEEP SELECTION ACTIVE
    */


    selection.removeAllRanges();



    const newRange =
        document.createRange();



    newRange.selectNodeContents(wrapper);



    selection.addRange(newRange);



    /*
       BUTTON ACTIVE STATE
    */


    button.classList.add("active");


});















/* =========================================================
   CAMPUS WORD 2007 — FONT SIZE COMMAND ENGINE
   PHASE 2: GROW FONT + SHRINK FONT
   SAFE WITH CURRENT EDITOR ARCHITECTURE
========================================================= */

document.addEventListener("click", function(e){


    const button = e.target.closest(
        '[data-action="grow-font"],' +
        '[data-action="shrink-font"]'
    );


    if(!button) return;



    const selection = window.getSelection();


    if(!selection) return;


    if(selection.rangeCount === 0) return;


    if(selection.toString().trim() === "") return;



    const range = selection.getRangeAt(0);



    const action = button.dataset.action;



    /*
       SIZE MAP
       DEFAULT START: 11px
    */

    let size = 11;



    const parent =
        selection.anchorNode.parentElement;



    if(parent){

        const current =
            window.getComputedStyle(parent).fontSize;


        if(current){

            size = parseInt(current);

        }

    }



    if(action === "grow-font"){

        size += 2;

    }



    if(action === "shrink-font"){

        size -= 2;

    }



    /*
       LIMIT SAFE SIZE
    */

    size = Math.max(6, Math.min(72, size));



    /*
       APPLY FONT SIZE
    */

    const span =
        document.createElement("span");


    span.style.fontSize = size + "px";



    span.appendChild(
        range.extractContents()
    );



    range.insertNode(span);



    /*
       KEEP SELECTION ACTIVE
    */

    selection.removeAllRanges();



    const newRange =
        document.createRange();



    newRange.selectNodeContents(span);



    selection.addRange(newRange);



});





































/* =========================================================
   CAMPUS WORD 2007 — COLOR + HIGHLIGHT ENGINE
   TRUE ISOLATED MODULE
   SAFE WITH CURRENT EDITOR ARCHITECTURE
========================================================= */

const CampusWordColorHighlight = {


    init(){

        document.addEventListener(
            "click",
            (e)=>{

                this.handleClick(e);

            }
        );

    },



    handleClick(e){


        const colorBtn =
            e.target.closest('[data-action="color"]');


        const highlightBtn =
            e.target.closest('[data-action="highlight"]');


        const dot =
            e.target.closest(".cwColorDot");



        /*
        =====================================
        APPLY COLOR / HIGHLIGHT
        =====================================
        */

        if(dot){


            const parentButton =
                dot.closest(".cwRibbonBtn");


            if(!parentButton) return;



            this.applyFormat(
                parentButton.dataset.action,
                dot.dataset.color
            );


            return;

        }



        /*
        =====================================
        OPEN COLOR DROPDOWN
        =====================================
        */

        if(colorBtn){

            e.preventDefault();


            colorBtn.classList.toggle("open");


            document
            .querySelectorAll(
                '.cwRibbonBtn[data-action="highlight"].open'
            )
            .forEach(el=>{

                el.classList.remove("open");

            });


            return;

        }



        /*
        =====================================
        OPEN HIGHLIGHT DROPDOWN
        =====================================
        */

        if(highlightBtn){

            e.preventDefault();


            highlightBtn.classList.toggle("open");


            document
            .querySelectorAll(
                '.cwRibbonBtn[data-action="color"].open'
            )
            .forEach(el=>{

                el.classList.remove("open");

            });


            return;

        }



        /*
        =====================================
        CLOSE ONLY OWN MENUS
        =====================================
        */

        document
        .querySelectorAll(
            '.cwRibbonBtn[data-action="color"].open,'+
            '.cwRibbonBtn[data-action="highlight"].open'
        )
        .forEach(el=>{

            el.classList.remove("open");

        });


    },





    applyFormat(type,color){



        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0 ||
            selection.toString().trim()===""
        ){

            return;

        }



        const range =
            selection.getRangeAt(0);



        const span =
            document.createElement("span");


/*
=====================================
TEXT COLOR
TRUE TOGGLE COLOR SYSTEM
SAFE WITH CURRENT EDITOR
=====================================
*/

if(type==="color"){


    const colorMap = {

        black:"#000000",
        darkgray:"#333333",
        red:"#ff0000",
        orange:"#ff9900",
        yellow:"#ffff00",
        green:"#008000",
        skyblue:"#00ccff",
        blue:"#0000ff",
        purple:"#9900ff",
        white:"#ffffff"

    };



    const newColor =
        colorMap[color];



    const current =
        selection.anchorNode &&
        selection.anchorNode.parentElement;



    const currentColor =
        current &&
        getComputedStyle(current).color;



    const colorRGB = {

        "#000000":"rgb(0, 0, 0)",
        "#333333":"rgb(51, 51, 51)",
        "#ff0000":"rgb(255, 0, 0)",
        "#ff9900":"rgb(255, 153, 0)",
        "#ffff00":"rgb(255, 255, 0)",
        "#008000":"rgb(0, 128, 0)",
        "#00ccff":"rgb(0, 204, 255)",
        "#0000ff":"rgb(0, 0, 255)",
        "#9900ff":"rgb(153, 0, 255)",
        "#ffffff":"rgb(255, 255, 255)"

    };



    /*
       SAME COLOR = REMOVE COLOR
    */

    if(
        currentColor === colorRGB[newColor]
    ){

        current.style.color = "";

        return;

    }



    /*
       NEW COLOR = APPLY
    */

    span.style.color =
        newColor;


}



        /*
        =====================================
        HIGHLIGHT
        =====================================
        */


        if(type==="highlight"){


            const current =
                selection.anchorNode.parentElement;



            const currentHighlight =
                current &&
                getComputedStyle(current)
                .backgroundColor;



            const highlightMap = {

                yellow:"rgb(255, 255, 0)",
                lightgreen:"rgb(144, 238, 144)",
                orange:"rgb(255, 165, 0)",
                pink:"rgb(255, 192, 203)",
                lightblue:"rgb(173, 216, 230)"

            };



            if(
                currentHighlight === highlightMap[color]
            ){

                current.style.backgroundColor="";

                return;

            }



            if(color!=="none"){

                span.style.backgroundColor =
                    color;

            }


        }




        span.appendChild(
            range.extractContents()
        );


        range.insertNode(span);



        selection.removeAllRanges();



        const newRange =
            document.createRange();



        newRange.selectNodeContents(span);



        selection.addRange(newRange);


    }



};




CampusWordColorHighlight.init();





















/* =========================================================
   CAMPUS WORD — MULTI PAGE SELECTION LOCK ENGINE
   ISOLATED MODULE
   KEEP TEXT SELECTION ACROSS ALL PAGES
   SAFE CARET PROTECTION
   NO LAYOUT / SCROLL INTERFERENCE
========================================================= */

(function(){


    let savedRange = null;

    let caretActivity = false;



    /*
       STORE ACTIVE TEXT SELECTION
    */

    function saveSelection(){


        const selection =
            window.getSelection();


        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return;
        }


        if(
            selection.toString().trim() === ""
        ){
            return;
        }



        const range =
            selection.getRangeAt(0);



        /*
           ONLY SAVE INSIDE DOCUMENT PAGES
        */

        const container =
            range.commonAncestorContainer;



        const page =
            container.nodeType === 3
            ? container.parentElement.closest(".cwPageContent")
            : container.closest(".cwPageContent");



        if(!page)
            return;



        savedRange =
            range.cloneRange();



    }




    /*
       RESTORE SELECTION AFTER SCREEN MOVEMENT
       CARET SAFE PROTECTION
    */

    function restoreSelection(){


        if(
            !savedRange ||
            caretActivity
        ){
            return;
        }



        const selection =
            window.getSelection();



        if(!selection)
            return;



        /*
           NEVER TOUCH PURE CARET STATE
        */

        if(
            selection.toString().trim() === ""
        ){
            return;
        }



        selection.removeAllRanges();


        selection.addRange(
            savedRange
        );


    }




    /*
       CAPTURE ANY PAGE TEXT SELECTION
       PROTECTED AGAINST CARET-ONLY MOVEMENT
    */

    document.addEventListener(
        "selectionchange",
        function(){


            const selection =
                window.getSelection();



            if(
                !selection ||
                selection.rangeCount === 0
            ){
                return;
            }



            /*
               DETECT CARET ONLY MOVEMENT
            */

            if(
                selection.toString().trim() === ""
            ){

                caretActivity = true;


                setTimeout(
                    function(){

                        caretActivity = false;

                    },
                    50
                );


                return;

            }



            saveSelection();



        },
        false
    );



    /*
       KEEP SELECTION DURING TOUCH ACTIONS
    */

    document.addEventListener(
        "touchend",
        function(){

            setTimeout(
                restoreSelection,
                0
            );

        },
        false
    );



    /*
       RESTORE AFTER FOCUS CHANGES
    */

    document.addEventListener(
        "mouseup",
        function(){

            setTimeout(
                restoreSelection,
                0
            );

        },
        false
    );



})();






















/* =========================================================
   CAMPUS WORD — CLIPBOARD + FORMAT PAINTER BRIDGE
   ISOLATED MODULE
   COPY / CUT / PASTE / FORMAT PAINTER
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){


    let painterStyle = null;



    function getCurrentSelection(){

        const selection =
            window.getSelection();


        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }


        return selection;

    }




    function capturePainterStyle(selection){


        const range =
            selection.getRangeAt(0);



        const node =
            range.startContainer.nodeType === 3
            ? range.startContainer.parentElement
            : range.startContainer;



        if(!node)
            return;



        const style =
            window.getComputedStyle(node);



        painterStyle = {

            fontFamily:
                style.fontFamily,

            fontSize:
                style.fontSize,

            fontWeight:
                style.fontWeight,

            fontStyle:
                style.fontStyle,

            color:
                style.color,

            backgroundColor:
                style.backgroundColor

        };


    }




    function applyPainterStyle(selection){


        if(
            !painterStyle
        ){
            return;
        }



        const range =
            selection.getRangeAt(0);



        const span =
            document.createElement(
                "span"
            );



        Object.assign(
            span.style,
            painterStyle
        );



        span.appendChild(
            range.extractContents()
        );



        range.insertNode(
            span
        );


        painterStyle = null;


    }





    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );


            if(!button)
                return;



            const action =
                button.dataset.action;




            /*
               FORMAT PAINTER
            */

            if(
                action === "format-painter"
            ){


                const selection =
                    getCurrentSelection();



                if(selection){

                    capturePainterStyle(
                        selection
                    );

                }


                return;

            }




            if(
                action !== "copy" &&
                action !== "cut" &&
                action !== "paste"
            ){
                return;
            }




            const selection =
                getCurrentSelection();





            if(
                action === "copy"
            ){


                if(
                    !selection ||
                    selection.toString().trim() === ""
                ){
                    return;
                }



                navigator.clipboard.writeText(
                    selection.toString()
                );


                return;

            }





            if(
                action === "cut"
            ){


                if(
                    !selection ||
                    selection.toString().trim() === ""
                ){
                    return;
                }



                document.execCommand(
                    "cut"
                );


                return;

            }





            if(
                action === "paste"
            ){


                navigator.clipboard.readText()
                .then(
                    function(text){


                        if(
                            !text
                        ){
                            return;
                        }



                        document.execCommand(
                            "insertText",
                            false,
                            text
                        );


                    }
                )
                .catch(
                    function(){

                        /*
                           Browser permission blocked
                           Keep editor stable
                        */

                    }
                );


            }



        },
        false
    );






    /*
       APPLY FORMAT PAINTER
       AFTER TARGET TEXT SELECTION
    */

    document.addEventListener(
        "mouseup",
        function(){


            if(
                !painterStyle
            ){
                return;
            }



            const selection =
                getCurrentSelection();



            if(selection){

                applyPainterStyle(
                    selection
                );

            }


        },
        false
    );



})();

























/* =========================================================
   CAMPUS WORD — BASIC HISTORY ENGINE
   ISOLATED MODULE
   CUSTOM UNDO / REDO
   NO EXECOMMAND
   NO CARET / LAYOUT INTERFERENCE
========================================================= */

(function(){


    const undoStack = [];
    const redoStack = [];

    let recording = true;



    function getActiveEditor(){

        return document.querySelector(
            ".cwPageContent:focus"
        );

    }




    function saveState(){

        if(!recording)
            return;


        const pages =
            Array.from(
                document.querySelectorAll(
                    ".cwPageContent"
                )
            );


        const snapshot =
            pages.map(
                page => page.innerHTML
            );


        undoStack.push(
            snapshot
        );


        redoStack.length = 0;


    }




    function restoreState(snapshot){


        const pages =
            Array.from(
                document.querySelectorAll(
                    ".cwPageContent"
                )
            );


        recording = false;


        pages.forEach(
            (page,index)=>{

                if(snapshot[index] !== undefined){

                    page.innerHTML =
                        snapshot[index];

                }

            }
        );


        recording = true;


    }






    document.addEventListener(
        "input",
        function(e){


            if(
                e.target.classList.contains(
                    "cwPageContent"
                )
            ){

                saveState();

            }


        },
        false
    );








    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );


            if(!button)
                return;


            const action =
                button.dataset.action;



            if(
                action === "undo"
            ){

                if(
                    undoStack.length
                ){

                    const current =
                        Array.from(
                            document.querySelectorAll(".cwPageContent")
                        )
                        .map(
                            p=>p.innerHTML
                        );


                    redoStack.push(
                        current
                    );


                    const previous =
                        undoStack.pop();


                    restoreState(
                        previous
                    );

                }


            }





            if(
                action === "redo"
            ){

                if(
                    redoStack.length
                ){


                    const current =
                        Array.from(
                            document.querySelectorAll(".cwPageContent")
                        )
                        .map(
                            p=>p.innerHTML
                        );


                    undoStack.push(
                        current
                    );


                    const next =
                        redoStack.pop();


                    restoreState(
                        next
                    );

                }


            }



        },
        false
    );



})();





























/* =========================================================
   CAMPUS WORD — PARAGRAPH ALIGNMENT BRIDGE
   ISOLATED MODULE
   LEFT / CENTER / RIGHT / JUSTIFY
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function getCurrentParagraph(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }



        let node =
            selection
            .getRangeAt(0)
            .startContainer;



        if(
            node.nodeType === 3
        ){
            node =
                node.parentElement;
        }




        return node.closest(
            ".cwPageContent"
        )
        ?
        node
        :
        null;


    }






    function applyAlignment(value){


        const element =
            getCurrentParagraph();



        if(
            !element
        ){
            return;
        }



        element.style.textAlign =
            value;


    }







    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            const action =
                button.dataset.action;



            if(
                action === "align-left"
            ){

                applyAlignment(
                    "left"
                );


                return;

            }




            if(
                action === "align-center"
            ){

                applyAlignment(
                    "center"
                );


                return;

            }





            if(
                action === "align-right"
            ){

                applyAlignment(
                    "right"
                );


                return;

            }





            if(
                action === "justify"
            ){

                applyAlignment(
                    "justify"
                );


                return;

            }



        },
        false
    );



})();
















/* =========================================================
   CAMPUS WORD — PARAGRAPH LIST & INDENT BRIDGE
   ISOLATED MODULE
   BULLETS / NUMBERING / INDENT
   CARET POSITION SAFE
   NO LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function getActiveBlock(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }



        let node =
            selection
            .getRangeAt(0)
            .startContainer;



        if(
            node.nodeType === 3
        ){
            node =
                node.parentElement;
        }



        const page =
            node.closest(
                ".cwPageContent"
            );



        if(
            !page
        ){
            return null;
        }



        return node;



    }





function applyList(type){


    const block =
        getActiveBlock();



    if(
        !block
    ){
        return;
    }



    const currentList =
        block.querySelector(
            "ul, ol"
        );



    /*
       REMOVE SAME LIST TYPE
    */

    if(
        currentList &&
        currentList.tagName.toLowerCase() === type
    ){


        const text =
            currentList.innerText;



        block.innerHTML =
            text;



        return;

    }




    const text =
        block.innerText.trim();



    if(
        !text
    ){
        return;
    }





    /*
       CHANGE EXISTING LIST TYPE
    */

    if(
        currentList
    ){


        const newList =
            document.createElement(
                type
            );


        const item =
            document.createElement(
                "li"
            );


        item.textContent =
            text;


        newList.appendChild(
            item
        );


        block.innerHTML =
            "";


        block.appendChild(
            newList
        );


        return;

    }






    /*
       CREATE NEW LIST
    */

    const list =
        document.createElement(
            type
        );



    const item =
        document.createElement(
            "li"
        );



    item.textContent =
        text;



    list.appendChild(
        item
    );



    block.innerHTML =
        "";



    block.appendChild(
        list
    );


}





    function changeIndent(amount){


        const block =
            getActiveBlock();



        if(
            !block
        ){
            return;
        }



        const current =
            parseInt(
                window
                .getComputedStyle(block)
                .paddingLeft
            ) || 0;



        const next =
            Math.max(
                0,
                current + amount
            );



        block.style.paddingLeft =
            next + "px";



    }









    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            const action =
                button.dataset.action;






            if(
                action === "bullet"
            ){


                applyList(
                    "ul"
                );


                return;

            }







            if(
                action === "numbering"
            ){


                applyList(
                    "ol"
                );


                return;

            }







            if(
                action === "indent-increase"
            ){


                changeIndent(
                    40
                );


                return;

            }







            if(
                action === "indent-decrease"
            ){


                changeIndent(
                    -40
                );


                return;

            }




        },
        false
    );



})();















































/* =========================================================
   CAMPUS WORD — STYLE COMMAND BRIDGE
   ISOLATED MODULE
   NORMAL / H1 / H2 / TITLE / SUBTITLE
   CARET POSITION BASED
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function getActiveBlock(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }



        let node =
            selection
            .getRangeAt(0)
            .startContainer;



        if(
            node.nodeType === 3
        ){
            node =
                node.parentElement;
        }



        const page =
            node.closest(
                ".cwPageContent"
            );



        if(
            !page
        ){
            return null;
        }



        return node;



    }








    function applyStyle(style){


        const block =
            getActiveBlock();



        if(
            !block
        ){
            return;
        }




        block.classList.remove(
            "cwStyleNormal",
            "cwStyleH1",
            "cwStyleH2",
            "cwStyleTitle",
            "cwStyleSubtitle"
        );




        block.classList.add(
            style
        );



    }








    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            const action =
                button.dataset.action;




            if(
                action === "style-normal"
            ){

                applyStyle(
                    "cwStyleNormal"
                );


                return;

            }





            if(
                action === "style-h1"
            ){

                applyStyle(
                    "cwStyleH1"
                );


                return;

            }





            if(
                action === "style-h2"
            ){

                applyStyle(
                    "cwStyleH2"
                );


                return;

            }





            if(
                action === "style-title"
            ){

                applyStyle(
                    "cwStyleTitle"
                );


                return;

            }





            if(
                action === "style-subtitle"
            ){

                applyStyle(
                    "cwStyleSubtitle"
                );


                return;

            }




        },
        false
    );



})();















/* =========================================================
   CAMPUS WORD — SCRIPT FORMAT BRIDGE
   ISOLATED MODULE
   SUPERSCRIPT / SUBSCRIPT
   TEXT SELECTION BASED
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function getSelectionRange(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }



        if(
            selection.toString().trim() === ""
        ){
            return null;
        }



        return selection.getRangeAt(0);



    }







    function applyScript(type){


        const range =
            getSelectionRange();



        if(
            !range
        ){
            return;
        }



        const tag =
            type === "superscript"
            ? "sup"
            : "sub";



        const wrapper =
            document.createElement(
                tag
            );



        wrapper.appendChild(
            range.extractContents()
        );



        range.insertNode(
            wrapper
        );



        const selection =
            window.getSelection();



        selection.removeAllRanges();



    }








    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            const action =
                button.dataset.action;





            if(
                action === "superscript"
            ){

                applyScript(
                    "superscript"
                );


                return;

            }






            if(
                action === "subscript"
            ){

                applyScript(
                    "subscript"
                );


                return;

            }




        },
        false
    );



})();












/* =========================================================
   CAMPUS WORD — SELECT ALL BRIDGE
   ISOLATED MODULE
   SELECT ALL DOCUMENT TEXT
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function selectAllText(){


        const pages =
            document.querySelectorAll(
                ".cwPageContent"
            );



        if(
            !pages.length
        ){
            return;
        }



        const selection =
            window.getSelection();



        const range =
            document.createRange();



        range.setStart(
            pages[0],
            0
        );



        range.setEnd(
            pages[pages.length - 1],
            pages[pages.length - 1].childNodes.length
        );



        selection.removeAllRanges();



        selection.addRange(
            range
        );



    }






    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            if(
                button.dataset.action === "select-all"
            ){

                selectAllText();

            }



        },
        false
    );



})();

















/* =========================================================
   CAMPUS WORD — SELECT COMMAND BRIDGE
   ISOLATED MODULE
   SELECT CURRENT PARAGRAPH
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function getCurrentParagraph(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return null;
        }



        let node =
            selection
            .getRangeAt(0)
            .startContainer;



        if(
            node.nodeType === 3
        ){
            node =
                node.parentElement;
        }



        return node.closest(
            "p, h1, h2, div"
        );



    }







    function selectParagraph(){


        const paragraph =
            getCurrentParagraph();



        if(
            !paragraph
        ){
            return;
        }



        const range =
            document.createRange();



        range.selectNodeContents(
            paragraph
        );



        const selection =
            window.getSelection();



        selection.removeAllRanges();



        selection.addRange(
            range
        );



    }








    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            if(
                button.dataset.action === "select"
            ){

                selectParagraph();

            }



        },
        false
    );



})();























/* =========================================================
   CAMPUS WORD — FIND COMMAND BRIDGE
   ISOLATED MODULE
   SEARCH TEXT IN DOCUMENT PAGES
   NO TEXT MODIFICATION
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function findText(){


        const search =
            prompt(
                "Find:"
            );



        if(
            !search ||
            search.trim() === ""
        ){
            return;
        }



        const pages =
            document.querySelectorAll(
                ".cwPageContent"
            );



        if(
            !pages.length
        ){
            return;
        }



        const text =
            search.trim();



        const walker =
            document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );



        let node;



        while(
            node = walker.nextNode()
        ){



            const index =
                node.textContent.indexOf(
                    text
                );



            if(
                index !== -1
            ){


                const range =
                    document.createRange();



                range.setStart(
                    node,
                    index
                );



                range.setEnd(
                    node,
                    index + text.length
                );



                const selection =
                    window.getSelection();



                selection.removeAllRanges();



                selection.addRange(
                    range
                );



                return;

            }



        }



    }







    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            if(
                button.dataset.action === "find"
            ){

                findText();

            }



        },
        false
    );



})();













/* =========================================================
   CAMPUS WORD — REPLACE COMMAND BRIDGE
   ISOLATED MODULE
   FIND AND REPLACE FIRST MATCH
   NO CARET / LAYOUT / PAGE INTERFERENCE
========================================================= */

(function(){



    function replaceText(){


        const find =
            prompt(
                "Find:"
            );



        if(
            !find ||
            find.trim() === ""
        ){
            return;
        }



        const replace =
            prompt(
                "Replace with:"
            );



        if(
            replace === null
        ){
            return;
        }



        const walker =
            document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );



        let node;



        while(
            node = walker.nextNode()
        ){



            const index =
                node.textContent.indexOf(
                    find
                );



            if(
                index !== -1
            ){



                const range =
                    document.createRange();



                range.setStart(
                    node,
                    index
                );



                range.setEnd(
                    node,
                    index + find.length
                );



                range.deleteContents();



                range.insertNode(
                    document.createTextNode(
                        replace
                    )
                );



                return;

            }



        }



    }








    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !button
            ){
                return;
            }



            if(
                button.dataset.action === "replace"
            ){

                replaceText();

            }



        },
        false
    );



})();













/* =========================================================
   CAMPUS WORD — SELECT OBJECTS MODE BRIDGE
   ISOLATED MODULE
   OBJECT SELECTION MODE
   NO TEXT / CARET / LAYOUT INTERFERENCE
========================================================= */

(function(){


    let objectMode = false;



    function enableObjectSelection(){


        objectMode = true;


        document.body.classList.add(
            "cwObjectSelectionMode"
        );


    }




    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    "[data-action]"
                );


            if(
                !button
            ){
                return;
            }



            if(
                button.dataset.action === "select-objects"
            ){

                enableObjectSelection();

            }



        },
        false
    );



})();
;






















/* =========================================================
   CAMPUS WORD — FONT FAMILY / SIZE DROPDOWN ENGINE
   ISOLATED
   DYNAMIC MENU + TEXT APPLY
========================================================= */

(function(){


    const families = [
        "Calibri",
        "Arial",
        "Times New Roman",
        "Verdana",
        "Georgia",
        "Tahoma",
        "Trebuchet MS",
        "Segoe UI",
        "Helvetica",
        "Cambria",
        "Garamond",
        "Book Antiqua",
        "Palatino Linotype",
        "Lucida Sans Unicode",
        "Century Gothic",
        "Consolas",
        "Courier New",
        "Impact",
        "Roboto"
    ];



    const sizes = [
        "8",
        "9",
        "10",
        "11",
        "12",
        "14",
        "16",
        "18",
        "20",
        "24",
        "28",
        "36",
        "48",
        "72"
    ];




    let activeMenu = null;


    let savedFontRange = null;






    function saveFontSelection(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return;
        }



        if(
            selection.toString().trim() === ""
        ){
            return;
        }



        savedFontRange =
            selection
            .getRangeAt(0)
            .cloneRange();


    }








    function restoreFontSelection(){


        if(
            !savedFontRange
        ){
            return false;
        }



        const selection =
            window.getSelection();



        selection.removeAllRanges();



        selection.addRange(
            savedFontRange
        );



        return true;


    }








    function applyFont(property,value){


        if(
            !restoreFontSelection()
        ){
            return;
        }



        const selection =
            window.getSelection();



        const range =
            selection.getRangeAt(0);



        const span =
            document.createElement(
                "span"
            );



        span.style[property] =
            value;



        span.appendChild(
            range.extractContents()
        );



        range.insertNode(
            span
        );



    }








    function closeMenu(){

        if(activeMenu){

            activeMenu.remove();

            activeMenu = null;

        }

    }








    function openMenu(button, list){


        closeMenu();



        const menu =
            document.createElement("div");



        menu.className =
            "cwFontPopup";




        if(
            button.dataset.action === "font-family"
        ){

            menu.dataset.type =
                "family";

        }




        if(
            button.dataset.action === "font-size"
        ){

            menu.dataset.type =
                "size";

        }






        list.forEach(function(item){


            const option =
                document.createElement("button");



            option.type =
                "button";



            option.className =
                "cwFontPopupItem";



            option.textContent =
                item;



            option.onclick =
                function(e){


                    e.stopPropagation();



                    if(
                        menu.dataset.type === "family"
                    ){

                        applyFont(
                            "fontFamily",
                            item
                        );

                    }



                    if(
                        menu.dataset.type === "size"
                    ){

                        applyFont(
                            "fontSize",
                            item + "px"
                        );

                    }



                    closeMenu();


                };



            menu.appendChild(
                option
            );


        });





        document.body.appendChild(
            menu
        );



        const box =
            button.getBoundingClientRect();



        menu.style.position =
            "fixed";


        menu.style.top =
            box.bottom + "px";


        menu.style.left =
            box.left + "px";


        menu.style.zIndex =
            "999999";



        activeMenu =
            menu;


    }








    document.addEventListener(
        "click",
        function(e){


            const fontButton =
                e.target.closest(
                    '[data-action="font-family"]'
                );



            const sizeButton =
                e.target.closest(
                    '[data-action="font-size"]'
                );





            if(fontButton){


                e.stopPropagation();



                saveFontSelection();



                openMenu(
                    fontButton,
                    families
                );



                return;

            }






            if(sizeButton){


                e.stopPropagation();



                saveFontSelection();



                openMenu(
                    sizeButton,
                    sizes
                );



                return;

            }






            if(
                activeMenu &&
                !activeMenu.contains(e.target)
            ){

                closeMenu();

            }



        },
        false
    );



})();


























/* =========================================================
   CAMPUS WORD — INSERT BLANK DOCUMENT BRIDGE
   WORD 2007 STYLE
   NEW BLANK DOCUMENT
   NO CURRENT DOCUMENT INTERFERENCE
========================================================= */

(function(){


    function createBlankDocument(){


        window.location.href =
            "https://fondationbackupspirituel.com/campusword2007simulation";


    }






    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    '[data-action="insert-blank"]'
                );



            if(
                !button
            ){
                return;
            }



            createBlankDocument();



        },
        false
    );



})();









































/* =========================================================
   CAMPUS WORD — EXCEL SPREADSHEET FRAME ENGINE
   STEP 1
   GRID + HEADERS + SCROLLBARS + SHEETS
   ISOLATED MODULE
========================================================= */

(function(){



    function createExcelFrame(){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return;
        }



        const excel =
            document.createElement(
                "div"
            );



        excel.className =
            "cwExcelFrame";



        excel.style.width =
            "600px";



        excel.style.height =
            "350px";



        excel.style.border =
            "1px solid #888";



        excel.style.display =
            "flex";



        excel.style.flexDirection =
            "column";



        excel.style.background =
            "#fff";



        excel.style.overflow =
            "hidden";




        const scrollArea =
            document.createElement(
                "div"
            );



        scrollArea.style.flex =
            "1";



        scrollArea.style.overflow =
            "auto";



        const table =
            document.createElement(
                "table"
            );



        table.style.borderCollapse =
            "collapse";



        const letters =
            [
                "A",
                "B",
                "C",
                "D",
                "E"
            ];




        const head =
            document.createElement(
                "tr"
            );



        const corner =
            document.createElement(
                "th"
            );



        corner.style.width =
            "35px";



        head.appendChild(
            corner
        );



        letters.forEach(
            function(letter){


                const th =
                    document.createElement(
                        "th"
                    );


                th.textContent =
                    letter;


                th.style.border =
                    "1px solid #bbb";


                th.style.width =
                    "90px";


                th.style.height =
                    "25px";


                head.appendChild(
                    th
                );


            }
        );



        table.appendChild(
            head
        );





        for(
            let r = 1;
            r <= 10;
            r++
        ){


            const row =
                document.createElement(
                    "tr"
                );



            const number =
                document.createElement(
                    "th"
                );


            number.textContent =
                r;


            number.style.border =
                "1px solid #bbb";


            row.appendChild(
                number
            );



            letters.forEach(
                function(){


                    const cell =
                        document.createElement(
                            "td"
                        );


                    cell.style.border =
                        "1px solid #bbb";


                    cell.style.width =
                        "90px";


                    cell.style.height =
                        "25px";


                    cell.innerHTML =
                        "&nbsp;";


                    row.appendChild(
                        cell
                    );


                }
            );



            table.appendChild(
                row
            );


        }




        scrollArea.appendChild(
            table
        );



        excel.appendChild(
            scrollArea
        );





        const sheets =
            document.createElement(
                "div"
            );



        sheets.style.height =
            "30px";



        sheets.style.borderTop =
            "1px solid #aaa";



        sheets.innerHTML = `

            <button>Sheet1</button>
            <button>Sheet2</button>
            <button>Sheet3</button>

        `;



        excel.appendChild(
            sheets
        );





        const range =
            selection.getRangeAt(0);



        range.insertNode(
            excel
        );


    }








    document.addEventListener(
        "click",
        function(e){


            const button =
                e.target.closest(
                    '[data-action="excel-spreadsheet"]'
                );



            if(
                !button
            ){
                return;
            }



            createExcelFrame();



        },
        false
    );



})();









/* =========================================================
   CAMPUS WORD — EXCEL FRAME RESIZE ENGINE
   STEP 3
   RESIZE / AGRANDISMAN
   ISOLATED MODULE
========================================================= */

(function(){



    function enableExcelResize(){


        const frames =
            document.querySelectorAll(
                ".cwExcelFrame"
            );



        frames.forEach(
            function(frame){



                if(
                    frame.dataset.resizeReady
                ){
                    return;
                }



                frame.dataset.resizeReady =
                    "true";



                frame.style.position =
                    "relative";



                const handle =
                    document.createElement(
                        "div"
                    );



                handle.className =
                    "cwExcelResizeHandle";



                handle.style.position =
                    "absolute";



                handle.style.right =
                    "0";



                handle.style.bottom =
                    "0";



                handle.style.width =
                    "15px";



                handle.style.height =
                    "15px";



                handle.style.cursor =
                    "nwse-resize";



                handle.style.background =
                    "#777";



                frame.appendChild(
                    handle
                );



                let startX = 0;
                let startY = 0;
                let startWidth = 0;
                let startHeight = 0;



                function startResize(e){


                    e.preventDefault();



                    const point =
                        e.touches
                        ? e.touches[0]
                        : e;



                    startX =
                        point.clientX;


                    startY =
                        point.clientY;


                    startWidth =
                        frame.offsetWidth;


                    startHeight =
                        frame.offsetHeight;



                    document.addEventListener(
                        "mousemove",
                        resize
                    );


                    document.addEventListener(
                        "mouseup",
                        stopResize
                    );


                    document.addEventListener(
                        "touchmove",
                        resize,
                        {
                            passive:false
                        }
                    );


                    document.addEventListener(
                        "touchend",
                        stopResize
                    );


                }






                function resize(e){


                    e.preventDefault();



                    const point =
                        e.touches
                        ? e.touches[0]
                        : e;



                    const newWidth =
                        startWidth +
                        (
                            point.clientX -
                            startX
                        );



                    const newHeight =
                        startHeight +
                        (
                            point.clientY -
                            startY
                        );



                    frame.style.width =
                        Math.max(
                            300,
                            newWidth
                        )
                        + "px";



                    frame.style.height =
                        Math.max(
                            200,
                            newHeight
                        )
                        + "px";


                }






                function stopResize(){


                    document.removeEventListener(
                        "mousemove",
                        resize
                    );


                    document.removeEventListener(
                        "mouseup",
                        stopResize
                    );


                    document.removeEventListener(
                        "touchmove",
                        resize
                    );


                    document.removeEventListener(
                        "touchend",
                        stopResize
                    );


                }





                handle.addEventListener(
                    "mousedown",
                    startResize
                );



                handle.addEventListener(
                    "touchstart",
                    startResize,
                    {
                        passive:false
                    }
                );



            }
        );


    }








    document.addEventListener(
        "click",
        function(){


            setTimeout(
                enableExcelResize,
                50
            );


        }
    );



})();























/* =========================================================
   CAMPUS WORD — TABLE DROPDOWN MENU ENGINE
   STEP 1
   OPEN / CLOSE TABLE MENU
   FULLY ISOLATED
   NO HOME BUTTON INTERFERENCE
========================================================= */

(function(){


    let activeTableMenu = null;



    function closeTableMenu(){


        if(activeTableMenu){

            activeTableMenu.style.display =
                "none";


            activeTableMenu = null;

        }

    }






    document.addEventListener(
        "click",
        function(e){



            const tableGroup =
                e.target.closest(
                    '[data-action^="table-"], .cwRibbonGroup'
                );



            const tableButton =
                e.target.closest(
                    ".cwDropdownBtn"
                );



            /*
              VERIFY ONLY TABLE DROPDOWN
            */
            if(
                tableButton &&
                tableButton.querySelector(
                    '[data-action^="table-"]'
                )
            ){


                e.stopPropagation();



                const menu =
                    tableButton.querySelector(
                        ".cwDropdownMenu"
                    );



                if(!menu){

                    return;

                }




                if(
                    activeTableMenu &&
                    activeTableMenu !== menu
                ){

                    closeTableMenu();

                }





                const isOpen =
                    menu.style.display === "block";



                if(isOpen){


                    closeTableMenu();


                }else{


                    menu.style.display =
                        "block";


                    menu.style.position =
                        "absolute";


                    menu.style.zIndex =
                        "999999";



                    activeTableMenu =
                        menu;


                }



                return;

            }







            /*
              CLOSE ONLY TABLE MENU
              DO NOT TOUCH OTHER DROPDOWNS
            */
            if(
                activeTableMenu &&
                !activeTableMenu.contains(e.target)
            ){

                closeTableMenu();

            }



        },
        false
    );



})();















/* =========================================================
   CAMPUS WORD — TABLE SIZE INSERT ENGINE
   ISOLATED MODULE
   1x1 TO 15x15 TABLE CREATOR
   NO LAYOUT / CARET ENGINE INTERFERENCE
========================================================= */

(function(){



    function insertTable(rows, cols){


        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){
            return;
        }




        const table =
            document.createElement(
                "table"
            );


table.classList.add(
    "cwWordTable"
);



        table.style.borderCollapse =
            "collapse";



        table.style.margin =
            "10px 0";





        for(
            let r = 0;
            r < rows;
            r++
        ){


            const tr =
                document.createElement(
                    "tr"
                );



            for(
                let c = 0;
                c < cols;
                c++
            ){


                const td =
                    document.createElement(
                        "td"
                    );



                td.contentEditable =
                    true;



                td.innerHTML =
                    "&nbsp;";



                td.style.border =
                    "1px solid #999";



                td.style.minWidth =
                    "70px";



                td.style.height =
                    "25px";



                tr.appendChild(
                    td
                );


            }



            table.appendChild(
                tr
            );


        }






        const range =
            selection.getRangeAt(0);



        range.deleteContents();



        range.insertNode(
            table
        );



        selection.removeAllRanges();



        const cursor =
            document.createRange();



        cursor.setStartAfter(
            table
        );



        cursor.collapse(
            true
        );



        selection.addRange(
            cursor
        );


    }








    document.addEventListener(
        "click",
        function(e){



            const item =
                e.target.closest(
                    "[data-action]"
                );



            if(
                !item
            ){
                return;
            }



            const action =
                item.dataset.action;



            if(
                !action.startsWith(
                    "table-"
                )
            ){
                return;
            }



            if(
                action === "table-custom"
            ){
                return;
            }




            const size =
                action
                .replace(
                    "table-",
                    ""
                )
                .split(
                    "x"
                );



            if(
                size.length !== 2
            ){
                return;
            }



            const rows =
                parseInt(
                    size[0]
                );



            const cols =
                parseInt(
                    size[1]
                );



            if(
                rows &&
                cols
            ){

                insertTable(
                    rows,
                    cols
                );


            }



        },
        false
    );



})();
















/* =========================================================
   CAMPUS WORD — TABLE BORDER SELECTION ENGINE
   STEP 1
   TOUCH / MOUSE BORDER DETECTION
   ROW / COLUMN ACTIVE MARK
   ISOLATED MODULE
   NO HOME / CARET INTERFERENCE
========================================================= */

(function(){



    let activeTarget = null;





    function clearActive(){


        document
        .querySelectorAll(
            ".cwTableActiveRow, .cwTableActiveColumn"
        )
        .forEach(
            function(el){

                el.classList.remove(
                    "cwTableActiveRow",
                    "cwTableActiveColumn"
                );

            }
        );


        activeTarget = null;

    }








    function activateRow(row){


        clearActive();


        row.classList.add(
            "cwTableActiveRow"
        );


        activeTarget = {
            type:"row",
            element:row
        };


    }







    function activateColumn(table, index){


        clearActive();


        const rows =
            table.rows;



        for(
            let r = 0;
            r < rows.length;
            r++
        ){

            const cell =
                rows[r].cells[index];


            if(cell){

                cell.classList.add(
                    "cwTableActiveColumn"
                );

            }

        }



        activeTarget = {
            type:"column",
            index:index,
            table:table
        };


    }









    function detectBorder(cell, event){


        const rect =
            cell.getBoundingClientRect();



        const point =
            event.touches
            ? event.touches[0]
            : event;



        const x =
            point.clientX -
            rect.left;



        const y =
            point.clientY -
            rect.top;



        const borderSize =
            10;



        const row =
            cell.parentElement;



        const table =
            cell.closest(
                ".cwWordTable"
            );



        if(!table){
            return;
        }





        /*
          DETECT HORIZONTAL BORDER
        */

        if(
            y < borderSize ||
            y > rect.height - borderSize
        ){

            activateRow(row);

            return;

        }





        /*
          DETECT VERTICAL BORDER
        */

        if(
            x < borderSize
        ){

            const index =
                cell.cellIndex;


            activateColumn(
                table,
                index
            );


        }




    }









    document.addEventListener(
        "mousedown",
        function(e){


            const cell =
                e.target.closest(
                    ".cwWordTable td"
                );


            if(!cell){
                return;
            }


            detectBorder(
                cell,
                e
            );


        },
        false
    );









    document.addEventListener(
        "touchstart",
        function(e){


            const cell =
                e.target.closest(
                    ".cwWordTable td"
                );


            if(!cell){
                return;
            }



            detectBorder(
                cell,
                e
            );


        },
        {
            passive:true
        }
    );



})();












/* =========================================================
   CAMPUS WORD — TABLE DELETE ENGINE
   STEP 2
   BACKSPACE DELETE ACTIVE ROW / COLUMN
   ISOLATED MODULE
   NO HOME / CARET INTERFERENCE
========================================================= */

(function(){



    let activeDeleteTarget = null;





    document.addEventListener(
        "click",
        function(e){


            const row =
                e.target.closest(
                    ".cwTableActiveRow"
                );



            if(row){

                activeDeleteTarget = {
                    type:"row",
                    element:row
                };

                return;

            }






            const column =
                e.target.closest(
                    ".cwTableActiveColumn"
                );



            if(column){

                activeDeleteTarget = {
                    type:"column",
                    element:column
                };

            }



        },
        false
    );









    document.addEventListener(
        "keydown",
        function(e){



            if(
                e.key !== "Backspace"
            ){

                return;

            }





            if(
                !activeDeleteTarget
            ){

                return;

            }





            e.preventDefault();








            /*
              DELETE ACTIVE ROW
            */

            if(
                activeDeleteTarget.type === "row"
            ){



                const row =
                    activeDeleteTarget.element;



                if(row){

                    row.remove();

                }



            }









            /*
              DELETE ACTIVE COLUMN
            */

            if(
                activeDeleteTarget.type === "column"
            ){



                const cell =
                    activeDeleteTarget.element;



                const table =
                    cell.closest(
                        ".cwWordTable"
                    );



                if(table){



                    const index =
                        cell.cellIndex;



                    Array.from(
                        table.rows
                    )
                    .forEach(
                        function(row){



                            if(
                                row.cells[index]
                            ){

                                row.cells[index].remove();

                            }



                        }
                    );


                }



            }








            activeDeleteTarget =
                null;




        },
        false
    );



})();




















/* =========================================================
   CAMPUS WORD — TABLE BORDER MERGE ENGINE
   STEP 3
   TOUCH / MOUSE BORDER MERGE
   ROW + COLUMN MERGE
   ISOLATED MODULE
   NO HOME / CARET / RIBBON INTERFERENCE
========================================================= */

(function(){


    let activeBorder = null;




    function clearBorder(){


        document
        .querySelectorAll(
            ".cwTableBorderActive"
        )
        .forEach(
            function(el){

                el.classList.remove(
                    "cwTableBorderActive"
                );

            }
        );


        activeBorder = null;

    }







    function detectBorder(cell,event){


        const table =
            cell.closest(
                ".cwWordTable"
            );


        if(!table){
            return;
        }



        const rect =
            cell.getBoundingClientRect();



        const point =
            event.touches
            ? event.touches[0]
            : event;



        const x =
            point.clientX -
            rect.left;


        const y =
            point.clientY -
            rect.top;



        const size = 12;





        /*
          VERTICAL BORDER
        */
        if(
            x > rect.width - size
        ){


            clearBorder();



            cell.classList.add(
                "cwTableBorderActive"
            );



            activeBorder = {

                type:"column",

                table:table,

                index:
                    cell.cellIndex

            };


            return;

        }







        /*
          HORIZONTAL BORDER
        */
        if(
            y > rect.height - size
        ){


            clearBorder();



            cell.classList.add(
                "cwTableBorderActive"
            );



            activeBorder = {

                type:"row",

                table:table,

                index:
                    cell.parentElement.rowIndex

            };


        }


    }








    document.addEventListener(
        "touchstart",
        function(e){


            const cell =
                e.target.closest(
                    ".cwWordTable td"
                );


            if(cell){

                detectBorder(
                    cell,
                    e
                );

            }


        },
        {
            passive:true
        }
    );







    document.addEventListener(
        "mousedown",
        function(e){


            const cell =
                e.target.closest(
                    ".cwWordTable td"
                );


            if(cell){

                detectBorder(
                    cell,
                    e
                );

            }


        },
        false
    );









    document.addEventListener(
        "keydown",
        function(e){



            if(
                e.key !== "Backspace"
            ){

                return;

            }



            if(
                !activeBorder
            ){

                return;

            }



            e.preventDefault();





            const table =
                activeBorder.table;








            /*
              MERGE COLUMN
            */
            if(
                activeBorder.type === "column"
            ){



                const col =
                    activeBorder.index;



                Array.from(
                    table.rows
                )
                .forEach(
                    function(row){



                        const left =
                            row.cells[col];



                        const right =
                            row.cells[col + 1];



                        if(
                            left &&
                            right
                        ){


                            left.innerHTML +=
                                " " +
                                right.innerHTML;



                            right.remove();


                        }


                    }
                );


            }









            /*
              MERGE ROW
            */
            if(
                activeBorder.type === "row"
            ){



                const row =
                    activeBorder.index;



                const current =
                    table.rows[row];


                const next =
                    table.rows[row + 1];



                if(
                    current &&
                    next
                ){



                    Array.from(
                        next.cells
                    )
                    .forEach(
                        function(cell,i){


                            if(
                                current.cells[i]
                            ){

                                current.cells[i]
                                .innerHTML +=
                                " " +
                                cell.innerHTML;


                            }


                        }
                    );



                    next.remove();


                }


            }






            clearBorder();



        },
        false
    );



})();
;
















/* =========================================================
   CAMPUS WORD — TABLE DRAG POSITION ENGINE
   ISOLATED MODULE
   MOVE TABLE INSIDE PAGE
   TOUCH + MOUSE SUPPORT
   NO CARET / RIBBON INTERFERENCE
========================================================= */

(function(){


    let dragTable = null;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;





    function startDrag(e, table){


        const page =
            table.closest(
                ".cwPageContent"
            );


        if(!page){
            return;
        }



        dragTable = table;



        const point =
            e.touches
            ? e.touches[0]
            : e;



        startX =
            point.clientX;



        startY =
            point.clientY;





        const rect =
            table.getBoundingClientRect();



        const pageRect =
            page.getBoundingClientRect();



        startLeft =
            rect.left - pageRect.left;



        startTop =
            rect.top - pageRect.top;





        table.classList.add(
            "cwTableDragging"
        );



        table.style.position =
            "absolute";



        table.style.left =
            startLeft + "px";



        table.style.top =
            startTop + "px";



        table.style.zIndex =
            "9999";



    }









    function moveDrag(e){


        if(!dragTable){
            return;
        }



        const page =
            dragTable.closest(
                ".cwPageContent"
            );


        if(!page){
            return;
        }



        const point =
            e.touches
            ? e.touches[0]
            : e;



        const dx =
            point.clientX - startX;



        const dy =
            point.clientY - startY;



        let newLeft =
            startLeft + dx;



        let newTop =
            startTop + dy;





        /*
          KEEP TABLE INSIDE PAGE
        */

        const maxLeft =
            page.clientWidth -
            dragTable.offsetWidth;



        const maxTop =
            page.clientHeight -
            dragTable.offsetHeight;



        newLeft =
            Math.max(
                0,
                Math.min(
                    newLeft,
                    maxLeft
                )
            );



        newTop =
            Math.max(
                0,
                Math.min(
                    newTop,
                    maxTop
                )
            );




        dragTable.style.left =
            newLeft + "px";



        dragTable.style.top =
            newTop + "px";



    }








    function stopDrag(){


        if(dragTable){


            dragTable.classList.remove(
                "cwTableDragging"
            );


        }



        dragTable = null;


    }









    document.addEventListener(
        "mousedown",
        function(e){



            const table =
                e.target.closest(
                    ".cwWordTable"
                );



            if(table){

                startDrag(
                    e,
                    table
                );

            }


        },
        false
    );







    document.addEventListener(
        "touchstart",
        function(e){



            const table =
                e.target.closest(
                    ".cwWordTable"
                );



            if(table){

                startDrag(
                    e,
                    table
                );

            }



        },
        {
            passive:true
        }
    );







    document.addEventListener(
        "mousemove",
        moveDrag,
        false
    );



    document.addEventListener(
        "touchmove",
        moveDrag,
        {
            passive:false
        }
    );







    document.addEventListener(
        "mouseup",
        stopDrag,
        false
    );



    document.addEventListener(
        "touchend",
        stopDrag,
        false
    );



})();


















/* =========================================================
   CAMPUS WORD — TABLE ERASER TOOL ENGINE
   STEP 1
   ACTIVATE / DEACTIVATE ERASER MODE
   ISOLATED MODULE
   NO TABLE INSERT INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){


    let eraserActive = false;



    function toggleEraser(button){


        eraserActive =
            !eraserActive;



        if(eraserActive){


            button.classList.add(
                "cwEraserActive"
            );


            document.body.classList.add(
                "cwTableEraserMode"
            );


        }else{


            button.classList.remove(
                "cwEraserActive"
            );


            document.body.classList.remove(
                "cwTableEraserMode"
            );


        }


    }






    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    '[data-action="table-eraser"]'
                );



            if(!button){
                return;
            }



            e.preventDefault();



            e.stopPropagation();



            toggleEraser(
                button
            );



        },
        false
    );





    window.CampusWordTableEraser = {


        isActive:function(){

            return eraserActive;

        },


        disable:function(){


            eraserActive = false;


            document.body.classList.remove(
                "cwTableEraserMode"
            );


            const btn =
                document.querySelector(
                    '[data-action="table-eraser"]'
                );


            if(btn){

                btn.classList.remove(
                    "cwEraserActive"
                );

            }


        }


    };



})();




















/* =========================================================
   TABLE BORDER ERASE ACTION
========================================================= */


function removeBorder(cell, side){


    if(!cell){
        return;
    }



    if(side === "right"){

        cell.style.borderRight =
            "none";

    }



    if(side === "left"){

        cell.style.borderLeft =
            "none";

    }



    if(side === "top"){

        cell.style.borderTop =
            "none";

    }



    if(side === "bottom"){

        cell.style.borderBottom =
            "none";

    }


}







function detectBorder(cell, event){


    const rect =
        cell.getBoundingClientRect();



    const point =
        event.touches
        ? event.touches[0]
        : event;



    const x =
        point.clientX - rect.left;



    const y =
        point.clientY - rect.top;



    const size = 10;



    /*
       VERTICAL BORDER
    */

    if(x < size){

        removeBorder(
            cell,
            "left"
        );

        return;

    }



    if(x > rect.width - size){

        removeBorder(
            cell,
            "right"
        );

        return;

    }



    /*
       HORIZONTAL BORDER
    */

    if(y < size){

        removeBorder(
            cell,
            "top"
        );

        return;

    }



    if(y > rect.height - size){

        removeBorder(
            cell,
            "bottom"
        );

        return;

    }


}









document.addEventListener(
    "pointerdown",
    function(e){



        if(
            !window.CampusWordTableEraser ||
            !window.CampusWordTableEraser.isActive()
        ){

            return;

        }




        const cell =
            e.target.closest(
                ".cwWordTable td"
            );



        if(!cell){

            return;

        }



        e.preventDefault();



        detectBorder(
            cell,
            e
        );



    },
    false
);











/* =========================================================
   CAMPUS WORD — TABLE COLUMN RESIZE ENGINE
   FINAL STABLE VERSION
   TOUCH + MOUSE
   VISUAL RED DASHED GUIDE
   COLUMN RESIZE
   ISOLATED MODULE
   NO TABLE BORDER MODIFICATION
   NO CARET / NO RIBBON INTERFERENCE
========================================================= */

(function(){


let resizeTarget = null;

let resizing = false;

let startX = 0;

let startWidth = 0;

let guideLine = null;



const ZONE = 14;





function point(e){

    return e.touches
        ? e.touches[0]
        : e;

}








function createGuide(){


    if(guideLine){

        return;

    }



    guideLine =
        document.createElement(
            "div"
        );



    guideLine.style.position =
        "fixed";

    guideLine.style.width =
        "2px";

    guideLine.style.background =
        "repeating-linear-gradient(to bottom, red 0px, red 6px, transparent 6px, transparent 12px)";

    guideLine.style.zIndex =
        "9999999";

    guideLine.style.pointerEvents =
        "none";

    guideLine.style.display =
        "none";



    document.body.appendChild(
        guideLine
    );


}








function showGuide(cell){


    createGuide();



    const rect =
        cell.getBoundingClientRect();



    guideLine.style.left =
        rect.right + "px";



    guideLine.style.top =
        rect.top + "px";



    guideLine.style.height =
        rect.height + "px";



    guideLine.style.display =
        "block";


}








function moveGuide(x){


    if(guideLine){

        guideLine.style.left =
            x + "px";

    }

}








function hideGuide(){


    if(guideLine){

        guideLine.style.display =
            "none";

    }


}









function findResizeCell(e){


    const p =
        point(e);



    const elements =
        document.elementsFromPoint(
            p.clientX,
            p.clientY
        );



    const cell =
        elements.find(
            function(el){

                return el.matches &&
                el.matches(
                    ".cwWordTable td"
                );

            }
        );



    if(!cell){

        return null;

    }




    const rect =
        cell.getBoundingClientRect();



    const x =
        p.clientX -
        rect.left;



    if(
        x > rect.width - ZONE
        ||
        x < ZONE
    ){

        return cell;

    }



    return null;


}









document.addEventListener(
    "pointermove",
    function(e){



        if(resizing){

            moveGuide(
                point(e).clientX
            );

            return;

        }




        const cell =
            findResizeCell(e);




        if(cell){


            showGuide(
                cell
            );


            document.body.style.cursor =
                "col-resize";


        }else{


            hideGuide();


            document.body.style.cursor =
                "";


        }


    },
    false
);









document.addEventListener(
    "pointerdown",
    function(e){



        const cell =
            findResizeCell(e);



        if(!cell){

            return;

        }




        e.preventDefault();



        resizing = true;



        resizeTarget =
            cell;



        startX =
            point(e).clientX;



        startWidth =
            cell.offsetWidth;



        showGuide(
            cell
        );



    },
    false
);









document.addEventListener(
    "pointermove",
    function(e){



        if(
            !resizing ||
            !resizeTarget
        ){

            return;

        }



        const diff =
            point(e).clientX -
            startX;



        const width =
            startWidth +
            diff;



        if(width > 30){


            resizeTarget.style.width =
                width + "px";


        }


    },
    false
);









document.addEventListener(
    "pointerup",
    function(){



        resizing = false;



        resizeTarget = null;



        hideGuide();



        document.body.style.cursor =
            "";



    },
    false
);



})();





































/* =========================================================
   CAMPUS WORD — CUSTOM TABLE CREATOR ENGINE
   FINAL FIXED VERSION
   DYNAMIC ROW / COLUMN VALUES
   RANGE PRESERVATION
   ISOLATED MODULE
========================================================= */

(function(){


let customTableRange = null;





function createCustomTable(rows, cols){


    const selection =
        window.getSelection();



    if(
        !selection ||
        selection.rangeCount === 0
    ){

        return;

    }





    const table =
        document.createElement(
            "table"
        );



    table.classList.add(
        "cwWordTable"
    );



    table.style.borderCollapse =
        "collapse";



    table.style.margin =
        "10px 0";







    for(
        let r = 0;
        r < rows;
        r++
    ){



        const tr =
            document.createElement(
                "tr"
            );



        for(
            let c = 0;
            c < cols;
            c++
        ){



            const td =
                document.createElement(
                    "td"
                );



            td.contentEditable =
                true;



            td.innerHTML =
                "&nbsp;";



            td.style.border =
                "1px solid #999";



            td.style.minWidth =
                "70px";



            td.style.height =
                "25px";



            tr.appendChild(
                td
            );


        }



        table.appendChild(
            tr
        );


    }







    const range =
        selection.getRangeAt(0);



    range.deleteContents();



    range.insertNode(
        table
    );



    selection.removeAllRanges();



}









function openCustomTableBox(){



    const selection =
        window.getSelection();



    if(
        selection &&
        selection.rangeCount > 0
    ){


        customTableRange =
            selection
            .getRangeAt(0)
            .cloneRange();


    }






    const box =
        document.createElement(
            "div"
        );



    box.className =
        "cwCustomTableDialog";



    box.innerHTML = `

    <div class="cwCustomTableBox">


        <div>
            Insert Table
        </div>


        <input 
            id="cwRowsInput"
            type="number"
            min="1"
            value=""
            placeholder="Rows"
        >


        <input
            id="cwColsInput"
            type="number"
            min="1"
            value=""
            placeholder="Columns"
        >


        <div>


            <button id="cwCancelTable">
                Cancel
            </button>


            <button id="cwInsertTable">
                Insert
            </button>


        </div>


    </div>

    `;



    document.body.appendChild(
        box
    );







    document
    .getElementById(
        "cwCancelTable"
    )
    .onclick=function(){


        customTableRange = null;


        box.remove();


    };









    document
    .getElementById(
        "cwInsertTable"
    )
    .onclick=function(){



        const rows =
            Number(
                document
                .getElementById(
                    "cwRowsInput"
                )
                .value
            );



        const cols =
            Number(
                document
                .getElementById(
                    "cwColsInput"
                )
                .value
            );





        if(
            rows < 1 ||
            cols < 1
        ){

            return;

        }






        if(customTableRange){


            const selection =
                window.getSelection();



            selection.removeAllRanges();



            selection.addRange(
                customTableRange
            );


        }







        createCustomTable(
            rows,
            cols
        );



        customTableRange = null;



        box.remove();



    };



}









document.addEventListener(
    "click",
    function(e){



        const custom =
            e.target.closest(
                '[data-action="table-custom"]'
            );



        if(!custom){

            return;

        }



        e.preventDefault();


        e.stopPropagation();



        openCustomTableBox();



    },
    false
);



})();


















/* =========================================================
   CAMPUS WORD — DRAW TABLE MODE ENGINE
   STEP 1
   ACTIVATE / DEACTIVATE DRAW MODE
   ISOLATED MODULE
   NO TABLE CREATION
   NO TABLE ENGINE INTERFERENCE
   NO CARET / RIBBON INTERFERENCE
========================================================= */

(function(){



    let drawTableActive = false;





    function enableDrawMode(button){



        drawTableActive =
            !drawTableActive;





        if(drawTableActive){


            button.classList.add(
                "cwDrawTableActive"
            );



            document.body.classList.add(
                "cwDrawTableMode"
            );



        }else{


            button.classList.remove(
                "cwDrawTableActive"
            );



            document.body.classList.remove(
                "cwDrawTableMode"
            );


        }



    }









    document.addEventListener(
        "click",
        function(e){



            const button =
                e.target.closest(
                    '[data-action="draw-table"]'
                );



            if(!button){

                return;

            }





            e.preventDefault();



            e.stopPropagation();





            enableDrawMode(
                button
            );



        },
        false
    );









    window.CampusWordDrawTable = {


        isActive:function(){


            return drawTableActive;


        },



        disable:function(){



            drawTableActive =
                false;



            document.body.classList.remove(
                "cwDrawTableMode"
            );



            const button =
                document.querySelector(
                    '[data-action="draw-table"]'
                );



            if(button){


                button.classList.remove(
                    "cwDrawTableActive"
                );


            }


        }



    };



})();
















/* =========================================================
   CAMPUS WORD — DRAW TABLE FRAME ENGINE
   STEP 2 FIXED
   DRAW FIRST TABLE RECTANGLE
   TOUCH + MOUSE SUPPORT
   STABLE POINTER TRACKING
   VISUAL FRAME ONLY
   NO TABLE CREATION
   NO CARET INTERFERENCE
   NO RIBBON INTERFERENCE
========================================================= */

(function(){



let drawing = false;

let startX = 0;

let startY = 0;

let drawFrame = null;





function getPoint(e){

    return e;

}








function createFrame(){


    if(drawFrame){

        return;

    }



    drawFrame =
        document.createElement(
            "div"
        );



    drawFrame.className =
        "cwDrawTableFrame";



    drawFrame.style.position =
        "fixed";



    drawFrame.style.border =
        "2px dashed #2563eb";



    drawFrame.style.background =
        "rgba(37,99,235,0.05)";



    drawFrame.style.pointerEvents =
        "none";



    drawFrame.style.touchAction =
        "none";



    drawFrame.style.zIndex =
        "999999";



    document.body.appendChild(
        drawFrame
    );


}









function moveFrame(x,y){


    const width =
        Math.abs(
            x - startX
        );


    const height =
        Math.abs(
            y - startY
        );



    drawFrame.style.left =
        Math.min(
            x,
            startX
        ) + "px";



    drawFrame.style.top =
        Math.min(
            y,
            startY
        ) + "px";



    drawFrame.style.width =
        width + "px";



    drawFrame.style.height =
        height + "px";



}









document.addEventListener(
    "pointerdown",
    function(e){



        if(
            !window.CampusWordDrawTable ||
            !window.CampusWordDrawTable.isActive()
        ){

            return;

        }





        drawing = true;



        startX =
            e.clientX;



        startY =
            e.clientY;





        createFrame();



        drawFrame.style.display =
            "block";



        moveFrame(
            startX,
            startY
        );



        if(
            e.pointerId !== undefined &&
            e.target.setPointerCapture
        ){

            e.target.setPointerCapture(
                e.pointerId
            );

        }



        e.preventDefault();



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointermove",
    function(e){



        if(
            !drawing ||
            !drawFrame
        ){

            return;

        }





        moveFrame(
            e.clientX,
            e.clientY
        );



        e.preventDefault();



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(e){



        if(!drawing){

            return;

        }



        drawing = false;



        if(
            e.pointerId !== undefined &&
            e.target.releasePointerCapture
        ){

            e.target.releasePointerCapture(
                e.pointerId
            );

        }



    },
    false
);



})();

















/* =========================================================
   CAMPUS WORD — DRAW TABLE CREATE ENGINE
   STEP 3 FIXED
   CONVERT DRAW FRAME TO REAL TABLE
   TOUCH + MOUSE SAFE
   ISOLATED MODULE
   NO CUSTOM TABLE INTERFERENCE
   NO CARET / RIBBON INTERFERENCE
========================================================= */

(function(){





function createDrawnTable(width,height){



    const selection =
        window.getSelection();



    if(
        !selection ||
        selection.rangeCount === 0
    ){

        return;

    }







    const cellWidth = 70;

    const cellHeight = 30;





    let cols =
        Math.max(
            1,
            Math.round(
                width / cellWidth
            )
        );



    let rows =
        Math.max(
            1,
            Math.round(
                height / cellHeight
            )
        );








    const table =
        document.createElement(
            "table"
        );



    table.classList.add(
        "cwWordTable"
    );



    table.style.borderCollapse =
        "collapse";



    table.style.margin =
        "10px 0";



    table.style.width =
        width + "px";








    for(
        let r = 0;
        r < rows;
        r++
    ){



        const tr =
            document.createElement(
                "tr"
            );



        for(
            let c = 0;
            c < cols;
            c++
        ){



            const td =
                document.createElement(
                    "td"
                );



            td.contentEditable =
                true;



            td.innerHTML =
                "&nbsp;";



            td.style.border =
                "1px solid #999";



            td.style.height =
                "25px";



            td.style.minWidth =
                "70px";



            tr.appendChild(
                td
            );



        }



        table.appendChild(
            tr
        );


    }








    const range =
        selection.getRangeAt(0);



    range.deleteContents();



    range.insertNode(
        table
    );



    selection.removeAllRanges();



}









document.addEventListener(
    "pointerup",
    function(e){



        if(
            !window.CampusWordDrawTable ||
            !window.CampusWordDrawTable.isActive()
        ){

            return;

        }






        const frame =
            document.querySelector(
                ".cwDrawTableFrame"
            );



        if(!frame){

            return;

        }






        const rect =
            frame.getBoundingClientRect();






        if(
            rect.width < 20 ||
            rect.height < 20
        ){

            return;

        }







        /*
          PREVENT DOUBLE EXECUTION
        */

        if(
            frame.dataset.used === "true"
        ){

            return;

        }



        frame.dataset.used =
            "true";







        createDrawnTable(
            rect.width,
            rect.height
        );





        frame.remove();



    },
    false
);



})();





















/* =========================================================
   CAMPUS WORD — DRAW TABLE INTERNAL LINES ENGINE
   STEP 4
   CREATE ROW / COLUMN DIVIDERS
   TOUCH + MOUSE SUPPORT
   ISOLATED MODULE
   NO ERASER INTERFERENCE
   NO RESIZE INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){



let drawingLine = false;

let startX = 0;

let startY = 0;

let activeTable = null;



const threshold = 15;






function getPoint(e){

    return e;

}







function findTable(e){


    const target =
        e.target.closest(
            ".cwWordTable"
        );


    return target || null;


}









function addVerticalLine(table,x){


    const rect =
        table.getBoundingClientRect();



    const ratio =
        x - rect.left;



    const columns =
        table.rows[0]
        ? table.rows[0].cells.length
        : 0;



    if(columns < 1){

        return;

    }



    const position =
        Math.round(
            ratio /
            (rect.width / columns)
        );



    Array.from(
        table.rows
    )
    .forEach(function(row){


        const cell =
            row.cells[position - 1];



        if(cell){

            cell.style.borderRight =
                "1px solid #999";

        }


    });



}








function addHorizontalLine(table,y){


    const rect =
        table.getBoundingClientRect();



    const ratio =
        y - rect.top;



    const rows =
        table.rows.length;



    if(rows < 1){

        return;

    }



    const position =
        Math.round(
            ratio /
            (rect.height / rows)
        );



    const row =
        table.rows[position - 1];



    if(row){


        Array.from(
            row.cells
        )
        .forEach(function(cell){


            cell.style.borderBottom =
                "1px solid #999";


        });


    }


}









document.addEventListener(
    "pointerdown",
    function(e){



        if(
            !window.CampusWordDrawTable ||
            !window.CampusWordDrawTable.isActive()
        ){

            return;

        }





        const table =
            findTable(e);



        if(!table){

            return;

        }



        activeTable =
            table;



        drawingLine = true;



        startX =
            e.clientX;



        startY =
            e.clientY;



        e.preventDefault();



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(e){



        if(
            !drawingLine ||
            !activeTable
        ){

            return;

        }



        const dx =
            Math.abs(
                e.clientX - startX
            );



        const dy =
            Math.abs(
                e.clientY - startY
            );






        /*
          VERTICAL DRAW
        */

        if(
            dx < threshold &&
            dy > threshold
        ){

            addVerticalLine(
                activeTable,
                startX
            );

        }







        /*
          HORIZONTAL DRAW
        */

        if(
            dy < threshold &&
            dx > threshold
        ){

            addHorizontalLine(
                activeTable,
                startY
            );

        }







        drawingLine = false;

        activeTable = null;



    },
    false
);



})();




















/* =========================================================
   CAMPUS WORD — CONVERT TEXT TO TABLE ENGINE
   STEP 1
   BUTTON ACTIVATION ONLY
   ISOLATED MODULE
   NO TABLE CREATION
   NO CARET INTERFERENCE
   NO RIBBON INTERFERENCE
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="convert-text-table"]'
            );



        if(!button){

            return;

        }



        e.preventDefault();



        e.stopPropagation();



        button.classList.toggle(
            "cwConvertTextTableActive"
        );



    },
    false
);



})();


















/* =========================================================
   CAMPUS WORD — CONVERT TEXT TO TABLE ENGINE
   STEP 2
   TEXT SELECTION DETECTION
   ISOLATED MODULE
   NO TABLE CREATION
   NO TABLE ENGINE INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){



let convertMode = false;






document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="convert-text-table"]'
            );



        if(!button){

            return;

        }



        convertMode =
            !convertMode;



    },
    false
);









document.addEventListener(
    "mouseup",
    function(){



        if(!convertMode){

            return;

        }





        const selection =
            window.getSelection();



        if(
            !selection ||
            selection.rangeCount === 0
        ){

            return;

        }






        const text =
            selection.toString()
            .trim();





        if(!text){

            return;

        }






        console.log(
            "Selected text ready for conversion:",
            text
        );



    },
    false
);





})();





















/* =========================================================
   CAMPUS WORD — CONVERT TEXT TO TABLE ENGINE
   STEP 3
   CONVERSION OPTIONS DIALOG
   TABS / COMMAS / SPACES / OTHER
   SAVE TEXT SELECTION
   ISOLATED MODULE
   NO TABLE CREATION
   NO CARET INTERFERENCE
========================================================= */

(function(){



let dialogOpen = false;


let savedRange = null;


let savedText = "";






window.CampusWordConvertData = {


    getText:function(){

        return savedText;

    },


    getRange:function(){

        return savedRange;

    }


};









function openConvertDialog(text){



    if(dialogOpen){

        return;

    }



    dialogOpen = true;



    const box =
        document.createElement(
            "div"
        );



    box.className =
        "cwConvertTableDialog";



    box.innerHTML = `

    <div class="cwConvertTableBox">


        <h3>
            Convert Text to Table
        </h3>


        <p>
            Separate text at:
        </p>



        <label>
            <input 
                type="radio"
                name="cwSeparator"
                value="tab"
                checked
            >
            Tabs
        </label>



        <label>
            <input 
                type="radio"
                name="cwSeparator"
                value=","
            >
            Commas
        </label>



        <label>
            <input 
                type="radio"
                name="cwSeparator"
                value="space"
            >
            Spaces
        </label>




        <label>
            <input 
                type="radio"
                name="cwSeparator"
                value="other"
            >
            Other
        </label>



        <input
            id="cwOtherSeparator"
            type="text"
            maxlength="1"
            placeholder="Character"
        >




        <div>


            <button id="cwConvertCancel">
                Cancel
            </button>


            <button id="cwConvertOK">
                OK
            </button>


        </div>


    </div>

    `;




    document.body.appendChild(
        box
    );









    document
    .getElementById(
        "cwConvertCancel"
    )
    .onclick=function(){


        box.remove();


        dialogOpen = false;


        savedRange = null;


        savedText = "";


    };









    document
    .getElementById(
        "cwConvertOK"
    )
    .onclick=function(){



        const selected =
            box.querySelector(
                'input[name="cwSeparator"]:checked'
            );



        let separator =
            selected.value;



        if(
            separator === "space"
        ){

            separator =
                " ";

        }





        if(
            separator === "other"
        ){

            separator =
                document
                .getElementById(
                    "cwOtherSeparator"
                )
                .value;

        }





        window.CampusWordConvertData.separator =
            separator;





        console.log(
            "Separator selected:",
            separator
        );





        box.remove();


        dialogOpen = false;



    };



}









document.addEventListener(
    "mouseup",
    function(){



        if(dialogOpen){

            return;

        }





        const button =
            document.querySelector(
                '[data-action="convert-text-table"].cwConvertTextTableActive'
            );



        if(!button){

            return;

        }







        const selection =
            window.getSelection();



        const text =
            selection
            .toString()
            .trim();





        if(!text){

            return;

        }





        savedText = text;



        savedRange =
            selection
            .getRangeAt(0)
            .cloneRange();





        openConvertDialog(
            text
        );



    },
    false
);



})();













/* =========================================================
   CAMPUS WORD — CONVERT TEXT TO TABLE ENGINE
   STEP 4
   CREATE REAL CW WORD TABLE
   REPLACE SAVED TEXT RANGE
   ISOLATED MODULE
   NO CUSTOM / DRAW TABLE INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){






function createTableFromText(
    text,
    separator
){



    const rows =
        text
        .split(/\r?\n/)
        .filter(
            row =>
            row.trim() !== ""
        );



    if(
        rows.length === 0
    ){

        return null;

    }





    const table =
        document.createElement(
            "table"
        );



    table.classList.add(
        "cwWordTable"
    );



    table.style.borderCollapse =
        "collapse";



    table.style.margin =
        "10px 0";







    rows.forEach(
        function(rowText){



            const tr =
                document.createElement(
                    "tr"
                );



            let columns;



            if(
                separator === " "
            ){


                columns =
                    rowText
                    .trim()
                    .split(
                        /\s+/
                    );


            }else{


                if(
                    separator === "\t"
                ){

                    columns =
                        rowText.split("\t");

                }else{


                    columns =
                        rowText.split(
                            separator
                        );


                }

            }







            columns.forEach(
                function(value){



                    const td =
                        document.createElement(
                            "td"
                        );



                    td.contentEditable =
                        true;



                    td.innerHTML =
                        value.trim() ||
                        "&nbsp;";



                    td.style.border =
                        "1px solid #999";



                    td.style.minWidth =
                        "70px";



                    td.style.height =
                        "25px";



                    tr.appendChild(
                        td
                    );


                }
            );



            table.appendChild(
                tr
            );



        }
    );



    return table;


}









document.addEventListener(
    "click",
    function(e){



        const ok =
            e.target.closest(
                "#cwConvertOK"
            );



        if(!ok){

            return;

        }







        let separator =
            document
            .querySelector(
                'input[name="cwSeparator"]:checked'
            )
            .value;







        if(
            separator === "tab"
        ){

            separator =
                "\t";

        }







        if(
            separator === "space"
        ){

            separator =
                " ";

        }







        if(
            separator === "other"
        ){

            separator =
                document
                .getElementById(
                    "cwOtherSeparator"
                )
                .value;

        }







        const text =
            window.CampusWordConvertData
            .getText();




        const range =
            window.CampusWordConvertData
            .getRange();





        if(
            !text ||
            !range
        ){

            return;

        }








        const table =
            createTableFromText(
                text,
                separator
            );







        if(!table){

            return;

        }








        range.deleteContents();



        range.insertNode(
            table
        );





    },
    false
);



})();





























/* =========================================================
   CAMPUS WORD — INSERT PICTURE BUTTON ENGINE
   STEP 1
   BUTTON ACTIVE STATE ONLY
   NO IMAGE INSERTION YET
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="insert-picture"]'
            );



        if(!button){

            return;

        }





        e.preventDefault();


        e.stopPropagation();






        button.classList.toggle(
            "cwInsertPictureActive"
        );



    },
    false
);



})();













/* =========================================================
   CAMPUS WORD — INSERT PICTURE ENGINE
   STEP 2
   OPEN FILE PICKER
   NO IMAGE INSERTION YET
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){



let pictureInput = null;






function createPicturePicker(){



    if(pictureInput){

        return;

    }



    pictureInput =
        document.createElement(
            "input"
        );



    pictureInput.type =
        "file";



    pictureInput.accept =
        "image/*";



    pictureInput.style.display =
        "none";



    pictureInput.id =
        "cwPictureFilePicker";



    document.body.appendChild(
        pictureInput
    );



}









document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="insert-picture"]'
            );



        if(!button){

            return;

        }





        e.preventDefault();


        e.stopPropagation();






        createPicturePicker();






        pictureInput.click();



    },
    false
);






})();













/* =========================================================
   CAMPUS WORD — INSERT PICTURE ENGINE
   STEP 3
   INSERT IMAGE INTO PAGE
   RESIZE + DRAG SUPPORT
   TOUCH + MOUSE
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){



let pictureInput = null;



let activeImage = null;



let dragging = false;



let startX = 0;

let startY = 0;

let startLeft = 0;

let startTop = 0;







function createPicker(){


    if(pictureInput){

        return;

    }



    pictureInput =
        document.createElement(
            "input"
        );



    pictureInput.type =
        "file";



    pictureInput.accept =
        "image/*";



    pictureInput.style.display =
        "none";



    document.body.appendChild(
        pictureInput
    );



}








function insertImage(file){



    const reader =
        new FileReader();




    reader.onload =
    function(event){



        const img =
            document.createElement(
                "img"
            );



        img.src =
            event.target.result;



        img.className =
            "cwInsertedImage";



        img.style.position =
            "absolute";



        img.style.width =
            "300px";



        img.style.height =
            "auto";



        img.style.left =
            "20px";



        img.style.top =
            "20px";



        img.style.cursor =
            "move";



        img.draggable =
            false;






        const page =
            document.querySelector(
                ".cwPageContent"
            );



        if(!page){

            return;

        }



        page.appendChild(
            img
        );



        activeImage = img;



    };




    reader.readAsDataURL(
        file
    );


}









document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="insert-picture"]'
            );



        if(!button){

            return;

        }



        createPicker();



        pictureInput.onchange =
        function(){



            const file =
                pictureInput.files[0];



            if(file){

                insertImage(
                    file
                );

            }



            pictureInput.value =
                "";



        };



        pictureInput.click();



    },
    false
);









document.addEventListener(
    "pointerdown",
    function(e){



        const img =
            e.target.closest(
                ".cwInsertedImage"
            );



        if(!img){

            return;

        }



        activeImage =
            img;



        dragging = true;



        const point =
            e;



        startX =
            point.clientX;



        startY =
            point.clientY;



        startLeft =
            img.offsetLeft;



        startTop =
            img.offsetTop;



        e.preventDefault();



    },
    false
);








document.addEventListener(
    "pointermove",
    function(e){



        if(
            !dragging ||
            !activeImage
        ){

            return;

        }



        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;





        activeImage.style.left =
            startLeft + dx + "px";



        activeImage.style.top =
            startTop + dy + "px";



    },
    false
);









document.addEventListener(
    "pointerup",
    function(){



        dragging = false;



    },
    false
);





})();
















/* =========================================================
   CAMPUS WORD — IMAGE RESIZE HANDLE ENGINE
   STEP 4
   8 RESIZE HANDLES
   TOUCH + MOUSE SUPPORT
   KEEP IMAGE RATIO
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){



let selectedImage = null;

let resizeHandle = null;

let resizing = false;


let startX = 0;

let startY = 0;


let startWidth = 0;

let startHeight = 0;


let startRatio = 1;









const handles = [

    "nw",
    "n",
    "ne",
    "w",
    "e",
    "sw",
    "s",
    "se"

];









function createHandles(img){



    removeHandles();



    const box =
        document.createElement(
            "div"
        );


    box.className =
        "cwImageResizeBox";



    box.style.position =
        "absolute";



    box.style.left =
        img.offsetLeft + "px";



    box.style.top =
        img.offsetTop + "px";



    box.style.width =
        img.offsetWidth + "px";



    box.style.height =
        img.offsetHeight + "px";



    box.dataset.target =
        "image";




    handles.forEach(
        function(pos){


            const h =
                document.createElement(
                    "div"
                );


            h.className =
                "cwResizeHandle " + pos;



            h.dataset.direction =
                pos;



            box.appendChild(
                h
            );


        }
    );




    img.parentElement.appendChild(
        box
    );



}









function removeHandles(){


    const old =
        document.querySelector(
            ".cwImageResizeBox"
        );



    if(old){

        old.remove();

    }


}




document.addEventListener(
    "pointerdown",
    function(e){



        const img =
            e.target.closest(
                ".cwInsertedImage"
            );



if(img){


    selectedImage =
        img;


    window.CampusWordSelectedImage =
        img;


    createHandles(
        img
    );


    return;


}





        const handle =
            e.target.closest(
                ".cwResizeHandle"
            );



        if(!handle){

            return;

        }





        resizing = true;



        resizeHandle =
            handle.dataset.direction;



        const box =
            handle.parentElement;



        selectedImage =
            document.querySelector(
                ".cwInsertedImage"
            );



        startX =
            e.clientX;



        startY =
            e.clientY;



        startWidth =
            selectedImage.offsetWidth;



        startHeight =
            selectedImage.offsetHeight;



        startRatio =
            startWidth /
            startHeight;



        e.preventDefault();



    },
    false
);






















document.addEventListener(
    "pointermove",
    function(e){



        if(
            !resizing ||
            !selectedImage
        ){

            return;

        }





        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;



        let newWidth =
            startWidth;



        if(
            resizeHandle.includes("e")
            ||
            resizeHandle.includes("w")
        ){

            newWidth =
                startWidth + dx;

        }



        if(
            resizeHandle.includes("s")
            ||
            resizeHandle.includes("n")
        ){

            newWidth =
                startWidth + dy * startRatio;

        }




        if(newWidth < 50){

            newWidth = 50;

        }




        selectedImage.style.width =
            newWidth + "px";



        createHandles(
            selectedImage
        );



    },
    false
);









document.addEventListener(
    "pointerup",
    function(){


        resizing = false;


        resizeHandle = null;


    },
    false
);










document.addEventListener(
    "pointermove",
    function(e){



        if(
            !resizing ||
            !selectedImage
        ){

            return;

        }





        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;



        let newWidth =
            startWidth;



        if(
            resizeHandle.includes("e")
            ||
            resizeHandle.includes("w")
        ){

            newWidth =
                startWidth + dx;

        }



        if(
            resizeHandle.includes("s")
            ||
            resizeHandle.includes("n")
        ){

            newWidth =
                startWidth + dy * startRatio;

        }




        if(newWidth < 50){

            newWidth = 50;

        }




        selectedImage.style.width =
            newWidth + "px";



        createHandles(
            selectedImage
        );



    },
    false
);









document.addEventListener(
    "pointerup",
    function(){


        resizing = false;


        resizeHandle = null;


    },
    false
);







document.addEventListener(
    "pointerdown",
    function(e){



        const clickedImage =
            e.target.closest(
                ".cwInsertedImage"
            );



        const clickedHandle =
            e.target.closest(
                ".cwResizeHandle"
            );



        const clickedRibbon =
            e.target.closest(
                "#cwRibbon, .cwRibbonBtn, .cwDropdownMenu"
            );



        if(
            clickedRibbon
        ){

            return;

        }





        if(
            !clickedImage &&
            !clickedHandle
        ){

            selectedImage = null;

            resizing = false;

            resizeHandle = null;


            removeHandles();

        }



    },
    false
);


})();










/* =========================================================
   CAMPUS WORD — IMAGE ROTATE + WRAP ENGINE
   STEP 5
   ROTATION HANDLE
   TEXT WRAPPING MODES
   TOUCH + MOUSE SUPPORT
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){


let selectedImage = null;

let rotating = false;

let startAngle = 0;

let currentRotation = 0;



function createRotateHandle(img){


    document
    .querySelectorAll(
        ".cwImageRotateHandle"
    )
    .forEach(
        h => h.remove()
    );



    const handle =
        document.createElement(
            "div"
        );


    handle.className =
        "cwImageRotateHandle";



    handle.dataset.rotate =
        "true";



    img.parentElement.appendChild(
        handle
    );


}







document.addEventListener(
    "pointerdown",
    function(e){



        const img =
            e.target.closest(
                ".cwInsertedImage"
            );



        if(img){


            selectedImage =
                img;


            createRotateHandle(
                img
            );


            return;

        }




        const rotate =
            e.target.closest(
                ".cwImageRotateHandle"
            );



        if(!rotate ||
           !selectedImage){

            return;

        }



        rotating = true;



        startAngle =
            e.clientX;



        e.preventDefault();



    },
    false
);








document.addEventListener(
    "pointermove",
    function(e){



        if(
            !rotating ||
            !selectedImage
        ){

            return;

        }



        const diff =
            e.clientX -
            startAngle;



        currentRotation =
            diff;



        selectedImage.style.transform =
            "rotate(" +
            currentRotation +
            "deg)";



    },
    false
);








document.addEventListener(
    "pointerup",
    function(){



        rotating = false;



    },
    false
);




window.CampusWordImageWrap = {

apply:function(mode){


const img =
    selectedImage ||
    window.CampusWordSelectedImage;





    if(!img){

        return;

    }




    img.dataset.wrap =
        mode;




    /*
       RESET
    */

    img.style.position =
        "";

    img.style.float =
        "";

    img.style.zIndex =
        "";

    img.style.margin =
        "10px";





    if(mode === "inline"){


        img.style.display =
            "inline-block";


        img.style.position =
            "relative";


    }





    if(mode === "square"){


        img.style.float =
            "left";


        img.style.marginRight =
            "15px";


        img.style.marginBottom =
            "10px";


    }







    if(mode === "tight"){


        img.style.float =
            "left";


        img.style.marginRight =
            "5px";


        img.style.marginBottom =
            "5px";


    }








    if(mode === "behind"){


        img.style.position =
            "absolute";


        img.style.zIndex =
            "-1";


    }







    if(mode === "front"){


        img.style.position =
            "absolute";


        img.style.zIndex =
            "9999";


    }



}


};


})();












/* =========================================================
   CAMPUS WORD — WRAP TEXT DROPDOWN ACTIVATOR
   STEP 5B FIX
   OPEN / CLOSE WRAP TEXT MENU
   ISOLATED MODULE
   NO IMAGE / TABLE / CARET INTERFERENCE
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="image-wrap-text"]'
            );



        if(button){


            e.preventDefault();


            e.stopPropagation();



            button.classList.toggle(
                "cwDropdownOpen"
            );



            const menu =
                button.querySelector(
                    ".cwDropdownMenu"
                );



            if(menu){


                menu.style.display =
                    button.classList.contains(
                        "cwDropdownOpen"
                    )
                    ? "block"
                    : "none";


            }


            return;

        }







        const insideMenu =
            e.target.closest(
                ".cwDropdownMenu"
            );



        if(!insideMenu){


            document
            .querySelectorAll(
                '[data-action="image-wrap-text"].cwDropdownOpen'
            )
            .forEach(
                function(btn){


                    btn.classList.remove(
                        "cwDropdownOpen"
                    );


                    const menu =
                        btn.querySelector(
                            ".cwDropdownMenu"
                        );


                    if(menu){

                        menu.style.display =
                            "none";

                    }


                }
            );


        }



    },
    false
);



})();



















/* =========================================================
   CAMPUS WORD — IMAGE WRAP TEXT MENU ENGINE
   STEP 5B
   WRAP TEXT OPTIONS
   IN LINE / SQUARE / TIGHT
   BEHIND / FRONT
   ISOLATED MODULE
   NO TABLE / NO CARET INTERFERENCE
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const option =
            e.target.closest(
                "[data-wrap]"
            );



        if(!option){

            return;

        }





        e.preventDefault();



        e.stopPropagation();






        const mode =
            option.dataset.wrap;





        if(
            window.CampusWordImageWrap &&
            window.CampusWordImageWrap.apply
        ){



            window.CampusWordImageWrap.apply(
                mode
            );


        }





    },
    false
);



})();












/* =========================================================
   CAMPUS WORD — IMAGE TOUCH RESIZE FIX
   TOUCH PRECISION UPGRADE
   NO MOUSE BREAK
   NO TABLE / CARET INTERFERENCE
========================================================= */

(function(){



let touchResize = false;

let touchHandle = null;

let touchImage = null;


let startX = 0;

let startWidth = 0;

let ratio = 1;






document.addEventListener(
    "pointerdown",
    function(e){



        const handle =
            e.target.closest(
                ".cwResizeHandle"
            );



        if(!handle){

            return;

        }



        touchImage =
            document.querySelector(
                ".cwInsertedImage"
            );



        if(!touchImage){

            return;

        }





        touchResize = true;



        touchHandle =
            handle.dataset.direction;



        startX =
            e.clientX;



        startWidth =
            touchImage.offsetWidth;



        ratio =
            touchImage.offsetHeight /
            touchImage.offsetWidth;



        e.preventDefault();



    },
    {
        passive:false
    }
);








document.addEventListener(
    "pointermove",
    function(e){



        if(
            !touchResize ||
            !touchImage
        ){

            return;

        }





        const diff =
            e.clientX -
            startX;




        let width =
            startWidth;



        /*
          RIGHT / LEFT HANDLES
        */

        if(
            touchHandle.includes("e") ||
            touchHandle.includes("w")
        ){

            width =
                startWidth + diff;

        }





        /*
          TOP / BOTTOM / CORNER
        */

        if(
            touchHandle.includes("s") ||
            touchHandle.includes("n")
        ){

            width =
                startWidth + diff;

        }





        if(width < 50){

            width = 50;

        }




        touchImage.style.width =
            width + "px";



        touchImage.style.height =
            "auto";



    },
    {
        passive:false
    }
);








document.addEventListener(
    "pointerup",
    function(){


        touchResize = false;

        touchHandle = null;

        touchImage = null;


    },
    false
);



})();

























/* =========================================================
   CAMPUS WORD — IMAGE SELECTION LOCK ENGINE
   KEEP 8 RESIZE HANDLES ACTIVE
   WHILE USING PICTURE TOOLS
   WRAP TEXT / ROTATE / STYLES
   TOUCH + MOUSE
   ISOLATED MODULE
========================================================= */

(function(){



let lockedImage = null;



function lockCurrentImage(){


    if(
        window.CampusWordSelectedImage
    ){

        lockedImage =
            window.CampusWordSelectedImage;

    }


}





document.addEventListener(
    "pointerdown",
    function(e){



        const img =
            e.target.closest(
                ".cwInsertedImage"
            );



        if(img){


            lockedImage = img;



            window.CampusWordSelectedImage =
                img;


        }



    },
    true
);








document.addEventListener(
    "pointerdown",
    function(e){



        const pictureAction =
            e.target.closest(
                ".cwRibbonBtn"
            );



        if(!pictureAction){

            return;

        }





        if(
            lockedImage
        ){


            window.CampusWordSelectedImage =
                lockedImage;


        }



    },
    true
);








document.addEventListener(
    "click",
    function(e){



        const wrap =
            e.target.closest(
                "[data-wrap]"
            );



        if(
            wrap &&
            lockedImage
        ){


            window.CampusWordSelectedImage =
                lockedImage;



            /*
              FORCE KEEP IMAGE STATE
            */

            lockedImage.classList.add(
                "cwImageSelected"
            );



        }



    },
    true
);



})();



























































/* =========================================================
   CAMPUS WORD — SHAPES DROPDOWN ACTIVATOR
   ISOLATED MODULE
   OPEN / CLOSE SHAPES MENU ONLY
   NO OTHER DROPDOWN INTERFERENCE
========================================================= */

(function(){


document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '.cwRibbonBtn.cwDropdownBtn'
            );



        if(button){


            const menu =
                button.querySelector(
                    ".cwDropdownMenu"
                );


            if(
                !menu ||
                !menu.querySelector(
                    '[data-action^="shape-"]'
                )
            ){

                return;

            }



            e.preventDefault();

            e.stopPropagation();



            button.classList.toggle(
                "cwDropdownOpen"
            );



            menu.style.display =
                button.classList.contains(
                    "cwDropdownOpen"
                )
                ? "block"
                : "none";



            return;

        }







        const insideMenu =
            e.target.closest(
                ".cwDropdownMenu"
            );



        if(!insideMenu){


            document
            .querySelectorAll(
                '.cwRibbonBtn.cwDropdownBtn.cwDropdownOpen'
            )
            .forEach(
                function(btn){



                    const menu =
                        btn.querySelector(
                            ".cwDropdownMenu"
                        );



                    if(
                        menu &&
                        menu.querySelector(
                            '[data-action^="shape-"]'
                        )
                    ){


                        btn.classList.remove(
                            "cwDropdownOpen"
                        );


                        menu.style.display =
                            "none";


                    }



                }
            );


        }



    },
    false
);



})();























/* =========================================================
   CAMPUS WORD — SHAPES ENGINE
   STEP 1
   SHAPE SELECTION ONLY
   SAVE ACTIVE SHAPE TYPE
   NO SHAPE INSERTION
   NO PAGE INTERFERENCE
   NO CARET INTERFERENCE
   NO IMAGE / TABLE INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



window.CampusWordActiveShape = null;






document.addEventListener(
    "click",
    function(e){



        const option =
            e.target.closest(
                '[data-action^="shape-"]'
            );



        if(!option){

            return;

        }





        e.preventDefault();


        e.stopPropagation();








        const shape =
            option.dataset.action;







        window.CampusWordActiveShape =
            shape;







        document
        .querySelectorAll(
            '[data-action^="shape-"].cwShapeSelected'
        )
        .forEach(
            function(item){


                item.classList.remove(
                    "cwShapeSelected"
                );


            }
        );









        option.classList.add(
            "cwShapeSelected"
        );







        console.log(
            "Active Shape:",
            window.CampusWordActiveShape
        );



    },
    false
);



})();



















/* =========================================================
   CAMPUS WORD — SHAPES INSERT MODE ENGINE
   STEP 2
   ACTIVATE INSERT MODE
   SAVE PAGE POSITION ONLY
   NO SHAPE CREATION
   NO CARET INTERFERENCE
   NO IMAGE / TABLE INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



let shapeInsertMode = false;





window.CampusWordShapeData = {


    getShape:function(){

        return window.CampusWordActiveShape || null;

    },



    getPosition:function(){

        return this.position || null;

    },



    position:null


};









document.addEventListener(
    "click",
    function(e){



        const shapeOption =
            e.target.closest(
                '[data-action^="shape-"]'
            );



        if(!shapeOption){

            return;

        }





        const shape =
            shapeOption.dataset.action;





        window.CampusWordActiveShape =
            shape;





        shapeInsertMode = true;





        window.CampusWordShapeData.position =
            null;





    },
    false
);









document.addEventListener(
    "pointerdown",
    function(e){



        if(!shapeInsertMode){

            return;

        }





        const page =
            e.target.closest(
                ".cwPageContent"
            );





        if(!page){

            return;

        }






        const rect =
            page.getBoundingClientRect();







        const x =
            e.clientX -
            rect.left;





        const y =
            e.clientY -
            rect.top;









        window.CampusWordShapeData.position = {


            x:x,

            y:y,

            page:page



        };







        console.log(
            "Shape insertion position:",
            window.CampusWordShapeData.position
        );






        shapeInsertMode = false;



    },
    {
        passive:false
    }
);







})();















/* =========================================================
   CAMPUS WORD — SHAPES CREATION ENGINE
   STEP 3
   CREATE REAL SHAPE OBJECT
   INSERT INTO PAGE
   USE SAVED POSITION
   NO CARET INTERFERENCE
   NO IMAGE / TABLE INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){






function createShapeElement(
    type
){



    const shape =
        document.createElement(
            "div"
        );



    shape.className =
        "cwInsertedShape";



    shape.dataset.shape =
        type;





    shape.style.position =
        "absolute";



    shape.style.width =
        "120px";



    shape.style.height =
        "80px";



    shape.style.left =
        "0px";



    shape.style.top =
        "0px";



    shape.style.cursor =
        "move";



    shape.style.display =
        "flex";



    shape.style.alignItems =
        "center";



    shape.style.justifyContent =
        "center";



    shape.style.overflow =
        "hidden";



    shape.style.background =
        "rgba(37,99,235,0.15)";



    shape.style.border =
        "2px solid #2563eb";






    if(
        type === "shape-circle"
    ){


        shape.style.borderRadius =
            "50%";


    }







    if(
        type === "shape-rounded-rect"
    ){


        shape.style.borderRadius =
            "15px";


    }








    if(
        type === "shape-line"
    ){


        shape.style.height =
            "2px";


        shape.style.width =
            "120px";


        shape.style.background =
            "#2563eb";


        shape.style.border =
            "none";


    }








    if(
        type === "shape-triangle"
    ){


        shape.style.width =
            "0";


        shape.style.height =
            "0";


        shape.style.background =
            "transparent";


        shape.style.borderLeft =
            "60px solid transparent";


        shape.style.borderRight =
            "60px solid transparent";


        shape.style.borderBottom =
            "80px solid rgba(37,99,235,0.4)";


        shape.style.borderTop =
            "none";


    }







    if(
        type === "shape-diamond"
    ){


        shape.style.transform =
            "rotate(45deg)";


        shape.style.width =
            "85px";


        shape.style.height =
            "85px";


    }








    if(
        type === "shape-heart"
    ){


        shape.innerHTML =
        "♥";


        shape.style.color =
            "#2563eb";


        shape.style.background =
            "transparent";


        shape.style.border =
            "none";


        shape.style.fontSize =
            "90px";


    }








    if(
        type === "shape-star" ||
        type === "shape-star-5"
    ){


        shape.innerHTML =
            "★";


        shape.style.color =
            "#2563eb";


        shape.style.background =
            "transparent";


        shape.style.border =
            "none";


        shape.style.fontSize =
            "90px";


    }








    if(
        type === "shape-cloud"
    ){


        shape.innerHTML =
            "☁";


        shape.style.color =
            "#2563eb";


        shape.style.background =
            "transparent";


        shape.style.border =
            "none";


        shape.style.fontSize =
            "80px";


    }








    if(
        type === "shape-lightning"
    ){


        shape.innerHTML =
            "⚡";


        shape.style.color =
            "#2563eb";


        shape.style.background =
            "transparent";


        shape.style.border =
            "none";


        shape.style.fontSize =
            "80px";


    }








    if(
        type === "shape-smiley"
    ){


        shape.innerHTML =
            "☺";


        shape.style.color =
            "#2563eb";


        shape.style.background =
            "transparent";


        shape.style.border =
            "none";


        shape.style.fontSize =
            "90px";


    }







    return shape;



}









document.addEventListener(
    "pointerdown",
    function(){



        const data =
            window.CampusWordShapeData;



        if(
            !data ||
            !data.position ||
            !data.getShape()
        ){

            return;

        }







        const page =
            data.position.page;






        const shape =
            createShapeElement(
                data.getShape()
            );







        shape.style.left =
            data.position.x + "px";



        shape.style.top =
            data.position.y + "px";







        page.appendChild(
            shape
        );







        window.CampusWordSelectedShape =
            shape;







        data.position =
            null;





    },
    false
);







})();



















/* =========================================================
   CAMPUS WORD — SHAPE RESIZE ENGINE
   STEP 4
   SHAPE ONLY
   8 RESIZE HANDLES
   TOUCH + MOUSE
   ISOLATED FROM IMAGE RESIZE
   ISOLATED FROM TABLE
   ISOLATED FROM CARET
========================================================= */

(function(){


let activeShape = null;

let resizing = false;

let direction = null;


let startX = 0;

let startY = 0;


let startWidth = 0;

let startHeight = 0;




const points = [
    "nw",
    "n",
    "ne",
    "w",
    "e",
    "sw",
    "s",
    "se"
];







function clearShapeHandles(){

    const old =
        document.querySelector(
            ".cwShapeHandles"
        );


    if(old){

        old.remove();

    }

}








function showShapeHandles(shape){


    clearShapeHandles();



    const box =
        document.createElement(
            "div"
        );


    box.className =
        "cwShapeHandles";



    box.style.position =
        "absolute";


    box.style.left =
        shape.offsetLeft + "px";


    box.style.top =
        shape.offsetTop + "px";


    box.style.width =
        shape.offsetWidth + "px";


    box.style.height =
        shape.offsetHeight + "px";


    box.style.pointerEvents =
        "none";




    points.forEach(
        function(p){


            const h =
                document.createElement(
                    "div"
                );


            h.className =
                "cwShapeHandle-" + p;


            h.dataset.shapeResize =
                p;


            h.style.pointerEvents =
                "auto";


            box.appendChild(
                h
            );


        }
    );



    shape.parentElement.appendChild(
        box
    );


}








document.addEventListener(
    "pointerdown",
    function(e){



        const handle =
            e.target.closest(
                "[data-shape-resize]"
            );



        if(handle){


            activeShape =
                window.CampusWordSelectedShape;



            if(!activeShape){

                return;

            }



            resizing = true;



            direction =
                handle.dataset.shapeResize;



            startX =
                e.clientX;


            startY =
                e.clientY;


            startWidth =
                activeShape.offsetWidth;


            startHeight =
                activeShape.offsetHeight;



            e.preventDefault();



            return;

        }







        const shape =
            e.target.closest(
                ".cwInsertedShape"
            );



        if(shape){



            activeShape =
                shape;



            window.CampusWordSelectedShape =
                shape;



            showShapeHandles(
                shape
            );



            return;

        }



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointermove",
    function(e){



        if(
            !resizing ||
            !activeShape
        ){

            return;

        }




        let w =
            startWidth +
            (
                e.clientX -
                startX
            );



        let h =
            startHeight +
            (
                e.clientY -
                startY
            );



        if(w < 40){

            w = 40;

        }



        if(h < 40){

            h = 40;

        }



        activeShape.style.width =
            w + "px";


        activeShape.style.height =
            h + "px";



        showShapeHandles(
            activeShape
        );



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(){


        resizing = false;

        direction = null;


    },
    false
);









document.addEventListener(
    "pointerdown",
    function(e){


        const inside =
            e.target.closest(
                ".cwInsertedShape, .cwShapeHandles"
            );



        if(!inside){


            activeShape = null;


            window.CampusWordSelectedShape =
                null;


            clearShapeHandles();


        }


    },
    false
);



})();






















/* =========================================================
   CAMPUS WORD — SHAPE CORNER RESIZE ENGINE
   STEP 5
   RESIZE SHAPE USING STEP 4 HANDLES
   TEST CORNER HANDLE (SE)
   TOUCH + MOUSE SUPPORT
   ISOLATED FROM IMAGE RESIZE
   ISOLATED FROM TABLE
   ISOLATED FROM CARET
========================================================= */

(function(){


let resizing = false;

let shape = null;

let startX = 0;

let startY = 0;

let startWidth = 0;

let startHeight = 0;



document.addEventListener(
    "pointerdown",
    function(e){



        const handle =
            e.target.closest(
                '[data-shape-resize="se"]'
            );



        if(!handle){

            return;

        }



        shape =
            window.CampusWordSelectedShape;



        if(!shape){

            return;

        }



        resizing = true;



        startX =
            e.clientX;


        startY =
            e.clientY;



        startWidth =
            shape.offsetWidth;


        startHeight =
            shape.offsetHeight;



        e.preventDefault();


        e.stopPropagation();



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointermove",
    function(e){



        if(
            !resizing ||
            !shape
        ){

            return;

        }



        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;





        let newWidth =
            startWidth + dx;



        let newHeight =
            startHeight + dy;





        if(newWidth < 40){

            newWidth = 40;

        }



        if(newHeight < 40){

            newHeight = 40;

        }





        shape.style.width =
            newWidth + "px";



        shape.style.height =
            newHeight + "px";




        const refresh =
            document.querySelector(
                ".cwShapeHandles"
            );



        if(refresh){


            refresh.style.width =
                shape.offsetWidth + "px";


            refresh.style.height =
                shape.offsetHeight + "px";



        }



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(){


        resizing = false;

        shape = null;


    },
    false
);



})();
















/* =========================================================
   CAMPUS WORD — SHAPE DRAG ENGINE
   STEP 3.1
   MOVE SHAPE WITH MOUSE + TOUCH
   ISOLATED MODULE
   NO IMAGE INTERFERENCE
   NO TABLE INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){



let dragging = false;

let activeShape = null;


let startX = 0;

let startY = 0;


let startLeft = 0;

let startTop = 0;








document.addEventListener(
    "pointerdown",
    function(e){



        const shape =
            e.target.closest(
                ".cwInsertedShape"
            );



        if(!shape){

            return;

        }



        /*
          Ignore resize handles
        */

        if(
            e.target.closest(
                ".cwShapeResizeHandle"
            )
        ){

            return;

        }





        activeShape =
            shape;



        dragging = true;




        startX =
            e.clientX;



        startY =
            e.clientY;



        startLeft =
            shape.offsetLeft;



        startTop =
            shape.offsetTop;





        window.CampusWordSelectedShape =
            shape;



        e.preventDefault();



    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointermove",
    function(e){



        if(
            !dragging ||
            !activeShape
        ){

            return;

        }





        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;






        activeShape.style.left =
            startLeft + dx + "px";



        activeShape.style.top =
            startTop + dy + "px";





        const box =
            document.querySelector(
                ".cwShapeResizeBox"
            );



        if(box){


            box.style.left =
                activeShape.offsetLeft + "px";


            box.style.top =
                activeShape.offsetTop + "px";


        }




    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(){



        dragging = false;


        activeShape = null;



    },
    false
);



})();



















/* =========================================================
   CAMPUS WORD — INSERT CLIP ART BUTTON ENGINE
   STEP 1
   ISOLATED BUTTON ACTIVE STATE ONLY
   TARGET ONLY INSERT CLIPART
   NO OTHER BUTTON INTERFERENCE
   NO IMAGE / SHAPE / CARET INTERFERENCE
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="insert-clipart"]'
            );



        if(!button){

            return;

        }





        e.preventDefault();


        e.stopPropagation();





        button.classList.toggle(
            "cwInsertClipArtActive"
        );



    },
    false
);



})();








/* =========================================================
   CAMPUS WORD — INSERT CLIP ART ENGINE
   STEP 2
   WORD STYLE CLIP ART GALLERY
   COLOR SVG COLLECTION
   CATEGORIES
   ISOLATED MODULE
   TARGET ONLY INSERT CLIPART BUTTON
   NO IMAGE / SHAPE / TABLE / CARET INTERFERENCE
========================================================= */

(function(){


let clipArtOpen = false;




const clipArts = [

{
name:"Smile",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#facc15"/>
<circle cx="35" cy="40" r="6" fill="#111827"/>
<circle cx="65" cy="40" r="6" fill="#111827"/>
<path d="M30 60 Q50 80 70 60"
stroke="#111827"
stroke-width="6"
fill="none"/>
</svg>`
},




{
name:"Teacher",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="28" r="18" fill="#facc15"/>
<rect x="32" y="48" width="36" height="35" rx="8" fill="#2563eb"/>
<rect x="20" y="60" width="20" height="5" fill="#111827"/>
<rect x="60" y="60" width="20" height="5" fill="#111827"/>
</svg>`
},


{
name:"Doctor",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="17" fill="#fde68a"/>
<rect x="30" y="45" width="40" height="40" rx="8" fill="#ffffff"/>
<rect x="45" y="55" width="10" height="25" fill="#ef4444"/>
<rect x="38" y="62" width="24" height="10" fill="#ef4444"/>
</svg>`
},


{
name:"Student",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="30" r="17" fill="#fcd34d"/>
<path d="M25 70 Q50 45 75 70V90H25Z" fill="#22c55e"/>
<path d="M35 15L50 5L65 15" fill="#111827"/>
</svg>`
},


{
name:"Chef",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="32" r="16" fill="#fde68a"/>
<path d="M30 30Q30 5 50 20Q70 5 70 30Z" fill="#ffffff"/>
<rect x="32" y="50" width="36" height="40" fill="#f97316"/>
</svg>`
},


{
name:"Artist",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="17" fill="#fcd34d"/>
<rect x="30" y="45" width="40" height="40" rx="10" fill="#a855f7"/>
<circle cx="75" cy="65" r="10" fill="#ef4444"/>
</svg>`
},


{
name:"Singer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="17" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#ec4899"/>
<circle cx="75" cy="55" r="8" fill="#111827"/>
</svg>`
},


{
name:"Builder",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<rect x="32" y="45" width="36" height="40" fill="#f59e0b"/>
<rect x="15" y="55" width="15" height="8" fill="#6b7280"/>
</svg>`
},


{
name:"Baby",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="35" r="25" fill="#fde68a"/>
<circle cx="42" cy="32" r="4" fill="#111827"/>
<circle cx="58" cy="32" r="4" fill="#111827"/>
<path d="M35 55Q50 65 65 55" stroke="#111827" stroke-width="4" fill="none"/>
</svg>`
},


{
name:"Family",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="30" cy="25" r="12" fill="#facc15"/>
<circle cx="70" cy="25" r="12" fill="#facc15"/>
<circle cx="50" cy="45" r="10" fill="#fde68a"/>
<rect x="20" y="45" width="20" height="35" fill="#2563eb"/>
<rect x="60" y="45" width="20" height="35" fill="#ec4899"/>
</svg>`
},


{
name:"Business Person",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<rect x="30" y="45" width="40" height="40" fill="#1e3a8a"/>
<rect x="45" y="50" width="10" height="30" fill="#ffffff"/>
</svg>`
},


{
name:"Scientist",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#10b981"/>
<circle cx="75" cy="65" r="10" fill="#60a5fa"/>
</svg>`
},


{
name:"Gamer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="25" y="45" width="50" height="35" rx="15" fill="#111827"/>
<circle cx="40" cy="62" r="5" fill="#22c55e"/>
<circle cx="60" cy="62" r="5" fill="#ef4444"/>
</svg>`
},


{
name:"Athlete",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="20" r="15" fill="#fde68a"/>
<path d="M30 45L70 45L80 85H20Z" fill="#2563eb"/>
<circle cx="80" cy="25" r="10" fill="#f97316"/>
</svg>`
},


{
name:"Traveler",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#9333ea"/>
<rect x="70" y="55" width="15" height="25" fill="#92400e"/>
</svg>`
},


{
name:"Police",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="30" r="16" fill="#fde68a"/>
<path d="M30 20H70L60 10H40Z" fill="#1e40af"/>
<rect x="32" y="48" width="36" height="38" fill="#1d4ed8"/>
</svg>`
},


{
name:"Pilot",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#e5e7eb"/>
<path d="M35 55H65" stroke="#2563eb" stroke-width="5"/>
</svg>`
},


{
name:"Astronaut",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="30" r="22" fill="#e5e7eb"/>
<circle cx="50" cy="30" r="12" fill="#60a5fa"/>
<rect x="32" y="55" width="36" height="35" fill="#ffffff"/>
</svg>`
},


{
name:"Worker",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<path d="M25 20H75L65 10H35Z" fill="#f59e0b"/>
<rect x="32" y="45" width="36" height="40" fill="#6b7280"/>
</svg>`
},


{
name:"Couple",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="30" r="14" fill="#facc15"/>
<circle cx="65" cy="30" r="14" fill="#fde68a"/>
<rect x="22" y="48" width="26" height="35" fill="#ec4899"/>
<rect x="52" y="48" width="26" height="35" fill="#2563eb"/>
</svg>`
},


{
name:"Architect",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" rx="8" fill="#475569"/>
<rect x="70" y="55" width="18" height="25" fill="#94a3b8"/>
<path d="M75 50L85 40" stroke="#111827" stroke-width="4"/>
</svg>`
},


{
name:"Nurse",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<path d="M35 20H65" stroke="#ffffff" stroke-width="6"/>
<rect x="32" y="45" width="36" height="40" fill="#ffffff"/>
<path d="M50 55V75M40 65H60" stroke="#ef4444" stroke-width="5"/>
</svg>`
},


{
name:"Mechanic",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<path d="M30 20H70L60 10H40Z" fill="#f59e0b"/>
<rect x="32" y="45" width="36" height="40" fill="#334155"/>
<circle cx="75" cy="65" r="10" fill="#64748b"/>
</svg>`
},


{
name:"Developer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#2563eb"/>
<path d="M40 60L30 70L40 80M60 60L70 70L60 80" 
stroke="#ffffff" stroke-width="4" fill="none"/>
</svg>`
},


{
name:"Manager",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#1e3a8a"/>
<rect x="45" y="50" width="10" height="25" fill="#ffffff"/>
<circle cx="75" cy="65" r="8" fill="#facc15"/>
</svg>`
},


{
name:"Football Player",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="20" r="15" fill="#facc15"/>
<path d="M30 45H70L80 85H20Z" fill="#16a34a"/>
<circle cx="80" cy="25" r="10" fill="#ffffff"/>
</svg>`
},


{
name:"Painter",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#a855f7"/>
<path d="M75 50L90 65" stroke="#92400e" stroke-width="5"/>
<circle cx="75" cy="45" r="8" fill="#f97316"/>
</svg>`
},


{
name:"Security Guard",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<path d="M30 20H70L60 10H40Z" fill="#111827"/>
<rect x="32" y="45" width="36" height="40" fill="#475569"/>
</svg>`
},


{
name:"Waiter",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#ffffff"/>
<rect x="42" y="50" width="16" height="30" fill="#111827"/>
<circle cx="75" cy="65" r="8" fill="#facc15"/>
</svg>`
},


{
name:"Dentist",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#38bdf8"/>
<path d="M75 55L85 70" stroke="#ffffff" stroke-width="5"/>
<circle cx="85" cy="75" r="5" fill="#ffffff"/>
</svg>`
},


{
name:"Astronomy Student",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#4338ca"/>
<circle cx="75" cy="60" r="10" fill="#facc15"/>
</svg>`
},


{
name:"Veterinarian",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<rect x="32" y="45" width="36" height="40" fill="#22c55e"/>
<circle cx="75" cy="65" r="10" fill="#f97316"/>
</svg>`
},


{
name:"Journalist",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#64748b"/>
<rect x="70" y="55" width="20" height="15" fill="#111827"/>
</svg>`
},


{
name:"Business Woman",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#db2777"/>
<rect x="45" y="50" width="10" height="25" fill="#ffffff"/>
</svg>`
},


{
name:"Explorer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<path d="M30 20H70L60 10H40Z" fill="#16a34a"/>
<rect x="32" y="45" width="36" height="40" fill="#92400e"/>
</svg>`
},


{
name:"Teacher Man",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<rect x="32" y="45" width="36" height="40" fill="#2563eb"/>
<rect x="70" y="55" width="20" height="5" fill="#111827"/>
</svg>`
},


{
name:"Robot Assistant",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="30" r="25" fill="#cbd5e1"/>
<circle cx="42" cy="30" r="5" fill="#2563eb"/>
<circle cx="58" cy="30" r="5" fill="#2563eb"/>
<rect x="35" y="60" width="30" height="25" fill="#64748b"/>
</svg>`
},


{
name:"Fashion Designer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#ec4899"/>
<circle cx="75" cy="65" r="10" fill="#22c55e"/>
</svg>`
},


{
name:"Researcher",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#0f766e"/>
<circle cx="75" cy="65" r="9" fill="#60a5fa"/>
</svg>`
},


{
name:"Engineer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" rx="8" fill="#64748b"/>
<rect x="20" y="55" width="12" height="8" fill="#f97316"/>
<circle cx="75" cy="65" r="10" fill="#38bdf8"/>
</svg>`
},


{
name:"Teacher Woman",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="17" fill="#fcd34d"/>
<path d="M35 20 Q50 5 65 20" fill="#7c2d12"/>
<rect x="30" y="45" width="40" height="40" rx="10" fill="#ec4899"/>
<rect x="70" y="55" width="15" height="5" fill="#111827"/>
</svg>`
},


{
name:"Musician",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<rect x="32" y="45" width="36" height="40" fill="#8b5cf6"/>
<circle cx="75" cy="55" r="8" fill="#111827"/>
<path d="M78 45V25" stroke="#111827" stroke-width="4"/>
</svg>`
},


{
name:"Photographer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#334155"/>
<rect x="65" y="55" width="25" height="15" fill="#111827"/>
<circle cx="78" cy="62" r="5" fill="#38bdf8"/>
</svg>`
},


{
name:"Doctor Woman",
category:"People",
svg:`
<svg viewBox="0 100 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#ffffff"/>
<path d="M50 55V75M40 65H60" stroke="#ef4444" stroke-width="6"/>
</svg>`
},


{
name:"Firefighter",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#facc15"/>
<path d="M30 20H70L60 10H40Z" fill="#dc2626"/>
<rect x="32" y="45" width="36" height="40" fill="#ef4444"/>
<circle cx="75" cy="70" r="8" fill="#f97316"/>
</svg>`
},


{
name:"Student Girl",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<path d="M30 20Q50 0 70 20" fill="#1f2937"/>
<rect x="32" y="45" width="36" height="40" fill="#14b8a6"/>
<path d="M20 70H80" stroke="#2563eb" stroke-width="4"/>
</svg>`
},


{
name:"Designer",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fcd34d"/>
<rect x="32" y="45" width="36" height="40" fill="#f43f5e"/>
<circle cx="75" cy="60" r="10" fill="#22c55e"/>
<circle cx="75" cy="60" r="4" fill="#ffffff"/>
</svg>`
},


{
name:"Scientist Woman",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="25" r="16" fill="#fde68a"/>
<rect x="32" y="45" width="36" height="40" fill="#0ea5e9"/>
<path d="M75 55L85 75H65Z" fill="#22c55e"/>
</svg>`
},


{
name:"Cook",
category:"People",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="30" r="16" fill="#facc15"/>
<path d="M30 25Q50 5 70 25" fill="#ffffff"/>
<rect x="32" y="50" width="36" height="35" fill="#f97316"/>
</svg>`
},




{
name:"Star",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 5 L61 37 L95 37 L67 57 L78 92 L50 72 L22 92 L33 57 L5 37 L39 37Z"
fill="#f97316"/>
</svg>`
},


{
name:"Heart",
category:"Love",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 85 C20 60 5 40 20 20 C35 5 50 25 50 25 C50 25 65 5 80 20 C95 40 80 60 50 85Z"
fill="#ef4444"/>
</svg>`
},


{
name:"Cloud",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 70 H75 C95 70 95 40 75 40 C70 15 35 15 30 40 C10 40 10 70 25 70Z"
fill="#60a5fa"/>
</svg>`
},


{
name:"Flower",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="15" fill="#facc15"/>
<circle cx="50" cy="20" r="18" fill="#ec4899"/>
<circle cx="80" cy="50" r="18" fill="#ec4899"/>
<circle cx="50" cy="80" r="18" fill="#ec4899"/>
<circle cx="20" cy="50" r="18" fill="#ec4899"/>
</svg>`
},



{
name:"Wild Forest",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<defs>
<linearGradient id="wildForest">
<stop stop-color="#15803d"/>
<stop offset="1" stop-color="#064e3b"/>
</linearGradient>
</defs>
<rect y="70" width="100" height="30" fill="#65a30d"/>
<path d="M20 80L35 25L50 80Z" fill="url(#wildForest)"/>
<path d="M50 80L70 15L90 80Z" fill="#166534"/>
<circle cx="25" cy="20" r="8" fill="#facc15"/>
</svg>`
},


{
name:"Palm Beach",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="60" width="100" height="40" fill="#38bdf8"/>
<path d="M0 70Q50 50 100 70V100H0Z" fill="#fde68a"/>
<rect x="48" y="25" width="7" height="45" fill="#92400e"/>
<path d="M50 30Q20 10 10 25M50 30Q80 10 90 25" fill="#16a34a"/>
</svg>`
},


{
name:"Rainforest",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="100" fill="#0f766e"/>
<circle cx="25" cy="35" r="25" fill="#166534"/>
<circle cx="70" cy="40" r="30" fill="#15803d"/>
<path d="M50 20V90" stroke="#78350f" stroke-width="8"/>
<path d="M20 80Q50 60 80 80" fill="#22c55e"/>
</svg>`
},


{
name:"Golden Sunflower",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="15" fill="#78350f"/>
<circle cx="50" cy="20" r="18" fill="#facc15"/>
<circle cx="25" cy="45" r="18" fill="#fbbf24"/>
<circle cx="75" cy="45" r="18" fill="#fbbf24"/>
<circle cx="50" cy="70" r="18" fill="#facc15"/>
<rect x="47" y="60" width="6" height="35" fill="#166534"/>
</svg>`
},


{
name:"River Valley",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M0 60L35 15L70 60Z" fill="#64748b"/>
<path d="M100 60L70 20L40 60Z" fill="#475569"/>
<path d="M45 60Q50 85 55 100H45Z" fill="#0ea5e9"/>
</svg>`
},


{
name:"Night Forest",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="100" fill="#0f172a"/>
<circle cx="75" cy="20" r="12" fill="#fef3c7"/>
<path d="M20 90L40 25L60 90Z" fill="#14532d"/>
<path d="M60 90L80 35L100 90Z" fill="#166534"/>
</svg>`
},


{
name:"Desert Cactus",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="100" fill="#fed7aa"/>
<circle cx="80" cy="20" r="15" fill="#f97316"/>
<rect x="45" y="35" width="12" height="55" rx="8" fill="#16a34a"/>
<rect x="25" y="50" width="20" height="10" fill="#22c55e"/>
</svg>`
},


{
name:"Ice Mountain",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M5 90L50 10L95 90Z" fill="#94a3b8"/>
<path d="M50 10L35 40H65Z" fill="#ffffff"/>
<path d="M20 90H80" stroke="#38bdf8" stroke-width="5"/>
</svg>`
},


{
name:"Green Valley",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M0 80Q30 30 60 80Q80 40 100 80V100H0Z" fill="#22c55e"/>
<circle cx="20" cy="20" r="10" fill="#facc15"/>
<path d="M50 100Q50 60 50 40" stroke="#166534" stroke-width="5"/>
</svg>`
},


{
name:"Blue Butterfly",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="30" cy="45" rx="25" ry="18" fill="#2563eb"/>
<ellipse cx="70" cy="45" rx="25" ry="18" fill="#38bdf8"/>
<rect x="48" y="35" width="4" height="35" fill="#111827"/>
</svg>`
},


{
name:"Apple Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="55" width="10" height="35" fill="#92400e"/>
<circle cx="50" cy="35" r="30" fill="#16a34a"/>
<circle cx="35" cy="35" r="5" fill="#ef4444"/>
<circle cx="65" cy="45" r="5" fill="#ef4444"/>
</svg>`
},


{
name:"Fog Mountain",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 80L50 20L90 80Z" fill="#64748b"/>
<path d="M0 55Q50 40 100 55" stroke="#e2e8f0" stroke-width="8"/>
</svg>`
},


{
name:"Green Bamboo",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="10" width="10" height="80" fill="#16a34a"/>
<path d="M20 30L45 45M80 25L55 45" stroke="#22c55e" stroke-width="8"/>
<circle cx="30" cy="20" r="8" fill="#4ade80"/>
</svg>`
},


{
name:"Tropical Island",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="80" rx="45" ry="15" fill="#38bdf8"/>
<path d="M25 75Q50 25 75 75Z" fill="#22c55e"/>
<rect x="48" y="40" width="5" height="35" fill="#92400e"/>
</svg>`
},


{
name:"Wild Flower Field",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="60" width="100" height="40" fill="#65a30d"/>
<circle cx="20" cy="55" r="8" fill="#ec4899"/>
<circle cx="50" cy="45" r="10" fill="#facc15"/>
<circle cx="80" cy="55" r="8" fill="#8b5cf6"/>
</svg>`
},


{
name:"Crystal Lake",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="60" width="100" height="40" fill="#0284c7"/>
<path d="M15 60L45 20L75 60Z" fill="#94a3b8"/>
<path d="M45 20L55 35L35 35Z" fill="#ffffff"/>
</svg>`
},


{
name:"Storm Ocean",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="100" fill="#334155"/>
<path d="M0 70Q50 45 100 70" fill="#0369a1"/>
<path d="M50 20L40 55H60Z" fill="#facc15"/>
</svg>`
},


{
name:"Ancient Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="42" y="45" width="16" height="45" fill="#78350f"/>
<circle cx="50" cy="30" r="35" fill="#14532d"/>
<path d="M50 50Q30 70 20 80" stroke="#92400e" stroke-width="6"/>
</svg>`
},


{
name:"Peace Garden",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="70" width="100" height="30" fill="#22c55e"/>
<circle cx="30" cy="45" r="15" fill="#f472b6"/>
<circle cx="70" cy="45" r="15" fill="#facc15"/>
<path d="M50 70V40" stroke="#166534" stroke-width="5"/>
</svg>`
},




{
name:"Forest",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<defs>
<linearGradient id="forestA" x2="0" y2="1">
<stop stop-color="#15803d"/>
<stop offset="1" stop-color="#052e16"/>
</linearGradient>
</defs>
<rect y="70" width="100" height="30" fill="#65a30d"/>
<path d="M25 80L40 25L55 80Z" fill="url(#forestA)"/>
<path d="M50 80L70 20L90 80Z" fill="#166534"/>
</svg>`
},


{
name:"Realistic Flower",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<defs>
<radialGradient id="flowerA">
<stop stop-color="#fda4af"/>
<stop offset="1" stop-color="#be123c"/>
</radialGradient>
</defs>
<circle cx="50" cy="50" r="12" fill="#facc15"/>
<circle cx="50" cy="25" r="22" fill="url(#flowerA)"/>
<circle cx="25" cy="50" r="22" fill="url(#flowerA)"/>
<circle cx="75" cy="50" r="22" fill="url(#flowerA)"/>
<circle cx="50" cy="75" r="22" fill="url(#flowerA)"/>
<rect x="47" y="65" width="6" height="30" fill="#166534"/>
</svg>`
},


{
name:"Desert",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<defs>
<linearGradient id="skyD">
<stop stop-color="#38bdf8"/>
<stop offset="1" stop-color="#fef3c7"/>
</linearGradient>
</defs>
<rect width="100" height="100" fill="url(#skyD)"/>
<path d="M0 80Q50 40 100 80V100H0Z" fill="#d97706"/>
<path d="M45 70V35Q50 25 55 35V70" fill="#16a34a"/>
</svg>`
},


{
name:"Lake",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="55" width="100" height="45" fill="#0ea5e9"/>
<path d="M20 55L50 15L80 55Z" fill="#475569"/>
<path d="M40 30L50 15L60 30Z" fill="#ffffff"/>
<path d="M15 75Q50 65 85 75" stroke="#bae6fd" stroke-width="4" fill="none"/>
</svg>`
},


{
name:"Cherry Blossom",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="47" y="35" width="6" height="55" fill="#78350f"/>
<path d="M50 40Q20 20 10 45M50 40Q80 20 90 45" 
stroke="#92400e" stroke-width="5"/>
<circle cx="25" cy="30" r="10" fill="#f9a8d4"/>
<circle cx="75" cy="30" r="10" fill="#f9a8d4"/>
<circle cx="50" cy="20" r="10" fill="#fbcfe8"/>
</svg>`
},


{
name:"Lightning Storm",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 45Q50 15 80 45" fill="#475569"/>
<path d="M55 45L40 75H55L45 95L75 55H60Z" fill="#facc15"/>
</svg>`
},


{
name:"Water Lily",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="70" rx="35" ry="12" fill="#22c55e"/>
<circle cx="50" cy="55" r="18" fill="#f9a8d4"/>
<circle cx="50" cy="55" r="7" fill="#facc15"/>
</svg>`
},


{
name:"Coral Reef",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="65" width="100" height="35" fill="#0ea5e9"/>
<path d="M30 85V45M50 85V35M70 85V50"
stroke="#f97316" stroke-width="8"/>
<circle cx="25" cy="30" r="8" fill="#38bdf8"/>
</svg>`
},


{
name:"Eagle",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="55" rx="25" ry="15" fill="#92400e"/>
<circle cx="50" cy="35" r="12" fill="#fef3c7"/>
<path d="M25 55L5 40M75 55L95 40" stroke="#451a03" stroke-width="8"/>
</svg>`
},


{
name:"Deer",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="35" r="18" fill="#a16207"/>
<rect x="45" y="50" width="10" height="35" fill="#92400e"/>
<path d="M40 20L30 5M60 20L70 5" stroke="#78350f" stroke-width="4"/>
</svg>`
},


{
name:"Pond",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="70" rx="40" ry="20" fill="#0284c7"/>
<circle cx="30" cy="65" r="8" fill="#22c55e"/>
<circle cx="70" cy="65" r="8" fill="#22c55e"/>
<path d="M50 60L50 35" stroke="#166534" stroke-width="5"/>
</svg>`
},


{
name:"Green Hills",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M0 80Q25 35 50 80Q75 35 100 80V100H0Z" fill="#22c55e"/>
<circle cx="70" cy="25" r="15" fill="#facc15"/>
<rect y="80" width="100" height="20" fill="#16a34a"/>
</svg>`
},


{
name:"Autumn Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="55" width="10" height="35" fill="#78350f"/>
<circle cx="50" cy="35" r="30" fill="#ea580c"/>
<circle cx="30" cy="45" r="15" fill="#f59e0b"/>
<circle cx="70" cy="45" r="15" fill="#dc2626"/>
</svg>`
},


{
name:"Snow Forest",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10L20 80H80Z" fill="#166534"/>
<path d="M50 10L40 35H60Z" fill="#ffffff"/>
<rect x="47" y="80" width="6" height="15" fill="#78350f"/>
</svg>`
},


{
name:"Hot Spring",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="70" rx="35" ry="15" fill="#38bdf8"/>
<path d="M35 45Q25 30 40 15M60 45Q50 30 65 15"
stroke="#ffffff" stroke-width="5" fill="none"/>
</svg>`
},


{
name:"Field",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="50" width="100" height="50" fill="#84cc16"/>
<path d="M0 50Q50 20 100 50" fill="#16a34a"/>
<circle cx="80" cy="20" r="12" fill="#facc15"/>
</svg>`
},


{
name:"Cave",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 90Q20 10 80 20Q95 50 90 90Z" fill="#334155"/>
<ellipse cx="55" cy="70" rx="20" ry="25" fill="#020617"/>
</svg>`
},


{
name:"Ocean Sunset",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="35" r="20" fill="#fb923c"/>
<rect y="55" width="100" height="45" fill="#0369a1"/>
<path d="M0 70Q50 60 100 70" stroke="#fef3c7" stroke-width="3"/>
</svg>`
},


{
name:"Tropical Flower",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="15" fill="#facc15"/>
<ellipse cx="50" cy="20" rx="18" ry="25" fill="#fb7185"/>
<ellipse cx="20" cy="45" rx="18" ry="25" fill="#f472b6"/>
<ellipse cx="80" cy="45" rx="18" ry="25" fill="#c084fc"/>
<rect x="47" y="55" width="6" height="35" fill="#166534"/>
</svg>`
},








{
name:"Realistic Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<defs>
<linearGradient id="tree1"><stop stop-color="#22c55e"/><stop offset="1" stop-color="#166534"/></linearGradient>
</defs>
<rect x="45" y="55" width="10" height="35" fill="#78350f"/>
<circle cx="50" cy="35" r="30" fill="url(#tree1)"/>
<circle cx="30" cy="45" r="18" fill="#16a34a"/>
<circle cx="70" cy="45" r="18" fill="#15803d"/>
</svg>`
},


{
name:"Mountain",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M5 85L45 20L95 85Z" fill="#64748b"/>
<path d="M35 35L45 20L55 35Z" fill="#ffffff"/>
<path d="M25 85L55 45L90 85Z" fill="#94a3b8"/>
</svg>`
},


{
name:"Rainbow",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M15 70A35 35 0 0175 70" stroke="#ef4444" stroke-width="10" fill="none"/>
<path d="M20 70A30 30 0 0770 70" stroke="#facc15" stroke-width="8" fill="none"/>
<path d="M25 70A25 25 0 0665 70" stroke="#22c55e" stroke-width="7" fill="none"/>
</svg>`
},


{
name:"Waterfall",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 30Q50 5 90 30L75 90H25Z" fill="#475569"/>
<path d="M45 25H65V85H45Z" fill="#38bdf8"/>
<path d="M48 35H62" stroke="#e0f2fe" stroke-width="4"/>
</svg>`
},


{
name:"Palm Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="35" width="10" height="55" fill="#92400e"/>
<path d="M50 35Q10 20 20 10Q50 20 50 35Q80 10 90 20Q70 45 50 35Z" fill="#16a34a"/>
</svg>`
},


{
name:"Sunset",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="25" fill="#f97316"/>
<path d="M5 80H95" stroke="#7c2d12" stroke-width="5"/>
<path d="M20 65Q50 45 80 65" fill="#fb7185"/>
</svg>`
},


{
name:"Butterfly",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="35" cy="45" rx="25" ry="18" fill="#ec4899"/>
<ellipse cx="65" cy="45" rx="25" ry="18" fill="#8b5cf6"/>
<rect x="48" y="35" width="4" height="35" fill="#111827"/>
</svg>`
},


{
name:"Rose",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="40" r="25" fill="#dc2626"/>
<circle cx="40" cy="35" r="12" fill="#fb7185"/>
<rect x="47" y="60" width="6" height="30" fill="#166534"/>
</svg>`
},


{
name:"Ocean Wave",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M5 60Q40 20 95 55Q60 85 5 60Z" fill="#0284c7"/>
<path d="M20 55Q50 35 80 55" stroke="#e0f2fe" stroke-width="6" fill="none"/>
</svg>`
},


{
name:"Volcano",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 90L45 25H55L80 90Z" fill="#78350f"/>
<path d="M45 25Q50 5 55 25" stroke="#ef4444" stroke-width="8"/>
</svg>`
},


{
name:"Leaf",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 90Q10 50 50 10Q90 50 50 90Z" fill="#16a34a"/>
<path d="M50 80V20" stroke="#14532d" stroke-width="4"/>
</svg>`
},


{
name:"Pine Tree",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="65" width="10" height="25" fill="#78350f"/>
<path d="M50 10L15 70H85Z" fill="#166534"/>
<path d="M50 30L20 80H80Z" fill="#15803d"/>
</svg>`
},


{
name:"Cactus",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect x="40" y="20" width="20" height="70" rx="10" fill="#22c55e"/>
<rect x="20" y="45" width="20" height="10" fill="#16a34a"/>
<rect x="60" y="35" width="20" height="10" fill="#16a34a"/>
</svg>`
},


{
name:"Moon Night",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#fef3c7"/>
<circle cx="65" cy="35" r="30" fill="#0f172a"/>
<circle cx="25" cy="20" r="3" fill="#ffffff"/>
</svg>`
},


{
name:"Snow Mountain",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 90L50 15L90 90Z" fill="#64748b"/>
<path d="M50 15L65 45L35 45Z" fill="#ffffff"/>
</svg>`
},


{
name:"Rain Cloud",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 55Q20 25 50 35Q80 20 85 55Z" fill="#64748b"/>
<path d="M35 60V85M50 60V90M65 60V85" stroke="#38bdf8" stroke-width="5"/>
</svg>`
},


{
name:"Frog",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="60" rx="35" ry="25" fill="#22c55e"/>
<circle cx="35" cy="35" r="10" fill="#86efac"/>
<circle cx="65" cy="35" r="10" fill="#86efac"/>
</svg>`
},


{
name:"Ocean Island",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="75" rx="40" ry="15" fill="#38bdf8"/>
<path d="M25 70Q50 30 75 70Z" fill="#16a34a"/>
<rect x="48" y="45" width="4" height="25" fill="#92400e"/>
</svg>`
},


{
name:"Garden",
category:"Nature",
svg:`
<svg viewBox="0 0 100 100">
<rect y="70" width="100" height="30" fill="#22c55e"/>
<circle cx="30" cy="45" r="15" fill="#ec4899"/>
<circle cx="70" cy="45" r="15" fill="#facc15"/>
<rect x="48" y="45" width="4" height="35" fill="#166534"/>
</svg>`
},







{
name:"Camera",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="30" width="70" height="45" rx="8" fill="#374151"/>
<circle cx="50" cy="52" r="15" fill="#38bdf8"/>
<rect x="35" y="20" width="30" height="10" fill="#111827"/>
</svg>`
},






{
name:"House",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M15 45L50 15L85 45V85H15Z" fill="#ef4444"/>
<rect x="40" y="55" width="20" height="30" fill="#92400e"/>
<rect x="25" y="50" width="15" height="15" fill="#60a5fa"/>
</svg>`
},


{
name:"Car Key",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="45" r="18" fill="#facc15"/>
<rect x="50" y="40" width="35" height="10" fill="#9ca3af"/>
<rect x="70" y="50" width="8" height="15" fill="#9ca3af"/>
</svg>`
},


{
name:"Electric Fan",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="40" r="30" fill="#e5e7eb"/>
<circle cx="50" cy="40" r="8" fill="#111827"/>
<path d="M50 40L50 15M50 40L75 55M50 40L25 55"
stroke="#2563eb"
stroke-width="8"/>
<rect x="45" y="70" width="10" height="20" fill="#374151"/>
</svg>`
},


{
name:"Refrigerator",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="10" width="40" height="80" fill="#e5e7eb"/>
<line x1="30" y1="45" x2="70" y2="45" stroke="#9ca3af" stroke-width="3"/>
<rect x="60" y="25" width="5" height="15" fill="#111827"/>
</svg>`
},


{
name:"Washing Machine",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="15" width="60" height="70" rx="8" fill="#d1d5db"/>
<circle cx="50" cy="55" r="22" fill="#60a5fa"/>
<circle cx="50" cy="55" r="10" fill="#ffffff"/>
</svg>`
},


{
name:"Iron",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 70H80L60 35H35Z" fill="#2563eb"/>
<path d="M35 35Q50 10 70 35" fill="#9ca3af"/>
</svg>`
},


{
name:"Sewing Machine",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="55" width="60" height="15" fill="#374151"/>
<path d="M30 55V25H60V55" stroke="#2563eb" stroke-width="8" fill="none"/>
<circle cx="50" cy="55" r="8" fill="#ef4444"/>
</svg>`
},


{
name:"Toothbrush",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="45" y="25" width="10" height="60" fill="#22c55e"/>
<rect x="35" y="15" width="30" height="15" fill="#60a5fa"/>
</svg>`
},


{
name:"Soap Bottle",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="35" y="30" width="30" height="50" rx="8" fill="#38bdf8"/>
<rect x="45" y="15" width="10" height="15" fill="#111827"/>
</svg>`
},


{
name:"Backpack School",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="30" width="50" height="55" rx="12" fill="#f97316"/>
<path d="M35 30Q35 10 50 10Q65 10 65 30"
stroke="#111827"
stroke-width="7"
fill="none"/>
</svg>`
},


{
name:"Map",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M15 20L40 30L60 20L85 30V80L60 70L40 80L15 70Z"
fill="#22c55e"/>
<path d="M40 30V80M60 20V70"
stroke="#ffffff"
stroke-width="3"/>
</svg>`
},


{
name:"Compass",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#e5e7eb" stroke="#111827" stroke-width="4"/>
<path d="M50 25L65 60L35 45Z" fill="#ef4444"/>
</svg>`
},


{
name:"Binoculars",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="50" r="20" fill="#2563eb"/>
<circle cx="65" cy="50" r="20" fill="#2563eb"/>
<rect x="40" y="45" width="20" height="10" fill="#111827"/>
</svg>`
},


{
name:"Painting Brush",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 75L70 30" stroke="#92400e" stroke-width="10"/>
<path d="M65 35L85 15Q90 10 85 35Z" fill="#ef4444"/>
</svg>`
},


{
name:"Paint Palette",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 15Q15 15 15 55Q15 85 55 80Q80 75 80 45Q80 15 50 15Z" fill="#facc15"/>
<circle cx="35" cy="40" r="6" fill="#ef4444"/>
<circle cx="55" cy="30" r="6" fill="#2563eb"/>
<circle cx="65" cy="55" r="6" fill="#22c55e"/>
</svg>`
},


{
name:"Medicine Bottle",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="35" y="30" width="30" height="55" rx="5" fill="#ffffff" stroke="#9ca3af"/>
<rect x="40" y="15" width="20" height="15" fill="#ef4444"/>
<cross fill="#ef4444"/>
</svg>`
},


{
name:"Shopping Cart",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 25H35L45 65H80L90 40H40"
stroke="#374151"
stroke-width="6"
fill="none"/>
<circle cx="50" cy="80" r="8" fill="#111827"/>
<circle cx="75" cy="80" r="8" fill="#111827"/>
</svg>`
},


{
name:"Diamond",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10L85 40L50 90L15 40Z" fill="#38bdf8"/>
<path d="M15 40H85M50 10V90"
stroke="#ffffff"
stroke-width="3"/>
</svg>`
},


{
name:"Treasure Box",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="45" rx="8" fill="#92400e"/>
<path d="M20 35Q50 5 80 35" fill="#facc15"/>
<rect x="45" y="50" width="10" height="15" fill="#111827"/>
</svg>`
},




{
name:"Television",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="25" width="70" height="50" rx="5" fill="#111827"/>
<rect x="22" y="32" width="56" height="35" fill="#38bdf8"/>
<line x1="35" y1="15" x2="50" y2="25" stroke="#111827" stroke-width="4"/>
<line x1="65" y1="15" x2="50" y2="25" stroke="#111827" stroke-width="4"/>
</svg>`
},


{
name:"Printer",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="35" width="50" height="35" rx="5" fill="#6b7280"/>
<rect x="35" y="20" width="30" height="25" fill="#e5e7eb"/>
<rect x="35" y="65" width="30" height="20" fill="#ffffff"/>
<circle cx="70" cy="50" r="4" fill="#22c55e"/>
</svg>`
},


{
name:"Tablet",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="10" width="60" height="80" rx="8" fill="#1f2937"/>
<rect x="27" y="20" width="46" height="55" fill="#60a5fa"/>
<circle cx="50" cy="82" r="4" fill="#ffffff"/>
</svg>`
},


{
name:"Microphone",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="40" y="15" width="20" height="45" rx="10" fill="#374151"/>
<path d="M30 50Q30 80 50 80Q70 80 70 50"
stroke="#111827"
stroke-width="6"
fill="none"/>
<line x1="50" y1="80" x2="50" y2="95" stroke="#111827" stroke-width="6"/>
</svg>`
},


{
name:"Speaker",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="10" width="40" height="80" rx="5" fill="#111827"/>
<circle cx="50" cy="35" r="10" fill="#60a5fa"/>
<circle cx="50" cy="65" r="15" fill="#374151"/>
</svg>`
},


{
name:"Drone",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="35" y="35" width="30" height="25" fill="#2563eb"/>
<circle cx="20" cy="25" r="12" fill="#9ca3af"/>
<circle cx="80" cy="25" r="12" fill="#9ca3af"/>
<line x1="30" y1="35" x2="20" y2="25" stroke="#111827" stroke-width="4"/>
<line x1="70" y1="35" x2="80" y2="25" stroke="#111827" stroke-width="4"/>
</svg>`
},


{
name:"Car",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 60L30 35H70L80 60Z" fill="#ef4444"/>
<rect x="15" y="60" width="70" height="20" rx="5" fill="#dc2626"/>
<circle cx="30" cy="80" r="8" fill="#111827"/>
<circle cx="70" cy="80" r="8" fill="#111827"/>
</svg>`
},


{
name:"Bicycle",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="25" cy="70" r="18" fill="none" stroke="#2563eb" stroke-width="5"/>
<circle cx="75" cy="70" r="18" fill="none" stroke="#2563eb" stroke-width="5"/>
<path d="M25 70L50 35L75 70M50 35H65"
stroke="#111827"
stroke-width="5"
fill="none"/>
</svg>`
},


{
name:"Suitcase",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="30" width="50" height="50" rx="8" fill="#92400e"/>
<path d="M40 30V15H60V30" stroke="#111827" stroke-width="5" fill="none"/>
</svg>`
},


{
name:"Wallet",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="40" rx="5" fill="#16a34a"/>
<circle cx="65" cy="55" r="6" fill="#facc15"/>
</svg>`
},


{
name:"Camera Lens",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#111827"/>
<circle cx="50" cy="50" r="22" fill="#2563eb"/>
<circle cx="50" cy="50" r="10" fill="#38bdf8"/>
</svg>`
},


{
name:"Key Board Piano",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="10" y="30" width="80" height="40" fill="#ffffff" stroke="#111827" stroke-width="3"/>
${Array.from({length:8},(_,i)=>`
<rect x="${15+i*9}" y="30" width="5" height="25" fill="#111827"/>
`).join("")}
</svg>`
},


{
name:"Guitar",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="65" r="20" fill="#f97316"/>
<rect x="45" y="20" width="10" height="50" fill="#92400e"/>
<circle cx="40" cy="65" r="5" fill="#111827"/>
</svg>`
},


{
name:"Football",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#ffffff" stroke="#111827" stroke-width="4"/>
<path d="M50 30L65 40L60 60L40 60L35 40Z" fill="#111827"/>
</svg>`
},


{
name:"Basketball",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#f97316"/>
<path d="M15 50H85M50 15V85"
stroke="#111827"
stroke-width="4"/>
</svg>`
},


{
name:"Trophy",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M30 20H70V45Q70 70 50 70Q30 70 30 45Z" fill="#facc15"/>
<rect x="45" y="70" width="10" height="15" fill="#92400e"/>
</svg>`
},


{
name:"Keypad",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="15" width="60" height="70" rx="8" fill="#374151"/>
${Array.from({length:9},(_,i)=>`
<circle cx="${35+(i%3)*15}" cy="${35+Math.floor(i/3)*15}" r="4" fill="#ffffff"/>
`).join("")}
</svg>`
},


{
name:"Flashlight",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="35" y="35" width="30" height="45" fill="#374151"/>
<circle cx="50" cy="25" r="20" fill="#facc15"/>
</svg>`
},


{
name:"Laptop",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="20" width="60" height="40" rx="5" fill="#374151"/>
<rect x="25" y="25" width="50" height="30" fill="#60a5fa"/>
<path d="M10 65H90L80 75H20Z" fill="#9ca3af"/>
</svg>`
},


{
name:"Smartphone",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="10" width="40" height="80" rx="8" fill="#111827"/>
<rect x="35" y="20" width="30" height="55" fill="#38bdf8"/>
<circle cx="50" cy="82" r="4" fill="#ffffff"/>
</svg>`
},


{
name:"Watch",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="40" y="5" width="20" height="90" fill="#1f2937"/>
<circle cx="50" cy="50" r="25" fill="#e5e7eb"/>
<circle cx="50" cy="50" r="15" fill="#2563eb"/>
</svg>`
},


{
name:"Book",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 20Q50 10 50 30V80Q30 65 20 75Z" fill="#2563eb"/>
<path d="M50 30Q50 10 80 20V75Q70 65 50 80Z" fill="#60a5fa"/>
</svg>`
},


{
name:"Pen",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 75L70 30L80 40L35 85Z" fill="#2563eb"/>
<path d="M70 30L80 40" stroke="#111827" stroke-width="5"/>
</svg>`
},


{
name:"Camera",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="30" width="70" height="45" rx="8" fill="#374151"/>
<circle cx="50" cy="52" r="15" fill="#38bdf8"/>
<rect x="35" y="20" width="30" height="10" fill="#111827"/>
</svg>`
},


{
name:"Headphones",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M20 55V45Q20 15 50 15Q80 15 80 45V55"
stroke="#111827"
stroke-width="10"
fill="none"/>
<rect x="15" y="50" width="15" height="25" fill="#2563eb"/>
<rect x="70" y="50" width="15" height="25" fill="#2563eb"/>
</svg>`
},


{
name:"Keyboard",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="10" y="35" width="80" height="35" rx="5" fill="#9ca3af"/>
${Array.from({length:6},(_,i)=>`
<rect x="${18+i*12}" y="45" width="8" height="8" fill="#ffffff"/>
`).join("")}
</svg>`
},


{
name:"Mouse",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 15Q25 15 25 55Q25 85 50 85Q75 85 75 55Q75 15 50 15Z" fill="#d1d5db"/>
<line x1="50" y1="20" x2="50" y2="45" stroke="#111827" stroke-width="5"/>
</svg>`
},


{
name:"Chair",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="20" width="40" height="35" fill="#92400e"/>
<rect x="25" y="55" width="50" height="15" fill="#b45309"/>
<path d="M35 70V90M65 70V90" stroke="#111827" stroke-width="6"/>
</svg>`
},


{
name:"Table",
category:"Objects",
svg:`
<svg viewBox="0 100 100 100">
<rect x="15" y="35" width="70" height="15" fill="#92400e"/>
<path d="M25 50V85M75 50V85" stroke="#78350f" stroke-width="8"/>
</svg>`
},


{
name:"Key",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="30" cy="45" r="18" fill="#facc15"/>
<rect x="45" y="40" width="40" height="10" fill="#facc15"/>
<rect x="70" y="50" width="8" height="15" fill="#facc15"/>
</svg>`
},


{
name:"Lamp",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 45H75L60 15H40Z" fill="#facc15"/>
<rect x="45" y="45" width="10" height="35" fill="#374151"/>
<circle cx="50" cy="85" r="15" fill="#9ca3af"/>
</svg>`
},


{
name:"Backpack",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="30" width="50" height="55" rx="10" fill="#2563eb"/>
<path d="M35 30Q35 10 50 10Q65 10 65 30" stroke="#111827" stroke-width="8" fill="none"/>
</svg>`
},


{
name:"Glasses",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="50" r="18" fill="none" stroke="#111827" stroke-width="5"/>
<circle cx="65" cy="50" r="18" fill="none" stroke="#111827" stroke-width="5"/>
<line x1="53" y1="50" x2="47" y2="50" stroke="#111827" stroke-width="5"/>
</svg>`
},


{
name:"Coffee Cup",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="30" width="40" height="45" rx="5" fill="#92400e"/>
<path d="M70 40Q90 40 70 60" stroke="#92400e" stroke-width="8" fill="none"/>
</svg>`
},


{
name:"Umbrella",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 50Q50 10 90 50Z" fill="#ef4444"/>
<path d="M50 50V85Q50 95 60 85" stroke="#111827" stroke-width="5" fill="none"/>
</svg>`
},


{
name:"Clock",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#e5e7eb" stroke="#111827" stroke-width="5"/>
<line x1="50" y1="50" x2="50" y2="25" stroke="#111827" stroke-width="5"/>
<line x1="50" y1="50" x2="70" y2="60" stroke="#111827" stroke-width="5"/>
</svg>`
},


{
name:"Globe",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="35" fill="#60a5fa"/>
<path d="M20 50H80M50 15V85" stroke="#16a34a" stroke-width="8"/>
</svg>`
},



{
name:"Japan Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#ffffff"/>
<circle cx="50" cy="35" r="20" fill="#dc2626"/>
</svg>`
},


{
name:"Brazil Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#16a34a"/>
<path d="M50 10 L90 35 L50 60 L10 35Z" fill="#facc15"/>
<circle cx="50" cy="35" r="15" fill="#2563eb"/>
</svg>`
},


{
name:"Canada Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#ffffff"/>
<rect width="20" height="70" fill="#dc2626"/>
<rect x="80" width="20" height="70" fill="#dc2626"/>
<path d="M50 15L58 35H70L60 45L65 60L50 50L35 60L40 45L30 35H42Z" fill="#dc2626"/>
</svg>`
},


{
name:"Mexico Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="33" height="70" fill="#16a34a"/>
<rect x="33" width="34" height="70" fill="#ffffff"/>
<rect x="67" width="33" height="70" fill="#dc2626"/>
<circle cx="50" cy="35" r="5" fill="#a16207"/>
</svg>`
},


{
name:"Argentina Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="23" fill="#60a5fa"/>
<rect y="23" width="100" height="24" fill="#ffffff"/>
<rect y="47" width="100" height="23" fill="#60a5fa"/>
<circle cx="50" cy="35" r="6" fill="#facc15"/>
</svg>`
},


{
name:"Chile Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="35" fill="#ffffff"/>
<rect y="35" width="100" height="35" fill="#dc2626"/>
<rect width="35" height="35" fill="#2563eb"/>
<circle cx="17" cy="17" r="6" fill="#ffffff"/>
</svg>`
},


{
name:"Colombia Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="35" fill="#facc15"/>
<rect y="35" width="100" height="18" fill="#2563eb"/>
<rect y="53" width="100" height="17" fill="#dc2626"/>
</svg>`
},


{
name:"Peru Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="33" height="70" fill="#dc2626"/>
<rect x="33" width="34" height="70" fill="#ffffff"/>
<rect x="67" width="33" height="70" fill="#dc2626"/>
</svg>`
},


{
name:"Portugal Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="40" height="70" fill="#16a34a"/>
<rect x="40" width="60" height="70" fill="#dc2626"/>
<circle cx="40" cy="35" r="8" fill="#facc15"/>
</svg>`
},


{
name:"Greece Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#2563eb"/>
<path d="M0 15H100M0 35H100M0 55H100" stroke="#ffffff" stroke-width="8"/>
</svg>`
},


{
name:"Turkey Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#dc2626"/>
<circle cx="45" cy="35" r="18" fill="#ffffff"/>
<circle cx="52" cy="35" r="14" fill="#dc2626"/>
<circle cx="70" cy="35" r="5" fill="#ffffff"/>
</svg>`
},


{
name:"Saudi Arabia Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#16a34a"/>
<rect x="20" y="32" width="60" height="5" fill="#ffffff"/>
</svg>`
},


{
name:"South Africa Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#16a34a"/>
<path d="M0 0L45 35L0 70H25L70 35L25 0Z" fill="#facc15"/>
<path d="M0 10L40 35L0 60" fill="#111827"/>
</svg>`
},


{
name:"Nigeria Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="33" height="70" fill="#16a34a"/>
<rect x="33" width="34" height="70" fill="#ffffff"/>
<rect x="67" width="33" height="70" fill="#16a34a"/>
</svg>`
},


{
name:"Kenya Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="23" fill="#111827"/>
<rect y="23" width="100" height="24" fill="#ffffff"/>
<rect y="47" width="100" height="23" fill="#dc2626"/>
<path d="M50 15L65 35L50 55L35 35Z" fill="#ffffff"/>
</svg>`
},


{
name:"India Flag",
category:"Flags",
svg:`
<svg viewBox="0v100 100">
<rect width="100" height="23" fill="#f97316"/>
<rect y="23" width="100" height="24" fill="#ffffff"/>
<rect y="47" width="100" height="23" fill="#16a34a"/>
<circle cx="50" cy="35" r="7" fill="#2563eb"/>
</svg>`
},


{
name:"Australia Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#1d4ed8"/>
<circle cx="75" cy="20" r="5" fill="#ffffff"/>
<circle cx="65" cy="45" r="6" fill="#ffffff"/>
</svg>`
},


{
name:"South Korea Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#ffffff"/>
<circle cx="50" cy="35" r="15" fill="#dc2626"/>
<path d="M50 20A15 15 0 0 0 50 50A15 15 0 0 1 50 20" fill="#2563eb"/>
</svg>`
},


{
name:"Switzerland Flag",
category:"Flags",
svg:`
<svg viewBox="0 0 100 100">
<rect width="100" height="70" fill="#dc2626"/>
<rect x="42" y="15" width="16" height="40" fill="#ffffff"/>
<rect x="30" y="27" width="40" height="16" fill="#ffffff"/>
</svg>`
},







{
name:"Netherlands Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#dc2626"/>
<rect x="10" y="33" width="100" height="18" fill="#ffffff"/>
<rect x="10" y="51" width="100" height="19" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Netherlands</text>
</svg>`
},


{
name:"Norway Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#dc2626"/>
<rect x="35" y="15" width="14" height="55" fill="#ffffff"/>
<rect x="10" y="35" width="100" height="14" fill="#ffffff"/>
<rect x="39" y="15" width="7" height="55" fill="#2563eb"/>
<rect x="10" y="39" width="100" height="7" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Norway</text>
</svg>`
},


{
name:"Sweden Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#2563eb"/>
<rect x="40" y="15" width="12" height="55" fill="#facc15"/>
<rect x="10" y="36" width="100" height="12" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Sweden</text>
</svg>`
},


{
name:"Finland Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<rect x="38" y="15" width="15" height="55" fill="#2563eb"/>
<rect x="10" y="35" width="100" height="15" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Finland</text>
</svg>`
},


{
name:"Denmark Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#dc2626"/>
<rect x="35" y="15" width="12" height="55" fill="#ffffff"/>
<rect x="10" y="36" width="100" height="12" fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Denmark</text>
</svg>`
},


{
name:"Greece Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#2563eb"/>
<path d="M10 25H110M10 45H110M10 65H110"
stroke="#ffffff" stroke-width="5"/>
<rect x="10" y="15" width="30" height="30" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Greece</text>
</svg>`
},


{
name:"Turkey Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#dc2626"/>
<circle cx="55" cy="42" r="15" fill="#ffffff"/>
<circle cx="61" cy="42" r="12" fill="#dc2626"/>
<circle cx="75" cy="42" r="5" fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Turkey</text>
</svg>`
},


{
name:"Egypt Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#dc2626"/>
<rect x="10" y="33" width="100" height="18" fill="#ffffff"/>
<rect x="10" y="51" width="100" height="19" fill="#111827"/>
<circle cx="60" cy="42" r="5" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Egypt</text>
</svg>`
},


{
name:"Nigeria Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#16a34a"/>
<rect x="43" y="15" width="34" height="55" fill="#ffffff"/>
<rect x="77" y="15" width="33" height="55" fill="#16a34a"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Nigeria</text>
</svg>`
},


{
name:"Kenya Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#111827"/>
<rect x="10" y="33" width="100" height="18" fill="#dc2626"/>
<rect x="10" y="51" width="100" height="19" fill="#16a34a"/>
<circle cx="60" cy="42" r="8" fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Kenya</text>
</svg>`
},





{
name:"Mexico Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#16a34a"/>
<rect x="43" y="15" width="34" height="55" fill="#ffffff"/>
<rect x="77" y="15" width="33" height="55" fill="#dc2626"/>
<circle cx="60" cy="42" r="7" fill="#92400e"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Mexico
</text>
</svg>`
},


{
name:"China Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#dc2626"/>
<polygon points="30,25 34,35 45,35 36,42 39,52 30,46 21,52 24,42 15,35 26,35"
fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
China
</text>
</svg>`
},


{
name:"South Korea Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<circle cx="60" cy="42" r="15" fill="#ef4444"/>
<path d="M60 27A15 15 0 0 1 60 57A15 15 0 0 0 60 27"
fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
South Korea
</text>
</svg>`
},


{
name:"India Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#f97316"/>
<rect x="10" y="33" width="100" height="18" fill="#ffffff"/>
<rect x="10" y="51" width="100" height="19" fill="#16a34a"/>
<circle cx="60" cy="42" r="8" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
India
</text>
</svg>`
},


{
name:"Australia Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#1e40af"/>
<circle cx="85" cy="35" r="8" fill="#ffffff"/>
<polygon points="75,55 80,65 90,65 82,72 85,82 75,75 65,82 68,72 60,65 70,65"
fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Australia
</text>
</svg>`
},


{
name:"South Africa Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#16a34a"/>
<path d="M10 15L65 42L10 70Z" fill="#111827"/>
<path d="M10 15L65 42L10 70Z" fill="none" stroke="#facc15" stroke-width="8"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
South Africa
</text>
</svg>`
},


{
name:"Argentina Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#38bdf8"/>
<rect x="10" y="33" width="100" height="18" fill="#ffffff"/>
<rect x="10" y="51" width="100" height="19" fill="#38bdf8"/>
<circle cx="60" cy="42" r="7" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Argentina
</text>
</svg>`
},


{
name:"Portugal Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="40" height="55" fill="#16a34a"/>
<rect x="50" y="15" width="60" height="55" fill="#dc2626"/>
<circle cx="50" cy="42" r="10" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Portugal
</text>
</svg>`
},


{
name:"Belgium Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#111827"/>
<rect x="43" y="15" width="34" height="55" fill="#facc15"/>
<rect x="77" y="15" width="33" height="55" fill="#dc2626"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Belgium
</text>
</svg>`
},




















{
name:"Tool Box",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="40" rx="5" fill="#dc2626"/>
<path d="M35 35V20H65V35" stroke="#111827" stroke-width="6" fill="none"/>
</svg>`
},

{
name:"Gift",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="45" fill="#22c55e"/>
<rect x="45" y="35" width="10" height="45" fill="#facc15"/>
<rect x="20" y="25" width="60" height="15" fill="#16a34a"/>
</svg>`
}


];







function openClipArtGallery(){


if(clipArtOpen){

return;

}



clipArtOpen = true;



const box =
document.createElement(
"div"
);



box.className =
"cwClipArtGallery";




box.innerHTML = `

<div class="cwClipArtBox">


<h3>
Clip Art Gallery
</h3>



<div class="cwClipCategories">

<button>
All
</button>

<button>
People
</button>

<button>
Nature
</button>

<button>
Objects
</button>

<button>
Symbols
</button>

</div>




<div class="cwClipArtGrid">

${clipArts.map(item=>`

<div class="cwClipArtItem"
data-clipart="${item.name}">

${item.svg}

<span>
${item.name}
</span>

</div>

`).join("")}


</div>




<button id="cwClipArtClose">
Close
</button>



</div>

`;



document.body.appendChild(
box
);





document
.querySelectorAll(
    ".cwClipCategories button"
)
.forEach(
    function(button){


        button.onclick =
        function(){


            const category =
                this.textContent.trim();



            const grid =
                box.querySelector(
                    ".cwClipArtGrid"
                );



            if(!grid){

                return;

            }



            const list =
                category === "All"
                ?
                clipArts
                :
                clipArts.filter(
                    function(item){

                        return (
                            item.category === category
                        );

                    }
                );




            grid.innerHTML =
            list.map(item=>`


            <div class="cwClipArtItem"
            data-clipart="${item.name}">


            ${item.svg}


            <span>
            ${item.name}
            </span>


            </div>


            `).join("");



        };


    }
);








document
.getElementById(
"cwClipArtClose"
)
.onclick=function(){


box.remove();

clipArtOpen=false;


};




}









document.addEventListener(
"click",
function(e){


const button =
e.target.closest(
'[data-action="insert-clipart"]'
);



if(!button){

return;

}




e.preventDefault();

e.stopPropagation();



openClipArtGallery();



},
false
);



})();











/* =========================================================
   CAMPUS WORD — CLIP ART CATEGORY FILTER ENGINE
   FIX CATEGORY DISPLAY
   SHOW ALL CLIPART INSIDE SAME CATEGORY
   AUTO SUPPORT NEW CLIPART ADDITIONS
   ISOLATED MODULE
   NO GALLERY OPEN CONFLICT
   NO BUTTON CONFLICT
========================================================= */

(function(){



document.addEventListener(
    "click",
    function(e){



        const categoryButton =
            e.target.closest(
                ".cwClipCategories button"
            );



        if(!categoryButton){

            return;

        }



        const gallery =
            document.querySelector(
                ".cwClipArtGallery"
            );



        if(!gallery){

            return;

        }



        const grid =
            gallery.querySelector(
                ".cwClipArtGrid"
            );



        if(!grid){

            return;

        }





        const category =
            categoryButton.textContent
            .trim();






        e.preventDefault();





        if(category === "All"){


            grid.innerHTML =
                clipArts.map(item=>`


                <div class="cwClipArtItem"
                data-clipart="${item.name}">


                ${item.svg}


                <span>
                ${item.name}
                </span>


                </div>


                `).join("");



            return;

        }







        const filtered =
            clipArts.filter(
                function(item){


                    return (
                        item.category === category
                    );


                }
            );








        grid.innerHTML =
            filtered.map(item=>`


            <div class="cwClipArtItem"
            data-clipart="${item.name}">


            ${item.svg}


            <span>
            ${item.name}
            </span>


            </div>


            `).join("");





    },
    false
);



})();









