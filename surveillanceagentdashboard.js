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
// 📨 CHAT ADMIN DINAMIK
// ==========================

const API = "https://api.fondationbackupspirituel.com";
const socket = io(API); // koneksyon socket.io

// ─── FONKSYON DISPLAY CHAT ───
document.getElementById("btnAdminChat").onclick = () => {
  const box = document.getElementById("adminMessagesBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

// ─── VOYE MESAJ ITILIZATE VERS ADMIN ───
document.getElementById("sendAdminMessage").onclick = async () => {
  const message = document.getElementById("adminMessageText").value;
  if (!message || message.trim().length < 2) return alert("Message trop court");

  try {
    const res = await fetch(`${API}/api/user/message-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        fullName: currentUser.fullName,
        message
      })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Erreur serveur");

    document.getElementById("adminMessageText").value = "";
    loadUserMessages();

    // Emit instant socket pou admin resevwa
    socket.emit("user_message", { email: currentUser.email, fullName: currentUser.fullName, message });
  } catch (err) {
    console.error("Erreur envoi message:", err);
    alert("Erreur serveur lors de l'envoi du message");
  }
};

// ─── CHARGE MESAJ ITILIZATE YO ───
async function loadUserMessages() {
  try {
    const res = await fetch(`${API}/api/user/messages?email=${encodeURIComponent(currentUser.email)}`);
    const messages = await res.json();

    const list = document.getElementById("messagesListUser") || document.createElement("ul");
    list.id = "messagesListUser";
    if (!document.getElementById("messagesListUser")) {
      document.getElementById("adminMessagesBox").prepend(list);
    }
    list.innerHTML = "";

    if (!messages.length) {
      list.innerHTML = "<li style='opacity:0.6;'>Aucun message</li>";
      return;
    }

    messages.forEach(m => {
      const li = document.createElement("li");
      li.style.padding = "4px 6px";
      li.style.borderBottom = "1px solid #eee";

      li.innerHTML = `
        <b>${m.senderName === "admin" ? "Admin" : currentUser.fullName}</b>: 
        ${m.message}
        <br><small style="opacity:.6">${new Date(m.createdAt).toLocaleString("fr-HT")}</small>
      `;
      list.appendChild(li);
    });

    list.scrollTop = list.scrollHeight;
  } catch (err) {
    console.error("Erreur loadUserMessages:", err);
  }
}

// Auto refresh chak 5 segonn
setInterval(loadUserMessages, 5000);
loadUserMessages();

// ─── SOCKET RECEIVE ADMIN REPLY POU ITILIZATE INSTANT ───
socket.on("admin_reply", data => {
  if (data.email === currentUser.email) {
    loadUserMessages();
  }
});

// ─── CHARGE MESAJ ADMIN POU ADMIN DASHBOARD ───
async function loadAdminMessages() {
  try {
    const res = await fetch(`${API}/api/admin/messages`);
    const messages = await res.json();
    const box = document.getElementById("adminMessagesBox");
    box.innerHTML = "";

    messages.forEach(m => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ddd";
      div.style.padding = "8px";
      div.style.marginBottom = "6px";

      div.innerHTML = `
        <b>${m.userFullName || m.userEmail}</b><br>
        📨 ${m.messageFromUser || ""}
        <br><textarea data-id="${m._id}" placeholder="Répondre..."></textarea>
        <button onclick="replyAdminMessage('${m._id}', '${m.userEmail}')">Répondre</button>
      `;
      box.appendChild(div);
    });
  } catch (err) {
    console.error("Erreur loadAdminMessages:", err);
  }
}

// ─── REPLY ADMIN POU ITILIZATE ───
async function replyAdminMessage(id, userEmailTarget) {
  const textarea = document.querySelector(`textarea[data-id="${id}"]`);
  const reply = textarea.value;
  if (!reply) return;

  try {
    const res = await fetch(`${API}/api/admin/reply-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: id, reply })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Erreur serveur");

    textarea.value = "";
    loadAdminMessages();

    // Emit socket pou itilizatè resevwa instant
    socket.emit("admin_reply", { email: userEmailTarget, reply });
  } catch (err) {
    console.error("Erreur replyAdminMessage:", err);
  }
}

// Auto refresh admin chak 5 segonn
setInterval(loadAdminMessages, 5000);
loadAdminMessages();
