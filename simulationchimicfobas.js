/* ================================================================
   CHIMIQUE FOBAS — PARTIE 2
   Suite directe de simulationchimicfobas.js
   ================================================================ */

  /* ================================================================
     NORMALISATION ET GESTION DES COMPOSANTS
  ================================================================ */

  function ensureComposition(object) {
    if (!object.composition) {
      object.composition = createComposition();
    }

    if (!object.composition.components) {
      object.composition.components = {};
    }

    if (!Number.isFinite(
      Number(object.composition.totalMass)
    )) {
      object.composition.totalMass = 0;
    }

    if (!Number.isFinite(
      Number(object.composition.totalVolume)
    )) {
      object.composition.totalVolume = 0;
    }

    return object.composition;
  }

  function addComponent(
    object,
    materialId,
    quantity = 0
  ) {
    if (!object) {
      return false;
    }

    const material =
      materialById(materialId);

    if (!material) {
      return false;
    }

    ensureComposition(object);

    const q = num(quantity);

    if (q <= 0) {
      return false;
    }

    object.composition.components[
      materialId
    ] =
      num(
        object.composition.components[
          materialId
        ]
      ) + q;

    if (material.kind === "liquid") {
      object.composition.totalVolume =
        num(
          object.composition.totalVolume
        ) + q;
    }

    if (material.density) {
      object.composition.totalMass =
        num(
          object.composition.totalMass
        ) +
        q * num(material.density);
    } else if (material.molarMass) {
      object.composition.totalMass =
        num(
          object.composition.totalMass
        ) +
        q * num(material.molarMass);
    }

    updateObject(object);

    return true;
  }

  function removeComponent(
    object,
    materialId,
    quantity
  ) {
    if (!object?.composition?.components) {
      return false;
    }

    const current =
      num(
        object.composition.components[
          materialId
        ]
      );

    const q =
      clamp(
        num(quantity),
        0,
        current
      );

    if (q <= 0) {
      return false;
    }

    const remaining =
      current - q;

    if (remaining <= 0.000001) {
      delete object.composition.components[
        materialId
      ];
    } else {
      object.composition.components[
        materialId
      ] = remaining;
    }

    updateObject(object);

    return true;
  }

  function hasComponent(
    object,
    materialId
  ) {
    return Boolean(
      object?.composition?.components &&
      num(
        object.composition.components[
          materialId
        ]
      ) > 0
    );
  }

  function componentQuantity(
    object,
    materialId
  ) {
    return num(
      object?.composition?.components?.[
        materialId
      ]
    );
  }

  function componentCount(object) {
    return Object.keys(
      object?.composition?.components || {}
    ).length;
  }

  /* ================================================================
     CAPACITÉ DES RÉCIPIENTS
  ================================================================ */

  function getCapacity(object) {
    if (!object) {
      return 0;
    }

    if (num(object.capacity) > 0) {
      return num(object.capacity);
    }

    const material =
      materialById(object.materialId);

    return num(
      material?.capacity
    );
  }

  function getRemainingCapacity(object) {
    if (!object) {
      return 0;
    }

    const capacity =
      getCapacity(object);

    if (capacity <= 0) {
      return Infinity;
    }

    return Math.max(
      0,
      capacity -
        calculateVolume(object)
    );
  }

  /* ================================================================
     CALCUL DU VOLUME PAR TYPE DE COMPOSANT
  ================================================================ */

  function estimateComponentVolume(
    materialId,
    quantity
  ) {
    const material =
      materialById(materialId);

    const q =
      num(quantity);

    if (!material || q <= 0) {
      return 0;
    }

    if (
      material.kind === "liquid" &&
      material.density > 0
    ) {
      return q;
    }

    return 0;
  }

  function recalculateComposition(
    object
  ) {
    if (!object) {
      return;
    }

    ensureComposition(object);

    let totalMass = 0;
    let totalVolume = 0;

    Object.entries(
      object.composition.components
    ).forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        const q =
          num(quantity);

        if (!material || q <= 0) {
          return;
        }

        if (
          material.density &&
          material.kind === "liquid"
        ) {
          totalMass +=
            q *
            num(material.density);

          totalVolume += q;
          return;
        }

        if (material.molarMass) {
          totalMass +=
            q *
            num(material.molarMass);
        }
      }
    );

    object.composition.totalMass =
      round(totalMass, 4);

    object.composition.totalVolume =
      round(totalVolume, 4);

    object.mass =
      round(totalMass, 4);

    if (totalVolume > 0) {
      object.volume =
        round(totalVolume, 4);
    }

    if (totalVolume > 0) {
      object.density =
        round(
          totalMass / totalVolume,
          4
        );
    }

    object.pH =
      calculatePH(object);
  }

  /* ================================================================
     CALCUL DE PH PLUS DYNAMIQUE
  ================================================================ */

  const PH = {
    neutral: 7,
    strongAcid: 1,
    weakAcid: 4,
    strongBase: 13,
    weakBase: 10
  };

  function materialPH(material) {
    if (!material) {
      return 7;
    }

    if (
      material.chemicalCategory ===
      "acid"
    ) {
      if (
        material.id ===
        "acide-sulfurique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-nitrique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-chlorhydrique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-acetique"
      ) {
        return 3;
      }

      if (
        material.id ===
        "acide-citrique"
      ) {
        return 3;
      }

      return PH.weakAcid;
    }

    if (
      material.chemicalCategory ===
      "organic-acid"
    ) {
      return 3;
    }

    if (
      material.chemicalCategory ===
      "base"
    ) {
      if (
        material.id ===
        "hydroxyde-sodium"
      ) {
        return 14;
      }

      if (
        material.id ===
        "hydroxyde-potassium"
      ) {
        return 14;
      }

      if (
        material.id ===
        "hydroxyde-calcium"
      ) {
        return 12.4;
      }

      if (
        material.id ===
        "ammoniac-aqueux"
      ) {
        return 11;
      }

      return PH.weakBase;
    }

    return 7;
  }

  function calculateMixturePH(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    if (!entries.length) {
      return 7;
    }

    let acidScore = 0;
    let baseScore = 0;

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        if (!material) {
          return;
        }

        const q =
          Math.max(
            0.001,
            num(quantity)
          );

        const ph =
          materialPH(material);

        if (ph < 7) {
          acidScore +=
            (7 - ph) * q;
        }

        if (ph > 7) {
          baseScore +=
            (ph - 7) * q;
        }
      }
    );

    if (
      acidScore === 0 &&
      baseScore === 0
    ) {
      return 7;
    }

    const difference =
      acidScore - baseScore;

    if (Math.abs(difference) < 0.01) {
      return 7;
    }

    if (difference > 0) {
      return clamp(
        7 -
          Math.min(
            6,
            difference
          ),
        1,
        7
      );
    }

    return clamp(
      7 +
        Math.min(
          7,
          Math.abs(difference)
        ),
      7,
      14
    );
  }

  /* ================================================================
     COULEUR DES MÉLANGES
  ================================================================ */

  function hexToRgb(hex) {
    if (
      typeof hex !== "string"
    ) {
      return null;
    }

    let value =
      hex.trim()
        .replace("#", "");

    if (value.length === 3) {
      value =
        value
          .split("")
          .map(char => char + char)
          .join("");
    }

    if (
      !/^[0-9a-fA-F]{6}$/.test(value)
    ) {
      return null;
    }

    return {
      r: parseInt(
        value.slice(0, 2),
        16
      ),
      g: parseInt(
        value.slice(2, 4),
        16
      ),
      b: parseInt(
        value.slice(4, 6),
        16
      )
    };
  }

  function rgbToHex(
    r,
    g,
    b
  ) {
    const values = [
      clamp(Math.round(r), 0, 255),
      clamp(Math.round(g), 0, 255),
      clamp(Math.round(b), 0, 255)
    ];

    return (
      "#" +
      values
        .map(value =>
          value
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
    );
  }

  function calculateMixtureColor(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    if (!entries.length) {
      return (
        materialById(
          object?.materialId
        )?.color ||
        "#dcefff"
      );
    }

    let totalWeight = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        if (!material) {
          return;
        }

        const rgb =
          hexToRgb(
            material.color
          );

        if (!rgb) {
          return;
        }

        const weight =
          Math.max(
            0.001,
            num(quantity)
          );

        r += rgb.r * weight;
        g += rgb.g * weight;
        b += rgb.b * weight;

        totalWeight += weight;
      }
    );

    if (totalWeight <= 0) {
      return "#dcefff";
    }

    return rgbToHex(
      r / totalWeight,
      g / totalWeight,
      b / totalWeight
    );
  }

  /* ================================================================
     RENDU DE LA BIBLIOTHÈQUE
  ================================================================ */

  function currentCategory() {
    const active =
      document.querySelector(
        ".category-button.is-active, " +
        ".category-button.active, " +
        ".category-button[aria-selected='true']"
      );

    return (
      active?.dataset.category ||
      "all"
    );
  }

  function materialMatchesSearch(
    material,
    search
  ) {
    if (!search) {
      return true;
    }

    const text = [
      material.name,
      material.formula,
      material.id,
      material.chemicalCategory,
      material.state
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(
      search.toLowerCase()
    );
  }

  function materialMatchesCategory(
    material,
    category
  ) {
    if (
      !category ||
      category === "all"
    ) {
      return true;
    }

    return material.cat === category;
  }

  function materialIcon(material) {
    if (!material) {
      return "⚗";
    }

    if (
      material.cat ===
      "glassware"
    ) {
      return "⚗";
    }

    if (
      material.cat ===
      "instrument"
    ) {
      return "⌁";
    }

    if (
      material.cat ===
      "equipment"
    ) {
      return "⚙";
    }

    if (
      material.chemicalCategory ===
      "metal"
    ) {
      return "◈";
    }

    if (
      material.chemicalCategory ===
      "acid"
    ) {
      return "🧪";
    }

    if (
      material.chemicalCategory ===
      "base"
    ) {
      return "⬡";
    }

    if (
      material.chemicalCategory ===
      "salt"
    ) {
      return "◆";
    }

    return "◇";
  }

  function createMaterialCard(
    material
  ) {
    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "material-card";

    card.dataset.materialId =
      material.id;

    card.draggable = true;

    const icon =
      document.createElement("span");

    icon.className =
      "material-card-icon";

    icon.textContent =
      materialIcon(material);

    const body =
      document.createElement("span");

    body.className =
      "material-card-body";

    const name =
      document.createElement("strong");

    name.className =
      "material-card-name";

    name.textContent =
      material.name;

    const formula =
      document.createElement("small");

    formula.className =
      "material-card-formula";

    formula.textContent =
      material.formula ||
      material.chemicalCategory ||
      "";

    const meta =
      document.createElement("small");

    meta.className =
      "material-card-meta";

    const parts = [];

    if (
      material.state
    ) {
      parts.push(
        material.state
      );
    }

    if (
      material.molarMass
    ) {
      parts.push(
        `${round(
          material.molarMass,
          3
        )} g/mol`
      );
    }

    if (
      material.capacity
    ) {
      parts.push(
        `${material.capacity} mL`
      );
    }

    meta.textContent =
      parts.join(" • ");

    body.appendChild(name);
    body.appendChild(formula);
    body.appendChild(meta);

    card.appendChild(icon);
    card.appendChild(body);

    card.addEventListener(
      "click",
      event => {
        event.preventDefault();

        if (S.suppressLibraryClick) {
          S.suppressLibraryClick =
            false;
          return;
        }

        add(material.id);
      }
    );

    card.addEventListener(
      "dragstart",
      event => {
        S.suppressLibraryClick =
          true;

        event.dataTransfer?.setData(
          "text/plain",
          material.id
        );

        event.dataTransfer.effectAllowed =
          "copy";
      }
    );

    card.addEventListener(
      "dragend",
      () => {
        setTimeout(() => {
          S.suppressLibraryClick =
            false;
        }, 0);
      }
    );

    return card;
  }

  function renderLibrary() {
    if (!E.materialsLibrary) {
      return;
    }

    const search =
      lower(
        E.materialSearch?.value
      );

    const category =
      currentCategory();

    const filtered =
      M.filter(
        material =>
          materialMatchesCategory(
            material,
            category
          ) &&
          materialMatchesSearch(
            material,
            search
          )
      );

    E.materialsLibrary.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    filtered.forEach(
      material => {
        fragment.appendChild(
          createMaterialCard(
            material
          )
        );
      }
    );

    E.materialsLibrary.appendChild(
      fragment
    );

    if (E.materialCount) {
      E.materialCount.textContent =
        String(filtered.length);
    }
  }

  /* ================================================================
     RENDU DE L'INVENTAIRE
  ================================================================ */

  function renderInventory() {
    if (!E.inventoryList) {
      return;
    }

    E.inventoryList.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    S.objects.forEach(
      object => {
        const item =
          document.createElement("button");

        item.type = "button";

        item.className =
          "inventory-item";

        if (
          object.id ===
          S.selectedId
        ) {
          item.classList.add(
            "is-selected"
          );
        }

        item.dataset.objectId =
          object.id;

        const material =
          materialById(
            object.materialId
          );

        const title =
          document.createElement("strong");

        title.textContent =
          object.name ||
          material?.name ||
          "Objet";

        const info =
          document.createElement("small");

        const volume =
          calculateVolume(object);

        const mass =
          calculateMass(object);

        const extras = [];

        if (volume > 0) {
          extras.push(
            `${round(volume, 2)} mL`
          );
        }

        if (mass > 0) {
          extras.push(
            `${round(mass, 3)} g`
          );
        }

        info.textContent =
          extras.join(" • ") ||
          object.state ||
          "";

        item.appendChild(title);
        item.appendChild(info);

        item.addEventListener(
          "click",
          () => {
            setSelected(
              object.id
            );
          }
        );

        fragment.appendChild(item);
      }
    );

    E.inventoryList.appendChild(
      fragment
    );

    if (E.inventoryCount) {
      E.inventoryCount.textContent =
        String(S.objects.length);
    }
  }

  /* ================================================================
     RENDU DES OBJETS DANS LE WORKSPACE
  ================================================================ */

  function renderWorkspace() {
    if (!E.workspaceObjects) {
      return;
    }

    E.workspaceObjects.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    S.objects.forEach(
      object => {
        const material =
          materialById(
            object.materialId
          );

        const node =
          document.createElement("div");

        node.className =
          "chem-workspace-object";

        node.dataset.objectId =
          object.id;

        node.style.position =
          "absolute";

        node.style.left =
          `${num(object.x)}px`;

        node.style.top =
          `${num(object.y)}px`;

        node.style.width =
          `${num(object.width, 100)}px`;

        node.style.height =
          `${num(object.height, 80)}px`;

        node.style.setProperty(
          "--material-color",
          object.color ||
          material?.color ||
          "#dcefff"
        );

        if (
          object.id ===
          S.selectedId
        ) {
          node.classList.add(
            "is-selected"
          );
        }

        if (
          object.reaction?.active
        ) {
          node.classList.add(
            "is-reacting"
          );
        }

        if (
          object.reaction?.gas
        ) {
          node.classList.add(
            "has-gas"
          );
        }

        if (
          object.reaction?.precipitate
        ) {
          node.classList.add(
            "has-precipitate"
          );
        }

        const icon =
          document.createElement("div");

        icon.className =
          "chem-object-icon";

        icon.textContent =
          materialIcon(material);

        const title =
          document.createElement("div");

        title.className =
          "chem-object-title";

        title.textContent =
          object.name;

        const formula =
          document.createElement("div");

        formula.className =
          "chem-object-formula";

        formula.textContent =
          object.formula || "";

        const state =
          document.createElement("div");

        state.className =
          "chem-object-state";

        state.textContent =
          object.state || "";

        node.appendChild(icon);
        node.appendChild(title);

        if (object.formula) {
          node.appendChild(
            formula
          );
        }

        node.appendChild(state);

        node.addEventListener(
          "pointerdown",
          event =>
            beginObjectDrag(
              event,
              object
            )
        );

        node.addEventListener(
          "click",
          event => {
            event.stopPropagation();
            setSelected(
              object.id
            );
          }
        );

        fragment.appendChild(node);
      }
    );

    E.workspaceObjects.appendChild(
      fragment
    );
  }

  /* ================================================================
     DRAG DES OBJETS EXISTANTS
  ================================================================ */

  function workspacePoint(event) {
    const rect =
      E.workspaceObjects
        ?.getBoundingClientRect();

    if (!rect) {
      return {
        x: 0,
        y: 0
      };
    }

    return {
      x:
        (event.clientX -
          rect.left) /
        S.zoom,

      y:
        (event.clientY -
          rect.top) /
        S.zoom
    };
  }

  function beginObjectDrag(
    event,
    object
  ) {
    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }

    if (!object) {
      return;
    }

    const point =
      workspacePoint(event);

    S.dragState = {
      type: "object",
      objectId: object.id,
      startX: point.x,
      startY: point.y,
      originX: num(object.x),
      originY: num(object.y),
      moved: false,
      pointerId:
        event.pointerId
    };

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch (_) {
      /* Capture non disponible */
    }

    event.preventDefault();
  }

  function moveObjectDrag(event) {
    const drag =
      S.dragState;

    if (
      !drag ||
      drag.type !== "object"
    ) {
      return;
    }

    const object =
      findObject(
        drag.objectId
      );

    if (!object) {
      return;
    }

    const point =
      workspacePoint(event);

    const dx =
      point.x -
      drag.startX;

    const dy =
      point.y -
      drag.startY;

    if (
      Math.abs(dx) > 3 ||
      Math.abs(dy) > 3
    ) {
      drag.moved = true;
    }

    object.x =
      Math.max(
        0,
        drag.originX + dx
      );

    object.y =
      Math.max(
        0,
        drag.originY + dy
      );

    renderWorkspace();
  }

  function endObjectDrag() {
    const drag =
      S.dragState;

    if (!drag) {
      return;
    }

    if (
      drag.type === "object" &&
      drag.moved
    ) {
      S.suppressLibraryClick =
        true;

      setTimeout(() => {
        S.suppressLibraryClick =
          false;
      }, 100);
    }

    S.dragState = null;

    render();
  }

  /* ================================================================
     DROP D'UN MATÉRIAU DE LA BIBLIOTHÈQUE
  ================================================================ */

  function bindWorkspaceDrop() {
    const target =
      E.workspaceDropZone ||
      E.workspaceObjects ||
      E.laboratoryWorkspace;

    if (!target) {
      return;
    }

    target.addEventListener(
      "dragover",
      event => {
        event.preventDefault();

        if (
          event.dataTransfer
        ) {
          event.dataTransfer.dropEffect =
            "copy";
        }

        target.classList.add(
          "is-drop-target"
        );
      }
    );

    target.addEventListener(
      "dragleave",
      () => {
        target.classList.remove(
          "is-drop-target"
        );
      }
    );

    target.addEventListener(
      "drop",
      event => {
        event.preventDefault();

        target.classList.remove(
          "is-drop-target"
        );

        const materialId =
          event.dataTransfer?.getData(
            "text/plain"
          );

        if (!materialId) {
          return;
        }

        const rect =
          E.workspaceObjects
            ?.getBoundingClientRect();

        if (!rect) {
          add(materialId);
          return;
        }

        const x =
          (event.clientX -
            rect.left) /
          S.zoom;

        const y =
          (event.clientY -
            rect.top) /
          S.zoom;

        add(
          materialId,
          Math.max(0, x - 45),
          Math.max(0, y - 40)
        );
      }
    );
  }

  /* ================================================================
     INSPECTEUR
  ================================================================ */

  function setText(
    node,
    value
  ) {
    if (node) {
      node.textContent =
        value == null
          ? ""
          : String(value);
    }
  }

  function renderInspector() {
    const object =
      selectedObject();

    if (!object) {
      setText(
        E.selectedObjectType,
        "Aucun objet sélectionné"
      );

      if (E.objectInspector) {
        E.objectInspector.style.display =
          "none";
      }

      return;
    }

    if (E.objectInspector) {
      E.objectInspector.style.display =
        "";
    }

    const material =
      materialById(
        object.materialId
      );

    setText(
      E.selectedObjectType,
      object.name
    );

    setText(
      E.propName,
      object.name
    );

    setText(
      E.propState,
      object.state
    );

    setText(
      E.propTemperature,
      `${round(
        object.temperature,
        1
      )} °C`
    );

    setText(
      E.propMass,
      `${round(
        calculateMass(object),
        3
      )} g`
    );

    setText(
      E.propVolume,
      `${round(
        calculateVolume(object),
        2
      )} mL`
    );

    setText(
      E.propDensity,
      object.density > 0
        ? `${round(
            object.density,
            4
          )} g/mL`
        : "—"
    );

    setText(
      E.propPH,
      round(
        calculatePH(object),
        2
      )
    );

    setText(
      E.propColor,
      object.color ||
        material?.color ||
        "—"
    );

    renderComposition(
      object
    );

    renderReaction(
      object
    );

    renderMeasurement(
      object
    );
  }

  /* ================================================================
     COMPOSITION
  ================================================================ */

  function renderComposition(
    object
  ) {
    if (!E.compositionList) {
      return;
    }

    const components =
      object?.composition?.components ||
      {};

    E.compositionList.innerHTML =
      "";

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(
            materialId
          );

        const row =
          document.createElement("div");

        row.className =
          "composition-row";

        const name =
          document.createElement("span");

        name.textContent =
          material?.name ||
          materialId;

        const value =
          document.createElement("span");

        value.textContent =
          `${round(
            quantity,
            4
          )} ${
            material?.kind === "solid"
              ? "g"
              : "mL"
          }`;

        row.appendChild(name);
        row.appendChild(value);

        E.compositionList.appendChild(
          row
        );
      }
    );

    setText(
      E.compositionTotal,
      entries.length
        ? `${entries.length} composant(s)`
        : "Aucun composant"
    );
  }

  /* ================================================================
     RÉACTION DANS L'INSPECTEUR
  ================================================================ */

  function renderReaction(
    object
  ) {
    const reaction =
      object?.reaction;

    if (!reaction) {
      return;
    }

    setText(
      E.reactionStatus,
      reaction.active
        ? "Réaction détectée"
        : "Aucune réaction"
    );

    setText(
      E.reactionPhase,
      reaction.phase ||
        "—"
    );

    setText(
      E.reactionGas,
      reaction.gas ||
        "—"
    );

    setText(
      E.reactionPrecipitate,
      reaction.precipitate ||
        "—"
    );

    setText(
      E.reactionColor,
      reaction.color ||
        "—"
    );
  }

  /* ================================================================
     MESURES
  ================================================================ */

  function measure(
    type = "volume",
    objectId = S.selectedId
  ) {
    const object =
      findObject(objectId);

    if (!object) {
      toast(
        "Aucun objet sélectionné.",
        "warning"
      );
      return null;
    }

    let value = 0;
    let unit = "";

    switch (lower(type)) {
      case "volume":
        value =
          calculateVolume(object);
        unit = "mL";
        break;

      case "temperature":
        value =
          round(
            num(
              object.temperature,
              25
            ),
            1
          );
        unit = "°C";
        break;

      case "ph":
      case "p-h":
        value =
          round(
            calculatePH(object),
            2
          );
        unit = "pH";
        break;

      case "mass":
        value =
          calculateMass(object);
        unit = "g";
        break;

      case "density":
        value =
          round(
            num(
              object.density
            ),
            4
          );
        unit = "g/mL";
        break;

      case "conductivity":
        value =
          estimateConductivity(
            object
          );
        unit = "mS/cm";
        break;

      case "time":
        value =
          0;
        unit = "s";
        break;

      default:
        value = 0;
        unit = "";
    }

    S.measurement = {
      label: type,
      value,
      unit,
      precision:
        unit === "pH"
          ? 2
          : unit === "°C"
            ? 1
            : 2
    };

    object.measurement = {
      ...S.measurement
    };

    renderMeasurement(
      object
    );

    openMeasurementModal();

    log(
      `Mesure : ${value} ${unit}`.trim(),
      "info"
    );

    return S.measurement;
  }

  function estimateConductivity(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    let score = 0;

    Object.entries(
      components
    ).forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(
            materialId
          );

        if (!material) {
          return;
        }

        const category =
          material.chemicalCategory;

        const q =
          num(quantity);

        if (
          category === "salt"
        ) {
          score +=
            q * 12;
        } else if (
          category === "acid"
        ) {
          score +=
            q * 18;
        } else if (
          category === "base"
        ) {
          score +=
            q * 18;
        } else if (
          material.id === "eau"
        ) {
          score +=
            q * 0.01;
        }
      }
    );

    return round(
      clamp(
        score,
        0,
        200
      ),
      2
    );
  }

  function renderMeasurement(
    object
  ) {
    const measurement =
      object?.measurement ||
      S.measurement;

    setText(
      E.measurementLabel,
      measurement?.label ||
        "—"
    );

    setText(
      E.measurementValue,
      measurement?.value ??
        "—"
    );

    setText(
      E.measurementPrecision,
      measurement?.precision ??
        "—"
    );
  }

  function openMeasurementModal() {
    modal(
      E.measurementModal,
      true
    );

    setText(
      E.instrumentScreenLabel,
      S.measurement.label
    );

    setText(
      E.instrumentScreenValue,
      S.measurement.value
    );

    setText(
      E.instrumentScreenUnit,
      S.measurement.unit
    );
  }

  function closeMeasurementModal() {
    modal(
      E.measurementModal,
      false
    );
  }

  /* ================================================================
     MODALE DE TRANSFERT
  ================================================================ */

  function openTransferModal() {
    const source =
      selectedObject();

    if (!source) {
      toast(
        "Sélectionnez d'abord un récipient source.",
        "warning"
      );
      return;
    }

    const volume =
      calculateVolume(source);

    setText(
      E.transferSourceName,
      source.name
    );

    setText(
      E.transferSourceAmount,
      `${round(
        volume,
        2
      )} mL`
    );

    if (E.transferAmount) {
      E.transferAmount.value =
        volume > 0
          ? Math.min(
              10,
              volume
            )
          : 0;
    }

    if (E.transferRange) {
      E.transferRange.min =
        "0";

      E.transferRange.max =
        String(
          round(
            volume,
            2
          )
        );

      E.transferRange.value =
        String(
          volume > 0
            ? Math.min(
                10,
                volume
              )
            : 0
        );
    }

    setText(
      E.transferMaxLabel,
      `${round(
        volume,
        2
      )} mL maximum`
    );

    populateTransferTargets(
      source.id
    );

    modal(
      E.transferModal,
      true
    );
  }

  function populateTransferTargets(
    sourceId
  ) {
    if (!E.transferTarget) {
      return;
    }

    E.transferTarget.innerHTML =
      "";

    S.objects
      .filter(
        object =>
          object.id !== sourceId &&
          isContainer(object)
      )
      .forEach(
        object => {
          const option =
            document.createElement(
              "option"
            );

          option.value =
            object.id;

          option.textContent =
            object.name;

          E.transferTarget.appendChild(
            option
          );
        }
      );
  }

  function closeTransferModal() {
    modal(
      E.transferModal,
      false
    );
  }

  function confirmTransfer() {
    const source =
      selectedObject();

    const target =
      findObject(
        E.transferTarget?.value
      );

    const amount =
      num(
        E.transferAmount?.value
      );

    if (!source || !target) {
      toast(
        "Sélectionnez une source et une cible.",
        "warning"
      );
      return;
    }

    if (
      transfer(
        source.id,
        target.id,
        amount
      )
    ) {
      closeTransferModal();
    }
  }

  /* ================================================================
     ZOOM DU LABORATOIRE
  ================================================================ */

  function applyZoom() {
    const viewport =
      E.workspaceViewport;

    if (!viewport) {
      return;
    }

    viewport.style.setProperty(
      "--chem-zoom",
      String(S.zoom)
    );

    const objects =
      E.workspaceObjects;

    if (objects) {
      objects.style.transform =
        `scale(${S.zoom})`;

      objects.style.transformOrigin =
        "0 0";
    }

    setText(
      E.zoomValue,
      `${Math.round(
        S.zoom * 100
      )}%`
    );
  }

  function zoomIn() {
    S.zoom =
      clamp(
        round(
          S.zoom + 0.1,
          2
        ),
        0.5,
        2.5
      );

    applyZoom();
  }

  function zoomOut() {
    S.zoom =
      clamp(
        round(
          S.zoom - 0.1,
          2
        ),
        0.5,
        2.5
      );

    applyZoom();
  }

  function fitWorkspace() {
    S.zoom = 1;

    if (E.workspaceObjects) {
      E.workspaceObjects.style.transform =
        "scale(1)";
    }

    applyZoom();
  }

  /* ================================================================
     EFFACER LE LABORATOIRE
  ================================================================ */

  function clearWorkspace() {
    if (!S.objects.length) {
      return;
    }

    const confirmed =
      window.confirm(
        "Voulez-vous vraiment vider le laboratoire ?"
      );

    if (!confirmed) {
      return;
    }

    S.objects = [];
    S.selectedId = null;

    render();

    log(
      "Le laboratoire a été vidé.",
      "warning"
    );
  }

  /* ================================================================
     SAUVEGARDE LOCALE
  ================================================================ */

  const STORAGE_KEY =
    "CHIMIQUE_FOBAS_SIMULATION_V1";

  function serializeState() {
    return {
      version:
        S.savedVersion,

      session: {
        ...S.session
      },

      zoom:
        S.zoom,

      objects:
        S.objects.map(
          object => ({
            ...object,
            composition: {
              ...object.composition,
              components: {
                ...object.composition
                  .components
              }
            },
            reaction: {
              ...object.reaction
            },
            measurement: {
              ...object.measurement
            }
          })
        )
    };
  }

  function saveSimulation() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          serializeState()
        )
      );

      log(
        "Session enregistrée localement.",
        "success"
      );

      toast(
        "Session sauvegardée.",
        "success"
      );

      return true;
    } catch (error) {
      console.error(
        "CHIMIQUE FOBAS save error:",
        error
      );

      toast(
        "Impossible d'enregistrer la session.",
        "error"
      );

      return false;
    }
  }

  function loadSimulation() {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return false;
      }

      const data =
        JSON.parse(raw);

      if (
        !data ||
        !Array.isArray(
          data.objects
        )
      ) {
        return false;
      }

      S.objects =
        data.objects.map(
          object => {
            const material =
              materialById(
                object.materialId
              );

            const restored = {
              ...object,

              width:
                num(
                  object.width,
                  100
                ),

              height:
                num(
                  object.height,
                  80
                ),

              x:
                num(
                  object.x
                ),

              y:
                num(
                  object.y
                ),

              temperature:
                num(
                  object.temperature,
                  25
                ),

              composition:
                object.composition ||
                createComposition(),

              reaction:
                object.reaction || {
                  active: false,
                  title: "",
                  equation: "",
                  phase: "",
                  gas: "",
                  precipitate: "",
                  color: ""
                },

              measurement:
                object.measurement || {
                  label: "",
                  value: 0,
                  unit: "",
                  precision: 0
                },

              color:
                object.color ||
                material?.color ||
                "#dcefff"
            };

            ensureComposition(
              restored
            );

            recalculateComposition(
              restored
            );

            return restored;
          }
        );

      S.selectedId = null;

      S.zoom =
        clamp(
          num(
            data.zoom,
            1
          ),
          0.5,
          2.5
        );

      if (data.session) {
        S.session = {
          ...S.session,
          ...data.session
        };
      }

      render();

      log(
        "Session restaurée.",
        "success"
      );

      return true;
    } catch (error) {
      console.error(
        "CHIMIQUE FOBAS load error:",
        error
      );

      toast(
        "La session sauvegardée est invalide.",
        "error"
      );

      return false;
    }
  }

  /* ================================================================
     RÉINITIALISATION
  ================================================================ */

  function resetSimulation() {
    const confirmed =
      window.confirm(
        "Réinitialiser complètement la simulation ?"
      );

    if (!confirmed) {
      return;
    }

    S.objects = [];
    S.selectedId = null;
    S.zoom = 1;

    S.session = {
      name:
        "Session de laboratoire",
      createdAt:
        Date.now()
    };

    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (_) {
      /* localStorage indisponible */
    }

    render();

    log(
      "Simulation réinitialisée.",
      "warning"
    );

    toast(
      "Laboratoire réinitialisé.",
      "success"
    );
  }

  /* ================================================================
     OUTILS DU LABORATOIRE
  ================================================================ */

  function setTool(tool) {
    const validTools = [
      "select",
      "move",
      "transfer",
      "mix",
      "react",
      "measure",
      "heat"
    ];

    if (
      !validTools.includes(tool)
    ) {
      tool = "select";
    }

    S.activeTool =
      tool;

    $$(".tool-button").forEach(
      button => {
        const active =
          button.dataset.tool ===
          tool;

        button.classList.toggle(
          "is-active",
          active
        );

        button.classList.toggle(
          "active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          active
            ? "true"
            : "false"
        );
      }
    );

    log(
      `Outil actif : ${tool}.`,
      "info"
    );
  }

  function useActiveTool(
    objectId
  ) {
    switch (
      S.activeTool
    ) {
      case "transfer":
        openTransferModal();
        break;

      case "mix":
        mix(objectId);
        break;

      case "react":
        react(objectId);
        break;

      case "measure":
        measure(
          "volume",
          objectId
        );
        break;

      case "heat":
        heat(objectId);
        break;

      default:
        setSelected(objectId);
    }
  }

  /* ================================================================
     ÉVÉNEMENTS GLOBAUX
  ================================================================ */

  function bindEvents() {
    E.openMaterialsBtn?.addEventListener(
      "click",
      openLibrary
    );

    E.closeMaterialsBtn?.addEventListener(
      "click",
      closeLibrary
    );

    E.materialsBackdrop?.addEventListener(
      "click",
      closeLibrary
    );

    E.materialSearch?.addEventListener(
      "input",
      renderLibrary
    );

    E.zoomInBtn?.addEventListener(
      "click",
      zoomIn
    );

    E.zoomOutBtn?.addEventListener(
      "click",
      zoomOut
    );

    E.fitWorkspaceBtn?.addEventListener(
      "click",
      fitWorkspace
    );

    E.clearWorkspaceBtn?.addEventListener(
      "click",
      clearWorkspace
    );

    E.actionTransferBtn?.addEventListener(
      "click",
      openTransferModal
    );

    E.actionMixBtn?.addEventListener(
      "click",
      () => mix()
    );

    E.actionMeasureBtn?.addEventListener(
      "click",
      () =>
        measure("volume")
    );

    E.actionHeatBtn?.addEventListener(
      "click",
      () => heat()
    );

    E.actionRemoveBtn?.addEventListener(
      "click",
      () => {
        if (S.selectedId) {
          remove(
            S.selectedId
          );
        }
      }
    );

    E.closeTransferModal?.addEventListener(
      "click",
      closeTransferModal
    );

    E.cancelTransferBtn?.addEventListener(
      "click",
      closeTransferModal
    );

    E.confirmTransferBtn?.addEventListener(
      "click",
      confirmTransfer
    );

    E.transferRange?.addEventListener(
      "input",
      () => {
        if (E.transferAmount) {
          E.transferAmount.value =
            E.transferRange.value;
        }
      }
    );

    E.transferAmount?.addEventListener(
      "input",
      () => {
        if (E.transferRange) {
          E.transferRange.value =
            E.transferAmount.value;
        }
      }
    );

    E.closeMeasurementModal?.addEventListener(
      "click",
      closeMeasurementModal
    );

    E.closeMeasurementBtn?.addEventListener(
      "click",
      closeMeasurementModal
    );

    E.chemHelpBtn?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          true
        )
    );

    E.closeHelpModal?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          false
        )
    );

    E.closeHelpBtn?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          false
        )
    );

    E.chemSaveBtn?.addEventListener(
      "click",
      saveSimulation
    );

    E.chemResetBtn?.addEventListener(
      "click",
      resetSimulation
    );

    $$(".tool-button").forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            setTool(
              button.dataset.tool
            );
          }
        );
      }
    );

    $$(".category-button").forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            $$(".category-button")
              .forEach(
                item => {
                  item.classList.remove(
                    "is-active"
                  );

                  item.classList.remove(
                    "active"
                  );

                  item.setAttribute(
                    "aria-selected",
                    "false"
                  );
                }
              );

            button.classList.add(
              "is-active"
            );

            button.classList.add(
              "active"
            );

            button.setAttribute(
              "aria-selected",
              "true"
            );

            renderLibrary();
          }
        );
      }
    );

    E.workspaceObjects?.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          E.workspaceObjects
        ) {
          setSelected(null);
        }
      }
    );

    document.addEventListener(
      "pointermove",
      moveObjectDrag
    );

    document.addEventListener(
      "pointerup",
      endObjectDrag
    );

    document.addEventListener(
      "pointercancel",
      endObjectDrag
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
          "Escape"
        ) {
          closeLibrary();
          closeTransferModal();
          closeMeasurementModal();
          modal(
            E.helpModal,
            false
          );
        }

        if (
          event.key ===
          "Delete"
        ) {
          if (
            S.selectedId &&
            !(
              event.target instanceof
              HTMLInputElement
            ) &&
            !(
              event.target instanceof
              HTMLTextAreaElement
            )
          ) {
            remove(
              S.selectedId
            );
          }
        }
      }
    );
  }

  /* ================================================================
     ÉTAT DE L'INTERFACE
  ================================================================ */

  function updateLaboratoryState() {
    const hasObjects =
      S.objects.length > 0;

    const reacting =
      S.objects.some(
        object =>
          object.reaction?.active
      );

    if (reacting) {
      setText(
        E.laboratoryStateText,
        "Réaction en cours"
      );

      E.laboratoryStateDot
        ?.classList.add(
          "is-reacting"
        );

      return;
    }

    if (hasObjects) {
      setText(
        E.laboratoryStateText,
        "Laboratoire actif"
      );

      E.laboratoryStateDot
        ?.classList.remove(
          "is-reacting"
        );

      return;
    }

    setText(
      E.laboratoryStateText,
      "Laboratoire prêt"
    );

    E.laboratoryStateDot
      ?.classList.remove(
        "is-reacting"
      );
  }

  /* ================================================================
     STATISTIQUES DU LABORATOIRE
  ================================================================ */

  function renderStatus() {
    const selected =
      selectedObject();

    const totalVolume =
      S.objects.reduce(
        (sum, object) =>
          sum +
          calculateVolume(
            object
          ),
        0
      );

    const totalMass =
      S.objects.reduce(
        (sum, object) =>
          sum +
          calculateMass(
            object
          ),
        0
      );

    const temperature =
      selected
        ? num(
            selected.temperature,
            25
          )
        : 25;

    const ph =
      selected
        ? calculatePH(
            selected
          )
        : 7;

    setText(
      E.statusObjects,
      S.objects.length
    );

    setText(
      E.statusVolume,
      `${round(
        totalVolume,
        2
      )} mL`
    );

    setText(
      E.statusTemperature,
      `${round(
        temperature,
        1
      )} °C`
    );

    setText(
      E.statusPH,
      round(
        ph,
        2
      )
    );

    setText(
      E.statusMass,
      `${round(
        totalMass,
        3
      )} g`
    );
  }

  /* ================================================================
     INDICATEURS VISUELS
  ================================================================ */

  function updateTemperatureOverlay() {
    if (!E.temperatureOverlay) {
      return;
    }

    const selected =
      selectedObject();

    const temperature =
      selected
        ? num(
            selected.temperature,
            25
          )
        : 25;

    const intensity =
      clamp(
        (
          temperature - 25
        ) / 100,
        -1,
        1
      );

    E.temperatureOverlay.style.setProperty(
      "--temperature-intensity",
      String(intensity)
    );

    E.temperatureOverlay.classList.toggle(
      "is-hot",
      temperature > 60
    );

    E.temperatureOverlay.classList.toggle(
      "is-cold",
      temperature < 5
    );
  }

  function updateReactionOverlay() {
    if (!E.reactionOverlay) {
      return;
    }

    const selected =
      selectedObject();

    const active =
      Boolean(
        selected?.reaction?.active
      );

    E.reactionOverlay.classList.toggle(
      "is-active",
      active
    );

    E.reactionOverlay.classList.toggle(
      "has-gas",
      Boolean(
        selected?.reaction?.gas
      )
    );

    E.reactionOverlay.classList.toggle(
      "has-precipitate",
      Boolean(
        selected?.reaction?.precipitate
      )
    );
  }

  /* ================================================================
     RENDU GLOBAL
  ================================================================ */

  function render() {
    S.objects.forEach(
      updateObject
    );

    S.objects.forEach(
      recalculateComposition
    );

    renderLibrary();
    renderInventory();
    renderWorkspace();
    renderInspector();
    renderStatus();

    updateLaboratoryState();
    updateTemperatureOverlay();
    updateReactionOverlay();

    applyZoom();
  }

  /* ================================================================
     VALIDATION DE LA BIBLIOTHÈQUE
  ================================================================ */

  function validateLibrary() {
    const ids =
      new Set();

    const duplicates = [];

    const invalidCategories = [];

    const validCategories = [
      "glassware",
      "reagent",
      "solid",
      "instrument",
      "equipment"
    ];

    M.forEach(
      material => {
        if (
          ids.has(
            material.id
          )
        ) {
          duplicates.push(
            material.id
          );
        }

        ids.add(
          material.id
        );

        if (
          !validCategories.includes(
            material.cat
          )
        ) {
          invalidCategories.push(
            material.id
          );
        }
      }
    );

    const result = {
      totalMaterials:
        M.length,

      duplicateIds:
        duplicates,

      invalidCategories,

      valid:
        duplicates.length === 0 &&
        invalidCategories.length === 0
    };

    if (!result.valid) {
      console.warn(
        "CHIMIQUE FOBAS library validation:",
        result
      );
    }

    return result;
  }

  /* ================================================================
     API PUBLIQUE POUR DEBUG / EXTENSION
  ================================================================ */

  const API = {
    state: S,
    elements: E,
    materials: M,
    reactions: R,

    add,
    remove,
    transfer,
    mix,
    heat,
    react,
    measure,

    save:
      saveSimulation,

    load:
      loadSimulation,

    reset:
      resetSimulation,

    render,

    setTool,

    validateLibrary,

    materialById,

    findObject,

    selectedObject
  };

  /* ================================================================
     EXPOSITION GLOBALE
  ================================================================ */

  window.CHIMIQUE_FOBAS =
    API;

  window.simulationChimicFobas =
    API;

  /* ================================================================
     INITIALISATION
  ================================================================ */

  function init() {
    const validation =
      validateLibrary();

    if (!validation.valid) {
      console.warn(
        "La bibliothèque contient des problèmes.",
        validation
      );
    }

    bindEvents();

    bindWorkspaceDrop();

    setTool("select");

    const loaded =
      loadSimulation();

    if (!loaded) {
      render();

      log(
        "Laboratoire CHIMIQUE FOBAS prêt.",
        "success"
      );
    }

    if (
      E.sessionName &&
      S.session.name
    ) {
      E.sessionName.textContent =
        S.session.name;
    }

    render();
  }

  /* ================================================================
     DÉMARRAGE SÉCURISÉ
  ================================================================ */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();