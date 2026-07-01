
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
   PHASE 1.1
   FOUNDATION KERNEL
========================================================== */

CampusWord2007Simulateur.LayoutEngine = {

    /* ======================================================
       ENGINE STATE
    ====================================================== */

    initialized:false,

    ready:false,

    rendering:false,

    updating:false,

    layoutLocked:false,



    /* ======================================================
       DOCUMENT METRICS
    ====================================================== */

    pageWidth:794,

    pageHeight:1123,

    marginTop:96,

    marginRight:96,

    marginBottom:96,

    marginLeft:96,



    /* ======================================================
       TEXT METRICS
    ====================================================== */

    defaultFont:"Calibri",

    defaultFontSize:16,

    defaultLineHeight:19,

    defaultCharacterSpacing:0,

    defaultWordSpacing:0,



    /* ======================================================
       CURRENT LAYOUT STATE
    ====================================================== */

    currentPage:null,

    currentParagraph:null,

    currentLine:null,

    currentCharacter:null,



    /* ======================================================
       CARET LOGICAL POSITION
       (NOT PIXELS ON SCREEN)
    ====================================================== */

    caret:{

        pageIndex:0,

        paragraphIndex:0,

        lineIndex:0,

        characterIndex:0,

        preferredColumn:0

    },



    /* ======================================================
       CACHED POSITIONS
    ====================================================== */

    positions:{

        pages:[],

        paragraphs:[],

        lines:[],

        characters:[]

    },



    /* ======================================================
       LAYOUT FLAGS
    ====================================================== */

    dirty:{

        document:true,

        pages:true,

        paragraphs:true,

        lines:true,

        caret:true

    },



    /* ======================================================
       INITIALIZATION
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

        this.currentPage=null;

        this.currentParagraph=null;

        this.currentLine=null;

        this.currentCharacter=null;



        this.caret.pageIndex=0;
        this.caret.paragraphIndex=0;
        this.caret.lineIndex=0;
        this.caret.characterIndex=0;
        this.caret.preferredColumn=0;



        this.positions.pages.length=0;
        this.positions.paragraphs.length=0;
        this.positions.lines.length=0;
        this.positions.characters.length=0;



        this.markDirty();

    },



    /* ======================================================
       DIRTY MANAGEMENT
    ====================================================== */

    markDirty(){

        this.dirty.document=true;
        this.dirty.pages=true;
        this.dirty.paragraphs=true;
        this.dirty.lines=true;
        this.dirty.caret=true;

    },

    clearDirty(){

        this.dirty.document=false;
        this.dirty.pages=false;
        this.dirty.paragraphs=false;
        this.dirty.lines=false;
        this.dirty.caret=false;

    },



    /* ======================================================
       LOCK
    ====================================================== */

    lock(){

        this.layoutLocked=true;

    },

    unlock(){

        this.layoutLocked=false;

    },



    /* ======================================================
       DOCUMENT METRICS
    ====================================================== */

    getContentWidth(){

        return this.pageWidth-
               this.marginLeft-
               this.marginRight;

    },

    getContentHeight(){

        return this.pageHeight-
               this.marginTop-
               this.marginBottom;

    },



    /* ======================================================
       PAGE REGISTRATION
    ====================================================== */

    setCurrentPage(page){

        this.currentPage=page;

    },

    getCurrentPage(){

        return this.currentPage;

    },



    /* ======================================================
       PARAGRAPH REGISTRATION
    ====================================================== */

    setCurrentParagraph(paragraph){

        this.currentParagraph=paragraph;

    },

    getCurrentParagraph(){

        return this.currentParagraph;

    },



    /* ======================================================
       LINE REGISTRATION
    ====================================================== */

    setCurrentLine(line){

        this.currentLine=line;

    },

    getCurrentLine(){

        return this.currentLine;

    },



    /* ======================================================
       CHARACTER REGISTRATION
    ====================================================== */

    setCurrentCharacter(character){

        this.currentCharacter=character;

    },

    getCurrentCharacter(){

        return this.currentCharacter;

    },



    /* ======================================================
       ENGINE STATUS
    ====================================================== */

    isReady(){

        return this.ready;

    },

    isLocked(){

        return this.layoutLocked;

    },

    isDirty(){

        return(

            this.dirty.document||
            this.dirty.pages||
            this.dirty.paragraphs||
            this.dirty.lines||
            this.dirty.caret

        );

    }

};





/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2A
   GEOMETRY OBJECTS & METRICS CACHE
========================================================== */

CampusWord2007Simulateur.LayoutEngine.metrics = {

    /* ======================================================
       DOCUMENT GEOMETRY
    ====================================================== */

    document:{

        width:0,
        height:0,

        left:0,
        top:0,
        right:0,
        bottom:0

    },

    /* ======================================================
       PAGE GEOMETRY
    ====================================================== */

    page:{

        width:0,
        height:0,

        left:0,
        top:0,
        right:0,
        bottom:0

    },

    /* ======================================================
       CONTENT AREA
    ====================================================== */

    content:{

        left:0,
        top:0,

        right:0,
        bottom:0,

        width:0,
        height:0

    },

    /* ======================================================
       MARGINS
    ====================================================== */

    margins:{

        left:0,
        top:0,
        right:0,
        bottom:0

    },

    /* ======================================================
       TEXT AREA
    ====================================================== */

    textArea:{

        left:0,
        top:0,

        width:0,
        height:0,

        right:0,
        bottom:0

    },

    /* ======================================================
       LINE METRICS
    ====================================================== */

    line:{

        height:19,

        baseline:15,

        ascent:15,

        descent:4

    },

    /* ======================================================
       CHARACTER METRICS
    ====================================================== */

    character:{

        width:0,

        height:19,

        spacing:0

    },

    /* ======================================================
       CARET METRICS
    ====================================================== */

    caret:{

        width:1,

        height:19,

        x:0,

        y:0

    },

    /* ======================================================
       PARAGRAPH METRICS
    ====================================================== */

    paragraph:{

        firstLineIndent:0,

        leftIndent:0,

        rightIndent:0,

        spacingBefore:0,

        spacingAfter:0

    },

    /* ======================================================
       PAGE LIMITS
    ====================================================== */

    limits:{

        minX:0,
        maxX:0,

        minY:0,
        maxY:0

    }

};

/* ==========================================================
   METRICS CACHE
========================================================== */

CampusWord2007Simulateur.LayoutEngine.cache={

    pageRect:null,

    contentRect:null,

    textLayerRect:null,

    caretLayerRect:null,

    paragraphRect:null,

    characterRect:null,

    workspaceRect:null,

    viewportRect:null,

    scrollRect:null

};

/* ==========================================================
   RUNTIME GEOMETRY
========================================================== */

CampusWord2007Simulateur.LayoutEngine.runtime={

    dirty:true,

    measuring:false,

    updating:false,

    version:1,

    lastUpdate:0

};

/* ==========================================================
   INTERNAL HELPERS
========================================================== */

CampusWord2007Simulateur.LayoutEngine.invalidate=function(){

    this.runtime.dirty=true;

};

CampusWord2007Simulateur.LayoutEngine.validate=function(){

    this.runtime.dirty=false;

    this.runtime.lastUpdate=

        performance.now();

};

CampusWord2007Simulateur.LayoutEngine.isDirty=function(){

    return this.runtime.dirty;

};

CampusWord2007Simulateur.LayoutEngine.getMetrics=function(){

    return this.metrics;

};

CampusWord2007Simulateur.LayoutEngine.getCache=function(){

    return this.cache;

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2B
   WRITABLE AREA CALCULATOR
========================================================== */

(function(){

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    if(!Layout){

        return;

    }

    /* ======================================================
       UPDATE WRITABLE AREA
    ====================================================== */

    Layout.updateWritableArea = function(){

        const Document =
            CampusWord2007Simulateur.DocumentEngine;

        if(
            !Document ||
            typeof Document.getActivePage !== "function"
        ){

            return false;

        }

        const page =
            Document.getActivePage();

        if(!page){

            return false;

        }

        const content =
            page.querySelector(
                ".page-content"
            );

        if(!content){

            return false;

        }

        const metrics =
            this.metrics;

        const config =
            CampusWord2007Simulateur.Configuration;

        /* ----------------------------------------------
           PAGE SIZE
        ---------------------------------------------- */

        metrics.page.width =
            content.clientWidth;

        metrics.page.height =
            content.clientHeight;

        /* ----------------------------------------------
           MARGINS
        ---------------------------------------------- */

        metrics.margins.left =
            config.pageMarginLeft;

        metrics.margins.top =
            config.pageMarginTop;

        metrics.margins.right =
            config.pageMarginRight;

        metrics.margins.bottom =
            config.pageMarginBottom;

        /* ----------------------------------------------
           WRITABLE TEXT AREA
        ---------------------------------------------- */

        metrics.textArea.left =
            metrics.margins.left;

        metrics.textArea.top =
            metrics.margins.top;

        metrics.textArea.width =
            metrics.page.width -
            metrics.margins.left -
            metrics.margins.right;

        metrics.textArea.height =
            metrics.page.height -
            metrics.margins.top -
            metrics.margins.bottom;

        metrics.textArea.right =
            metrics.textArea.left +
            metrics.textArea.width;

        metrics.textArea.bottom =
            metrics.textArea.top +
            metrics.textArea.height;

        /* ----------------------------------------------
           CONTENT
        ---------------------------------------------- */

        metrics.content.left =
            metrics.textArea.left;

        metrics.content.top =
            metrics.textArea.top;

        metrics.content.width =
            metrics.textArea.width;

        metrics.content.height =
            metrics.textArea.height;

        metrics.content.right =
            metrics.textArea.right;

        metrics.content.bottom =
            metrics.textArea.bottom;

        /* ----------------------------------------------
           LIMITS
        ---------------------------------------------- */

        metrics.limits.minX =
            metrics.textArea.left;

        metrics.limits.maxX =
            metrics.textArea.right;

        metrics.limits.minY =
            metrics.textArea.top;

        metrics.limits.maxY =
            metrics.textArea.bottom;

        /* ----------------------------------------------
           DEFAULT CARET POSITION
        ---------------------------------------------- */

        metrics.caret.x =
            metrics.textArea.left;

        metrics.caret.y =
            metrics.textArea.top;

        this.validate();

        return true;

    };

    /* ======================================================
       GET WRITABLE WIDTH
    ====================================================== */

    Layout.getWritableWidth = function(){

        return this.metrics
                   .textArea
                   .width;

    };

    /* ======================================================
       GET WRITABLE HEIGHT
    ====================================================== */

    Layout.getWritableHeight = function(){

        return this.metrics
                   .textArea
                   .height;

    };

    /* ======================================================
       GET WRITABLE RECT
    ====================================================== */

    Layout.getWritableRect = function(){

        return{

            left:
                this.metrics.textArea.left,

            top:
                this.metrics.textArea.top,

            right:
                this.metrics.textArea.right,

            bottom:
                this.metrics.textArea.bottom,

            width:
                this.metrics.textArea.width,

            height:
                this.metrics.textArea.height

        };

    };

    /* ======================================================
       IS INSIDE WRITABLE AREA
    ====================================================== */

    Layout.isInsideWritableArea = function(x,y){

        const area =
            this.metrics.textArea;

        return(

            x >= area.left &&

            x <= area.right &&

            y >= area.top &&

            y <= area.bottom

        );

    };

})();





/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2C
   COORDINATE SYSTEM API
   DOM GEOMETRY SCANNER
========================================================== */

(function(){

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    if(!Layout){

        return;

    }

    /* ======================================================
       REFRESH GEOMETRY CACHE
    ====================================================== */

    Layout.refreshGeometryCache = function(){

        const Document =
            CampusWord2007Simulateur.DocumentEngine;

        if(
            !Document ||
            typeof Document.getActivePage !== "function"
        ){

            return false;

        }

        const page =
            Document.getActivePage();

        if(!page){

            return false;

        }

        const cache =
            this.cache;

        cache.page =
            page;

        cache.pageRect =
            page.getBoundingClientRect();

        cache.content =
            page.querySelector(
                ".page-content"
            );

        cache.contentRect =
            cache.content
                ? cache.content.getBoundingClientRect()
                : null;

        cache.textLayer =
            page.querySelector(
                ".page-text-layer"
            );

        cache.textLayerRect =
            cache.textLayer
                ? cache.textLayer.getBoundingClientRect()
                : null;

        cache.caretLayer =
            page.querySelector(
                ".page-caret-layer"
            );

        cache.caretLayerRect =
            cache.caretLayer
                ? cache.caretLayer.getBoundingClientRect()
                : null;

        cache.selectionLayer =
            page.querySelector(
                ".page-selection-layer"
            );

        cache.selectionLayerRect =
            cache.selectionLayer
                ? cache.selectionLayer.getBoundingClientRect()
                : null;

        cache.objectLayer =
            page.querySelector(
                ".page-object-layer"
            );

        cache.objectLayerRect =
            cache.objectLayer
                ? cache.objectLayer.getBoundingClientRect()
                : null;

        cache.overlayLayer =
            page.querySelector(
                ".page-overlay-layer"
            );

        cache.overlayLayerRect =
            cache.overlayLayer
                ? cache.overlayLayer.getBoundingClientRect()
                : null;

        cache.workspace =
            CampusWord2007Simulateur
            .DOMEngine
            .get("workspace");

        cache.workspaceRect =
            cache.workspace
                ? cache.workspace.getBoundingClientRect()
                : null;

        cache.viewport =
            CampusWord2007Simulateur
            .DOMEngine
            .get("document-viewport");

        cache.viewportRect =
            cache.viewport
                ? cache.viewport.getBoundingClientRect()
                : null;

        cache.scrollArea =
            CampusWord2007Simulateur
            .DOMEngine
            .get("document-scroll-area");

        cache.scrollRect =
            cache.scrollArea
                ? cache.scrollArea.getBoundingClientRect()
                : null;

        this.validate();

        return true;

    };

    /* ======================================================
       GET PAGE RECT
    ====================================================== */

    Layout.getPageRect = function(){

        return this.cache.pageRect;

    };

    /* ======================================================
       GET CONTENT RECT
    ====================================================== */

    Layout.getContentRect = function(){

        return this.cache.contentRect;

    };

    /* ======================================================
       GET TEXT LAYER RECT
    ====================================================== */

    Layout.getTextLayerRect = function(){

        return this.cache.textLayerRect;

    };

    /* ======================================================
       GET CARET LAYER RECT
    ====================================================== */

    Layout.getCaretLayerRect = function(){

        return this.cache.caretLayerRect;

    };

    /* ======================================================
       GET WORKSPACE RECT
    ====================================================== */

    Layout.getWorkspaceRect = function(){

        return this.cache.workspaceRect;

    };

    /* ======================================================
       GET VIEWPORT RECT
    ====================================================== */

    Layout.getViewportRect = function(){

        return this.cache.viewportRect;

    };

    /* ======================================================
       GET SCROLL RECT
    ====================================================== */

    Layout.getScrollRect = function(){

        return this.cache.scrollRect;

    };

})();




/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2D
   PAGE BOUNDARY CALCULATOR
========================================================== */

(function(){

    const Layout =
        CampusWord2007Simulateur.LayoutEngine;

    if(!Layout){

        return;

    }

    /* ======================================================
       UPDATE PAGE BOUNDARIES
    ====================================================== */

    Layout.updatePageBoundaries = function(){

        if(

            !this.metrics ||

            !this.cache ||

            !this.cache.pageRect

        ){

            return false;

        }

        const metrics =
            this.metrics;

        const pageRect =
            this.cache.pageRect;

        /* ----------------------------------------------
           PAGE LIMITS (LOCAL COORDINATES)
        ---------------------------------------------- */

        metrics.page.left = 0;

        metrics.page.top = 0;

        metrics.page.right =
            pageRect.width;

        metrics.page.bottom =
            pageRect.height;

        metrics.page.width =
            pageRect.width;

        metrics.page.height =
            pageRect.height;

        /* ----------------------------------------------
           PAGE BOUNDARIES
        ---------------------------------------------- */

        metrics.boundaries.minX =
            metrics.page.left;

        metrics.boundaries.maxX =
            metrics.page.right;

        metrics.boundaries.minY =
            metrics.page.top;

        metrics.boundaries.maxY =
            metrics.page.bottom;

        this.validate();

        return true;

    };

    /* ======================================================
       GET PAGE BOUNDARIES
    ====================================================== */

    Layout.getPageBoundaries = function(){

        return{

            minX:
                this.metrics.boundaries.minX,

            maxX:
                this.metrics.boundaries.maxX,

            minY:
                this.metrics.boundaries.minY,

            maxY:
                this.metrics.boundaries.maxY

        };

    };

    /* ======================================================
       GET PAGE SIZE
    ====================================================== */

    Layout.getPageSize = function(){

        return{

            width:
                this.metrics.page.width,

            height:
                this.metrics.page.height

        };

    };

    /* ======================================================
       INSIDE PAGE ?
    ====================================================== */

    Layout.isInsidePage = function(x,y){

        const boundary =
            this.metrics.boundaries;

        return(

            x >= boundary.minX &&

            x <= boundary.maxX &&

            y >= boundary.minY &&

            y <= boundary.maxY

        );

    };

})();





/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2E
   BASELINE & LINE METRICS
   ----------------------------------------------------------
   RESPONSIBILITY
   • Compute font metrics
   • Compute baseline
   • Compute line metrics
   • Compute character box metrics
   • NO caret calculation
   • NO text positioning
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.LineMetrics = {

    initialized: false,

    metrics: {

        fontFamily: "",

        fontSize: 0,

        lineHeight: 0,

        baseline: 0,

        ascent: 0,

        descent: 0,

        capHeight: 0,

        xHeight: 0,

        characterWidth: 0,

        spaceWidth: 0

    },

    measurementElement: null,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.createMeasurementElement();

        this.initialized = true;

        return true;

    },

    createMeasurementElement() {

        if (this.measurementElement) {
            return;
        }

        const element = document.createElement("span");

        element.textContent = "Hg";

        element.style.position = "absolute";
        element.style.visibility = "hidden";
        element.style.pointerEvents = "none";
        element.style.whiteSpace = "pre";
        element.style.left = "-100000px";
        element.style.top = "-100000px";
        element.style.padding = "0";
        element.style.margin = "0";
        element.style.border = "0";

        document.body.appendChild(element);

        this.measurementElement = element;

    },

    measure(fontFamily, fontSize, lineHeight) {

        if (!this.measurementElement) {
            return null;
        }

        const element = this.measurementElement;

        element.style.fontFamily = fontFamily;
        element.style.fontSize = fontSize + "px";
        element.style.lineHeight = lineHeight + "px";

        const rect = element.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        this.metrics.fontFamily = fontFamily;
        this.metrics.fontSize = fontSize;
        this.metrics.lineHeight = lineHeight;

        /*
            Browser pa bay ascent/descent dirèk.
            Nou itilize estimasyon tipografik estanda.
        */

        this.metrics.ascent = Math.round(fontSize * 0.80);

        this.metrics.descent =
            Math.max(
                0,
                lineHeight - this.metrics.ascent
            );

        this.metrics.baseline =
            this.metrics.ascent;

        this.metrics.capHeight =
            Math.round(fontSize * 0.70);

        this.metrics.xHeight =
            Math.round(fontSize * 0.52);

        this.metrics.characterWidth =
            width / 2;

        element.textContent = " ";

        this.metrics.spaceWidth =
            element.getBoundingClientRect().width;

        element.textContent = "Hg";

        return this.getMetrics();

    },

    getMetrics() {

        return {

            fontFamily:
                this.metrics.fontFamily,

            fontSize:
                this.metrics.fontSize,

            lineHeight:
                this.metrics.lineHeight,

            baseline:
                this.metrics.baseline,

            ascent:
                this.metrics.ascent,

            descent:
                this.metrics.descent,

            capHeight:
                this.metrics.capHeight,

            xHeight:
                this.metrics.xHeight,

            characterWidth:
                this.metrics.characterWidth,

            spaceWidth:
                this.metrics.spaceWidth

        };

    },

    getBaseline() {

        return this.metrics.baseline;

    },

    getAscent() {

        return this.metrics.ascent;

    },

    getDescent() {

        return this.metrics.descent;

    },

    getLineHeight() {

        return this.metrics.lineHeight;

    },

    getCharacterWidth() {

        return this.metrics.characterWidth;

    },

    getSpaceWidth() {

        return this.metrics.spaceWidth;

    },

    destroy() {

        if (
            this.measurementElement &&
            this.measurementElement.parentNode
        ) {

            this.measurementElement.parentNode.removeChild(
                this.measurementElement
            );

        }

        this.measurementElement = null;

        this.initialized = false;

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.2F
   DEFAULT INSERTION POINT
   ----------------------------------------------------------
   RESPONSIBILITY
   • Calculate default insertion point
   • First typing position
   • Paragraph origin
   • NO caret movement
   • NO text rendering
   • NO paragraph creation
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.InsertionPoint = {

    initialized: false,

    point: {

        x: 0,

        y: 0

    },

    initialize() {

        if (this.initialized) {

            return true;

        }

        this.initialized = true;

        return true;

    },

    calculate(page) {

        if (!page) {

            return null;

        }

        const Geometry =
            CampusWord2007Simulateur
            .LayoutEngine
            .Geometry;

        const WritableArea =
            CampusWord2007Simulateur
            .LayoutEngine
            .WritableArea;

        const LineMetrics =
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics;

        if (
            !Geometry ||
            !WritableArea ||
            !LineMetrics
        ) {

            return null;

        }

        Geometry.measure(page);

        WritableArea.calculate(page);

        const writable =
            WritableArea.get();

        const metrics =
            LineMetrics.getMetrics();

        this.point.x =
            Math.round(
                writable.left
            );

        this.point.y =
            Math.round(
                writable.top +
                metrics.baseline
            );

        return this.get();

    },

    get() {

        return {

            x: this.point.x,

            y: this.point.y

        };

    },

    getX() {

        return this.point.x;

    },

    getY() {

        return this.point.y;

    },

    reset() {

        this.point.x = 0;

        this.point.y = 0;

    },

    destroy() {

        this.reset();

        this.initialized = false;

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.3A
   VIEWPORT FOUNDATION
   ----------------------------------------------------------
   RESPONSIBILITY
   • Viewport object
   • Cached viewport metrics
   • Initialization
   • Public API
   • NO calculation
   • NO resize handling
   • NO zoom handling
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.Viewport = {

    initialized: false,

    metrics: {

        width: 0,

        height: 0,

        clientWidth: 0,

        clientHeight: 0,

        scrollWidth: 0,

        scrollHeight: 0,

        scrollLeft: 0,

        scrollTop: 0,

        devicePixelRatio: 1,

        orientation: "portrait",

        visualViewport: null

    },

    root: null,

    initialize() {

        if (this.initialized) {

            return true;

        }

        this.root =
            document.documentElement;

        this.metrics.devicePixelRatio =
            window.devicePixelRatio || 1;

        if (window.visualViewport) {

            this.metrics.visualViewport =
                window.visualViewport;

        }

        this.initialized = true;

        return true;

    },

    setMetrics(data) {

        if (!data) {

            return;

        }

        Object.assign(
            this.metrics,
            data
        );

    },

    getMetrics() {

        return {

            width:
                this.metrics.width,

            height:
                this.metrics.height,

            clientWidth:
                this.metrics.clientWidth,

            clientHeight:
                this.metrics.clientHeight,

            scrollWidth:
                this.metrics.scrollWidth,

            scrollHeight:
                this.metrics.scrollHeight,

            scrollLeft:
                this.metrics.scrollLeft,

            scrollTop:
                this.metrics.scrollTop,

            devicePixelRatio:
                this.metrics.devicePixelRatio,

            orientation:
                this.metrics.orientation,

            visualViewport:
                this.metrics.visualViewport

        };

    },

    getWidth() {

        return this.metrics.width;

    },

    getHeight() {

        return this.metrics.height;

    },

    getClientWidth() {

        return this.metrics.clientWidth;

    },

    getClientHeight() {

        return this.metrics.clientHeight;

    },

    getScrollWidth() {

        return this.metrics.scrollWidth;

    },

    getScrollHeight() {

        return this.metrics.scrollHeight;

    },

    getScrollLeft() {

        return this.metrics.scrollLeft;

    },

    getScrollTop() {

        return this.metrics.scrollTop;

    },

    getDevicePixelRatio() {

        return this.metrics.devicePixelRatio;

    },

    getOrientation() {

        return this.metrics.orientation;

    },

    getVisualViewport() {

        return this.metrics.visualViewport;

    },

    destroy() {

        this.root = null;

        this.metrics.width = 0;
        this.metrics.height = 0;
        this.metrics.clientWidth = 0;
        this.metrics.clientHeight = 0;
        this.metrics.scrollWidth = 0;
        this.metrics.scrollHeight = 0;
        this.metrics.scrollLeft = 0;
        this.metrics.scrollTop = 0;
        this.metrics.devicePixelRatio = 1;
        this.metrics.orientation = "portrait";
        this.metrics.visualViewport = null;

        this.initialized = false;

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 1.3B
   VIEWPORT METRICS COLLECTOR
   ----------------------------------------------------------
   RESPONSIBILITY
   • Measure viewport metrics
   • Populate Viewport cache
   • NO resize observer
   • NO layout calculation
   • NO page calculation
   • NO caret calculation
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.Viewport.refresh = function () {

    if (!this.initialized) {

        return false;

    }

    const root = document.documentElement;

    const body = document.body;

    const visual = window.visualViewport;

    this.metrics.width =
        window.innerWidth;

    this.metrics.height =
        window.innerHeight;

    this.metrics.clientWidth =
        root.clientWidth;

    this.metrics.clientHeight =
        root.clientHeight;

    this.metrics.scrollWidth =
        Math.max(

            root.scrollWidth,

            body ? body.scrollWidth : 0

        );

    this.metrics.scrollHeight =
        Math.max(

            root.scrollHeight,

            body ? body.scrollHeight : 0

        );

    this.metrics.scrollLeft =
        window.pageXOffset ||
        root.scrollLeft ||
        0;

    this.metrics.scrollTop =
        window.pageYOffset ||
        root.scrollTop ||
        0;

    this.metrics.devicePixelRatio =
        window.devicePixelRatio || 1;

    this.metrics.orientation =

        this.metrics.width >=
        this.metrics.height

        ? "landscape"

        : "portrait";

    if (visual) {

        this.metrics.visualViewport =
            visual;

        this.metrics.scale =
            visual.scale;

        this.metrics.offsetLeft =
            visual.offsetLeft;

        this.metrics.offsetTop =
            visual.offsetTop;

    }

    else {

        this.metrics.visualViewport =
            null;

        this.metrics.scale = 1;

        this.metrics.offsetLeft = 0;

        this.metrics.offsetTop = 0;

    }

    return this.getMetrics();

};











/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.1
   CURSOR LAYOUT API
   ----------------------------------------------------------
   RESPONSIBILITY
   • Single source of truth for caret position
   • Store current caret coordinates
   • Store next caret coordinates
   • Public API only
   • NO calculation
   • NO DOM manipulation
   • NO caret movement
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.Cursor = {

    initialized: false,

    current: {

        page: null,

        paragraph: null,

        line: null,

        x: 0,

        y: 0

    },

    next: {

        page: null,

        paragraph: null,

        line: null,

        x: 0,

        y: 0

    },

    initialize() {

        if (this.initialized) {

            return true;

        }

        this.initialized = true;

        return true;

    },

    setCurrent(position) {

        if (!position) {

            return false;

        }

        Object.assign(
            this.current,
            position
        );

        return true;

    },

    setNext(position) {

        if (!position) {

            return false;

        }

        Object.assign(
            this.next,
            position
        );

        return true;

    },

    getCurrent() {

        return {

            page: this.current.page,

            paragraph: this.current.paragraph,

            line: this.current.line,

            x: this.current.x,

            y: this.current.y

        };

    },

    getNext() {

        return {

            page: this.next.page,

            paragraph: this.next.paragraph,

            line: this.next.line,

            x: this.next.x,

            y: this.next.y

        };

    },

    getCurrentX() {

        return this.current.x;

    },

    getCurrentY() {

        return this.current.y;

    },

    getNextX() {

        return this.next.x;

    },

    getNextY() {

        return this.next.y;

    },

    reset() {

        this.current.page = null;
        this.current.paragraph = null;
        this.current.line = null;
        this.current.x = 0;
        this.current.y = 0;

        this.next.page = null;
        this.next.paragraph = null;
        this.next.line = null;
        this.next.x = 0;
        this.next.y = 0;

    },

    destroy() {

        this.reset();

        this.initialized = false;

    }

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.2
   CHARACTER MEASUREMENT
   ----------------------------------------------------------
   RESPONSIBILITY
   • Measure every character
   • Measure space
   • Measure tab
   • Measure current font
   • Cache measurements
   • NO text rendering
   • NO caret movement
   • NO paragraph calculation
   • NO DOM layout calculation
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.CharacterMeasurement = {

    initialized: false,

    canvas: null,

    context: null,

    currentFont: {

        family: "Calibri",

        size: 16,

        weight: "normal",

        style: "normal"

    },

    cache: Object.create(null),

    initialize() {

        if (this.initialized) {

            return true;

        }

        this.canvas = document.createElement("canvas");

        this.context = this.canvas.getContext("2d");

        if (!this.context) {

            return false;

        }

        this.updateFont();

        this.initialized = true;

        return true;

    },

    updateFont(font = {}) {

        if (font.family) {

            this.currentFont.family = font.family;

        }

        if (font.size) {

            this.currentFont.size = font.size;

        }

        if (font.weight) {

            this.currentFont.weight = font.weight;

        }

        if (font.style) {

            this.currentFont.style = font.style;

        }

        this.context.font =

            this.currentFont.style + " " +

            this.currentFont.weight + " " +

            this.currentFont.size + "px " +

            this.currentFont.family;

    },

    clearCache() {

        this.cache = Object.create(null);

    },

    measure(character) {

        if (

            typeof character !== "string" ||

            character.length !== 1

        ) {

            return 0;

        }

        const key =

            this.context.font +

            "::" +

            character;

        if (

            this.cache[key] !== undefined

        ) {

            return this.cache[key];

        }

        const width =

            this.context.measureText(

                character

            ).width;

        this.cache[key] = width;

        return width;

    },

    measureSpace() {

        return this.measure(" ");

    },

    measureTab(tabSize = 4) {

        return (

            this.measureSpace() *

            tabSize

        );

    },

    getCurrentFont() {

        return {

            family:

                this.currentFont.family,

            size:

                this.currentFont.size,

            weight:

                this.currentFont.weight,

            style:

                this.currentFont.style

        };

    },

    getCharacterWidth(character) {

        return this.measure(character);

    },

    destroy() {

        this.canvas = null;

        this.context = null;

        this.clearCache();

        this.initialized = false;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.3
   LINE LAYOUT MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Decide line start
   • Decide line end
   • Detect word wrap
   • Compute line baseline
   • NO DOM rendering
   • NO caret movement
   • NO paragraph creation
   • NO page creation
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.LineLayout = {

    initialized: false,

    line: {

        index: 0,

        startX: 0,

        endX: 0,

        width: 0,

        availableWidth: 0,

        baseline: 0,

        characterCount: 0,

        wrapped: false

    },

    initialize() {

        if (this.initialized) {

            return true;

        }

        this.initialized = true;

        return true;

    },

    begin(availableWidth) {

        const InsertionPoint =
            CampusWord2007Simulateur
            .LayoutEngine
            .InsertionPoint;

        const Metrics =
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics;

        const point =
            InsertionPoint.get();

        this.line.startX = point.x;
        this.line.endX = point.x;

        this.line.width = 0;

        this.line.availableWidth =
            availableWidth;

        this.line.baseline =
            Metrics.getBaseline();

        this.line.characterCount = 0;

        this.line.wrapped = false;

        return this.getLine();

    },

    canFit(characterWidth) {

        return (

            this.line.width +

            characterWidth <=

            this.line.availableWidth

        );

    },

    append(characterWidth) {

        this.line.width +=

            characterWidth;

        this.line.endX =

            this.line.startX +

            this.line.width;

        this.line.characterCount++;

    },

    wrap() {

        this.line.wrapped = true;

    },

    nextLine(availableWidth) {

        this.line.index++;

        this.begin(

            availableWidth

        );

    },

    getLine() {

        return {

            index:
                this.line.index,

            startX:
                this.line.startX,

            endX:
                this.line.endX,

            width:
                this.line.width,

            availableWidth:
                this.line.availableWidth,

            baseline:
                this.line.baseline,

            characterCount:
                this.line.characterCount,

            wrapped:
                this.line.wrapped

        };

    },

    getStartX() {

        return this.line.startX;

    },

    getEndX() {

        return this.line.endX;

    },

    getBaseline() {

        return this.line.baseline;

    },

    getWidth() {

        return this.line.width;

    },

    isWrapped() {

        return this.line.wrapped;

    },

    reset() {

        this.line.index = 0;

        this.line.startX = 0;

        this.line.endX = 0;

        this.line.width = 0;

        this.line.availableWidth = 0;

        this.line.baseline = 0;

        this.line.characterCount = 0;

        this.line.wrapped = false;

    },

    destroy() {

        this.reset();

        this.initialized = false;

    }

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.4
   PARAGRAPH FLOW MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Compute paragraph flow
   • Paragraph spacing
   • First line indent
   • Left / Right indent
   • Paragraph start position
   • Paragraph next position

   DOES NOT

   • create paragraph
   • move caret
   • render text
   • create pages
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.ParagraphFlow = {

    initialized: false,

    defaults: {

        spaceBefore: 0,

        spaceAfter: 0,

        firstLineIndent: 0,

        leftIndent: 0,

        rightIndent: 0

    },

    current: {

        x: 0,

        y: 0,

        width: 0,

        height: 0,

        baseline: 0

    },

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    compute(options = {}) {

        const writableArea =
            CampusWord2007Simulateur
            .LayoutEngine
            .WritableArea
            .get();

        const metrics =
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics
            .getMetrics();

        const config = {

            spaceBefore:
                options.spaceBefore ??
                this.defaults.spaceBefore,

            spaceAfter:
                options.spaceAfter ??
                this.defaults.spaceAfter,

            firstLineIndent:
                options.firstLineIndent ??
                this.defaults.firstLineIndent,

            leftIndent:
                options.leftIndent ??
                this.defaults.leftIndent,

            rightIndent:
                options.rightIndent ??
                this.defaults.rightIndent

        };

        this.current.x =
            Math.round(
                writableArea.left +
                config.leftIndent +
                config.firstLineIndent
            );

        this.current.y =
            Math.round(
                writableArea.top +
                config.spaceBefore
            );

        this.current.width =
            Math.max(
                0,
                writableArea.width -
                config.leftIndent -
                config.rightIndent
            );

        this.current.height =
            metrics.lineHeight;

        this.current.baseline =
            metrics.baseline;

        return this.getCurrent();

    },

    getCurrent() {

        return {

            x: this.current.x,

            y: this.current.y,

            width: this.current.width,

            height: this.current.height,

            baseline: this.current.baseline

        };

    },

    getNextParagraphPosition() {

        return {

            x: this.current.x,

            y:
                this.current.y +
                this.current.height +
                this.defaults.spaceAfter

        };

    },

    setDefaults(options = {}) {

        if (typeof options.spaceBefore === "number") {

            this.defaults.spaceBefore =
                options.spaceBefore;

        }

        if (typeof options.spaceAfter === "number") {

            this.defaults.spaceAfter =
                options.spaceAfter;

        }

        if (typeof options.firstLineIndent === "number") {

            this.defaults.firstLineIndent =
                options.firstLineIndent;

        }

        if (typeof options.leftIndent === "number") {

            this.defaults.leftIndent =
                options.leftIndent;

        }

        if (typeof options.rightIndent === "number") {

            this.defaults.rightIndent =
                options.rightIndent;

        }

    },

    reset() {

        this.current.x = 0;
        this.current.y = 0;
        this.current.width = 0;
        this.current.height = 0;
        this.current.baseline = 0;

    },

    destroy() {

        this.reset();

        this.initialized = false;

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.5
   PAGE FLOW MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Decide page overflow
   • Decide when next page is required
   • Create page automatically when necessary
   • Return destination page only
   ----------------------------------------------------------
   DOES NOT
   ✘ Move caret
   ✘ Render text
   ✘ Create paragraph
   ✘ Calculate character position
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.PageFlow = {

    initialized:false,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized=true;

        return true;

    },

    getDestination(currentPage,nextParagraphHeight){

        if(!currentPage){
            return null;
        }

        const Limits=
            CampusWord2007Simulateur
            .LayoutEngine
            .PageLimits;

        if(
            !Limits ||
            typeof Limits.calculate!=="function"
        ){
            return currentPage;
        }

        Limits.calculate(currentPage);

        const pageLimits=
            Limits.get();

        const textLayer=
            currentPage.querySelector(
                ".page-text-layer"
            );

        if(!textLayer){
            return currentPage;
        }

        const usedHeight=
            textLayer.scrollHeight;

        const availableHeight=
            pageLimits.writableHeight;

        if(
            usedHeight+
            nextParagraphHeight
            <=
            availableHeight
        ){
            return currentPage;
        }

        const Document=
            CampusWord2007Simulateur
            .DocumentEngine;

        const PageFactory=
            CampusWord2007Simulateur
            .PageFactory;

        const pages=
            Document.getPages();

        const index=
            pages.indexOf(currentPage);

        if(
            index>=0 &&
            index<pages.length-1
        ){
            return pages[index+1];
        }

        return PageFactory.createPage();

    },

    pageRequired(currentPage,nextParagraphHeight){

        const page=
            this.getDestination(
                currentPage,
                nextParagraphHeight
            );

        return(
            page &&
            page!==currentPage
        );

    },

    destroy(){

        this.initialized=false;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6A
   CARET POSITION OBJECT
   ----------------------------------------------------------
   RESPONSIBILITY
   • Standard caret position object
   • Store layout position
   • Public API
   • Shared by all layout modules
   ----------------------------------------------------------
   DOES NOT
   ✘ Calculate coordinates
   ✘ Move caret
   ✘ Read DOM
   ✘ Modify DOM
   ✘ Create pages
   ✘ Create paragraphs
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.CaretPosition = {

    initialized:false,

    position:null,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.reset();

        this.initialized=true;

        return true;

    },

    create(){

        return{

            page:null,

            pageIndex:-1,

            paragraph:null,

            paragraphIndex:-1,

            line:null,

            lineIndex:-1,

            character:null,

            characterIndex:-1,

            x:0,

            y:0,

            baseline:0,

            height:0,

            valid:false

        };

    },

    reset(){

        this.position=this.create();

        return this.position;

    },

    set(data={}){

        if(!this.position){
            this.position=this.create();
        }

        Object.assign(
            this.position,
            data
        );

        this.position.valid=true;

        return this.position;

    },

    get(){

        if(!this.position){
            this.reset();
        }

        return{

            page:this.position.page,

            pageIndex:this.position.pageIndex,

            paragraph:this.position.paragraph,

            paragraphIndex:this.position.paragraphIndex,

            line:this.position.line,

            lineIndex:this.position.lineIndex,

            character:this.position.character,

            characterIndex:this.position.characterIndex,

            x:this.position.x,

            y:this.position.y,

            baseline:this.position.baseline,

            height:this.position.height,

            valid:this.position.valid

        };

    },

    invalidate(){

        if(!this.position){
            return;
        }

        this.position.valid=false;

    },

    isValid(){

        return(
            this.position &&
            this.position.valid===true
        );

    },

    destroy(){

        this.position=null;

        this.initialized=false;

    }

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6B
   CHARACTER POSITION RESOLVER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Resolve caret position after a character
   • Resolve caret position before a character
   • Return CaretPosition object only
   ----------------------------------------------------------
   DOES NOT
   ✘ Move caret
   ✘ Modify DOM
   ✘ Create paragraph
   ✘ Create page
   ✘ Render text
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.CharacterPositionResolver = {

    initialized:false,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized=true;

        return true;

    },

    afterCharacter(character){

        return this.resolve(
            character,
            "after"
        );

    },

    beforeCharacter(character){

        return this.resolve(
            character,
            "before"
        );

    },

    resolve(character,mode="after"){

        if(
            !character ||
            !character.isConnected
        ){
            return null;
        }

        const page=
            character.closest(
                ".document-page"
            );

        if(!page){
            return null;
        }

        const paragraph=
            character.parentElement;

        if(!paragraph){
            return null;
        }

        const layer=
            page.querySelector(
                ".page-caret-layer"
            );

        if(!layer){
            return null;
        }

        const pageRect=
            page.getBoundingClientRect();

        const layerRect=
            layer.getBoundingClientRect();

        const rect=
            character.getBoundingClientRect();

        const LineMetrics=
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics;

        const metrics=
            LineMetrics.getMetrics();

        const Position=
            CampusWord2007Simulateur
            .LayoutEngine
            .CaretPosition;

        const pageIndex=
            Number(
                page.dataset.pageNumber || 1
            )-1;

        const paragraphIndex=
            Array.prototype.indexOf.call(
                paragraph.parentNode.children,
                paragraph
            );

        const characterIndex=
            Array.prototype.indexOf.call(
                paragraph.children,
                character
            );

        const x=

            mode==="before"

            ?

            Math.round(
                rect.left-
                layerRect.left
            )

            :

            Math.round(
                rect.right-
                layerRect.left
            );

        const y=

            Math.round(
                rect.top-
                layerRect.top
            );

        Position.set({

            page:page,

            pageIndex:pageIndex,

            paragraph:paragraph,

            paragraphIndex:paragraphIndex,

            line:paragraph,

            lineIndex:0,

            character:character,

            characterIndex:characterIndex,

            x:x,

            y:y,

            baseline:
                y+
                metrics.baseline,

            height:
                rect.height

        });

        return Position.get();

    },

    destroy(){

        this.initialized=false;

    }

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6C
   EMPTY LINE RESOLVER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Resolve caret position on empty line
   • Resolve first insertion point of paragraph
   • Resolve empty paragraph position
   • Return CaretPosition only
   ----------------------------------------------------------
   DOES NOT
   ✘ Move caret
   ✘ Modify DOM
   ✘ Create paragraph
   ✘ Create page
   ✘ Render text
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.EmptyLineResolver = {

    initialized:false,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized=true;

        return true;

    },

    resolve(paragraph){

        if(!paragraph){
            return null;
        }

        const page=
            paragraph.closest(
                ".document-page"
            );

        if(!page){
            return null;
        }

        const Position=
            CampusWord2007Simulateur
            .LayoutEngine
            .CaretPosition;

        const Insertion=
            CampusWord2007Simulateur
            .LayoutEngine
            .InsertionPoint;

        const LineMetrics=
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics;

        Insertion.calculate(page);

        const point=
            Insertion.get();

        const metrics=
            LineMetrics.getMetrics();

        const paragraphIndex=
            Array.prototype.indexOf.call(
                paragraph.parentNode.children,
                paragraph
            );

        const pageIndex=
            Number(
                page.dataset.pageNumber || 1
            )-1;

        Position.set({

            page:page,

            pageIndex:pageIndex,

            paragraph:paragraph,

            paragraphIndex:paragraphIndex,

            line:paragraph,

            lineIndex:0,

            character:null,

            characterIndex:-1,

            x:Math.round(point.x),

            y:Math.round(point.y),

            baseline:Math.round(point.y),

            height:metrics.lineHeight

        });

        return Position.get();

    },

    resolveFromPage(page){

        if(!page){
            return null;
        }

        const layer=
            page.querySelector(
                ".page-text-layer"
            );

        if(!layer){
            return null;
        }

        let paragraph=
            layer.lastElementChild;

        if(
            !paragraph ||
            !paragraph.classList ||
            !paragraph.classList.contains(
                "text-paragraph"
            )
        ){

            paragraph=
                document.createElement("div");

            paragraph.className=
                "text-paragraph";

            layer.appendChild(
                paragraph
            );

        }

        return this.resolve(
            paragraph
        );

    },

    destroy(){

        this.initialized=false;

    }

};









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6D
   ENTER RESOLVER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Resolve caret position after Enter
   • Resolve next paragraph insertion point
   • Resolve next line insertion point
   • Return CaretPosition only
   ----------------------------------------------------------
   DOES NOT
   ✘ Move caret
   ✘ Create paragraph
   ✘ Create page
   ✘ Modify DOM
   ✘ Render text
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.EnterResolver = {

    initialized:false,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized=true;

        return true;

    },

    resolve(paragraph){

        if(!paragraph){
            return null;
        }

        const Position =
            CampusWord2007Simulateur
            .LayoutEngine
            .CaretPosition;

        const EmptyResolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .EmptyLineResolver;

        const ParagraphFlow =
            CampusWord2007Simulateur
            .LayoutEngine
            .ParagraphFlowManager;

        const LineMetrics =
            CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics;

        const metrics =
            LineMetrics.getMetrics();

        let paragraphSpacing = 0;

        if(
            ParagraphFlow &&
            typeof ParagraphFlow.getParagraphSpacing==="function"
        ){
            paragraphSpacing =
                ParagraphFlow.getParagraphSpacing();
        }

        const base =
            EmptyResolver.resolve(
                paragraph
            );

        if(!base){
            return null;
        }

        Position.set({

            page:base.page,

            pageIndex:base.pageIndex,

            paragraph:base.paragraph,

            paragraphIndex:
                base.paragraphIndex + 1,

            line:null,

            lineIndex:0,

            character:null,

            characterIndex:-1,

            x:base.x,

            y:
                Math.round(
                    base.y +
                    metrics.lineHeight +
                    paragraphSpacing
                ),

            baseline:
                Math.round(
                    base.baseline +
                    metrics.lineHeight +
                    paragraphSpacing
                ),

            height:metrics.lineHeight

        });

        return Position.get();

    },

    destroy(){

        this.initialized=false;

    }

};










/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6E
   NEW PAGE RESOLVER
   ----------------------------------------------------------
   RESPONSIBILITY
   • Resolve caret position on a newly created page
   • Compute first insertion position of the page
   • NO page creation
   • NO DOM modification
   • NO caret movement
   • NO rendering
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.NewPageResolver = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    resolve(page) {

        if (!page) {
            return null;
        }

        const InsertionPoint =
            CampusWord2007Simulateur
            .LayoutEngine
            .InsertionPoint;

        const CaretPosition =
            CampusWord2007Simulateur
            .LayoutEngine
            .CaretPosition;

        if (
            !InsertionPoint ||
            !CaretPosition
        ) {
            return null;
        }

        const point =
            InsertionPoint.calculate(page);

        if (!point) {
            return null;
        }

        CaretPosition.set({

            page: page,

            paragraph: null,

            character: null,

            line: 0,

            column: 0,

            x: point.x,

            y: point.y,

            baseline: point.y,

            placement: "new-page"

        });

        return CaretPosition.get();

    },

    destroy() {

        this.initialized = false;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.6F
   PUBLIC CARET PLACEMENT API
   ----------------------------------------------------------
   RESPONSIBILITY
   • Single public API for caret placement
   • Delegate to specialized resolvers
   • NO geometry calculation
   • NO DOM measurement
   • NO caret rendering
   • NO text insertion
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.CaretPlacement = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    /* ======================================================
       AFTER CHARACTER
    ====================================================== */

    afterCharacter(character) {

        const Resolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .CharacterPositionResolver;

        if (
            !Resolver ||
            typeof Resolver.afterCharacter !== "function"
        ) {

            return null;

        }

        return Resolver.afterCharacter(character);

    },

    /* ======================================================
       BEFORE CHARACTER
    ====================================================== */

    beforeCharacter(character) {

        const Resolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .CharacterPositionResolver;

        if (
            !Resolver ||
            typeof Resolver.beforeCharacter !== "function"
        ) {

            return null;

        }

        return Resolver.beforeCharacter(character);

    },

    /* ======================================================
       EMPTY LINE
    ====================================================== */

    emptyLine(paragraph) {

        const Resolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .EmptyLineResolver;

        if (
            !Resolver ||
            typeof Resolver.resolve !== "function"
        ) {

            return null;

        }

        return Resolver.resolve(paragraph);

    },

    /* ======================================================
       AFTER ENTER
    ====================================================== */

    afterEnter(paragraph) {

        const Resolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .EnterResolver;

        if (
            !Resolver ||
            typeof Resolver.resolve !== "function"
        ) {

            return null;

        }

        return Resolver.resolve(paragraph);

    },

    /* ======================================================
       NEW PAGE
    ====================================================== */

    newPage(page) {

        const Resolver =
            CampusWord2007Simulateur
            .LayoutEngine
            .NewPageResolver;

        if (
            !Resolver ||
            typeof Resolver.resolve !== "function"
        ) {

            return null;

        }

        return Resolver.resolve(page);

    },

    /* ======================================================
       CURRENT CARET
    ====================================================== */

    current() {

        const Cursor =
            CampusWord2007Simulateur
            .LayoutEngine
            .Cursor;

        if (
            !Cursor ||
            typeof Cursor.get !== "function"
        ) {

            return null;

        }

        return Cursor.get();

    },

    /* ======================================================
       UPDATE CURRENT CARET
    ====================================================== */

    update(position) {

        const Cursor =
            CampusWord2007Simulateur
            .LayoutEngine
            .Cursor;

        if (
            !Cursor ||
            typeof Cursor.set !== "function"
        ) {

            return false;

        }

        Cursor.set(position);

        return true;

    },

    /* ======================================================
       RESET
    ====================================================== */

    reset() {

        const Cursor =
            CampusWord2007Simulateur
            .LayoutEngine
            .Cursor;

        if (
            Cursor &&
            typeof Cursor.reset === "function"
        ) {

            Cursor.reset();

        }

    },

    /* ======================================================
       DESTROY
    ====================================================== */

    destroy() {

        this.reset();

        this.initialized = false;

    }

};






/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   LAYOUT ENGINE
   PHASE 2.7
   PUBLIC LAYOUT API
   ----------------------------------------------------------
   RESPONSIBILITY
   • Public entry point of LayoutEngine
   • Delegate to specialized modules
   • NO calculations
   • NO rendering
   • NO DOM modification
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine.API = {

    initialized:false,

    initialize(){

        if(this.initialized){
            return true;
        }

        this.initialized=true;

        return true;

    },

    /* ======================================================
       VIEWPORT
    ====================================================== */

    getViewport(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .Viewport
            .get();

    },

    /* ======================================================
       PAGE GEOMETRY
    ====================================================== */

    measurePage(page){

        return CampusWord2007Simulateur
            .LayoutEngine
            .Geometry
            .measure(page);

    },

    /* ======================================================
       WRITABLE AREA
    ====================================================== */

    getWritableArea(page){

        CampusWord2007Simulateur
        .LayoutEngine
        .WritableArea
        .calculate(page);

        return CampusWord2007Simulateur
            .LayoutEngine
            .WritableArea
            .get();

    },

    /* ======================================================
       LINE METRICS
    ====================================================== */

    getLineMetrics(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .LineMetrics
            .getMetrics();

    },

    /* ======================================================
       DEFAULT INSERTION POINT
    ====================================================== */

    getInsertionPoint(page){

        return CampusWord2007Simulateur
            .LayoutEngine
            .InsertionPoint
            .calculate(page);

    },

    /* ======================================================
       CHARACTER MEASUREMENT
    ====================================================== */

    measureCharacter(character){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CharacterMeasurement
            .measure(character);

    },

    /* ======================================================
       CARET AFTER CHARACTER
    ====================================================== */

    afterCharacter(character){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CaretPlacement
            .afterCharacter(character);

    },

    /* ======================================================
       CARET BEFORE CHARACTER
    ====================================================== */

    beforeCharacter(character){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CaretPlacement
            .beforeCharacter(character);

    },

    /* ======================================================
       EMPTY LINE
    ====================================================== */

    emptyLine(paragraph){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CaretPlacement
            .emptyLine(paragraph);

    },

    /* ======================================================
       AFTER ENTER
    ====================================================== */

    afterEnter(paragraph){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CaretPlacement
            .afterEnter(paragraph);

    },

    /* ======================================================
       NEW PAGE
    ====================================================== */

    newPage(page){

        return CampusWord2007Simulateur
            .LayoutEngine
            .CaretPlacement
            .newPage(page);

    },

    /* ======================================================
       CURRENT CURSOR
    ====================================================== */

    getCursor(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .Cursor
            .get();

    },

    setCursor(position){

        return CampusWord2007Simulateur
            .LayoutEngine
            .Cursor
            .set(position);

    },

    /* ======================================================
       PAGE FLOW
    ====================================================== */

    shouldCreatePage(page, paragraph){

        return CampusWord2007Simulateur
            .LayoutEngine
            .PageFlowManager
            .shouldCreatePage(
                page,
                paragraph
            );

    },

    /* ======================================================
       PARAGRAPH FLOW
    ====================================================== */

    getParagraphSpacing(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .ParagraphFlowManager
            .getParagraphSpacing();

    },

    getFirstLineIndent(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .ParagraphFlowManager
            .getFirstLineIndent();

    },

    getLeftIndent(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .ParagraphFlowManager
            .getLeftIndent();

    },

    getRightIndent(){

        return CampusWord2007Simulateur
            .LayoutEngine
            .ParagraphFlowManager
            .getRightIndent();

    },

    /* ======================================================
       RESET
    ====================================================== */

    reset(){

        if(
            CampusWord2007Simulateur
            .LayoutEngine
            .Cursor &&
            typeof CampusWord2007Simulateur
                .LayoutEngine
                .Cursor
                .reset==="function"
        ){

            CampusWord2007Simulateur
            .LayoutEngine
            .Cursor
            .reset();

        }

    },

    destroy(){

        this.reset();

        this.initialized=false;

    }

};























/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.1
   SINGLE CARET DOM
   ----------------------------------------------------------
   RESPONSIBILITY

   • Create one shared caret element
   • Return caret reference
   • Prevent duplicate caret
   • Destroy caret safely

   DOES NOT

   • Calculate position
   • Render caret
   • Attach to page
   • Blink
   • Show / Hide
   • Use LayoutEngine

   ========================================================== */

CampusWord2007Simulateur.CaretEngine = {

    initialized: false,

    caret: null,

    configuration: {

        id: "document-caret",

        className: "document-caret",

        width: 1,

        color: "#000000",

        defaultHeight: 19,

        zIndex: 999

    },

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    create() {

        if (this.caret) {
            return this.caret;
        }

        const caret = document.createElement("div");

        caret.id = this.configuration.id;

        caret.className = this.configuration.className;

        caret.setAttribute("aria-hidden", "true");

        caret.style.position = "absolute";

        caret.style.left = "0px";

        caret.style.top = "0px";

        caret.style.width =
            this.configuration.width + "px";

        caret.style.height =
            this.configuration.defaultHeight + "px";

        caret.style.backgroundColor =
            this.configuration.color;

        caret.style.display = "none";

        caret.style.pointerEvents = "none";

        caret.style.userSelect = "none";

        caret.style.zIndex =
            this.configuration.zIndex;

        this.caret = caret;

        return this.caret;

    },

    get() {

        return this.caret;

    },

    exists() {

        return this.caret !== null;

    },

    destroy() {

        if (
            this.caret &&
            this.caret.parentNode
        ) {

            this.caret.parentNode.removeChild(
                this.caret
            );

        }

        this.caret = null;

        this.initialized = false;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.2
   CARET POSITION
   ----------------------------------------------------------
   RESPONSIBILITY

   • Store caret position
   • Validate position payload
   • Expose current position

   DOES NOT

   • Calculate coordinates
   • Render caret
   • Attach to page
   • Blink
   • Use LayoutEngine
   • Modify DOM

   ========================================================== */

CampusWord2007Simulateur.CaretEngine.Position = {

    initialized: false,

    current: null,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.reset();

        this.initialized = true;

        return true;

    },

    create() {

        return {

            page: null,

            pageNumber: 1,

            x: 0,

            y: 0,

            height: 0,

            baseline: 0

        };

    },

    set(position) {

        if (
            !position ||
            typeof position !== "object"
        ) {

            return false;

        }

        if (
            typeof position.x !== "number" ||
            typeof position.y !== "number" ||
            typeof position.height !== "number"
        ) {

            return false;

        }

        this.current = {

            page:
                position.page ?? null,

            pageNumber:
                position.pageNumber ?? 1,

            x:
                position.x,

            y:
                position.y,

            height:
                position.height,

            baseline:
                position.baseline ?? 0

        };

        return true;

    },

    get() {

        if (!this.current) {

            this.reset();

        }

        return {

            page:
                this.current.page,

            pageNumber:
                this.current.pageNumber,

            x:
                this.current.x,

            y:
                this.current.y,

            height:
                this.current.height,

            baseline:
                this.current.baseline

        };

    },

    reset() {

        this.current =
            this.create();

        return true;

    },

    destroy() {

        this.reset();

        this.initialized = false;

        return true;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.3
   CARET ATTACHMENT
   ----------------------------------------------------------
   RESPONSIBILITY

   • Attach the shared caret to a page
   • Move caret between pages
   • Keep a single caret in the document

   DOES NOT

   • Calculate position
   • Render caret
   • Blink
   • Show / Hide
   • Use LayoutEngine

   ========================================================== */

CampusWord2007Simulateur.CaretEngine.Attachment = {

    initialized: false,

    currentPage: null,

    currentLayer: null,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    attach(page) {

        if (!(page instanceof HTMLElement)) {
            return false;
        }

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        if (!caret) {
            return false;
        }

        const layer =
            page.querySelector(
                ".page-caret-layer"
            );

        if (!layer) {
            return false;
        }

        if (
            caret.parentNode &&
            caret.parentNode !== layer
        ) {

            caret.parentNode.removeChild(
                caret
            );

        }

        if (
            caret.parentNode !== layer
        ) {

            layer.appendChild(
                caret
            );

        }

        this.currentPage = page;

        this.currentLayer = layer;

        return true;

    },

    detach() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        if (
            caret &&
            caret.parentNode
        ) {

            caret.parentNode.removeChild(
                caret
            );

        }

        this.currentPage = null;

        this.currentLayer = null;

        return true;

    },

    getPage() {

        return this.currentPage;

    },

    getLayer() {

        return this.currentLayer;

    },

    isAttached() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        return !!(

            caret &&
            this.currentLayer &&
            caret.parentNode ===
            this.currentLayer

        );

    },

    destroy() {

        this.detach();

        this.initialized = false;

        return true;

    }

};









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.4
   CARET RENDERER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Render caret visually
   • Apply position
   • Apply size
   • Show / Hide caret

   DOES NOT

   • Calculate coordinates
   • Attach caret to page
   • Blink
   • Use LayoutEngine

   ========================================================== */

CampusWord2007Simulateur.CaretEngine.Renderer = {

    initialized: false,

    visible: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    render() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        if (!caret) {
            return false;
        }

        const position =
            CampusWord2007Simulateur
            .CaretEngine
            .Position
            .get();

        caret.style.left =
            Math.round(position.x) + "px";

        caret.style.top =
            Math.round(position.y) + "px";

        caret.style.width =
            CampusWord2007Simulateur
            .CaretEngine
            .configuration
            .width + "px";

        caret.style.height =
            Math.round(position.height) + "px";

        caret.style.backgroundColor =
            CampusWord2007Simulateur
            .CaretEngine
            .configuration
            .color;

        caret.style.zIndex =
            CampusWord2007Simulateur
            .CaretEngine
            .configuration
            .zIndex;

        return true;

    },

    show() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        if (!caret) {
            return false;
        }

        caret.style.display =
            "block";

        caret.style.visibility =
            "visible";

        caret.style.opacity =
            "1";

        this.visible = true;

        return true;

    },

    hide() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .get();

        if (!caret) {
            return false;
        }

        caret.style.display =
            "none";

        caret.style.visibility =
            "hidden";

        caret.style.opacity =
            "0";

        this.visible = false;

        return true;

    },

    isVisible() {

        return this.visible;

    },

    refresh() {

        if (
            !this.render()
        ) {
            return false;
        }

        if (
            this.visible
        ) {

            this.show();

        }

        return true;

    },

    reset() {

        this.hide();

        return true;

    },

    destroy() {

        this.reset();

        this.initialized = false;

        return true;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.4
   CARET RENDERER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Render caret from current position
   • Apply x
   • Apply y
   • Apply height

   DOES NOT

   • Calculate position
   • Call LayoutEngine
   • Show / Hide caret
   • Blink
   • Attach page
   ========================================================== */

CampusWord2007Simulateur.CaretEngine.Renderer = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    render() {

        const Engine =
            CampusWord2007Simulateur
            .CaretEngine;

        const caret =
            Engine.references.caret;

        if (!caret) {
            return false;
        }

        const position =
            Engine.position;

        caret.style.left =
            position.x + "px";

        caret.style.top =
            position.y + "px";

        caret.style.height =
            position.height + "px";

        return true;

    },

    destroy() {

        this.initialized = false;

    }

};









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.5
   PAGE ATTACHMENT MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Attach the single caret to the requested page
   • Move caret between page caret layers
   • Maintain current page reference

   DOES NOT

   • Calculate coordinates
   • Render caret
   • Show / Hide caret
   • Blink
   • Call LayoutEngine
   ========================================================== */

CampusWord2007Simulateur.CaretEngine.PageAttachmentManager = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    attach(pageNumber) {

        const Engine =
            CampusWord2007Simulateur
            .CaretEngine;

        const caret =
            Engine.references.caret;

        if (!caret) {
            return false;
        }

        const page = document.querySelector(
            '.document-page[data-page-number="' +
            pageNumber +
            '"]'
        );

        if (!page) {
            return false;
        }

        const layer =
            page.querySelector(
                ".page-caret-layer"
            );

        if (!layer) {
            return false;
        }

        if (
            caret.parentNode &&
            caret.parentNode !== layer
        ) {
            caret.parentNode.removeChild(
                caret
            );
        }

        if (
            caret.parentNode !== layer
        ) {
            layer.appendChild(
                caret
            );
        }

        Engine.references.page = page;
        Engine.references.layer = layer;

        return true;

    },

    detach() {

        const Engine =
            CampusWord2007Simulateur
            .CaretEngine;

        const caret =
            Engine.references.caret;

        if (
            caret &&
            caret.parentNode
        ) {
            caret.parentNode.removeChild(
                caret
            );
        }

        Engine.references.page = null;
        Engine.references.layer = null;

        return true;

    },

    currentPage() {

        return CampusWord2007Simulateur
            .CaretEngine
            .references
            .page;

    },

    currentLayer() {

        return CampusWord2007Simulateur
            .CaretEngine
            .references
            .layer;

    },

    destroy() {

        this.detach();

        this.initialized = false;

    }

};








/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.6
   VISIBILITY MANAGER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Show caret
   • Hide caret

   DOES NOT

   • Calculate position
   • Render caret
   • Blink
   • Attach page
   • Call LayoutEngine
   ========================================================== */

CampusWord2007Simulateur.CaretEngine.VisibilityManager = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    show() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .references
            .caret;

        if (!caret) {
            return false;
        }

        caret.style.display = "block";
        caret.style.visibility = "visible";
        caret.style.opacity = "1";

        return true;

    },

    hide() {

        const caret =
            CampusWord2007Simulateur
            .CaretEngine
            .references
            .caret;

        if (!caret) {
            return false;
        }

        caret.style.display = "none";
        caret.style.visibility = "hidden";
        caret.style.opacity = "0";

        return true;

    },

    destroy() {

        this.hide();

        this.initialized = false;

    }

};









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   CARET ENGINE
   PHASE 1.7
   CARET CONTROLLER
   ----------------------------------------------------------
   RESPONSIBILITY

   • Receive LayoutEngine position
   • Update CaretPosition
   • Attach caret to page
   • Render caret
   • Show caret

   DOES NOT

   • Calculate coordinates
   • Call LayoutEngine
   • Blink
   ========================================================== */

CampusWord2007Simulateur.CaretEngine.Controller = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return true;
        }

        this.initialized = true;

        return true;

    },

    update(position) {

        if (!position) {
            return false;
        }

        const Engine =
            CampusWord2007Simulateur
            .CaretEngine;

        Engine.CaretPosition.set(position);

        Engine.PageAttachmentManager.attach(
            position.pageNumber
        );

        Engine.Renderer.render();

        Engine.VisibilityManager.show();

        return true;

    },

    hide() {

        return CampusWord2007Simulateur
            .CaretEngine
            .VisibilityManager
            .hide();

    },

    destroy() {

        this.hide();

        this.initialized = false;

    }

};



































































































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
