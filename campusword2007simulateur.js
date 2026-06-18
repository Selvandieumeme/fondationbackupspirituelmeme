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

CampusWord2007Simulateur
    .LayoutEngine
    .calculateWritableArea();

CampusWord2007Simulateur
    .RenderEngine
    .render();

CampusWord2007Simulateur
    .CaretEngine
    .initialize();

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











/* ==========================================================
   WRITABLE AREA STATE
   ========================================================== */

CampusWord2007Simulateur.LayoutState = {

    writableWidth: 0,

    writableHeight: 0,

    pageWidth: 0,

    pageHeight: 0

};













/* ==========================================================
   LAYOUT ENGINE
   CALCULATE WRITABLE AREA
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .calculateWritableArea =
function(){

    const config =
        CampusWord2007Simulateur.Config;

    const layoutState =
        CampusWord2007Simulateur.LayoutState;

    layoutState.pageWidth =
        config.PAGE_WIDTH;

    layoutState.pageHeight =
        config.PAGE_HEIGHT;

    layoutState.writableWidth =

        config.PAGE_WIDTH

        -

        config.PAGE_MARGIN_LEFT

        -

        config.PAGE_MARGIN_RIGHT;

    layoutState.writableHeight =

        config.PAGE_HEIGHT

        -

        config.PAGE_MARGIN_TOP

        -

        config.PAGE_MARGIN_BOTTOM;

    return {

        width:
            layoutState.writableWidth,

        height:
            layoutState.writableHeight

    };
};








/* ==========================================================
   UPDATE PAGE LAYOUT
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .updatePageLayout =
function(){

    const pageCount =

        CampusWord2007Simulateur
            .PageEngine
            .getPageCount();

    for(
        let i = 1;
        i <= pageCount;
        i++
    ){

        const page =

            CampusWord2007Simulateur
                .PageEngine
                .getPage(i);

        if(!page){
            continue;
        }

        page.dataset.pageNumber =
            i;
    }
};









/* ==========================================================
   RENDER ENGINE
   ========================================================== */

CampusWord2007Simulateur.RenderState = {

    renderCount: 0,

    lastRenderTime: 0

};








/* ==========================================================
   RENDER DOCUMENT
   ========================================================== */

CampusWord2007Simulateur
    .RenderEngine
    .render =
function(){

    const renderState =

        CampusWord2007Simulateur
            .RenderState;

    renderState.renderCount++;

    renderState.lastRenderTime =
        Date.now();

    CampusWord2007Simulateur
        .LayoutEngine
        .updatePageLayout();
};








/* ==========================================================
   REFRESH DOCUMENT
   ========================================================== */

CampusWord2007Simulateur
    .RenderEngine
    .refresh =
function(){

    CampusWord2007Simulateur
        .RenderEngine
        .render();
};










/* ==========================================================
   CARET STATE
   ========================================================== */

CampusWord2007Simulateur.CaretState = {

    created: false,

    visible: true,

    x: 0,

    y: 0,

    width: 1,

    height: 20,

   activePage: 1,

    element: null,

    blinkInterval: null

};







/* ==========================================================
   CREATE CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .createCaret =
function(){

    const caretState =
        CampusWord2007Simulateur
            .CaretState;

    if(
        caretState.created
    ){
        return;
    }

    const page =

        CampusWord2007Simulateur
            .PageEngine
            .getPage(1);

    if(!page){
        return;
    }

    const caretLayer =

        page.querySelector(
            ".page-caret-layer"
        );

    if(!caretLayer){
        return;
    }

    const caret =

        document.createElement(
            "div"
        );

    caret.id =
        "word-caret";

    caret.style.position =
        "absolute";

    caret.style.left =
        "0px";

    caret.style.top =
        "0px";

    caret.style.width =
        "1px";

    caret.style.height =
        "20px";

    caret.style.background =
        "#000000";

    caret.style.pointerEvents =
        "none";

    caret.style.display =
        "block";

    caretLayer.appendChild(
        caret
    );

    caretState.element =
        caret;

    caretState.created =
        true;
};








/* ==========================================================
   SHOW CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .showCaret =
function(){

    const caret =

        CampusWord2007Simulateur
            .CaretState
            .element;

    if(!caret){
        return;
    }

    caret.style.display =
        "block";

    CampusWord2007Simulateur
        .CaretState
        .visible = true;
};







/* ==========================================================
   HIDE CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .hideCaret =
function(){

    const caret =

        CampusWord2007Simulateur
            .CaretState
            .element;

    if(!caret){
        return;
    }

    caret.style.display =
        "none";

    CampusWord2007Simulateur
        .CaretState
        .visible = false;
};







/* ==========================================================
   MOVE CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .moveCaret =
function(
    x,
    y
){

    const caretState =

        CampusWord2007Simulateur
            .CaretState;

    const caret =
        caretState.element;

    if(!caret){
        return;
    }

    const limits =

        CampusWord2007Simulateur
            .CaretEngine
            .getWritableLimits();

    x = Math.max(
        limits.minX,
        Math.min(
            x,
            limits.maxX
        )
    );

    y = Math.max(
        limits.minY,
        Math.min(
            y,
            limits.maxY
        )
    );

    caretState.x = x;
    caretState.y = y;

    caret.style.left =
        x + "px";

    caret.style.top =
        y + "px";
};






/* ==========================================================
   BLINK CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .blinkCaret =
function(){

    const caretState =

        CampusWord2007Simulateur
            .CaretState;

    const caret =
        caretState.element;

    if(!caret){
        return;
    }

    if(
        caretState.blinkInterval
    ){
        clearInterval(
            caretState.blinkInterval
        );
    }

    caretState.blinkInterval =

        window.setInterval(

            function(){

                if(
                    caret.style.visibility
                    ===
                    "hidden"
                ){

                    caret.style.visibility =
                        "visible";

                }
                else{

                    caret.style.visibility =
                        "hidden";
                }

            },

            CampusWord2007Simulateur
                .Config
                .CARET_BLINK_INTERVAL

        );
};








/* ==========================================================
   INITIALIZE CARET
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .initialize =
function(){

    CampusWord2007Simulateur
        .CaretEngine
        .createCaret();

    CampusWord2007Simulateur
        .CaretEngine
        .moveCaret(
            0,
            0
        );

    CampusWord2007Simulateur
        .CaretEngine
        .blinkCaret();
};









/* ==========================================================
   GET WRITABLE LIMITS
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .getWritableLimits =
function(){

    const layoutState =

        CampusWord2007Simulateur
            .LayoutState;

    return {

        minX: 0,

        minY: 0,

        maxX:
            layoutState.writableWidth,

        maxY:
            layoutState.writableHeight

    };
};









       
/* ==========================================================
   GET CARET POSITION
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .getPosition =
function(){

    return {

        x:
            CampusWord2007Simulateur
                .CaretState
                .x,

        y:
            CampusWord2007Simulateur
                .CaretState
                .y

    };
};









/* ==========================================================
   SET CARET HEIGHT
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .setHeight =
function(height){

    const caretState =

        CampusWord2007Simulateur
            .CaretState;

    const caret =
        caretState.element;

    if(!caret){
        return;
    }

    caretState.height =
        height;

    caret.style.height =
        height + "px";
};









/* ==========================================================
   SET ACTIVE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .CaretEngine
    .setPage =
function(pageNumber){

    const page =

        CampusWord2007Simulateur
            .PageEngine
            .getPage(pageNumber);

    if(!page){
        return;
    }

    const layer =

        page.querySelector(
            ".page-caret-layer"
        );

    if(!layer){
        return;
    }

    const caretState =

        CampusWord2007Simulateur
            .CaretState;

    if(
        caretState.element
    ){

        layer.appendChild(
            caretState.element
        );
    }

    caretState.activePage =
        pageNumber;
};



