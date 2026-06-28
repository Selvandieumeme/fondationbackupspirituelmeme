
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

        this.activePage=null;

        if(this.pageContainer){

            this.pageContainer.innerHTML="";
        }

        CampusWord2007Simulateur.State.currentPage=1;

        CampusWord2007Simulateur.State.totalPages=0;

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

        CampusWord2007Simulateur.State.currentPage=

            Number(page.dataset.pageNumber)||1;

        this.updateStatus();

    },

    clearDocument(){

        this.pages=[];

        this.pageCounter=0;

        this.activePage=null;

        if(this.pageContainer){

            this.pageContainer.innerHTML="";
        }

        CampusWord2007Simulateur.State.currentPage=0;

        CampusWord2007Simulateur.State.totalPages=0;

    },

    newDocument(){

        this.clearDocument();

        this.createDocument();

    },

    updateStatus(){

        CampusWord2007Simulateur.State.totalPages=

            this.pages.length;

        const status=

            CampusWord2007Simulateur.DOMEngine.get(

                "status-page-number"

            );

        if(status){

            status.textContent=

                "Page "+

                (CampusWord2007Simulateur.State.currentPage||1)+

                " of "+

                this.pages.length;

        }

    }

};









/* ==========================================================
   CARET ENGINE
   attachToPage()
========================================================== */

CampusWord2007Simulateur.CaretEngine.attachToPage = function(page){

    if(!page){

        return false;

    }

    const layer = page.querySelector(
        ".page-caret-layer"
    );

    if(!layer){

        return false;

    }

    this.layer = layer;

    this.createCaret();

    this.setPosition(
        this.x,
        this.y
    );

    this.show();

    if(!this.blinking){

        this.startBlink();

    }

    return true;

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
   PHASE 4A
   CARET ENGINE
   Caret Creation
   Blink
   Visibility
========================================================== */


CampusWord2007Simulateur.CaretEngine={

    initialized:false,

    caret:null,

    layer:null,

    timer:null,

    visible:true,

    blinking:false,

    x:96,

    y:96,

    width:1,

    height:19,

    blinkInterval:530,

    initialize(){

        if(this.initialized){

            return true;

        }

        if(!this.attachToActivePage()){

            return false;

        }

        this.show();

        this.startBlink();

        this.initialized=true;

        return true;

    },

    attachToActivePage(){

        const documentEngine=

            CampusWord2007Simulateur.DocumentEngine;

        const page=

            documentEngine.getActivePage();

        if(!page){

            CampusWord2007Simulateur.Utilities.error(

                "CaretEngine",

                "No active page."

            );

            return false;

        }

        const layer=

            page.querySelector(

                ".page-caret-layer"

            );

        if(!layer){

            CampusWord2007Simulateur.Utilities.error(

                "CaretEngine",

                "Caret layer missing."

            );

            return false;

        }

        this.layer=layer;

        this.createCaret();

        this.setPosition(

            this.x,

            this.y

        );

        return true;

    },

    createCaret(){

        if(!this.layer){

            return;
        }

        if(

            getComputedStyle(

                this.layer

            ).position==="static"

        ){

            this.layer.style.position="relative";

        }

        if(

            this.caret &&

            this.caret.parentNode!==this.layer

        ){

            this.caret.parentNode.removeChild(

                this.caret

            );

        }

        if(!this.caret){

            this.caret=document.createElement("div");

            this.caret.id="document-caret";

            this.caret.style.position="absolute";

            this.caret.style.width=

                this.width+"px";

            this.caret.style.height=

                this.height+"px";

            this.caret.style.background="#000000";

            this.caret.style.pointerEvents="none";

            this.caret.style.userSelect="none";

            this.caret.style.display="block";

            this.caret.style.visibility="visible";

            this.caret.style.opacity="1";

            this.caret.style.zIndex="999";

            this.caret.style.transform="translate3d(0,0,0)";

        }

        if(

            this.caret.parentNode!==this.layer

        ){

            this.layer.appendChild(

                this.caret

            );

        }

    },

    setPosition(x,y){

        this.x=x;

        this.y=y;

        if(!this.caret){

            return;

        }

        this.caret.style.left=x+"px";

        this.caret.style.top=y+"px";

    },

    moveToPage(page){

        if(!page){

            return;

        }

        const layer=

            page.querySelector(

                ".page-caret-layer"

            );

        if(!layer){

            return;

        }

        this.layer=layer;

        this.createCaret();

        this.setPosition(

            this.x,

            this.y

        );

    },

    getPosition(){

        return{

            x:this.x,

            y:this.y

        };

    },

    show(){

        if(!this.caret){

            return;

        }

        this.visible=true;

        this.caret.style.visibility="visible";

        this.caret.style.opacity="1";

    },

    hide(){

        if(!this.caret){

            return;

        }

        this.visible=false;

        this.caret.style.visibility="hidden";

        this.caret.style.opacity="0";

    },

    toggle(){

        if(!this.caret){

            return;

        }

        if(this.visible){

            this.hide();

        }

        else{

            this.show();

        }

    },

    startBlink(){

        if(this.blinking){

            return;

        }

        this.blinking=true;

        this.timer=setInterval(()=>{

            if(

                this.caret &&

                this.caret.isConnected

            ){

                this.toggle();

            }

        },

        this.blinkInterval);

    },

    stopBlink(){

        if(this.timer){

            clearInterval(

                this.timer

            );

        }

        this.timer=null;

        this.blinking=false;

        this.show();

    },

    destroy(){

        this.stopBlink();

        if(

            this.caret &&

            this.caret.parentNode

        ){

            this.caret.parentNode.removeChild(

                this.caret

            );

        }

        this.caret=null;

        this.layer=null;

        this.visible=true;

        this.initialized=false;

    }

};