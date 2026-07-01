
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
   PHASE 3A
   DOCUMENT ENGINE
   Dynamic Document Management
========================================================== */

CampusWord2007Simulateur.DocumentEngine = {

    documentId:null,

    pages:[],

    activePage:null,

    pageTemplate:null,

    pageContainer:null,

    pageCounter:0,

    initialized:false,

    initialize(){

        if(this.initialized){

            return true;

        }

        const DOM=

            CampusWord2007Simulateur.DOMEngine;

        this.pageTemplate=

            DOM.get("document-page-template");

        this.pageContainer=

            DOM.get("document-pages-container");

        if(

            !this.pageTemplate ||

            !this.pageContainer

        ){

            CampusWord2007Simulateur.Utilities.error(

                "DocumentEngine",

                "Document template or container missing."

            );

            return false;

        }

        this.createDocument();

        this.initialized=true;

        return true;

    },

    createDocument(){

        this.documentId=

            CampusWord2007Simulateur.Utilities.generateId(

                "document"

            );

        this.pages=[];

        this.pageCounter=0;

        this.pageContainer.innerHTML="";

        CampusWord2007Simulateur.PageFactory.createPage();

    },

    getActivePage(){

        return this.activePage;

    },

    getPage(index){

        return this.pages[index] || null;

    },

    getPageCount(){

        return this.pages.length;

    },

    getPages(){

        return [...this.pages];

    },

    setActivePage(page){

        if(!page){

            return;

        }

        this.activePage=page;

        this.updateStatus();

    },

    clearDocument(){

        this.pages=[];

        this.pageCounter=0;

        this.activePage=null;

        this.pageContainer.innerHTML="";

    },

    newDocument(){

        this.clearDocument();

        this.createDocument();

    },

    updateStatus(){

        const status=

            CampusWord2007Simulateur.DOMEngine.get(

                "status-page-number"

            );

        if(status){

            status.textContent=

                "Page "+

                this.pageCounter+

                " of "+

                this.pageCounter;

        }

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










/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.0
   FOUNDATION KERNEL
   Dynamic Layout Core
   ----------------------------------------------------------
   RESPONSIBILITY

   • Initialize Layout Engine
   • Store runtime state
   • Register current page
   • Register writable area
   • Register current caret position
   • Provide shared runtime for all future modules
   • Remain independent from rendering

   DOES NOT

   ✘ Render DOM
   ✘ Create Pages
   ✘ Create Paragraphs
   ✘ Create Caret
   ✘ Measure Characters
   ✘ Calculate Line Breaks
========================================================== */

CampusWord2007Simulateur.LayoutEngine = {

    /* ======================================================
       ENGINE STATE
    ====================================================== */

    initialized:false,

    ready:false,

    version:"1.0",

    /* ======================================================
       CURRENT DOCUMENT REFERENCES
    ====================================================== */

    current:{

        page:null,

        content:null

    },

    /* ======================================================
       PAGE METRICS
    ====================================================== */

    page:{

        width:0,

        height:0

    },

    /* ======================================================
       WRITABLE AREA
    ====================================================== */

    writableArea:{

        left:0,

        top:0,

        width:0,

        height:0,

        right:0,

        bottom:0

    },

    /* ======================================================
       CURRENT CARET POSITION
    ====================================================== */

    caret:{

        x:0,

        y:0,

        height:0,

        baseline:0

    },

    /* ======================================================
       FUTURE MODULE REGISTRY
    ====================================================== */

    modules:Object.create(null),

    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(){

        if(this.initialized){

            return true;

        }

        this.reset();

        this.initialized=true;

        this.ready=true;

        return true;

    },

    /* ======================================================
       RESET
    ====================================================== */

    reset(){

        this.current.page=null;

        this.current.content=null;

        this.page.width=0;

        this.page.height=0;

        this.writableArea.left=0;
        this.writableArea.top=0;
        this.writableArea.width=0;
        this.writableArea.height=0;
        this.writableArea.right=0;
        this.writableArea.bottom=0;

        this.caret.x=0;
        this.caret.y=0;
        this.caret.height=0;
        this.caret.baseline=0;

    },

    /* ======================================================
       MODULE REGISTRATION
    ====================================================== */

    registerModule(name,module){

        if(
            typeof name!=="string" ||
            !name ||
            !module
        ){

            return false;

        }

        this.modules[name]=module;

        return true;

    },

    getModule(name){

        return this.modules[name] || null;

    },

    /* ======================================================
       ENGINE STATUS
    ====================================================== */

    isReady(){

        return this.ready;

    }

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.1
   PAGE MEASUREMENT
   ----------------------------------------------------------
   RESPONSIBILITY

   • Measure current page
   • Measure page content
   • Store page dimensions
   • Register active page

   DOES NOT

   ✘ Calculate writable area
   ✘ Calculate caret
   ✘ Render DOM
========================================================== */

(function(){

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    Layout.measurePage = function(page){

        if(!page){

            return false;

        }

        const content =
            page.querySelector(".page-content");

        if(!content){

            return false;

        }

        this.current.page =
            page;

        this.current.content =
            content;

        this.page.width =
            content.clientWidth;

        this.page.height =
            content.clientHeight;

        return {

            width:this.page.width,

            height:this.page.height

        };

    };

    Layout.getCurrentPage = function(){

        return this.current.page;

    };

    Layout.getPageSize = function(){

        return{

            width:this.page.width,

            height:this.page.height

        };

    };

})();












/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2
   WRITABLE AREA
   ----------------------------------------------------------
   RESPONSIBILITY

   • Calculate writable area
   • Apply page margins
   • Store writable rectangle
   • Provide public writable API

   DOES NOT

   ✘ Render DOM
   ✘ Move Caret
   ✘ Measure Characters
   ✘ Create Pages
========================================================== */

(function(){

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    /* ======================================================
       PAGE MARGINS
    ====================================================== */

    Layout.margins = {

        top:96,

        right:96,

        bottom:96,

        left:96

    };

    /* ======================================================
       CALCULATE WRITABLE AREA
    ====================================================== */

    Layout.getWritableArea = function(){

        const width =
            Math.max(
                0,
                this.page.width -
                this.margins.left -
                this.margins.right
            );

        const height =
            Math.max(
                0,
                this.page.height -
                this.margins.top -
                this.margins.bottom
            );

        this.writableArea.left =
            this.margins.left;

        this.writableArea.top =
            this.margins.top;

        this.writableArea.width =
            width;

        this.writableArea.height =
            height;

        this.writableArea.right =
            this.writableArea.left +
            width;

        this.writableArea.bottom =
            this.writableArea.top +
            height;

        return {

            left:this.writableArea.left,

            top:this.writableArea.top,

            width:this.writableArea.width,

            height:this.writableArea.height,

            right:this.writableArea.right,

            bottom:this.writableArea.bottom

        };

    };

    /* ======================================================
       UPDATE PAGE MARGINS
    ====================================================== */

    Layout.setMargins = function(margins={}){

        if(typeof margins.left==="number"){

            this.margins.left =
                margins.left;

        }

        if(typeof margins.top==="number"){

            this.margins.top =
                margins.top;

        }

        if(typeof margins.right==="number"){

            this.margins.right =
                margins.right;

        }

        if(typeof margins.bottom==="number"){

            this.margins.bottom =
                margins.bottom;

        }

        return this.getWritableArea();

    };

})();













/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.4 (FIXED)
   FIRST INSERTION POINT
   ----------------------------------------------------------
   RESPONSIBILITY

   • Compute first insertion point
   • Use writable area only
   • Return logical caret coordinates
   • Keep page reference
========================================================== */

(function () {

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    if (!Layout) return;

    /* ======================================================
       FIRST INSERTION POINT
    ====================================================== */

    Layout.getFirstInsertionPoint = function (page) {

        // 🔧 Ensure page is provided
        page = page || this.current.page;

        if (!page) {
            return null;
        }

        // 🔧 Measure page BEFORE writable area
        if (typeof this.measurePage === "function") {
            this.measurePage(page);
        }

        // 🔧 Writable area safety check
        const area =
            typeof this.getWritableArea === "function"
                ? this.getWritableArea()
                : null;

        if (!area) {
            return null;
        }

        // 🔧 Safe default line metrics
        const lineHeight =
            (typeof this.defaultLineHeight === "number")
                ? this.defaultLineHeight
                : 19;

        const baselineOffset =
            Math.round(lineHeight * 0.80);

        // ======================================================
        // RETURN CARET LOGICAL POSITION
        // ======================================================

        return {

            page: page,

            x: Math.round(area.left),

            y: Math.round(area.top),

            baseline: Math.round(area.top + baselineOffset),

            height: lineHeight

        };

    };

})();












CampusWord2007Simulateur.LayoutEngine.commitCaret = function(page) {

    const pos = this.getFirstInsertionPoint(page);

    if (!pos) return null;

    this.currentCaretPosition = pos;

    if (CampusWord2007Simulateur.CaretEngine?.render) {
        CampusWord2007Simulateur.CaretEngine.render(pos);
    }

    return pos;
};











/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.1
   FOUNDATION KERNEL
   ----------------------------------------------------------
   RESPONSIBILITY

   • Create visual caret
   • Attach caret to page
   • Store current page
   • Store current layer

   DOES NOT

   ✘ Calculate coordinates
   ✘ Measure page
   ✘ Measure characters
   ✘ Resolve line breaks
   ✘ Resolve page breaks

   ALL POSITION CALCULATIONS
   ARE PROVIDED BY LAYOUT ENGINE
========================================================== */

CampusWord2007Simulateur.CaretEngine = {

    initialized:false,

    visible:false,

    page:null,

    layer:null,

    element:null,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized = true;

        return true;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.2
   PAGE ATTACHMENT
   ----------------------------------------------------------
   RESPONSIBILITY

   • Attach caret to a page
   • Create visual caret
   • Locate caret layer
   • Keep one caret instance

   DOES NOT

   ✘ Calculate coordinates
   ✘ Move caret
   ✘ Blink
   ✘ Modify text
========================================================== */

(function(){

    const Caret =
        CampusWord2007Simulateur.CaretEngine;

    if(!Caret){
        return;
    }

    /* ======================================================
       ATTACH TO PAGE
    ====================================================== */

    Caret.attachToPage = function(page){

        if(!page){
            return false;
        }

        const layer =
            page.querySelector(
                ".page-caret-layer"
            );

        if(!layer){
            return false;
        }

        this.page = page;
        this.layer = layer;

        /* ----------------------------------------------
           CREATE CARET IF NEEDED
        ---------------------------------------------- */

        if(!this.element){

            const caret =
                document.createElement("div");

            caret.className =
                "document-caret";

            caret.setAttribute(
                "aria-hidden",
                "true"
            );

            caret.style.position =
                "absolute";

            caret.style.left =
                "0px";

            caret.style.top =
                "0px";

            caret.style.width =
                "1px";

            caret.style.height =
                "19px";

            caret.style.display =
                "none";

            caret.style.pointerEvents =
                "none";

            this.element =
                caret;

        }

        /* ----------------------------------------------
           MOVE CARET TO CURRENT PAGE
        ---------------------------------------------- */

        if(
            this.element.parentNode !== layer
        ){

            if(
                this.element.parentNode
            ){

                this.element.parentNode.removeChild(
                    this.element
                );

            }

            layer.appendChild(
                this.element
            );

        }

        return true;

    };

})();










/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.3
   VISUAL CARET CONTROL
   ----------------------------------------------------------
   RESPONSIBILITY

   • Move visual caret
   • Refresh from LayoutEngine
   • Automatically switch page
   • Show caret
   • Hide caret

   DOES NOT

   ✘ Calculate coordinates
   ✘ Measure page
   ✘ Measure text
   ✘ Resolve insertion point
========================================================== */

(function(){

    const Caret =
        CampusWord2007Simulateur.CaretEngine;

    if(!Caret){
        return;
    }

    /* ======================================================
       MOVE CARET
    ====================================================== */

    Caret.moveTo = function(position){

        if(
            !this.element ||
            !position
        ){
            return false;
        }

        this.element.style.left =
            (Number(position.x) || 0) + "px";

        this.element.style.top =
            (Number(position.y) || 0) + "px";

        this.element.style.height =
            (Number(position.height) || 19) + "px";

        return true;

    };

    /* ======================================================
       REFRESH FROM LAYOUT ENGINE
    ====================================================== */

    Caret.refresh = function(){

        const Layout =
            CampusWord2007Simulateur.LayoutEngine;

        if(
            !Layout ||
            typeof Layout.getCurrentCaretPosition !==
            "function"
        ){
            return false;
        }

        const position =
            Layout.getCurrentCaretPosition();

        if(!position){
            return false;
        }

        if(
            position.page &&
            position.page !== this.page
        ){

            this.attachToPage(
                position.page
            );

        }

        this.moveTo(position);

        this.show();

        return true;

    };

    /* ======================================================
       SHOW
    ====================================================== */

    Caret.show = function(){

        if(!this.element){
            return false;
        }

        this.element.style.display =
            "block";

        this.element.style.opacity =
            "1";

        this.visible = true;

        if(
            typeof this.restartBlink ===
            "function"
        ){
            this.restartBlink();
        }

        return true;

    };

    /* ======================================================
       HIDE
    ====================================================== */

    Caret.hide = function(){

        if(!this.element){
            return false;
        }

        if(
            typeof this.stopBlink ===
            "function"
        ){
            this.stopBlink();
        }

        this.element.style.display =
            "none";

        this.visible = false;

        return true;

    };

})();









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.4
   BLINK MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Start caret blinking
   • Stop caret blinking
   • Restart blinking
   • Keep visual state synchronized

   DOES NOT

   ✘ Calculate coordinates
   ✘ Move caret
   ✘ Render text
   ✘ Measure page
========================================================== */

(function(){

    const Caret =
        CampusWord2007Simulateur.CaretEngine;

    if(!Caret){
        return;
    }

    /* ======================================================
       BLINK STATE
    ====================================================== */

    Caret.blinkTimer = null;

    Caret.blinkDelay = 530;

    /* ======================================================
       START BLINK
    ====================================================== */

    Caret.startBlink = function(){

        if(
            !this.element ||
            this.blinkTimer
        ){
            return false;
        }

        this.element.style.opacity = "1";

        this.blinkTimer =
            window.setInterval(()=>{

                if(
                    !this.element ||
                    !this.visible
                ){
                    return;
                }

                this.element.style.opacity =
                    this.element.style.opacity === "0"
                        ? "1"
                        : "0";

            },this.blinkDelay);

        return true;

    };

    /* ======================================================
       STOP BLINK
    ====================================================== */

    Caret.stopBlink = function(){

        if(this.blinkTimer){

            clearInterval(
                this.blinkTimer
            );

            this.blinkTimer = null;

        }

        if(this.element){

            this.element.style.opacity = "1";

        }

        return true;

    };

    /* ======================================================
       RESTART BLINK
    ====================================================== */

    Caret.restartBlink = function(){

        this.stopBlink();

        if(this.visible){

            this.startBlink();

        }

        return true;

    };

})();








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.5
   PUBLIC API
   ----------------------------------------------------------
   RESPONSIBILITY

   • Reset caret
   • Destroy caret
   • Expose public state

   DOES NOT

   ✘ Calculate coordinates
   ✘ Render text
   ✘ Measure page
   ✘ Create pages
========================================================== */

(function(){

    const Caret =
        CampusWord2007Simulateur.CaretEngine;

    if(!Caret){
        return;
    }

    /* ======================================================
       IS INITIALIZED
    ====================================================== */

    Caret.isInitialized = function(){

        return this.initialized === true;

    };

    /* ======================================================
       IS VISIBLE
    ====================================================== */

    Caret.isVisible = function(){

        return this.visible === true;

    };

    /* ======================================================
       GET CURRENT PAGE
    ====================================================== */

    Caret.getCurrentPage = function(){

        return this.page;

    };

    /* ======================================================
       GET CURRENT ELEMENT
    ====================================================== */

    Caret.getElement = function(){

        return this.element;

    };

    /* ======================================================
       RESET
    ====================================================== */

    Caret.reset = function(){

        this.stopBlink();

        if(this.element){

            this.element.style.left = "0px";
            this.element.style.top = "0px";
            this.element.style.height = "19px";
            this.element.style.opacity = "1";
            this.element.style.display = "none";

        }

        this.visible = false;

        this.page = null;
        this.layer = null;

        return true;

    };

    /* ======================================================
       DESTROY
    ====================================================== */

    Caret.destroy = function(){

        this.stopBlink();

        if(
            this.element &&
            this.element.parentNode
        ){

            this.element.parentNode.removeChild(
                this.element
            );

        }

        this.element = null;
        this.page = null;
        this.layer = null;

        this.visible = false;
        this.initialized = false;

        return true;

    };

})();










/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.6
   LAYOUT BRIDGE
   ----------------------------------------------------------
   RESPONSIBILITY

   • Connect LayoutEngine to CaretEngine
   • Initialize first caret
   • Refresh caret after layout update

   DOES NOT

   ✘ Calculate coordinates
   ✘ Render text
   ✘ Measure page
========================================================== */

(function(){

    const Caret =
        CampusWord2007Simulateur.CaretEngine;

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    if(
        !Caret ||
        !Layout
    ){
        return;
    }

    /* ======================================================
       SYNCHRONIZE
    ====================================================== */

    Caret.synchronize = function(){

        if(
            !this.page ||
            typeof Layout.getCurrentCaretPosition !==
            "function"
        ){
            return false;
        }

        const position =
            Layout.getCurrentCaretPosition();

        if(!position){
            return false;
        }

        return this.refresh();

    };

    /* ======================================================
       INITIALIZE FIRST CARET
    ====================================================== */

    Caret.initializeOnPage = function(page){

        if(!page){
            return false;
        }

        if(
            typeof Layout.initialize ===
            "function"
        ){
            Layout.initialize(page);
        }

        if(
            typeof this.attachToPage ===
            "function"
        ){
            this.attachToPage(page);
        }

        return this.synchronize();

    };

})();



























































































































































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
