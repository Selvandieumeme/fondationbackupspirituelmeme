// fobasvirtualcard.js
const API_BASE = "https://api.fondationbackupspirituel.com"; // Prod API FOBAS

const email = "USER_EMAIL_FOBAS"; // Ranplase ak email itilizatè aktyèl

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
    const res = await fetch(`${API_BASE}/cards/${email}`);
    const data = await res.json();

    if (!data || !data.length) return;

    // Nou pran premye kat itilizatè a
    const card = data[0];

    cardNumberEl.textContent = card.cardNumber;
    cardBalanceEl.textContent = `Balance: ${card.balance} HTG`;
    cardStatusEl.textContent = `Status: ${card.status}`;

    transactionListEl.innerHTML = "";
    
    // Fetch tranzaksyon pou kat la
    const txRes = await fetch(`${API_BASE}/cards/${card._id}/fobas_card_tx`);
    const transactions = await txRes.json();

    transactions.forEach(tx => {
      const li = document.createElement("li");
      const date = new Date(tx.createdAt).toLocaleDateString();
      li.textContent = `${date} | ${tx.type} | ${tx.amount} HTG`;
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
    const res = await fetch(`${API_BASE}/cards/${cardId}/load`, {
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
    const card = (await fetch(`${API_BASE}/cards/${email}`)).json();
    const status = card[0].status === "active" ? "frozen" : "active";

    await fetch(`${API_BASE}/cards/${card[0]._id}/freeze`, {
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
