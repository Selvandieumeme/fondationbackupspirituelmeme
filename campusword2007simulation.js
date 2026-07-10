


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











;