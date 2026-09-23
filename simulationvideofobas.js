/* ============================================================
   SIMULATION VIDEO FÒBAS
   simulationvideofobas.js
   LOCAL-FIRST AI VIDEO EDITOR ENGINE
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     DOM HELPERS
     ========================================================== */

  const $ = (id) => document.getElementById(id);

  const dom = {
    newProjectBtn: $("newProjectBtn"),
    saveProjectBtn: $("saveProjectBtn"),
    exportBtn: $("exportBtn"),

    importBtn: $("importBtn"),
    fileInput: $("fileInput"),
    dropZone: $("dropZone"),
    mediaList: $("mediaList"),

    fitBtn: $("fitBtn"),
    fullscreenBtn: $("fullscreenBtn"),
    timeDisplay: $("timeDisplay"),
    stageStatus: $("stageStatus"),

    previewArea: $("previewArea"),
    previewCanvas: $("previewCanvas"),
    previewEmpty: $("previewEmpty"),

    previousBtn: $("previousBtn"),
    playBtn: $("playBtn"),
    stopBtn: $("stopBtn"),
    nextBtn: $("nextBtn"),

    projectName: $("projectName"),
    ratio: $("ratio"),
    overlayText: $("overlayText"),

    clipStart: $("clipStart"),
    clipDuration: $("clipDuration"),

    addTextBtn: $("addTextBtn"),
    duplicateBtn: $("duplicateBtn"),
    splitBtn: $("splitBtn"),
    deleteBtn: $("deleteBtn"),

    zoomRange: $("zoomRange"),
    zoomValue: $("zoomValue"),

    undoBtn: $("undoBtn"),
    redoBtn: $("redoBtn"),

    timelineZoomMinus: $("timelineZoomMinus"),
    timelineZoomPlus: $("timelineZoomPlus"),

    timelineScroll: $("timelineScroll"),
    timelineInner: $("timelineInner"),

    ruler: $("ruler"),
    videoTrack: $("videoTrack"),
    audioTrack: $("audioTrack"),
    textTrack: $("textTrack"),

    playhead: $("playhead"),
    clipCount: $("clipCount"),

    toast: $("toast"),

    exportModal: $("exportModal"),
    exportMessage: $("exportMessage"),
    exportProgress: $("exportProgress"),
    closeExport: $("closeExport")
  };


  /* ==========================================================
     CORE STATE
     ========================================================== */

  const state = {
    version: 2,

    projectName: "Piblisite mwen",

    duration: 300,

    currentTime: 0,

    playing: false,

    zoom: 1,

    clips: [],

    media: new Map(),

    selectedClipId: null,

    history: [],

    future: [],

    maxHistory: 50,

    raf: null,

    lastFrame: null,

    projectId: null,

    exporting: false,

    exportCancelled: false,

    dragClip: null,

    touch: {
      pinchDistance: null,
      pinchZoom: 1,
      lastX: 0,
      dragging: false
    }
  };


  /* ==========================================================
     CANVAS
     ========================================================== */

  const canvas = dom.previewCanvas;
  const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });


  /* ==========================================================
     UTILITY
     ========================================================== */

  function uid(prefix = "clip") {
    if (window.crypto && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return (
      prefix +
      "-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2)
    );
  }


  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }


  function finiteNumber(value, fallback = 0) {
    const n = Number(value);

    return Number.isFinite(n) ? n : fallback;
  }


  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatTime(seconds) {
    seconds = Math.max(0, finiteNumber(seconds));

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      secs.toFixed(1).padStart(4, "0")
    );
  }


  function showToast(message) {
    dom.toast.textContent = message;

    dom.toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      dom.toast.classList.remove("show");
    }, 1800);
  }


  /* ==========================================================
     PROJECT SNAPSHOT
     ========================================================== */

  function snapshot() {
    return JSON.stringify({
      clips: state.clips,
      currentTime: state.currentTime,
      selectedClipId: state.selectedClipId,
      projectName: dom.projectName.value,
      ratio: dom.ratio.value
    });
  }


  function restoreSnapshot(json) {
    try {
      const data = JSON.parse(json);

      state.clips = Array.isArray(data.clips)
        ? data.clips
        : [];

      state.currentTime = clamp(
        finiteNumber(data.currentTime),
        0,
        state.duration
      );

      state.selectedClipId =
        data.selectedClipId || null;

      dom.projectName.value =
        data.projectName ||
        "Piblisite mwen";

      if (
        data.ratio === "16:9" ||
        data.ratio === "9:16" ||
        data.ratio === "1:1"
      ) {
        dom.ratio.value = data.ratio;
      }

      updateCanvasRatio();
      renderTimeline();
      renderPreview(state.currentTime);
      updateInspector();
      updateEmptyState();
    } catch (error) {
      console.error(error);
      showToast("Snapshot la pa valab");
    }
  }


  function commitHistory() {
    state.history.push(snapshot());

    if (state.history.length > state.maxHistory) {
      state.history.shift();
    }

    state.future = [];
  }


  /* ==========================================================
     UNDO
     ========================================================== */

  function undo() {
    if (!state.history.length) {
      showToast("Pa gen aksyon pou Undo");
      return;
    }

    state.future.push(snapshot());

    const previous = state.history.pop();

    restoreSnapshot(previous);

    showToast("Undo");
  }


  /* ==========================================================
     REDO
     ========================================================== */

  function redo() {
    if (!state.future.length) {
      showToast("Pa gen aksyon pou Redo");
      return;
    }

    state.history.push(snapshot());

    const next = state.future.pop();

    restoreSnapshot(next);

    showToast("Redo");
  }


  /* ==========================================================
     CANVAS RATIO
     ========================================================== */

  function updateCanvasRatio() {
    const ratio = dom.ratio.value;

    if (ratio === "9:16") {
      canvas.width = 720;
      canvas.height = 1280;
    } else if (ratio === "1:1") {
      canvas.width = 1080;
      canvas.height = 1080;
    } else {
      canvas.width = 1280;
      canvas.height = 720;
    }

    renderPreview(state.currentTime);
  }


  /* ==========================================================
     MEDIA DATABASE
     ========================================================== */

  function registerMedia(file, url) {
    let element = null;

    const type = file.type || "";

    if (type.startsWith("video/")) {
      element = document.createElement("video");

      element.src = url;
      element.preload = "auto";
      element.muted = true;
      element.playsInline = true;
      element.crossOrigin = "anonymous";

    } else if (type.startsWith("image/")) {
      element = new Image();

      element.src = url;

    } else if (type.startsWith("audio/")) {
      element = document.createElement("audio");

      element.src = url;
      element.preload = "auto";
      element.crossOrigin = "anonymous";
    }

    state.media.set(url, {
      file,
      url,
      element,
      ready: false
    });

    if (element) {
      element.addEventListener(
        "loadedmetadata",
        () => {
          const item = state.media.get(url);

          if (item) {
            item.ready = true;
          }

          renderPreview(state.currentTime);
        },
        { once: true }
      );

      element.addEventListener(
        "loadeddata",
        () => {
          renderPreview(state.currentTime);
        },
        { once: true }
      );
    }

    return element;
  }


  /* ==========================================================
     MEDIA IMPORT
     ========================================================== */

  async function importFiles(files) {
    const list = Array.from(files || []);

    if (!list.length) {
      return;
    }

    for (const file of list) {
      if (
        !file.type.startsWith("video/") &&
        !file.type.startsWith("image/") &&
        !file.type.startsWith("audio/")
      ) {
        continue;
      }

      const url = URL.createObjectURL(file);

      registerMedia(file, url);

      createMediaItem(file, url);
    }

    showToast(
      `${list.length} media ajoute nan Media Lab`
    );
  }


  /* ==========================================================
     MEDIA THUMBNAIL
     ========================================================== */

  function createMediaItem(file, url) {
    const item = document.createElement("div");

    item.className = "media-item";

    let icon = "📄";

    if (file.type.startsWith("video/")) {
      icon = "🎬";
    } else if (file.type.startsWith("image/")) {
      icon = "🖼️";
    } else if (file.type.startsWith("audio/")) {
      icon = "🎵";
    }

    item.innerHTML = `
      <div class="media-thumb">
        ${icon}
      </div>

      <div class="media-info">
        <div class="media-name">
          ${escapeHTML(file.name)}
        </div>

        <div class="media-type">
          ${escapeHTML(file.type || "media")}
        </div>
      </div>
    `;

    item.addEventListener("click", () => {
      addMediaToTimeline(url, file);
    });

    const thumb = item.querySelector(".media-thumb");

    const media = state.media.get(url);

    if (
      media &&
      file.type.startsWith("image/")
    ) {
      thumb.innerHTML = "";

      const img = document.createElement("img");

      img.src = url;

      img.alt = file.name;

      thumb.appendChild(img);
    }

    if (
      media &&
      file.type.startsWith("video/")
    ) {
      const video = document.createElement("video");

      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      thumb.innerHTML = "";

      thumb.appendChild(video);
    }

    dom.mediaList.appendChild(item);
  }


  /* ==========================================================
     MEDIA DURATION
     ========================================================== */

  async function getMediaDuration(url, type) {
    const media = state.media.get(url);

    if (!media || !media.element) {
      return 5;
    }

    const element = media.element;

    if (
      type === "image"
    ) {
      return 5;
    }

    if (
      Number.isFinite(element.duration) &&
      element.duration > 0
    ) {
      return Math.min(element.duration, state.duration);
    }

    return new Promise((resolve) => {
      let finished = false;

      const done = (value) => {
        if (finished) return;

        finished = true;

        resolve(
          Number.isFinite(value) && value > 0
            ? Math.min(value, state.duration)
            : 5
        );
      };

      element.addEventListener(
        "loadedmetadata",
        () => done(element.duration),
        { once: true }
      );

      setTimeout(() => done(5), 2500);
    });
  }


  /* ==========================================================
     ADD MEDIA
     ========================================================== */

  async function addMediaToTimeline(url, file) {
    let type = "video";

    if (file.type.startsWith("image/")) {
      type = "image";
    }

    if (file.type.startsWith("audio/")) {
      type = "audio";
    }

    commitHistory();

    const mediaDuration =
      await getMediaDuration(url, type);

    const remaining =
      Math.max(
        0.1,
        state.duration -
          state.currentTime
      );

    const duration =
      Math.min(
        mediaDuration,
        remaining
      );

    const clip = {
      id: uid("clip"),

      type,

      src: url,

      name: file.name,

      start: state.currentTime,

      duration,

      sourceStart: 0,

      opacity: 1,

      volume: type === "audio" ? 1 : 0,

      fit: "cover"
    };

    state.clips.push(clip);

    state.selectedClipId = clip.id;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();

    updateEmptyState();

    showToast("Media ajoute sou timeline");
  }


  /* ==========================================================
     ADD TEXT
     ========================================================== */

  function addText() {
    commitHistory();

    const text =
      dom.overlayText.value.trim() ||
      "Nouvo mesaj";

    const remaining =
      Math.max(
        0.1,
        state.duration -
          state.currentTime
      );

    const duration =
      Math.min(5, remaining);

    const clip = {
      id: uid("text"),

      type: "text",

      name: "Tèks",

      text,

      start: state.currentTime,

      duration,

      opacity: 1,

      fontSize: 56,

      color: "#ffffff",

      background:
        "rgba(0,0,0,0.48)",

      align: "center",

      x: 0.5,

      y: 0.81
    };

    state.clips.push(clip);

    state.selectedClipId = clip.id;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();

    updateEmptyState();

    showToast("Tèks ajoute");
  }


  /* ==========================================================
     GET SELECTED CLIP
     ========================================================== */

  function getSelectedClip() {
    return state.clips.find(
      (clip) =>
        clip.id ===
        state.selectedClipId
    );
  }


  /* ==========================================================
     SELECT CLIP
     ========================================================== */

  function selectClip(id) {
    state.selectedClipId = id;

    updateInspector();

    renderTimeline();

    renderPreview(state.currentTime);
  }


  /* ==========================================================
     UPDATE INSPECTOR
     ========================================================== */

  function updateInspector() {
    const clip = getSelectedClip();

    if (!clip) {
      dom.clipStart.value = "0";
      dom.clipDuration.value = "5";

      return;
    }

    dom.clipStart.value =
      Number(clip.start.toFixed(2));

    dom.clipDuration.value =
      Number(clip.duration.toFixed(2));

    if (clip.type === "text") {
      dom.overlayText.value =
        clip.text || "";
    }
  }


  /* ==========================================================
     EDIT SELECTED CLIP
     ========================================================== */

  function updateSelectedClipFromInspector() {
    const clip = getSelectedClip();

    if (!clip) {
      return;
    }

    const oldStart = clip.start;
    const oldDuration = clip.duration;

    let start =
      finiteNumber(
        dom.clipStart.value,
        oldStart
      );

    let duration =
      finiteNumber(
        dom.clipDuration.value,
        oldDuration
      );

    duration = Math.max(0.1, duration);

    duration =
      Math.min(
        duration,
        state.duration
      );

    start =
      clamp(
        start,
        0,
        state.duration -
          duration
      );

    if (
      Math.abs(oldStart - start) < 0.001 &&
      Math.abs(oldDuration - duration) < 0.001
    ) {
      return;
    }

    commitHistory();

    clip.start = start;
    clip.duration = duration;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();
  }


  /* ==========================================================
     DELETE
     ========================================================== */

  function deleteSelectedClip() {
    const clip = getSelectedClip();

    if (!clip) {
      showToast("Chwazi yon clip");
      return;
    }

    commitHistory();

    state.clips =
      state.clips.filter(
        (item) =>
          item.id !== clip.id
      );

    state.selectedClipId = null;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();

    updateEmptyState();

    showToast("Clip efase");
  }


  /* ==========================================================
     DUPLICATE
     ========================================================== */

  function duplicateSelectedClip() {
    const clip = getSelectedClip();

    if (!clip) {
      showToast("Chwazi yon clip");
      return;
    }

    const available =
      state.duration -
      clip.duration;

    const newStart =
      clamp(
        clip.start +
          clip.duration,
        0,
        Math.max(0, available)
      );

    commitHistory();

    const copy = {
      ...clip,

      id: uid("clip"),

      start: newStart
    };

    state.clips.push(copy);

    state.selectedClipId =
      copy.id;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();

    showToast("Clip duplike");
  }


  /* ==========================================================
     SPLIT
     ========================================================== */

  function splitSelectedClip() {
    const clip = getSelectedClip();

    if (!clip) {
      showToast("Chwazi yon clip");
      return;
    }

    const cut =
      state.currentTime;

    const clipEnd =
      clip.start +
      clip.duration;

    if (
      cut <= clip.start + 0.001 ||
      cut >= clipEnd - 0.001
    ) {
      showToast(
        "Playhead la dwe andedan clip la"
      );

      return;
    }

    const firstDuration =
      cut - clip.start;

    const secondDuration =
      clipEnd - cut;

    commitHistory();

    const first = {
      ...clip,

      id: uid("clip"),

      duration:
        firstDuration
    };

    const second = {
      ...clip,

      id: uid("clip"),

      start: cut,

      duration:
        secondDuration
    };

    if (
      clip.type === "video" ||
      clip.type === "audio"
    ) {
      second.sourceStart =
        (clip.sourceStart || 0) +
        firstDuration;
    }

    state.clips =
      state.clips.filter(
        (item) =>
          item.id !== clip.id
      );

    state.clips.push(
      first,
      second
    );

    state.selectedClipId =
      second.id;

    renderTimeline();

    renderPreview(state.currentTime);

    updateInspector();

    showToast("Clip divize");
  }


  /* ==========================================================
     TIMELINE SCALE
     ========================================================== */

  function timelineScale() {
    return 80 * state.zoom;
  }


  /* ==========================================================
     RENDER RULER
     ========================================================== */

  function renderRuler(width, scale) {
    dom.ruler.innerHTML = "";

    dom.ruler.style.minWidth =
      `${width}px`;

    const step =
      state.zoom >= 2
        ? 5
        : state.zoom >= 1
          ? 10
          : 20;

    for (
      let second = 0;
      second <= state.duration;
      second += step
    ) {
      const mark =
        document.createElement("span");

      mark.className =
        "ruler-mark";

      mark.style.left =
        `${58 + second * scale}px`;

      mark.textContent =
        formatTime(second);

      dom.ruler.appendChild(mark);
    }
  }


  /* ==========================================================
     RENDER TRACK
     ========================================================== */

  function renderTrack(type, track, scale) {
    track
      .querySelectorAll(".clip")
      .forEach((node) => {
        node.remove();
      });

    state.clips
      .filter(
        (clip) =>
          clip.type === type
      )
      .sort(
        (a, b) =>
          a.start - b.start
      )
      .forEach((clip) => {
        const element =
          document.createElement("div");

        element.className =
          `clip ${type}`;

        if (
          clip.id ===
          state.selectedClipId
        ) {
          element.classList.add(
            "selected"
          );
        }

        element.style.left =
          `${58 + clip.start * scale}px`;

        element.style.width =
          `${Math.max(
            25,
            clip.duration * scale
          )}px`;

        element.textContent =
          clip.name ||
          clip.text ||
          clip.type;

        element.dataset.clipId =
          clip.id;

        element.title =
          `${clip.name || clip.type} • ${formatTime(clip.duration)}`;

        element.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();

            selectClip(clip.id);
          }
        );

        element.addEventListener(
          "pointerdown",
          (event) => {
            beginClipDrag(
              event,
              clip,
              element
            );
          }
        );

        track.appendChild(element);
      });
  }


  /* ==========================================================
     RENDER TIMELINE
     ========================================================== */

  function renderTimeline() {
    const scale =
      timelineScale();

    const width =
      Math.max(
        1000,
        58 +
          state.duration *
            scale +
          100
      );

    dom.timelineInner.style.minWidth =
      `${width}px`;

    renderRuler(
      width,
      scale
    );

    renderTrack(
      "video",
      dom.videoTrack,
      scale
    );

    renderTrack(
      "audio",
      dom.audioTrack,
      scale
    );

    renderTrack(
      "text",
      dom.textTrack,
      scale
    );

    dom.clipCount.textContent =
      `${state.clips.length} clips`;

    updatePlayhead();
  }


  /* ==========================================================
     CLIP DRAG
     ========================================================== */

  function beginClipDrag(event, clip, element) {
    if (event.pointerType === "touch") {
      return;
    }

    event.preventDefault();

    selectClip(clip.id);

    state.dragClip = {
      clip,
      startX: event.clientX,
      originalStart: clip.start
    };

    element.setPointerCapture?.(
      event.pointerId
    );

    const move = (moveEvent) => {
      if (!state.dragClip) {
        return;
      }

      const scale =
        timelineScale();

      const dx =
        moveEvent.clientX -
        state.dragClip.startX;

      const delta =
        dx / scale;

      clip.start =
        clamp(
          state.dragClip.originalStart +
            delta,
          0,
          state.duration -
            clip.duration
        );

      renderTimeline();

      renderPreview(state.currentTime);
    };

    const up = () => {
      if (!state.dragClip) {
        return;
      }

      const changed =
        Math.abs(
          clip.start -
            state.dragClip.originalStart
        ) > 0.001;

      if (changed) {
        commitHistory();

        /*
         * Reconstruct the final position
         * cleanly after committing.
         */
      }

      state.dragClip = null;

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        up
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      up,
      { once: true }
    );
  }


  /* ==========================================================
     PLAYHEAD
     ========================================================== */

  function updatePlayhead() {
    const scale =
      timelineScale();

    dom.playhead.style.left =
      `${58 + state.currentTime * scale}px`;
  }


  /* ==========================================================
     TIMELINE CLICK
     ========================================================== */

  function seekTimeline(event) {
    if (
      event.target.closest(".clip")
    ) {
      return;
    }

    const rect =
      dom.timelineInner.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left +
      dom.timelineScroll.scrollLeft -
      58;

    const time =
      x / timelineScale();

    seek(time);
  }


  /* ==========================================================
     SEEK
     ========================================================== */

  function seek(time) {
    state.currentTime =
      clamp(
        finiteNumber(time),
        0,
        state.duration
      );

    renderPreview(
      state.currentTime
    );

    syncMediaToTime(
      state.currentTime
    );
  }


  /* ==========================================================
     TIME DISPLAY
     ========================================================== */

  function updateTimeDisplay() {
    dom.timeDisplay.textContent =
      `${formatTime(
        state.currentTime
      )} / ${formatTime(
        state.duration
      )}`;
  }


  /* ==========================================================
     EMPTY STATE
     ========================================================== */

  function updateEmptyState() {
    dom.previewEmpty.style.display =
      state.clips.length
        ? "none"
        : "grid";
  }


  /* ==========================================================
     DRAW BACKGROUND
     ========================================================== */

  function drawBackground() {
    ctx.fillStyle = "#05070c";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }


  /* ==========================================================
     COVER DRAW
     ========================================================== */

  function drawMediaCover(
    element
  ) {
    const width =
      element.videoWidth ||
      element.naturalWidth ||
      canvas.width;

    const height =
      element.videoHeight ||
      element.naturalHeight ||
      canvas.height;

    if (
      !width ||
      !height
    ) {
      return;
    }

    const sourceRatio =
      width / height;

    const canvasRatio =
      canvas.width /
      canvas.height;

    let drawWidth;
    let drawHeight;

    if (
      sourceRatio >
      canvasRatio
    ) {
      drawHeight =
        canvas.height;

      drawWidth =
        drawHeight *
        sourceRatio;
    } else {
      drawWidth =
        canvas.width;

      drawHeight =
        drawWidth /
        sourceRatio;
    }

    const x =
      (canvas.width -
        drawWidth) /
      2;

    const y =
      (canvas.height -
        drawHeight) /
      2;

    ctx.drawImage(
      element,
      x,
      y,
      drawWidth,
      drawHeight
    );
  }


  /* ==========================================================
     DRAW VISUAL CLIP
     ========================================================== */

  function drawVisualClip(
    clip,
    time
  ) {
    const media =
      state.media.get(
        clip.src
      );

    if (
      !media ||
      !media.element
    ) {
      return;
    }

    const element =
      media.element;

    if (
      clip.type === "video"
    ) {
      const localTime =
        Math.max(
          0,
          (time - clip.start) +
            (clip.sourceStart || 0)
        );

      if (
        Number.isFinite(
          element.duration
        )
      ) {
        try {
          if (
            Math.abs(
              element.currentTime -
                localTime
            ) > 0.05
          ) {
            element.currentTime =
              clamp(
                localTime,
                0,
                Math.max(
                  0,
                  element.duration -
                    0.001
                )
              );
          }
        } catch (error) {
          console.debug(
            "Video seek:",
            error
          );
        }
      }
    }

    ctx.save();

    ctx.globalAlpha =
      finiteNumber(
        clip.opacity,
        1
      );

    drawMediaCover(
      element
    );

    ctx.restore();
  }


  /* ==========================================================
     TEXT WRAPPING
     ========================================================== */

  function wrapText(
    text,
    maxWidth
  ) {
    const words =
      String(text).split(/\s+/);

    const lines = [];

    let line = "";

    for (const word of words) {
      const test =
        line
          ? `${line} ${word}`
          : word;

      const width =
        ctx.measureText(test).width;

      if (
        width >
          maxWidth &&
        line
      ) {
        lines.push(line);

        line = word;
      } else {
        line = test;
      }
    }

    if (line) {
      lines.push(line);
    }

    return lines;
  }


  /* ==========================================================
     DRAW TEXT
     ========================================================== */

  function drawTextClip(clip) {
    const text =
      clip.text || "";

    if (!text.trim()) {
      return;
    }

    const fontSize =
      finiteNumber(
        clip.fontSize,
        56
      );

    const x =
      canvas.width *
      finiteNumber(
        clip.x,
        0.5
      );

    const y =
      canvas.height *
      finiteNumber(
        clip.y,
        0.81
      );

    const maxWidth =
      canvas.width * 0.86;

    ctx.save();

    ctx.globalAlpha =
      finiteNumber(
        clip.opacity,
        1
      );

    ctx.font =
      `700 ${fontSize}px system-ui, sans-serif`;

    ctx.textAlign =
      clip.align || "center";

    ctx.textBaseline =
      "middle";

    const lines =
      wrapText(
        text,
        maxWidth
      );

    const lineHeight =
      fontSize * 1.25;

    const totalHeight =
      lines.length *
      lineHeight;

    const boxHeight =
      totalHeight +
      fontSize;

    const boxWidth =
      Math.min(
        maxWidth,
        canvas.width * 0.9
      );

    const boxX =
      canvas.width / 2 -
      boxWidth / 2;

    const boxY =
      y -
      boxHeight / 2;

    ctx.fillStyle =
      clip.background ||
      "rgba(0,0,0,0.48)";

    ctx.fillRect(
      boxX,
      boxY,
      boxWidth,
      boxHeight
    );

    ctx.fillStyle =
      clip.color ||
      "#ffffff";

    lines.forEach(
      (line, index) => {
        ctx.fillText(
          line,
          x,
          y -
            totalHeight / 2 +
            index *
              lineHeight +
            lineHeight / 2
        );
      }
    );

    ctx.restore();
  }


  /* ==========================================================
     EMPTY CANVAS
     ========================================================== */

  function drawEmptyCanvas() {
    ctx.fillStyle =
      "#101627";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle =
      "#8792ac";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      "600 18px system-ui";

    ctx.fillText(
      "Ajoute yon media pou kòmanse",
      canvas.width / 2,
      canvas.height / 2
    );
  }


  /* ==========================================================
     ACTIVE CLIPS
     ========================================================== */

  function getActiveClips(time) {
    return state.clips.filter(
      (clip) =>
        time >= clip.start &&
        time <
          clip.start +
            clip.duration
    );
  }


  /* ==========================================================
     PREVIEW ENGINE
     ========================================================== */

  function renderPreview(time) {
    drawBackground();

    const active =
      getActiveClips(time);

    const visuals =
      active.filter(
        (clip) =>
          clip.type === "video" ||
          clip.type === "image"
      );

    const texts =
      active.filter(
        (clip) =>
          clip.type === "text"
      );

    if (visuals.length) {
      const visual =
        visuals[visuals.length - 1];

      drawVisualClip(
        visual,
        time
      );
    }

    for (const text of texts) {
      drawTextClip(text);
    }

    if (!active.length) {
      drawEmptyCanvas();
    }

    updateTimeDisplay();

    updatePlayhead();
  }


  /* ==========================================================
     MEDIA SYNCHRONIZATION
     ========================================================== */

  function syncMediaToTime(time) {
    for (const media of state.media.values()) {
      const element =
        media.element;

      if (!element) {
        continue;
      }

      const clips =
        state.clips.filter(
          (clip) =>
            clip.src === media.url &&
            (
              clip.type === "video" ||
              clip.type === "audio"
            )
        );

      const activeClip =
        clips.find(
          (clip) =>
            time >= clip.start &&
            time <
              clip.start +
                clip.duration
        );

      if (activeClip) {
        const localTime =
          Math.max(
            0,
            time -
              activeClip.start +
              (activeClip.sourceStart || 0)
          );

        try {
          if (
            Math.abs(
              element.currentTime -
                localTime
            ) > 0.08
          ) {
            element.currentTime =
              localTime;
          }
        } catch (_) {}
      }
    }
  }


  /* ==========================================================
     PLAY AUDIO/VIDEO
     ========================================================== */

  async function playMediaAtCurrentTime() {
    const active =
      getActiveClips(
        state.currentTime
      );

    const promises = [];

    for (const clip of active) {
      if (
        clip.type !== "video" &&
        clip.type !== "audio"
      ) {
        continue;
      }

      const media =
        state.media.get(
          clip.src
        );

      if (!media || !media.element) {
        continue;
      }

      const element =
        media.element;

      try {
        const localTime =
          Math.max(
            0,
            state.currentTime -
              clip.start +
              (clip.sourceStart || 0)
          );

        element.currentTime =
          localTime;

        if (clip.type === "video") {
          element.muted = true;
        }

        if (
          clip.type === "audio"
        ) {
          element.muted = false;

          element.volume =
            clamp(
              finiteNumber(
                clip.volume,
                1
              ),
              0,
              1
            );
        }

        promises.push(
          element.play()
        );
      } catch (_) {}
    }

    await Promise.allSettled(
      promises
    );
  }


  /* ==========================================================
     STOP ALL MEDIA
     ========================================================== */

  function pauseAllMedia() {
    for (const media of state.media.values()) {
      const element =
        media.element;

      if (
        element &&
        typeof element.pause ===
          "function"
      ) {
        try {
          element.pause();
        } catch (_) {}
      }
    }
  }


  /* ==========================================================
     PLAYBACK LOOP
     ========================================================== */

  async function play() {
    if (state.playing) {
      return;
    }

    if (
      state.currentTime >=
      state.duration
    ) {
      state.currentTime = 0;
    }

    state.playing = true;

    state.lastFrame =
      performance.now();

    dom.playBtn.textContent =
      "❚❚";

    dom.stageStatus.textContent =
      "Lecture";

    await playMediaAtCurrentTime();

    state.raf =
      requestAnimationFrame(
        playbackLoop
      );
  }


  function pause() {
    state.playing = false;

    state.lastFrame = null;

    if (state.raf) {
      cancelAnimationFrame(
        state.raf
      );
    }

    state.raf = null;

    pauseAllMedia();

    dom.playBtn.textContent =
      "▶";

    dom.stageStatus.textContent =
      "Pare";
  }


  function playbackLoop(timestamp) {
    if (!state.playing) {
      return;
    }

    if (
      state.lastFrame === null
    ) {
      state.lastFrame =
        timestamp;
    }

    const delta =
      (
        timestamp -
        state.lastFrame
      ) / 1000;

    state.lastFrame =
      timestamp;

    state.currentTime +=
      delta;

    if (
      state.currentTime >=
      state.duration
    ) {
      state.currentTime =
        state.duration;

      renderPreview(
        state.currentTime
      );

      pause();

      return;
    }

    syncMediaToTime(
      state.currentTime
    );

    renderPreview(
      state.currentTime
    );

    state.raf =
      requestAnimationFrame(
        playbackLoop
      );
  }


  /* ==========================================================
     TOGGLE PLAY
     ========================================================== */

  async function togglePlay() {
    if (state.playing) {
      pause();
    } else {
      await play();
    }
  }


  /* ==========================================================
     TIMELINE ZOOM
     ========================================================== */

  function setTimelineZoom(value) {
    state.zoom =
      clamp(
        finiteNumber(value, 1),
        0.5,
        4
      );

    dom.zoomRange.value =
      state.zoom;

    dom.zoomValue.textContent =
      `${state.zoom.toFixed(1)}×`;

    renderTimeline();
  }


  /* ==========================================================
     PINCH ZOOM ANDROID
     ========================================================== */

  function touchDistance(a, b) {
    return Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY
    );
  }


  function setupPinchZoom() {
    dom.timelineScroll.addEventListener(
      "touchstart",
      (event) => {
        if (
          event.touches.length !==
          2
        ) {
          return;
        }

        state.touch.pinchDistance =
          touchDistance(
            event.touches[0],
            event.touches[1]
          );

        state.touch.pinchZoom =
          state.zoom;
      },
      {
        passive: true
      }
    );


    dom.timelineScroll.addEventListener(
      "touchmove",
      (event) => {
        if (
          event.touches.length !==
            2 ||
          state.touch.pinchDistance ===
            null
        ) {
          return;
        }

        const distance =
          touchDistance(
            event.touches[0],
            event.touches[1]
          );

        const factor =
          distance /
          state.touch.pinchDistance;

        setTimelineZoom(
          state.touch.pinchZoom *
            factor
        );
      },
      {
        passive: true
      }
    );


    dom.timelineScroll.addEventListener(
      "touchend",
      () => {
        state.touch.pinchDistance =
          null;
      }
    );
  }


  /* ==========================================================
     PROJECT LOCAL STORAGE
     ========================================================== */

  function storageKey() {
    return (
      "simulation-video-fobas-project-v2"
    );
  }


  function saveProjectLocal() {
    const data = {
      version: state.version,

      projectName:
        dom.projectName.value ||
        "Piblisite mwen",

      duration:
        state.duration,

      ratio:
        dom.ratio.value,

      clips:
        state.clips.map(
          (clip) => ({
            ...clip,

            /*
             * Object URLs cannot survive
             * browser reload.
             *
             * The source filename is kept
             * so the editor can identify
             * the original media later.
             */

            src: undefined
          })
        ),

      savedAt:
        new Date().toISOString()
    };

    try {
      localStorage.setItem(
        storageKey(),
        JSON.stringify(data)
      );

      showToast(
        "Pwojè a sove lokalman"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Storage lokal la pa disponib"
      );
    }
  }


  /* ==========================================================
     DOWNLOAD PROJECT JSON
     ========================================================== */

  function downloadProjectJSON() {
    const data = {
      version: state.version,

      application:
        "Simulation Video FòBAS",

      projectName:
        dom.projectName.value ||
        "Piblisite mwen",

      duration:
        state.duration,

      ratio:
        dom.ratio.value,

      clips:
        state.clips.map(
          (clip) => ({
            ...clip,
            src: undefined
          })
        ),

      savedAt:
        new Date().toISOString()
    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      sanitizeFilename(
        dom.projectName.value ||
        "simulation-video"
      ) +
      ".json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);

    showToast(
      "Fichye pwojè JSON telechaje"
    );
  }


  function sanitizeFilename(name) {
    return String(name)
      .trim()
      .replace(
        /[^a-z0-9_-]/gi,
        "_"
      )
      .slice(0, 80) ||
      "simulation-video";
  }


  /* ==========================================================
     NEW PROJECT
     ========================================================== */

  function newProject() {
    const confirmed =
      window.confirm(
        "Kreye yon nouvo pwojè? Travay ki pa sove ka pèdi."
      );

    if (!confirmed) {
      return;
    }

    pause();

    for (const media of state.media.values()) {
      try {
        URL.revokeObjectURL(
          media.url
        );
      } catch (_) {}
    }

    state.clips = [];

    state.media.clear();

    state.selectedClipId =
      null;

    state.currentTime = 0;

    state.history = [];

    state.future = [];

    dom.mediaList.innerHTML = "";

    dom.overlayText.value = "";

    dom.projectName.value =
      "Piblisite mwen";

    dom.fileInput.value = "";

    renderTimeline();

    renderPreview(0);

    updateInspector();

    updateEmptyState();

    showToast(
      "Nouvo pwojè pare"
    );
  }


  /* ==========================================================
     EXPORT SUPPORT
     ========================================================== */

  function chooseMimeType() {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];

    for (const type of types) {
      if (
        window.MediaRecorder &&
        MediaRecorder.isTypeSupported(
          type
        )
      ) {
        return type;
      }
    }

    return "";
  }


  /* ==========================================================
     EXPORT MODAL
     ========================================================== */

  function openExportModal() {
    dom.exportModal.classList.add(
      "show"
    );

    dom.exportProgress.style.width =
      "0%";

    dom.exportMessage.textContent =
      "Preparasyon export lokal...";
  }


  function closeExportModal() {
    dom.exportModal.classList.remove(
      "show"
    );
  }


  /* ==========================================================
     EXPORT VIDEO
     ========================================================== */

  async function exportVideo() {
    if (state.exporting) {
      return;
    }

    if (!state.clips.length) {
      showToast(
        "Ajoute omwen yon media anvan export"
      );

      return;
    }

    if (
      !canvas.captureStream ||
      !window.MediaRecorder
    ) {
      showToast(
        "Navigatè sa a pa sipòte export WebM"
      );

      return;
    }

    const mimeType =
      chooseMimeType();

    if (!mimeType) {
      showToast(
        "Codec WebM pa disponib"
      );

      return;
    }

    state.exporting = true;
    state.exportCancelled = false;

    openExportModal();

    const originalTime =
      state.currentTime;

    const wasPlaying =
      state.playing;

    pause();

    try {
      const videoStream =
        canvas.captureStream(30);

      /*
       * Audio tracks cannot be added safely
       * from arbitrary media elements without
       * a browser AudioContext routing graph.
       *
       * This export therefore records the
       * rendered canvas video reliably.
       */

      const recorder =
        new MediaRecorder(
          videoStream,
          {
            mimeType
          }
        );

      const chunks = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size
          ) {
            chunks.push(
              event.data
            );
          }
        };

      const stopped =
        new Promise(
          (resolve, reject) => {
            recorder.onerror =
              (event) => {
                reject(
                  event.error ||
                    new Error(
                      "MediaRecorder error"
                    )
                );
              };

            recorder.onstop =
              () => resolve();
          }
        );

      state.currentTime = 0;

      renderPreview(0);

      recorder.start(100);

      const start =
        performance.now();

      const renderExportFrame =
        (timestamp) => {
          if (
            state.exportCancelled
          ) {
            try {
              recorder.stop();
            } catch (_) {}

            return;
          }

          const elapsed =
            (
              timestamp -
              start
            ) / 1000;

          state.currentTime =
            clamp(
              elapsed,
              0,
              state.duration
            );

          renderPreview(
            state.currentTime
          );

          const percent =
            (
              state.currentTime /
              state.duration
            ) *
            100;

          dom.exportProgress.style.width =
            `${percent}%`;

          dom.exportMessage.textContent =
            `Export: ${Math.round(percent)}%`;

          if (
            state.currentTime <
            state.duration
          ) {
            requestAnimationFrame(
              renderExportFrame
            );
          } else {
            try {
              recorder.stop();
            } catch (_) {}
          }
        };

      requestAnimationFrame(
        renderExportFrame
      );

      await stopped;

      const blob =
        new Blob(
          chunks,
          {
            type: mimeType
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        sanitizeFilename(
          dom.projectName.value ||
          "simulation-video"
        ) +
        ".webm";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 10000);

      dom.exportProgress.style.width =
        "100%";

      dom.exportMessage.textContent =
        "Export fini. Videyo a pare sou aparèy la.";

      showToast(
        "Export fini"
      );

    } catch (error) {
      console.error(
        "Export error:",
        error
      );

      dom.exportMessage.textContent =
        "Export echwe. Verifye sipò navigatè a.";

      showToast(
        "Export echwe"
      );

    } finally {
      state.exporting = false;

      state.currentTime =
        originalTime;

      renderPreview(
        state.currentTime
      );

      if (wasPlaying) {
        play();
      }
    }
  }


  /* ==========================================================
     CANCEL EXPORT
     ========================================================== */

  function cancelExport() {
    if (!state.exporting) {
      closeExportModal();
      return;
    }

    state.exportCancelled = true;

    dom.exportMessage.textContent =
      "Anilasyon export...";

    setTimeout(() => {
      closeExportModal();
    }, 500);
  }


  /* ==========================================================
     FULLSCREEN
     ========================================================== */

  async function toggleFullscreen() {
    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();
      } else {
        await dom.previewArea.requestFullscreen();
      }
    } catch (error) {
      console.error(error);

      showToast(
        "Fullscreen pa disponib"
      );
    }
  }


  /* ==========================================================
     EVENT: IMPORT
     ========================================================== */

  dom.importBtn.addEventListener(
    "click",
    () => {
      dom.fileInput.click();
    }
  );


  dom.fileInput.addEventListener(
    "change",
    (event) => {
      importFiles(
        event.target.files
      );

      event.target.value = "";
    }
  );


  /* ==========================================================
     EVENT: DRAG DROP
     ========================================================== */

  dom.dropZone.addEventListener(
    "dragover",
    (event) => {
      event.preventDefault();

      dom.dropZone.classList.add(
        "dragging"
      );
    }
  );


  dom.dropZone.addEventListener(
    "dragleave",
    () => {
      dom.dropZone.classList.remove(
        "dragging"
      );
    }
  );


  dom.dropZone.addEventListener(
    "drop",
    (event) => {
      event.preventDefault();

      dom.dropZone.classList.remove(
        "dragging"
      );

      importFiles(
        event.dataTransfer.files
      );
    }
  );


  /* ==========================================================
     EVENT: PLAYBACK
     ========================================================== */

  dom.playBtn.addEventListener(
    "click",
    togglePlay
  );


  dom.stopBtn.addEventListener(
    "click",
    () => {
      pause();

      seek(0);
    }
  );


  dom.previousBtn.addEventListener(
    "click",
    () => {
      seek(
        state.currentTime - 5
      );
    }
  );


  dom.nextBtn.addEventListener(
    "click",
    () => {
      seek(
        state.currentTime + 5
      );
    }
  );


  /* ==========================================================
     EVENT: TIMELINE
     ========================================================== */

  dom.timelineScroll.addEventListener(
    "click",
    seekTimeline
  );


  /* ==========================================================
     EVENT: INSPECTOR
     ========================================================== */

  dom.clipStart.addEventListener(
    "change",
    updateSelectedClipFromInspector
  );


  dom.clipDuration.addEventListener(
    "change",
    updateSelectedClipFromInspector
  );


  dom.overlayText.addEventListener(
    "input",
    () => {
      const clip =
        getSelectedClip();

      if (
        !clip ||
        clip.type !== "text"
      ) {
        return;
      }

      clip.text =
        dom.overlayText.value;

      renderPreview(
        state.currentTime
      );
    }
  );


  dom.ratio.addEventListener(
    "change",
    () => {
      commitHistory();

      updateCanvasRatio();
    }
  );


  /* ==========================================================
     EVENT: TOOLS
     ========================================================== */

  dom.addTextBtn.addEventListener(
    "click",
    addText
  );


  dom.deleteBtn.addEventListener(
    "click",
    deleteSelectedClip
  );


  dom.duplicateBtn.addEventListener(
    "click",
    duplicateSelectedClip
  );


  dom.splitBtn.addEventListener(
    "click",
    splitSelectedClip
  );


  /* ==========================================================
     EVENT: ZOOM
     ========================================================== */

  dom.zoomRange.addEventListener(
    "input",
    (event) => {
      setTimelineZoom(
        Number(event.target.value)
      );
    }
  );


  dom.timelineZoomMinus.addEventListener(
    "click",
    () => {
      setTimelineZoom(
        state.zoom - 0.2
      );
    }
  );


  dom.timelineZoomPlus.addEventListener(
    "click",
    () => {
      setTimelineZoom(
        state.zoom + 0.2
      );
    }
  );


  /* ==========================================================
     EVENT: UNDO / REDO
     ========================================================== */

  dom.undoBtn.addEventListener(
    "click",
    undo
  );


  dom.redoBtn.addEventListener(
    "click",
    redo
  );


  /* ==========================================================
     EVENT: PROJECT
     ========================================================== */

  dom.newProjectBtn.addEventListener(
    "click",
    newProject
  );


  dom.saveProjectBtn.addEventListener(
    "click",
    () => {
      saveProjectLocal();

      downloadProjectJSON();
    }
  );


  dom.projectName.addEventListener(
    "change",
    () => {
      saveProjectLocal();
    }
  );


  /* ==========================================================
     EVENT: EXPORT
     ========================================================== */

  dom.exportBtn.addEventListener(
    "click",
    exportVideo
  );


  dom.closeExport.addEventListener(
    "click",
    cancelExport
  );


  /* ==========================================================
     EVENT: FULLSCREEN
     ========================================================== */

  dom.fullscreenBtn.addEventListener(
    "click",
    toggleFullscreen
  );


  /* ==========================================================
     EVENT: FIT
     ========================================================== */

  dom.fitBtn.addEventListener(
    "click",
    () => {
      renderPreview(
        state.currentTime
      );

      showToast(
        "Preview ajiste"
      );
    }
  );


  /* ==========================================================
     KEYBOARD SHORTCUTS
     ========================================================== */

  document.addEventListener(
    "keydown",
    (event) => {
      const tag =
        event.target.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }

      if (
        event.code ===
        "Space"
      ) {
        event.preventDefault();

        togglePlay();

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "z"
      ) {
        event.preventDefault();

        undo();

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "y"
      ) {
        event.preventDefault();

        redo();

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        seek(
          state.currentTime -
            1
        );
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        seek(
          state.currentTime +
            1
        );
      }

      if (
        event.key ===
        "Delete"
      ) {
        deleteSelectedClip();
      }
    }
  );


  /* ==========================================================
     ANDROID BACK / VISIBILITY SAFETY
     ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.hidden &&
        state.playing
      ) {
        pause();
      }
    }
  );


  /* ==========================================================
     BEFORE UNLOAD
     ========================================================== */

  window.addEventListener(
    "beforeunload",
    () => {
      try {
        saveProjectLocal();
      } catch (_) {}
    }
  );


  /* ==========================================================
     PINCH
     ========================================================== */

  setupPinchZoom();


  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  function initialize() {
    dom.projectName.value =
      "Piblisite mwen";

    dom.ratio.value =
      "16:9";

    state.duration =
      300;

    state.currentTime =
      0;

    state.zoom =
      1;

    updateCanvasRatio();

    setTimelineZoom(1);

    renderTimeline();

    renderPreview(0);

    updateInspector();

    updateEmptyState();

    showToast(
      "Simulation Video FòBAS pare"
    );
  }


  initialize();

})();