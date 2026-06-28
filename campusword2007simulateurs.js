
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
   CARET ENGINE
   synchronizeWithCharacter()
========================================================== */

CampusWord2007Simulateur.CaretEngine
.synchronizeWithCharacter=function(character){

    if(

        !character ||

        !character.isConnected ||

        !this.caret

    ){

        return false;

    }

    const paragraph=

        character.parentNode;

    if(!paragraph){

        return false;

    }

    const page=

        paragraph.closest(

            ".document-page"

        );

    if(

        page &&

        page!==CampusWord2007Simulateur
                .DocumentEngine
                .getActivePage()

    ){

        CampusWord2007Simulateur
        .DocumentEngine
        .setActivePage(page);

        this.attachToPage(page);

    }

    const paragraphRect=

        paragraph.getBoundingClientRect();

    const characterRect=

        character.getBoundingClientRect();

    const layerRect=

        this.layer.getBoundingClientRect();

    const x=

        characterRect.right-

        layerRect.left;

const y=

    Math.round(

        paragraph.offsetTop

    );

    this.setPosition(

        Math.round(x),

        Math.round(y)

    );

    this.show();

    return true;

};





/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 5A
   KEYBOARD ENGINE
   Foundation
========================================================== */

CampusWord2007Simulateur.KeyboardEngine={

    initialized:false,

    enabled:true,

    target:null,

    boundKeyDown:null,

    boundKeyUp:null,

    boundKeyPress:null,
    boundBeforeInput:null,
    boundInput:null,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.target=document;

        this.boundKeyDown=

            this.onKeyDown.bind(this);

        this.boundKeyUp=

            this.onKeyUp.bind(this);

        this.boundKeyPress=

            this.onKeyPress.bind(this);

        this.boundBeforeInput=

            this.onBeforeInput.bind(this);

        this.boundInput=

            this.onInput.bind(this);

        this.attach();

        const VirtualKeyboard=

            CampusWord2007Simulateur.VirtualKeyboardEngine;

        if(

            VirtualKeyboard &&

            VirtualKeyboard.initialized &&

            typeof VirtualKeyboard.focus==="function"

        ){

            VirtualKeyboard.focus();

        }

        this.initialized=true;

        return true;

    },

    attach(){

        if(!this.target){

            return;

        }

        this.target.addEventListener(

            "keydown",

            this.boundKeyDown,

            false

        );

        this.target.addEventListener(

            "keyup",

            this.boundKeyUp,

            false

        );

        this.target.addEventListener(

            "keypress",

            this.boundKeyPress,

            false

        );

        this.target.addEventListener(

            "beforeinput",

            this.boundBeforeInput,

            false

        );

        this.target.addEventListener(

            "input",

            this.boundInput,

            false

        );

    },

    detach(){

        if(!this.target){

            return;

        }

        this.target.removeEventListener(

            "keydown",

            this.boundKeyDown,

            false

        );

        this.target.removeEventListener(

            "keyup",

            this.boundKeyUp,

            false

        );

        this.target.removeEventListener(

            "keypress",

            this.boundKeyPress,

            false

        );

        this.target.removeEventListener(

            "beforeinput",

            this.boundBeforeInput,

            false

        );

        this.target.removeEventListener(

            "input",

            this.boundInput,

            false

        );

    },

    enable(){

        this.enabled=true;

    },

    disable(){

        this.enabled=false;

    },

    isEnabled(){

        return this.enabled;

    },

    onKeyDown(event){

        if(!this.enabled){

            return;

        }

        switch(event.key){

            case "Enter":

                event.preventDefault();

                if(

                    CampusWord2007Simulateur.EnterEngine &&

                    typeof CampusWord2007Simulateur.EnterEngine.execute==="function"

                ){

                    CampusWord2007Simulateur.EnterEngine.execute();

                }

                break;

            default:

                break;

        }

    },

    onKeyUp(event){

        if(!this.enabled){

            return;

        }

    },

    onKeyPress(event){

        if(!this.enabled){

            return;

        }

        if(

            event.ctrlKey ||

            event.altKey ||

            event.metaKey

        ){

            return;

        }

        const character=

            event.key;

        if(

            typeof character!=="string" ||

            character.length!==1

        ){

            return;

        }

        if(

            !CampusWord2007Simulateur.TextEngine ||

            typeof CampusWord2007Simulateur.TextEngine.insertCharacter!=="function"

        ){

            return;

        }

        event.preventDefault();

        CampusWord2007Simulateur.TextEngine.insertCharacter(

            character

        );

    },

    onBeforeInput(event){

        if(!this.enabled){

            return;

        }

        if(

            !event ||

            event.isComposing

        ){

            return;

        }

        if(

            typeof event.data!=="string" ||

            event.data.length!==1

        ){

            return;

        }

        if(

            !CampusWord2007Simulateur.TextEngine ||

            typeof CampusWord2007Simulateur.TextEngine.insertCharacter!=="function"

        ){

            return;

        }

        event.preventDefault();

        CampusWord2007Simulateur.TextEngine.insertCharacter(

            event.data

        );

    },

    onInput(event){

        if(!this.enabled){

            return;

        }

    },

    destroy(){

        this.detach();

        const VirtualKeyboard=

            CampusWord2007Simulateur.VirtualKeyboardEngine;

        if(

            VirtualKeyboard &&

            typeof VirtualKeyboard.destroy==="function"

        ){

            VirtualKeyboard.destroy();

        }

        this.target=null;

        this.boundKeyDown=null;

        this.boundKeyUp=null;

        this.boundKeyPress=null;
        this.boundBeforeInput=null;
        this.boundInput=null;

        this.enabled=true;

        this.initialized=false;

    }

};










/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 5C.2
   TEXT ENGINE
   Character Rendering Foundation
========================================================== */

CampusWord2007Simulateur.TextEngine={

    initialized:false,

    currentLayer:null,

    currentParagraph:null,

    defaultFont:"Calibri",

    defaultFontSize:16,

    characterSpacing:0,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.refreshActiveLayer();

        this.initialized=true;

        return true;

    },

refreshActiveLayer(){

    const page=

        CampusWord2007Simulateur
        .DocumentEngine
        .getActivePage();

    if(!page){

        this.currentLayer=null;

        this.currentParagraph=null;

        return false;

    }

    this.currentLayer=

        page.querySelector(

            ".page-text-layer"

        );

    if(!this.currentLayer){

        this.currentParagraph=null;

        return false;

    }

    if(

        this.currentParagraph &&

        this.currentParagraph.isConnected &&

        this.currentParagraph.parentNode===

        this.currentLayer

    ){

        return true;

    }

    const lastParagraph=

        this.currentLayer.lastElementChild;

    if(

        lastParagraph &&

        lastParagraph.classList &&

        lastParagraph.classList.contains(

            "text-paragraph"

        )

    ){

        this.currentParagraph=

            lastParagraph;

        return true;

    }

    this.currentParagraph=

        document.createElement("div");

    this.currentParagraph.className=

        "text-paragraph";

    this.currentParagraph.style.position=

        "relative";

    this.currentParagraph.style.whiteSpace=

        "pre";

    this.currentParagraph.style.lineHeight=

        "19px";

    this.currentParagraph.style.fontFamily=

        this.defaultFont;

    this.currentParagraph.style.fontSize=

        this.defaultFontSize+"px";

    this.currentParagraph.style.minHeight=

        "19px";

    this.currentLayer.appendChild(

        this.currentParagraph

    );

    return true;

    },

insertCharacter(character){

    if(

        typeof character!=="string" ||

        character.length!==1

    ){

        return false;

    }

    if(

        !this.refreshActiveLayer()

    ){

        return false;

    }

    if(

        !this.currentParagraph ||

        !this.currentParagraph.isConnected

    ){

        return false;

    }

    const span=

        document.createElement("span");

    span.className=

        "text-character";

    span.textContent=

        character;

    span.style.display=

        "inline";

    span.style.whiteSpace=

        "pre";

    span.style.fontFamily=

        this.defaultFont;

    span.style.fontSize=

        this.defaultFontSize+"px";

    if(this.characterSpacing!==0){

        span.style.letterSpacing=

            this.characterSpacing+"px";

    }

    this.currentParagraph.appendChild(

        span

    );

    const Caret=

        CampusWord2007Simulateur
        .CaretEngine;

    if(

        Caret &&

        typeof Caret.getPosition==="function" &&

        typeof Caret.setPosition==="function"

    ){

this.currentParagraph.appendChild(span);

requestAnimationFrame(() => {
    Caret.synchronizeWithCharacter(span);
    Caret.show();
});

        Caret.show();

    }

    return true;

    },

    destroy(){

        this.currentLayer=null;

        this.currentParagraph=null;

        this.initialized=false;

    }

};





/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 5D
   PARAGRAPH ENGINE
   Paragraph Foundation
========================================================== */

CampusWord2007Simulateur.ParagraphEngine={

    initialized:false,

    defaultLineHeight:19,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.initialized=true;

        return true;

    },

createParagraph(){

    const Text=

        CampusWord2007Simulateur.TextEngine;

    if(

        !Text ||

        typeof Text.refreshActiveLayer!=="function"

    ){

        return null;

    }

    if(

        !Text.refreshActiveLayer()

    ){

        return null;

    }

    const paragraph=

        document.createElement(

            "div"

        );

    paragraph.className=

        "text-paragraph";

    paragraph.style.position=

        "relative";

    paragraph.style.whiteSpace=

        "pre";

    paragraph.style.minHeight=

        this.defaultLineHeight+"px";

    paragraph.style.lineHeight=

        this.defaultLineHeight+"px";

    paragraph.style.fontFamily=

        Text.defaultFont;

    paragraph.style.fontSize=

        Text.defaultFontSize+"px";

    Text.currentLayer.appendChild(

        paragraph

    );

    Text.currentLayer=

        paragraph.parentNode;

    Text.currentParagraph=

        paragraph;

    this.currentParagraph=

        paragraph;

    this.currentLayer=

        Text.currentLayer;

    return paragraph;


    },

    insertParagraph(){

        const paragraph=

            this.createParagraph();

        if(!paragraph){

            return false;

        }

        const Caret=

            CampusWord2007Simulateur.CaretEngine;

        if(

            Caret &&

            typeof Caret.getPosition==="function" &&

            typeof Caret.setPosition==="function"

        ){

            const position=

                Caret.getPosition();

            Caret.setPosition(

                96,

                position.y+

                this.defaultLineHeight

            );

        }

        return true;

    },

    destroy(){

        this.initialized=false;

    }

};









/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 5B
   ENTER ENGINE
   Line Break Management
========================================================== */

CampusWord2007Simulateur.EnterEngine={

    initialized:false,

    lineHeight:19,

    topMargin:96,

    bottomMargin:96,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.initialized=true;

        return true;

    },


execute(){

    const Caret=

        CampusWord2007Simulateur.CaretEngine;

    const Document=

        CampusWord2007Simulateur.DocumentEngine;

    const PageFactory=

        CampusWord2007Simulateur.PageFactory;

    const Paragraph=

        CampusWord2007Simulateur.ParagraphEngine;

    if(

        !Caret ||

        !Caret.caret ||

        !Document ||

        !Document.getActivePage()

    ){

        return;

    }

    const page=

        Document.getActivePage();

    const content=

        page.querySelector(

            ".page-content"

        );

    if(!content){

        return;

    }

    const pageHeight=

        content.clientHeight;

    const limit=

        pageHeight-

        this.bottomMargin-

        Caret.height;

    const position=

        Caret.getPosition();

    let nextY=

        position.y+

        this.lineHeight;

    if(nextY>limit){

        const newPage=

            PageFactory.createPage();

        if(!newPage){

            return;

        }

        if(

            typeof Caret.attachToPage===

            "function"

        ){

            Caret.attachToPage(

                newPage

            );

        }

        if(

            Paragraph &&

            typeof Paragraph.createParagraph==="function"

        ){

            Paragraph.createParagraph();

        }

        Caret.setPosition(

            this.topMargin,

            this.topMargin

        );

        Caret.show();

        return;

    }

    if(

        Paragraph &&

        typeof Paragraph.createParagraph==="function"

    ){

        Paragraph.createParagraph();

    }

    Caret.setPosition(

        this.topMargin,

        nextY

    );

    Caret.show();

}   

};







/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 5B.1
   VIRTUAL KEYBOARD ENGINE
   Android / Tablet / iOS Support
========================================================== */

CampusWord2007Simulateur.VirtualKeyboardEngine={

    initialized:false,

    input:null,

    enabled:true,

    initialize(){

        if(this.initialized){

            return true;

        }

        this.createInput();

        this.attach();

        this.initialized=true;

        return true;

    },

    createInput(){

        if(this.input){

            return;

        }

        this.input=

            document.createElement("input");

        this.input.type="text";

        this.input.id=

            "virtual-keyboard-input";

        this.input.autocomplete="off";

        this.input.autocorrect="off";

        this.input.autocapitalize="off";

        this.input.spellcheck=false;

        this.input.tabIndex=-1;

        this.input.value="";

        this.input.style.position="fixed";

        this.input.style.left="-10000px";

        this.input.style.top="0";

        this.input.style.width="1px";

        this.input.style.height="1px";

        this.input.style.opacity="0";

        this.input.style.pointerEvents="none";

        this.input.style.zIndex="-1";

        document.body.appendChild(

            this.input

        );

    },

    attach(){

        if(!this.input){

            return;

        }

        document.addEventListener(

            "pointerdown",

            ()=>{

                this.focus();

            },

            false

        );

        document.addEventListener(

            "touchstart",

            ()=>{

                this.focus();

            },

            false

        );

        window.addEventListener(

            "focus",

            ()=>{

                this.focus();

            },

            false

        );

    },

    focus(){

        if(

            !this.enabled ||

            !this.input

        ){

            return;

        }

        this.input.focus(

            {

                preventScroll:true

            }

        );

    },

    blur(){

        if(this.input){

            this.input.blur();

        }

    },

    enable(){

        this.enabled=true;

    },

    disable(){

        this.enabled=false;

        this.blur();

    },

    isFocused(){

        return(

            document.activeElement===

            this.input

        );

    },

    destroy(){

        if(

            this.input &&

            this.input.parentNode

        ){

            this.input.parentNode.removeChild(

                this.input

            );

        }

        this.input=null;

        this.initialized=false;

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
