let adminUnlocked = false;

async function unlockAdmin() {
  const input = document.getElementById("adminPassword").value;
  const error = document.getElementById("adminError");

  error.style.display = "none";

  const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: input })
  });

  const data = await res.json();

  if (data.ok) {
    adminUnlocked = true;
    document.getElementById("adminLock").style.display = "none";
    loadTransactions(currentStatus);
  } else {
    error.style.display = "block";
  }
}



// ========== VARIABLES ==========
const transactionsEl = document.getElementById("transactions");
const tabs = document.querySelectorAll(".tab");
const searchBox = document.getElementById("searchBox");

// Nouvo stats cards (kreye dinamikman si pa egziste deja)
let statsContainer = document.getElementById("stats");
if (!statsContainer) {
  statsContainer = document.createElement("div");
  statsContainer.id = "stats";
  statsContainer.style.display = "flex";
  statsContainer.style.gap = "20px";
  statsContainer.style.marginBottom = "20px";
  transactionsEl.parentNode.insertBefore(statsContainer, transactionsEl);

  const totalPendingEl = document.createElement("div");
  totalPendingEl.id = "totalPending";
  totalPendingEl.className = "stat-card";
  totalPendingEl.textContent = "Pending: 0";
  statsContainer.appendChild(totalPendingEl);

  const totalActiveEl = document.createElement("div");
  totalActiveEl.id = "totalActive";
  totalActiveEl.className = "stat-card";
  totalActiveEl.textContent = "Active: 0";
  statsContainer.appendChild(totalActiveEl);

  const totalAmountEl = document.createElement("div");
  totalAmountEl.id = "totalAmount";
  totalAmountEl.className = "stat-card";
  totalAmountEl.textContent = "Total: 0 Gourdes";
  statsContainer.appendChild(totalAmountEl);
}

let currentStatus = "PENDING";
let allTx = [];

// ========== SOCKET LIVE UPDATE ==========
const socket = io("https://api.fondationbackupspirituel.com"); // chanje si VPS gen lot domain
socket.on("wallet-update", () => loadTransactions(currentStatus));

// ========== LOAD TRANSACTIONS ==========
async function loadTransactions(status = "PENDING") {
  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/transactions");
    const data = await res.json();
    allTx = data;
    renderTransactions(filterTransactions());
    updateStats(); // 🔥 Met ajou stats cards
  } catch (err) {
    console.error("Erreur fetch transactions:", err);
    transactionsEl.innerHTML = "<p>Erreur chargement transactions</p>";
  }
}

// ========== UPDATE STATS ==========
function updateStats() {
  const totalPending = allTx.filter(t => t.status === "PENDING").length;
  const totalActive = allTx.filter(t => t.status === "ACTIVE").length;
  const totalAmount = allTx.reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("totalPending").textContent = `Pending: ${totalPending}`;
  document.getElementById("totalActive").textContent = `Active: ${totalActive}`;
  document.getElementById("totalAmount").textContent = `Total: ${totalAmount} Gourdes`;
}

// ========== RENDER TRANSACTION CARDS ==========
function renderTransactions(txList) {
  transactionsEl.innerHTML = "";
  if (!txList.length) return transactionsEl.innerHTML = "<p>Aucune transaction trouvée</p>";

  txList.forEach(tx => {
    const div = document.createElement("div");
    div.className = "tx";
    div.style.transition = "0.3s";
    div.onmouseover = () => div.style.background = "linear-gradient(90deg, #f7e600, #00bfff)";
    div.onmouseout = () => div.style.background = "";

    div.innerHTML = `
      <div class="tx-info">
        <b>${tx.type.toUpperCase()}</b>
        <span>${tx.email}</span>
        <span>${tx.amount} Gourdes</span>
        <span class="status ${tx.status.toLowerCase()}">${tx.status}</span>
      </div>
      <div class="tx-details">
        Méthode: ${tx.method || "-"} | WhatsApp: ${tx.whatsapp || "-"} | Pays: ${tx.country || "-"}
      </div>
    `;

    if (tx.status === "PENDING") {
      const btn = document.createElement("button");
      btn.textContent = "VALIDER";
      btn.className = "validate-btn";
      btn.style.cursor = "pointer";
      btn.onclick = () => validateTx(tx._id, btn);
      div.appendChild(btn);
    }

    transactionsEl.appendChild(div);
  });
}

// ========== VALIDATE TRANSACTION ==========
async function validateTx(id, btn) {
  btn.disabled = true;
  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/activate-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id })
    });

    const data = await res.json();
    alert(data.message);
    loadTransactions(currentStatus);
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}

// ========== TABS FUNCTIONALITY ==========
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentStatus = tab.dataset.status;
    renderTransactions(filterTransactions());
    updateStats();
  });
});






// ==================================================
// AJOUT WALLET FOBAS — SURVEILLANCE AGENTS
// ==================================================
const surveillanceTab = document.getElementById("tab-surveillance-agents");
const transactionsDiv = document.getElementById("transactions");

if (surveillanceTab && transactionsDiv) {
  surveillanceTab.addEventListener("click", () => {

    // Retire active sou tout tabs
    document.querySelectorAll(".tabs .tab").forEach(tab => {
      tab.classList.remove("active");
    });

    // Mete surveillance tab active
    surveillanceTab.classList.add("active");

    // Chaje dashboard surveillance agent la NAN MENM ESPAS transactions
    transactionsDiv.innerHTML = `
      <iframe
        src="surveillanceagentdashboard.html"
        style="width:100%; height:80vh; border:none;"
      ></iframe>
    `;
  });
}


// ========== SEARCH FUNCTIONALITY ==========
searchBox.addEventListener("input", () => {
  renderTransactions(filterTransactions());
  updateStats();
});

function filterTransactions() {
  let filtered = allTx;
  if (currentStatus !== "ALL") filtered = filtered.filter(t => t.status === currentStatus);
  const query = searchBox.value.toLowerCase();
  if (query) filtered = filtered.filter(t =>
    t.email.toLowerCase().includes(query) || t.type.toLowerCase().includes(query)
  );
  return filtered;
}


// ========== INITIAL LOAD ==========
if (adminUnlocked) loadTransactions(currentStatus);
