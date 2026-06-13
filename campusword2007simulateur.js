
/* ==========================================================
   A1 — CAMPUSWORD2007SIMULATEUR ROOT
   SYSTEM FOUNDATION ROOT OBJECT
   ========================================================== */

window.CampusWord2007Simulateur = {

    version: "1.0.0",

    initialized: false,

    booting: false,

    ready: false,

    destroyed: false,

    buildName: "Campus Word 2007 Simulateur",

    state: {},

    config: {},

    registry: {}
};





/* ==========================================================
   A1.1 — ROOT UTILITIES
   ========================================================== */

CampusWord2007Simulateur.isReady = function () {

    return this.ready === true;
};

CampusWord2007Simulateur.isInitialized = function () {

    return this.initialized === true;
};

CampusWord2007Simulateur.markBooting = function () {

    this.booting = true;
};

CampusWord2007Simulateur.markReady = function () {

    this.booting = false;

    this.ready = true;

    this.initialized = true;
};

CampusWord2007Simulateur.markDestroyed = function () {

    this.destroyed = true;

    this.ready = false;
};






/* ==========================================================
   A1.2 — SYSTEM INFORMATION
   ========================================================== */

CampusWord2007Simulator.SystemInformation = {

    getVersion() {

        return CampusWord2007Simulator
            .version;
    },

    getBuildName() {

        return CampusWord2007Simulator
            .buildName;
    },

    isReady() {

        return CampusWord2007Simulator
            .ready;
    },

    isBooting() {

        return CampusWord2007Simulator
            .booting;
    }
};






/* ==========================================================
   A2 — GLOBAL STATE
   CENTRALIZED STATE TREE
   ========================================================== */

CampusWord2007Simulator.state = {

    application: {

        initialized: false,

        booting: false,

        ready: false,

        destroyed: false
    },

    editor: {

        focused: false,

        textContent: "",

        caretPosition: 0,

        selectionStart: 0,

        selectionEnd: 0,

        activePage: 1,

        totalPages: 1
    },

    caret: {

        visible: true,

        blinking: false,

        x: 0,

        y: 0,

        height: 18,

        preferredColumn: 0
    },

    keyboard: {

        initialized: false,

        lastKey: null,

        ctrlKey: false,

        shiftKey: false,

        altKey: false
    },

    mouse: {

        x: 0,

        y: 0,

        isDown: false,

        leftButton: false,

        middleButton: false,

        rightButton: false,

        lastClickTime: 0,

        clickCount: 0
    },

    pointer: {

        startX: 0,

        startY: 0,

        currentX: 0,

        currentY: 0,

        deltaX: 0,

        deltaY: 0,

        dragging: false
    },

    touch: {

        active: false,

        x: 0,

        y: 0,

        fingerCount: 0
    },

    focus: {

        activeElement: null,

        focusedArea: null,

        lastFocusedArea: null
    },

    mobileKeyboard: {

        bridge: null,

        visible: false
    },

    page: {

        currentPage: 1,

        totalPages: 1,

        pageWidth: 816,

        pageHeight: 1056,

        contentHeight: 0,

        pageOffsetY: 0,

        pageTop: 0,

        pageBottom: 0
    },

    margins: {

        left: 96,

        right: 96,

        top: 96,

        bottom: 96
    },

    status: {

        wordCount: 0,

        characterCount: 0,

        zoomLevel: 100,

        viewMode: "print"
    },

    api: {

        initialized: false,

        configLoaded: false,

        statusLoaded: false,

        sessionLoaded: false,

        health: "unknown",

        lastCheck: null
    },

    session: {

        sessionId: null,

        userId: null,

        role: null,

        authenticated: false,

        loaded: false
    },

    layers: {

        initialized: false,

        simulation: false,

        validation: false,

        missions: false,

        events: false
    },

    input: {

        initialized: false,

        mouseReady: false,

        touchReady: false,

        cursorReady: false,

        focusReady: false,

        pointerReady: false,

        editorReady: false,

        caretReady: false,

        caretMovementReady: false,

        keyboardReady: false,

        textInputReady: false,

        renderReady: false,

        mobileKeyboardReady: false
    }
};







/* ==========================================================
   A3 — CONFIG MANAGER
   CENTRAL APPLICATION CONFIGURATION
   ========================================================== */

CampusWord2007Simulator.Config = {

    values: {

        application: {

            name:
                "Campus Word 2007 Simulator",

            version:
                "1.0.0"
        },

        document: {

            pageWidth: 816,

            pageHeight: 1056,

            minPageCount: 1
        },

        margins: {

            left: 96,

            right: 96,

            top: 96,

            bottom: 96,

            minimum: 20,

            maximum: 250
        },

        caret: {

            width: 1,

            height: 18,

            blinkInterval: 500,

            defaultX: 0,

            defaultY: 0
        },

        ruler: {

            horizontalHeight: 24,

            verticalWidth: 24
        },

        scrollbar: {

            dragMultiplier: 5
        },

        keyboard: {

            enableShortcuts: true
        },

        render: {

            fontFamily:
                '"Times New Roman", serif',

            fontSize:
                "12pt",

            lineHeight:
                18
        },

        zoom: {

            defaultValue: 100,

            minimum: 10,

            maximum: 500
        },

        api: {

            healthCheckInterval:
                60000
        }
    }
};




