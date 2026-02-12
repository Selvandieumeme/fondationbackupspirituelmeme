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
// 📨 CHAT ITILIZATE – ADMIN (DINAMIK)
// ==========================

const chatAPI = "https://api.fondationbackupspirituel.com"; // API ou deja itilize
const chatSocket = io(chatAPI); // koneksyon socket.io

// ─── DEFINISYON CURRENT USER ───
const currentUserChat = {
  email: userEmail,  // sòti nan dashboard JS ou
  fullName: userName
};

// ─── TOGGLE ESPAS CHAT ───
document.getElementById("btnAdminChat").onclick = () => {
  const box = document.getElementById("adminMessagesBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
  if (box.style.display === "block") {
    loadUserAdminMessages();
  }
};

// ─── VOYE MESAJ ITILIZATE → ADMIN ───
async function sendUserAdminMessage(message) {
  if (!message || message.trim().length < 2) return alert("Message trop court");

  try {
    const res = await fetch(`${chatAPI}/api/user/message-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUserChat.email,
        fullName: currentUserChat.fullName,
        message
      })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Erreur serveur");

    // Vide tèks la
    document.getElementById("adminMessageText").value = "";
    loadUserAdminMessages();

    // Emit pou admin resevwa instant
    chatSocket.emit("user_message", { email: currentUserChat.email, message });

  } catch (err) {
    console.error("Erreur envoi message:", err);
    alert("Erreur serveur lors de l'envoi du message");
  }
}

// ─── CHAJI LIST MESAJ ITILIZATE ↔ ADMIN ───
async function loadUserAdminMessages() {
  try {
    const res = await fetch(`${chatAPI}/api/user/messages?email=${encodeURIComponent(currentUserChat.email)}`);
    const messages = await res.json();
    const box = document.getElementById("adminMessagesBox");
    box.innerHTML = "";

    if (!messages.length) {
      box.innerHTML = "<p style='opacity:0.6;'>Aucun message</p>";
      return;
    }

    messages.forEach(m => {
      const div = document.createElement("div");
      div.style.borderBottom = "1px solid #eee";
      div.style.padding = "6px 4px";

      div.innerHTML = `
        <b>${m.senderName === "admin" ? "Admin" : currentUserChat.fullName}</b>: ${m.message}
        <br><small style="opacity:.6">${new Date(m.createdAt).toLocaleString("fr-HT")}</small>
      `;
      box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;

  } catch (err) {
    console.error("Erreur loadUserAdminMessages:", err);
  }
}

// ─── SOCKET ITILIZATE RICEVRE MESAJ ADMIN ───
chatSocket.on("admin_reply", data => {
  if (data.email === currentUserChat.email) {
    loadUserAdminMessages();
  }
});

// ─── INIT INPUT POU VOYE MESAJ ───
// Ou ka mete yon ti input ak bouton nan HTML anba `adminMessagesBox`:
// <input type="text" id="adminMessageText" placeholder="Écrire un message..." />
// <button id="sendAdminMessage">Envoyer</button>
document.getElementById("sendAdminMessage")?.addEventListener("click", () => {
  const message = document.getElementById("adminMessageText").value;
  sendUserAdminMessage(message);
});

// ─── AUTO REFRESH SÈLMAN SI CHAT OUVRI ───
setInterval(() => {
  const box = document.getElementById("adminMessagesBox");
  if (box.style.display === "block") loadUserAdminMessages();
}, 5000);
