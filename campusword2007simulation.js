


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
        selectedImage;



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
