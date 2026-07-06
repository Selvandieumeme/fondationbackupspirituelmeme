
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

            /* activate matching panel */
            if (panel.id === target) {
                panel.classList.add("active");
            }
        });

        /* =====================================================
           🔥 FIX: SAFE fallback (only if BOTH are truly invalid)
        ===================================================== */
        const panelExists = document.getElementById(target);
        const btnExists = document.querySelector(`.cwTabBtn[data-target="${target}"]`);

        if (!panelExists && !btnExists) {

            /* DO NOT wipe everything aggressively */
            const homeBtn = document.querySelector('.cwTabBtn[data-target="tab-home"]');
            const homePanel = document.getElementById("tab-home");

            if (homeBtn && homePanel) {

                tabButtons.forEach(b => b.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));

                homeBtn.classList.add("active");
                homePanel.classList.add("active");
            }
        }
    }

    /* click binding */
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            activateTab(target);
        });
    });

    /* default open HOME */
    activateTab("tab-home");

})();


























// =========================
// COLOR / HIGHLIGHT TOGGLE
// =========================

document.addEventListener("click", function (e) {

    const colorBtn = e.target.closest('[data-action="color"]');
    const highlightBtn = e.target.closest('[data-action="highlight"]');

    // ouvri color
    if (colorBtn) {
        e.preventDefault();

        // fè toggle
        colorBtn.classList.toggle("open");

        // fèmen highlight si li louvri
        document.querySelectorAll('.cwRibbonBtn[data-action="highlight"].open')
            .forEach(el => el.classList.remove("open"));
    }

    // ouvri highlight
    if (highlightBtn) {
        e.preventDefault();

        highlightBtn.classList.toggle("open");

        document.querySelectorAll('.cwRibbonBtn[data-action="color"].open')
            .forEach(el => el.classList.remove("open"));
    }

    // klik deyò fèmen tout
    if (!colorBtn && !highlightBtn) {
        document.querySelectorAll(".cwRibbonBtn.open")
            .forEach(el => el.classList.remove("open"));
    }
});











document.addEventListener("click", function (e) {

    // OPEN/CLOSE DROPDOWN
    const btn = e.target.closest(".cwDropdownBtn");

    // si klike sou bouton
    if (btn) {
        e.stopPropagation();

        // toggle active
        btn.classList.toggle("active");

        // fè lòt yo fèmen
        document.querySelectorAll(".cwDropdownBtn").forEach(b => {
            if (b !== btn) b.classList.remove("active");
        });

        return;
    }

    // si klike deyò → fèmen tout
    document.querySelectorAll(".cwDropdownBtn").forEach(b => {
        b.classList.remove("active");
    });
});











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























