// fobasvirtualcard.js
const API_BASE = "https://api.fondationbackupspirituel.com"; // Prod API FOBAS

// Chaje email & nom itilizatè depi dashboard FOBAS
const email = window.localStorage.getItem("fobasUserEmail") || "USER_EMAIL_FOBAS";
const userName = window.localStorage.getItem("fobasUserName") || "Utilisateur FOBAS";

// Elements HTML
const userNameEl = document.getElementById("user-name");
const userEmailEl = document.getElementById("user-email");
const cardNumberEl = document.getElementById("card-number");
const cardBalanceEl = document.getElementById("card-balance");
const cardStatusEl = document.getElementById("card-status");
const emiDateEl = document.getElementById("emi-date");
const expDateEl = document.getElementById("exp-date");
const cvvEl = document.getElementById("cvv");
const billingAddressEl = document.getElementById("billing-address");
const transactionListEl = document.getElementById("transaction-list");

const loadBtn = document.getElementById("load-btn");
const freezeBtn = document.getElementById("freeze-btn");
const refreshBtn = document.getElementById("refresh-btn");
const loadAmountInput = document.getElementById("load-amount");

let currentCardId = null;

// Mete Nom & Email itilizatè sou paj la
userNameEl.textContent = `Nom & Prénom: ${userName}`;
userEmailEl.textContent = `Email: ${email}`;

// Fetch kat ak tranzaksyon
async function loadCard() {
  try {
    const res = await fetch(`${API_BASE}/cards/${email}`);
    const data = await res.json();

    if (!data || !data.length) return;

    const card = data[0];
    currentCardId = card._id;

    cardNumberEl.textContent = card.cardNumber;
    cardBalanceEl.textContent = `Balance: ${card.balance} HTG`;
    cardStatusEl.textContent = `Status: ${card.status.charAt(0).toUpperCase() + card.status.slice(1)}`;
    emiDateEl.textContent = `EmiDate: ${card.EmiDate}`;
    expDateEl.textContent = `ExpDate: ${card.ExpDate}`;
    cvvEl.textContent = `CVV: ${card.cvv}`;
    billingAddressEl.textContent = `Billing: ${card.billingAddress || "--"}, ${card.postalCode || "--"}, ${card.country || "--"}`;

    transactionListEl.innerHTML = "";
    const txRes = await fetch(`${API_BASE}/cards/${card._id}/fobas_card_tx`);
    const transactions = await txRes.json();

    transactions.forEach(tx => {
      const li = document.createElement("li");
      li.textContent = `${new Date(tx.createdAt).toLocaleDateString()} | ${tx.type.toUpperCase()} | ${tx.amount} HTG`;
      transactionListEl.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading card:", err);
  }
}

// Load / top up kat
loadBtn.addEventListener("click", async () => {
  const amount = Number(loadAmountInput.value);
  if (!amount || amount <= 0) return alert("Mete yon montan valab");
  if (!currentCardId) return alert("Pa gen kat chaje!");

  try {
    const res = await fetch(`${API_BASE}/cards/${currentCardId}/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, email })
    });

    const result = await res.json();
    if (result.success) {
      alert(result.message);
      loadCard();
      loadAmountInput.value = "";
    } else {
      alert(result.error);
    }

  } catch (err) {
    console.error("Error loading card:", err);
  }
});

// Freeze / Unfreeze
freezeBtn.addEventListener("click", async () => {
  try {
    if (!currentCardId) return alert("Pa gen kat chaje!");
    const res = await fetch(`${API_BASE}/cards/${email}`);
    const data = await res.json();
    if (!data || !data.length) return;

    const card = data[0];
    const status = card.status === "active" ? "frozen" : "active";

    await fetch(`${API_BASE}/cards/${card._id}/freeze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    loadCard();
  } catch (err) {
    console.error("Error freezing card:", err);
  }
});

// Refresh kat
refreshBtn.addEventListener("click", loadCard);

// Load initial
loadCard();
