// cashbackrewards.js
document.addEventListener("DOMContentLoaded", () => {

  // Chwazi bouton "Activer maintenant" sou dashboard
  const activateBtn = document.getElementById("activateCashbackBtn");
  const msgBox = document.getElementById("cashbackMsg");

  if (!activateBtn) return;

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

    // Récupère email itilizate a sou dashboard (modifye selon HTML ou)
    const userEmail = activateBtn.dataset.userEmail;
    if (!userEmail) {
      if (msgBox) {
        msgBox.textContent = "⚠️ Pa jwenn email itilizate a.";
        msgBox.style.color = "red";
      }
      activateBtn.disabled = false;
      activateBtn.textContent = originalText;
      return;
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
      activateBtn.disabled = false;
      activateBtn.textContent = originalText;
    }
  });

});
