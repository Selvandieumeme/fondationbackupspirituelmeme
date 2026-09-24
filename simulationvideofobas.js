"use strict";

/*
============================================================
 FÒBAS AI VIDEO STUDIO
 Local-first video creation engine
 -----------------------------------------------------------
 - Canvas video compositor
 - Scene system
 - Timeline
 - Local project persistence
 - Image / video / audio import
 - Text rendering
 - Backgrounds
 - TTS preview
 - Audio mixing
 - MediaRecorder export
 - Android-friendly download
 - Touch pinch zoom
 - Drag & drop
 - Autosave
============================================================
*/


/* ==========================================================
   DOM HELPERS
========================================================== */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [
  ...document.querySelectorAll(selector)
];


/* ==========================================================
   CORE ELEMENTS
========================================================== */

const stage = $("#stage");
const ctx = stage.getContext("2d", {
  alpha: false
});

const stageWrap = $("#stageWrap");


/* ==========================================================
   APPLICATION STATE
========================================================== */

const state = {

  project: {
    id: crypto.randomUUID(),
    name: "Untitled Project",
    duration: 30,
    format: "16:9",
    background: "aurora"
  },

  scenes: [],

  media: [],

  selectedScene: 0,

  currentTime: 0,

  playing: false,

  exporting: false,

  zoom: 1,

  lastFrameTime: 0,

  animationFrame: null,

  autosaveTimer: null,

  audioContext: null,

  audioDestination: null,

  audioSources: [],

  exportAudioStream: null,

  videoStream: null,

  recorder: null,

  exportChunks: [],

  touches: {
    distance: 0,
    zoom: 1
  }

};


/* ==========================================================
   CONSTANTS
========================================================== */

const MAX_PROJECT_DURATION = 180;

const FPS = 30;

const backgrounds = {

  aurora: [
    "#17164b",
    "#00b894",
    "#6c5ce7"
  ],

  sunset: [
    "#ff6b6b",
    "#feca57",
    "#5f27cd"
  ],

  ocean: [
    "#001f3f",
    "#0074d9",
    "#7fdbff"
  ],

  neon: [
    "#050505",
    "#ff00cc",
    "#00ffff"
  ],

  dark: [
    "#090b12",
    "#151a28",
    "#05070c"
  ],

  paper: [
    "#f7f1e3",
    "#c8d6e5",
    "#9aa7b8"
  ]

};


/* ==========================================================
   BASIC UTILITIES
========================================================== */

function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(max, value)
  );

}


function uid(prefix = "id") {

  if (
    window.crypto &&
    typeof crypto.randomUUID === "function"
  ) {

    return `${prefix}_${crypto.randomUUID()}`;

  }

  return (
    `${prefix}_${Date.now()}_` +
    `${Math.random().toString(36).slice(2)}`
  );

}


function formatTime(seconds) {

  seconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const minutes = Math.floor(
    seconds / 60
  );

  const secs = Math.floor(
    seconds % 60
  );

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );

}


function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function showToast(message) {

  const toast = $("#toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    showToast.timer
  );

  showToast.timer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);

}


/* ==========================================================
   VIDEO FORMAT
========================================================== */

function getDimensions() {

  switch (state.project.format) {

    case "9:16":
      return [720, 1280];

    case "1:1":
      return [900, 900];

    default:
      return [1280, 720];

  }

}


function resizeCanvas() {

  const [
    width,
    height
  ] = getDimensions();

  stage.width = width;
  stage.height = height;

  drawFrame(
    state.currentTime
  );

}


/* ==========================================================
   SCENE FACTORY
========================================================== */

function createScene({
  start = 0,
  duration = 5,
  text = "Nouvo scene",
  fontSize = 54,
  textAlign = "center",
  mediaId = null,
  audioId = null,
  animation = "fade"
} = {}) {

  return {

    id: uid("scene"),

    start,

    duration,

    text,

    fontSize,

    textAlign,

    mediaId,

    audioId,

    animation,

    textColor: "#ffffff",

    overlayOpacity: 0.32,

    positionX: 0.5,

    positionY: 0.5

  };

}


function createDefaultScenes() {

  const duration =
    clamp(
      Number(
        state.project.duration
      ) || 30,
      1,
      MAX_PROJECT_DURATION
    );

  const texts = [

    "Kreye yon mesaj ki fè moun sonje mak ou.",

    "Montre sa ki fè pwodwi ou espesyal.",

    "Fè moun dekouvri valè ou.",

    "Aji kounye a. Kontakte nou jodi a."

  ];

  const count = Math.min(
    texts.length,
    Math.max(
      1,
      Math.ceil(duration / 7.5)
    )
  );

  const sceneDuration =
    duration / count;

  return texts
    .slice(0, count)
    .map((text, index) =>
      createScene({
        start:
          index * sceneDuration,

        duration:
          sceneDuration,

        text
      })
    );

}


/* ==========================================================
   SCENE HELPERS
========================================================== */

function getCurrentScene() {

  return (
    state.scenes[
      state.selectedScene
    ] || null
  );

}


function getSceneAtTime(time) {

  if (!state.scenes.length) {
    return null;
  }

  return (
    state.scenes.find(scene =>
      time >= scene.start &&
      time <
        scene.start +
        scene.duration
    ) ||
    state.scenes[
      state.scenes.length - 1
    ]
  );

}


function normalizeSceneTimes() {

  let cursor = 0;

  state.scenes.forEach(scene => {

    scene.start = cursor;

    scene.duration =
      Math.max(
        0.25,
        Number(scene.duration) || 0.25
      );

    cursor += scene.duration;

  });

  state.project.duration =
    clamp(
      cursor,
      0.25,
      MAX_PROJECT_DURATION
    );

}


/* ==========================================================
   BACKGROUND
========================================================== */

function makeGradient(
  width,
  height
) {

  const colors =
    backgrounds[
      state.project.background
    ] ||
    backgrounds.aurora;

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );

  gradient.addColorStop(
    0,
    colors[0]
  );

  gradient.addColorStop(
    0.5,
    colors[1]
  );

  gradient.addColorStop(
    1,
    colors[2]
  );

  return gradient;

}


function drawBackground(
  width,
  height
) {

  ctx.fillStyle =
    makeGradient(
      width,
      height
    );

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

}


/* ==========================================================
   MEDIA LOOKUP
========================================================== */

function findMedia(id) {

  if (!id) {
    return null;
  }

  return state.media.find(
    item => item.id === id
  ) || null;

}


/* ==========================================================
   COVER IMAGE DRAWING
========================================================== */

function drawCoverImage(
  image,
  width,
  height,
  opacity = 1
) {

  if (
    !image ||
    !image.width ||
    !image.height
  ) {
    return;
  }

  const scale =
    Math.max(
      width / image.width,
      height / image.height
    );

  const drawWidth =
    image.width * scale;

  const drawHeight =
    image.height * scale;

  const x =
    (width - drawWidth) / 2;

  const y =
    (height - drawHeight) / 2;

  ctx.save();

  ctx.globalAlpha =
    opacity;

  ctx.drawImage(
    image,
    x,
    y,
    drawWidth,
    drawHeight
  );

  ctx.restore();

}


/* ==========================================================
   VIDEO MEDIA FRAME
========================================================== */

function drawVideoFrame(
  video,
  width,
  height,
  localTime
) {

  if (!video) {
    return;
  }

  try {

    if (
      Number.isFinite(
        video.duration
      )
    ) {

      const target =
        clamp(
          localTime,
          0,
          Math.max(
            0,
            video.duration - 0.03
          )
        );

      if (
        Math.abs(
          video.currentTime -
          target
        ) > 0.08
      ) {

        video.currentTime =
          target;

      }

    }

    drawCoverImage(
      video,
      width,
      height,
      1
    );

  } catch (error) {

    console.warn(
      "Video frame error:",
      error
    );

  }

}


/* ==========================================================
   TEXT WRAPPING
========================================================== */

function wrapText(
  text,
  maxWidth
) {

  const words =
    String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return [];
  }

  const lines = [];

  let line = "";

  for (const word of words) {

    const candidate =
      line
        ? `${line} ${word}`
        : word;

    if (
      ctx.measureText(
        candidate
      ).width > maxWidth &&
      line
    ) {

      lines.push(line);

      line = word;

    } else {

      line = candidate;

    }

  }

  if (line) {
    lines.push(line);
  }

  return lines;

}


/* ==========================================================
   SCENE TRANSITION
========================================================== */

function getSceneOpacity(
  scene,
  time
) {

  const local =
    time - scene.start;

  const fade =
    Math.min(
      0.6,
      scene.duration / 4
    );

  let opacity = 1;

  if (
    scene.animation === "fade"
  ) {

    if (local < fade) {

      opacity =
        clamp(
          local / fade,
          0,
          1
        );

    }

    const remaining =
      scene.duration - local;

    if (remaining < fade) {

      opacity =
        Math.min(
          opacity,
          clamp(
            remaining / fade,
            0,
            1
          )
        );

    }

  }

  return opacity;

}


/* ==========================================================
   TEXT DRAWING
========================================================== */

function drawSceneText(
  scene,
  width,
  height,
  time
) {

  const text =
    String(scene.text || "")
      .trim();

  if (!text) {
    return;
  }

  const opacity =
    getSceneOpacity(
      scene,
      time
    );

  const fontSize =
    clamp(
      Number(scene.fontSize) || 54,
      12,
      160
    );

  const x =
    width *
    clamp(
      Number(scene.positionX) || 0.5,
      0,
      1
    );

  const y =
    height *
    clamp(
      Number(scene.positionY) || 0.5,
      0,
      1
    );

  ctx.save();

  ctx.globalAlpha =
    opacity;

  ctx.font =
    `800 ${fontSize}px system-ui, sans-serif`;

  ctx.textAlign =
    scene.textAlign ||
    "center";

  ctx.textBaseline =
    "middle";

  ctx.shadowColor =
    "rgba(0,0,0,0.75)";

  ctx.shadowBlur =
    Math.max(
      8,
      fontSize * 0.18
    );

  ctx.shadowOffsetY =
    3;

  const maxWidth =
    width * 0.78;

  const lines =
    wrapText(
      text,
      maxWidth
    );

  const lineHeight =
    fontSize * 1.18;

  const totalHeight =
    lines.length *
    lineHeight;

  let firstY =
    y -
    totalHeight / 2 +
    lineHeight / 2;

  ctx.fillStyle =
    scene.textColor ||
    "#ffffff";

  for (
    const line
    of lines
  ) {

    ctx.fillText(
      line,
      x,
      firstY
    );

    firstY +=
      lineHeight;

  }

  ctx.restore();

}


/* ==========================================================
   BRANDING
========================================================== */

function drawBranding(
  width,
  height
) {

  ctx.save();

  ctx.font =
    "600 18px system-ui, sans-serif";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "rgba(255,255,255,0.72)";

  ctx.fillText(
    "FÒBAS AI VIDEO",
    width / 2,
    height - 32
  );

  ctx.restore();

}


/* ==========================================================
   DRAW COMPLETE FRAME
========================================================== */

function drawFrame(time = 0) {

  const [
    width,
    height
  ] = getDimensions();

  if (
    stage.width !== width ||
    stage.height !== height
  ) {

    stage.width =
      width;

    stage.height =
      height;

  }

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawBackground(
    width,
    height
  );

  const scene =
    getSceneAtTime(time);

  if (!scene) {

    drawBranding(
      width,
      height
    );

    return;

  }

  const localTime =
    Math.max(
      0,
      time - scene.start
    );


  /* -------------------------------------------------------
     MEDIA
  ------------------------------------------------------- */

  const media =
    findMedia(
      scene.mediaId
    );

  if (media) {

    if (
      media.kind === "image" &&
      media.element
    ) {

      drawCoverImage(
        media.element,
        width,
        height,
        1
      );

    }

    if (
      media.kind === "video" &&
      media.element
    ) {

      drawVideoFrame(
        media.element,
        width,
        height,
        localTime
      );

    }

  }


  /* -------------------------------------------------------
     OVERLAY
  ------------------------------------------------------- */

  const overlay =
    clamp(
      Number(
        scene.overlayOpacity
      ) || 0,
      0,
      0.9
    );

  if (overlay > 0) {

    ctx.fillStyle =
      `rgba(0,0,0,${overlay})`;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

  }


  /* -------------------------------------------------------
     TEXT
  ------------------------------------------------------- */

  drawSceneText(
    scene,
    width,
    height,
    time
  );


  /* -------------------------------------------------------
     BRAND
  ------------------------------------------------------- */

  drawBranding(
    width,
    height
  );

}


/* ==========================================================
   UI UPDATE
========================================================== */

function updatePlaybackUI() {

  const duration =
    state.project.duration;

  const scrubber =
    $("#scrubber");

  if (scrubber) {

    scrubber.max =
      duration;

    scrubber.value =
      state.currentTime;

  }

  const current =
    $("#currentTime");

  if (current) {

    current.textContent =
      formatTime(
        state.currentTime
      );

  }

  const projectTime =
    $("#projectTime");

  if (projectTime) {

    projectTime.textContent =
      `${formatTime(
        state.currentTime
      )} / ${formatTime(
        duration
      )}`;

  }

  const timelineDuration =
    $("#timelineDuration");

  if (timelineDuration) {

    timelineDuration.textContent =
      `${Math.round(duration)}s`;

  }

}


/* ==========================================================
   SELECT SCENE
========================================================== */

function selectScene(index) {

  if (
    index < 0 ||
    index >= state.scenes.length
  ) {
    return;
  }

  state.selectedScene =
    index;

  const scene =
    state.scenes[index];

  state.currentTime =
    scene.start;

  syncInspector();

  renderScenes();

  updatePlaybackUI();

  drawFrame(
    state.currentTime
  );

}


/* ==========================================================
   INSPECTOR
========================================================== */

function syncInspector() {

  const scene =
    getCurrentScene();

  if (!scene) {
    return;
  }

  const text =
    $("#sceneText");

  const font =
    $("#fontSize");

  const align =
    $("#textAlign");

  if (text) {
    text.value =
      scene.text || "";
  }

  if (font) {
    font.value =
      scene.fontSize || 54;
  }

  if (align) {
    align.value =
      scene.textAlign || "center";
  }

}


/* ==========================================================
   RENDER SCENE LIST
========================================================== */

function renderScenes() {

  const list =
    $("#sceneList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  state.scenes.forEach(
    (scene, index) => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "scene-card";

      if (
        index ===
        state.selectedScene
      ) {

        card.classList.add(
          "active"
        );

      }

      card.innerHTML = `
        <strong>Scene ${index + 1}</strong>
        <small>
          ${formatTime(scene.duration)}
          ·
          ${escapeHtml(
            scene.text
              .slice(0, 55)
          )}
        </small>
      `;

      card.addEventListener(
        "click",
        () => {

          selectScene(index);

        }
      );

      list.appendChild(
        card
      );

    }
  );

  renderTimeline();

}


/* ==========================================================
   TIMELINE
========================================================== */

function renderTimeline() {

  const timeline =
    $("#timeline");

  if (!timeline) {
    return;
  }

  timeline.innerHTML = "";

  const track =
    document.createElement(
      "div"
    );

  track.className =
    "track";

  state.scenes.forEach(
    (scene, index) => {

      const clip =
        document.createElement(
          "div"
        );

      clip.className =
        "clip";

      if (
        index ===
        state.selectedScene
      ) {

        clip.classList.add(
          "active"
        );

      }

      clip.style.flex =
        `${Math.max(
          0.25,
          scene.duration
        )} 1 0`;

      clip.textContent =
        `Scene ${index + 1}`;

      clip.title =
        scene.text;

      clip.addEventListener(
        "click",
        () => {

          selectScene(index);

        }
      );

      track.appendChild(
        clip
      );

    }
  );

  timeline.appendChild(
    track
  );

}


/* ==========================================================
   PLAYBACK
========================================================== */

function startPlayback() {

  if (
    state.playing ||
    state.exporting
  ) {
    return;
  }

  state.playing =
    true;

  state.lastFrameTime =
    performance.now();

  const button =
    $("#playBtn");

  if (button) {
    button.textContent =
      "⏸";
  }

  playbackLoop();

}


function stopPlayback() {

  state.playing =
    false;

  if (
    state.animationFrame
  ) {

    cancelAnimationFrame(
      state.animationFrame
    );

  }

  const button =
    $("#playBtn");

  if (button) {
    button.textContent =
      "▶";
  }

}


function playbackLoop(now) {

  if (!state.playing) {
    return;
  }

  const delta =
    Math.min(
      0.1,
      (now -
        state.lastFrameTime) /
        1000
    );

  state.lastFrameTime =
    now;

  state.currentTime +=
    delta;

  if (
    state.currentTime >=
    state.project.duration
  ) {

    state.currentTime =
      0;

  }

  updateSceneSelectionByTime();

  drawFrame(
    state.currentTime
  );

  updatePlaybackUI();

  state.animationFrame =
    requestAnimationFrame(
      playbackLoop
    );

}


function updateSceneSelectionByTime() {

  const scene =
    getSceneAtTime(
      state.currentTime
    );

  if (!scene) {
    return;
  }

  const index =
    state.scenes.indexOf(
      scene
    );

  if (
    index !==
    state.selectedScene
  ) {

    state.selectedScene =
      index;

    syncInspector();

    renderScenes();

  }

}


/* ==========================================================
   GENERATE STORYBOARD
========================================================== */

function generateScenesFromPrompt() {

  const prompt =
    ($("#prompt")?.value || "")
      .trim();

  const requestedDuration =
    clamp(
      Number(
        $("#duration")?.value
      ) || 30,
      1,
      MAX_PROJECT_DURATION
    );

  const format =
    $("#format")?.value ||
    "16:9";


  state.project.duration =
    requestedDuration;

  state.project.format =
    format;


  let texts;


  const normalized =
    prompt.toLowerCase();


  if (
    normalized.includes("restoran") ||
    normalized.includes("restaurant")
  ) {

    texts = [

      "Dekouvri yon eksperyans gou ou pap bliye.",

      "Bon jan kalite. Bon gou. Bon sèvis.",

      "Pote fanmi ak zanmi ou pou yon moman espesyal.",

      "Rezève kounye a epi dekouvri diferans lan."

    ];

  } else if (
    normalized.includes("rad") ||
    normalized.includes("fashion") ||
    normalized.includes("boutik")
  ) {

    texts = [

      "Nouvo stil. Nouvo enèji.",

      "Kreye aparans ki reprezante pèsonalite ou.",

      "Dekouvri nouvo koleksyon an.",

      "Achte kounye a."

    ];

  } else if (
    normalized.includes("immobilier") ||
    normalized.includes("kay")
  ) {

    texts = [

      "Jwenn espas ou te toujou ap chèche a.",

      "Konfò. Lokalizasyon. Valè.",

      "Dekouvri pwopriyete ki disponib yo.",

      "Kontakte nou pou plis enfòmasyon."

    ];

  } else {

    texts = [

      prompt ||
      "Men mesaj mak ou bezwen an.",

      "Montre sa ki fè pwodwi ou espesyal.",

      "Fè moun konprann valè ou byen vit.",

      "Aji kounye a. Kontakte nou jodi a."

    ];

  }


  const count =
    Math.min(
      6,
      Math.max(
        1,
        Math.ceil(
          requestedDuration / 7
        )
      )
    );


  const selected =
    texts.slice(
      0,
      Math.min(
        count,
        texts.length
      )
    );


  while (
    selected.length <
    count
  ) {

    selected.push(
      texts[
        selected.length %
        texts.length
      ]
    );

  }


  const duration =
    requestedDuration /
    selected.length;


  state.scenes =
    selected.map(
      (text, index) =>
        createScene({

          start:
            index * duration,

          duration,

          text

        })
    );


  state.selectedScene =
    0;

  state.currentTime =
    0;

  state.project.name =
    (
      prompt ||
      "AI Video"
    )
      .slice(0, 40);


  $("#projectName").textContent =
    state.project.name;


  resizeCanvas();

  syncInspector();

  renderScenes();

  updatePlaybackUI();

  drawFrame(0);

  scheduleAutosave();

  showToast(
    "Storyboard la pare."
  );

}


/* ==========================================================
   ADD SCENE
========================================================== */

function addScene() {

  const last =
    state.scenes[
      state.scenes.length - 1
    ];

  const start =
    last
      ? last.start +
        last.duration
      : 0;


  const scene =
    createScene({

      start,

      duration: 5,

      text:
        "Nouvo scene"

    });


  state.scenes.push(
    scene
  );


  normalizeSceneTimes();


  state.selectedScene =
    state.scenes.length - 1;


  state.currentTime =
    scene.start;


  syncInspector();

  renderScenes();

  updatePlaybackUI();

  drawFrame(
    state.currentTime
  );

  scheduleAutosave();

  showToast(
    "Nouvo scene ajoute."
  );

}


/* ==========================================================
   MEDIA IMPORT
========================================================== */

async function importMediaFiles(
  fileList
) {

  const files =
    [...fileList];

  if (!files.length) {
    return;
  }

  let imported =
    0;


  for (const file of files) {

    if (
      !file.type.startsWith(
        "image/"
      ) &&
      !file.type.startsWith(
        "video/"
      ) &&
      !file.type.startsWith(
        "audio/"
      )
    ) {

      continue;

    }


    const url =
      URL.createObjectURL(
        file
      );


    let kind =
      "audio";


    if (
      file.type.startsWith(
        "image/"
      )
    ) {

      kind =
        "image";

    } else if (
      file.type.startsWith(
        "video/"
      )
    ) {

      kind =
        "video";

    }


    const item = {

      id:
        uid("media"),

      name:
        file.name,

      type:
        file.type,

      kind,

      url,

      file,

      element:
        null

    };


    try {

      if (
        kind === "image"
      ) {

        const image =
          new Image();

        image.src =
          url;

        await image.decode();

        item.element =
          image;

      }


      if (
        kind === "video"
      ) {

        const video =
          document.createElement(
            "video"
          );

        video.src =
          url;

        video.muted =
          true;

        video.playsInline =
          true;

        video.preload =
          "auto";

        await new Promise(
          (resolve, reject) => {

            video.onloadedmetadata =
              resolve;

            video.onerror =
              reject;

          }
        );

        item.element =
          video;

      }


      if (
        kind === "audio"
      ) {

        const audio =
          new Audio();

        audio.src =
          url;

        audio.preload =
          "auto";

        audio.crossOrigin =
          "anonymous";

        item.element =
          audio;

      }


      state.media.push(
        item
      );

      imported++;

      renderMediaItem(
        item
      );

    } catch (error) {

      console.error(
        "Media import:",
        error
      );

      URL.revokeObjectURL(
        url
      );

    }

  }


  if (imported) {

    showToast(
      `${imported} media ajoute.`
    );

    scheduleAutosave();

  }

}


/* ==========================================================
   MEDIA BIN
========================================================== */

function renderMediaItem(
  item
) {

  const bin =
    $("#mediaBin");

  if (!bin) {
    return;
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "media-item";

  wrapper.dataset.id =
    item.id;


  if (
    item.kind === "image"
  ) {

    const image =
      document.createElement(
        "img"
      );

    image.src =
      item.url;

    wrapper.appendChild(
      image
    );

  } else {

    const icon =
      document.createElement(
        "div"
      );

    icon.style.cssText = `
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:22px;
    `;

    icon.textContent =
      item.kind === "video"
        ? "🎬"
        : "🎵";

    wrapper.appendChild(
      icon
    );

  }


  const label =
    document.createElement(
      "span"
    );

  label.textContent =
    item.name;

  wrapper.appendChild(
    label
  );


  wrapper.addEventListener(
    "click",
    () => {

      assignMediaToSelectedScene(
        item.id
      );

    }
  );


  bin.appendChild(
    wrapper
  );

}


function assignMediaToSelectedScene(
  mediaId
) {

  const scene =
    getCurrentScene();

  if (!scene) {
    return;
  }

  const media =
    findMedia(mediaId);

  if (!media) {
    return;
  }

  if (
    media.kind === "audio"
  ) {

    scene.audioId =
      media.id;

  } else {

    scene.mediaId =
      media.id;

  }

  drawFrame(
    state.currentTime
  );

  scheduleAutosave();

  showToast(
    "Media mare ak scene."
  );

}


/* ==========================================================
   AUDIO ENGINE
========================================================== */

function createAudioEngine() {

  if (
    state.audioContext
  ) {

    return state.audioContext;

  }

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (
    !AudioContextClass
  ) {

    return null;

  }

  const audioContext =
    new AudioContextClass();


  const destination =
    audioContext.createMediaStreamDestination();


  state.audioContext =
    audioContext;

  state.audioDestination =
    destination;


  return audioContext;

}


/* ==========================================================
   BUILD AUDIO SOURCES
========================================================== */

function clearAudioSources() {

  state.audioSources.forEach(
    source => {

      try {
        source.stop();
      } catch (_) {}

      try {
        source.disconnect();
      } catch (_) {}

    }
  );

  state.audioSources =
    [];

}


function prepareExportAudio() {

  const audioContext =
    createAudioEngine();

  if (!audioContext) {
    return null;
  }

  clearAudioSources();

  const destination =
    state.audioDestination;


  for (
    const scene
    of state.scenes
  ) {

    if (!scene.audioId) {
      continue;
    }

    const media =
      findMedia(
        scene.audioId
      );

    if (
      !media ||
      media.kind !== "audio"
    ) {
      continue;
    }

    const audio =
      media.element;

    if (!audio) {
      continue;
    }

    try {

      const source =
        audioContext.createMediaElementSource(
          audio
        );

      const gain =
        audioContext.createGain();

      gain.gain.value =
        1;

      source.connect(
        gain
      );

      gain.connect(
        destination
      );

      state.audioSources.push({
        source,
        gain,
        audio
      });

    } catch (error) {

      console.warn(
        "Audio source:",
        error
      );

    }

  }


  return destination.stream;

}


/* ==========================================================
   PLAY SCENE AUDIO
========================================================== */

function stopAllAudio() {

  state.media
    .filter(
      item =>
        item.kind === "audio"
    )
    .forEach(
      item => {

        try {

          item.element.pause();

          item.element.currentTime =
            0;

        } catch (_) {}

      }
    );

}


function syncSceneAudio(
  time
) {

  const scene =
    getSceneAtTime(time);

  if (!scene) {
    return;
  }

  state.media
    .filter(
      item =>
        item.kind === "audio"
    )
    .forEach(
      item => {

        const audio =
          item.element;

        if (!audio) {
          return;
        }

        if (
          item.id ===
          scene.audioId
        ) {

          const local =
            Math.max(
              0,
              time - scene.start
            );

          try {

            if (
              Math.abs(
                audio.currentTime -
                local
              ) > 0.3
            ) {

              audio.currentTime =
                local;

            }

            if (
              state.playing &&
              audio.paused
            ) {

              audio.play()
                .catch(
                  () => {}
                );

            }

          } catch (_) {}

        } else {

          if (
            !audio.paused
          ) {

            audio.pause();

          }

        }

      }
    );

}


/* ==========================================================
   TTS PREVIEW
========================================================== */

function speakSelectedScene() {

  const scene =
    getCurrentScene();

  if (!scene) {
    return;
  }

  if (
    !("speechSynthesis" in window)
  ) {

    showToast(
      "Navigatè a pa bay TTS."
    );

    return;

  }

  speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      scene.text
    );

  utterance.lang =
    "ht-HT";

  utterance.rate =
    1;

  utterance.pitch =
    1;

  speechSynthesis.speak(
    utterance
  );

}


/* ==========================================================
   PLAYBACK WITH AUDIO
========================================================== */

function togglePlayback() {

  if (
    state.playing
  ) {

    stopPlayback();

  } else {

    startPlayback();

  }

}


/* ==========================================================
   LOCAL PROJECT SERIALIZATION
========================================================== */

function serializeProject() {

  return {

    version: 2,

    project: {
      ...state.project
    },

    scenes:
      state.scenes.map(
        scene => ({
          ...scene
        })
      )

  };

}


/* ==========================================================
   LOCAL SAVE
========================================================== */

function saveProject(
  showMessage = true
) {

  try {

    const data =
      serializeProject();

    localStorage.setItem(
      "fobas_video_project_v2",
      JSON.stringify(data)
    );

    if (showMessage) {

      showToast(
        "Pwojè a sove lokalman."
      );

    }

  } catch (error) {

    console.error(
      "Save error:",
      error
    );

    showToast(
      "Pa kapab sove pwojè a."
    );

  }

}


/* ==========================================================
   LOCAL LOAD
========================================================== */

function loadProject() {

  try {

    const raw =
      localStorage.getItem(
        "fobas_video_project_v2"
      );

    if (!raw) {
      return false;
    }

    const data =
      JSON.parse(raw);

    if (
      !data ||
      !data.project
    ) {

      return false;

    }

    state.project = {
      ...state.project,
      ...data.project
    };

    state.scenes =
      Array.isArray(
        data.scenes
      )
        ? data.scenes
        : [];


    if (
      !state.scenes.length
    ) {

      state.scenes =
        createDefaultScenes();

    }


    normalizeSceneTimes();

    state.selectedScene =
      0;

    state.currentTime =
      0;


    updateProjectUI();

    return true;

  } catch (error) {

    console.error(
      "Load error:",
      error
    );

    return false;

  }

}


/* ==========================================================
   PROJECT UI
========================================================== */

function updateProjectUI() {

  const name =
    $("#projectName");

  if (name) {

    name.textContent =
      state.project.name;

  }

  const duration =
    $("#duration");

  if (duration) {

    duration.value =
      state.project.duration;

  }

  const format =
    $("#format");

  if (format) {

    format.value =
      state.project.format;

  }

  updatePlaybackUI();

}


/* ==========================================================
   AUTOSAVE
========================================================== */

function scheduleAutosave() {

  clearTimeout(
    state.autosaveTimer
  );

  state.autosaveTimer =
    setTimeout(
      () => {

        saveProject(false);

      },
      600
    );

}


/* ==========================================================
   EXPORT MIME TYPE
========================================================== */

function chooseRecordingMime() {

  const types = [

    "video/webm;codecs=vp9,opus",

    "video/webm;codecs=vp8,opus",

    "video/webm"

  ];

  for (
    const type
    of types
  ) {

    if (
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
   EXPORT AUDIO START
========================================================== */

async function startExportAudio() {

  const audioStream =
    prepareExportAudio();

  if (!audioStream) {
    return null;
  }

  try {

    if (
      state.audioContext &&
      state.audioContext.state ===
        "suspended"
    ) {

      await state.audioContext.resume();

    }

  } catch (_) {}

  return audioStream;

}


/* ==========================================================
   MERGE MEDIA STREAMS
========================================================== */

function mergeStreams(
  videoStream,
  audioStream
) {

  const tracks = [
    ...videoStream.getVideoTracks()
  ];

  if (audioStream) {

    tracks.push(
      ...audioStream.getAudioTracks()
    );

  }

  return new MediaStream(
    tracks
  );

}


/* ==========================================================
   EXPORT ENGINE
========================================================== */

async function exportVideo() {

  if (
    state.exporting
  ) {

    return;

  }

  if (
    !window.MediaRecorder
  ) {

    showToast(
      "MediaRecorder pa disponib sou navigatè sa a."
    );

    return;

  }


  state.exporting =
    true;


  stopPlayback();

  speechSynthesis?.cancel?.();

  stopAllAudio();


  const [
    width,
    height
  ] = getDimensions();


  stage.width =
    width;

  stage.height =
    height;


  const videoStream =
    stage.captureStream(
      FPS
    );


  const audioStream =
    await startExportAudio();


  const finalStream =
    mergeStreams(
      videoStream,
      audioStream
    );


  const mime =
    chooseRecordingMime();


  let recorder;


  try {

    recorder =
      mime
        ? new MediaRecorder(
            finalStream,
            {
              mimeType: mime,
              videoBitsPerSecond:
                8_000_000
            }
          )
        : new MediaRecorder(
            finalStream
          );

  } catch (error) {

    console.error(
      "Recorder:",
      error
    );

    state.exporting =
      false;

    showToast(
      "Export pa disponib sou navigatè sa a."
    );

    return;

  }


  state.recorder =
    recorder;

  state.exportChunks =
    [];


  recorder.ondataavailable =
    event => {

      if (
        event.data &&
        event.data.size > 0
      ) {

        state.exportChunks.push(
          event.data
        );

      }

    };


  recorder.onerror =
    event => {

      console.error(
        "Recording error:",
        event
      );

    };


  recorder.onstop =
    () => {

      finalizeExport(
        mime ||
        "video/webm"
      );

    };


  recorder.start(
    250
  );


  const originalTime =
    state.currentTime;


  state.currentTime =
    0;


  const exportStart =
    performance.now();


  const exportDuration =
    state.project.duration *
    1000;


  function renderExportFrame(
    now
  ) {

    const elapsed =
      now -
      exportStart;


    state.currentTime =
      Math.min(
        elapsed / 1000,
        state.project.duration
      );


    drawFrame(
      state.currentTime
    );


    updatePlaybackUI();

    syncSceneAudio(
      state.currentTime
    );


    if (
      elapsed <
      exportDuration
    ) {

      requestAnimationFrame(
        renderExportFrame
      );

    } else {

      state.currentTime =
        state.project.duration;

      drawFrame(
        state.currentTime
      );


      setTimeout(
        () => {

          try {
            recorder.stop();
          } catch (_) {}

          state.currentTime =
            originalTime;

        },
        150
      );

    }

  }


  requestAnimationFrame(
    renderExportFrame
  );


  showToast(
    "Export videyo ap fèt..."
  );

}


/* ==========================================================
   FINALIZE EXPORT
========================================================== */

function finalizeExport(
  mime
) {

  const blob =
    new Blob(
      state.exportChunks,
      {
        type: mime
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const safeName =
    (
      state.project.name ||
      "fobas-video"
    )
      .trim()
      .replace(
        /[^\p{L}\p{N}_-]+/gu,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
      "fobas-video";


  const filename =
    `${safeName}.webm`;


  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  link.style.display =
    "none";


  document.body.appendChild(
    link
  );


  link.click();


  setTimeout(
    () => {

      link.remove();

      URL.revokeObjectURL(
        url
      );

    },
    1500
  );


  clearAudioSources();

  state.exporting =
    false;

  state.recorder =
    null;

  state.exportChunks =
    [];


  drawFrame(
    state.currentTime
  );

  updatePlaybackUI();


  showToast(
    "Videyo a pare pou telechaje."
  );

}


/* ==========================================================
   PINCH ZOOM
========================================================== */

function setupPinchZoom() {

  if (!stageWrap) {
    return;
  }


  stageWrap.addEventListener(
    "touchstart",
    event => {

      if (
        event.touches.length !==
        2
      ) {

        return;

      }


      const a =
        event.touches[0];

      const b =
        event.touches[1];


      state.touches.distance =
        Math.hypot(
          a.clientX -
            b.clientX,

          a.clientY -
            b.clientY
        );


      state.touches.zoom =
        state.zoom;

    },
    {
      passive: true
    }
  );


  stageWrap.addEventListener(
    "touchmove",
    event => {

      if (
        event.touches.length !==
        2
      ) {

        return;

      }


      const a =
        event.touches[0];

      const b =
        event.touches[1];


      const distance =
        Math.hypot(
          a.clientX -
            b.clientX,

          a.clientY -
            b.clientY
        );


      if (
        !state.touches.distance
      ) {

        return;

      }


      const ratio =
        distance /
        state.touches.distance;


      state.zoom =
        clamp(
          state.touches.zoom *
            ratio,
          0.5,
          3
        );


      applyZoom();

      event.preventDefault();

    },
    {
      passive: false
    }
  );


  stageWrap.addEventListener(
    "touchend",
    () => {

      if (
        event?.touches?.length <
        2
      ) {

        state.touches.distance =
          0;

      }

    },
    {
      passive: true
    }
  );

}


function applyZoom() {

  stage.style.transform =
    `scale(${state.zoom})`;

  const label =
    $("#zoomLabel");

  if (label) {

    label.textContent =
      `${Math.round(
        state.zoom * 100
      )}%`;

  }

}


/* ==========================================================
   DRAG & DROP
========================================================== */

function setupDragDrop() {

  if (!stageWrap) {
    return;
  }


  stageWrap.addEventListener(
    "dragover",
    event => {

      event.preventDefault();

      stageWrap.classList.add(
        "drag"
      );

    }
  );


  stageWrap.addEventListener(
    "dragleave",
    () => {

      stageWrap.classList.remove(
        "drag"
      );

    }
  );


  stageWrap.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      stageWrap.classList.remove(
        "drag"
      );

      importMediaFiles(
        event.dataTransfer.files
      );

    }
  );

}


/* ==========================================================
   EVENT: GENERATE
========================================================== */

$("#generateBtn")
  ?.addEventListener(
    "click",
    generateScenesFromPrompt
  );


/* ==========================================================
   EVENT: PLAY
========================================================== */

$("#playBtn")
  ?.addEventListener(
    "click",
    togglePlayback
  );


/* ==========================================================
   EVENT: SAVE
========================================================== */

$("#saveProjectBtn")
  ?.addEventListener(
    "click",
    () => {

      saveProject(true);

    }
  );


/* ==========================================================
   EVENT: EXPORT
========================================================== */

$("#exportBtn")
  ?.addEventListener(
    "click",
    exportVideo
  );


/* ==========================================================
   EVENT: MEDIA
========================================================== */

$("#addMediaBtn")
  ?.addEventListener(
    "click",
    () => {

      $("#mediaInput")?.click();

    }
  );


$("#mediaInput")
  ?.addEventListener(
    "change",
    event => {

      importMediaFiles(
        event.target.files
      );

      event.target.value =
        "";

    }
  );


/* ==========================================================
   EVENT: AUDIO FILE
========================================================== */

$("#voiceFileBtn")
  ?.addEventListener(
    "click",
    () => {

      $("#audioInput")?.click();

    }
  );


$("#audioInput")
  ?.addEventListener(
    "change",
    event => {

      importMediaFiles(
        event.target.files
      );

      event.target.value =
        "";

    }
  );


/* ==========================================================
   EVENT: SCRUBBER
========================================================== */

$("#scrubber")
  ?.addEventListener(
    "input",
    event => {

      state.currentTime =
        clamp(
          Number(
            event.target.value
          ),
          0,
          state.project.duration
        );

      updateSceneSelectionByTime();

      drawFrame(
        state.currentTime
      );

      updatePlaybackUI();

      syncSceneAudio(
        state.currentTime
      );

    }
  );


/* ==========================================================
   EVENT: BACK
========================================================== */

$("#backBtn")
  ?.addEventListener(
    "click",
    () => {

      state.currentTime =
        clamp(
          state.currentTime - 5,
          0,
          state.project.duration
        );

      updateSceneSelectionByTime();

      drawFrame(
        state.currentTime
      );

      updatePlaybackUI();

    }
  );


/* ==========================================================
   EVENT: FORWARD
========================================================== */

$("#forwardBtn")
  ?.addEventListener(
    "click",
    () => {

      state.currentTime =
        clamp(
          state.currentTime + 5,
          0,
          state.project.duration
        );

      updateSceneSelectionByTime();

      drawFrame(
        state.currentTime
      );

      updatePlaybackUI();

    }
  );


/* ==========================================================
   EVENT: TEXT
========================================================== */

$("#sceneText")
  ?.addEventListener(
    "input",
    event => {

      const scene =
        getCurrentScene();

      if (!scene) {
        return;
      }

      scene.text =
        event.target.value;

      drawFrame(
        state.currentTime
      );

      renderScenes();

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: FONT SIZE
========================================================== */

$("#fontSize")
  ?.addEventListener(
    "input",
    event => {

      const scene =
        getCurrentScene();

      if (!scene) {
        return;
      }

      scene.fontSize =
        clamp(
          Number(
            event.target.value
          ) || 54,
          12,
          160
        );

      drawFrame(
        state.currentTime
      );

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: TEXT ALIGN
========================================================== */

$("#textAlign")
  ?.addEventListener(
    "change",
    event => {

      const scene =
        getCurrentScene();

      if (!scene) {
        return;
      }

      scene.textAlign =
        event.target.value;

      drawFrame(
        state.currentTime
      );

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: TTS
========================================================== */

$("#speakBtn")
  ?.addEventListener(
    "click",
    speakSelectedScene
  );


/* ==========================================================
   EVENT: ZOOM IN
========================================================== */

$("#zoomIn")
  ?.addEventListener(
    "click",
    () => {

      state.zoom =
        clamp(
          state.zoom + 0.1,
          0.5,
          3
        );

      applyZoom();

    }
  );


/* ==========================================================
   EVENT: ZOOM OUT
========================================================== */

$("#zoomOut")
  ?.addEventListener(
    "click",
    () => {

      state.zoom =
        clamp(
          state.zoom - 0.1,
          0.5,
          3
        );

      applyZoom();

    }
  );


/* ==========================================================
   EVENT: FULLSCREEN
========================================================== */

$("#fullscreenBtn")
  ?.addEventListener(
    "click",
    async () => {

      try {

        if (
          document.fullscreenElement
        ) {

          await document.exitFullscreen();

        } else if (
          stageWrap?.requestFullscreen
        ) {

          await stageWrap.requestFullscreen();

        }

      } catch (error) {

        console.warn(
          "Fullscreen:",
          error
        );

      }

    }
  );


/* ==========================================================
   EVENT: ADD SCENE
========================================================== */

$("#addSceneBtn")
  ?.addEventListener(
    "click",
    addScene
  );


/* ==========================================================
   EVENT: NEW PROJECT
========================================================== */

$("#newProjectBtn")
  ?.addEventListener(
    "click",
    () => {

      stopPlayback();

      stopAllAudio();

      state.project = {

        id:
          uid("project"),

        name:
          "Untitled Project",

        duration:
          30,

        format:
          "16:9",

        background:
          "aurora"

      };


      state.scenes =
        createDefaultScenes();

      state.selectedScene =
        0;

      state.currentTime =
        0;

      state.zoom =
        1;


      applyZoom();

      updateProjectUI();

      syncInspector();

      renderScenes();

      resizeCanvas();

      showToast(
        "Nouvo pwojè pare."
      );

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: FORMAT
========================================================== */

$("#format")
  ?.addEventListener(
    "change",
    event => {

      state.project.format =
        event.target.value;

      resizeCanvas();

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: DURATION
========================================================== */

$("#duration")
  ?.addEventListener(
    "change",
    event => {

      const newDuration =
        clamp(
          Number(
            event.target.value
          ) || 30,
          1,
          MAX_PROJECT_DURATION
        );


      state.project.duration =
        newDuration;


      if (
        state.scenes.length
      ) {

        const total =
          state.scenes.reduce(
            (
              sum,
              scene
            ) =>
              sum +
              scene.duration,
            0
          );


        if (
          total > 0
        ) {

          const ratio =
            newDuration /
            total;


          state.scenes.forEach(
            scene => {

              scene.duration *=
                ratio;

            }
          );

        }

      }


      normalizeSceneTimes();

      state.currentTime =
        clamp(
          state.currentTime,
          0,
          state.project.duration
        );

      renderScenes();

      updatePlaybackUI();

      drawFrame(
        state.currentTime
      );

      scheduleAutosave();

    }
  );


/* ==========================================================
   EVENT: BACKGROUND
========================================================== */

$$(
  ".background-grid button"
).forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const background =
          button.dataset.bg;

        if (
          !backgrounds[
            background
          ]
        ) {

          return;

        }

        state.project.background =
          background;

        drawFrame(
          state.currentTime
        );

        scheduleAutosave();

      }
    );

  }
);


/* ==========================================================
   TABS
========================================================== */

$$(
  ".tab-button"
).forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        $$(".tab-button")
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        button.classList.add(
          "active"
        );


        $$(".tab-content")
          .forEach(
            item =>
              item.classList.add(
                "hidden"
              )
          );


        const target =
          button.dataset.tab;

        const content =
          $(
            `#tab-${target}`
          );

        if (content) {

          content.classList.remove(
            "hidden"
          );

        }

      }
    );

  }
);


/* ==========================================================
   VISIBILITY / AUTO SAVE
========================================================== */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      if (
        state.playing
      ) {

        stopPlayback();

      }

      saveProject(false);

    }

  }
);


window.addEventListener(
  "beforeunload",
  () => {

    saveProject(false);

    state.media.forEach(
      item => {

        try {

          URL.revokeObjectURL(
            item.url
          );

        } catch (_) {}

      }
    );

  }
);


/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

document.addEventListener(
  "keydown",
  event => {

    const target =
      event.target;

    const editing =
      target &&
      (
        target.tagName ===
          "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.tagName ===
          "SELECT"
      );


    if (
      editing
    ) {

      return;

    }


    if (
      event.code ===
      "Space"
    ) {

      event.preventDefault();

      togglePlayback();

    }


    if (
      event.code ===
      "ArrowLeft"
    ) {

      state.currentTime =
        clamp(
          state.currentTime - 1,
          0,
          state.project.duration
        );

      drawFrame(
        state.currentTime
      );

      updatePlaybackUI();

    }


    if (
      event.code ===
      "ArrowRight"
    ) {

      state.currentTime =
        clamp(
          state.currentTime + 1,
          0,
          state.project.duration
        );

      drawFrame(
        state.currentTime
      );

      updatePlaybackUI();

    }

  }
);


/* ==========================================================
   INITIALIZE
========================================================== */

function initializeApp() {

  const loaded =
    loadProject();


  if (!loaded) {

    state.scenes =
      createDefaultScenes();

  }


  updateProjectUI();

  renderScenes();

  syncInspector();

  resizeCanvas();

  applyZoom();

  updatePlaybackUI();

  setupPinchZoom();

  setupDragDrop();


  if (
    !state.scenes.length
  ) {

    state.scenes =
      createDefaultScenes();

    renderScenes();

  }


  drawFrame(0);


  console.log(
    "FÒBAS AI VIDEO STUDIO initialized."
  );

}


initializeApp();


/* ==========================================================
   END OF ENGINE
========================================================== */



























