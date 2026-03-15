document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("expressForm");
    const transferResult = document.getElementById("transferResult");
    const transferCodeInput = document.getElementById("transferCode");
    const createdDateInput = document.getElementById("createdDate");
    const expirationDateInput = document.getElementById("expirationDate");

    if (!form) return;

    // Fonksyon pou jenere code unique (FOB + timestamp)
    function generateTransferCode() {
        return "FOB-" + Date.now().toString().slice(-7);
    }

    // Fonksyon pou kalkile dat expiration (+21 jou)
    function calculateExpiration() {
        const today = new Date();
        const expiration = new Date();
        expiration.setDate(today.getDate() + 21);
        return expiration.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        transferResult.innerHTML = "";

        // Récupération des champs
        const data = {
            agentName: document.getElementById("agentName").value.trim(),
            agentEmail: document.getElementById("agentEmail").value.trim(),
            senderName: document.getElementById("senderName").value.trim(),
            senderId: document.getElementById("senderId").value.trim(),
            senderCountry: document.getElementById("senderCountry").value.trim(),
            senderCity: document.getElementById("senderCity").value.trim(),
            senderAddress: document.getElementById("senderAddress").value.trim(),
            senderWhatsapp: document.getElementById("senderWhatsapp").value.trim(),
            receiverName: document.getElementById("receiverName").value.trim(),
            receiverCountry: document.getElementById("receiverCountry").value.trim(),
            receiverCity: document.getElementById("receiverCity").value.trim(),
            receiverAddress: document.getElementById("receiverAddress").value.trim(),
            receiverWhatsapp: document.getElementById("receiverWhatsapp").value.trim(),
            amountHTG: Number(document.getElementById("amountHTG").value)
        };

        if (data.amountHTG <= 0) {
            alert("Montant doit être supérieur à 0");
            return;
        }

        // Calcul frais 15%
        const fees = data.amountHTG * 0.15;
        const totalDebit = data.amountHTG + fees;

        // Ajoute code, dat kreasyon ak expiration nan fòm
        const transferCode = generateTransferCode();
        const today = new Date().toISOString().split("T")[0];
        const expiration = calculateExpiration();

        transferCodeInput.value = transferCode;
        createdDateInput.value = today;
        expirationDateInput.value = expiration;

        // Ajoute infos detaye pou API
        const payload = {
            ...data,
            feesHTG: fees,
            totalDebitHTG: totalDebit,
            transferCode: transferCode,
            createdAt: today,
            expirationDate: expiration,
            status: "Pending"
        };

        try {
            const res = await fetch("https://api.fondationbackupspirituel.com/expressfobas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.error) {
                transferResult.innerHTML = `<span style="color:red;font-weight:bold">${result.error}</span>`;
            } else {
                transferResult.innerHTML = `<span style="color:green;font-weight:bold">Transfert créé avec succès ! Code ExpressFOBAS : ${result.transferCode}</span>`;
            }
        } catch (err) {
            console.error("Erreur API ExpressFOBAS :", err);
            transferResult.innerHTML = `<span style="color:red;font-weight:bold">Erreur de communication avec le serveur. Veuillez réessayer.</span>`;
        }
    });

    // Bouton Back
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    // Bouton ExpressRetrait (prepare pou nouvo paj)
    const retraitBtn = document.getElementById("retraitBtn");
    if (retraitBtn) {
        retraitBtn.addEventListener("click", () => {
            window.location.href = "expressretrait.html";
        });
    }

});
