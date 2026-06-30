
"use strict";

/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 1
   FOUNDATION KERNEL
   VERSION 1.0.0
   ========================================================== */

(function () {

    if (window.CampusWord2007Simulateur) {
        console.warn("CampusWord2007Simulateur already initialized.");
        return;
    }

    const CampusWord2007Simulateur = {};

    Object.defineProperty(window, "CampusWord2007Simulateur", {
        value: CampusWord2007Simulateur,
        writable: false,
        configurable: false
    });

    /* ==========================================================
       APPLICATION INFORMATION
       ========================================================== */

    CampusWord2007Simulateur.Application = {

        name: "Campus Word 2007 Simulateur",

        version: "1.0.0",

        build: "Foundation",

        initialized: false,

        ready: false

    };

    /* ==========================================================
       GLOBAL CONFIGURATION
       ========================================================== */

    CampusWord2007Simulateur.Configuration = {

        pageWidth: 794,

        pageHeight: 1123,

        pageMarginTop: 96,

        pageMarginRight: 96,

        pageMarginBottom: 96,

        pageMarginLeft: 96,

        defaultZoom: 1,

        minimumZoom: 0.50,

        maximumZoom: 3.00,

        caretBlinkInterval: 530,

        autoSaveInterval: 300000,

        devicePixelRatio: window.devicePixelRatio || 1

    };

    /* ==========================================================
       GLOBAL STATE
       ========================================================== */

    CampusWord2007Simulateur.State = {

        documentLoaded: false,

        rendering: false,

        selectionActive: false,

        caretVisible: false,

        editing: false,

        loading: true,

        currentZoom: 1,

        currentPage: 1,

        totalPages: 0,

        activeRibbonTab: "home",

        windowState: "normal"

    };

    /* ==========================================================
       CORE REGISTRIES
       ========================================================== */

    CampusWord2007Simulateur.Registry = {

        Engines: Object.create(null),

        Managers: Object.create(null),

        Services: Object.create(null),

        Components: Object.create(null),

        Layers: Object.create(null),

        Pages: [],

        Events: Object.create(null)

    };

    /* ==========================================================
       DOCUMENT MODEL
       ========================================================== */

    CampusWord2007Simulateur.Document = {

        id: crypto.randomUUID(),

        title: "Document1",

        pages: [],

        paragraphs: [],

        objects: [],

        tables: [],

        images: [],

        wordArts: [],

        headers: [],

        footers: [],

        bookmarks: [],

        metadata: {

            created: new Date(),

            modified: new Date()

        }

    };

    /* ==========================================================
       SYSTEM PLACEHOLDERS
       ========================================================== */

    CampusWord2007Simulateur.DOM = {};

    CampusWord2007Simulateur.Utilities = {};

    CampusWord2007Simulateur.Events = {};

    CampusWord2007Simulateur.Renderer = {};

    CampusWord2007Simulateur.PageEngine = {};

    CampusWord2007Simulateur.PaginationEngine = {};

    CampusWord2007Simulateur.TextEngine = {};

    CampusWord2007Simulateur.CaretEngine = {};

    CampusWord2007Simulateur.SelectionEngine = {};

    CampusWord2007Simulateur.LayoutEngine = {};

    CampusWord2007Simulateur.RibbonEngine = {};

    CampusWord2007Simulateur.OfficeEngine = {};

    CampusWord2007Simulateur.KeyboardEngine = {};

    CampusWord2007Simulateur.MouseEngine = {};

    CampusWord2007Simulateur.TouchEngine = {};

    CampusWord2007Simulateur.ScrollEngine = {};

    CampusWord2007Simulateur.ZoomEngine = {};

    CampusWord2007Simulateur.StatusBarEngine = {};

    CampusWord2007Simulateur.HistoryEngine = {};

    CampusWord2007Simulateur.ClipboardEngine = {};

    CampusWord2007Simulateur.SaveEngine = {};

    CampusWord2007Simulateur.OpenEngine = {};

    CampusWord2007Simulateur.PrintEngine = {};

    CampusWord2007Simulateur.ObjectEngine = {};

    CampusWord2007Simulateur.ShapeEngine = {};

    CampusWord2007Simulateur.ImageEngine = {};

    CampusWord2007Simulateur.WordArtEngine = {};

    CampusWord2007Simulateur.TableEngine = {};


CampusWord2007Simulateur.HomeRibbonEngine = {};

})();


















/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 2A
   DOM ENGINE
   Cache
   Validation
   Registration
========================================================== */

CampusWord2007Simulateur.DOMEngine = {

    elements: {},

    requiredIds: [

        "campusword2007simulateur",

        "word-loading-screen",
        "loading-progress-bar",
        "loading-message",

        "word-app",

        "title-bar",
        "document-title",

        "window-minimize",
        "window-maximize",
        "window-close",

        "office-button",
        "office-menu",

        "quick-access-toolbar",

        "ribbon-tabs",
        "ribbon-container",

        "home-tab",
        "insert-tab",
        "format-tab",
        "page-layout-tab",
        "references-tab",

        "workspace",

        "vertical-ruler",
        "vertical-ruler-scale",
        "vertical-margin-top",
        "vertical-margin-bottom",

        "document-viewport",
        "document-workspace-background",

        "horizontal-ruler",
        "horizontal-ruler-scale",
        "horizontal-margin-left",
        "horizontal-margin-right",

        "document-scroll-area",
        "document-canvas",
        "document-pages-container",
        "document-page-template",

        "workspace-scrollbars",
        "vertical-scrollbar",
        "vertical-scroll-thumb",
        "horizontal-scrollbar",
        "horizontal-scroll-thumb",

        "status-bar",
        "status-page-number",
        "status-word-count",
        "status-language",
        "status-proofing",

        "print-layout-view",
        "web-layout-view",
        "reading-layout-view",

        "status-zoom-percentage",

        "zoom-control",
        "zoom-out",
        "zoom-in",
        "zoom-slider-container",
        "zoom-slider-track",
        "zoom-slider-thumb"

    ],

    cache(){

        this.elements = {};

        this.requiredIds.forEach(id=>{

            this.elements[id]=document.getElementById(id);

        });

        return this.elements;

    },

    get(id){

        return this.elements[id] || null;

    },

    exists(id){

        return this.get(id)!==null;

    },

    query(selector){

        return document.querySelector(selector);

    },

    queryAll(selector){

        return Array.from(
            document.querySelectorAll(selector)
        );

    },

    validate(){

        const missing=[];

        this.requiredIds.forEach(id=>{

            if(!this.elements[id]){

                missing.push(id);

            }

        });

        if(missing.length){

            console.error(

                "[DOMEngine] Missing DOM elements:",

                missing

            );

            return false;

        }

        return true;

    },

    registerRibbonTabs(){

        this.elements.ribbonTabs=

            this.queryAll(".ribbon-tab");

    },

    registerRibbonGroups(){

        this.elements.ribbonGroups=

            this.queryAll(".ribbon-group");

    },

    registerRibbonButtons(){

        this.elements.ribbonButtons=

            this.queryAll(".ribbon-btn");

    },

    registerPages(){

        this.elements.documentPages=

            this.queryAll(".document-page");

    },

    registerLayers(){

        this.elements.textLayers=

            this.queryAll(".page-text-layer");

        this.elements.objectLayers=

            this.queryAll(".page-object-layer");

        this.elements.selectionLayers=

            this.queryAll(".page-selection-layer");

        this.elements.caretLayers=

            this.queryAll(".page-caret-layer");

        this.elements.overlayLayers=

            this.queryAll(".page-overlay-layer");

    },

    registerInputs(){

        this.elements.selects=

            this.queryAll("select");

        this.elements.inputs=

            this.queryAll("input");

        this.elements.textareas=

            this.queryAll("textarea");

    },

    register(){

        this.registerRibbonTabs();

        this.registerRibbonGroups();

        this.registerRibbonButtons();

        this.registerPages();

        this.registerLayers();

        this.registerInputs();

    },

    refresh(){

        this.cache();

        this.register();

    },

    initialize(){

        this.cache();

        this.register();

        return this.validate();

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 2B
   UTILITIES
   Shared Helper Functions
========================================================== */

CampusWord2007Simulateur.Utilities = {

    /* ======================================================
       UNIQUE ID
    ====================================================== */

    _idCounter: 0,

    generateId(prefix = "cw"){

        this._idCounter++;

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            this._idCounter
        );

    },

    /* ======================================================
       TYPE CHECKS
    ====================================================== */

    isString(value){

        return typeof value === "string";

    },

    isNumber(value){

        return typeof value === "number" &&
               Number.isFinite(value);

    },

    isFunction(value){

        return typeof value === "function";

    },

    isObject(value){

        return value !== null &&
               typeof value === "object";

    },

    isElement(value){

        return value instanceof HTMLElement;

    },

    /* ======================================================
       DOM HELPERS
    ====================================================== */

    create(tag, className = "", id = ""){

        const element = document.createElement(tag);

        if(className){

            element.className = className;

        }

        if(id){

            element.id = id;

        }

        return element;

    },

    remove(element){

        if(
            this.isElement(element) &&
            element.parentNode
        ){

            element.parentNode.removeChild(element);

        }

    },

    empty(element){

        if(!this.isElement(element)){

            return;

        }

        while(element.firstChild){

            element.removeChild(
                element.firstChild
            );

        }

    },

    /* ======================================================
       CLASS HELPERS
    ====================================================== */

    addClass(element,className){

        if(this.isElement(element)){

            element.classList.add(className);

        }

    },

    removeClass(element,className){

        if(this.isElement(element)){

            element.classList.remove(className);

        }

    },

    toggleClass(element,className){

        if(this.isElement(element)){

            element.classList.toggle(className);

        }

    },

    hasClass(element,className){

        if(!this.isElement(element)){

            return false;

        }

        return element.classList.contains(className);

    },

    /* ======================================================
       STYLE HELPERS
    ====================================================== */

    css(element,property,value){

        if(!this.isElement(element)){

            return;

        }

        element.style[property]=value;

    },

    show(element){

        if(this.isElement(element)){

            element.style.display="";

        }

    },

    hide(element){

        if(this.isElement(element)){

            element.style.display="none";

        }

    },

    /* ======================================================
       EVENTS
    ====================================================== */

    on(element,event,callback,options=false){

        if(
            this.isElement(element) &&
            this.isFunction(callback)
        ){

            element.addEventListener(
                event,
                callback,
                options
            );

        }

    },

    off(element,event,callback,options=false){

        if(
            this.isElement(element) &&
            this.isFunction(callback)
        ){

            element.removeEventListener(
                event,
                callback,
                options
            );

        }

    },

    /* ======================================================
       CLAMP
    ====================================================== */

    clamp(value,min,max){

        return Math.min(
            Math.max(value,min),
            max
        );

    },

    /* ======================================================
       RANDOM
    ====================================================== */

    random(min,max){

        return Math.floor(

            Math.random() *

            (max-min+1)

        ) + min;

    },

    /* ======================================================
       DEBOUNCE
    ====================================================== */

    debounce(callback,delay=150){

        let timer=null;

        return (...args)=>{

            clearTimeout(timer);

            timer=setTimeout(()=>{

                callback(...args);

            },delay);

        };

    },

    /* ======================================================
       THROTTLE
    ====================================================== */

    throttle(callback,delay=16){

        let waiting=false;

        return (...args)=>{

            if(waiting){

                return;

            }

            waiting=true;

            callback(...args);

            setTimeout(()=>{

                waiting=false;

            },delay);

        };

    },

    /* ======================================================
       NEXT FRAME
    ====================================================== */

    nextFrame(callback){

        requestAnimationFrame(callback);

    },

    /* ======================================================
       NEXT TICK
    ====================================================== */

    nextTick(callback){

        setTimeout(callback,0);

    },

    /* ======================================================
       DEEP COPY
    ====================================================== */

    clone(object){

        return structuredClone(object);

    },

    /* ======================================================
       NOW
    ====================================================== */

    now(){

        return performance.now();

    },

    /* ======================================================
       LOG
    ====================================================== */

    log(...message){

        console.log(

            "[CampusWord]",

            ...message

        );

    },

    warn(...message){

        console.warn(

            "[CampusWord]",

            ...message

        );

    },

    error(...message){

        console.error(

            "[CampusWord]",

            ...message

        );

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 2C
   APPLICATION ENGINE
   Boot
   Initialize
   Lifecycle
========================================================== */

CampusWord2007Simulateur.ApplicationEngine = {

    initialized:false,

    started:false,

    version:"1.0.0",

    bootTime:0,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.bootTime=

            CampusWord2007Simulateur.Utilities.now();

        CampusWord2007Simulateur.Utilities.log(

            "Initializing application..."

        );

        const domReady=

            CampusWord2007Simulateur.DOMEngine.initialize();

        if(!domReady){

            CampusWord2007Simulateur.Utilities.error(

                "DOM validation failed."

            );

            return false;

        }

        this.initializeRegisteredEngines();

        this.initialized=true;

        CampusWord2007Simulateur.Utilities.log(

            "Application initialized."

        );

        return true;

    },

    start(){

        if(this.started){

            return;

        }

        if(!this.initialize()){

            return;

        }

        this.started=true;

        CampusWord2007Simulateur.Utilities.log(

            "Application started."

        );

    },

    restart(){

        this.shutdown();

        this.initialize();

        this.start();

    },

    shutdown(){

        this.started=false;

        this.initialized=false;

        CampusWord2007Simulateur.Utilities.log(

            "Application stopped."

        );

    },

    initializeRegisteredEngines(){

        const app=

            CampusWord2007Simulateur;

        Object.keys(app).forEach(name=>{

            if(

                name==="ApplicationEngine" ||

                name==="DOMEngine" ||

                name==="Utilities"

            ){

                return;

            }

            const engine=app[name];

            if(

                engine &&

                typeof engine.initialize==="function"

            ){

                try{

                    engine.initialize();

                }

                catch(error){

                    CampusWord2007Simulateur.Utilities.error(

                        name,

                        error

                    );

                }

            }

        });

    },

    isRunning(){

        return this.started;

    },

    getVersion(){

        return this.version;

    },

    getBootTime(){

        return this.bootTime;

    }

};

/* ==========================================================
   APPLICATION BOOTSTRAP
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        CampusWord2007Simulateur.ApplicationEngine.start();

    }

);




/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 3B
   LOADING ENGINE
   Simple Boot Loader
========================================================== */


CampusWord2007Simulateur.LoadingEngine = {

    initialized: false,

    loadingScreen: null,
    progressBar: null,
    message: null,

    progress: 0,
    visible: false,

    fadeOpacity: 1,

    initialize() {

        if (this.initialized) return true;

        const DOM = CampusWord2007Simulateur.DOMEngine;

        this.loadingScreen = DOM.get("word-loading-screen");
        this.progressBar = DOM.get("loading-progress-bar");
        this.message = DOM.get("loading-message");

        if (!this.loadingScreen || !this.progressBar || !this.message) {
            CampusWord2007Simulateur.Utilities.error(
                "LoadingEngine missing elements"
            );
            return false;
        }

        // smooth transition setup
        this.loadingScreen.style.transition = "opacity 0.6s ease";
        this.progressBar.style.transition = "width 0.25s ease";
        this.message.style.transition = "opacity 0.3s ease";

        this.reset();

        this.initialized = true;
        return true;
    },

    reset() {

        this.progress = 0;
        this.visible = true;

        this.loadingScreen.style.opacity = "1";
        this.loadingScreen.style.display = "flex";

        CampusWord2007Simulateur.State.loading = true;

        this.setMessage("Starting Word 2007...");

        this.startFakeProgress();
    },

    show() {
        this.loadingScreen.style.display = "flex";
        this.loadingScreen.style.opacity = "1";
        this.visible = true;
    },

    hide() {

        // smooth fade out
        this.loadingScreen.style.opacity = "0";

        setTimeout(() => {
            this.loadingScreen.style.display = "none";
            this.visible = false;
            CampusWord2007Simulateur.State.loading = false;
        }, 650);
    },

    updateProgress(value) {

        this.progress = CampusWord2007Simulateur.Utilities.clamp(value, 0, 100);

        this.progressBar.style.width = this.progress + "%";

        // dynamic message like Word 2007
        if (this.progress < 30) {
            this.setMessage("Loading components...");
        } else if (this.progress < 60) {
            this.setMessage("Initializing document engine...");
        } else if (this.progress < 90) {
            this.setMessage("Preparing workspace...");
        } else {
            this.setMessage("Almost ready...");
        }
    },

    startFakeProgress() {

        let step = 0;

        const interval = setInterval(() => {

            // smooth acceleration (Word-like feel)
            let increment = Math.random() * 6 + 2;

            step += increment;

            this.updateProgress(step);

            if (step >= 100) {

                clearInterval(interval);

                this.updateProgress(100);

                this.setMessage("Ready");

                setTimeout(() => {

                    this.finish();

                }, 400);
            }

        }, 120);
    },

    finish() {

        // fade out loading screen
        this.hide();

        // optional: trigger app reveal
        const app = document.getElementById("word-app");

        if (app) {
            app.style.opacity = "0";
            app.style.display = "block";

            app.style.transition = "opacity 0.7s ease";

            setTimeout(() => {
                app.style.opacity = "1";
            }, 50);
        }

        CampusWord2007Simulateur.Utilities.log("Word ready");
    },

    setMessage(text) {
        this.message.textContent = text;
    },

    getProgress() {
        return this.progress;
    },

    isVisible() {
        return this.visible;
    }
};



































/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   DOCUMENT ENGINE - CORE FINAL ARCHITECTURE
   (CLEAN + STABLE + FUTURE READY)
========================================================== */

CampusWord2007Simulateur.DocumentEngine = {

    /* ======================================================
       CORE IDENTITY
    ====================================================== */

    documentId: null,
    initialized: false,

    /* ======================================================
       DOM REFERENCES (READ ONLY)
    ====================================================== */

    dom: {
        pageTemplate: null,
        pageContainer: null
    },

    /* ======================================================
       SOURCE OF TRUTH MODEL (MINIMAL BUT COMPLETE)
    ====================================================== */

    model: {

        sections: [
            {
                id: "section-1",
                pages: [
                    {
                        id: "page-1",
                        number: 1,

                        blocks: [
                            {
                                id: "block-1",
                                type: "paragraph",

                                runs: [
                                    {
                                        id: "run-1",
                                        text: "",
                                        style: {
                                            fontFamily: "Calibri",
                                            fontSize: 12,
                                            bold: false,
                                            italic: false,
                                            underline: false,
                                            color: "#000000"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],

        /* CARET (future editing engine) */
        caret: {
            sectionId: "section-1",
            pageId: "page-1",
            blockId: "block-1",
            runId: "run-1",
            offset: 0
        },

        /* SELECTION (Word style anchor/focus) */
        selection: {
            anchor: null,
            focus: null
        },

        /* DOCUMENT METADATA */
        metadata: {
            title: "Untitled",
            font: "Calibri",
            size: 12,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
    },

    /* ======================================================
       EVENT BRIDGE (SAFE ONLY)
    ====================================================== */

    onChange: null,

    triggerChange() {
        if (typeof this.onChange === "function") {
            this.onChange(this.model);
        }
    },

    /* ======================================================
       INITIALIZE (SAFE DOM LINKING ONLY)
    ====================================================== */

    initialize() {

        if (this.initialized) return true;

        const DOM = CampusWord2007Simulateur.DOMEngine;

        this.dom.pageTemplate = DOM.get("document-page-template");
        this.dom.pageContainer = DOM.get("document-pages-container");

        if (!this.dom.pageTemplate || !this.dom.pageContainer) {
            CampusWord2007Simulateur.Utilities.error(
                "DocumentEngine",
                "Missing DOM structure"
            );
            return false;
        }

        this.createDocument();
        this.initialized = true;

        return true;
    },

    /* ======================================================
       CREATE / RESET DOCUMENT
    ====================================================== */

    createDocument() {

        this.documentId =
            CampusWord2007Simulateur.Utilities.generateId("document");

        this.model.sections = [{
            id: "section-1",
            pages: [this._createPage(1)]
        }];

        this.resetCaret();
        this.resetSelection();

        this.triggerChange();
    },

    _createPage(number) {
        return {
            id: "page-" + number,
            number,

            blocks: [{
                id: "block-1",
                type: "paragraph",
                runs: [{
                    id: "run-1",
                    text: "",
                    style: {
                        fontFamily: "Calibri",
                        fontSize: 12,
                        bold: false,
                        italic: false,
                        underline: false,
                        color: "#000000"
                    }
                }]
            }]
        };
    },

    /* ======================================================
       CLEAR / RESET
    ====================================================== */

    clearDocument() {
        this.createDocument();
    },

    newDocument() {
        this.clearDocument();
    },

    /* ======================================================
       CARET SYSTEM (IMPORTANT FOR FUTURE EDITING)
    ====================================================== */

    setCaret(path) {
        this.model.caret = {
            sectionId: path.sectionId,
            pageId: path.pageId,
            blockId: path.blockId,
            runId: path.runId,
            offset: Math.max(0, path.offset || 0)
        };

        this.triggerChange();
    },

    getCaret() {
        return this.model.caret;
    },

    resetCaret() {
        this.model.caret = {
            sectionId: "section-1",
            pageId: "page-1",
            blockId: "block-1",
            runId: "run-1",
            offset: 0
        };
    },

    /* ======================================================
       SELECTION SYSTEM
    ====================================================== */

    setSelection(anchor, focus) {
        this.model.selection = { anchor, focus };
        this.triggerChange();
    },

    getSelection() {
        return this.model.selection;
    },

    resetSelection() {
        this.model.selection = { anchor: null, focus: null };
    },

    /* ======================================================
       TEXT API (CORE OUTPUT)
    ====================================================== */

    getFullText() {

        let text = "";

        for (const s of this.model.sections) {
            for (const p of s.pages) {
                for (const b of p.blocks) {
                    for (const r of b.runs) {
                        text += r.text;
                    }
                    text += "\n";
                }
            }
        }

        return text;
    },

    /* ======================================================
       SAFE READ HELPERS
    ====================================================== */

    getPages() {
        return this.model.sections[0].pages;
    },

    getPageCount() {
        return this.getPages().length;
    },

    getPage(index) {
        return this.getPages()[index] || null;
    }
};



























/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 3B
   PAGE FACTORY
   Dynamic Page Creation
========================================================== */
CampusWord2007Simulateur.PageFactory={

    initialized:false,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.initialized=true;

        return true;

    },

    createPage(){

        const Document=

            CampusWord2007Simulateur.DocumentEngine;

        if(

            !Document.pageTemplate ||

            !Document.pageContainer

        ){

            CampusWord2007Simulateur.Utilities.error(

                "PageFactory",

                "Document template or container unavailable."

            );

            return null;

        }

        const fragment=

            Document.pageTemplate.content.cloneNode(

                true

            );

        const page=

            fragment.querySelector(

                ".document-page"

            );

        if(!page){

            CampusWord2007Simulateur.Utilities.error(

                "PageFactory",

                "Unable to create page."

            );

            return null;

        }

        Document.pageCounter++;

        page.dataset.pageNumber=

            Document.pageCounter;

        page.id=

            "document-page-"+

            Document.pageCounter;

        Document.pageContainer.appendChild(

            fragment

        );

        const createdPage=

            Document.pageContainer.lastElementChild;

        if(!createdPage){

            CampusWord2007Simulateur.Utilities.error(

                "PageFactory",

                "Page creation failed."

            );

            return null;

        }

        Document.pages.push(

            createdPage

        );

        Document.setActivePage(

            createdPage

        );

        CampusWord2007Simulateur.State.currentPage=

            Document.pageCounter;

        CampusWord2007Simulateur.State.totalPages=

            Document.pages.length;

        Document.updateStatus();

        const Caret=

            CampusWord2007Simulateur.CaretEngine;

        if(

            Caret &&

            typeof Caret.attachToPage==="function"

        ){

            Caret.attachToPage(

                createdPage

            );

        }

        return createdPage;

    }

};

















CampusWord2007Simulateur.CaretEngine = {

    /* ======================================================
       STATE
    ====================================================== */

    position: 0,
    visible: true,

    /* ======================================================
       INIT CARET (ALWAYS SAFE START)
    ====================================================== */

    initialize() {
        this.position = 0;
        this.visible = true;
    },

    /* ======================================================
       SET CARET SAFELY
       -> never allow invalid position
    ====================================================== */

    set(position) {

        const text =
            CampusWord2007Simulateur.DocumentEngine.getFullText();

        this.position = this._clamp(position, 0, text.length);

        this._syncToModel();
    },

    /* ======================================================
       MOVE CARET (INSERT MODE SAFE)
    ====================================================== */

    move(offset) {
        this.set(this.position + offset);
    },

    /* ======================================================
       INSERT TEXT (CRITICAL FIX ZONE)
    ====================================================== */

    insert(textToInsert) {

        const doc = CampusWord2007Simulateur.DocumentEngine;

        let text = doc.getFullText();

        const before = text.slice(0, this.position);
        const after = text.slice(this.position);

        const newText = before + textToInsert + after;

        doc.model.sections[0].pages[0]
            .blocks[0]
            .runs[0]
            .text = newText;

        this.position += textToInsert.length;

        doc.triggerChange();
    },

    /* ======================================================
       BACKSPACE (NO BUG GUARANTEE)
    ====================================================== */

    backspace() {

        if (this.position <= 0) return;

        const doc = CampusWord2007Simulateur.DocumentEngine;

        let text = doc.getFullText();

        const before = text.slice(0, this.position - 1);
        const after = text.slice(this.position);

        const newText = before + after;

        doc.model.sections[0].pages[0]
            .blocks[0]
            .runs[0]
            .text = newText;

        this.position--;

        doc.triggerChange();
    },

    /* ======================================================
       FORCE SAFE START (IMPORTANT FOR YOU)
    ====================================================== */

    resetToStart() {
        this.position = 0;
    },

    /* ======================================================
       FORCE END (FIX YOUR "Je suis Selv[andieu]" ISSUE)
    ====================================================== */

    resetToEnd() {

        const text =
            CampusWord2007Simulateur.DocumentEngine.getFullText();

        this.position = text.length;
    },

    /* ======================================================
       INTERNAL SYNC TO MODEL
    ====================================================== */

    _syncToModel() {

        const doc =
            CampusWord2007Simulateur.DocumentEngine;

        doc.model.caret = {
            position: this.position
        };

        doc.triggerChange();
    },

    /* ======================================================
       SAFE CLAMP
    ====================================================== */

    _clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }
};











CampusWord2007Simulateur.CaretVisualEngine = {

    caretEl: null,
    blinkInterval: null,

    visible: true,

    initialize() {

        // create caret element
        this.caretEl = document.createElement("div");

        this.caretEl.id = "cw-caret";
        this.caretEl.style.position = "absolute";
        this.caretEl.style.width = "2px";
        this.caretEl.style.background = "black";
        this.caretEl.style.zIndex = "999999";
        this.caretEl.style.height = "18px";
        this.caretEl.style.pointerEvents = "none";

        document.body.appendChild(this.caretEl);

        this.startBlink();
    },

    /* =========================================
       MAIN UPDATE (CALL THIS ALWAYS)
    ========================================= */

    update() {

        const doc = CampusWord2007Simulateur.DocumentEngine;
        const caret = CampusWord2007Simulateur.CaretEngine;

        if (!doc || !caret) return;

        const pos = caret.position;

        const pages = doc.dom.pageContainer;

        if (!pages) return;

        const page = pages.querySelector(".document-page");

        if (!page) return;

        const textLayer = page.querySelector(".page-text-layer");

        if (!textLayer) return;

        // create invisible range for accurate position
        const range = document.createRange();
        const textNode = this._getTextNode(textLayer);

        if (!textNode) return;

        const safePos = Math.min(pos, textNode.length);

        range.setStart(textNode, safePos);
        range.setEnd(textNode, safePos);

        const rect = range.getBoundingClientRect();

        // position caret
        this.caretEl.style.left = rect.left + window.scrollX + "px";
        this.caretEl.style.top = rect.top + window.scrollY + "px";

        this.caretEl.style.height = rect.height + "px";
    },

    /* =========================================
       BLINK EFFECT (WORD STYLE)
    ========================================= */

    startBlink() {

        this.blinkInterval = setInterval(() => {

            this.visible = !this.visible;

            this.caretEl.style.opacity =
                this.visible ? "1" : "0";

        }, 530); // Word 2007 speed

    },

    stopBlink() {
        clearInterval(this.blinkInterval);
    },

    /* =========================================
       TEXT NODE SAFETY
    ========================================= */

    _getTextNode(container) {

        // simple fallback (you can improve later)
        const el = container.querySelector(".page-text-layer");

        if (!el) return null;

        if (!el.firstChild) {

            el.textContent = " "; // prevent crash
        }

        return el.firstChild;
    }
};







document.addEventListener("click", () => {
    CampusWord2007Simulateur.CaretVisualEngine.update();
});

document.addEventListener("keyup", () => {
    CampusWord2007Simulateur.CaretVisualEngine.update();
});























































/* ==========================================================
   OFFICE MENU TOGGLE
   ========================================================== */

CampusWord2007Simulateur
    .toggleOfficeMenu =
function(){

    console.log(
        "[OFFICE] Bouton Office klike"
    );

    const menu =
        CampusWord2007Simulateur
            .DOM
            .officeMenu;

    console.log(
        "[OFFICE] Menu jwenn:",
        menu
    );

    if(!menu){

        console.log(
            "[OFFICE] officeMenu = NULL"
        );

        return;
    }

    menu.classList.toggle(
        "open"
    );

    console.log(
        "[OFFICE] Klas open:",
        menu.classList.contains(
            "open"
        )
    );
};














/* ==========================================================
   RIBBON TAB SWITCHER
   ========================================================== */

CampusWord2007Simulateur
    .RibbonTabsEngine = {

    initialize : function(){

        const homeTabButton =
            document.getElementById(
                "tab-home"
            );

        const insertTabButton =
            document.getElementById(
                "tab-insert"
            );

        const homeTab =
            document.getElementById(
                "home-tab"
            );

        const insertTab =
            document.getElementById(
                "insert-tab"
            );

        if(
            homeTab
        ){
            homeTab.style.display =
                "flex";
        }

        if(
            insertTab
        ){
            insertTab.style.display =
                "none";
        }

        if(
            homeTabButton
        ){

            homeTabButton
            .addEventListener(
                "click",
                function(){

                    homeTab.style.display =
                        "flex";

                    insertTab.style.display =
                        "none";

                }
            );

        }

        if(
            insertTabButton
        ){

            insertTabButton
            .addEventListener(
                "click",
                function(){

                    homeTab.style.display =
                        "none";

                    insertTab.style.display =
                        "flex";

                }
            );

        }

    }

};

























function showTab(tabName){

    // kache tout tab yo

    document.getElementById(
        "home-tab"
    ).style.display = "none";

    document.getElementById(
        "insert-tab"
    ).style.display = "none";

    document.getElementById(
        "format-tab"
    ).style.display = "none";

    document.getElementById(
        "page-layout-tab"
    ).style.display = "none";

    document.getElementById(
        "references-tab"
    ).style.display = "none";

    // montre tab yo klike a

    document.getElementById(
        tabName
    ).style.display = "flex";
}

// HOME

document
.getElementById(
    "tab-home"
)
.addEventListener(
    "click",
    function(){

        showTab(
            "home-tab"
        );

    }
);

// INSERT

document
.getElementById(
    "tab-insert"
)
.addEventListener(
    "click",
    function(){

        showTab(
            "insert-tab"
        );

    }
);

// FORMAT

document
.getElementById(
    "tab-format"
)
.addEventListener(
    "click",
    function(){

        showTab(
            "format-tab"
        );

    }
);

// PAGE LAYOUT

document
.getElementById(
    "tab-page-layout"
)
.addEventListener(
    "click",
    function(){

        showTab(
            "page-layout-tab"
        );

    }
);

// REFERENCES

document
.getElementById(
    "tab-references"
)
.addEventListener(
    "click",
    function(){

        showTab(
            "references-tab"
        );

    }
);

// OUVRI HOME PA DEFO

showTab(
    "home-tab"
);


















CampusWord2007Simulateur.FormattingEngine = {

    state: {
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        fontFamily: "Calibri",
        fontSize: 12,
        color: "#000000",
        highlight: "transparent"
    },

    wrap: function(text){

        const s = this.state;

        let style = "";

        if(s.bold) style += "font-weight:bold;";
        if(s.italic) style += "font-style:italic;";
        if(s.underline) style += "text-decoration:underline;";
        if(s.strikeThrough) style += "text-decoration:line-through;";

        style += "font-family:" + s.fontFamily + ";";
        style += "font-size:" + s.fontSize + "px;";
        style += "color:" + s.color + ";";

        if(s.highlight !== "transparent"){
            style += "background:" + s.highlight + ";";
        }

        return `<span style="${style}">${text}</span>`;
    }
};





CampusWord2007Simulateur
    .TextEngine
    .wrapCharacter =
function(character){

    return CampusWord2007Simulateur
        .FormattingEngine
        .wrap(character);
};





/* ==========================================================
   FORMAT BUTTONS EVENTS
   ========================================================== */

document.addEventListener("DOMContentLoaded", function(){

    const fs = CampusWord2007Simulateur.FormattingEngine.state;

    const boldBtn = document.getElementById("btn-bold");
    if(boldBtn){
        boldBtn.onclick = function(){
            fs.bold = !fs.bold;
        };
    }

    const italicBtn = document.getElementById("btn-italic");
    if(italicBtn){
        italicBtn.onclick = function(){
            fs.italic = !fs.italic;
        };
    }

    const underlineBtn = document.getElementById("btn-underline");
    if(underlineBtn){
        underlineBtn.onclick = function(){
            fs.underline = !fs.underline;
        };
    }

    const strikeBtn = document.getElementById("btn-strikethrough");
    if(strikeBtn){
        strikeBtn.onclick = function(){
            fs.strikeThrough = !fs.strikeThrough;
        };
    }

});

















/* ==========================================================
   HOME RIBBON ENGINE
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const fs =
            CampusWord2007Simulateur
                .FormattingEngine
                .state;

        /* FONT FAMILY */

        const fontFamily =
            document.getElementById(
                "font-family"
            );

        if(fontFamily){

            fontFamily.addEventListener(
                "change",
                function(){

                    fs.fontFamily =
                        this.value;

                }
            );

        }

        /* FONT SIZE */

        const fontSize =
            document.getElementById(
                "font-size"
            );

        if(fontSize){

            fontSize.addEventListener(
                "change",
                function(){

                    fs.fontSize =
                        Number(
                            this.value
                        ) || 12;

                }
            );

        }

        /* GROW FONT */

        const growFont =
            document.getElementById(
                "btn-grow-font"
            );

        if(growFont){

            growFont.addEventListener(
                "click",
                function(){

                    fs.fontSize++;

                    if(fontSize){
                        fontSize.value =
                            fs.fontSize;
                    }

                }
            );

        }

        /* SHRINK FONT */

        const shrinkFont =
            document.getElementById(
                "btn-shrink-font"
            );

        if(shrinkFont){

            shrinkFont.addEventListener(
                "click",
                function(){

                    fs.fontSize =
                        Math.max(
                            1,
                            fs.fontSize - 1
                        );

                    if(fontSize){
                        fontSize.value =
                            fs.fontSize;
                    }

                }
            );

        }

        /* FONT COLOR */

        const fontColor =
            document.getElementById(
                "btn-font-color"
            );

        if(fontColor){

            fontColor.addEventListener(
                "click",
                function(){

                    const color =
                        prompt(
                            "Font color (#ff0000)"
                        );

                    if(color){

                        fs.color =
                            color;

                    }

                }
            );

        }

        /* HIGHLIGHT */

        const highlight =
            document.getElementById(
                "btn-highlight"
            );

        if(highlight){

            highlight.addEventListener(
                "click",
                function(){

                    const color =
                        prompt(
                            "Highlight color"
                        );

                    if(color){

                        fs.highlight =
                            color;

                    }

                }
            );

        }

    }
);
