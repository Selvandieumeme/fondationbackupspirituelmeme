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



       
