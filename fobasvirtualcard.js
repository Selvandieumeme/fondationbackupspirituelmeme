// fobasvirtualcard.js
const API_BASE = "https://api.fondationbackupspirituel.com"; // Prod API FOBAS

const userId = "USER_ID_FOBAS"; // Ranplase ak id itilizatè aktyèl

const cardNumberEl = document.getElementById("card-number");
const cardBalanceEl = document.getElementById("card-balance");
const cardStatusEl = document.getElementById("card-status");
const transactionListEl = document.getElementById("transaction-list");

const loadBtn = document.getElementById("load-btn");
const freezeBtn = document.getElementById("freeze-btn");
const refreshBtn = document.getElementById("refresh-btn");
const loadAmountInput = document.getElementById("load-amount");

// Fetch kat ak tranzaksyon
async function loadCard() {
  try {
    const res = await fetch(`${API_BASE}/cards/${userId}`);
    const data = await res.json();

    if (!data || !data.cardNumber) return;

    cardNumberEl.textContent = data.cardNumber;
    cardBalanceEl.textContent = `Balance: ${data.balance} HTG`;
    cardStatusEl.textContent = `Status: ${data.status}`;

    transactionListEl.innerHTML = "";
    // Ranplase transactions ak fobas_card_tx
    data.fobas_card_tx.forEach(tx => {
      const li = document.createElement("li");
      li.textContent = `${tx.date} | ${tx.type} | ${tx.amount} HTG`;
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

  try {
    await fetch(`${API_BASE}/cards/${userId}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    loadCard();
    loadAmountInput.value = "";
  } catch (err) {
    console.error("Error loading card:", err);
  }
});

// Freeze / Unfreeze
freezeBtn.addEventListener("click", async () => {
  try {
    const status = cardStatusEl.textContent.includes("Active") ? "frozen" : "active";
    await fetch(`${API_BASE}/cards/${userId}/freeze`, {
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
