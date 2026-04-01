// ================================
// rechargermacarte.js — FOBAS Virtual Card
// ================================

document.addEventListener("DOMContentLoaded", () => {

  // ======= Elements =======
  const formRecharge = document.getElementById("formRecharge");
  const inputEmail = document.getElementById("email");
  const inputCardId = document.getElementById("cardId");
  const inputAmountHTG = document.getElementById("amountHTG");
  const btnRecharge = document.getElementById("btnRecharge");
  const toastContainer = document.getElementById("toastContainer");
  const loader = document.getElementById("loader");

  // ======= Show Toast =======
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // ======= Show / Hide Loader =======
  function showLoader(show = true) {
    loader.style.display = show ? "block" : "none";
  }

  // ======= Handle Form Submission =======
  if (formRecharge) {
    formRecharge.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = inputEmail.value.trim();
      const cardId = inputCardId.value.trim();
      const amountHTG = parseFloat(inputAmountHTG.value.trim());

      if (!email || !cardId || !amountHTG || amountHTG <= 0) {
        showToast("Tanpri ranpli tout chan yo avèk valè valid.", "error");
        return;
      }

      try {
        showLoader(true);

        // API request to backend recharge endpoint
        const response = await fetch(`/cards/${cardId}/recharge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, amountHTG })
        });

        const data = await response.json();
        showLoader(false);

        if (response.ok && data.success) {
          showToast(`Recharge reyalize avèk siksè! Montan USD chaje: $${data.amountUSD.toFixed(2)}`, "success");

          // Clear input fields
          inputAmountHTG.value = "";
          inputCardId.value = "";
        } else {
          showToast(data.error || "Echèj recharge kat la.", "error");
        }

      } catch (err) {
        showLoader(false);
        console.error("Recharge JS Error:", err);
        showToast("Echèk koneksyon ak serveurs la.", "error");
      }
    });
  }

  // ======= Optional: Dynamic conversion display =======
  if (inputAmountHTG) {
    const conversionDisplay = document.getElementById("conversionUSD");
    inputAmountHTG.addEventListener("input", async () => {
      const amountHTG = parseFloat(inputAmountHTG.value);
      if (!amountHTG || amountHTG <= 0) {
        conversionDisplay.textContent = "";
        return;
      }

      // Backend handles HTG → USD, we can call a preview endpoint if exists
      try {
        const resp = await fetch(`/cards/convert-preview?amountHTG=${amountHTG}`);
        const data = await resp.json();
        if (resp.ok) conversionDisplay.textContent = `≈ $${data.amountUSD.toFixed(2)} USD`;
        else conversionDisplay.textContent = "";
      } catch {
        conversionDisplay.textContent = "";
      }
    });
  }

});
