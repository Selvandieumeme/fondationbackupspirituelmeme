const API = "https://api.fondationbackupspirituel.com";

const select = document.getElementById("agentSelect");
const emailEl = document.getElementById("email");
const statusEl = document.getElementById("status");
const balanceEl = document.getElementById("balance");
const bonusEl = document.getElementById("bonus");
const lastActionEl = document.getElementById("lastAction");

let agentsCache = [];

// Charger agents surveillés
async function loadAgents() {
  const res = await fetch(`${API}/api/admin/surveillance-agents`);
  agentsCache = await res.json();

  select.innerHTML = "";

  agentsCache.forEach(agent => {
    const opt = document.createElement("option");
    opt.value = agent.email;
    opt.textContent = agent.email;
    select.appendChild(opt);
  });

  if (agentsCache[0]) {
    displayAgent(agentsCache[0].email);
  }
}

function displayAgent(email) {
  const agent = agentsCache.find(a => a.email === email);
  if (!agent) return;

  emailEl.textContent = agent.email;
  statusEl.textContent = agent.accountStatus;
  balanceEl.textContent = agent.balance;
  bonusEl.textContent = agent.bonus;
  lastActionEl.textContent = agent.lastAction || "—";
}

select.addEventListener("change", () => {
  displayAgent(select.value);
});

async function sendAction(action) {
  const email = select.value;
  if (!email) return;

  await fetch(`${API}/api/admin/agent-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, action })
  });

  await loadAgents(); // refresh immédiat
}







async function transferer() {
  const email = select.value;
  if (!email) return alert("Veuillez sélectionner un agent");

  const amount = prompt("Montant à transférer :");
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return alert("Montant invalide");
  }

  const target = prompt("Vers balance ou bonus ? (balance/bonus)").toLowerCase();
  if (target !== "balance" && target !== "bonus") {
    return alert("Cible invalide");
  }

  try {
    const res = await fetch(`${API}/api/admin/wallet-credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount: Number(amount), target })
    });
    const data = await res.json();
    alert(data.message || "Transfert effectué !");
    await loadAgents(); // rafrechi detay agent
  } catch (err) {
    console.error(err);
    alert("Erreur lors du transfert");
  }
}







// ======================================
// 🔐 ADMIN RETRAIT WALLET (SAFE)
// ======================================
async function retirer() {
  const email = select.value;
  if (!email) return alert("Veuillez sélectionner un agent");

  const amount = prompt("Montant à retirer :");
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return alert("Montant invalide");
  }

  const target = prompt("Retirer depuis balance ou bonus ? (balance/bonus)").toLowerCase();
  if (target !== "balance" && target !== "bonus") {
    return alert("Cible invalide");
  }

  try {
    const res = await fetch(`${API}/api/admin/wallet-withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: Number(amount),
        target
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message || "Erreur retrait");
    }

    alert(data.message || "Retrait effectué avec succès");
    await loadAgents(); // 🔄 rafraichi infos agent
  } catch (err) {
    console.error("❌ RETRAIT ERROR:", err);
    alert("Erreur serveur lors du retrait");
  }
}







async function adminNote() {
  const email = select.value;
  if (!email) return alert("Veuillez sélectionner un agent");

  const message = prompt("Message admin à envoyer :");
  if (!message || message.trim().length < 2) {
    return alert("Message invalide");
  }

  try {
    const res = await fetch(`${API}/api/admin/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message })
    });

    const data = await res.json();
    alert(data.message || "Note envoyée");

  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'envoi de la note");
  }
}


// Auto refresh toutes les 5 secondes
setInterval(loadAgents, 5000);
loadAgents();








// ==========================
// 🔐 CHAT ADMIN – VERSION SAFE (SANS SOCKET.IO)
// ==========================

const API = "https://api.fondationbackupspirituel.com";

/* =====================================================
   🛡️ PROTECTION ABSOLUE – PA JANM EXECUTE HORS ADMIN
   ===================================================== */
const adminBox = document.getElementById("adminMessagesBox");

if (!adminBox) {
  console.warn("⛔ Chat admin chargé hors dashboard admin – STOP");
  throw new Error("ADMIN CHAT JS STOPPED (SAFE)");
}

/* =====================================================
   📥 CHARGER MESSAGES UTILISATEURS
   ===================================================== */
async function loadAdminMessages() {
  try {
    const res = await fetch(`${API}/api/admin/messages`);
    if (!res.ok) throw new Error("Erreur chargement messages admin");

    const messages = await res.json();
    adminBox.innerHTML = "";

    if (!Array.isArray(messages) || messages.length === 0) {
      adminBox.innerHTML = "<p style='opacity:.6'>Aucun message</p>";
      return;
    }

    messages.forEach(m => {
      const bloc = document.createElement("div");
      bloc.style.border = "1px solid #ddd";
      bloc.style.padding = "10px";
      bloc.style.marginBottom = "8px";
      bloc.style.borderRadius = "6px";

      bloc.innerHTML = `
        <b>${m.userFullName || m.userEmail}</b><br>
        <div style="margin:6px 0;">📩 ${m.messageFromUser || ""}</div>
        <textarea
          data-id="${m._id}"
          rows="2"
          placeholder="Répondre..."
          style="width:100%; padding:6px;"
        ></textarea>
        <button
          data-reply="${m._id}"
          style="margin-top:6px;"
        >Répondre</button>
      `;

      adminBox.appendChild(bloc);
    });

  } catch (err) {
    console.error("❌ ADMIN CHAT LOAD ERROR:", err);
  }
}

/* =====================================================
   📤 REPONDRE A UN UTILISATEUR
   ===================================================== */
adminBox.addEventListener("click", async (e) => {
  if (!e.target.dataset.reply) return;

  const messageId = e.target.dataset.reply;
  const textarea = adminBox.querySelector(`textarea[data-id="${messageId}"]`);

  if (!textarea || textarea.value.trim().length < 1) return;

  try {
    const res = await fetch(`${API}/api/admin/reply-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId,
        reply: textarea.value.trim()
      })
    });

    if (!res.ok) throw new Error("Erreur réponse admin");

    textarea.value = "";
    loadAdminMessages();

  } catch (err) {
    console.error("❌ ADMIN REPLY ERROR:", err);
  }
});

/* =====================================================
   🔄 AUTO-REFRESH SAFE (SANS SOCKET)
   ===================================================== */
loadAdminMessages();
setInterval(loadAdminMessages, 5000);
