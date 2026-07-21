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
name:"Star",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 5 L61 37 L95 37 L67 57 L78 92 L50 72 L22 92 L33 57 L5 37 L39 37Z"
fill="#f97316"/>
</svg>`
},




{
name:"Peace Symbol",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#60a5fa"/>
<path d="M50 15V85M50 50L25 20M50 50L75 20M50 50L25 80M50 50L75 80"
stroke="#ffffff"
stroke-width="6"
fill="none"/>
</svg>`
},


{
name:"Check Mark",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#22c55e"/>
<path d="M25 52L42 70L78 30"
stroke="#ffffff"
stroke-width="10"
fill="none"/>
</svg>`
},


{
name:"Warning",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="50,10 90,85 10,85"
fill="#facc15"/>
<rect x="46" y="35" width="8" height="28" fill="#111827"/>
<circle cx="50" cy="72" r="5" fill="#111827"/>
</svg>`
},


{
name:"Information",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#2563eb"/>
<circle cx="50" cy="28" r="6" fill="#ffffff"/>
<rect x="44" y="40" width="12" height="35" fill="#ffffff"/>
</svg>`
},


{
name:"Question Mark",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#8b5cf6"/>
<text x="50" y="70"
text-anchor="middle"
font-size="60"
fill="#ffffff">
?
</text>
</svg>`
},


{
name:"Lock",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="40" width="50" height="40" rx="8" fill="#374151"/>
<path d="M35 40V25Q50 5 65 25V40"
stroke="#111827"
stroke-width="8"
fill="none"/>
<circle cx="50" cy="60" r="6" fill="#ffffff"/>
</svg>`
},


{
name:"Star Badge",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="50,5 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38"
fill="#f97316"/>
<circle cx="50" cy="50" r="12" fill="#facc15"/>
</svg>`
},


{
name:"Lightning",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="55,5 20,55 45,55 35,95 80,40 55,40"
fill="#facc15"/>
</svg>`
},


{
name:"Fire",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 90Q15 65 45 20Q50 45 65 25Q90 65 50 90Z"
fill="#ef4444"/>
<path d="M50 75Q35 60 50 40Q65 60 50 75Z"
fill="#facc15"/>
</svg>`
},


{
name:"Crown",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M15 35L35 55L50 20L65 55L85 35L75 80H25Z"
fill="#facc15"/>
<circle cx="25" cy="75" r="5" fill="#ef4444"/>
<circle cx="50" cy="75" r="5" fill="#2563eb"/>
<circle cx="75" cy="75" r="5" fill="#22c55e"/>
</svg>`
},


{
name:"Diamond",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="50,5 90,50 50,95 10,50"
fill="#ec4899"/>
<polygon points="50,20 70,50 50,80 30,50"
fill="#ffffff"/>
</svg>`
},


{
name:"Globe",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#38bdf8"/>
<path d="M10 50H90M50 10V90"
stroke="#ffffff"
stroke-width="5"/>
<ellipse cx="50" cy="50" rx="20" ry="40"
stroke="#ffffff"
stroke-width="5"
fill="none"/>
</svg>`
},


{
name:"Target",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ef4444"/>
<circle cx="50" cy="50" r="25" fill="#ffffff"/>
<circle cx="50" cy="50" r="10" fill="#ef4444"/>
</svg>`
},


{
name:"Flag",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="15" width="6" height="70" fill="#111827"/>
<path d="M31 20H80L65 40L80 60H31Z"
fill="#2563eb"/>
</svg>`
},


{
name:"Magic Wand",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 75L75 25"
stroke="#8b5cf6"
stroke-width="10"/>
<polygon points="75,5 80,20 95,25 80,30 75,45 70,30 55,25 70,20"
fill="#facc15"/>
</svg>`
},


{
name:"Puzzle",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M30 25H55Q55 10 70 20Q85 30 70 45H85V75H55Q45 90 30 75Z"
fill="#22c55e"/>
</svg>`
},


{
name:"Rocket",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10Q85 25 60 75L40 75Q15 25 50 10Z"
fill="#ef4444"/>
<circle cx="50" cy="40" r="8" fill="#60a5fa"/>
<path d="M40 75L30 90M60 75L70 90"
stroke="#f97316"
stroke-width="6"/>
</svg>`
},


{
name:"Compass",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#111827" stroke-width="5"/>
<polygon points="50,20 65,60 35,60"
fill="#ef4444"/>
</svg>`
},


{
name:"Medal",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M35 10L50 40L65 10"
fill="#2563eb"/>
<circle cx="50" cy="60" r="25" fill="#facc15"/>
<text x="50" y="70"
text-anchor="middle"
font-size="30"
fill="#ffffff">
1
</text>
</svg>`
},





{
name:"Key",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="35" cy="45" r="20" fill="#facc15"/>
<circle cx="35" cy="45" r="8" fill="#ffffff"/>
<rect x="50" y="40" width="35" height="10" fill="#92400e"/>
<rect x="70" y="50" width="8" height="15" fill="#92400e"/>
</svg>`
},


{
name:"Shield",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10L85 25V55Q75 80 50 90Q25 80 15 55V25Z"
fill="#2563eb"/>
<path d="M35 50L47 62L70 35"
stroke="#ffffff"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Like",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M35 45L45 20Q55 10 60 25V45H80Q90 45 85 60L75 80H35Z"
fill="#3b82f6"/>
<rect x="20" y="45" width="15" height="35" fill="#2563eb"/>
</svg>`
},


{
name:"Dislike",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M35 55L45 80Q55 90 60 75V55H80Q90 55 85 40L75 20H35Z"
fill="#ef4444"/>
<rect x="20" y="20" width="15" height="35" fill="#dc2626"/>
</svg>`
},


{
name:"Bell",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 70H75Q65 55 65 35Q65 15 50 15Q35 15 35 35Q35 55 25 70Z"
fill="#facc15"/>
<circle cx="50" cy="82" r="8" fill="#111827"/>
</svg>`
},


{
name:"Eye",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 50Q50 10 90 50Q50 90 10 50Z"
fill="#60a5fa"/>
<circle cx="50" cy="50" r="18" fill="#ffffff"/>
<circle cx="50" cy="50" r="8" fill="#111827"/>
</svg>`
},


{
name:"Home",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="10,45 50,10 90,45"
fill="#ef4444"/>
<rect x="25" y="45" width="50" height="40" fill="#facc15"/>
<rect x="45" y="60" width="12" height="25" fill="#92400e"/>
</svg>`
},


{
name:"Phone",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="30" y="10" width="40" height="80" rx="8" fill="#111827"/>
<rect x="36" y="20" width="28" height="50" fill="#60a5fa"/>
<circle cx="50" cy="80" r="5" fill="#ffffff"/>
</svg>`
},


{
name:"Email",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="25" width="70" height="50" rx="5" fill="#2563eb"/>
<path d="M15 30L50 60L85 30"
stroke="#ffffff"
stroke-width="6"
fill="none"/>
</svg>`
},


{
name:"Calendar",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="25" width="60" height="60" fill="#ffffff" stroke="#111827" stroke-width="5"/>
<rect x="20" y="25" width="60" height="15" fill="#ef4444"/>
<line x1="35" y1="15" x2="35" y2="35" stroke="#111827" stroke-width="5"/>
<line x1="65" y1="15" x2="65" y2="35" stroke="#111827" stroke-width="5"/>
</svg>`
},


{
name:"Clock",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#111827" stroke-width="5"/>
<line x1="50" y1="50" x2="50" y2="25" stroke="#111827" stroke-width="5"/>
<line x1="50" y1="50" x2="70" y2="60" stroke="#111827" stroke-width="5"/>
</svg>`
},



{
name:"FOBAS Royal Eagle Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 55Q60 10 100 55Q60 40 20 55Z" fill="#facc15"/>
<circle cx="60" cy="42" r="15" fill="#111827"/>
<text x="60" y="48" text-anchor="middle"
font-size="10" font-weight="bold" fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Glass Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="38" fill="#e0f2fe"/>
<circle cx="60" cy="45" r="30" fill="#2563eb"/>
<text x="60" y="52" text-anchor="middle"
font-size="18" font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Metallic Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="15" y="20" width="90" height="55"
rx="12" fill="#64748b"/>
<rect x="22" y="27" width="76" height="40"
rx="8" fill="#111827"/>
<text x="60" y="55"
text-anchor="middle"
font-size="20"
font-weight="bold"
fill="#f8fafc">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Luxury Black Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35" fill="#000000"/>
<circle cx="60" cy="45" r="27" fill="#facc15"/>
<text x="60" y="51"
text-anchor="middle"
font-size="16"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Cyber Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 25H100V70H20Z"
fill="#020617"
stroke="#22d3ee"
stroke-width="4"/>
<text x="60" y="55"
text-anchor="middle"
font-size="20"
font-weight="bold"
fill="#22d3ee">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Mountain Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 75L55 20L75 75Z" fill="#475569"/>
<path d="M50 75L85 30L105 75Z" fill="#94a3b8"/>
<text x="60" y="90"
text-anchor="middle"
font-size="14"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Flame Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10Q100 50 60 85Q20 50 60 10Z"
fill="#ef4444"/>
<path d="M60 30Q80 55 60 70Q40 55 60 30Z"
fill="#facc15"/>
<text x="60" y="52"
text-anchor="middle"
font-size="13"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Diamond Premium",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L100 45L60 85L20 45Z"
fill="#0ea5e9"/>
<path d="M60 20L85 45L60 70L35 45Z"
fill="#ffffff"/>
<text x="60" y="50"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Crown Elite",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 55L30 25L60 45L90 25L100 55Z"
fill="#fbbf24"/>
<rect x="25" y="55" width="70" height="15"
fill="#f59e0b"/>
<text x="60" y="66"
text-anchor="middle"
font-size="13"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Digital Circle",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#1d4ed8"/>
<circle cx="60" cy="45" r="25"
fill="#ffffff"/>
<text x="60" y="52"
text-anchor="middle"
font-size="16"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Space Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="38"
fill="#020617"/>
<circle cx="35" cy="25" r="3" fill="#ffffff"/>
<circle cx="85" cy="30" r="3" fill="#ffffff"/>
<text x="60" y="52"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#38bdf8">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Medical Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#22c55e"/>
<path d="M55 25H65V40H80V50H65V65H55V50H40V40H55Z"
fill="#ffffff"/>
<text x="60" y="90"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Future Tech",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L95 75H25Z"
fill="#06b6d4"/>
<circle cx="60" cy="50" r="12"
fill="#ffffff"/>
<text x="60" y="54"
text-anchor="middle"
font-size="10"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Shield Gold",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 15H100V55Q60 90 20 55Z"
fill="#facc15"/>
<path d="M30 25H90V55Q60 75 30 55Z"
fill="#1e3a8a"/>
<text x="60" y="52"
text-anchor="middle"
font-size="14"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Hexagon Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<polygon points="60,10 95,30 95,65 60,85 25,65 25,30"
fill="#7c3aed"/>
<text x="60" y="55"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Network Globe",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#0ea5e9"/>
<path d="M25 45H95M60 10V80"
stroke="#ffffff"
stroke-width="2"/>
<text x="60" y="50"
text-anchor="middle"
font-size="13"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Creative Studio",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#ec4899"/>
<path d="M40 60Q60 20 80 60"
stroke="#ffffff"
stroke-width="5"
fill="none"/>
<text x="60" y="90"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Infinity Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M35 45Q20 25 45 25Q60 25 75 45Q90 65 75 65Q60 65 45 45Q30 25 15 45"
stroke="#2563eb"
stroke-width="8"
fill="none"/>
<text x="60" y="90"
text-anchor="middle"
font-size="14"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Royal Final",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="38"
fill="#111827"/>
<circle cx="60" cy="45" r="30"
fill="#f59e0b"/>
<text x="60" y="52"
text-anchor="middle"
font-size="18"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"Royal Crown Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 55L30 25L60 45L90 25L100 55Z"
fill="#facc15"/>
<rect x="25" y="55" width="70" height="15"
fill="#eab308"/>
<circle cx="40" cy="45" r="4" fill="#ef4444"/>
<circle cx="60" cy="45" r="4" fill="#2563eb"/>
<circle cx="80" cy="45" r="4" fill="#22c55e"/>
</svg>`
},


{
name:"Modern Tech Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35" fill="#0f172a"/>
<path d="M40 45H80M60 25V65"
stroke="#38bdf8"
stroke-width="6"/>
<circle cx="60" cy="45" r="12"
fill="#ffffff"/>
</svg>`
},


{
name:"Luxury Diamond Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L100 45L60 85L20 45Z"
fill="#06b6d4"/>
<path d="M60 20L85 45L60 70L35 45Z"
fill="#ffffff"/>
</svg>`
},


{
name:"Golden Lion Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#f59e0b"/>
<path d="M45 45Q60 25 75 45Q60 65 45 45Z"
fill="#ffffff"/>
<circle cx="50" cy="42" r="3"/>
<circle cx="70" cy="42" r="3"/>
</svg>`
},


{
name:"Infinity Future Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M35 45Q20 25 45 25Q60 25 75 45Q90 65 75 65Q60 65 45 45Q30 25 15 45"
stroke="#2563eb"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Global World Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#22c55e"/>
<path d="M25 45H95M60 10V80"
stroke="#ffffff"
stroke-width="3"/>
<path d="M35 30Q60 45 85 30"
stroke="#ffffff"
stroke-width="3"
fill="none"/>
</svg>`
},


{
name:"Premium Shield Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M25 15H95V55Q60 90 25 55Z"
fill="#dc2626"/>
<path d="M60 30L75 55H45Z"
fill="#ffffff"/>
</svg>`
},


{
name:"Energy Power Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#f97316"/>
<path d="M65 15L40 50H60L50 80L85 40H65Z"
fill="#ffffff"/>
</svg>`
},


{
name:"Creative Wave Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 55Q60 10 100 55Q60 90 20 55Z"
fill="#8b5cf6"/>
<path d="M35 55Q60 30 85 55"
stroke="#ffffff"
stroke-width="5"
fill="none"/>
</svg>`
},


{
name:"Smart Brain Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#ec4899"/>
<path d="M40 45Q50 25 60 45Q70 25 80 45"
stroke="#ffffff"
stroke-width="4"
fill="none"/>
</svg>`
},


{
name:"Rocket Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 15Q90 40 60 75Q30 40 60 15Z"
fill="#2563eb"/>
<circle cx="60" cy="40" r="8"
fill="#ffffff"/>
<path d="M45 70L35 85L55 75"
fill="#ef4444"/>
</svg>`
},


{
name:"Star Premium Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L72 38L105 38L78 58L88 90L60 70L32 90L42 58L15 38L48 38Z"
fill="#facc15"/>
</svg>`
},


{
name:"Mountain Adventure Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M15 80L55 20L80 80Z"
fill="#475569"/>
<path d="M50 80L85 35L110 80Z"
fill="#94a3b8"/>
<circle cx="90" cy="20" r="10"
fill="#facc15"/>
</svg>`
},


{
name:"Ocean Wave Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M10 60Q40 20 70 60Q90 85 110 55"
stroke="#0284c7"
stroke-width="12"
fill="none"/>
<circle cx="60" cy="45" r="15"
fill="#38bdf8"/>
</svg>`
},


{
name:"Camera Studio Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="20" y="25"
width="80"
height="50"
rx="10"
fill="#111827"/>
<circle cx="60" cy="50" r="15"
fill="#38bdf8"/>
</svg>`
},


{
name:"Music Note Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="45" cy="70" r="12"
fill="#ec4899"/>
<path d="M55 65V20L85 30"
stroke="#ec4899"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Medical Cross Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#22c55e"/>
<path d="M50 25H70V40H85V55H70V70H50V55H35V40H50Z"
fill="#ffffff"/>
</svg>`
},


{
name:"Security Eye Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M15 45Q60 5 105 45Q60 85 15 45Z"
fill="#1e3a8a"/>
<circle cx="60" cy="45" r="15"
fill="#ffffff"/>
<circle cx="60" cy="45" r="7"
fill="#111827"/>
</svg>`
},


{
name:"Abstract Color Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="40" cy="45" r="25"
fill="#ef4444"/>
<circle cx="80" cy="45" r="25"
fill="#2563eb"/>
<circle cx="60" cy="45" r="15"
fill="#facc15"/>
</svg>`
},

{
name:"FOBAS Gold Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35" fill="#facc15"/>
<circle cx="60" cy="45" r="28" fill="#111827"/>
<text x="60" y="53" text-anchor="middle"
font-size="22" font-weight="bold"
fill="#facc15">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Shield Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 15H100V55C100 75 60 90 60 90C60 90 20 75 20 55Z"
fill="#2563eb"/>
<path d="M60 25L75 55H45Z"
fill="#ffffff"/>
<text x="60" y="75"
text-anchor="middle"
font-size="14"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Tech Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="15" y="20" width="90" height="55"
rx="12"
fill="#0f172a"/>
<circle cx="35" cy="48" r="12" fill="#38bdf8"/>
<text x="75" y="55"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Globe Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35" fill="#22c55e"/>
<path d="M25 45H95M60 10V80"
stroke="#ffffff"
stroke-width="3"/>
<text x="60" y="50"
text-anchor="middle"
font-size="14"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Diamond Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L100 45L60 80L20 45Z"
fill="#9333ea"/>
<text x="60" y="52"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Modern Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="15" y="25" width="90" height="45"
rx="20"
fill="#ef4444"/>
<text x="60" y="55"
text-anchor="middle"
font-size="22"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Crown Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M25 55L35 25L60 45L85 25L95 55Z"
fill="#facc15"/>
<rect x="25" y="55" width="70" height="15"
fill="#eab308"/>
<text x="60" y="65"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS App Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="25" y="10" width="70" height="70"
rx="18"
fill="#2563eb"/>
<text x="60" y="50"
text-anchor="middle"
font-size="20"
font-weight="bold"
fill="#ffffff">
F
</text>
<text x="60" y="70"
text-anchor="middle"
font-size="10"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Energy Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#f97316"/>
<path d="M65 15L40 50H60L50 80L85 40H65Z"
fill="#ffffff"/>
<text x="60" y="95"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Education Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M20 35L60 15L100 35L60 55Z"
fill="#16a34a"/>
<path d="M35 45V70H85V45"
fill="#22c55e"/>
<text x="60" y="65"
text-anchor="middle"
font-size="14"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Circle Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="38"
fill="#111827"/>
<circle cx="60" cy="45" r="30"
fill="#ffffff"/>
<text x="60" y="52"
text-anchor="middle"
font-size="16"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Future Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<polygon points="60,10 100,70 20,70"
fill="#06b6d4"/>
<text x="60" y="55"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Creative Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#ec4899"/>
<path d="M45 45Q60 25 75 45Q60 65 45 45"
fill="#ffffff"/>
<text x="60" y="90"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Premium Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="15" y="20" width="90" height="55"
rx="8"
fill="#111827"/>
<text x="60" y="55"
text-anchor="middle"
font-size="20"
font-weight="bold"
fill="#facc15">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Network Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="35" cy="45" r="10" fill="#2563eb"/>
<circle cx="85" cy="45" r="10" fill="#2563eb"/>
<circle cx="60" cy="70" r="10" fill="#2563eb"/>
<path d="M35 45L60 70L85 45"
stroke="#111827"
stroke-width="3"/>
<text x="60" y="25"
text-anchor="middle"
font-size="14"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Security Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L95 25V55C95 75 60 90 60 90C60 90 25 75 25 55V25Z"
fill="#dc2626"/>
<text x="60" y="55"
text-anchor="middle"
font-size="18"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS World Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<circle cx="60" cy="45" r="35"
fill="#38bdf8"/>
<path d="M30 45H90M60 15V75"
stroke="#ffffff"
stroke-width="3"/>
<text x="60" y="50"
text-anchor="middle"
font-size="14"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Innovation Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<path d="M60 10L90 45L60 80L30 45Z"
fill="#22c55e"/>
<circle cx="60" cy="45" r="12"
fill="#ffffff"/>
<text x="60" y="95"
text-anchor="middle"
font-size="12"
font-weight="bold">
FOBAS
</text>
</svg>`
},


{
name:"FOBAS Final Logo",
category:"Symbols",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="20" width="100" height="60"
rx="15"
fill="#7c3aed"/>
<text x="60" y="58"
text-anchor="middle"
font-size="24"
font-weight="bold"
fill="#ffffff">
FOBAS
</text>
</svg>`
},
   


{
name:"Football Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="30" fill="#ffffff"/>
<path d="M50 25L62 35L58 50H42L38 35Z" fill="#111827"/>
<path d="M20 45H80M50 15V75" stroke="#d1d5db" stroke-width="2"/>
<path d="M45 75L50 90L55 75" fill="#ffffff"/>
</svg>`
},


{
name:"Rainbow Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#ef4444"/>
<path d="M25 45Q50 15 75 45" stroke="#facc15" stroke-width="8" fill="none"/>
<path d="M30 60Q50 85 70 60" stroke="#22c55e" stroke-width="8" fill="none"/>
<path d="M50 80L50 95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Party Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#a855f7"/>
<circle cx="40" cy="35" r="6" fill="#ffffff"/>
<circle cx="65" cy="55" r="5" fill="#facc15"/>
<path d="M50 80L50 95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Red Heart Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 75C20 55 15 35 30 25C40 18 50 30 50 30C50 30 60 18 70 25C85 35 80 55 50 75Z"
fill="#ef4444"/>
<circle cx="40" cy="35" r="5" fill="#ffffff"/>
<path d="M50 75V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Blue Party Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="27" ry="35" fill="#2563eb"/>
<ellipse cx="40" cy="30" rx="7" ry="12" fill="#93c5fd"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Golden Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#f59e0b"/>
<circle cx="40" cy="30" r="7" fill="#fde68a"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Star Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="30" ry="35" fill="#2563eb"/>
<path d="M50 25L56 40L72 40L60 50L65 65L50 55L35 65L40 50L28 40L44 40Z"
fill="#facc15"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Birthday Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#ec4899"/>
<text x="50" y="52" text-anchor="middle" font-size="20" fill="#ffffff">🎂</text>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Smile Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 100 100 100">
<circle cx="50" cy="45" r="30" fill="#facc15"/>
<circle cx="40" cy="38" r="4"/>
<circle cx="60" cy="38" r="4"/>
<path d="M38 55Q50 65 62 55" stroke="#111827" stroke-width="3" fill="none"/>
<path d="M50 75V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Water Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#38bdf8"/>
<path d="M35 35Q50 25 65 35" stroke="#ffffff" stroke-width="4" fill="none"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Football Party Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="30" ry="35" fill="#16a34a"/>
<path d="M50 30L60 40L55 55H45L40 40Z" fill="#ffffff"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Luxury Gold Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 100 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#eab308"/>
<circle cx="40" cy="30" r="7" fill="#fff7ed"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Purple Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#9333ea"/>
<ellipse cx="40" cy="30" rx="6" ry="10" fill="#ddd6fe"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Green Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#22c55e"/>
<circle cx="40" cy="30" r="6" fill="#bbf7d0"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Blue Star Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#0ea5e9"/>
<path d="M50 25L56 40L72 40L60 50L65 65L50 55L35 65L40 50L28 40L44 40Z"
fill="#ffffff"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Wedding Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#ffffff"/>
<path d="M50 35C35 20 25 40 50 60C75 40 65 20 50 35Z"
fill="#ef4444"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Rainbow Party Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#f97316"/>
<path d="M30 45Q50 20 70 45" stroke="#22c55e" stroke-width="6" fill="none"/>
<path d="M35 60Q50 75 65 60" stroke="#2563eb" stroke-width="6" fill="none"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Champion Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#dc2626"/>
<text x="50" y="52" text-anchor="middle" font-size="18" fill="#facc15">★</text>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},


{
name:"Kids Game Balloon",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="45" rx="28" ry="35" fill="#14b8a6"/>
<circle cx="40" cy="35" r="5" fill="#ffffff"/>
<circle cx="60" cy="55" r="5" fill="#facc15"/>
<path d="M50 80V95" stroke="#92400e" stroke-width="3"/>
</svg>`
},



   



{
name:"Football Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#111827" stroke-width="4"/>
<polygon points="50,35 60,42 56,55 44,55 40,42"
fill="#111827"/>
<path d="M50 35L50 10M40 42L15 30M60 42L85 30M44 55L25 75M56 55L75 75"
stroke="#111827"
stroke-width="3"/>
</svg>`
},


{
name:"Basketball Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#f97316"/>
<path d="M10 50H90M50 10V90"
stroke="#111827"
stroke-width="4"/>
<path d="M20 20Q80 50 20 80M80 20Q20 50 80 80"
stroke="#111827"
stroke-width="4"
fill="none"/>
</svg>`
},


{
name:"Baseball Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#d1d5db" stroke-width="3"/>
<path d="M25 25Q50 50 25 75M75 25Q50 50 75 75"
stroke="#ef4444"
stroke-width="3"
fill="none"/>
</svg>`
},


{
name:"Tennis Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#bef264"/>
<path d="M20 35Q50 50 80 35M20 65Q50 50 80 65"
stroke="#ffffff"
stroke-width="5"
fill="none"/>
</svg>`
},


{
name:"Volleyball Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff"/>
<path d="M50 10Q30 50 50 90M10 50Q50 30 90 50M25 20Q60 50 75 80"
stroke="#2563eb"
stroke-width="5"
fill="none"/>
</svg>`
},


{
name:"Golf Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#d1d5db" stroke-width="3"/>
<circle cx="35" cy="35" r="2" fill="#9ca3af"/>
<circle cx="60" cy="40" r="2" fill="#9ca3af"/>
<circle cx="45" cy="65" r="2" fill="#9ca3af"/>
</svg>`
},


{
name:"Rugby Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="50" rx="40" ry="25" fill="#92400e"/>
<line x1="35" y1="45" x2="65" y2="45"
stroke="#ffffff"
stroke-width="4"/>
<line x1="35" y1="55" x2="65" y2="55"
stroke="#ffffff"
stroke-width="4"/>
</svg>`
},


{
name:"Bowling Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#111827"/>
<circle cx="35" cy="35" r="7" fill="#374151"/>
<circle cx="60" cy="35" r="7" fill="#374151"/>
<circle cx="50" cy="55" r="7" fill="#374151"/>
</svg>`
},


{
name:"Billiard Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#111827"/>
<circle cx="50" cy="50" r="18" fill="#ffffff"/>
<text x="50" y="58"
text-anchor="middle"
font-size="18">
8
</text>
</svg>`
},


{
name:"Ping Pong Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="35" fill="#ffffff" stroke="#d1d5db" stroke-width="3"/>
<rect x="25" y="80" width="50" height="8" fill="#92400e"/>
</svg>`
},


{
name:"Beach Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ffffff"/>
<path d="M50 10Q80 30 90 50Q60 55 50 90Q20 70 10 50Q40 45 50 10"
fill="#38bdf8"/>
<path d="M50 10Q40 45 50 90"
stroke="#ef4444"
stroke-width="8"/>
</svg>`
},


{
name:"Balloon Red",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="40" rx="30" ry="38" fill="#ef4444"/>
<path d="M50 78V95"
stroke="#92400e"
stroke-width="3"/>
</svg>`
},


{
name:"Balloon Blue",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="40" rx="30" ry="38" fill="#2563eb"/>
<path d="M50 78V95"
stroke="#92400e"
stroke-width="3"/>
</svg>`
},


{
name:"Balloon Green",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<ellipse cx="50" cy="40" rx="30" ry="38" fill="#22c55e"/>
<path d="M50 78V95"
stroke="#92400e"
stroke-width="3"/>
</svg>`
},


{
name:"Magic Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#111827"/>
<circle cx="50" cy="50" r="18" fill="#ffffff"/>
<text x="50" y="58"
text-anchor="middle"
font-size="18">
?
</text>
</svg>`
},


{
name:"Toy Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#ec4899"/>
<path d="M15 50H85M50 15V85"
stroke="#facc15"
stroke-width="8"/>
</svg>`
},


{
name:"Soccer Color Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#22c55e"/>
<polygon points="50,30 62,40 58,55 42,55 38,40"
fill="#ffffff"/>
<circle cx="50" cy="50" r="8" fill="#111827"/>
</svg>`
},


{
name:"Rainbow Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0">
<circle cx="50" cy="50" r="40" fill="#facc15"/>
<path d="M15 50Q50 15 85 50"
stroke="#ef4444"
stroke-width="8"
fill="none"/>
<path d="M20 60Q50 30 80 60"
stroke="#2563eb"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Golden Trophy Ball",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="45" r="35" fill="#facc15"/>
<path d="M50 10V80"
stroke="#ffffff"
stroke-width="4"/>
<path d="M20 45H80"
stroke="#ffffff"
stroke-width="4"/>
<rect x="40" y="80" width="20" height="8" fill="#92400e"/>
</svg>`
},





   
{
name:"Map Pin",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 90Q15 55 15 35Q15 10 50 10Q85 10 85 35Q85 55 50 90Z"
fill="#ef4444"/>
<circle cx="50" cy="35" r="12" fill="#ffffff"/>
</svg>`
},


{
name:"Download",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10V65"
stroke="#2563eb"
stroke-width="10"/>
<polygon points="25,55 50,85 75,55"
fill="#2563eb"/>
<rect x="20" y="85" width="60" height="8" fill="#111827"/>
</svg>`
},


{
name:"Upload",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 90V35"
stroke="#22c55e"
stroke-width="10"/>
<polygon points="25,45 50,15 75,45"
fill="#22c55e"/>
<rect x="20" y="85" width="60" height="8" fill="#111827"/>
</svg>`
},


{
name:"Play",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#22c55e"/>
<polygon points="40,30 75,50 40,70"
fill="#ffffff"/>
</svg>`
},


{
name:"Pause",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40" fill="#f97316"/>
<rect x="35" y="30" width="10" height="40" fill="#ffffff"/>
<rect x="55" y="30" width="10" height="40" fill="#ffffff"/>
</svg>`
},


{
name:"Camera Symbol",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="30" width="70" height="50" rx="8" fill="#374151"/>
<circle cx="50" cy="55" r="18" fill="#60a5fa"/>
<circle cx="50" cy="55" r="8" fill="#111827"/>
</svg>`
},


{
name:"Search",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="42" cy="42" r="25"
fill="none"
stroke="#2563eb"
stroke-width="8"/>
<line x1="60" y1="60" x2="85" y2="85"
stroke="#111827"
stroke-width="10"/>
</svg>`
},


{
name:"Settings",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="20" fill="#6b7280"/>
<path d="M50 5V25M50 75V95M5 50H25M75 50H95"
stroke="#111827"
stroke-width="8"/>
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
name:"Realistic Camera",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="30" width="70" height="45" rx="8" fill="#1f2937"/>
<rect x="30" y="20" width="25" height="12" rx="3" fill="#374151"/>
<circle cx="50" cy="52" r="18" fill="#111827"/>
<circle cx="50" cy="52" r="10" fill="#60a5fa"/>
<circle cx="50" cy="52" r="4" fill="#ffffff"/>
</svg>`
},


{
name:"Realistic Globe",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="42" fill="#38bdf8"/>
<path d="M20 50H80M50 10V90"
stroke="#ffffff"
stroke-width="3"/>
<path d="M50 10Q20 50 50 90M50 10Q80 50 50 90"
stroke="#ffffff"
stroke-width="3"
fill="none"/>
<path d="M25 35Q50 45 75 35M25 65Q50 55 75 65"
stroke="#22c55e"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Realistic Trophy",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M30 20H70V45Q70 65 50 70Q30 65 30 45Z"
fill="#facc15"/>
<path d="M30 30H15Q15 55 35 55M70 30H85Q85 55 65 55"
stroke="#f59e0b"
stroke-width="6"
fill="none"/>
<rect x="45" y="70" width="10" height="15" fill="#92400e"/>
<rect x="30" y="85" width="40" height="8" fill="#facc15"/>
</svg>`
},


{
name:"Realistic Folder",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M10 30H40L50 40H90V80H10Z"
fill="#facc15"/>
<path d="M10 40H90V80H10Z"
fill="#eab308"/>
</svg>`
},


{
name:"Realistic Document",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="10" width="50" height="75" rx="5" fill="#ffffff" stroke="#9ca3af" stroke-width="3"/>
<line x1="35" y1="35" x2="65" y2="35" stroke="#2563eb" stroke-width="5"/>
<line x1="35" y1="50" x2="65" y2="50" stroke="#9ca3af" stroke-width="4"/>
<line x1="35" y1="65" x2="55" y2="65" stroke="#9ca3af" stroke-width="4"/>
</svg>`
},


{
name:"Realistic Wallet",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="15" y="30" width="70" height="45" rx="8" fill="#92400e"/>
<rect x="55" y="45" width="30" height="20" fill="#facc15"/>
<circle cx="65" cy="55" r="5" fill="#111827"/>
</svg>`
},


{
name:"Realistic Gift Box",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="50" fill="#ef4444"/>
<rect x="45" y="35" width="10" height="50" fill="#facc15"/>
<path d="M20 35Q50 5 80 35"
fill="none"
stroke="#facc15"
stroke-width="8"/>
</svg>`
},


{
name:"Realistic Diamond",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<polygon points="20,35 80,35 50,85"
fill="#38bdf8"/>
<polygon points="20,35 35,15 65,15 80,35"
fill="#bae6fd"/>
<line x1="35" y1="15" x2="50" y2="85"
stroke="#ffffff"
stroke-width="3"/>
</svg>`
},


{
name:"Realistic Key",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="30" cy="50" r="18" fill="#facc15"/>
<circle cx="30" cy="50" r="8" fill="#ffffff"/>
<rect x="45" y="45" width="40" height="10" fill="#d97706"/>
<rect x="70" y="55" width="8" height="15" fill="#d97706"/>
</svg>`
},


{
name:"Realistic Bell",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 70H75Q65 55 65 35Q65 15 50 15Q35 15 35 35Q35 55 25 70Z"
fill="#fbbf24"/>
<circle cx="50" cy="82" r="8" fill="#92400e"/>
</svg>`
},


{
name:"Realistic Shield",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 10L85 25V55Q70 85 50 90Q30 85 15 55V25Z"
fill="#2563eb"/>
<path d="M35 50L47 62L70 35"
stroke="#ffffff"
stroke-width="8"
fill="none"/>
</svg>`
},


{
name:"Realistic Microphone",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="35" y="15" width="30" height="45" rx="15" fill="#374151"/>
<path d="M25 50Q25 80 50 80Q75 80 75 50"
stroke="#111827"
stroke-width="6"
fill="none"/>
<line x1="50" y1="80" x2="50" y2="95"
stroke="#111827"
stroke-width="6"/>
</svg>`
},


{
name:"Realistic Light Bulb",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="40" r="25" fill="#facc15"/>
<rect x="38" y="65" width="24" height="15" fill="#6b7280"/>
<line x1="50" y1="5" x2="50" y2="15" stroke="#facc15" stroke-width="5"/>
</svg>`
},


{
name:"Realistic Puzzle",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M25 25H50Q60 10 70 25V40H85V70H60Q50 85 40 70H25Z"
fill="#22c55e"/>
</svg>`
},


{
name:"Realistic Pin",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M50 90Q20 55 20 35Q20 10 50 10Q80 10 80 35Q80 55 50 90Z"
fill="#ef4444"/>
<circle cx="50" cy="35" r="12" fill="#ffffff"/>
</svg>`
},


{
name:"Realistic Lock",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<rect x="25" y="40" width="50" height="45" rx="8" fill="#374151"/>
<path d="M35 40V25Q50 5 65 25V40"
stroke="#111827"
stroke-width="8"
fill="none"/>
<circle cx="50" cy="62" r="6" fill="#facc15"/>
</svg>`
},


{
name:"Realistic Search",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="40" cy="40" r="25"
fill="none"
stroke="#2563eb"
stroke-width="8"/>
<line x1="60" y1="60" x2="85" y2="85"
stroke="#111827"
stroke-width="10"/>
</svg>`
},


{
name:"Realistic Music",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<path d="M60 20V65"
stroke="#111827"
stroke-width="8"/>
<circle cx="45" cy="70" r="12" fill="#ec4899"/>
<circle cx="60" cy="20" r="6" fill="#2563eb"/>
</svg>`
},


{
name:"Realistic Compass",
category:"Symbols",
svg:`
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="40"
fill="#ffffff"
stroke="#111827"
stroke-width="5"/>
<polygon points="50,15 65,60 35,60"
fill="#ef4444"/>
<polygon points="50,85 35,40 65,40"
fill="#2563eb"/>
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
name:"Haiti Flag",
category:"Objects", 
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#0038A8"/>
<rect x="10" y="42" width="100" height="28" fill="#D21034"/>
<rect x="50" y="42" width="20" height="28" fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10" fill="#111827">
Haiti
</text>
</svg>`
},


{
name:"United States Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<path d="M10 15H110V25H10ZM10 35H110V45H10ZM10 55H110V65H10Z"
fill="#b91c1c"/>
<rect x="10" y="15" width="45" height="30" fill="#1d4ed8"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
United States
</text>
</svg>`
},


{
name:"Canada Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<rect x="10" y="15" width="25" height="55" fill="#ef4444"/>
<rect x="85" y="15" width="25" height="55" fill="#ef4444"/>
<path d="M60 25L66 45H80L68 55L72 70L60 60L48 70L52 55L40 45H54Z"
fill="#ef4444"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Canada
</text>
</svg>`
},


{
name:"France Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#2563eb"/>
<rect x="43" y="15" width="34" height="55" fill="#ffffff"/>
<rect x="77" y="15" width="33" height="55" fill="#ef4444"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
France
</text>
</svg>`
},


{
name:"Brazil Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#16a34a"/>
<polygon points="60,20 95,42 60,65 25,42"
fill="#facc15"/>
<circle cx="60" cy="42" r="15" fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Brazil
</text>
</svg>`
},


{
name:"Japan Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<circle cx="60" cy="42" r="18" fill="#ef4444"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Japan
</text>
</svg>`
},


{
name:"United Kingdom Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#1e40af"/>
<path d="M10 15L110 70M110 15L10 70"
stroke="#ffffff" stroke-width="12"/>
<path d="M10 15L110 70M110 15L10 70"
stroke="#dc2626" stroke-width="5"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
United Kingdom
</text>
</svg>`
},


{
name:"Germany Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="18" fill="#111827"/>
<rect x="10" y="33" width="100" height="18" fill="#dc2626"/>
<rect x="10" y="51" width="100" height="19" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Germany
</text>
</svg>`
},


{
name:"Italy Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#16a34a"/>
<rect x="43" y="15" width="34" height="55" fill="#ffffff"/>
<rect x="77" y="15" width="33" height="55" fill="#ef4444"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Italy
</text>
</svg>`
},


{
name:"Spain Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ef4444"/>
<rect x="10" y="32" width="100" height="21" fill="#facc15"/>
<text x="60" y="88" text-anchor="middle" font-size="10">
Spain
</text>
</svg>`
},



{
name:"Mexico Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="33" height="55" fill="#16a34a"/>
<rect x="43" y="15" width="34" height="55" fill="#ffffff"/>
<rect x="77" y="15" width="33" height="55" fill="#ef4444"/>
<circle cx="60" cy="42" r="6" fill="#16a34a"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Mexico</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">China</text>
</svg>`
},


{
name:"South Korea Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#ffffff"/>
<circle cx="60" cy="42" r="15" fill="#ef4444"/>
<path d="M60 27A15 15 0 0 0 60 57A15 15 0 0 1 60 27"
fill="#2563eb"/>
<text x="60" y="88" text-anchor="middle" font-size="10">South Korea</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">India</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">Australia</text>
</svg>`
},


{
name:"South Africa Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#16a34a"/>
<path d="M10 15L55 42L10 70Z" fill="#111827"/>
<path d="M10 15L70 42L10 70" fill="none" stroke="#facc15" stroke-width="10"/>
<text x="60" y="88" text-anchor="middle" font-size="10">South Africa</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">Argentina</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">Portugal</text>
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
<text x="60" y="88" text-anchor="middle" font-size="10">Belgium</text>
</svg>`
},


{
name:"Switzerland Flag",
category:"Objects",
svg:`
<svg viewBox="0 0 120 100">
<rect x="10" y="15" width="100" height="55" fill="#dc2626"/>
<rect x="55" y="25" width="10" height="35" fill="#ffffff"/>
<rect x="45" y="37" width="30" height="10" fill="#ffffff"/>
<text x="60" y="88" text-anchor="middle" font-size="10">Switzerland</text>
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
name:"Tool Box",
category:"Objects",
svg:`
<svg viewBox="0 0 100 100">
<rect x="20" y="35" width="60" height="40" rx="5" fill="#dc2626"/>
<path d="M35 35V20H65V35" stroke="#111827" stroke-width="6" fill="none"/>
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












/* =========================================================
   CAMPUS WORD — CLIP ART INSERT ENGINE
   STEP 3
   INSERT CLIPART INTO PAGE ONLY
   ISOLATED MODULE
   NO SELECTION SYSTEM
   NO SHAPE ENGINE INTERFERENCE
   NO RESIZE INTERFERENCE
   NO CARET INTERFERENCE
   TOUCH + MOUSE SUPPORT
========================================================= */

(function(){



let clipArtInsertMode = false;






document.addEventListener(
    "pointerdown",
    function(e){



        const clipItem =
            e.target.closest(
                ".cwClipArtItem"
            );



        if(!clipItem){

            return;

        }





        const page =
            document.querySelector(
                ".cwPageContent"
            );



        if(!page){

            return;

        }





        e.preventDefault();






        const rect =
            page.getBoundingClientRect();






        const x =
            e.clientX -
            rect.left;



        const y =
            e.clientY -
            rect.top;







        const clip =
            document.createElement(
                "div"
            );






        clip.className =
            "cwInsertedClipArt";






        clip.dataset.clipart =
            clipItem.dataset.clipart;






        clip.style.position =
            "absolute";



        clip.style.left =
            x + "px";



        clip.style.top =
            y + "px";



        clip.style.width =
            "120px";



        clip.style.height =
            "120px";



        clip.style.display =
            "flex";



        clip.style.alignItems =
            "center";



        clip.style.justifyContent =
            "center";



        clip.style.cursor =
            "move";







        clip.innerHTML =
            clipItem.innerHTML;







        page.appendChild(
            clip
        );






    },
    {
        passive:false
    }
);





})();








/* =========================================================
   CAMPUS WORD — CLIP ART MOVE ENGINE
   STEP 4
   MOVE INSERTED CLIPART ONLY
   MOUSE + TOUCH SUPPORT
   ISOLATED FROM SHAPES
   ISOLATED FROM CARET
   ISOLATED FROM IMAGE SYSTEM
========================================================= */

(function(){


let moving = false;

let activeClip = null;


let startX = 0;

let startY = 0;


let startLeft = 0;

let startTop = 0;








document.addEventListener(
"pointerdown",
function(e){



const clip =
e.target.closest(
".cwInsertedClipArt"
);



if(!clip){

return;

}



activeClip = clip;



moving = true;



startX =
e.clientX;


startY =
e.clientY;



startLeft =
clip.offsetLeft;


startTop =
clip.offsetTop;



clip.setPointerCapture(
e.pointerId
);



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
!moving ||
!activeClip
){

return;

}





const dx =
e.clientX - startX;



const dy =
e.clientY - startY;





activeClip.style.left =
(
startLeft + dx
)
+
"px";




activeClip.style.top =
(
startTop + dy
)
+
"px";





},
{
passive:false
}
);









document.addEventListener(
"pointerup",
function(){



moving = false;


activeClip = null;



},
false
);







})();









/* =========================================================
   CAMPUS WORD — CLIP ART RESIZE HANDLE ENGINE
   STEP 5
   8 CORNERS + CENTER HANDLE
   TOUCH + MOUSE SUPPORT
   ONLY CLIPART
   ISOLATED FROM SHAPES
   ISOLATED FROM CARET
========================================================= */

(function(){


let selectedClip = null;


const handles = [
    "nw",
    "n",
    "ne",
    "w",
    "center",
    "e",
    "sw",
    "s",
    "se"
];





function removeClipHandles(){


const old =
document.querySelector(
".cwClipArtHandles"
);



if(old){

old.remove();

}


}







function showClipHandles(clip){


removeClipHandles();



const box =
document.createElement(
"div"
);



box.className =
"cwClipArtHandles";



box.style.left =
clip.offsetLeft + "px";


box.style.top =
clip.offsetTop + "px";


box.style.width =
clip.offsetWidth + "px";


box.style.height =
clip.offsetHeight + "px";




handles.forEach(
function(pos){



const h =
document.createElement(
"div"
);



h.className =
"cwClipHandle " +
"cwClipHandle-" +
pos;



h.dataset.clipResize =
pos;



box.appendChild(h);



}
);





clip.parentElement.appendChild(
box
);



}









document.addEventListener(
"pointerdown",
function(e){



const clip =
e.target.closest(
".cwInsertedClipArt"
);



if(!clip){

return;

}



selectedClip = clip;



window.CampusWordSelectedClipArt =
clip;



showClipHandles(
clip
);



},
false
);








document.addEventListener(
"pointerdown",
function(e){


const outside =
e.target.closest(
".cwInsertedClipArt, .cwClipArtHandles"
);



if(!outside){



selectedClip = null;


window.CampusWordSelectedClipArt =
null;


removeClipHandles();



}



},
false
);





})();









/* =========================================================
   CAMPUS WORD — CLIP ART RESIZE ENGINE
   STEP 6
   RESIZE FROM 8 EDGE HANDLES
   TOUCH + MOUSE
   ONLY CLIP ART
   ISOLATED FROM SHAPES
   ISOLATED FROM CARET
========================================================= */

(function(){


let resizing = false;

let activeClip = null;

let direction = null;


let startX = 0;

let startY = 0;


let startWidth = 0;

let startHeight = 0;







document.addEventListener(
"pointerdown",
function(e){



const handle =
e.target.closest(
"[data-clip-resize]"
);



if(!handle){

return;

}



activeClip =
window.CampusWordSelectedClipArt;



if(!activeClip){

return;

}



direction =
handle.dataset.clipResize;



resizing = true;



startX =
e.clientX;


startY =
e.clientY;



startWidth =
activeClip.offsetWidth;


startHeight =
activeClip.offsetHeight;



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
!activeClip
){

return;

}



const dx =
e.clientX - startX;


const dy =
e.clientY - startY;



let width =
startWidth;


let height =
startHeight;





/* RIGHT SIDE */

if(
direction === "e" ||
direction === "ne" ||
direction === "se"
){

width =
startWidth + dx;

}





/* LEFT SIDE */

if(
direction === "w" ||
direction === "nw" ||
direction === "sw"
){

width =
startWidth - dx;

}





/* BOTTOM SIDE */

if(
direction === "s" ||
direction === "se" ||
direction === "sw"
){

height =
startHeight + dy;

}





/* TOP SIDE */

if(
direction === "n" ||
direction === "ne" ||
direction === "nw"
){

height =
startHeight - dy;

}






if(width < 40){

width = 40;

}



if(height < 40){

height = 40;

}





activeClip.style.width =
width + "px";



activeClip.style.height =
height + "px";







const handles =
document.querySelector(
".cwClipArtHandles"
);



if(handles){


handles.style.width =
activeClip.offsetWidth + "px";


handles.style.height =
activeClip.offsetHeight + "px";


handles.style.left =
activeClip.offsetLeft + "px";


handles.style.top =
activeClip.offsetTop + "px";


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


activeClip = null;


direction = null;



},
false
);





})();






/* =========================================================
   CAMPUS WORD — CLIP ART DELETE ENGINE
   STEP 7
   DELETE SELECTED CLIP ART ONLY
   KEYBOARD DELETE SUPPORT
   TOUCH + MOUSE SAFE
   ISOLATED FROM SHAPES
   ISOLATED FROM CARET
========================================================= */

(function(){



document.addEventListener(
"keydown",
function(e){



if(
e.key !== "Delete" &&
e.key !== "Backspace"
){

return;

}




const clip =
window.CampusWordSelectedClipArt;



if(!clip){

return;

}






if(
!clip.classList.contains(
"cwInsertedClipArt"
)
){

return;

}





e.preventDefault();

e.stopPropagation();






clip.remove();






window.CampusWordSelectedClipArt =
null;






const handles =
document.querySelector(
".cwClipArtHandles"
);



if(handles){

handles.remove();

}






},
false
);





})();



















/* =========================================================
   CAMPUS WORD — TEXT BOX BUTTON ACTIVE ENGINE
   STEP 1
   TOGGLE BUTTON ACTIVE STATE ONLY
   NO INSERTION
   NO PAGE INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



document.addEventListener(
"click",
function(e){



const button =
e.target.closest(
'[data-action="insert-textbox"]'
);



if(!button){

return;

}





e.preventDefault();

e.stopPropagation();





button.classList.toggle(
"cwTextBoxActive"
);





},
false
);



})();














/* =========================================================
   CAMPUS WORD — TEXT BOX INSERT POSITION ENGINE
   STEP 2
   SAVE TEXT BOX INSERT POSITION ONLY
   WAIT FOR CREATION STEP
   NO TEXT BOX CREATION
   NO CARET INTERFERENCE
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



let textBoxInsertMode = false;




window.CampusWordTextBoxData = {

    position:null

};






document.addEventListener(
"click",
function(e){



const button =
e.target.closest(
'[data-action="insert-textbox"]'
);



if(!button){

return;

}





textBoxInsertMode =
button.classList.contains(
"cwTextBoxActive"
);



},
false
);









document.addEventListener(
"pointerdown",
function(e){



if(!textBoxInsertMode){

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







window.CampusWordTextBoxData.position = {


    x:e.clientX - rect.left,


    y:e.clientY - rect.top,


    page:page



};





console.log(
"Text Box Position Saved",
window.CampusWordTextBoxData.position
);





},
{
passive:false
}
);




})();












/* =========================================================
   CAMPUS WORD — TEXT BOX CREATION ENGINE
   STEP 3
   CREATE REAL TEXT BOX OBJECT
   INSERT INTO PAGE
   USE SAVED POSITION
   TOUCH + MOUSE SUPPORT
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



function createTextBox(){



const box =
document.createElement(
"div"
);





box.className =
"cwInsertedTextBox";





box.contentEditable =
"true";





box.innerHTML =
"";





box.style.position =
"absolute";





box.style.left =
"0px";





box.style.top =
"0px";





box.style.width =
"200px";





box.style.height =
"80px";





box.style.minWidth =
"80px";





box.style.minHeight =
"40px";





box.style.padding =
"10px";





box.style.border =
"2px solid #2563eb";





box.style.background =
"white";





box.style.cursor =
"text";





box.style.overflow =
"hidden";





box.style.outline =
"none";





return box;



}









document.addEventListener(
"pointerdown",
function(){



const data =
window.CampusWordTextBoxData;





if(
!data ||
!data.position
){

return;

}






const page =
data.position.page;





const box =
createTextBox();






box.style.left =
data.position.x + "px";





box.style.top =
data.position.y + "px";






page.appendChild(
box
);






window.CampusWordSelectedTextBox =
box;







data.position =
null;





box.focus();





},
false
);






})();










/* =========================================================
   CAMPUS WORD — TEXT BOX FOUR HANDLES ENGINE
   STEP 4
   SHOW 4 RESIZE HANDLES ONLY
   TOP / BOTTOM / LEFT / RIGHT
   TEXT BOX ONLY
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



let selectedTextBox = null;




function removeTextBoxHandles(){


const old =
document.querySelector(
".cwTextBoxHandles"
);



if(old){

old.remove();

}


}







function showTextBoxHandles(box){



removeTextBoxHandles();




const handles =
document.createElement(
"div"
);



handles.className =
"cwTextBoxHandles";



handles.style.position =
"absolute";



handles.style.left =
box.offsetLeft + "px";



handles.style.top =
box.offsetTop + "px";



handles.style.width =
box.offsetWidth + "px";



handles.style.height =
box.offsetHeight + "px";



handles.style.pointerEvents =
"none";





[
"top",
"bottom",
"left",
"right"

].forEach(
function(pos){



const h =
document.createElement(
"div"
);



h.className =
"cwTextBoxHandle-" + pos;



h.dataset.textboxHandle =
pos;



h.style.pointerEvents =
"auto";



handles.appendChild(
h
);



});





box.parentElement.appendChild(
handles
);



}










document.addEventListener(
"pointerdown",
function(e){



const box =
e.target.closest(
".cwInsertedTextBox"
);



if(!box){

return;

}




selectedTextBox =
box;



window.CampusWordSelectedTextBox =
box;




showTextBoxHandles(
box
);




},
{
passive:false
}
);









document.addEventListener(
"pointerdown",
function(e){



const inside =
e.target.closest(
".cwInsertedTextBox, .cwTextBoxHandles"
);



if(!inside){



selectedTextBox = null;



window.CampusWordSelectedTextBox =
null;



removeTextBoxHandles();



}



},
false
);






})();







/* =========================================================
   CAMPUS WORD — TEXT BOX RESIZE ENGINE
   STEP 5
   FOUR SIDE RESIZE ONLY
   TOP / BOTTOM / LEFT / RIGHT
   TOUCH + MOUSE SUPPORT
   SMOOTH DRAG RESIZE
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



let resizing = false;

let direction = null;

let box = null;



let startX = 0;

let startY = 0;



let startWidth = 0;

let startHeight = 0;



let startLeft = 0;

let startTop = 0;






document.addEventListener(
"pointerdown",
function(e){



const handle =
e.target.closest(
"[data-textbox-handle]"
);



if(!handle){

return;

}





box =
window.CampusWordSelectedTextBox;



if(!box){

return;

}





resizing = true;



direction =
handle.dataset.textboxHandle;





startX =
e.clientX;


startY =
e.clientY;



startWidth =
box.offsetWidth;


startHeight =
box.offsetHeight;



startLeft =
box.offsetLeft;


startTop =
box.offsetTop;





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
!box
){

return;

}





const dx =
e.clientX - startX;



const dy =
e.clientY - startY;






if(
direction === "right"
){


let width =
startWidth + dx;


if(width < 80){

width = 80;

}


box.style.width =
width + "px";


}









if(
direction === "left"
){


let width =
startWidth - dx;


if(width < 80){

width = 80;

}


box.style.width =
width + "px";


box.style.left =
startLeft + dx + "px";


}









if(
direction === "bottom"
){


let height =
startHeight + dy;


if(height < 40){

height = 40;

}


box.style.height =
height + "px";


}









if(
direction === "top"
){


let height =
startHeight - dy;


if(height < 40){

height = 40;

}


box.style.height =
height + "px";


box.style.top =
startTop + dy + "px";


}








const handles =
document.querySelector(
".cwTextBoxHandles"
);



if(handles){


handles.style.left =
box.offsetLeft + "px";


handles.style.top =
box.offsetTop + "px";


handles.style.width =
box.offsetWidth + "px";


handles.style.height =
box.offsetHeight + "px";


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

direction = null;

box = null;



},
false
);






})();
















/* =========================================================
   CAMPUS WORD — TEXT BOX MOVE ENGINE
   STEP 6
   MOVE TEXT BOX ANYWHERE ON PAGE
   TOUCH + MOUSE SUPPORT
   DRAG AND DROP POSITIONING
   NO RESIZE INTERFERENCE
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){



let moving = false;

let box = null;



let startX = 0;

let startY = 0;



let startLeft = 0;

let startTop = 0;







document.addEventListener(
"pointerdown",
function(e){



const target =
e.target.closest(
".cwInsertedTextBox"
);



if(!target){

return;

}






/*
   Pa pran resize handles
*/

if(
e.target.closest(
".cwTextBoxHandles"
)
){

return;

}







box = target;



window.CampusWordSelectedTextBox =
box;





moving = true;





startX =
e.clientX;



startY =
e.clientY;





startLeft =
box.offsetLeft;



startTop =
box.offsetTop;






box.setPointerCapture(
e.pointerId
);





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
!moving ||
!box
){

return;

}






const dx =
e.clientX - startX;



const dy =
e.clientY - startY;








box.style.left =
startLeft + dx + "px";





box.style.top =
startTop + dy + "px";








const handles =
document.querySelector(
".cwTextBoxHandles"
);





if(handles){


handles.style.left =
box.offsetLeft + "px";


handles.style.top =
box.offsetTop + "px";


}






},
{
passive:false
}
);









document.addEventListener(
"pointerup",
function(e){



if(box){


try{


box.releasePointerCapture(
e.pointerId
);


}catch(err){}



}





moving = false;


box = null;




},
false
);






})();













/* =========================================================
   CAMPUS WORD — TEXT BOX DELETE ENGINE
   STEP 7
   DELETE SELECTED TEXT BOX ONLY
   REMOVE HANDLES
   KEYBOARD DELETE SUPPORT
   NO SHAPE INTERFERENCE
   NO CLIPART INTERFERENCE
   NO CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){





document.addEventListener(
"keydown",
function(e){





if(
e.key !== "Delete" &&
e.key !== "Backspace"
){

return;

}






const box =
window.CampusWordSelectedTextBox;






if(!box){

return;

}






/*
   Evite efase pandan moun ap tape
   andedan Text Box la
*/

if(
document.activeElement === box
){

return;

}







e.preventDefault();

e.stopPropagation();








box.remove();








const handles =
document.querySelector(
".cwTextBoxHandles"
);





if(handles){

handles.remove();

}








window.CampusWordSelectedTextBox =
null;






},
false
);






})();

















/* =========================================================
   CAMPUS WORD — WORDART BUTTON ACTIVE STATE
   STEP 1
   ACTIVATE / DEACTIVATE WORDART BUTTON
   GREEN ACTIVE COLOR
   ISOLATED MODULE
   NO TEXTBOX INTERFERENCE
   NO SHAPE / CLIPART / CARET INTERFERENCE
========================================================= */

(function(){


document.addEventListener(
    "click",
    function(e){


        const button =
            e.target.closest(
                '[data-action="insert-wordart"]'
            );


        if(!button){

            return;

        }



        e.preventDefault();

        e.stopPropagation();



        button.classList.toggle(
            "cwWordArtActive"
        );



    },
    false
);



})();









/* =========================================================
   CAMPUS WORD — WORDART INSERT MODE ENGINE
   STEP 2
   ACTIVATE WORDART INSERT MODE
   SAVE STATE ONLY
   NO CREATION
   NO TEXTBOX INTERFERENCE
   NO SHAPE / CLIPART / CARET INTERFERENCE
   ISOLATED MODULE
========================================================= */

(function(){


let wordArtMode = false;



window.CampusWordWordArtData = {

    active:false,

    text:"",

    position:null


};







document.addEventListener(
    "click",
    function(e){



        const button =
            e.target.closest(
                '[data-action="insert-wordart"]'
            );



        if(!button){

            return;

        }





        e.preventDefault();

        e.stopPropagation();







        wordArtMode =
            button.classList.contains(
                "cwWordArtActive"
            );





        window.CampusWordWordArtData.active =
            wordArtMode;






        if(!wordArtMode){


            window.CampusWordWordArtData.position =
                null;


        }







        console.log(
            "WordArt Mode:",
            wordArtMode
        );




    },
    false
);









document.addEventListener(
    "pointerdown",
    function(e){



        if(
            !window.CampusWordWordArtData.active
        ){

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






        window.CampusWordWordArtData.position = {


            x:
            e.clientX - rect.left,


            y:
            e.clientY - rect.top,


            page:page



        };






        console.log(
            "WordArt position:",
            window.CampusWordWordArtData.position
        );





    },
    {
        passive:false
    }
);



})();











/* =========================================================
   CAMPUS WORD — ADVANCED WORDART GALLERY ENGINE
   STEP 3
   SVG WORDART STYLE GALLERY
   SHOW WORDART MODELS ONLY
   SELECT WORDART STYLE
   READY FOR SHADOW / SHAPE EFFECTS
   ISOLATED SYSTEM
   NO CLIPART INTERFERENCE
   NO SHAPE INTERFERENCE
   NO TEXTBOX INTERFERENCE
========================================================= */

(function(){


let wordArtGalleryOpen = false;



const wordArts = [


{
name:"Classic Blue Horizontal",
svg:`
<svg viewBox="0 0 260 80">
<text x="130"
y="50"
text-anchor="middle"
font-size="34"
font-weight="900"
fill="#2563eb">
Ranise
</text>
</svg>`
},



{
name:"Multi Color WordArt",
svg:`
<svg viewBox="0 0 260 80">
<defs>
<linearGradient id="multi">
<stop stop-color="#ef4444"/>
<stop offset=".25" stop-color="#facc15"/>
<stop offset=".5" stop-color="#22c55e"/>
<stop offset=".75" stop-color="#2563eb"/>
<stop offset="1" stop-color="#9333ea"/>
</linearGradient>
</defs>

<text x="130"
y="50"
text-anchor="middle"
font-size="34"
font-weight="900"
fill="url(#multi)">
Ranise
</text>

</svg>`
},



{
name:"Gold Luxury 3D",
svg:`
<svg viewBox="0 0 260 80">

<text x="130"
y="55"
text-anchor="middle"
font-size="38"
font-weight="900"
fill="#92400e">
Ranise
</text>


<text x="130"
y="48"
text-anchor="middle"
font-size="38"
font-weight="900"
fill="#facc15">
Ranise
</text>

</svg>`
},




{
name:"Shadow Professional",
svg:`
<svg viewBox="0 0 260 80">

<text x="134"
y="54"
text-anchor="middle"
font-size="36"
font-weight="900"
fill="#94a3b8">
Ranise
</text>

<text x="130"
y="48"
text-anchor="middle"
font-size="36"
font-weight="900"
fill="#111827">
Ranise
</text>

</svg>`
},




{
name:"Wave WordArt",
svg:`
<svg viewBox="0 0 260 100">

<path id="waveRanise"
d="M20 60 Q70 10 130 60 T240 60"
fill="none"/>

<text font-size="34"
font-weight="900"
fill="#16a34a">

<textPath href="#waveRanise">
Ranise
</textPath>

</text>

</svg>`
},




{
name:"Vertical WordArt",
svg:`
<svg viewBox="0 0 100 220">

<text x="50"
y="35"
text-anchor="middle"
font-size="30"
font-weight="900">

<tspan x="50">R</tspan>
<tspan x="50" dy="32">a</tspan>
<tspan x="50" dy="32">n</tspan>
<tspan x="50" dy="32">i</tspan>
<tspan x="50" dy="32">s</tspan>
<tspan x="50" dy="32">e</tspan>

</text>

</svg>`
},




{
name:"Fire WordArt",
svg:`
<svg viewBox="0 0 260 80">

<defs>
<linearGradient id="fire">
<stop stop-color="#ef4444"/>
<stop offset="1" stop-color="#f97316"/>
</linearGradient>
</defs>

<text x="130"
y="50"
text-anchor="middle"
font-size="36"
font-weight="900"
fill="url(#fire)">
Ranise
</text>

</svg>`
},




{
name:"Ocean Glass",
svg:`
<svg viewBox="0 0 260 80">

<defs>
<linearGradient id="glass">
<stop stop-color="#38bdf8"/>
<stop offset="1" stop-color="#0f766e"/>
</linearGradient>
</defs>

<text x="130"
y="50"
text-anchor="middle"
font-size="34"
font-weight="900"
fill="url(#glass)">
Ranise
</text>

</svg>`
},




{
name:"Royal Purple",
svg:`
<svg viewBox="0 0 260 80">

<text x="130"
y="50"
text-anchor="middle"
font-size="36"
font-weight="900"
fill="#9333ea">
Ranise
</text>

</svg>`
},




{
name:"Diamond Silver",
svg:`
<svg viewBox="0 0 260 80">

<defs>
<linearGradient id="silver">
<stop stop-color="#ffffff"/>
<stop offset=".5" stop-color="#64748b"/>
<stop offset="1" stop-color="#e2e8f0"/>
</linearGradient>
</defs>

<text x="130"
y="50"
text-anchor="middle"
font-size="34"
font-weight="900"
fill="url(#silver)">
Ranise
</text>

</svg>`
}

];



window.CampusWordSelectedWordArt = null;



function openWordArtGallery(){


if(wordArtGalleryOpen){

return;

}


wordArtGalleryOpen=true;



const box=document.createElement("div");


box.className="cwWordArtGallery";



box.innerHTML=`

<div class="cwWordArtBox">

<h3>
WordArt Gallery
</h3>


<div class="cwWordArtGrid">


${wordArts.map(item=>`

<div class="cwWordArtItem"
data-wordart="${item.name}">


<div class="cwWordArtPreview">

${item.svg}

</div>


<span>
${item.name}
</span>


</div>

`).join("")}


</div>


<button class="cwWordArtClose">
Close
</button>


</div>

`;



document.body.appendChild(box);





box.querySelectorAll(
".cwWordArtItem"
)
.forEach(function(item){


item.onclick=function(e){


e.preventDefault();



box.querySelectorAll(
".cwWordArtItem"
)
.forEach(function(old){

old.classList.remove(
"cwWordArtSelected"
);

});



item.classList.add(
"cwWordArtSelected"
);



window.CampusWordSelectedWordArt =
item.dataset.wordart;



};


});






box.querySelector(
".cwWordArtClose"
)
.onclick=function(){


box.remove();


wordArtGalleryOpen=false;


window.CampusWordSelectedWordArt=null;


};


}





document.addEventListener(
"click",
function(e){


const button =
e.target.closest(
'[data-action="insert-wordart"]'
);



if(!button){

return;

}



e.preventDefault();

e.stopPropagation();



openWordArtGallery();



},
false
);



})();

















/* =========================================================
   CAMPUS WORD — WORDART TEXT EDITOR ENGINE
   STEP 4
   OPEN WORDART TEXT EDITOR BOX
   EDIT CUSTOM WORDART TEXT
   KEEP SELECTED WORDART STYLE
   NO INSERTION YET
   ISOLATED SYSTEM
   NO CLIPART INTERFERENCE
   NO SHAPE INTERFERENCE
   NO TEXTBOX INTERFERENCE
========================================================= */

(function(){



let wordArtEditorOpen = false;



window.CampusWordPendingWordArt = null;




function openWordArtEditor(){



if(wordArtEditorOpen){

return;

}



const selected =
window.CampusWordSelectedWordArt;



if(!selected){

return;

}




wordArtEditorOpen = true;



window.CampusWordPendingWordArt =
selected;





const box =
document.createElement(
"div"
);



box.className =
"cwWordArtEditor";





box.innerHTML = `


<div class="cwWordArtEditorBox">


<h3>
WordArt Text Editor
</h3>



<div class="cwWordArtSelectedName">

${selected}

</div>




<div class="cwWordArtEditorPreview">

${selected}

</div>




<input
class="cwWordArtTextInput"
type="text"
value="Ranise"
/>





<div class="cwWordArtEditorButtons">


<button class="cwWordArtCancel">

Cancel

</button>



<button class="cwWordArtInsert">

Insert

</button>



</div>



</div>


`;





document.body.appendChild(box);







box.querySelector(
".cwWordArtCancel"
)
.onclick=function(){



box.remove();


wordArtEditorOpen=false;


window.CampusWordPendingWordArt=null;



};






box.querySelector(
".cwWordArtInsert"
)
.onclick=function(){



window.CampusWordTextValue =
box.querySelector(
".cwWordArtTextInput"
).value;



/*
STEP 5 WILL USE THIS DATA
NO INSERTION HERE
*/



box.remove();


wordArtEditorOpen=false;



console.log(
"WordArt Ready:",
window.CampusWordTextValue,
window.CampusWordPendingWordArt
);



};





}








document.addEventListener(
"click",
function(e){





const item =
e.target.closest(
".cwWordArtItem"
);



if(!item){

return;

}






setTimeout(function(){


if(
window.CampusWordSelectedWordArt
){


openWordArtEditor();


}


},50);





},
false
);






})();














/* =========================================================
   CAMPUS WORD — WORDART INSERT ENGINE
   STEP 5
   INSERT CREATED WORDART INTO PAGE
   USE SELECTED STYLE + CUSTOM TEXT
   NO GALLERY INTERFERENCE
   NO CLIPART INTERFERENCE
   NO SHAPE INTERFERENCE
   NO TEXTBOX INTERFERENCE
========================================================= */

(function(){



function createWordArtElement(
    text,
    style
){



const wordArt =
document.createElement(
"div"
);



wordArt.className =
"cwInsertedWordArt";



wordArt.dataset.wordart =
style;



wordArt.style.position =
"absolute";



wordArt.style.left =
"100px";



wordArt.style.top =
"100px";



wordArt.style.cursor =
"move";



wordArt.style.userSelect =
"none";



wordArt.style.fontSize =
"38px";



wordArt.style.fontWeight =
"900";



wordArt.style.padding =
"10px";



wordArt.style.whiteSpace =
"nowrap";





/* STYLE MATCHING */


if(style==="Multi Color WordArt"){


wordArt.style.background =
"linear-gradient(90deg,#ef4444,#facc15,#22c55e,#2563eb,#9333ea)";


wordArt.style.webkitBackgroundClip =
"text";


wordArt.style.color =
"transparent";


}



else if(style==="Gold Luxury 3D"){


wordArt.style.color =
"#facc15";


wordArt.style.textShadow =
"3px 3px 0 #92400e";


}





else if(style==="Shadow Professional"){


wordArt.style.color =
"#111827";


wordArt.style.textShadow =
"4px 4px 5px #94a3b8";


}



else if(style==="Fire WordArt"){


wordArt.style.color =
"#ef4444";


wordArt.style.textShadow =
"2px 2px 4px #f97316";


}



else if(style==="Ocean Glass"){


wordArt.style.color =
"#0284c7";


wordArt.style.textShadow =
"2px 2px 5px #38bdf8";


}





else if(style==="Royal Purple"){


wordArt.style.color =
"#9333ea";


wordArt.style.textShadow =
"3px 3px 5px #c4b5fd";


}





else if(style==="Diamond Silver"){


wordArt.style.color =
"#94a3b8";


wordArt.style.textShadow =
"2px 2px 5px #e2e8f0";


}






else if(style==="Wave WordArt"){


wordArt.dataset.wordart =
"Wave WordArt";


wordArt.classList.add(
    "cwWordArtWave"
);



wordArt.innerHTML =
"";



wordArt.setAttribute(
    "viewBox",
    "0 0 320 170"
);



wordArt.setAttribute(
    "width",
    "320"
);



wordArt.setAttribute(
    "height",
    "170"
);





const letters =
text.split("");



const center =
(letters.length - 1) / 2;



const radius =
120;



const svgNS =
"http://www.w3.org/2000/svg";





letters.forEach(
function(letter,index){



const textNode =
document.createElementNS(
svgNS,
"text"
);



textNode.textContent =
letter;



const angle =
(
(index - center)
/
center
)
*
45;



const rad =
angle *
Math.PI /
180;




const x =
160 +
Math.sin(rad) *
radius;



const y =
40 +
radius -
(
Math.cos(rad) *
radius
);





textNode.setAttribute(
"x",
x
);



textNode.setAttribute(
"y",
y
);



textNode.setAttribute(
"text-anchor",
"middle"
);



textNode.setAttribute(
"fill",
"#16a34a"
);



textNode.setAttribute(
"font-size",
"38"
);



textNode.setAttribute(
"font-weight",
"900"
);



textNode.setAttribute(
"transform",
"rotate(" +
angle +
" " +
x +
" " +
y +
")"
);





textNode.style.filter =
"drop-shadow(2px 3px 3px #86efac)";





wordArt.appendChild(
textNode
);



}

);



}












else if(style==="Vertical WordArt"){


wordArt.style.color =
"#2563eb";


wordArt.style.writingMode =
"vertical-rl";


wordArt.style.textOrientation =
"mixed";


}





else{


wordArt.style.color =
"#2563eb";


}










wordArt.innerHTML =
text;



return wordArt;



}









document.addEventListener(
"click",
function(e){



const button =
e.target.closest(
".cwWordArtInsert"
);



if(!button){

return;

}




e.preventDefault();

e.stopPropagation();






const text =
window.CampusWordTextValue;



const style =
window.CampusWordPendingWordArt;



if(
!text ||
!style
){

return;

}







const page =
document.querySelector(
".cwPageContent"
);



if(!page){

return;

}






const wordArt =
createWordArtElement(
text,
style
);






page.appendChild(
wordArt
);






window.CampusWordSelectedWordArtObject =
wordArt;





/*
RESET DATA
*/


window.CampusWordTextValue =
null;



window.CampusWordPendingWordArt =
null;



console.log(
"WordArt inserted:",
text,
style
);



},
false
);



})();












/* =========================================================
   CAMPUS WORD — WORDART MOVE ENGINE
   STEP 6 MOVE
   TOUCH + MOUSE SUPPORT
   MOVE WORDART ONLY
   ISOLATED SYSTEM
   NO CLIPART INTERFERENCE
   NO SHAPE INTERFERENCE
   NO TEXTBOX INTERFERENCE
   NO CARET INTERFERENCE
========================================================= */

(function(){



let moving = false;

let activeWordArt = null;


let startX = 0;

let startY = 0;


let startLeft = 0;

let startTop = 0;






document.addEventListener(
    "pointerdown",
    function(e){



        const wordArt =
            e.target.closest(
                ".cwInsertedWordArt"
            );



        if(!wordArt){

            return;

        }




        activeWordArt =
            wordArt;



        window.CampusWordSelectedWordArtObject =
            wordArt;




        moving = true;



        startX =
            e.clientX;



        startY =
            e.clientY;



        startLeft =
            wordArt.offsetLeft;



        startTop =
            wordArt.offsetTop;




        wordArt.setPointerCapture(
            e.pointerId
        );



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
            !moving ||
            !activeWordArt
        ){

            return;

        }





        const dx =
            e.clientX -
            startX;



        const dy =
            e.clientY -
            startY;






        activeWordArt.style.left =
            (
                startLeft +
                dx
            ) + "px";



        activeWordArt.style.top =
            (
                startTop +
                dy
            ) + "px";




    },
    {
        passive:false
    }
);









document.addEventListener(
    "pointerup",
    function(){



        moving = false;


        activeWordArt = null;



    },
    false
);





})();













/* =========================================================
   CAMPUS WORD — WORDART 4 HANDLES DISPLAY ENGINE
   STEP 7 ONLY
   CREATE 4 LARGE TOUCH HANDLES
   NO RESIZE
   NO MOVE
   NO OTHER ACTION
   WORDART ONLY
========================================================= */

(function(){


function removeWordArtHandles(){


    const old =
    document.querySelector(
        ".cwWordArtHandles"
    );


    if(old){

        old.remove();

    }

}





function showWordArtHandles(wordArt){


    removeWordArtHandles();



    const box =
    document.createElement(
        "div"
    );


    box.className =
    "cwWordArtHandles";



    box.style.position =
    "absolute";


    box.style.left =
    wordArt.offsetLeft + "px";


    box.style.top =
    wordArt.offsetTop + "px";


    box.style.width =
    wordArt.offsetWidth + "px";


    box.style.height =
    wordArt.offsetHeight + "px";



    box.innerHTML = `


    <div class="cwWordHandle top"></div>


    <div class="cwWordHandle bottom"></div>


    <div class="cwWordHandle left"></div>


    <div class="cwWordHandle right"></div>


    `;



    wordArt.parentElement.appendChild(
        box
    );


}








document.addEventListener(
"pointerdown",
function(e){


    const wordArt =
    e.target.closest(
        ".cwInsertedWordArt"
    );



    if(!wordArt){

        return;

    }



    window.CampusWordSelectedWordArtObject =
    wordArt;



    showWordArtHandles(
        wordArt
    );



},
{
passive:true
}
);






})();














/* =========================================================
   CAMPUS WORD — WORDART 4 HANDLES RESIZE ACTION
   STEP 8 RESIZE ONLY
   SCALE ONLY
   NO TEXT CUT
   TOUCH + MOUSE SUPPORT
   WORDART ONLY
========================================================= */

(function(){


let resizing = false;

let activeWordArt = null;

let direction = null;


let startX = 0;

let startY = 0;


let startScale = 1;




document.addEventListener(
"pointerdown",
function(e){



const handle =
e.target.closest(
".cwWordHandle"
);



if(!handle){

return;

}



activeWordArt =
window.CampusWordSelectedWordArtObject;



if(!activeWordArt){

return;

}



if(handle.classList.contains("right")){

direction="right";

}

else if(handle.classList.contains("left")){

direction="left";

}

else if(handle.classList.contains("top")){

direction="top";

}

else if(handle.classList.contains("bottom")){

direction="bottom";

}



resizing = true;



startX =
e.clientX;


startY =
e.clientY;



startScale =
parseFloat(
activeWordArt.dataset.wordScale || "1"
);



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
!resizing ||
!activeWordArt
){

return;

}



const dx =
e.clientX -
startX;



const dy =
e.clientY -
startY;



let change = 0;



if(
direction==="right" ||
direction==="left"
){

change =
dx / 250;

}



if(
direction==="top" ||
direction==="bottom"
){

change =
dy / 250;

}





let scale =
startScale +
change;



if(scale < 0.3){

scale = 0.3;

}



if(scale > 3){

scale = 3;

}




activeWordArt.style.transform =
"scale(" + scale + ")";



activeWordArt.style.transformOrigin =
"center center";



activeWordArt.dataset.wordScale =
scale;





},
{
passive:false
}
);










document.addEventListener(
"pointerup",
function(){


resizing=false;

activeWordArt=null;

direction=null;


},
false
);



})();











/* =========================================================
   CAMPUS WORD — WORDART HANDLE AUTO HIDE ENGINE
   REMOVE HANDLES WHEN CLICK OUTSIDE
   WORDART ONLY
   ISOLATED SYSTEM
========================================================= */

(function(){


document.addEventListener(
"pointerdown",
function(e){



const insideWordArt =
e.target.closest(
".cwInsertedWordArt"
);



const insideHandles =
e.target.closest(
".cwWordArtHandles"
);



if(
insideWordArt ||
insideHandles
){

    return;

}




const handles =
document.querySelector(
".cwWordArtHandles"
);



if(handles){

    handles.remove();

}



window.CampusWordSelectedWordArtObject =
null;



},
false
);



})();












/* =========================================================
   CAMPUS WORD — FLOATING ROTATION BOX ENGINE
   STEP 10
   SHOW ROTATION BOX WHEN OBJECT IS SELECTED
   DISPLAY ONLY
   NO ROTATION ACTION
   ALL OBJECT TYPES SUPPORT
   ISOLATED SYSTEM
========================================================= */

(function(){


let rotationBox = null;



function createRotationBox(){


    if(rotationBox){

        return;

    }



    rotationBox =
    document.createElement(
        "div"
    );



    rotationBox.className =
    "cwFloatingRotationBox";



    rotationBox.innerHTML = `

        <div class="cwRotationTitle">
            Rotation
        </div>

        <div class="cwRotationButtons">

            <button data-rotation="right">
                ↻
            </button>

            <button data-rotation="left">
                ↺
            </button>

            <button data-rotation="up">
                ↑
            </button>

            <button data-rotation="down">
                ↓
            </button>

            <button data-rotation="top-left">
                ↖
            </button>

            <button data-rotation="top-right">
                ↗
            </button>

            <button data-rotation="bottom-left">
                ↙
            </button>

            <button data-rotation="bottom-right">
                ↘
            </button>

        </div>

    `;



    document.body.appendChild(
        rotationBox
    );


}






function removeRotationBox(){


    if(rotationBox){

        rotationBox.remove();

        rotationBox=null;

    }


}










document.addEventListener(
"pointerdown",
function(e){



const clickedRotationBox =
e.target.closest(
".cwFloatingRotationBox"
);



if(clickedRotationBox){

    return;

}





const selectedObject =
window.CampusWordSelectedWordArtObject ||
window.CampusWordSelectedShape ||
window.CampusWordSelectedClipart ||
window.CampusWordSelectedImage ||
window.CampusSelectedObject;



if(selectedObject){

    createRotationBox();

    return;

}





removeRotationBox();



},
false
);












/*
   Lè yon lòt sistèm kreye handles
   li ka rele fonksyon sa a
*/

window.CampusWordShowRotationBox =
function(){

    createRotationBox();

};





window.CampusWordHideRotationBox =
function(){

    removeRotationBox();

};





})();








/* =========================================================
   CAMPUS WORD — ROTATION BUTTON ENGINE
   STEP 11
   ROTATE ACTIVE OBJECT USING ROTATION BOX
   ALL OBJECT TYPES SUPPORT
   TOUCH + MOUSE
   ROTATE IN PLACE ONLY
   ISOLATED SYSTEM
========================================================= */

(function(){


let rotationValue = 0;



function getActiveObject(){


return (
window.CampusWordSelectedWordArtObject ||
window.CampusWordSelectedShape ||
window.CampusWordSelectedClipart ||
window.CampusWordSelectedImage ||
window.CampusSelectedObject ||
null
);


}






document.addEventListener(
"pointerdown",
function(e){



const button =
e.target.closest(
".cwRotationButtons button"
);



if(!button){

    return;

}




const object =
getActiveObject();



if(!object){

    return;

}





if(!object.dataset.rotation){

    object.dataset.rotation = "0";

}





rotationValue =
parseFloat(
object.dataset.rotation
);





let action =
button.dataset.rotation;





switch(action){


case "right":

    rotationValue += 15;

break;



case "left":

    rotationValue -= 15;

break;



case "up":

    rotationValue -= 90;

break;



case "down":

    rotationValue += 90;

break;



case "top-left":

    rotationValue -= 45;

break;



case "top-right":

    rotationValue += 45;

break;



case "bottom-left":

    rotationValue -= 135;

break;



case "bottom-right":

    rotationValue += 135;

break;


}





object.dataset.rotation =
rotationValue;





/*
   ROTATION SOU PLAS LI
   PA CHANJE POSITION OBJE A
*/

object.style.transformOrigin =
"center center";



object.style.transform =
"rotate("
+
rotationValue
+
"deg)";





e.preventDefault();

e.stopPropagation();



},
{
passive:false
}
);



})();
















































/* =========================================================
   CAMPUS WORD — PRINT PREVIEW ENGINE
   OFFICE BUTTON PRINT PREVIEW
   ISOLATED SYSTEM
   NO CORE ENGINE INTERFERENCE
========================================================= */

(function(){


let previewActive = false;



function enterPrintPreview(){


    if(previewActive){

        return;

    }



    const app =
    document.getElementById(
        "cwWindow"
    );



    const documentArea =
    document.getElementById(
        "cwDocumentContainer"
    );



    if(!app || !documentArea){

        return;

    }





    previewActive = true;



    app.classList.add(
        "cwPrintPreviewMode"
    );



    documentArea.classList.add(
        "cwPreviewDocument"
    );



}








function exitPrintPreview(){



    const app =
    document.getElementById(
        "cwWindow"
    );



    const documentArea =
    document.getElementById(
        "cwDocumentContainer"
    );




    if(app){

        app.classList.remove(
            "cwPrintPreviewMode"
        );

    }




    if(documentArea){

        documentArea.classList.remove(
            "cwPreviewDocument"
        );

    }




    previewActive = false;



}









/* =========================================================
   PRINT PREVIEW TOGGLE CONTROL
   STEP 3
   SAME BUTTON OPEN / CLOSE
========================================================= */

document.addEventListener(
"click",
function(e){


const button =
e.target.closest(
'[data-action="print-preview"]'
);



if(!button){

    return;

}




e.preventDefault();

e.stopPropagation();





if(previewActive){


    exitPrintPreview();


}
else{


    enterPrintPreview();


}




},
false
);









window.CampusWordClosePrintPreview =
function(){

    exitPrintPreview();

};





})();










/* =========================================================
   CAMPUS WORD — PRINT PREVIEW PAGE ZOOM ENGINE
   STEP 2
   ACTIVE PAGE ONLY
   CLICK = 100%
   CLICK AGAIN = 50%
   NO OTHER PAGE INTERFERENCE
========================================================= */

(function(){


document.addEventListener(
"click",
function(e){



const page =
e.target.closest(
".cwPrintPreviewMode .cwPage"
);



if(!page){

    return;

}





const active =
page.classList.contains(
"cwPreviewZoom100"
);





document
.querySelectorAll(
".cwPrintPreviewMode .cwPage"
)
.forEach(function(oldPage){


oldPage.classList.remove(
"cwPreviewZoom100"
);


});







if(!active){


page.classList.add(
"cwPreviewZoom100"
);


}



},
false
);



})();









/* =========================================================
   CAMPUS WORD — NEW DOCUMENT ENGINE
   SAFE RESET
   OFFICE MENU NEW BUTTON
   USE CORE PAGE SYSTEM
   ISOLATED SYSTEM
========================================================= */

(function(){






function createNewDocument(){


const workspace =
document.getElementById(
"cwDocumentContainer"
);



if(!workspace){

    return;

}




/* Clear current document */

workspace.innerHTML = "";





/* Reset state safely */

if(
window.CampusWord2007Simulateur &&
CampusWord2007Simulateur.state
){

    CampusWord2007Simulateur.state.pages = [];

    CampusWord2007Simulateur.state.activePageIndex = 0;

    CampusWord2007Simulateur.state.wordCount = 0;

}






/* Create new page */

const page =
document.createElement(
"div"
);


page.className =
"cwPage active";





const content =
document.createElement(
"div"
);


content.className =
"cwPageContent";


content.contentEditable = true;





/* Reconnect page input system */

content.addEventListener(
"input",
()=>{


requestAnimationFrame(()=>{


CampusWord2007Simulateur.calculateWordCount(
content.innerText
);


CampusWord2007Simulateur.checkPageOverflow(
content
);



});


}
);





page.appendChild(
content
);


workspace.appendChild(
page
);







/* Register page inside Core State */

if(
window.CampusWord2007Simulateur &&
CampusWord2007Simulateur.state
){

    CampusWord2007Simulateur.state.pages.push(
        page
    );

}







CampusWord2007Simulateur.updatePageStatus();

CampusWord2007Simulateur.updateStatus();






setTimeout(()=>{

content.focus();

},0);



}















document.addEventListener(
"click",
function(e){



const button =
e.target.closest(
'[data-action="new"]'
);



if(!button){

    return;

}



e.preventDefault();

e.stopPropagation();



createNewDocument();



},
false
);





})();























/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SAVE AS ENGINE v1.1.0
   PROFESSIONAL HTML EXPORT FOUNDATION
========================================================= */

(function () {

"use strict";


if (!CampusWord2007Simulateur.state) return;




   

CampusWord2007Simulateur.state.documentName = "Document1";
CampusWord2007Simulateur.state.documentSaved = false;



CampusWord2007Simulateur.state.currentDocumentId =
null;

CampusWord2007Simulateur.state.currentDocumentIsNew =
true;
   

CampusWord2007Simulateur.SaveAsEngine = {

/*
=========================================================
PASSWORD TEMP STORAGE
=========================================================
*/



    getDocumentHTML(){


        const pages =
        document.querySelectorAll(".cwPageContent");


        let content = "";


        pages.forEach((page)=>{


            content += `
            <div class="page">
                ${page.innerHTML}
            </div>
            `;


        });



        return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
${this.escapeHTML(
CampusWord2007Simulateur.state.documentName
)}
</title>


<style>

body{
font-family:Arial,sans-serif;
}

.page{

width:800px;
min-height:1000px;
margin:20px auto;
padding:40px;
border:1px solid #ccc;

}

</style>


</head>


<body>

${content}

</body>

</html>
`;



},




escapeHTML(text){

return text
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;");

},






updateTitle(name){


CampusWord2007Simulateur
.state.documentName = name;



const title =
document.getElementById("cwTitle");



if(title){

title.textContent =
name +
" - Campus Word 2007 Simulation";

}


},






createDialog(){



const overlay =
document.createElement("div");


overlay.className =
"cwSaveAsOverlay";





const dialog =
document.createElement("div");


dialog.className =
"cwSaveAsDialog";





dialog.innerHTML = `


<h3>
Save As
</h3>


<input
type="text"
class="cwSaveAsInput"
value="${CampusWord2007Simulateur.state.documentName}"
placeholder="Document name">






<div class="cwSaveAsOptions">

    <div class="cwSaveOptionsHeader">

        <span class="cwSaveOptionsArrow">
            ▶
        </span>

        <span class="cwSaveOptionsTitle">
            Options
        </span>

    </div>

    <div class="cwSaveOptionsContent">

        <div class="cwPasswordOption">

            🔒 Password...

        </div>

    </div>

</div>





   
<div class="cwSaveAsButtons">

<button class="cwSaveConfirm">
Save
</button>


<button class="cwSaveCancel">
Cancel
</button>


</div>

`;





document.body.appendChild(overlay);

document.body.appendChild(dialog);






/*
=========================================================
SAVE AS OPTIONS
=========================================================
*/

const optionsHeader =
dialog.querySelector(
".cwSaveOptionsHeader"
);

const optionsArrow =
dialog.querySelector(
".cwSaveOptionsArrow"
);

const optionsContent =
dialog.querySelector(
".cwSaveOptionsContent"
);

if(
optionsHeader &&
optionsArrow &&
optionsContent
){

    optionsContent.style.display =
    "none";

    optionsHeader.onclick = ()=>{

        const opened =
        optionsContent.style.display ===
        "block";

        if(opened){

            optionsContent.style.display =
            "none";

            optionsArrow.textContent =
            "▶";

        }
        else{

            optionsContent.style.display =
            "block";

            optionsArrow.textContent =
            "▼";

        }

    };

}










   

/*
=========================================================
PASSWORD DIALOG CONNECTION
=========================================================
*/

const passwordOption =
dialog.querySelector(
".cwPasswordOption"
);


if(passwordOption){


    passwordOption.onclick = ()=>{


        const passwordOverlay =
        document.createElement("div");


        passwordOverlay.className =
        "cwPasswordOverlay";



        const passwordDialog =
        document.createElement("div");


        passwordDialog.className =
        "cwPasswordDialog";



        passwordDialog.innerHTML = `


        <h3>
            Password
        </h3>



        <label>
            Password
        </label>


        <input
        type="password"
        class="cwPasswordInput"
        placeholder="Enter password">



        <label>
            Confirm password
        </label>


        <input
        type="password"
        class="cwPasswordConfirmInput"
        placeholder="Confirm password">





        <div class="cwPasswordButtons">


            <button class="cwPasswordOK">

                OK

            </button>



            <button class="cwPasswordCancel">

                Cancel

            </button>


        </div>


        `;



        document.body.appendChild(
            passwordOverlay
        );


        document.body.appendChild(
            passwordDialog
        );





        passwordDialog
        .querySelector(
            ".cwPasswordCancel"
        )
        .onclick = ()=>{


            passwordDialog.remove();

            passwordOverlay.remove();


        };





        passwordDialog
        .querySelector(
            ".cwPasswordOK"
        )
        .onclick = ()=>{


            const pass =
            passwordDialog.querySelector(
            ".cwPasswordInput"
            ).value;



            const confirm =
            passwordDialog.querySelector(
            ".cwPasswordConfirmInput"
            ).value;




            if(
            pass !== confirm
            ){

                alert(
                "Passwords do not match"
                );

                return;

            }

         CampusWord2007Simulateur
         .SaveAsEngine
         .selectedPassword = pass;
           

            passwordDialog.remove();

            passwordOverlay.remove();



            alert(
            "Password created successfully"
            );



        };



    };


}





   
const input =
dialog.querySelector(".cwSaveAsInput");



input.focus();

input.select();




dialog
.querySelector(".cwSaveCancel")
.onclick = ()=>{


dialog.remove();

overlay.remove();


};







dialog
.querySelector(".cwSaveConfirm")
.onclick = ()=>{


const name =
input.value.trim();



if(!name) return;



this.exportHTML(name);



dialog.remove();

overlay.remove();



};




},






exportHTML(name){



this.updateTitle(name);



const html =
this.getDocumentHTML();




/*
   SAVE INTO DOCUMENT LIBRARY
*/


if(
CampusWord2007Simulateur.DocumentLibrary
){

    const savedDocument =

    CampusWord2007Simulateur
    .DocumentLibrary
    .addDocument(
        name,
        html,
        this.selectedPassword
    );

    CampusWord2007Simulateur
    .state.currentDocumentId =
    savedDocument.id;

    CampusWord2007Simulateur
    .state.currentDocumentIsNew =
    false;

}




   

const blob =
new Blob(
[html],
{
type:"text/html;charset=utf-8"
}
);




const link =
document.createElement("a");



link.href =
URL.createObjectURL(blob);



link.download =
name + ".html";



document.body.appendChild(link);


link.click();


link.remove();




URL.revokeObjectURL(link.href);



CampusWord2007Simulateur
.state.documentSaved = true;



}






};







document.addEventListener(
"click",
function(e){


const item =
e.target.closest(".cwOfficeItem");



if(!item) return;



if(item.dataset.action === "save-as"){


CampusWord2007Simulateur
.SaveAsEngine
.createDialog();


}



});





})();








































/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   DOCUMENT LIBRARY ENGINE v1.0.0
   LOCAL DOCUMENT STORAGE FOUNDATION
========================================================= */

(function () {

"use strict";


if(!CampusWord2007Simulateur.state){
    CampusWord2007Simulateur.state = {};
}





CampusWord2007Simulateur.DocumentLibrary = {



    key:
    "CampusWord2007_DocumentLibrary",






    getDocuments(){


        const data =
        localStorage.getItem(
            this.key
        );



        if(!data){

            return [];

        }



        try{


            return JSON.parse(
                data
            );


        }
        catch(error){


            console.error(
                "Document Library Error:",
                error
            );


            return [];


        }


    },







    saveDocuments(documents){


        localStorage.setItem(
            this.key,
            JSON.stringify(
                documents
            )
        );


    },







   addDocument(name,html,password){

    const documents =
    this.getDocuments();



    /*
       CHECK SAME DOCUMENT NAME
    */

    const existing =
    documents.find(
        doc =>

        doc.name.trim().toLowerCase() ===
        name.trim().toLowerCase()
    );



    /*
       UPDATE EXISTING DOCUMENT
    */

    if(existing){

        existing.html =
        html;

        existing.updated =
        new Date()
        .toISOString();

        this.saveDocuments(
            documents
        );

        return existing;

    }



    /*
       CREATE NEW DOCUMENT
    */

    const documentItem = {

        id:
        Date.now(),

        name:
        name,

        html:
        html,
       
       password:
        password,

        created:
        new Date()
        .toISOString()

    };



    documents.push(
        documentItem
    );



    this.saveDocuments(
        documents
    );



    return documentItem;

},




    updateDocument(id,html){


        const documents =
        this.getDocuments();




        const index =
        documents.findIndex(
            doc =>
            doc.id === id
        );




        if(index === -1){

            return false;

        }





        documents[index].html =
        html;





        documents[index].updated =
        new Date()
        .toISOString();





        this.saveDocuments(
            documents
        );



        return true;



    },









    deleteDocument(id){


        const documents =
        this.getDocuments();




        const filtered =
        documents.filter(
            doc =>
            doc.id !== id
        );





        this.saveDocuments(
            filtered
        );



    },

   renameDocument(id,newName){

    const documents =
    this.getDocuments();


    const index =
    documents.findIndex(
        doc =>
        doc.id === id
    );


    if(index === -1){

        return false;

    }


    documents[index].name =
    newName;


    documents[index].updated =
    new Date()
    .toISOString();


    this.saveDocuments(
        documents
    );


    return true;

}





};





})();












/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   OPEN ENGINE v1.1.0
   MULTI PAGE HTML DOCUMENT IMPORT
========================================================= */

(function () {

"use strict";


CampusWord2007Simulateur.OpenEngine = {



    loadHTML(html){


        const parser =
        new DOMParser();



        const doc =
        parser.parseFromString(
            html,
            "text/html"
        );



        const savedPages =
        doc.querySelectorAll(
            ".page"
        );



        const workspace =
        document.getElementById(
            "cwDocumentContainer"
        );



        if(!workspace) return;



        workspace.innerHTML = "";





        /*
           RESET PAGE STATE
        */


        if(
            CampusWord2007Simulateur.state &&
            CampusWord2007Simulateur.state.pages
        ){

            CampusWord2007Simulateur
            .state.pages = [];

        }






        savedPages.forEach((savedPage,index)=>{


            const newPage =
            document.createElement("div");



            newPage.className =
            "cwPage";




            if(index === 0){

                newPage.classList.add(
                    "active"
                );

            }





            const content =
            document.createElement("div");



            content.className =
            "cwPageContent";



            content.contentEditable = true;



            content.innerHTML =
            savedPage.innerHTML;








            /*
              RECONNECT EDIT EVENTS
            */


            content.addEventListener(
            "input",
            ()=>{


                requestAnimationFrame(
                ()=>{


                    if(
                    CampusWord2007Simulateur
                    .calculateWordCount
                    ){


                        CampusWord2007Simulateur
                        .calculateWordCount(
                            content.innerText
                        );


                    }





                    if(
                    CampusWord2007Simulateur
                    .checkPageOverflow
                    ){


                        CampusWord2007Simulateur
                        .checkPageOverflow(
                            content
                        );


                    }



                });


            });







            newPage.appendChild(
                content
            );



            workspace.appendChild(
                newPage
            );







            if(
            CampusWord2007Simulateur.state &&
            CampusWord2007Simulateur.state.pages
            ){


                CampusWord2007Simulateur
                .state.pages
                .push(
                    newPage
                );


            }




        });








        /*
          UPDATE PAGE STATUS
        */


        if(
        CampusWord2007Simulateur.updatePageStatus
        ){


            CampusWord2007Simulateur
            .updatePageStatus();


        }








        /*
          RESTORE TITLE
        */


        const title =
        document.getElementById(
            "cwTitle"
        );



        if(title){


            title.textContent =
            CampusWord2007Simulateur
            .state.documentName +
            " - Campus Word 2007 Simulation";


        }




    }




};





})();











/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   OPEN DIALOG ENGINE v1.0.0
   DOCUMENT LIBRARY OPEN WINDOW
========================================================= */

(function () {

"use strict";



CampusWord2007Simulateur.OpenDialog = {



    create(){


        const overlay =
        document.createElement("div");


        overlay.className =
        "cwSaveAsOverlay";





        const dialog =
        document.createElement("div");


        dialog.className =
        "cwSaveAsDialog";







        const documents =
        CampusWord2007Simulateur
        .DocumentLibrary
        .getDocuments();


console.log(documents);



        let listHTML = "";





        documents.forEach((doc)=>{


            listHTML += `


            <div
            class="cwOpenDocumentItem"
            data-id="${doc.id}">


                📄 ${doc.name}


            </div>


            `;



        });






        if(!documents.length){



            listHTML = `


            <div class="cwEmptyDocuments">

                No saved documents


            </div>


            `;


        }








        dialog.innerHTML = `



        <h3>

            Open

        </h3>





        <div class="cwOpenDocumentList">


            ${listHTML}


        </div>




<div class="cwSaveAsButtons">


    <button class="cwOpenConfirm">

        Open

    </button>



    <button class="cwRenameDocument">

        Rename

    </button>



    <button class="cwDeleteDocument">

        Delete

    </button>



    <button class="cwOpenCancel">

        Cancel

    </button>


</div>

        `;







        document.body.appendChild(
            overlay
        );



        document.body.appendChild(
            dialog
        );









        let selectedDocument = null;








        dialog
        .querySelectorAll(
            ".cwOpenDocumentItem"
        )
        .forEach((item)=>{



            item.onclick = ()=>{



                const id =
                Number(
                    item.dataset.id
                );





                const docs =
                CampusWord2007Simulateur
                .DocumentLibrary
                .getDocuments();





                selectedDocument =
                docs.find(
                    doc =>
                    doc.id === id
                );




            };



        });










        dialog
        .querySelector(
            ".cwOpenConfirm"
        )
        .onclick = ()=>{







if(selectedDocument){


    if(
    selectedDocument.password
    ){

        const enteredPassword =
        prompt(
            "Enter document password:"
        );


        if(
        enteredPassword !==
        selectedDocument.password
        ){

            alert(
                "Incorrect password"
            );

            return;

        }

    }



    CampusWord2007Simulateur
    .OpenEngine
    .loadHTML(
        selectedDocument.html
    );



            


                if(
                CampusWord2007Simulateur.state
                ){


                    CampusWord2007Simulateur
                    .state.documentName =
                    selectedDocument.name;



                  CampusWord2007Simulateur 
                  .state.currentDocumentId = 
                  selectedDocument.id;

                  CampusWord2007Simulateur 
                  .state.currentDocumentIsNew = 
                  false; 
                   
                }







                const title =
                document.getElementById(
                    "cwTitle"
                );





                if(title){



                    title.textContent =

                    selectedDocument.name +

                    " - Campus Word 2007 Simulation";



                }





            }







            dialog.remove();

            overlay.remove();





        };






   dialog
.querySelector(
".cwRenameDocument"
)
.onclick = ()=>{


if(!selectedDocument)
return;



const newName =
prompt(
"New document name:",
selectedDocument.name
);



if(!newName)
return;



CampusWord2007Simulateur
.DocumentLibrary
.renameDocument(
selectedDocument.id,
newName.trim()
);



dialog.remove();

overlay.remove();



this.create();


};





dialog
.querySelector(
".cwDeleteDocument"
)
.onclick = ()=>{


if(!selectedDocument)
return;



const ok =
confirm(
"Delete this document?"
);



if(!ok)
return;



CampusWord2007Simulateur
.DocumentLibrary
.deleteDocument(
selectedDocument.id
);



dialog.remove();

overlay.remove();



this.create();


};






        dialog
        .querySelector(
            ".cwOpenCancel"
        )
        .onclick = ()=>{



            dialog.remove();

            overlay.remove();



        };





    }





};









/* =========================================================
   CONNECT OFFICE OPEN BUTTON
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item) return;






    if(
    item.dataset.action === "open"
    ){



        CampusWord2007Simulateur
        .OpenDialog
        .create();



    }



});







})();














/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SAVE ENGINE v1.0.0
   UPDATE CURRENT DOCUMENT
========================================================= */

(function () {

"use strict";


CampusWord2007Simulateur.SaveEngine = {


    save(){


        if(
            !CampusWord2007Simulateur.state
        ){
            return;
        }



        /*
           SI DOKIMAN AN PA JANM SOVE
           -> OUVRI SAVE AS
        */

        if(

            CampusWord2007Simulateur
            .state.currentDocumentId === null

        ){

            CampusWord2007Simulateur
            .SaveAsEngine
            .createDialog();

            return;

        }



        /*
           REKIPERE HTML DOKIMAN AN
        */

        const html =
        CampusWord2007Simulateur
        .SaveAsEngine
        .getDocumentHTML();




        /*
           METE AJOU DOKIMAN KI DEJA EGZISTE
        */

        const updated =

        CampusWord2007Simulateur
        .DocumentLibrary
        .updateDocument(

            CampusWord2007Simulateur
            .state.currentDocumentId,

            html

        );




        if(updated){

            CampusWord2007Simulateur
            .state.documentSaved = true;

            console.log(
                "Document updated successfully."
            );

        }


    }


};





/* =========================================================
   OFFICE SAVE BUTTON
========================================================= */

document.addEventListener(
"click",
function(e){


    const item =
    e.target.closest(
        ".cwOfficeItem"
    );


    if(!item) return;



    if(
        item.dataset.action === "save"
    ){

        CampusWord2007Simulateur
        .SaveEngine
        .save();

    }


});


})();









/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CHANGE PASSWORD ENGINE v1.0.0
   DOCUMENT PASSWORD MANAGEMENT
========================================================= */

(function () {

"use strict";






if(
!CampusWord2007Simulateur
){

    return;

}










CampusWord2007Simulateur.ChangePasswordEngine = {



    change(){



        /*
           VERIFY CURRENT DOCUMENT
        */


        const currentId =
        CampusWord2007Simulateur
        .state
        .currentDocumentId;



        if(
        !currentId
        ){

            alert(
                "No document opened."
            );

            return;

        }







        /*
           LOAD DOCUMENTS
        */


        const documents =
        CampusWord2007Simulateur
        .DocumentLibrary
        .getDocuments();





        const documentItem =
        documents.find(
            doc =>
            doc.id === currentId
        );






        if(
        !documentItem
        ){

            alert(
                "Document not found."
            );

            return;

        }








        /*
           ASK OLD PASSWORD
        */


        if(
        documentItem.password
        ){


            const oldPassword =
            prompt(
                "Enter current password:"
            );



            if(
            oldPassword !==
            documentItem.password
            ){


                alert(
                    "Incorrect current password."
                );


                return;


            }


        }







        /*
           NEW PASSWORD
        */


        const newPassword =
        prompt(
            "Enter new password:"
        );





        if(
        !newPassword
        ){

            return;

        }







        const confirmPassword =
        prompt(
            "Confirm new password:"
        );







        if(
        newPassword !==
        confirmPassword
        ){


            alert(
                "Passwords do not match."
            );


            return;


        }








        /*
           UPDATE ONLY PASSWORD
        */


        documentItem.password =
        newPassword;







        documentItem.updated =
        new Date()
        .toISOString();







        /*
           SAVE LIBRARY
        */


        CampusWord2007Simulateur
        .DocumentLibrary
        .saveDocuments(
            documents
        );








        alert(
            "Password changed successfully."
        );





    }





};







/* =========================================================
   CONNECT OFFICE MENU BUTTON
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item)
    return;






    if(
    item.dataset.action ===
    "change-password"
    ){



        CampusWord2007Simulateur
        .ChangePasswordEngine
        .change();



    }





});





})();































/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   REMOVE PASSWORD ENGINE v1.0.0
   DOCUMENT PASSWORD MANAGEMENT
========================================================= */

(function () {

"use strict";



if(
!CampusWord2007Simulateur
){

    return;

}






CampusWord2007Simulateur.RemovePasswordEngine = {



    remove(){



        /*
           VERIFY CURRENT DOCUMENT
        */

        const currentId =
        CampusWord2007Simulateur
        .state
        .currentDocumentId;



        if(
        !currentId
        ){

            alert(
                "No document opened."
            );

            return;

        }






        /*
           LOAD DOCUMENTS
        */

        const documents =
        CampusWord2007Simulateur
        .DocumentLibrary
        .getDocuments();




        const documentItem =
        documents.find(
            doc =>
            doc.id === currentId
        );




        if(
        !documentItem
        ){

            alert(
                "Document not found."
            );

            return;

        }






        /*
           VERIFY PASSWORD EXISTS
        */

        if(
        !documentItem.password
        ){

            alert(
                "This document has no password."
            );

            return;

        }






        /*
           ASK CURRENT PASSWORD
        */

        const currentPassword =
        prompt(
            "Enter current password:"
        );



        if(
        currentPassword !==
        documentItem.password
        ){

            alert(
                "Incorrect current password."
            );

            return;

        }
   








        /*
           REMOVE PASSWORD ONLY
        */

        documentItem.password =
        "";




        documentItem.updated =
        new Date()
        .toISOString();






        /*
           SAVE LIBRARY
        */

        CampusWord2007Simulateur
        .DocumentLibrary
        .saveDocuments(
            documents
        );






        alert(
            "Password removed successfully."
        );





    }





};








/* =========================================================
   CONNECT OFFICE MENU BUTTON
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item)
    return;






    if(
    item.dataset.action ===
    "remove-password"
    ){



        CampusWord2007Simulateur
        .RemovePasswordEngine
        .remove();



    }





});







})();




















/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CLOSE EXIT ENGINE v1.0.0
   DOCUMENT CLOSE AND APP EXIT MANAGEMENT
========================================================= */

(function () {

"use strict";




if(
!CampusWord2007Simulateur
){

    return;

}







CampusWord2007Simulateur.CloseExitEngine = {



    close(){



        /*
           RESET CURRENT DOCUMENT STATE
        */


        if(
        CampusWord2007Simulateur.state
        ){

            CampusWord2007Simulateur
            .state
            .currentDocumentId = null;



            CampusWord2007Simulateur
            .state
            .currentDocumentIsNew = true;



            CampusWord2007Simulateur
            .state
            .documentSaved = false;



        }






        /*
           CLEAR DOCUMENT AREA
        */


        const workspace =
        document.getElementById(
            "cwDocumentContainer"
        );



        if(workspace){

            workspace.innerHTML = "";

        }






        /*
           REDIRECT TO CAMPUS LOGIN PAGE
        */


        window.location.href =
        "https://fondationbackupspirituel.com/campusloginnumeriques";



    }





};






/* =========================================================
   CONNECT OFFICE CLOSE AND EXIT BUTTONS
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item)
    return;






    const action =
    item.dataset.action;






    if(
    action === "close" ||
    action === "exit"
    ){



        CampusWord2007Simulateur
        .CloseExitEngine
        .close();



    }





});







})();


















/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SHARE ENGINE v1.0.0
   DOCUMENT SHARING FOUNDATION
========================================================= */

(function () {

"use strict";





if(
!CampusWord2007Simulateur
){

    return;

}







CampusWord2007Simulateur.ShareEngine = {



    share(){



        /*
           VERIFY CURRENT DOCUMENT
        */


        if(
        !CampusWord2007Simulateur.state
        ){

            alert(
                "No document available."
            );

            return;

        }






        const currentId =
        CampusWord2007Simulateur
        .state
        .currentDocumentId;






        if(
        !currentId
        ){

            alert(
                "No document opened."
            );

            return;

        }







        /*
           LOAD DOCUMENT INFORMATION
        */


        const documents =
        CampusWord2007Simulateur
        .DocumentLibrary
        .getDocuments();






        const documentItem =
        documents.find(
            doc =>
            doc.id === currentId
        );







        if(
        !documentItem
        ){

            alert(
                "Document not found."
            );

            return;

        }








        /*
           PREPARE SHARE MESSAGE
        */


        const shareText =

        documentItem.name +

        " - Created with Campus Word 2007 Simulation";








        /*
           USE DEVICE SHARE IF AVAILABLE
        */


        if(
        navigator.share
        ){



            navigator.share({

                title:
                documentItem.name,

                text:
                shareText

            })

            .catch(
                error =>
                console.log(
                    "Share cancelled:",
                    error
                )
            );



        }






    }





};








/* =========================================================
   CONNECT OFFICE SHARE BUTTON
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item)
    return;







    if(
    item.dataset.action ===
    "share"
    ){



        CampusWord2007Simulateur
        .ShareEngine
        .share();



    }





});







})();



















/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PRINT ENGINE v1.0.0
   PRINT DIALOG FOUNDATION
========================================================= */

(function () {

"use strict";



if(!CampusWord2007Simulateur){

    return;

}





CampusWord2007Simulateur.PrintEngine = {



    create(){



        /*
        PREVENT DUPLICATE WINDOW
        */


        if(
            document.getElementById(
                "cwPrintOverlay"
            )
        ){

            return;

        }






        const overlay =
        document.createElement("div");



        overlay.id =
        "cwPrintOverlay";



        overlay.className =
        "cwPrintOverlay";








        const dialog =
        document.createElement("div");



        dialog.id =
        "cwPrintDialog";



        dialog.className =
        "cwPrintDialog";








       dialog.innerHTML = `


<div class="cwPrintTitleBar">

    <span class="cwPrintTitle">

        Print

    </span>

</div>





<div class="cwPrintBody">


    <div class="cwPrintLayout">



        <!-- LEFT SETTINGS PANEL -->

        <div class="cwPrintSettingsPanel">



            <!-- PRINTER -->

            <div class="cwPrintSection">


                <h3>
                    Printer
                </h3>


                <label>
                    Name
                </label>


                <select
                class="cwPrintPrinterList">


                    <option>
                        Microsoft Print to PDF
                    </option>


                    <option>
                        System Printer
                    </option>


                </select>


            </div>







            <!-- COPIES -->

            <div class="cwPrintSection">


                <h3>
                    Copies
                </h3>



                <label>
                    Number of copies
                </label>



                <input

                type="number"

                class="cwPrintCopies"

                min="1"

                value="1">


            </div>









            <!-- PAGE RANGE -->

            <div class="cwPrintSection">


                <h3>
                    Page Range
                </h3>





                <label>


                    <input

                    type="radio"

                    name="cwPrintPageRange"

                    class="cwPrintAllPages"

                    checked>


                    All Pages


                </label>






                <label>


                    <input

                    type="radio"

                    name="cwPrintPageRange"

                    class="cwPrintCurrentPage">


                    Current Page


                </label>






                <label>


                    <input

                    type="radio"

                    name="cwPrintPageRange"

                    class="cwPrintSpecificPages">


                    Pages:


                </label>






                <input

                type="text"

                class="cwPrintPageInput"

                placeholder="1-3">


            </div>










            <!-- PROPERTIES -->

            <div class="cwPrintSection">


                <h3>
                    Printer Properties
                </h3>



                <button

                type="button"

                class="cwPrintPropertiesBtn">


                    Properties


                </button>


            </div>





        </div>










        <!-- RIGHT PREVIEW PANEL -->


        <div class="cwPrintPreviewPanel">


            <h3>

                Preview

            </h3>



            <div

            class="cwPrintPreview">


                <div

                class="cwPrintPreviewPage">


                    Preview


                </div>



            </div>



        </div>






    </div>



</div>






<div class="cwPrintFooter">


    <button

    type="button"

    class="cwPrintStartBtn">


        Print


    </button>





    <button

    type="button"

    class="cwPrintCancelBtn">


        Cancel


    </button>



</div>



`;








        document.body.appendChild(
            overlay
        );


        document.body.appendChild(
            dialog
        );









        /*
        CANCEL BUTTON
        */


        const cancelButton =
        dialog.querySelector(
            ".cwPrintCancelBtn"
        );



        if(cancelButton){


            cancelButton.onclick = ()=>{


                dialog.remove();

                overlay.remove();


            };


        }









        /*
        PRINT BUTTON PLACEHOLDER
        */

        const printButton =
        dialog.querySelector(
            ".cwPrintStartBtn"
        );



        if(printButton){


            printButton.onclick = ()=>{


                console.log(
                    "Print action ready."
                );


            };


        }





    }





};








/* =========================================================
   CONNECT OFFICE PRINT BUTTON
========================================================= */


document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        ".cwOfficeItem"
    );



    if(!item){

        return;

    }







    if(
        item.dataset.action === "print"
    ){



        CampusWord2007Simulateur
        .PrintEngine
        .create();



    }





});





/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PRINT ENGINE v1.0.0
   PRINT ACTION CONNECTION
========================================================= */


CampusWord2007Simulateur.PrintEngine.print = function(){



    const dialog =
    document.getElementById(
        "cwPrintDialog"
    );



    if(!dialog){

        return;

    }






    const printer =
    dialog.querySelector(
        ".cwPrintPrinterList"
    );



    const copies =
    dialog.querySelector(
        ".cwPrintCopies"
    );



    const allPages =
    dialog.querySelector(
        ".cwPrintAllPages"
    );



    const currentPage =
    dialog.querySelector(
        ".cwPrintCurrentPage"
    );



    const specificPages =
    dialog.querySelector(
        ".cwPrintSpecificPages"
    );



    const pageInput =
    dialog.querySelector(
        ".cwPrintPageInput"
    );








    const printSettings = {


        printer:

        printer ?
        printer.value :
        null,



        copies:

        copies ?
        Number(copies.value) :
        1,



        range:

        allPages && allPages.checked ?

        "all" :



        currentPage && currentPage.checked ?

        "current" :



        specificPages && specificPages.checked ?

        pageInput.value :

        "all"



    };







    console.log(
        "Print settings:",
        printSettings
    );







    /*
       TEMPORARY PRINT FOUNDATION

       REAL PRINT ENGINE WILL BE
       CONNECTED LATER
    */



    window.print();





};










/* =========================================================
   CONNECT PRINT BUTTON INSIDE DIALOG
========================================================= */


document.addEventListener(
"click",
function(e){



    const button =
    e.target.closest(
        ".cwPrintStartBtn"
    );



    if(!button){

        return;

    }




    CampusWord2007Simulateur
    .PrintEngine
    .print();





});








/* =========================================================
   CONNECT PROPERTIES BUTTON FOUNDATION
========================================================= */


document.addEventListener(
"click",
function(e){



    const button =
    e.target.closest(
        ".cwPrintPropertiesBtn"
    );



    if(!button){

        return;

    }





    console.log(
        "Printer Properties ready."
    );





});



/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PRINT PREVIEW RENDER FIX
   ISOLATED PREVIEW WRAPPER
   DOES NOT MODIFY ORIGINAL DOCUMENT
========================================================= */


CampusWord2007Simulateur.PrintEngine.updatePreview = function(){


    const dialog =
    document.getElementById(
        "cwPrintDialog"
    );



    if(!dialog){

        return;

    }





    const previewPage =
    dialog.querySelector(
        ".cwPrintPreviewPage"
    );



    if(!previewPage){

        return;

    }





    /*
       CLEAR OLD PREVIEW ONLY
    */


    previewPage.innerHTML = "";






    /*
       CREATE PREVIEW WRAPPER
       ONLY FOR PRINT WINDOW
    */


    const wrapper =
    document.createElement(
        "div"
    );


    wrapper.className =
    "cwPrintPreviewWrapper";







    /*
       FIND REAL DOCUMENT CONTENT
    */


    const pages =
    document.querySelectorAll(
        ".cwPageContent"
    );





    if(!pages.length){


        previewPage.textContent =
        "No document content";


        return;


    }







    /*
       CLONE DOCUMENT
       ORIGINAL PAGE REMAINS UNTOUCHED
    */


    pages.forEach((page)=>{


        const clone =
        page.cloneNode(true);





        clone.removeAttribute(
            "contenteditable"
        );





        clone.style.margin =
        "0";



        clone.style.border =
        "none";



        wrapper.appendChild(
            clone
        );



    });








    /*
       INSERT ONLY PREVIEW COPY
    */


    previewPage.appendChild(
        wrapper
    );




};









/* =========================================================
   AUTO UPDATE PREVIEW WHEN DIALOG OPENS
========================================================= */


const oldCreate =
CampusWord2007Simulateur
.PrintEngine
.create;





CampusWord2007Simulateur
.PrintEngine
.create = function(){



    oldCreate.call(this);



    setTimeout(()=>{


        this.updatePreview();



    },50);



};

})();












/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART DROPDOWN ENGINE v1.0.0
   ISOLATED SYSTEM
========================================================= */

(function(){

"use strict";



document.addEventListener(
"click",
function(e){



const smartArtButton =
e.target.closest(
".cwRibbonBtn.cwDropdownBtn"
);



if(!smartArtButton){

    return;

}




const menu =
smartArtButton.querySelector(
".cwDropdownMenu"
);



if(!menu){

    return;

}




/*
   VERIFY SMARTART ONLY
*/

const hasSmartArt =
menu.querySelector(
'[data-action^="smartart-"]'
);



if(!hasSmartArt){

    return;

}





e.stopPropagation();





/*
   CLOSE OTHER SMARTART STATE
*/

const opened =
smartArtButton.classList.contains(
"cwSmartArtOpen"
);





document
.querySelectorAll(
".cwSmartArtOpen"
)
.forEach(function(btn){

    btn.classList.remove(
        "cwSmartArtOpen"
    );

});





document
.querySelectorAll(
".cwDropdownMenu"
)
.forEach(function(drop){

    if(
    drop !== menu
    ){

        drop.style.display =
        "none";

    }

});








if(!opened){


smartArtButton.classList.add(
"cwSmartArtOpen"
);



menu.style.display =
"block";



}
else{


menu.style.display =
"none";


}





},
false
);









/*
   CLOSE WHEN CLICK OUTSIDE
*/


document.addEventListener(
"click",
function(e){


if(
e.target.closest(
".cwRibbonBtn.cwDropdownBtn"
)
){

    return;

}



document
.querySelectorAll(
".cwSmartArtOpen"
)
.forEach(function(btn){


btn.classList.remove(
"cwSmartArtOpen"
);



const menu =
btn.querySelector(
".cwDropdownMenu"
);



if(menu){

menu.style.display =
"none";

}



});


},
false
);



})();







/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART CATEGORY ACTION ENGINE v1.0.0
   CATEGORY CLICK CONNECTOR
   ISOLATED SYSTEM
   NO DROPDOWN INTERFERENCE
========================================================= */


(function(){

"use strict";



const SmartArtCategoryEngine = {


    openCategory(category){


        console.log(
            "SmartArt category:",
            category
        );



        /*
           PREPARE CATEGORY STATE
        */


        this.activeCategory =
        category;



        /*
           FUTURE SMARTART GALLERY
           CONNECTION POINT
        */


        const event =
        new CustomEvent(
            "cwSmartArtCategorySelected",
            {
                detail:{
                    category:category
                }
            }
        );



        document.dispatchEvent(
            event
        );


    },



    activeCategory:null



};







document.addEventListener(
"click",
function(e){



    const item =
    e.target.closest(
        "[data-action^='smartart-']"
    );



    if(!item){

        return;

    }




    const action =
    item.dataset.action;



    switch(action){



        case "smartart-list":

            SmartArtCategoryEngine
            .openCategory(
                "List"
            );

        break;





        case "smartart-process":

            SmartArtCategoryEngine
            .openCategory(
                "Process"
            );

        break;





        case "smartart-cycle":

            SmartArtCategoryEngine
            .openCategory(
                "Cycle"
            );

        break;





        case "smartart-hierarchy":

            SmartArtCategoryEngine
            .openCategory(
                "Hierarchy"
            );

        break;





        case "smartart-pyramid":

            SmartArtCategoryEngine
            .openCategory(
                "Pyramid"
            );

        break;



    }





},
false
);






CampusWord2007Simulateur
.SmartArtCategoryEngine =
SmartArtCategoryEngine;



})();










/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART GALLERY ENGINE v1.0.0
   COMPLETE GALLERY SYSTEM
   ISOLATED MODULE
   COMPATIBLE WITH BLOCK 1 + BLOCK 2
========================================================= */


(function(){

"use strict";



if(!CampusWord2007Simulateur){
    return;
}






CampusWord2007Simulateur
.SmartArtGalleryEngine = {



    activeCategory:null,

    selectedSmartArt:null,





    templates:{



        List:[

            "Basic List",

            "Horizontal List",

            "Vertical List",

            "Picture List"

        ],




        Process:[

            "Basic Process",

            "Accent Process",

            "Continuous Process",

            "Chevron Process"

        ],




        Cycle:[

            "Basic Cycle",

            "Continuous Cycle",

            "Radial Cycle",

            "Circular Cycle"

        ],




        Hierarchy:[

            "Organization Chart",

            "Name and Title",

            "Horizontal Hierarchy",

            "Labeled Hierarchy"

        ],




        Pyramid:[

            "Basic Pyramid",

            "Segmented Pyramid",

            "Pyramid List",

            "Inverted Pyramid"

        ]



    },









    open(category){



        this.activeCategory =
        category;



        this.selectedSmartArt =
        null;



        this.createGallery();




    },









    createGallery(){



        const old =
        document.getElementById(
            "cwSmartArtGalleryDialog"
        );



        if(old){

            old.remove();

        }





        const overlay =
        document.createElement(
            "div"
        );



        overlay.id =
        "cwSmartArtGalleryOverlay";



        overlay.className =
        "cwSmartArtGalleryOverlay";








        const dialog =
        document.createElement(
            "div"
        );



        dialog.id =
        "cwSmartArtGalleryDialog";



        dialog.className =
        "cwSmartArtGalleryDialog";






        const models =
        this.templates[
            this.activeCategory
        ] || [];







        let items = "";





        models.forEach((model)=>{


            items += `


            <div
            class="cwSmartArtItem"
            data-smartart="${model}">


                <div class="cwSmartArtPreview">

                    ${model}

                </div>


            </div>


            `;


        });







        dialog.innerHTML = `


        <div class="cwSmartArtHeader">


            <span>
                SmartArt Gallery
            </span>



            <span>
                ${this.activeCategory}
            </span>


        </div>





        <div class="cwSmartArtGalleryContent">


            ${items}


        </div>





        <div class="cwSmartArtFooter">


            <button
            class="cwSmartArtInsertBtn">

                Insert

            </button>




            <button
            class="cwSmartArtCancelBtn">

                Cancel

            </button>


        </div>



        `;







        document.body.appendChild(
            overlay
        );


        document.body.appendChild(
            dialog
        );









        dialog
        .querySelectorAll(
            ".cwSmartArtItem"
        )
        .forEach((item)=>{



            item.onclick = ()=>{



                dialog
                .querySelectorAll(
                    ".cwSmartArtItem"
                )
                .forEach((old)=>{


                    old.classList.remove(
                        "active"
                    );


                });






                item.classList.add(
                    "active"
                );





                this.selectedSmartArt =
                item.dataset.smartart;



            };




        });








        dialog
        .querySelector(
            ".cwSmartArtInsertBtn"
        )
        .onclick = ()=>{



            if(!this.selectedSmartArt){

                return;

            }





            console.log(
                "Insert SmartArt:",
                this.selectedSmartArt
            );





            dialog.remove();

            overlay.remove();




        };









        dialog
        .querySelector(
            ".cwSmartArtCancelBtn"
        )
        .onclick = ()=>{


            dialog.remove();

            overlay.remove();


        };




    }





};











/*
=========================================================
CONNECT BLOCK 2 CATEGORY EVENT
=========================================================
*/


document.addEventListener(
"cwSmartArtCategorySelected",
function(e){



    if(!e.detail){

        return;

    }





    CampusWord2007Simulateur
    .SmartArtGalleryEngine
    .open(
        e.detail.category
    );



},
false
);






})();















/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART MODEL RENDER ENGINE v1.0.0
   PART 1/3
   SVG LIBRARY
   LIST + PROCESS MODELS
   ISOLATED SYSTEM
========================================================= */


(function(){

"use strict";



if(!CampusWord2007Simulateur){

    return;

}






CampusWord2007Simulateur
.SmartArtRenderEngine = {





svgLibrary:{






/* =========================================================
   LIST CATEGORY
========================================================= */



"Basic List":`

<svg viewBox="0 0 320 180">


<rect x="20" y="25"
width="90"
height="45"
rx="6"/>


<rect x="20" y="95"
width="90"
height="45"
rx="6"/>



<line x1="125" y1="47"
x2="285" y2="47"/>


<line x1="125" y1="117"
x2="285" y2="117"/>


</svg>

`,







"Horizontal List":`

<svg viewBox="0 0 360 120">


<circle cx="45" cy="60" r="25"/>


<line x1="75" y1="60"
x2="120" y2="60"/>


<circle cx="150" cy="60" r="25"/>


<line x1="180" y1="60"
x2="225" y2="60"/>


<circle cx="255" cy="60" r="25"/>


</svg>

`,








"Vertical List":`

<svg viewBox="0 0 200 320">


<rect x="55" y="20"
width="90"
height="45"
rx="6"/>


<rect x="55" y="120"
width="90"
height="45"
rx="6"/>


<rect x="55" y="220"
width="90"
height="45"
rx="6"/>


</svg>

`,








"Picture List":`

<svg viewBox="0 0 350 160">


<circle cx="45" cy="45"
r="25"/>


<circle cx="45" cy="115"
r="25"/>


<rect x="90" y="25"
width="220"
height="40"
rx="5"/>


<rect x="90" y="95"
width="220"
height="40"
rx="5"/>


</svg>

`,









/* =========================================================
   PROCESS CATEGORY
========================================================= */



"Basic Process":`

<svg viewBox="0 0 380 120">


<rect x="10" y="35"
width="90"
height="50"
rx="8"/>


<path d="M100 60 H140"/>


<rect x="140" y="35"
width="90"
height="50"
rx="8"/>


<path d="M230 60 H270"/>


<rect x="270" y="35"
width="90"
height="50"
rx="8"/>


</svg>

`,








"Accent Process":`

<svg viewBox="0 0 380 140">


<polygon points="
20,30 110,30 130,70 110,110 20,110 40,70"/>


<polygon points="
130,30 220,30 240,70 220,110 130,110 150,70"/>


<polygon points="
240,30 330,30 350,70 330,110 240,110 260,70"/>


</svg>

`,








"Continuous Process":`

<svg viewBox="0 0 360 130">


<path d="
M20 65
H330
"/>


<circle cx="60" cy="65" r="25"/>


<circle cx="180" cy="65" r="25"/>


<circle cx="300" cy="65" r="25"/>


</svg>

`,








"Chevron Process":`

<svg viewBox="0 0 380 120">


<polygon points="
20,20 120,20 160,60 120,100 20,100 60,60"/>


<polygon points="
140,20 240,20 280,60 240,100 140,100 180,60"/>


<polygon points="
260,20 360,20 380,60 360,100 260,100 300,60"/>


</svg>

`,

   
/* =========================================================
   CYCLE CATEGORY
========================================================= */



"Basic Cycle":`

<svg viewBox="0 0 260 260">


<circle cx="130" cy="130"
r="70"
fill="none"
stroke="currentColor"
stroke-width="18"/>


<path d="
M130 30
A100 100 0 0 1 230 130
"/>


</svg>

`,








"Continuous Cycle":`

<svg viewBox="0 0 320 220">


<circle cx="160" cy="110"
r="70"
fill="none"
stroke="currentColor"
stroke-width="16"/>


<circle cx="160" cy="40"
r="18"/>


<circle cx="230" cy="110"
r="18"/>


<circle cx="160" cy="180"
r="18"/>


<circle cx="90" cy="110"
r="18"/>


</svg>

`,








"Radial Cycle":`

<svg viewBox="0 0 320 260">


<circle cx="160" cy="130"
r="35"/>


<circle cx="160" cy="35"
r="25"/>


<circle cx="260" cy="130"
r="25"/>


<circle cx="160" cy="225"
r="25"/>


<circle cx="60" cy="130"
r="25"/>


<line x1="160"
y1="95"
x2="160"
y2="60"/>


<line x1="195"
y1="130"
x2="235"
y2="130"/>


<line x1="160"
y1="165"
x2="160"
y2="200"/>


<line x1="125"
y1="130"
x2="85"
y2="130"/>


</svg>

`,








"Circular Cycle":`

<svg viewBox="0 0 300 300">


<circle cx="150"
cy="150"
r="90"
fill="none"
stroke="currentColor"
stroke-width="12"/>


<circle cx="150"
cy="60"
r="20"/>


<circle cx="240"
cy="150"
r="20"/>


<circle cx="150"
cy="240"
r="20"/>


<circle cx="60"
cy="150"
r="20"/>


</svg>

`,









/* =========================================================
   HIERARCHY CATEGORY
========================================================= */



"Organization Chart":`

<svg viewBox="0 0 400 260">


<rect x="150"
y="20"
width="100"
height="45"
rx="6"/>


<line x1="200"
y1="65"
x2="200"
y2="110"/>


<line x1="80"
y1="110"
x2="320"
y2="110"/>


<line x1="80"
y1="110"
x2="80"
y2="150"/>


<line x1="200"
y1="110"
x2="200"
y2="150"/>


<line x1="320"
y1="110"
x2="320"
y2="150"/>



<rect x="35"
y="150"
width="90"
height="45"
rx="6"/>


<rect x="155"
y="150"
width="90"
height="45"
rx="6"/>


<rect x="275"
y="150"
width="90"
height="45"
rx="6"/>


</svg>

`,








"Name and Title":`

<svg viewBox="0 0 360 220">


<rect x="130"
y="25"
width="100"
height="45"
rx="6"/>


<line x1="180"
y1="70"
x2="180"
y2="120"/>


<rect x="50"
y="120"
width="120"
height="50"
rx="6"/>


<rect x="190"
y="120"
width="120"
height="50"
rx="6"/>


</svg>

`,








"Horizontal Hierarchy":`

<svg viewBox="0 0 420 180">


<rect x="20"
y="65"
width="90"
height="45"
rx="6"/>


<line x1="110"
y1="87"
x2="170"
y2="87"/>


<rect x="170"
y="30"
width="100"
height="45"
rx="6"/>


<rect x="170"
y="95"
width="100"
height="45"
rx="6"/>


<line x1="270"
y1="52"
x2="340"
y2="52"/>


<line x1="270"
y1="117"
x2="340"
y2="117"/>


</svg>

`,








"Labeled Hierarchy":`

<svg viewBox="0 0 380 230">


<rect x="140"
y="20"
width="100"
height="45"
rx="6"/>


<line x1="190"
y1="65"
x2="190"
y2="110"/>


<rect x="40"
y="110"
width="120"
height="50"
rx="6"/>


<rect x="220"
y="110"
width="120"
height="50"
rx="6"/>


<line x1="160"
y1="135"
x2="220"
y2="135"/>


</svg>

`,






























/* =========================================================
   PYRAMID CATEGORY
========================================================= */



"Basic Pyramid":`

<svg viewBox="0 0 300 260">


<polygon points="
150,20
280,220
20,220"/>


<line x1="70"
y1="170"
x2="230"
y2="170"/>


<line x1="100"
y1="110"
x2="200"
y2="110"/>


</svg>

`,








"Segmented Pyramid":`

<svg viewBox="0 0 300 260">


<polygon points="
150,20
280,220
20,220"/>


<line x1="55"
y1="170"
x2="245"
y2="170"/>


<line x1="95"
y1="110"
x2="205"
y2="110"/>


<line x1="75"
y1="145"
x2="225"
y2="145"/>


</svg>

`,








"Pyramid List":`

<svg viewBox="0 0 320 250">


<polygon points="
160,20
290,220
30,220"/>


<circle cx="160"
cy="70"
r="15"/>


<circle cx="160"
cy="130"
r="15"/>


<circle cx="160"
cy="190"
r="15"/>


</svg>

`,








"Inverted Pyramid":`

<svg viewBox="0 0 300 260">


<polygon points="
20,40
280,40
150,240"/>


<line x1="70"
y1="90"
x2="230"
y2="90"/>


<line x1="100"
y1="140"
x2="200"
y2="140"/>


</svg>

`



},















/* =========================================================
   SMARTART OBJECT CREATOR
========================================================= */


create(model){



    const wrapper =
    document.createElement(
        "div"
    );



    wrapper.className =
    "cwSmartArtObject";



    wrapper.dataset.model =
    model;




    wrapper.innerHTML = `

        <div class="cwSmartArtHeader">

            ${model}

        </div>


        <div class="cwSmartArtSVG">

            ${
                this.svgLibrary[model]
                ||
                ""
            }

        </div>

    `;



    return wrapper;


},








/* =========================================================
   INSERT SMARTART INTO ACTIVE DOCUMENT
========================================================= */


insert(model){



    const page =
    document.querySelector(
        ".cwPage.active .cwPageContent"
    );



    if(!page){

        return;

    }




    const object =
    this.create(
        model
    );



    page.appendChild(
        object
    );



}
   
},

















/* =========================================================
   CONNECT SMARTART INSERT BUTTON
   WORKS WITH BLOCK 3 ONLY
========================================================= */


document.addEventListener(
"click",
function(e){



    const button =
    e.target.closest(
        ".cwSmartArtInsertBtn"
    );



    if(!button){

        return;

    }





    const gallery =
    CampusWord2007Simulateur
    .SmartArtGalleryEngine;



    if(!gallery){

        return;

    }





    const model =
    gallery.selectedSmartArt;



    if(!model){

        return;

    }





    CampusWord2007Simulateur
    .SmartArtRenderEngine
    .insert(
        model
    );



},
false
);


})();























/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART HANDLES DISPLAY ENGINE
   BLOCK 5A
   SHOW 8 RESIZE HANDLES ONLY
   NO MOVE
   NO RESIZE ACTION
   NO ROTATE
   ISOLATED SYSTEM
========================================================= */

(function(){


"use strict";



let selectedSmartArt = null;




function removeSmartArtHandles(){


const old =
document.querySelector(
".cwSmartArtHandles"
);



if(old){

old.remove();

}



}








function createSmartArtHandles(
smartArt
){



removeSmartArtHandles();




const handlesBox =
document.createElement(
"div"
);



handlesBox.className =
"cwSmartArtHandles";




handlesBox.style.position =
"absolute";



handlesBox.style.left =
smartArt.offsetLeft + "px";



handlesBox.style.top =
smartArt.offsetTop + "px";



handlesBox.style.width =
smartArt.offsetWidth + "px";



handlesBox.style.height =
smartArt.offsetHeight + "px";





handlesBox.innerHTML = `


<div class="cwSmartArtHandle nw"></div>

<div class="cwSmartArtHandle n"></div>

<div class="cwSmartArtHandle ne"></div>


<div class="cwSmartArtHandle w"></div>

<div class="cwSmartArtHandle e"></div>


<div class="cwSmartArtHandle sw"></div>

<div class="cwSmartArtHandle s"></div>

<div class="cwSmartArtHandle se"></div>


`;





smartArt.parentElement.appendChild(
handlesBox
);



}









document.addEventListener(
"pointerdown",
function(e){



const smartArt =
e.target.closest(
".cwSmartArtObject"
);





if(!smartArt){

return;

}




selectedSmartArt =
smartArt;



window.CampusWordSelectedSmartArt =
smartArt;





createSmartArtHandles(
smartArt
);



},
{
passive:true
}
);









document.addEventListener(
"pointerdown",
function(e){



const insideSmartArt =
e.target.closest(
".cwSmartArtObject"
);



const insideHandles =
e.target.closest(
".cwSmartArtHandles"
);





if(
insideSmartArt ||
insideHandles
){

return;

}






removeSmartArtHandles();



selectedSmartArt = null;



window.CampusWordSelectedSmartArt =
null;




},
{
passive:true
}
);









window.CampusWordRefreshSmartArtHandles =
function(){



if(
window.CampusWordSelectedSmartArt
){


createSmartArtHandles(
window.CampusWordSelectedSmartArt
);



}



};





})();








/* =========================================================
   CAMPUS WORD 2007 SIMULATEUR
   SMARTART MOVE + RESIZE ENGINE
   BLOCK 5B
   MOVE + 8 HANDLE RESIZE
   TOUCH + MOUSE SUPPORT
   WORKS WITH BLOCK 4 + BLOCK 5A
   ISOLATED SYSTEM
========================================================= */

(function(){

"use strict";



let moving = false;

let resizing = false;


let activeSmartArt = null;


let resizeDirection = null;



let startX = 0;

let startY = 0;


let startLeft = 0;

let startTop = 0;


let startWidth = 0;

let startHeight = 0;









/* =========================
   MOVE SMARTART
========================= */


document.addEventListener(
"pointerdown",
function(e){



const smartArt =
e.target.closest(
".cwSmartArtObject"
);



const handle =
e.target.closest(
".cwSmartArtHandle"
);





if(!smartArt || handle){

return;

}




activeSmartArt =
smartArt;



moving = true;



startX =
e.clientX;


startY =
e.clientY;



startLeft =
smartArt.offsetLeft;


startTop =
smartArt.offsetTop;





smartArt.setPointerCapture(
e.pointerId
);



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
!moving ||
!activeSmartArt
){

return;

}




const dx =
e.clientX - startX;



const dy =
e.clientY - startY;





activeSmartArt.style.left =
(
startLeft + dx
)
+
"px";





activeSmartArt.style.top =
(
startTop + dy
)
+
"px";





if(
window.CampusWordRefreshSmartArtHandles
){

window.CampusWordRefreshSmartArtHandles();

}





},
{
passive:false
}
);









document.addEventListener(
"pointerup",
function(){


moving = false;


},
false
);












/* =========================
   RESIZE START
========================= */


document.addEventListener(
"pointerdown",
function(e){



const handle =
e.target.closest(
".cwSmartArtHandle"
);



if(!handle){

return;

}




activeSmartArt =
window.CampusWordSelectedSmartArt;



if(!activeSmartArt){

return;

}





resizeDirection =
Array.from(
handle.classList
)
.find(
c =>
c !== "cwSmartArtHandle"
);





startX =
e.clientX;


startY =
e.clientY;



startWidth =
activeSmartArt.offsetWidth;


startHeight =
activeSmartArt.offsetHeight;



startLeft =
activeSmartArt.offsetLeft;


startTop =
activeSmartArt.offsetTop;





resizing = true;



e.preventDefault();



},
{
passive:false
}
);











/* =========================
   RESIZE ACTION
========================= */


document.addEventListener(
"pointermove",
function(e){



if(
!resizing ||
!activeSmartArt
){

return;

}





let width =
startWidth;


let height =
startHeight;



let left =
startLeft;


let top =
startTop;




const dx =
e.clientX - startX;


const dy =
e.clientY - startY;






if(
resizeDirection.includes("e")
){

width =
startWidth + dx;

}




if(
resizeDirection.includes("s")
){

height =
startHeight + dy;

}




if(
resizeDirection.includes("w")
){

width =
startWidth - dx;

left =
startLeft + dx;

}





if(
resizeDirection.includes("n")
){

height =
startHeight - dy;

top =
startTop + dy;

}





if(width < 60){

width = 60;

}



if(height < 40){

height = 40;

}






activeSmartArt.style.width =
width + "px";



activeSmartArt.style.height =
height + "px";



activeSmartArt.style.left =
left + "px";



activeSmartArt.style.top =
top + "px";






if(
window.CampusWordRefreshSmartArtHandles
){

window.CampusWordRefreshSmartArtHandles();

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


resizeDirection = null;


activeSmartArt = null;



},
false
);






})();












































































































































































































































































































































































































































































































































































































































































































































































































































































/* =========================================================
   CAMPUS WORD — GLOBAL ERROR MONITOR
   DEBUG ONLY
   NO DOM CHANGE
   NO FUNCTION INTERFERENCE
   NO LAYOUT MODIFICATION
========================================================= */

(function(){



window.addEventListener(
    "error",
    function(e){


        console.group(
            "🚨 CAMPUS WORD ERROR DETECTED"
        );


        console.error(
            "Message:",
            e.message
        );


        console.error(
            "File:",
            e.filename
        );


        console.error(
            "Line:",
            e.lineno
        );


        console.error(
            "Column:",
            e.colno
        );


        console.error(
            "Error Object:",
            e.error
        );


        console.groupEnd();


    },
    false
);







window.addEventListener(
    "unhandledrejection",
    function(e){



        console.group(
            "🚨 PROMISE ERROR DETECTED"
        );


        console.error(
            e.reason
        );


        console.groupEnd();



    },
    false
);








document.addEventListener(
    "DOMContentLoaded",
    function(){


        console.log(
            "✅ Campus Word Debug Monitor Active"
        );


        console.log(
            "DOM Elements Check:"
        );


        console.log(
            "Pages:",
            document.querySelectorAll(
                ".cwPageContent"
            ).length
        );


        console.log(
            "Ribbon:",
            document.querySelector(
                "#cwRibbon"
            )
        );


        console.log(
            "Images:",
            document.querySelectorAll(
                ".cwInsertedImage"
            ).length
        );


        console.log(
            "Shapes:",
            document.querySelectorAll(
                ".cwInsertedShape"
            ).length
        );


        console.log(
            "ClipArts:",
            document.querySelectorAll(
                ".cwInsertedClipArt"
            ).length
        );


    },
    false
);




})();

