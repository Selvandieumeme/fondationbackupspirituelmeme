
// ==========================
// FOBAS IA VIDEO - FRONTEND LOGIC
// ==========================

const API_URL = "https://api.fondationbackupspirituel.com";

// ==========================
// GLOBAL STATE
// ==========================
let currentUser = null;
let currentVideoUrl = null;
let videoHistory = [];

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", async () => {
  loadUser();
  await loadStats();
  loadHistory();
});

// ==========================
// LOAD USER (LOCAL STORAGE)
// ==========================
function loadUser() {
  const email = localStorage.getItem("userEmail");
  const agentId = localStorage.getItem("agentId");

  currentUser = { email, agentId };
}

// ==========================
// LOAD STATS (COMMISSIONS + CREDITS)
// ==========================
async function loadStats() {
  try {
    if (!currentUser?.agentId) return;

    const res = await fetch(`${API_URL}/agents/${currentUser.agentId}`);
    const data = await res.json();

    if (!data) return;

    document.getElementById("totalCommission").innerText =
      `${data.totalCommission || 0} HTG`;

    document.getElementById("videoCredits").innerText =
      data.videoCredits || 0;

  } catch (err) {
    console.error("STATS ERROR:", err);
  }
}

// ==========================
// GENERATE VIDEO
// ==========================
async function generateVideo() {

  const prompt = document.getElementById("prompt").value;
  const duration = document.getElementById("duration").value;
  const language = document.getElementById("language").value;
  const style = document.getElementById("style").value;

  if (!prompt) {
    alert("Ekri prompt la dabò");
    return;
  }

  showLoader(true);

  try {

    const payload = {
      agentId: currentUser.agentId,
      prompt,
      duration,
      language,
      style
    };

    const res = await fetch(`${API_URL}/ia-video/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    showLoader(false);

    if (!data.success) {
      alert(data.message || "Erè génération video");
      return;
    }

    // SIMULATE VIDEO URL (backend ap ranplase sa)
    const videoUrl =
      data.videoUrl ||
      "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";

    currentVideoUrl = videoUrl;

    renderVideo(videoUrl);
    addToHistory(videoUrl, prompt);

    alert("Video Generated Successfully!");

  } catch (err) {
    showLoader(false);
    console.error("VIDEO ERROR:", err);
    alert("Server error");
  }
}

// ==========================
// RENDER VIDEO
// ==========================
function renderVideo(url) {
  const container = document.getElementById("videoContainer");

  container.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px;">
      <source src="${url}" type="video/mp4">
    </video>
  `;
}

// ==========================
// HISTORY SYSTEM
// ==========================
function addToHistory(url, prompt) {
  videoHistory.unshift({ url, prompt, date: new Date() });

  renderHistory();
}

function loadHistory() {
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyList");

  if (!videoHistory.length) {
    container.innerHTML = `<p class="empty">No videos yet</p>`;
    return;
  }

  container.innerHTML = videoHistory.map((item, index) => `
    <div class="history-item">
      <b>Prompt:</b> ${item.prompt.substring(0, 50)}...

      <div style="margin-top:8px; display:flex; gap:10px;">

        <button onclick="playHistory('${item.url}')">▶ Play</button>

        <button onclick="downloadVideo('${item.url}')">⬇ Download</button>

        <button onclick="shareWhatsApp('${item.url}')">📲 WhatsApp</button>

      </div>
    </div>
  `).join("");
}

// ==========================
// PLAY HISTORY VIDEO
// ==========================
function playHistory(url) {
  renderVideo(url);
}

// ==========================
// DOWNLOAD VIDEO
// ==========================
function downloadVideo(url = currentVideoUrl) {
  if (!url) return alert("No video");

  const a = document.createElement("a");
  a.href = url;
  a.download = "fobas-video.mp4";
  a.click();
}

// ==========================
// SHARE FUNCTIONS
// ==========================
function shareWhatsApp(url = currentVideoUrl) {
  if (!url) return;

  window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
}

function shareFacebook(url = currentVideoUrl) {
  if (!url) return;

  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

function shareTikTok(url = currentVideoUrl) {
  alert("TikTok sharing depends on manual upload (no direct API).");
}

// ==========================
// NATCASH MODAL
// ==========================
function openNatcashModal() {
  document.getElementById("natcashModal").classList.remove("hidden");
}

function closeNatcashModal() {
  document.getElementById("natcashModal").classList.add("hidden");
}

// ==========================
// LOADER CONTROL
// ==========================
function showLoader(show) {
  const loader = document.getElementById("loader");

  if (!loader) return;

  loader.classList.toggle("hidden", !show);
}

// ==========================
// COMMISSION DEDUCTION HOOK (READY FOR BACKEND)
// ==========================
async function refreshCommission() {
  await loadStats();
}

// ==========================
// EXPORT GLOBAL (IMPORTANT)
// ==========================
window.generateVideo = generateVideo;
window.downloadVideo = downloadVideo;
window.shareWhatsApp = shareWhatsApp;
window.shareFacebook = shareFacebook;
window.shareTikTok = shareTikTok;
window.openNatcashModal = openNatcashModal;
window.closeNatcashModal = closeNatcashModal;
window.playHistory = playHistory;























window.addEventListener("DOMContentLoaded", () => {
  const fullName = sessionStorage.getItem("fobas_fullName");
  const role = sessionStorage.getItem("fobas_role");

  document.getElementById("userFullName").textContent =
    fullName || "Unknown User";

  document.getElementById("userRole").textContent =
    role || "Unknown Role";
});
