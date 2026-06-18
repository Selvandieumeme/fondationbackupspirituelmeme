/* ==========================================================
   CAMPUS WORD 2007 SIMULATEUR
   PHASE 1
   FOUNDATION
   ========================================================== */

"use strict";

/* ==========================================================
   ROOT NAMESPACE
   ========================================================== */

window.CampusWord2007Simulateur =
window.CampusWord2007Simulateur || {};

/* ==========================================================
   ENGINE CONTAINERS
   ========================================================== */

CampusWord2007Simulateur.CoreEngine = {};
CampusWord2007Simulateur.DeviceEngine = {};
CampusWord2007Simulateur.DocumentEngine = {};
CampusWord2007Simulateur.PageEngine = {};
CampusWord2007Simulateur.LayoutEngine = {};
CampusWord2007Simulateur.TextEngine = {};
CampusWord2007Simulateur.CaretEngine = {};
CampusWord2007Simulateur.SelectionEngine = {};
CampusWord2007Simulateur.KeyboardEngine = {};
CampusWord2007Simulateur.MouseEngine = {};
CampusWord2007Simulateur.ScrollEngine = {};
CampusWord2007Simulateur.ZoomEngine = {};
CampusWord2007Simulateur.StatusBarEngine = {};
CampusWord2007Simulateur.RibbonEngine = {};
CampusWord2007Simulateur.RenderEngine = {};








/* ==========================================================
   CONFIGURATION
   ========================================================== */

CampusWord2007Simulateur.Config = {

    PAGE_WIDTH: 794,

    PAGE_HEIGHT: 1123,

    PAGE_MARGIN_TOP: 96,

    PAGE_MARGIN_RIGHT: 96,

    PAGE_MARGIN_BOTTOM: 96,

    PAGE_MARGIN_LEFT: 96,

    DEFAULT_ZOOM: 100,

    MIN_ZOOM: 30,

    MAX_ZOOM: 300,

    CARET_BLINK_INTERVAL: 530,

    LOADING_DURATION: 1200

};








/* ==========================================================
   GLOBAL STATE
   ========================================================== */

CampusWord2007Simulateur.State = {

    initialized: false,

    loadingCompleted: false,

    activePageNumber: 1,

    totalPages: 0,

    zoom: 100,

    documentModified: false

};








/* ==========================================================
   DEVICE STATE
   ========================================================== */

CampusWord2007Simulateur.DeviceState = {

    isMobile: false,

    isTablet: false,

    isDesktop: false,

    isTouch: false,

    screenWidth: 0,

    screenHeight: 0,

    pixelRatio: 1

};









/* ==========================================================
   DOM CACHE
   ========================================================== */

CampusWord2007Simulateur.DOM = {};









/* ==========================================================
   DOM INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur.CoreEngine.cacheDOM = function(){

    const DOM =
    CampusWord2007Simulateur.DOM;

    DOM.loadingScreen =
        document.getElementById(
            "word-loading-screen"
        );

    DOM.wordApp =
        document.getElementById(
            "word-app"
        );

    DOM.documentViewport =
        document.getElementById(
            "document-viewport"
        );

    DOM.documentScrollArea =
        document.getElementById(
            "document-scroll-area"
        );

    DOM.documentCanvas =
        document.getElementById(
            "document-canvas"
        );

    DOM.documentPagesContainer =
        document.getElementById(
            "document-pages-container"
        );

    DOM.pageTemplate =
        document.getElementById(
            "document-page-template"
        );

    DOM.statusPageNumber =
        document.getElementById(
            "status-page-number"
        );

    DOM.statusWordCount =
        document.getElementById(
            "status-word-count"
        );

    DOM.statusZoomPercentage =
        document.getElementById(
            "status-zoom-percentage"
        );

    DOM.zoomIn =
        document.getElementById(
            "zoom-in"
        );

    DOM.zoomOut =
        document.getElementById(
            "zoom-out"
        );
};







/* ==========================================================
   DEVICE ENGINE
   ========================================================== */

CampusWord2007Simulateur.DeviceEngine.detectDevice =
function(){

    const deviceState =
        CampusWord2007Simulateur.DeviceState;

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    const touchSupport =
        (
            "ontouchstart" in window
            ||
            navigator.maxTouchPoints > 0
        );

    deviceState.screenWidth =
        width;

    deviceState.screenHeight =
        height;

    deviceState.pixelRatio =
        window.devicePixelRatio || 1;

    deviceState.isTouch =
        touchSupport;

    deviceState.isMobile =
        width <= 768;

    deviceState.isTablet =
        width > 768 &&
        width <= 1024;

    deviceState.isDesktop =
        width > 1024;
};

CampusWord2007Simulateur.DeviceEngine.updateDevice =
function(){

    CampusWord2007Simulateur
        .DeviceEngine
        .detectDevice();
};






/* ==========================================================
   LOADING ENGINE
   ========================================================== */

CampusWord2007Simulateur.LoadingEngine = {};

CampusWord2007Simulateur.LoadingEngine.show =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    if(!DOM.loadingScreen){
        return;
    }

    DOM.loadingScreen.style.display =
        "flex";
};

CampusWord2007Simulateur.LoadingEngine.hide =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    const state =
        CampusWord2007Simulateur.State;

    if(!DOM.loadingScreen){
        return;
    }

    DOM.loadingScreen.style.display =
        "none";

    state.loadingCompleted =
        true;
};

CampusWord2007Simulateur.LoadingEngine.start =
function(){

    const duration =
        CampusWord2007Simulateur
        .Config
        .LOADING_DURATION;

    CampusWord2007Simulateur
        .LoadingEngine
        .show();

    window.setTimeout(
        function(){

            CampusWord2007Simulateur
                .LoadingEngine
                .hide();

        },
        duration
    );
};








/* ==========================================================
   CORE INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur.CoreEngine.initialize =
function(){

    const state =
        CampusWord2007Simulateur.State;

    if(state.initialized){
        return;
    }

    CampusWord2007Simulateur
        .CoreEngine
        .cacheDOM();

    CampusWord2007Simulateur
        .DeviceEngine
        .detectDevice();

    CampusWord2007Simulateur
    .LoadingEngine
    .start();

CampusWord2007Simulateur
    .DocumentEngine
    .createDocument();

CampusWord2007Simulateur
    .StatusBarEngine
    .updatePageDisplay();

state.initialized = true;

};






/* ==========================================================
   WINDOW EVENTS
   ========================================================== */

window.addEventListener(
    "resize",
    function(){

        CampusWord2007Simulateur
            .DeviceEngine
            .updateDevice();

    }
);










/* ==========================================================
   APPLICATION STARTUP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        CampusWord2007Simulateur
            .CoreEngine
            .initialize();

    }
);







/* ==========================================================
   DOCUMENT STATE
   ========================================================== */

CampusWord2007Simulateur.DocumentState = {

    pages: [],

    activePage: null,

    documentCreated: false

};







/* ==========================================================
   PAGE ENGINE
   CREATE PAGE
   ========================================================== */

CampusWord2007Simulateur.PageEngine.createPage =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    const documentState =
        CampusWord2007Simulateur.DocumentState;

    if(
        !DOM.pageTemplate ||
        !DOM.documentPagesContainer
    ){
        return null;
    }

    const pageElement =
        DOM.pageTemplate
        .content
        .firstElementChild
        .cloneNode(true);

    const pageNumber =
        documentState.pages.length + 1;

    pageElement.setAttribute(
        "data-page-number",
        pageNumber
    );

    DOM.documentPagesContainer
        .appendChild(
            pageElement
        );

    documentState.pages.push(
        pageElement
    );

    return pageElement;
};








/* ==========================================================
   PAGE ENGINE
   GET PAGE
   ========================================================== */

CampusWord2007Simulateur.PageEngine.getPage =
function(pageNumber){

    const pages =
        CampusWord2007Simulateur
        .DocumentState
        .pages;

    return pages[
        pageNumber - 1
    ] || null;
};









/* ==========================================================
   PAGE ENGINE
   PAGE COUNT
   ========================================================== */

CampusWord2007Simulateur.PageEngine.getPageCount =
function(){

    return CampusWord2007Simulateur
        .DocumentState
        .pages
        .length;
};







/* ==========================================================
   PAGE ENGINE
   REMOVE PAGE
   ========================================================== */

CampusWord2007Simulateur.PageEngine.removePage =
function(pageNumber){

    const documentState =
        CampusWord2007Simulateur
        .DocumentState;

    const page =
        CampusWord2007Simulateur
        .PageEngine
        .getPage(
            pageNumber
        );

    if(!page){
        return false;
    }

    page.remove();

    documentState.pages.splice(
        pageNumber - 1,
        1
    );

    return true;
};







/* ==========================================================
   DOCUMENT ENGINE
   CREATE DOCUMENT
   ========================================================== */

CampusWord2007Simulateur.DocumentEngine
.createDocument =
function(){

    const documentState =
        CampusWord2007Simulateur
        .DocumentState;

    if(
        documentState.documentCreated
    ){
        return;
    }

    const firstPage =
        CampusWord2007Simulateur
        .PageEngine
        .createPage();

    documentState.activePage =
        firstPage;

    documentState.documentCreated =
        true;
};











/* ==========================================================
   STATUS BAR ENGINE
   ========================================================== */

CampusWord2007Simulateur
.StatusBarEngine
.updatePageDisplay =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    const pageCount =
        CampusWord2007Simulateur
        .PageEngine
        .getPageCount();

    if(
        !DOM.statusPageNumber
    ){
        return;
    }

    DOM.statusPageNumber
        .textContent =
        "Page 1 of " +
        pageCount;
};







       
