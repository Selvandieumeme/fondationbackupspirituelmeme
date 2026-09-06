
/* =========================================================
   FOBAS ETHICAL HACKING SIMULATION
   PREMIUM CYBERSECURITY SIMULATION CORE ENGINE
   CORE ENGINE v2.0
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       GLOBAL CONFIGURATION
    ====================================================== */

    const STORAGE_KEY =
        "FOBAS_ETHICAL_HACKING_SIMULATION_STATE";


    const VERSION =
        "2.0.0";


    const DEFAULT_LAB =
        "dashboard";


    /* =====================================================
       LAB DEFINITIONS
    ====================================================== */

    const LABS = {

        dashboard: {
            id: "dashboard",
            name: "Dashboard",
            type: "dashboard"
        },

        wifi: {
            id: "wifi",
            name: "Wi-Fi Security",
            type: "laboratory"
        },

        cameraEspion: {
            id: "cameraEspion",
            name: "Camera Espion",
            type: "laboratory"
        },

        cameraSurveillance: {
            id: "cameraSurveillance",
            name: "Camera Surveillance",
            type: "laboratory"
        }

    };


    /* =====================================================
       DEFAULT SIMULATION STATE
    ====================================================== */

    function createDefaultState() {

        const now =
            new Date().toISOString();


        return {

            version: VERSION,

            initialized: true,

            currentLab:
                DEFAULT_LAB,

            simulationStatus:
                "READY",

            started:
                false,

            completed:
                false,

            score:
                0,

            currentMissionId:
                null,

            currentActionId:
                null,

            actions: {},

            missions: {},

            labStates: {

                wifi: {

                    initialized: false,

                    active: false,

                    progress: 0

                },


                cameraEspion: {

                    initialized: false,

                    active: false,

                    progress: 0

                },


                cameraSurveillance: {

                    initialized: false,

                    active: false,

                    progress: 0

                }

            },

            metadata: {

                createdAt:
                    now,

                updatedAt:
                    now

            }

        };

    }


    /* =====================================================
       CENTRAL STATE
    ====================================================== */

    let simulationState =
        createDefaultState();


    let initialized =
        false;


    /* =====================================================
       STATE NORMALIZATION
       Protects older saved states.
    ====================================================== */

    function normalizeState(state) {

        const defaults =
            createDefaultState();


        if (
            !state ||
            typeof state !== "object"
        ) {

            return defaults;

        }


        const normalized = {

            ...defaults,

            ...state

        };


        normalized.actions =
            state.actions || {};


        normalized.missions =
            state.missions || {};


        normalized.labStates =
            state.labStates || {};


        Object.keys(
            defaults.labStates
        ).forEach(function (labId) {

            normalized.labStates[labId] = {

                ...defaults.labStates[labId],

                ...(state.labStates[labId] || {})

            };

        });


        normalized.metadata = {

            ...defaults.metadata,

            ...(state.metadata || {})

        };


        normalized.version =
            VERSION;


        normalized.initialized =
            true;


        return normalized;

    }


    /* =====================================================
       STATE ENGINE
    ====================================================== */

    const StateEngine = {


        getState: function () {

            return simulationState;

        },


        getSnapshot: function () {

            return JSON.parse(
                JSON.stringify(
                    simulationState
                )
            );

        },


        setState: function (newState) {

            if (
                !newState ||
                typeof newState !== "object"
            ) {

                return false;

            }


            simulationState =
                normalizeState(newState);


            touchState();


            this.render();


            return true;

        },


        update: function (updates) {

            if (
                !updates ||
                typeof updates !== "object"
            ) {

                return false;

            }


            Object.keys(updates).forEach(
                function (key) {

                    simulationState[key] =
                        updates[key];

                }
            );


            touchState();


            this.render();


            return true;

        },


        render: function () {

            UIEngine.updateStatus();

            UIEngine.updateStateIndicator();

            UIEngine.updateNavigationState();

            UIEngine.updateDocumentState();

        }

    };


    /* =====================================================
       STATE TIMESTAMP
    ====================================================== */

    function touchState() {

        if (
            !simulationState.metadata
        ) {

            simulationState.metadata = {};

        }


        simulationState.metadata.updatedAt =
            new Date().toISOString();

    }


    /* =====================================================
       NAVIGATION ENGINE
    ====================================================== */

    const NavigationEngine = {


        currentScreen:
            DEFAULT_LAB,


        goTo: function (labId) {

            if (
                !LABS[labId]
            ) {

                console.warn(
                    "Unknown laboratory:",
                    labId
                );

                return false;

            }


            this.currentScreen =
                labId;


            simulationState.currentLab =
                labId;


            Object.keys(LABS).forEach(
                function (id) {

                    const screen =
                        document.querySelector(
                            '[data-screen="' +
                            id +
                            '"]'
                        );


                    const button =
                        document.querySelector(
                            '[data-lab="' +
                            id +
                            '"]'
                        );


                    if (screen) {

                        screen.classList.toggle(
                            "activeScreen",
                            id === labId
                        );

                    }


                    if (button) {

                        button.classList.toggle(
                            "active",
                            id === labId
                        );


                        if (
                            id === labId
                        ) {

                            button.setAttribute(
                                "aria-current",
                                "page"
                            );

                        } else {

                            button.removeAttribute(
                                "aria-current"
                            );

                        }

                    }

                }
            );


            LabEngine.activate(
                labId
            );


            touchState();


            StateEngine.render();


            return true;

        }

    };


    /* =====================================================
       ACTION ENGINE
    ====================================================== */

    const ActionEngine = {


        registry: {},


        register: function (action) {

            if (
                !action ||
                !action.id
            ) {

                return false;

            }


            this.registry[action.id] =
                action;


            if (
                !simulationState.actions[
                    action.id
                ]
            ) {

                simulationState.actions[
                    action.id
                ] = {

                    id:
                        action.id,

                    label:
                        action.label ||
                        action.id,

                    executed:
                        false,

                    count:
                        0,

                    lastExecutedAt:
                        null

                };

            }


            return true;

        },


        execute: function (
            actionId,
            payload
        ) {

            const action =
                this.registry[actionId];


            if (!action) {

                console.warn(
                    "Unknown simulation action:",
                    actionId
                );

                return false;

            }


            if (
                !simulationState.actions[
                    actionId
                ]
            ) {

                simulationState.actions[
                    actionId
                ] = {

                    id:
                        actionId,

                    label:
                        action.label ||
                        actionId,

                    executed:
                        false,

                    count:
                        0,

                    lastExecutedAt:
                        null

                };

            }


            const state =
                simulationState.actions[
                    actionId
                ];


            state.executed =
                true;


            state.count =
                Number(state.count || 0) + 1;


            state.lastExecutedAt =
                new Date().toISOString();


            simulationState.currentActionId =
                actionId;


            if (
                typeof action.handler ===
                "function"
            ) {

                try {

                    action.handler(
                        payload || {}
                    );

                } catch (error) {

                    console.error(
                        "Action handler failed:",
                        error
                    );

                }

            }


            MissionEngine.evaluateActions(
                actionId,
                payload || {}
            );


            touchState();


            StateEngine.render();


            return true;

        },


        hasExecuted: function (
            actionId
        ) {

            return !!(
                simulationState.actions[
                    actionId
                ] &&
                simulationState.actions[
                    actionId
                ].executed
            );

        },


        getAction: function (
            actionId
        ) {

            return this.registry[
                actionId
            ] || null;

        }

    };


    /* =====================================================
       MISSION ENGINE
    ====================================================== */

    const MissionEngine = {


        registry: {},


        register: function (mission) {

            if (
                !mission ||
                !mission.id
            ) {

                return false;

            }


            this.registry[
                mission.id
            ] = mission;


            if (
                !simulationState.missions[
                    mission.id
                ]
            ) {

                simulationState.missions[
                    mission.id
                ] = {

                    id:
                        mission.id,

                    started:
                        false,

                    completed:
                        false,

                    progress:
                        0,

                    progressSteps:
                        0,

                    validation:
                        {},

                    startedAt:
                        null,

                    completedAt:
                        null

                };

            } else {

                const missionState =
                    simulationState.missions[
                        mission.id
                    ];


                if (
                    typeof missionState.progressSteps !==
                    "number"
                ) {

                    missionState.progressSteps =
                        0;

                }


                missionState.validation =
                    missionState.validation || {};

            }


            return true;

        },


        start: function (
            missionId
        ) {

            const mission =
                this.registry[
                    missionId
                ];


            if (!mission) {

                return false;

            }


            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (!missionState) {

                return false;

            }


            missionState.started =
                true;


            missionState.completed =
                false;


            missionState.progress =
                0;


            missionState.progressSteps =
                0;


            missionState.validation =
                {};


            missionState.startedAt =
                new Date().toISOString();


            missionState.completedAt =
                null;


            simulationState.currentMissionId =
                missionId;


            simulationState.started =
                true;


            simulationState.completed =
                false;


            simulationState.simulationStatus =
                "MISSION_ACTIVE";


            touchState();


            StateEngine.render();


            return true;

        },


        evaluateActions: function (
            actionId,
            payload
        ) {

            const missionId =
                simulationState.currentMissionId;


            if (!missionId) {

                return false;

            }


            const mission =
                this.registry[
                    missionId
                ];


            if (!mission) {

                return false;

            }


            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (
                !missionState ||
                !missionState.started ||
                missionState.completed
            ) {

                return false;

            }


            return ValidationEngine.validate(
                mission,
                missionState,
                actionId,
                payload || {}
            );

        },


        complete: function (
            missionId
        ) {

            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (!missionState) {

                return false;

            }


            missionState.completed =
                true;


            missionState.progress =
                100;


            if (
                this.registry[missionId] &&
                Array.isArray(
                    this.registry[missionId].steps
                )
            ) {

                missionState.progressSteps =
                    this.registry[
                        missionId
                    ].steps.length;

            }


            missionState.completedAt =
                new Date().toISOString();


            simulationState.currentMissionId =
                null;


            simulationState.completed =
                true;


            simulationState.simulationStatus =
                "MISSION_COMPLETED";


            touchState();


            StateEngine.render();


            return true;

        },


        getMissionState: function (
            missionId
        ) {

            return simulationState.missions[
                missionId
            ] || null;

        },


        getMission: function (
            missionId
        ) {

            return this.registry[
                missionId
            ] || null;

        }

    };


    /* =====================================================
       VALIDATION ENGINE
    ====================================================== */

    const ValidationEngine = {


        validate: function (
            mission,
            missionState,
            actionId,
            payload
        ) {

            if (
                !mission ||
                !Array.isArray(
                    mission.steps
                )
            ) {

                return false;

            }


            const currentStepIndex =
                Number(
                    missionState.progressSteps || 0
                );


            const step =
                mission.steps[
                    currentStepIndex
                ];


            if (!step) {

                MissionEngine.complete(
                    mission.id
                );

                return true;

            }


            const expectedAction =
                step.actionId;


            if (
                expectedAction !==
                actionId
            ) {

                return false;

            }


            if (
                typeof step.validate ===
                "function"
            ) {

                let valid =
                    false;


                try {

                    valid =
                        !!step.validate(
                            payload,
                            simulationState
                        );

                } catch (error) {

                    console.error(
                        "Mission validation error:",
                        error
                    );


                    valid =
                        false;

                }


                if (!valid) {

                    return false;

                }

            }


            missionState.validation[
                step.id
            ] = {

                valid:
                    true,

                validatedAt:
                    new Date().toISOString()

            };


            missionState.progressSteps =
                currentStepIndex + 1;


            missionState.progress =
                Math.round(
                    (
                        missionState.progressSteps /
                        mission.steps.length
                    ) * 100
                );


            if (
                missionState.progressSteps >=
                mission.steps.length
            ) {

                MissionEngine.complete(
                    mission.id
                );

            } else {

                touchState();

                StateEngine.render();

            }


            return true;

        }

    };


    /* =====================================================
       LAB ENGINE
    ====================================================== */

    const LabEngine = {


        activate: function (
            labId
        ) {

            /*
             * Dashboard is not stored inside
             * labStates because it is not
             * a laboratory.
             */

            if (
                labId ===
                "dashboard"
            ) {

                Object.keys(
                    simulationState.labStates
                ).forEach(
                    function (id) {

                        simulationState.labStates[
                            id
                        ].active =
                            false;

                    }
                );


                this.renderLab(
                    "dashboard"
                );


                return true;

            }


            if (
                !simulationState.labStates[
                    labId
                ]
            ) {

                return false;

            }


            Object.keys(
                simulationState.labStates
            ).forEach(
                function (id) {

                    simulationState.labStates[
                        id
                    ].active =
                        false;

                }
            );


            simulationState.labStates[
                labId
            ].active =
                true;


            simulationState.labStates[
                labId
            ].initialized =
                true;


            this.renderLab(
                labId
            );


            return true;

        },


        renderLab: function (
            labId
        ) {

            if (
                labId ===
                "wifi"
            ) {

                renderWiFiLab();

                return;

            }


            if (
                labId ===
                "cameraEspion"
            ) {

                renderCameraEspionLab();

                return;

            }


            if (
                labId ===
                "cameraSurveillance"
            ) {

                renderCameraSurveillanceLab();

                return;

            }

        },


        getActiveLab: function () {

            if (
                simulationState.currentLab ===
                "dashboard"
            ) {

                return null;

            }


            return simulationState.currentLab;

        }

    };


    /* =====================================================
       SAVE ENGINE
    ====================================================== */

    const SaveEngine = {


        save: function () {

            try {

                touchState();


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        simulationState
                    )
                );


                UIEngine.notify(
                    "Simulation saved successfully.",
                    "success"
                );


                return true;

            } catch (error) {

                console.error(
                    "Save failed:",
                    error
                );


                UIEngine.notify(
                    "Unable to save simulation.",
                    "error"
                );


                return false;

            }

        },


        load: function () {

            try {

                const raw =
                    localStorage.getItem(
                        STORAGE_KEY
                    );


                if (!raw) {

                    UIEngine.notify(
                        "No saved simulation found.",
                        "warning"
                    );


                    return false;

                }


                const parsed =
                    JSON.parse(
                        raw
                    );


                if (
                    !parsed ||
                    typeof parsed !== "object"
                ) {

                    throw new Error(
                        "Invalid simulation state."
                    );

                }


                simulationState =
                    normalizeState(
                        parsed
                    );


                const targetLab =
                    LABS[
                        simulationState.currentLab
                    ]
                        ? simulationState.currentLab
                        : DEFAULT_LAB;


                NavigationEngine.goTo(
                    targetLab
                );


                UIEngine.notify(
                    "Simulation loaded successfully.",
                    "success"
                );


                return true;

            } catch (error) {

                console.error(
                    "Load failed:",
                    error
                );


                simulationState =
                    normalizeState(
                        simulationState
                    );


                UIEngine.notify(
                    "Unable to load simulation.",
                    "error"
                );


                return false;

            }

        },


        exists: function () {

            try {

                return !!localStorage.getItem(
                    STORAGE_KEY
                );

            } catch (error) {

                return false;

            }

        }

    };


    /* =====================================================
       RESET ENGINE
    ====================================================== */

    const ResetEngine = {


        reset: function () {

            const confirmed =
                window.confirm(
                    "Reset the complete FOBAS simulation?"
                );


            if (!confirmed) {

                return false;

            }


            simulationState =
                createDefaultState();


            localStorage.removeItem(
                STORAGE_KEY
            );


            NavigationEngine.goTo(
                DEFAULT_LAB
            );


            simulationState.simulationStatus =
                "READY";


            simulationState.started =
                false;


            simulationState.completed =
                false;


            touchState();


            StateEngine.render();


            UIEngine.notify(
                "Simulation reset successfully.",
                "success"
            );


            return true;

        }

    };


    /* =====================================================
       UI ENGINE
    ====================================================== */

    const UIEngine = {


        updateStatus: function () {

            const element =
                document.getElementById(
                    "simulationStatus"
                );


            if (!element) {

                return;

            }


            const status =
                simulationState.simulationStatus ||
                "READY";


            element.textContent =
                formatStatus(status);


            element.dataset.status =
                status.toLowerCase();


            element.setAttribute(
                "aria-label",
                "Simulation status: " +
                formatStatus(status)
            );

        },


        updateStateIndicator: function () {

            const element =
                document.getElementById(
                    "stateIndicator"
                );


            if (!element) {

                return;

            }


            element.textContent =
                formatStatus(
                    simulationState.simulationStatus
                );


            element.dataset.status =
                (
                    simulationState.simulationStatus ||
                    "ready"
                ).toLowerCase();

        },


        updateNavigationState: function () {

            const currentLab =
                simulationState.currentLab ||
                DEFAULT_LAB;


            document
                .querySelectorAll(
                    "[data-lab]"
                )
                .forEach(
                    function (button) {

                        const isActive =
                            button.dataset.lab ===
                            currentLab;


                        button.classList.toggle(
                            "active",
                            isActive
                        );


                        if (isActive) {

                            button.setAttribute(
                                "aria-current",
                                "page"
                            );

                        } else {

                            button.removeAttribute(
                                "aria-current"
                            );

                        }

                    }
                );

        },


        updateDocumentState: function () {

            if (
                !document.body
            ) {

                return;

            }


            document.body.dataset.simulationStatus =
                (
                    simulationState.simulationStatus ||
                    "ready"
                ).toLowerCase();


            document.body.dataset.currentLab =
                (
                    simulationState.currentLab ||
                    DEFAULT_LAB
                );

        },


        notify: function (
            message,
            type
        ) {

            /*
             * Lightweight notification system.
             * It creates a temporary notification
             * only when needed.
             */

            const existing =
                document.getElementById(
                    "fobasSimulationNotification"
                );


            if (existing) {

                existing.remove();

            }


            const notification =
                document.createElement(
                    "div"
                );


            notification.id =
                "fobasSimulationNotification";


            notification.className =
                "fobasSimulationNotification";


            notification.dataset.type =
                type || "info";


            notification.setAttribute(
                "role",
                "status"
            );


            notification.textContent =
                message;


            notification.style.position =
                "fixed";


            notification.style.right =
                "18px";


            notification.style.bottom =
                "84px";


            notification.style.zIndex =
                "9999";


            notification.style.maxWidth =
                "min(360px, calc(100vw - 36px))";


            notification.style.padding =
                "12px 16px";


            notification.style.border =
                "1px solid rgba(76, 201, 240, 0.30)";


            notification.style.borderRadius =
                "10px";


            notification.style.background =
                "rgba(7, 18, 31, 0.96)";


            notification.style.color =
                "#eaf8ff";


            notification.style.fontFamily =
                "inherit";


            notification.style.fontSize =
                "12px";


            notification.style.fontWeight =
                "700";


            notification.style.boxShadow =
                "0 14px 35px rgba(0,0,0,0.35)";


            notification.style.backdropFilter =
                "blur(14px)";


            notification.style.webkitBackdropFilter =
                "blur(14px)";


            notification.style.animation =
                "fobasNotificationIn 180ms ease";


            document.body.appendChild(
                notification
            );


            window.setTimeout(
                function () {

                    if (
                        notification &&
                        notification.parentNode
                    ) {

                        notification.style.opacity =
                            "0";

                        notification.style.transform =
                            "translateY(5px)";

                        notification.style.transition =
                            "opacity 160ms ease, transform 160ms ease";


                        window.setTimeout(
                            function () {

                                if (
                                    notification.parentNode
                                ) {

                                    notification.remove();

                                }

                            },
                            170
                        );

                    }

                },
                2600
            );


            console.log(
                "[FOBAS Simulation]",
                message
            );

        }

    };


    /* =====================================================
       STATUS FORMATTER
    ====================================================== */

    function formatStatus(
        status
    ) {

        const labels = {

            READY:
                "READY",

            MISSION_ACTIVE:
                "MISSION ACTIVE",

            MISSION_COMPLETED:
                "MISSION COMPLETED",

            ANALYSIS:
                "ANALYSIS",

            RUNNING:
                "RUNNING",

            PAUSED:
                "PAUSED",

            COMPLETED:
                "COMPLETED",

            ERROR:
                "ERROR"

        };


        return (
            labels[status] ||
            String(status || "READY")
                .replace(/_/g, " ")
        );

    }


    /* =====================================================
       ACTION MAP
    ====================================================== */

    const ACTION_MAP = {

        dashboard:
            "open_dashboard",

        wifi:
            "open_wifi_lab",

        cameraEspion:
            "open_camera_espion_lab",

        cameraSurveillance:
            "open_camera_surveillance_lab"

    };


    /* =====================================================
       CORE ACTION REGISTRATION
    ====================================================== */

    function registerCoreActions() {

        ActionEngine.register({

            id:
                "open_dashboard",

            label:
                "Open Dashboard",

            handler:
                function () {

                    simulationState.simulationStatus =
                        "READY";

                }

        });


        ActionEngine.register({

            id:
                "open_wifi_lab",

            label:
                "Open Wi-Fi Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });


        ActionEngine.register({

            id:
                "open_camera_espion_lab",

            label:
                "Open Camera Espion Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });


        ActionEngine.register({

            id:
                "open_camera_surveillance_lab",

            label:
                "Open Camera Surveillance Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });

    }


    /* =====================================================
       CORE MISSION REGISTRATION
    ====================================================== */

    function registerCoreMissions() {

        MissionEngine.register({

            id:
                "core_navigation_test",

            name:
                "Simulation Navigation Test",

            description:
                "Core navigation verification mission.",

            steps: [

                {

                    id:
                        "step_1",

                    actionId:
                        "open_wifi_lab"

                },

                {

                    id:
                        "step_2",

                    actionId:
                        "open_camera_espion_lab"

                },

                {

                    id:
                        "step_3",

                    actionId:
                        "open_camera_surveillance_lab"

                }

            ]

        });

    }


    /* =====================================================
       NAVIGATION EVENT BINDINGS
    ====================================================== */

    function bindNavigationEvents() {

        const buttons =
            document.querySelectorAll(
                "[data-lab]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const labId =
                            button.dataset.lab;


                        if (
                            !LABS[labId]
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       LAB CARD / ENTER LAB EVENTS
    ====================================================== */

    function bindLaunchEvents() {

        const buttons =
            document.querySelectorAll(
                "[data-launch-lab]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const labId =
                            button.dataset.launchLab;


                        if (
                            !LABS[labId] ||
                            labId ===
                            "dashboard"
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );


        /*
         * Allows the complete lab card
         * to behave like a secondary
         * navigation surface.
         */

        const cards =
            document.querySelectorAll(
                "[data-open-lab]"
            );


        cards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function (event) {

                        const interactive =
                            event.target.closest(
                                "button, a, input, select, textarea"
                            );


                        if (interactive) {

                            return;

                        }


                        const labId =
                            card.dataset.openLab;


                        if (
                            !LABS[labId]
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       CONTROL EVENT BINDINGS
    ====================================================== */

    function bindControlEvents() {

        const saveButton =
            document.getElementById(
                "saveSimulationBtn"
            );


        const loadButton =
            document.getElementById(
                "loadSimulationBtn"
            );


        const resetButton =
            document.getElementById(
                "resetSimulationBtn"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                function () {

                    SaveEngine.save();

                }
            );

        }


        if (loadButton) {

            loadButton.addEventListener(
                "click",
                function () {

                    SaveEngine.load();

                }
            );

        }


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                function () {

                    ResetEngine.reset();

                }
            );

        }

    }


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ====================================================== */

    function bindKeyboardEvents() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    return;

                }


                if (
                    event.altKey &&
                    event.key === "1"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "dashboard"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "2"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "wifi"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "3"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "cameraEspion"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "4"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "cameraSurveillance"
                    );

                }

            }
        );

    }


    /* =====================================================
       LAB RENDERER — WIFI
    ====================================================== */

    function renderWiFiLab() {

        const container =
            document.getElementById(
                "wifiLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.wifi;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    📶
                </div>

                <h3>
                    Wi-Fi Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Wi-Fi security modules can be
                    connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       LAB RENDERER — CAMERA ESPION
    ====================================================== */

    function renderCameraEspionLab() {

        const container =
            document.getElementById(
                "cameraEspionLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.cameraEspion;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    📷
                </div>

                <h3>
                    Camera Espion Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Detection and analysis modules
                    can be connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       LAB RENDERER — CAMERA SURVEILLANCE
    ====================================================== */

    function renderCameraSurveillanceLab() {

        const container =
            document.getElementById(
                "cameraSurveillanceLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.cameraSurveillance;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    🎥
                </div>

                <h3>
                    Camera Surveillance Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Surveillance modules can be
                    connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       GLOBAL PUBLIC API
    ====================================================== */

    window.FOBASCybersecuritySimulation = {

        version:
            VERSION,

        state:
            StateEngine,

        navigation:
            NavigationEngine,

        actions:
            ActionEngine,

        missions:
            MissionEngine,

        validation:
            ValidationEngine,

        labs:
            LabEngine,

        save:
            SaveEngine,

        reset:
            ResetEngine,

        ui:
            UIEngine,

        config: {

            storageKey:
                STORAGE_KEY,

            labs:
                LABS

        }

    };


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function initializeSimulation() {

        if (initialized) {

            return;

        }


        initialized =
            true;


        registerCoreActions();

        registerCoreMissions();

        bindNavigationEvents();

        bindLaunchEvents();

        bindControlEvents();

        bindKeyboardEvents();


        const initialLab =
            LABS[
                simulationState.currentLab
            ]
                ? simulationState.currentLab
                : DEFAULT_LAB;


        simulationState.currentLab =
            initialLab;


        simulationState.simulationStatus =
            "READY";


        NavigationEngine.goTo(
            initialLab
        );


        StateEngine.render();


        console.log(
            "FOBAS Ethical Hacking Simulation initialized.",
            VERSION
        );

    }


    /* =====================================================
       DOCUMENT READY
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSimulation,
            {
                once: true
            }
        );

    } else {

        initializeSimulation();

    }


})();