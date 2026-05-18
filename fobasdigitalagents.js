// ==========================
// FOBAS DIGITAL AGENTS JS
// FINAL PRODUCTION VERSION
// API READY + VPS READY
// ==========================

const API_URL = "https://api.fondationbackupspirituel.com";


// ==========================
// LOADER
// ==========================
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    if (loader) loader.style.display = "none";
  }, 800);

  loadDashboard();
});


// ==========================
// MOBILE MENU
// ==========================
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}


// ==========================
// BUTTON HOVER EFFECT
// ==========================
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.05)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
  });
});


// ==========================
// SCROLL ANIMATION
// ==========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(
  ".feature-card, .stat-card, .agent-box, .business-card"
).forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.8s ease";
  observer.observe(el);
});


// ==========================
// ADD STYLE (SHOW CLASS)
// ==========================
const style = document.createElement("style");
style.innerHTML = `
.show{
  opacity:1 !important;
  transform:translateY(0) !important;
}
`;
document.head.appendChild(style);


// ==========================
// COPY REFERRAL LINK
// ==========================
function copyReferral() {
  const input = document.getElementById("referralLink");

  if (!input) return;

  input.select();
  input.setSelectionRange(0, 99999);

  document.execCommand("copy");

  alert("Referral link copied!");
}


// ==========================
// LOAD DASHBOARD (API)
// ==========================
async function loadDashboard() {
  try {

    const email = localStorage.getItem("userEmail");
    if (!email) return;

    const res = await fetch(
      `${API_URL}/agents/dashboard?email=${email}`
    );

    const data = await res.json();

    // REFERRAL LINK
    const ref = document.getElementById("referralLink");
    if (ref) ref.value = data.referralLink || "";

    // STATS
    const totalUsers = document.getElementById("totalUsers");
    if (totalUsers) totalUsers.innerText = data.totalUsers || 0;

    const totalBusinesses = document.getElementById("totalBusinesses");
    if (totalBusinesses) totalBusinesses.innerText = data.totalBusinesses || 0;
    
    const totalAgents = document.getElementById("totalAgents");
if (totalAgents) {
  totalAgents.innerText = data.totalAgents || 0;
}

    // AGENT INFO
    const level = document.getElementById("agentLevel");
    if (level) level.innerText = data.level || "Bronze";

    const revenue = document.getElementById("agentRevenue");
    if (revenue) revenue.innerText = (data.totalCommission || 0) + " HTG";

    const progressText = document.getElementById("agentProgress");
    const progressBar = document.getElementById("progressFill");

    const progress = data.progress || 0;

    if (progressText) progressText.innerText = progress + "%";
    if (progressBar) progressBar.style.width = progress + "%";

  } catch (error) {
    console.error("Dashboard error:", error);
  }
}


// ==========================
// NAVIGATION ACTIONS
// ==========================

// Become Agent
document.getElementById("btnBecomeAgent")?.addEventListener("click", () => {
  window.location.href = "https://fondationbackupspirituel.com/deveniragents.html";
});

// Create Business
document.getElementById("btnCreateBusiness")?.addEventListener("click", () => {
  window.location.href = "/business/register";
});

// Join Business
document.getElementById("btnJoinBusiness")?.addEventListener("click", () => {
  window.location.href = "/business/register";
});

// Create Account
document.getElementById("btnCreateAccount")?.addEventListener("click", () => {
  window.location.href = "https://fondationbackupspirituel.com/deveniragents.html";
});


// ==========================
// DEBUG
// ==========================
console.log("FOBAS DIGITAL AGENTS - PRODUCTION JS CONNECTED");

