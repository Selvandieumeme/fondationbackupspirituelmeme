/* ================================================================
   ENTREPRISE FORCE UNIE — EFU7
   JAVASCRIPT PRINCIPAL
   Version finale — dynamique, autonome et compatible avec le HTML
   fourni.

   Fichier :
   entrepriseforceunie.js

   IMPORTANT :
   - Aucun dossier assets/
   - Aucun dossier motos/
   - Les images sont à la racine :
       logo-efu7.png
       moto-01.jpg ... moto-25.jpg
   - Aucun secret / token / mot de passe dans ce fichier.
   - Compatible Android / tactile / desktop.
   ================================================================ */

(() => {
    "use strict";

    /* ============================================================
       CONFIGURATION CENTRALE
       ============================================================ */

    const DEFAULT_CONFIG = {
        companyName: "ENTREPRISE FORCE UNIE",
        acronym: "EFU7",
        slogan: "Une force commune pour construire l’avenir.",
        country: "Haïti",
        logo: "logo-efu7.png",
        motorcycleCatalog: {
            total: 25,
            imageDirectory: "",
            imagePattern: "moto-{number}.jpg"
        }
    };

    const APP_CONFIG = (() => {
        const source =
            window.EFU7_CONFIG &&
            typeof window.EFU7_CONFIG === "object"
                ? window.EFU7_CONFIG
                : {};

        const catalog =
            source.motorcycleCatalog &&
            typeof source.motorcycleCatalog === "object"
                ? source.motorcycleCatalog
                : {};

        return {
            ...DEFAULT_CONFIG,
            ...source,
            motorcycleCatalog: {
                ...DEFAULT_CONFIG.motorcycleCatalog,
                ...catalog
            }
        };
    })();

    /* ============================================================
       ÉTAT DE L'APPLICATION
       ============================================================ */

    const state = {
        menuOpen: false,
        activeFilter: "all",
        pageReady: false,
        contactSubmitting: false,
        notificationTimer: null,
        observersStarted: false
    };

    /* ============================================================
       UTILITAIRES DOM
       ============================================================ */

    const $ = (selector, parent = document) => {
        if (!parent || typeof parent.querySelector !== "function") {
            return null;
        }

        return parent.querySelector(selector);
    };

    const $$ = (selector, parent = document) => {
        if (!parent || typeof parent.querySelectorAll !== "function") {
            return [];
        }

        return Array.from(parent.querySelectorAll(selector));
    };

    const byId = (id) => document.getElementById(id);

    const safeText = (value, fallback = "") => {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value);
    };

    const escapeHtml = (value) => {
        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    /* ============================================================
       CONFIGURATION DYNAMIQUE
       ============================================================ */

    function applyDynamicConfiguration() {
        const companyName = safeText(
            APP_CONFIG.companyName,
            DEFAULT_CONFIG.companyName
        );

        const acronym = safeText(
            APP_CONFIG.acronym,
            DEFAULT_CONFIG.acronym
        );

        const slogan = safeText(
            APP_CONFIG.slogan,
            DEFAULT_CONFIG.slogan
        );

        const country = safeText(
            APP_CONFIG.country,
            DEFAULT_CONFIG.country
        );

        /* -----------------------------------------
           Éléments data-dynamic
           ----------------------------------------- */

        $$('[data-dynamic="company-acronym"]').forEach((element) => {
            element.textContent = acronym;
        });

        $$('[data-dynamic="company-slogan"]').forEach((element) => {
            element.textContent = slogan;
        });

        /* -----------------------------------------
           Titre document
           ----------------------------------------- */

        document.title = `${companyName} — ${acronym}`;

        /* -----------------------------------------
           Logo
           ----------------------------------------- */

        const logoPath = safeText(
            APP_CONFIG.logo,
            DEFAULT_CONFIG.logo
        );

        $$(".brand-logo-image, .main-logo-image").forEach((image) => {
            if (image.getAttribute("src") !== logoPath) {
                image.src = logoPath;
            }
        });

        /* -----------------------------------------
           Pays / zone
           ----------------------------------------- */

        const zoneElements = $$(
            ".contact-item"
        );

        zoneElements.forEach((item) => {
            const label = $(".contact-label", item);

            if (!label) {
                return;
            }

            if (
                label.textContent.trim().toLowerCase() ===
                "zone d’activité"
            ) {
                const strong = $("strong", item);

                if (strong) {
                    strong.textContent = country;
                }
            }
        });

        /* -----------------------------------------
           Année automatique
           ----------------------------------------- */

        const yearElement = byId("currentYear");

        if (yearElement) {
            yearElement.textContent = String(
                new Date().getFullYear()
            );
        }
    }

    /* ============================================================
       NORMALISATION DES CHEMINS D'IMAGES
       ============================================================ */

    function normalizeImagePath(path) {
        let value = safeText(path).trim();

        if (!value) {
            return "";
        }

        /*
         * Sécurité de compatibilité :
         * même si une ancienne configuration contient assets/
         * ou assets/motos/, on force la racine.
         */

        value = value
            .replace(/^\.?\//, "")
            .replace(/^assets\/motos\//i, "")
            .replace(/^assets\//i, "")
            .replace(/^motos\//i, "");

        return value;
    }

    function buildMotorcycleImagePath(number) {
        const numericNumber = Number(number);

        if (
            !Number.isInteger(numericNumber) ||
            numericNumber < 1
        ) {
            return "";
        }

        const pattern = safeText(
            APP_CONFIG.motorcycleCatalog.imagePattern,
            "moto-{number}.jpg"
        );

        const formattedNumber =
            String(numericNumber).padStart(2, "0");

        const filename = pattern.replace(
            /\{number\}/gi,
            formattedNumber
        );

        /*
         * Le catalogue actuel doit rester à la racine.
         * imageDirectory est volontairement vide.
         */

        return normalizeImagePath(filename);
    }

    /* ============================================================
       GESTION DES IMAGES
       ============================================================ */

    function createImageFallback(image) {
        if (!image || image.dataset.fallbackApplied === "true") {
            return;
        }

        image.dataset.fallbackApplied = "true";

        const container = image.closest(".product-image");

        if (!container) {
            return;
        }

        image.style.display = "none";

        let fallback = $(".image-error-placeholder", container);

        if (!fallback) {
            fallback = document.createElement("div");

            fallback.className = "image-error-placeholder";

            fallback.setAttribute("role", "img");

            fallback.setAttribute(
                "aria-label",
                "Image du produit momentanément indisponible"
            );

            fallback.textContent = "EFU7";
        }

        if (!fallback.parentNode) {
            container.insertBefore(
                fallback,
                container.firstChild
            );
        }
    }

    function initializeImages() {
        const images = $$("img");

        images.forEach((image) => {
            image.addEventListener(
                "error",
                () => {
                    createImageFallback(image);
                },
                { once: true }
            );

            /*
             * Vérification de la présence de src.
             */

            const source = image.getAttribute("src");

            if (!source || !source.trim()) {
                createImageFallback(image);
            }
        });
    }

    /* ============================================================
       NAVIGATION / SCROLL
       ============================================================ */

    function getHeaderOffset() {
        const header = byId("siteHeader");

        if (!header) {
            return 0;
        }

        const height = header.getBoundingClientRect().height;

        return Number.isFinite(height) ? height : 0;
    }

    function scrollToElement(targetId, updateHash = true) {
        if (!targetId) {
            return false;
        }

        const target = byId(targetId);

        if (!target) {
            return false;
        }

        const headerOffset = getHeaderOffset();

        const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerOffset -
            12;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
        });

        if (updateHash) {
            try {
                history.pushState(
                    null,
                    "",
                    `#${targetId}`
                );
            } catch (error) {
                /*
                 * Fallback silencieux.
                 */
            }
        }

        closeMobileMenu();

        return true;
    }

    function extractScrollTarget(element) {
        if (!element) {
            return "";
        }

        const explicitTarget =
            element.getAttribute("data-scroll-target");

        if (explicitTarget) {
            return explicitTarget.replace(/^#/, "").trim();
        }

        const href = element.getAttribute("href");

        if (
            href &&
            href.startsWith("#") &&
            href.length > 1
        ) {
            return href.substring(1).trim();
        }

        return "";
    }

    function handleInternalNavigation(event) {
        const link = event.target.closest(
            'a[href^="#"], [data-scroll-target]'
        );

        if (!link) {
            return;
        }

        const targetId = extractScrollTarget(link);

        if (!targetId) {
            return;
        }

        const target = byId(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        scrollToElement(targetId, true);
    }

    /* ============================================================
       MENU MOBILE
       ============================================================ */

    function setMenuState(open) {
        const menuToggle = byId("menuToggle");
        const navigation = byId("mainNavigation");

        if (!menuToggle || !navigation) {
            return;
        }

        state.menuOpen = Boolean(open);

        menuToggle.setAttribute(
            "aria-expanded",
            state.menuOpen ? "true" : "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            state.menuOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
        );

        navigation.classList.toggle(
            "is-open",
            state.menuOpen
        );

        document.body.classList.toggle(
            "menu-open",
            state.menuOpen
        );

        menuToggle.classList.toggle(
            "is-active",
            state.menuOpen
        );
    }

    function openMobileMenu() {
        setMenuState(true);
    }

    function closeMobileMenu() {
        setMenuState(false);
    }

    function toggleMobileMenu() {
        setMenuState(!state.menuOpen);
    }

    function initializeMobileMenu() {
        const menuToggle = byId("menuToggle");

        if (!menuToggle) {
            return;
        }

        menuToggle.addEventListener(
            "click",
            toggleMobileMenu
        );

        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Escape" &&
                    state.menuOpen
                ) {
                    closeMobileMenu();
                }
            }
        );

        document.addEventListener(
            "click",
            (event) => {
                if (!state.menuOpen) {
                    return;
                }

                const navigation = byId("mainNavigation");

                if (!navigation) {
                    return;
                }

                const clickedInsideNavigation =
                    navigation.contains(event.target);

                const clickedToggle =
                    menuToggle.contains(event.target);

                if (
                    !clickedInsideNavigation &&
                    !clickedToggle
                ) {
                    closeMobileMenu();
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {
                if (window.innerWidth > 900) {
                    closeMobileMenu();
                }
            },
            { passive: true }
        );
    }

    /* ============================================================
       NAVIGATION ACTIVE
       ============================================================ */

    function initializeSectionObserver() {
        const sections = [
            ...$$("main section[id]")
        ];

        const navLinks = $$(".nav-link[data-section]");

        if (!sections.length || !navLinks.length) {
            return;
        }

        const setActiveSection = (sectionId) => {
            navLinks.forEach((link) => {
                const active =
                    link.getAttribute("data-section") ===
                    sectionId;

                link.classList.toggle(
                    "active",
                    active
                );

                if (active) {
                    link.setAttribute(
                        "aria-current",
                        "page"
                    );
                } else {
                    link.removeAttribute(
                        "aria-current"
                    );
                }
            });
        };

        if ("IntersectionObserver" in window) {
            const observer =
                new IntersectionObserver(
                    (entries) => {
                        const visibleEntries =
                            entries.filter(
                                (entry) =>
                                    entry.isIntersecting
                            );

                        if (!visibleEntries.length) {
                            return;
                        }

                        visibleEntries.sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                        const visible =
                            visibleEntries[0];

                        if (visible.target.id) {
                            setActiveSection(
                                visible.target.id
                            );
                        }
                    },
                    {
                        root: null,
                        rootMargin:
                            `-${Math.max(
                                70,
                                getHeaderOffset()
                            )}px 0px -45% 0px`,
                        threshold: [
                            0.05,
                            0.15,
                            0.3,
                            0.5
                        ]
                    }
                );

            sections.forEach((section) => {
                observer.observe(section);
            });

            state.observersStarted = true;
        } else {
            /*
             * Fallback pour anciens navigateurs.
             */

            const updateActiveSection = () => {
                const scrollPosition =
                    window.scrollY +
                    getHeaderOffset() +
                    100;

                let currentId =
                    sections[0].id;

                sections.forEach((section) => {
                    if (
                        section.offsetTop <=
                        scrollPosition
                    ) {
                        currentId = section.id;
                    }
                });

                setActiveSection(currentId);
            };

            window.addEventListener(
                "scroll",
                updateActiveSection,
                { passive: true }
            );

            updateActiveSection();
        }
    }

    /* ============================================================
       FILTRES PRODUITS
       ============================================================ */

    function getProductCards() {
        return $$("#productsGrid .product-card");
    }

    function filterMatches(card, filter) {
        if (!card) {
            return false;
        }

        if (filter === "all") {
            return true;
        }

        const category = safeText(
            card.dataset.category
        ).toLowerCase();

        const type = safeText(
            card.dataset.type
        ).toLowerCase();

        switch (filter) {
            case "motos":
                return (
                    category.includes("motos") ||
                    type === "2roues" ||
                    type === "3roues"
                );

            case "2roues":
                return type === "2roues";

            case "3roues":
                return type === "3roues";

            case "services":
                return (
                    category.includes("services") ||
                    type === "services"
                );

            case "autres":
                return (
                    !category.includes("motos") &&
                    !category.includes("services")
                );

            default:
                return true;
        }
    }

    function updateFilterButtons(activeFilter) {
        $$(".filter-button").forEach((button) => {
            const isActive =
                button.dataset.filter === activeFilter;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-selected",
                isActive ? "true" : "false"
            );
        });
    }

    function applyProductFilter(filter) {
        const normalizedFilter =
            safeText(filter, "all")
                .toLowerCase()
                .trim();

        const validFilters = new Set([
            "all",
            "motos",
            "2roues",
            "3roues",
            "services",
            "autres"
        ]);

        const selectedFilter =
            validFilters.has(normalizedFilter)
                ? normalizedFilter
                : "all";

        state.activeFilter = selectedFilter;

        updateFilterButtons(selectedFilter);

        const cards = getProductCards();

        let visibleCount = 0;

        cards.forEach((card) => {
            const visible = filterMatches(
                card,
                selectedFilter
            );

            card.hidden = !visible;

            card.classList.toggle(
                "is-filtered-out",
                !visible
            );

            if (visible) {
                visibleCount += 1;
            }
        });

        updateEmptyProductMessage(visibleCount);

        return visibleCount;
    }

    function updateEmptyProductMessage(count) {
        const grid = byId("productsGrid");

        if (!grid) {
            return;
        }

        let emptyMessage =
            byId("productFilterEmptyMessage");

        if (count > 0) {
            if (emptyMessage) {
                emptyMessage.hidden = true;
            }

            return;
        }

        if (!emptyMessage) {
            emptyMessage =
                document.createElement("div");

            emptyMessage.id =
                "productFilterEmptyMessage";

            emptyMessage.className =
                "product-filter-empty-message";

            emptyMessage.setAttribute(
                "role",
                "status"
            );

            emptyMessage.innerHTML = `
                <strong>Aucun élément trouvé.</strong>
                <span>Cette catégorie ne contient actuellement aucun élément.</span>
            `;

            grid.parentNode.insertBefore(
                emptyMessage,
                grid.nextSibling
            );
        }

        emptyMessage.hidden = false;
    }

    function initializeProductFilters() {
        const filterContainer =
            byId("productFilters");

        if (!filterContainer) {
            return;
        }

        filterContainer.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        ".filter-button"
                    );

                if (!button) {
                    return;
                }

                if (
                    !filterContainer.contains(button)
                ) {
                    return;
                }

                const filter =
                    button.dataset.filter || "all";

                applyProductFilter(filter);
            }
        );

        applyProductFilter("all");
    }

    /* ============================================================
       CATALOGUE — VÉRIFICATION DES 25 IMAGES
       ============================================================ */

    function synchronizeMotorcycleCatalog() {
        const cards = $$(".motorcycle-card");

        cards.forEach((card) => {
            const motoId =
                safeText(card.dataset.motoId);

            const match =
                motoId.match(
                    /moto-(\d+)/i
                );

            if (!match) {
                return;
            }

            const number =
                Number(match[1]);

            const image =
                $("img", card);

            if (!image) {
                return;
            }

            const expectedPath =
                buildMotorcycleImagePath(number);

            if (
                expectedPath &&
                image.getAttribute("src") !==
                    expectedPath
            ) {
                image.src = expectedPath;
            }

            image.alt =
                `Moto ${String(number).padStart(
                    2,
                    "0"
                )} — EFU7`;
        });
    }

    /* ============================================================
       NOTIFICATIONS
       ============================================================ */

    function removeNotification(notification) {
        if (!notification) {
            return;
        }

        notification.classList.remove(
            "is-visible"
        );

        window.setTimeout(() => {
            if (
                notification &&
                notification.parentNode
            ) {
                notification.remove();
            }
        }, 250);
    }

    function showNotification(
        message,
        type = "info",
        duration = 5000
    ) {
        const container =
            byId("notificationContainer");

        if (!container) {
            return;
        }

        if (state.notificationTimer) {
            window.clearTimeout(
                state.notificationTimer
            );

            state.notificationTimer = null;
        }

        const notification =
            document.createElement("div");

        notification.className =
            "notification";

        notification.dataset.type =
            safeText(type, "info");

        notification.setAttribute(
            "role",
            type === "error"
                ? "alert"
                : "status"
        );

        notification.innerHTML = `
            <div class="notification-message">
                ${escapeHtml(message)}
            </div>
            <button
                type="button"
                class="notification-close"
                aria-label="Fermer la notification"
            >
                ×
            </button>
        `;

        const closeButton =
            $(".notification-close", notification);

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                () => {
                    removeNotification(
                        notification
                    );
                }
            );
        }

        container.appendChild(notification);

        window.requestAnimationFrame(() => {
            notification.classList.add(
                "is-visible"
            );
        });

        state.notificationTimer =
            window.setTimeout(() => {
                removeNotification(
                    notification
                );
            }, Math.max(1000, duration));
    }

    /* ============================================================
       BOUTON RETOUR EN HAUT
       ============================================================ */

    function updateBackToTop() {
        const button = byId("backToTop");

        if (!button) {
            return;
        }

        const shouldShow =
            window.scrollY >
            Math.max(
                400,
                window.innerHeight * 0.6
            );

        button.classList.toggle(
            "is-visible",
            shouldShow
        );

        button.setAttribute(
            "aria-hidden",
            shouldShow ? "false" : "true"
        );
    }

    function initializeBackToTop() {
        const button = byId("backToTop");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                try {
                    history.pushState(
                        null,
                        "",
                        "#top"
                    );
                } catch (error) {
                    /*
                     * Rien à faire.
                     */
                }
            }
        );

        window.addEventListener(
            "scroll",
            updateBackToTop,
            {
                passive: true
            }
        );

        updateBackToTop();
    }

    /* ============================================================
       FORMULAIRE — VALIDATION
       ============================================================ */

    function getFormElements() {
        return {
            form: byId("contactForm"),
            name: byId("contactName"),
            email: byId("contactEmailInput"),
            subject: byId("contactSubject"),
            message: byId("contactMessage"),
            website: byId("website"),
            submit: byId("contactSubmit"),
            status: byId("formStatus"),
            nameError: byId("contactNameError"),
            emailError: byId("contactEmailError"),
            subjectError: byId(
                "contactSubjectError"
            ),
            messageError: byId(
                "contactMessageError"
            ),
            counter: byId("messageCounter")
        };
    }

    function setFieldError(
        field,
        errorElement,
        message
    ) {
        if (field) {
            field.classList.toggle(
                "has-error",
                Boolean(message)
            );

            field.setAttribute(
                "aria-invalid",
                message ? "true" : "false"
            );
        }

        if (errorElement) {
            errorElement.textContent =
                message || "";
        }
    }

    function clearFieldError(
        field,
        errorElement
    ) {
        setFieldError(
            field,
            errorElement,
            ""
        );
    }

    function validateName(value) {
        const normalized =
            safeText(value).trim();

        if (!normalized) {
            return "Veuillez saisir votre nom complet.";
        }

        if (normalized.length < 2) {
            return "Le nom doit contenir au moins 2 caractères.";
        }

        return "";
    }

    function validateEmail(value) {
        const normalized =
            safeText(value).trim();

        if (!normalized) {
            return "Veuillez saisir votre adresse email.";
        }

        /*
         * Validation email volontairement simple,
         * compatible avec les navigateurs mobiles.
         */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailPattern.test(normalized)) {
            return "Veuillez saisir une adresse email valide.";
        }

        return "";
    }

    function validateSubject(value) {
        if (!safeText(value).trim()) {
            return "Veuillez choisir un sujet.";
        }

        return "";
    }

    function validateMessage(value) {
        const normalized =
            safeText(value).trim();

        if (!normalized) {
            return "Veuillez saisir votre message.";
        }

        if (normalized.length < 10) {
            return "Le message doit contenir au moins 10 caractères.";
        }

        if (normalized.length > 2000) {
            return "Le message ne peut pas dépasser 2000 caractères.";
        }

        return "";
    }

    function validateContactForm(showErrors = true) {
        const elements =
            getFormElements();

        if (!elements.form) {
            return {
                valid: false,
                values: null
            };
        }

        const nameError =
            validateName(
                elements.name
                    ? elements.name.value
                    : ""
            );

        const emailError =
            validateEmail(
                elements.email
                    ? elements.email.value
                    : ""
            );

        const subjectError =
            validateSubject(
                elements.subject
                    ? elements.subject.value
                    : ""
            );

        const messageError =
            validateMessage(
                elements.message
                    ? elements.message.value
                    : ""
            );

        if (showErrors) {
            setFieldError(
                elements.name,
                elements.nameError,
                nameError
            );

            setFieldError(
                elements.email,
                elements.emailError,
                emailError
            );

            setFieldError(
                elements.subject,
                elements.subjectError,
                subjectError
            );

            setFieldError(
                elements.message,
                elements.messageError,
                messageError
            );
        }

        const valid =
            !nameError &&
            !emailError &&
            !subjectError &&
            !messageError;

        return {
            valid,
            values: {
                name: elements.name
                    ? elements.name.value.trim()
                    : "",
                email: elements.email
                    ? elements.email.value.trim()
                    : "",
                subject: elements.subject
                    ? elements.subject.value
                    : "",
                message: elements.message
                    ? elements.message.value.trim()
                    : ""
            }
        };
    }

    /* ============================================================
       COMPTEUR DU MESSAGE
       ============================================================ */

    function updateMessageCounter() {
        const message = byId(
            "contactMessage"
        );

        const counter = byId(
            "messageCounter"
        );

        if (!message || !counter) {
            return;
        }

        const length =
            message.value.length;

        const maxLength =
            Number(message.getAttribute("maxlength")) ||
            2000;

        counter.textContent =
            `${length} / ${maxLength}`;

        counter.classList.toggle(
            "is-near-limit",
            length >= maxLength * 0.9
        );

        counter.classList.toggle(
            "is-limit-reached",
            length >= maxLength
        );
    }

    /* ============================================================
       STATUT DU FORMULAIRE
       ============================================================ */

    function setFormStatus(
        message,
        type = ""
    ) {
        const status = byId(
            "formStatus"
        );

        if (!status) {
            return;
        }

        status.textContent =
            safeText(message);

        status.dataset.status =
            safeText(type);

        status.classList.toggle(
            "is-visible",
            Boolean(message)
        );
    }

    /* ============================================================
       EMAIL — PRÉPARATION DU MESSAGE
       ============================================================ */

    function buildMailtoUrl(values) {
        const recipient =
            "contact@entrepriseforceunie.com";

        const subjectLabels = {
            motos: "Motos / Mobilité",
            commerce: "Commerce",
            partenariat: "Partenariat",
            services: "Services",
            information: "Demande d’information",
            autre: "Autre"
        };

        const subjectLabel =
            subjectLabels[values.subject] ||
            values.subject ||
            "Demande de contact";

        const mailSubject =
            `[EFU7] ${subjectLabel}`;

        const mailBody =
            [
                "Bonjour ENTREPRISE FORCE UNIE — EFU7,",
                "",
                `Nom : ${values.name}`,
                `Email : ${values.email}`,
                `Sujet : ${subjectLabel}`,
                "",
                "Message :",
                values.message,
                "",
                "Message envoyé depuis le site officiel EFU7."
            ].join("\n");

        return (
            `mailto:${recipient}` +
            `?subject=${encodeURIComponent(
                mailSubject
            )}` +
            `&body=${encodeURIComponent(
                mailBody
            )}`
        );
    }

    /* ============================================================
       ENVOI DU FORMULAIRE
       ============================================================ */

    function submitContactForm() {
        const elements =
            getFormElements();

        if (!elements.form) {
            return;
        }

        if (state.contactSubmitting) {
            return;
        }

        /*
         * Honeypot :
         * si rempli, on ne poursuit pas.
         */

        const honeypotValue =
            elements.website
                ? elements.website.value.trim()
                : "";

        if (honeypotValue) {
            setFormStatus(
                "Votre demande ne peut pas être traitée.",
                "error"
            );

            return;
        }

        const validation =
            validateContactForm(true);

        if (!validation.valid) {
            setFormStatus(
                "Veuillez corriger les champs indiqués.",
                "error"
            );

            const firstInvalid =
                elements.form.querySelector(
                    ".has-error, :invalid"
                );

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        state.contactSubmitting = true;

        if (elements.submit) {
            elements.submit.disabled = true;
            elements.submit.setAttribute(
                "aria-busy",
                "true"
            );

            elements.submit.dataset.originalText =
                elements.submit.textContent.trim();

            elements.submit.textContent =
                "Préparation du message…";
        }

        setFormStatus(
            "Préparation de votre message…",
            "loading"
        );

        const mailtoUrl =
            buildMailtoUrl(
                validation.values
            );

        /*
         * Le HTML ne fournit aucun endpoint serveur.
         * mailto est donc l'action réelle disponible
         * sans inventer une API inexistante.
         */

        window.setTimeout(() => {
            try {
                window.location.href =
                    mailtoUrl;

                setFormStatus(
                    "Votre application email devrait maintenant s’ouvrir avec le message préparé. Vous pourrez vérifier puis l’envoyer.",
                    "success"
                );

                showNotification(
                    "Votre message est prêt à être envoyé par email.",
                    "success",
                    7000
                );

                /*
                 * On ne vide pas immédiatement le formulaire :
                 * l'utilisateur peut revenir vérifier ou modifier
                 * son message.
                 */
            } catch (error) {
                setFormStatus(
                    "Impossible d’ouvrir automatiquement l’application email. Utilisez l’adresse contact@entrepriseforceunie.com.",
                    "error"
                );

                showNotification(
                    "L’application email n’a pas pu être ouverte.",
                    "error",
                    7000
                );
            } finally {
                state.contactSubmitting = false;

                if (elements.submit) {
                    elements.submit.disabled = false;
                    elements.submit.removeAttribute(
                        "aria-busy"
                    );

                    elements.submit.textContent =
                        elements.submit.dataset.originalText ||
                        "Envoyer le message";
                }
            }
        }, 150);
    }

    /* ============================================================
       ÉVÉNEMENTS DU FORMULAIRE
       ============================================================ */

    function initializeContactForm() {
        const elements =
            getFormElements();

        if (!elements.form) {
            return;
        }

        elements.form.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                submitContactForm();
            }
        );

        if (elements.name) {
            elements.name.addEventListener(
                "input",
                () => {
                    if (
                        elements.nameError &&
                        elements.name.classList.contains(
                            "has-error"
                        )
                    ) {
                        const error =
                            validateName(
                                elements.name.value
                            );

                        setFieldError(
                            elements.name,
                            elements.nameError,
                            error
                        );
                    }
                }
            );

            elements.name.addEventListener(
                "blur",
                () => {
                    const error =
                        validateName(
                            elements.name.value
                        );

                    setFieldError(
                        elements.name,
                        elements.nameError,
                        error
                    );
                }
            );
        }

        if (elements.email) {
            elements.email.addEventListener(
                "input",
                () => {
                    if (
                        elements.emailError &&
                        elements.email.classList.contains(
                            "has-error"
                        )
                    ) {
                        const error =
                            validateEmail(
                                elements.email.value
                            );

                        setFieldError(
                            elements.email,
                            elements.emailError,
                            error
                        );
                    }
                }
            );

            elements.email.addEventListener(
                "blur",
                () => {
                    const error =
                        validateEmail(
                            elements.email.value
                        );

                    setFieldError(
                        elements.email,
                        elements.emailError,
                        error
                    );
                }
            );
        }

        if (elements.subject) {
            elements.subject.addEventListener(
                "change",
                () => {
                    const error =
                        validateSubject(
                            elements.subject.value
                        );

                    setFieldError(
                        elements.subject,
                        elements.subjectError,
                        error
                    );
                }
            );
        }

        if (elements.message) {
            elements.message.addEventListener(
                "input",
                () => {
                    updateMessageCounter();

                    if (
                        elements.messageError &&
                        elements.message.classList.contains(
                            "has-error"
                        )
                    ) {
                        const error =
                            validateMessage(
                                elements.message.value
                            );

                        setFieldError(
                            elements.message,
                            elements.messageError,
                            error
                        );
                    }
                }
            );

            elements.message.addEventListener(
                "blur",
                () => {
                    const error =
                        validateMessage(
                            elements.message.value
                        );

                    setFieldError(
                        elements.message,
                        elements.messageError,
                        error
                    );
                }
            );
        }

        updateMessageCounter();
    }

    /* ============================================================
       ACCESSIBILITÉ — FOCUS DES ÉLÉMENTS INVALIDES
       ============================================================ */

    function initializeKeyboardAccessibility() {
        document.addEventListener(
            "keydown",
            (event) => {
                if (event.key !== "Enter") {
                    return;
                }

                const activeElement =
                    document.activeElement;

                if (!activeElement) {
                    return;
                }

                /*
                 * Les boutons et liens natifs gardent leur comportement.
                 */

                if (
                    activeElement.matches(
                        "button, a, input, select, textarea"
                    )
                ) {
                    return;
                }
            }
        );
    }

    /* ============================================================
       GESTION DU CHANGEMENT D'URL
       ============================================================ */

    function handleInitialHash() {
        const hash =
            window.location.hash;

        if (!hash || hash === "#") {
            return;
        }

        const targetId =
            decodeURIComponent(
                hash.substring(1)
            ).trim();

        if (!targetId) {
            return;
        }

        /*
         * Attendre que le navigateur ait fini le rendu.
         */

        window.setTimeout(() => {
            scrollToElement(
                targetId,
                false
            );
        }, 100);
    }

    window.addEventListener(
        "popstate",
        () => {
            const hash =
                window.location.hash;

            if (!hash || hash === "#") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                closeMobileMenu();

                return;
            }

            const targetId =
                hash.substring(1);

            scrollToElement(
                targetId,
                false
            );
        }
    );

    /* ============================================================
       GESTION DU LOGO
       ============================================================ */

    function initializeLogoActions() {
        const logoLinks =
            $$(".brand, .footer-logo");

        logoLinks.forEach((link) => {
            link.addEventListener(
                "click",
                (event) => {
                    const target =
                        byId("accueil");

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    scrollToElement(
                        "accueil",
                        true
                    );
                }
            );
        });
    }

    /* ============================================================
       PAGE LOADER
       ============================================================ */

    function hidePageLoader() {
        const loader =
            byId("pageLoader");

        if (!loader) {
            state.pageReady = true;
            return;
        }

        loader.classList.add(
            "is-hidden"
        );

        loader.setAttribute(
            "aria-hidden",
            "true"
        );

        /*
         * Permet aux CSS utilisant pointer-events
         * de récupérer le contrôle de la page.
         */

        window.setTimeout(() => {
            loader.hidden = true;
        }, 500);

        state.pageReady = true;
    }

    function initializePageLoader() {
        /*
         * Ne jamais bloquer la page indéfiniment.
         */

        const minimumDisplayTime = 250;

        const start =
            performance.now();

        const finish = () => {
            const elapsed =
                performance.now() - start;

            const remaining =
                Math.max(
                    0,
                    minimumDisplayTime -
                        elapsed
                );

            window.setTimeout(
                hidePageLoader,
                remaining
            );
        };

        if (
            document.readyState ===
            "complete"
        ) {
            finish();
        } else {
            window.addEventListener(
                "load",
                finish,
                { once: true }
            );
        }

        /*
         * Filet de sécurité :
         * même si une ressource externe bloque "load",
         * le loader disparaît.
         */

        window.setTimeout(
            hidePageLoader,
            3000
        );
    }

    /* ============================================================
       ANIMATIONS D'APPARITION
       ============================================================ */

    function initializeRevealEffects() {
        const elements = [
            ...$$(
                ".intro-card, .activity-card, .product-card, " +
                ".vision-value, .contact-item, .highlight-box"
            )
        ];

        if (!elements.length) {
            return;
        }

        /*
         * Si le navigateur ne supporte pas IntersectionObserver,
         * on laisse tout visible.
         */

        if (
            !("IntersectionObserver" in window)
        ) {
            elements.forEach((element) => {
                element.classList.add(
                    "is-visible"
                );
            });

            return;
        }

        const observer =
            new IntersectionObserver(
                (entries, observerInstance) => {
                    entries.forEach((entry) => {
                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observerInstance.unobserve(
                            entry.target
                        );
                    });
                },
                {
                    threshold: 0.08,
                    rootMargin:
                        "0px 0px -30px 0px"
                }
            );

        elements.forEach((element) => {
            observer.observe(element);
        });
    }

    /* ============================================================
       PRÉVENTION DU DOUBLE CLIC SUR LES LIENS
       ============================================================ */

    function initializeButtonFeedback() {
        const interactiveElements =
            $$(
                ".btn, .activity-link, .product-link, " +
                ".text-link, .filter-button"
            );

        interactiveElements.forEach(
            (element) => {
                element.addEventListener(
                    "pointerdown",
                    () => {
                        element.classList.add(
                            "is-pressed"
                        );
                    }
                );

                const removePressed =
                    () => {
                        element.classList.remove(
                            "is-pressed"
                        );
                    };

                element.addEventListener(
                    "pointerup",
                    removePressed
                );

                element.addEventListener(
                    "pointercancel",
                    removePressed
                );

                element.addEventListener(
                    "pointerleave",
                    removePressed
                );
            }
        );
    }

    /* ============================================================
       LIENS EMAIL ET TÉLÉPHONE
       ============================================================ */

    function initializeContactLinks() {
        const emailLink =
            byId("contactEmail");

        const phoneLink =
            byId("contactPhone");

        if (emailLink) {
            emailLink.setAttribute(
                "href",
                "mailto:contact@entrepriseforceunie.com"
            );
        }

        if (phoneLink) {
            /*
             * Le numéro présent dans le HTML est conservé.
             * Aucun numéro fictif différent n'est injecté.
             */

            const displayedPhone =
                phoneLink.textContent
                    .trim();

            if (displayedPhone) {
                const telValue =
                    displayedPhone.replace(
                        /[^\d+]/g,
                        ""
                    );

                if (telValue) {
                    phoneLink.setAttribute(
                        "href",
                        `tel:${telValue}`
                    );
                }
            }
        }
    }

    /* ============================================================
       DÉTECTION DU MODE RÉDUIT DE MOUVEMENT
       ============================================================ */

    function initializeReducedMotion() {
        const mediaQuery =
            window.matchMedia
                ? window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                )
                : null;

        if (!mediaQuery) {
            return;
        }

        const apply = () => {
            document.documentElement.classList.toggle(
                "reduced-motion",
                mediaQuery.matches
            );
        };

        apply();

        if (
            typeof mediaQuery.addEventListener ===
            "function"
        ) {
            mediaQuery.addEventListener(
                "change",
                apply
            );
        } else if (
            typeof mediaQuery.addListener ===
            "function"
        ) {
            mediaQuery.addListener(apply);
        }
    }

    /* ============================================================
       GESTION GLOBALE DES CLICS
       ============================================================ */

    function initializeGlobalClickHandling() {
        document.addEventListener(
            "click",
            handleInternalNavigation
        );
    }

    /* ============================================================
       PROTECTION CONTRE LES ERREURS D'IMAGE NON CAPTURÉES
       ============================================================ */

    function initializeGlobalImageErrorHandling() {
        document.addEventListener(
            "error",
            (event) => {
                const target =
                    event.target;

                if (
                    target instanceof HTMLImageElement
                ) {
                    createImageFallback(
                        target
                    );
                }
            },
            true
        );
    }

    /* ============================================================
       INITIALISATION PRINCIPALE
       ============================================================ */

    function initializeApplication() {
        try {
            applyDynamicConfiguration();

            synchronizeMotorcycleCatalog();

            initializeImages();

            initializeMobileMenu();

            initializeSectionObserver();

            initializeProductFilters();

            initializeContactForm();

            initializeBackToTop();

            initializeKeyboardAccessibility();

            initializeLogoActions();

            initializeContactLinks();

            initializeGlobalClickHandling();

            initializeGlobalImageErrorHandling();

            initializeReducedMotion();

            initializeRevealEffects();

            initializeButtonFeedback();

            initializePageLoader();

            handleInitialHash();

            /*
             * Synchronisation finale du compteur.
             */

            updateMessageCounter();

        } catch (error) {
            /*
             * L'application ne doit pas devenir inutilisable
             * à cause d'une fonctionnalité secondaire.
             */

            console.error(
                "EFU7 — Erreur d'initialisation :",
                error
            );

            /*
             * Même en cas d'erreur secondaire,
             * on retire le loader.
             */

            hidePageLoader();

            showNotification(
                "Certaines fonctionnalités secondaires n’ont pas pu être initialisées.",
                "error",
                7000
            );
        }
    }

    /* ============================================================
       LANCEMENT
       ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApplication,
            { once: true }
        );
    } else {
        initializeApplication();
    }

    /* ============================================================
       API PUBLIQUE EFU7
       ============================================================

       Ces méthodes restent disponibles dans window.EFU7
       pour permettre à d'autres scripts futurs de contrôler
       proprement certaines fonctions sans toucher au DOM
       directement.
       ============================================================ */

    window.EFU7 = Object.freeze({

        version: "1.0.0",

        config: APP_CONFIG,

        scrollTo: (sectionId) => {
            return scrollToElement(
                sectionId,
                true
            );
        },

        filterProducts: (filter) => {
            return applyProductFilter(
                filter
            );
        },

        showNotification: (
            message,
            type,
            duration
        ) => {
            showNotification(
                message,
                type,
                duration
            );
        },

        openMenu: () => {
            openMobileMenu();
        },

        closeMenu: () => {
            closeMobileMenu();
        },

        refresh: () => {
            applyDynamicConfiguration();
            synchronizeMotorcycleCatalog();
            applyProductFilter(
                state.activeFilter
            );
            updateMessageCounter();
            updateBackToTop();
        }

    });

})();