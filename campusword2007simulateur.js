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
CampusWord2007Simulateur.MobileInputEngine = {};
CampusWord2007Simulateur.PaginationEngine = {};

CampusWord2007Simulateur.WindowEngine = {};



CampusWord2007Simulateur.RibbonEngine = {};


CampusWord2007Simulateur.HomeRibbonEngine = {};






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
   WINDOW DOM CACHE
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .cacheDOM =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    DOM.wordApp =
        document.getElementById(
            "word-app"
        );

    DOM.windowMinimize =
        document.getElementById(
            "window-minimize"
        );

    DOM.windowMaximize =
        document.getElementById(
            "window-maximize"
        );

    DOM.windowClose =
        document.getElementById(
            "window-close"
        );
};









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

    DOM.officeButton =
        document.getElementById(
            "office-button"
        );

    DOM.officeMenu =
        document.getElementById(
            "office-menu"
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
    .WindowEngine
    .initialize();

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

CampusWord2007Simulateur
    .KeyboardEngine
    .initialize();


CampusWord2007Simulateur
    .MobileInputEngine
    .initialize();
   

CampusWord2007Simulateur
    .RibbonTabsEngine
    .initialize();

state.initialized = true;

};










/* ==========================================================
   WINDOW ENGINE
   INITIALIZE
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .initialize =
function(){

    CampusWord2007Simulateur
        .WindowEngine
        .cacheDOM();

    CampusWord2007Simulateur
        .WindowEngine
        .bindEvents();
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
   PAGE CONTENT STATE
   ========================================================== */

CampusWord2007Simulateur.PageContentState = {

    pageContents: []

};






/* ==========================================================
   WINDOW STATE
   ========================================================== */

CampusWord2007Simulateur.WindowState = {

    maximized: false,

    minimized: false

};












/* ==========================================================
   INITIALIZE PAGE CONTENT
   ========================================================== */

CampusWord2007Simulateur
    .PageContentState
    .pageContents[0] = "";







/* ==========================================================
   GET PAGE CONTENT
   ========================================================== */

CampusWord2007Simulateur
    .PageContentState
    .getPageContent =
function(pageNumber){

 return CampusWord2007Simulateur
        .PageContentState
        .pageContents[
            pageNumber - 1
        ] || "";
};



/* ==========================================================
   SET PAGE CONTENT
   ========================================================== */

CampusWord2007Simulateur
    .PageContentState
    .setPageContent =
function(
    pageNumber,
    content
){

    CampusWord2007Simulateur
        .PageContentState
        .pageContents[
            pageNumber - 1
        ] = content;
};









/* ==========================================================
   GET PAGE CONTENT COUNT
   ========================================================== */

CampusWord2007Simulateur
    .PageContentState
    .getPageCount =
function(){

    return CampusWord2007Simulateur
            .PageContentState
            .pageContents
            .length;
};








/* ==========================================================
   GET ACTIVE PAGE NUMBER
   ========================================================== */

CampusWord2007Simulateur
    .DocumentEngine
    .getActivePageNumber =
function(){

    const activePage =

        CampusWord2007Simulateur
            .DocumentState
            .activePage;

    if(!activePage){
        return 1;
    }

    return Number(

        activePage.getAttribute(
            "data-page-number"
        )

    ) || 1;
};






/* ==========================================================
   GET ACTIVE PAGE NUMBER
   ========================================================== */

CampusWord2007Simulateur
    .DocumentEngine
    .getActivePageNumber =
function(){

    const activePage =

        CampusWord2007Simulateur
            .DocumentState
            .activePage;

    if(!activePage){
        return 1;
    }

    return Number(

        activePage.getAttribute(
            "data-page-number"
        )

    ) || 1;
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
   CREATE NEXT PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageEngine
    .createNextPage =
function(){

    const page =

        CampusWord2007Simulateur
            .PageEngine
            .createPage();

    if(!page){
        return null;
    }

    CampusWord2007Simulateur
        .PageContentState
        .pageContents.push(
            ""
        );

    CampusWord2007Simulateur
        .StatusBarEngine
        .updatePageDisplay();

    return page;
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
   GET LAST PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageEngine
    .getLastPage =
function(){

    const pages =

        CampusWord2007Simulateur
            .DocumentState
            .pages;

    if(
        pages.length === 0
    ){
        return null;
    }

    return pages[
        pages.length - 1
    ];
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
   GET WRITABLE AREA
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getWritableArea =
function(){

    const layoutState =

        CampusWord2007Simulateur
            .LayoutState;

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
   KEYBOARD STATE
   ========================================================== */

CampusWord2007Simulateur.KeyboardState = {

    initialized: false,

    lastKeyDown: null,

    lastKeyUp: null,

    lastInputData: null,

    isComposing: false

};






/* ==========================================================
   TEXT STATE
   ========================================================== */

CampusWord2007Simulateur.TextState = {

    content: "",

    characterCount: 0,

    wordCount: 0

};







/* ==========================================================
   FORMAT STATE
   ========================================================== */

CampusWord2007Simulateur.FormatState = {

    bold: false,

    italic: false,

    underline: false,

    strikeThrough: false,

    subscript: false,

    superscript: false,

    fontFamily: "Calibri",

    fontSize: 12,

    highlightColor: null,

    fontColor: "#000000"

};










/* ==========================================================
   MOBILE INPUT STATE
   ========================================================== */

CampusWord2007Simulateur.MobileInputState = {

    initialized: false,

    element: null,

    focused: false

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

    const activePage =

        CampusWord2007Simulateur
            .PageEngine
            .getPage(
                caretState.activePage
            );

    if(activePage){

        const caretLayer =

            activePage.querySelector(
                ".page-caret-layer"
            );

        if(
            caretLayer &&
            caret.parentNode !==
            caretLayer
        ){

            caretLayer.appendChild(
                caret
            );
        }
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









/* ==========================================================
   PHASE 5
   KEYBOARD SYSTEM
   KEYBOARD CAPTURE
   ========================================================== */

/* ==========================================================
   KEYDOWN
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .handleKeyDown =
function(event){

    const keyboardState =

        CampusWord2007Simulateur
            .KeyboardState;

    keyboardState.lastKeyDown =
        event.key;

CampusWord2007Simulateur
    .KeyboardEngine
    .processTextInput(
        event
    );

CampusWord2007Simulateur
    .KeyboardEngine
    .processBackspace(
        event
    );

CampusWord2007Simulateur
    .KeyboardEngine
    .processEnter(
        event
 
    );

   CampusWord2007Simulateur
    .KeyboardEngine
    .processArrowKeys(
        event
    );
};



/* ==========================================================
   KEYUP
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .handleKeyUp =
function(event){

    const keyboardState =

        CampusWord2007Simulateur
            .KeyboardState;

    keyboardState.lastKeyUp =
        event.key;
};





/* ==========================================================
   BEFORE INPUT
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .handleBeforeInput =
function(event){

    const keyboardState =

        CampusWord2007Simulateur
            .KeyboardState;

    keyboardState.lastInputData =
        event.data || null;
};





/* ==========================================================
   COMPOSITION START
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .handleCompositionStart =
function(){

    CampusWord2007Simulateur
        .KeyboardState
        .isComposing = true;
};






/* ==========================================================
   COMPOSITION END
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .handleCompositionEnd =
function(){

    CampusWord2007Simulateur
        .KeyboardState
        .isComposing = false;
};







/* ==========================================================
   INITIALIZE KEYBOARD
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .initialize =
function(){

    const keyboardState =

        CampusWord2007Simulateur
            .KeyboardState;

    if(
        keyboardState.initialized
    ){
        return;
    }

    document.addEventListener(
        "keydown",
        CampusWord2007Simulateur
            .KeyboardEngine
            .handleKeyDown
    );

    document.addEventListener(
        "keyup",
        CampusWord2007Simulateur
            .KeyboardEngine
            .handleKeyUp
    );

    document.addEventListener(
        "beforeinput",
        CampusWord2007Simulateur
            .KeyboardEngine
            .handleBeforeInput
    );

    document.addEventListener(
        "compositionstart",
        CampusWord2007Simulateur
            .KeyboardEngine
            .handleCompositionStart
    );

    document.addEventListener(
        "compositionend",
        CampusWord2007Simulateur
            .KeyboardEngine
            .handleCompositionEnd
    );

    keyboardState.initialized =
        true;
};


















/* ==========================================================
   INSERT CHARACTER (CLEAN MULTI-PAGE + FORMATTING SAFE)
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .insertCharacter =
function(character){

    if (typeof character !== "string" || character.length === 0) {
        return;
    }

    const activePage =
        CampusWord2007Simulateur.CaretState.activePage;

    const PageContentState =
        CampusWord2007Simulateur.PageContentState;

    const currentContent =
        PageContentState.getPageContent(activePage) || "";

    // 🔥 SAFE FORMAT WRAPPER (NO BREAK IF MISSING)
    let formattedCharacter = character;

    if (
        CampusWord2007Simulateur.TextEngine &&
        CampusWord2007Simulateur.TextEngine.wrapCharacter
    ){
        formattedCharacter =
            CampusWord2007Simulateur.TextEngine.wrapCharacter(character);
    }

    const newContent =
        currentContent + formattedCharacter;

    PageContentState.setPageContent(activePage, newContent);

    // update stats only (NO TextState.content dependency)
    CampusWord2007Simulateur.TextEngine.updateCharacterCount();
    CampusWord2007Simulateur.TextEngine.updateWordCount();

    // render safely
    if (CampusWord2007Simulateur.TextEngine.renderText){
        CampusWord2007Simulateur.TextEngine.renderText();
    }

    // pagination safe call
    if (CampusWord2007Simulateur.PaginationEngine){
        CampusWord2007Simulateur.PaginationEngine.createNextPageIfNeeded();
    }

    // caret update safe
    if (CampusWord2007Simulateur.TextEngine.updateCaretPosition){
        CampusWord2007Simulateur.TextEngine.updateCaretPosition();
    }
};












/* ==========================================================
   UPDATE CHARACTER COUNT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .updateCharacterCount =
function(){

    const PageContentState =
        CampusWord2007Simulateur.PageContentState;

    const caretState =
        CampusWord2007Simulateur.CaretState;

    const activePage =
        caretState.activePage;

    let content =
        PageContentState.getPageContent(activePage);

    if (typeof content !== "string") {
        content = "";
    }

    const textState =
        CampusWord2007Simulateur.TextState;

    textState.characterCount =
        content.length;

    return textState.characterCount;
};






/* ==========================================================
   UPDATE WORD COUNT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .updateWordCount =
function(){

    const PageContentState =
        CampusWord2007Simulateur.PageContentState;

    const caretState =
        CampusWord2007Simulateur.CaretState;

    const activePage =
        caretState.activePage;

    let content =
        PageContentState.getPageContent(activePage);

    if (typeof content !== "string") {
        content = "";
    }

    const trimmed =
        content.trim();

    const textState =
        CampusWord2007Simulateur.TextState;

    if (trimmed.length === 0) {

        textState.wordCount = 0;

        return 0;
    }

    const words =
        trimmed.split(/\s+/);

    textState.wordCount =
        words.length;

    return textState.wordCount;
};










/* ==========================================================
   REMOVE CHARACTER (CLEAN MULTI-PAGE SYSTEM)
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .removeCharacter =
function(){

    const activePage =
        CampusWord2007Simulateur.CaretState.activePage;

    const PageContentState =
        CampusWord2007Simulateur.PageContentState;

    let content =
        PageContentState.getPageContent(activePage) || "";

    if (content.length === 0) {
        return;
    }

    const newContent =
        content.slice(0, -1);

    PageContentState.setPageContent(activePage, newContent);

    CampusWord2007Simulateur.TextEngine.updateCharacterCount();
    CampusWord2007Simulateur.TextEngine.updateWordCount();

    CampusWord2007Simulateur.TextEngine.renderText();
    CampusWord2007Simulateur.TextEngine.updateCaretPosition();
};







/* ==========================================================
   PROCESS TEXT INPUT
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .processTextInput =
function(event){

    if(
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
    ){
        return;
    }

    if(
        typeof event.key !==
        "string"
    ){
        return;
    }

    if(
        event.key.length !== 1
    ){
        return;
    }

    CampusWord2007Simulateur
        .TextEngine
        .insertCharacter(
            event.key
        );
};












 /* ==========================================================
   PROCESS BACKSPACE (CLEAN & SAFE)
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .processBackspace =
function(event){

    if (
        event.key !== "Backspace"
    ){
        return;
    }

    // SAFETY: ignore if composing text (IME support)
    if (
        CampusWord2007Simulateur.KeyboardState &&
        CampusWord2007Simulateur.KeyboardState.isComposing
    ){
        return;
    }

    event.preventDefault();

    // SAFETY: ensure TextEngine exists
    if (
        !CampusWord2007Simulateur.TextEngine ||
        !CampusWord2007Simulateur.TextEngine.removeCharacter
    ){
        return;
    }

    CampusWord2007Simulateur
        .TextEngine
        .removeCharacter();
};





/* ==========================================================
   PROCESS ENTER
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .processEnter =
function(event){

    if(
        event.key !==
        "Enter"
    ){
        return;
    }

    event.preventDefault();

    CampusWord2007Simulateur
        .TextEngine
        .insertNewLine();
};






/* ==========================================================
   PROCESS ARROW KEYS
   ========================================================== */

CampusWord2007Simulateur
    .KeyboardEngine
    .processArrowKeys =
function(event){

    const caretState =
        CampusWord2007Simulateur
            .CaretState;

    switch(event.key){

        case "ArrowLeft":

            event.preventDefault();

            CampusWord2007Simulateur
                .CaretEngine
                .moveCaret(
                    caretState.x - 10,
                    caretState.y
                );

            break;

        case "ArrowRight":

            event.preventDefault();

            CampusWord2007Simulateur
                .CaretEngine
                .moveCaret(
                    caretState.x + 10,
                    caretState.y
                );

            break;

        case "ArrowUp":

            event.preventDefault();

            CampusWord2007Simulateur
                .CaretEngine
                .moveCaret(
                    caretState.x,
                    caretState.y - 20
                );

            break;

        case "ArrowDown":

            event.preventDefault();

            CampusWord2007Simulateur
                .CaretEngine
                .moveCaret(
                    caretState.x,
                    caretState.y + 20
                );

            break;
    }
};







/* ==========================================================
   GET TEXT CONTENT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .getContent =
function(){

    return  CampusWord2007Simulateur
            .TextState
            .content;
};









/* ==========================================================
   GET CHARACTER COUNT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .getCharacterCount =
function(){

    return CampusWord2007Simulateur
            .TextState
            .characterCount;
};







/* ==========================================================
   GET WORD COUNT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .getWordCount =
function(){

    return

        CampusWord2007Simulateur
            .TextState
            .wordCount;
};























/* ==========================================================
   TEXT ENGINE
   RENDER TEXT
   ========================================================= */



CampusWord2007Simulateur
    .TextEngine
    .renderText =
function(){

    const pageCount =
        CampusWord2007Simulateur
            .PageEngine
            .getPageCount();

    for(
        let pageNumber = 1;
        pageNumber <= pageCount;
        pageNumber++
    ){

        const page =
            CampusWord2007Simulateur
                .PageEngine
                .getPage(
                    pageNumber
                );

        if(!page){
            continue;
        }

        const textLayer =
            page.querySelector(
                ".page-text-layer"
            );

        if(!textLayer){
            continue;
        }

        const pageContent =
            CampusWord2007Simulateur
                .PageContentState
                .getPageContent(
                    pageNumber
                ) || "";

        // ======================================================
        // RESTORED ORIGINAL BEHAVIOR (NO LOGIC CHANGE)
        // ======================================================
        textLayer.textContent =
            pageContent;
    }
};












/* ==========================================================
   UPDATE CARET FROM TEXT
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .updateCaretPosition =
function(){

    const page =
        CampusWord2007Simulateur
            .PageEngine
            .getPage(

                CampusWord2007Simulateur
                    .CaretState
                    .activePage

            );

    if(!page){
        return;
    }

    const textLayer =
        page.querySelector(
            ".page-text-layer"
        );

    if(!textLayer){
        return;
    }

    const textNode =
        textLayer.firstChild;

    if(!textNode){

        CampusWord2007Simulateur
            .CaretEngine
            .moveCaret(
                0,
                0
            );

        return;
    }

    const range =
        document.createRange();

    range.setStart(
        textNode,
        textNode.length
    );

    range.setEnd(
        textNode,
        textNode.length
    );

    const rect =
        range.getBoundingClientRect();

    const layerRect =
        textLayer.getBoundingClientRect();

    CampusWord2007Simulateur
        .CaretEngine
        .moveCaret(
            rect.left -
            layerRect.left,

            rect.top -
            layerRect.top
        );
};









/* ==========================================================
   CREATE HIDDEN INPUT
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .createHiddenInput =
function(){

    const mobileState =

        CampusWord2007Simulateur
            .MobileInputState;

    if(
        mobileState.element
    ){
        return;
    }

    const input =

        document.createElement(
            "textarea"
        );

    input.setAttribute(
        "autocomplete",
        "off"
    );

    input.setAttribute(
        "autocorrect",
        "off"
    );

    input.setAttribute(
        "autocapitalize",
        "off"
    );

    input.setAttribute(
        "spellcheck",
        "false"
    );

    input.style.position =
        "fixed";

    input.style.left =
        "-9999px";

    input.style.top =
        "-9999px";

    input.style.width =
        "1px";

    input.style.height =
        "1px";

    input.style.opacity =
        "0";

    input.style.pointerEvents =
        "none";

    document.body.appendChild(
        input
    );

    mobileState.element =
        input;
};










/* ==========================================================
   FOCUS INPUT
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .focusInput =
function(){

    const mobileState =

        CampusWord2007Simulateur
            .MobileInputState;

    const input =
        mobileState.element;

    if(!input){
        return;
    }

    input.focus();

    mobileState.focused =
        true;
};













/* ==========================================================
   BLUR INPUT
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .blurInput =
function(){

    const mobileState =

        CampusWord2007Simulateur
            .MobileInputState;

    const input =
        mobileState.element;

    if(!input){
        return;
    }

    input.blur();

    mobileState.focused =
        false;
};










/* ==========================================================
   BIND TOUCH EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .bindTouchEvents =
function(){

    const DOM =

        CampusWord2007Simulateur
            .DOM;

    if(
        !DOM.documentViewport
    ){
        return;
    }

    DOM.documentViewport
        .addEventListener(

            "touchstart",

            function(){

                CampusWord2007Simulateur
                    .MobileInputEngine
                    .focusInput();

            },

            {
                passive: true
            }

        );
};








/* ==========================================================
   WINDOW ENGINE
   BIND EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .bindEvents =
function(){

    const DOM =
        CampusWord2007Simulateur.DOM;

    if(
    DOM.windowMinimize
){

    DOM.windowMinimize
        .addEventListener(

            "click",

            function(){

                CampusWord2007Simulateur
                    .WindowEngine
                    .toggleMinimize();

            }

        );
}

    if(
        DOM.windowMaximize
    ){

        DOM.windowMaximize
            .addEventListener(

                "click",

                function(){

                    CampusWord2007Simulateur
                        .WindowEngine
                        .toggleMaximize();

                }

            );
    }

    if(
        DOM.windowClose
    ){

        DOM.windowClose
            .addEventListener(

                "click",

                function(){

                    CampusWord2007Simulateur
                        .WindowEngine
                        .closeWindow();

                }

            );
    }



    if(
        DOM.officeButton
    ){

        DOM.officeButton
            .addEventListener(

                "click",

                function(){

                    CampusWord2007Simulateur
                        .toggleOfficeMenu();

                }

            );
    }


};





/* ==========================================================
   INITIALIZE MOBILE INPUT
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .initialize =
function(){

    const mobileState =

        CampusWord2007Simulateur
            .MobileInputState;

    if(
        mobileState.initialized
    ){
        return;
    }

    CampusWord2007Simulateur
        .MobileInputEngine
        .createHiddenInput();

    CampusWord2007Simulateur
        .MobileInputEngine
        .bindTouchEvents();


CampusWord2007Simulateur
    .MobileInputEngine
    .bindInputEvents();
    mobileState.initialized =
        true;
};









/* ==========================================================
   BIND INPUT EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .MobileInputEngine
    .bindInputEvents =
function(){

    const input =

        CampusWord2007Simulateur
            .MobileInputState
            .element;

    if(!input){
        return;
    }

    input.addEventListener(

        "input",

        function(){

            const value =
                input.value;

            if(
                value.length === 0
            ){
                return;
            }

            for(
                const character
                of value
            ){

                CampusWord2007Simulateur
                    .TextEngine
                    .insertCharacter(
                        character
                    );
            }

            input.value = "";

        }

    );
};








/* ==========================================================
   INSERT NEW LINE (CLEAN MULTI-PAGE SYSTEM)
   ========================================================== */

CampusWord2007Simulateur
    .TextEngine
    .insertNewLine =
function(){

    const activePage =
        CampusWord2007Simulateur.CaretState.activePage;

    const PageContentState =
        CampusWord2007Simulateur.PageContentState;

    const currentContent =
        PageContentState.getPageContent(activePage) || "";

    const newContent =
        currentContent + "\n";

    PageContentState.setPageContent(activePage, newContent);

    CampusWord2007Simulateur.TextEngine.updateCharacterCount();
    CampusWord2007Simulateur.TextEngine.updateWordCount();

    CampusWord2007Simulateur.TextEngine.renderText();

    CampusWord2007Simulateur.TextEngine.updateCaretPosition();

    CampusWord2007Simulateur.PaginationEngine.createNextPageIfNeeded();
};



















/* ==========================================================
   PAGINATION ENGINE
   CHECK PAGE OVERFLOW
   ========================================================== */

CampusWord2007Simulateur
    .PaginationEngine
    .isPageOverflow =
function(pageNumber){

    const page =

        CampusWord2007Simulateur
            .PageEngine
            .getPage(
                pageNumber
            );

    if(!page){
        return false;
    }

    const textLayer =

        page.querySelector(
            ".page-text-layer"
        );

    if(!textLayer){
        return false;
    }

    const writableHeight =

        CampusWord2007Simulateur
            .LayoutState
            .writableHeight;

    return (
        textLayer.scrollHeight >
        writableHeight
    );
};







 /* ==========================================================
   PAGINATION ENGINE
   CREATE NEXT PAGE IF NEEDED
   ========================================================== */

CampusWord2007Simulateur
    .PaginationEngine
    .createNextPageIfNeeded =
function(){

    const activePage =
        CampusWord2007Simulateur
            .CaretState
            .activePage;

    const overflow =
        CampusWord2007Simulateur
            .PaginationEngine
            .isPageOverflow(
                activePage
            );

    if(!overflow){
        return;
    }

    const nextPageNumber =
        activePage + 1;

    let nextPage =
        CampusWord2007Simulateur
            .PageEngine
            .getPage(
                nextPageNumber
            );

    if(!nextPage){

        nextPage =
            CampusWord2007Simulateur
                .PageEngine
                .createNextPage();
    }

    // 🔥 FIX IMPORTANT: UPDATE CARET STATE
    CampusWord2007Simulateur.CaretState.activePage =
        nextPageNumber;

    // 🔥 FIX IMPORTANT: ATTACH CARET TO NEW PAGE LAYER
    CampusWord2007Simulateur
        .CaretEngine
        .setPage(nextPageNumber);

    // 🔥 FIX IMPORTANT: RESET CARET POSITION
    CampusWord2007Simulateur
        .CaretEngine
        .moveCaret(
            0,
            0
        );
};







/* ==========================================================
   PAGINATION ENGINE
   MOVE CARET TO NEXT PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PaginationEngine
    .moveCaretToNextPage =
function(){

    console.log(
        "[PAGINATION] moveCaretToNextPage() called"
    );

    const activePage =
        CampusWord2007Simulateur
            .CaretState
            .activePage;

    console.log(
        "[PAGINATION] active page:",
        activePage
    );

    const nextPageNumber =
        activePage + 1;

    const nextPage =
        CampusWord2007Simulateur
            .PageEngine
            .getPage(
                nextPageNumber
            );

    console.log(
        "[PAGINATION] next page:",
        nextPageNumber,
        nextPage
    );

    if(!nextPage){

        console.log(
            "[PAGINATION] next page NOT FOUND"
        );

        return;
    }

    // 🔥 FIX 1: UPDATE STATE
    CampusWord2007Simulateur.CaretState.activePage =
        nextPageNumber;

    console.log(
        "[PAGINATION] activePage changed to:",
        CampusWord2007Simulateur
            .CaretState
            .activePage
    );

    // 🔥 FIX 2: ATTACH CARET TO NEW PAGE LAYER (IMPORTANT)
    CampusWord2007Simulateur
        .CaretEngine
        .setPage(nextPageNumber);

    // 🔥 FIX 3: RESET POSITION ON NEW PAGE
    CampusWord2007Simulateur
        .CaretEngine
        .moveCaret(
            0,
            0
        );

    console.log(
        "[PAGINATION] moveCaret(0,0) executed"
    );
};









 /* ==========================================================
   WINDOW ENGINE
   TOGGLE MAXIMIZE
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .toggleMaximize =
function(){

    const state =
        CampusWord2007Simulateur
            .WindowState;

    const DOM =
        CampusWord2007Simulateur.DOM;

    const app =
        DOM.wordApp;

    if(!app){
        return;
    }

    // 🔥 SAFE INIT (pa kraze state system la)
    if(!state){
        CampusWord2007Simulateur.WindowState = {
            maximized: false
        };
    }

    // 🔥 ENSURE BOOLEAN SAFE VALUE
    if(typeof state.maximized !== "boolean"){
        state.maximized = false;
    }

    // 🔥 MAXIMIZE ACTION
    if(!state.maximized){

        // save original style (safe restore future-proof)
        state.previousStyle = {
            width: app.style.width,
            height: app.style.height,
            top: app.style.top,
            left: app.style.left,
            position: app.style.position,
            transform: app.style.transform
        };

        app.classList.add("window-maximized");

        state.maximized = true;
    }

    // 🔥 RESTORE ACTION
    else{

        app.classList.remove("window-maximized");

        // restore previous inline styles if exist
        if(state.previousStyle){

            app.style.width = state.previousStyle.width || "";
            app.style.height = state.previousStyle.height || "";
            app.style.top = state.previousStyle.top || "";
            app.style.left = state.previousStyle.left || "";
            app.style.position = state.previousStyle.position || "";
            app.style.transform = state.previousStyle.transform || "";
        }

        state.maximized = false;
    }

    // 🔥 ICON UPDATE (SAFE DOM CHECK)
    if(DOM.windowMaximize){

        DOM.windowMaximize.innerText =
            state.maximized ? "❐" : "□";
    }
};










/* ==========================================================
   WINDOW ENGINE
   CLOSE WINDOW
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .closeWindow =
function(){

    window.location.href =
        "https://fondationbackupspirituel.com/campusloginnumeriques";
};








/* ==========================================================
   WINDOW ENGINE
   TOGGLE MINIMIZE
   ========================================================== */

CampusWord2007Simulateur
    .WindowEngine
    .toggleMinimize =
function(){

    const state =
        CampusWord2007Simulateur
            .WindowState;

    const app =
        CampusWord2007Simulateur
            .DOM
            .wordApp;

    if(!app){
        return;
    }

    if(typeof state.minimized === "undefined"){
        state.minimized = false;
    }

    if(!state.minimized){

        app.classList.add(
            "window-minimized"
        );

        state.minimized = true;
    }
    else{

        app.classList.remove(
            "window-minimized"
        );

        state.minimized = false;
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
        strike: false,
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
        if(s.strike) style += "text-decoration:line-through;";

        style += "font-family:" + s.fontFamily + ";";
        style += "font-size:" + s.fontSize + "px;";
        style += "color:" + s.color + ";";

        if(s.highlight !== "transparent"){
            style += "background:" + s.highlight + ";";
        }

        return `<span style="${style}">${text}</span>`;
    }
};

