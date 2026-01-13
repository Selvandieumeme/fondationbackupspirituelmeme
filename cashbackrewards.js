// cashbackrewards.js 
document.addEventListener("DOMContentLoaded", () => {

  // Chwazi bouton "Activer maintenant" sou dashboard
  const activateBtn = document.getElementById("activateCashbackBtn");
  const msgBox = document.getElementById("cashbackMsg");

  if (!activateBtn) return;

  // --- Nou verifye si itilizatè deja aktive cashback
  const userEmail = activateBtn.dataset.userEmail;
  if (userEmail) {
    fetch(`/api/wallet/checkCashbackStatus?userEmail=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.alreadyActive) {
          activateBtn.disabled = true;
          activateBtn.textContent = "✅ Cashback déjà activé";
          if (msgBox) {
            msgBox.textContent = "Cashback deja aktive pou ou.";
            msgBox.style.color = "#16a34a";
          }
        }
      })
      .catch(err => console.error("Erreur fetch status cashback:", err));
  }

  activateBtn.addEventListener("click", async () => {
    // Evite double klik
    if (activateBtn.disabled) return;
    activateBtn.disabled = true;

    const originalText = activateBtn.textContent;
    activateBtn.textContent = "⏳ Traitement...";

    if (msgBox) {
      msgBox.textContent = "Nap aktive cashback, tanpri rete tann...";
      msgBox.style.color = "#0ea5e9";
    }

    try {
      const response = await fetch("/api/wallet/subscribeCashback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail })
      });

      const data = await response.json();

      if (msgBox) {
        if (data.success) {
          msgBox.textContent = "✅ Cashback aktive avèk siksè!";
          msgBox.style.color = "#16a34a";
          // Disable bouton pou evite double activation
          activateBtn.disabled = true;
          activateBtn.textContent = "✅ Cashback déjà activé";
        } else {
          msgBox.textContent = "⚠️ " + data.message;
          msgBox.style.color = "red";
        }
      }

    } catch (err) {
      console.error("Erreur fetch:", err);
      if (msgBox) {
        msgBox.textContent = "⚠️ Erè serveur, réessayez pita.";
        msgBox.style.color = "red";
      }
    } finally {
      if (!activateBtn.disabled) activateBtn.disabled = false;
      if (!activateBtn.disabled) activateBtn.textContent = originalText;
    }
  });

});
