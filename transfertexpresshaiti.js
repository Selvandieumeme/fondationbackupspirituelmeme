// ========================================
// JS – Transfert Express Haiti (AUTO REMPLISSAGE via verification + intégration agent-verification + code unique + expiration)
// ========================================

// 1️⃣ Sélection du formulaire et du message
const formTransfert = document.getElementById('formTransfert');
const messageEl = document.getElementById('transfertMessage');

// 2️⃣ Création dynamique du bouton VALIDER
const btnValider = document.createElement('button');
btnValider.type = 'button';
btnValider.textContent = 'Valider';
btnValider.className = 'btn-primary';
btnValider.style.display = 'none';
if (formTransfert && !formTransfert.contains(btnValider)) {
  formTransfert.appendChild(btnValider);
}

// ========================================
// 3️⃣ Agent Verification + Prefill + Code Unique + Expiration
// ========================================
function verifyCurrentAgent() {
    const userEmailEl = document.getElementById("userEmail");
    const userNameEl = document.getElementById("userName");
    const msg = document.getElementById("verificationMessage");
    const container = document.getElementById("transfertExpressContainer");

    if (!userEmailEl || !userNameEl || !msg || !container) {
        console.error("Éléments DOM manquants pour la vérification Agent");
        return;
    }

    const email = userEmailEl.textContent.trim();
    const fullName = userNameEl.textContent.trim();

    msg.textContent = "Vérification en cours...";
    msg.style.color = "#007BFF";

    // Chaje fòm la
    fetch("transfertexpresshaiti.html")
        .then(res => {
            if (!res.ok) throw new Error("Formulaire introuvable");
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;

            // Initialiser fòm ak done agent la
            if (typeof initTransfertExpress === "function") {
                initTransfertExpress(container, fullName, email);

                // Ranpli chan agent yo + code unique + expiration
                if (typeof prefillAgentFields === "function") {
                    setTimeout(() => {
                        prefillAgentFields(email);
                    }, 50); // ti delè pou asire DOM fin chaje
                }

                msg.textContent = "Agent autorisé confirmé ✅";
                msg.style.color = "green";
            } else {
                console.error("initTransfertExpress non défini");
                msg.textContent = "Erreur initialisation formulaire";
                msg.style.color = "red";
            }
        })
        .catch(err => {
            console.error("Erreur chargement formulaire:", err);
            msg.textContent = "Erreur chargement formulaire.";
            msg.style.color = "red";
        });
}

function initTransfertExpress(container, fullName, email) {
    try {
        const nomPrenomField = container.querySelector("#agentName");
        const emailField = container.querySelector("#agentEmail");

        if (!nomPrenomField || !emailField) {
            console.error("Chan Agent pa jwenn nan fòm lan");
            return;
        }

        nomPrenomField.value = fullName;
        emailField.value = email;
    } catch (err) {
        console.error("Erreur initTransfertExpress:", err);
    }
}




function prefillAgentFields(agentEmail) {
    try {
        const agentNameField = document.getElementById('agentName');
        const agentEmailField = document.getElementById('agentEmail');
        const codeField = document.getElementById('transferCode');
        const expirationField = document.getElementById('transferExpiration');

        // Récupération done agent sou dashboard
        const agentName = document.getElementById('userName')?.textContent?.trim() || '';
        const agentEmailText = agentEmail?.trim() || document.getElementById('userEmail')?.textContent?.trim() || '';

        if (agentNameField) {
            agentNameField.value = agentName;
            agentNameField.readOnly = true;
        }
        if (agentEmailField) {
            agentEmailField.value = agentEmailText;
            agentEmailField.readOnly = true;
        }

        // ✅ Generate code unique otomatik
        if (codeField) {
            const uniqueCode = `TRF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            codeField.value = uniqueCode;
        }

        // ✅ Mete expiration 7 jou depi kounye a
        if (expirationField) {
            const today = new Date();
            const expireDate = new Date(today.getTime() + 7*24*60*60*1000);
            const dd = String(expireDate.getDate()).padStart(2, '0');
            const mm = String(expireDate.getMonth() + 1).padStart(2, '0');
            const yyyy = expireDate.getFullYear();
            expirationField.value = `${dd}/${mm}/${yyyy}`;
        }

        // Mete mesaj konfimasyon agent
        if (messageEl) {
            messageEl.style.color = 'green';
            messageEl.textContent = `Agent autorisé confirmé ✅\nNom: ${agentName}\nEmail: ${agentEmailText}\nCode: ${codeField?.value}\nExpiration: ${expirationField?.value}`;
        }

        // Reset chan client san kraze lòt chan
        [
            'senderName', 'senderCIN', 'senderCountry', 'senderAddress', 'senderWhatsapp',
            'receiverName', 'receiverCountry', 'receiverAddress', 'receiverWhatsapp',
            'transferAmount', 'transferCurrency'
        ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

    } catch (err) {
        console.error("Erreur dans prefillAgentFields:", err);
    }
}








// ========================================
// 4️⃣ Trigger bouton Transfert Express Haiti
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const btnTransfertExpress = document.getElementById('btnTransfertExpress');
  if (btnTransfertExpress) {
    btnTransfertExpress.addEventListener('click', () => {
      if (typeof verifyCurrentAgent === 'function') {
        verifyCurrentAgent();
      } else {
        console.warn("verifyCurrentAgent non défini, fallback prefill");
        prefillAgentFields();
      }
    });
  }
});


// ========================================
// 5️⃣ Submit FORMULAIRE = TRANSFERER
// ========================================
if(formTransfert){
  formTransfert.addEventListener('submit', async (e) => {
    e.preventDefault();
  // ✅ AJOUTE BLOC SA A ICI (POSITION EXACTE)
    const statusEl = document.getElementById("transfertStatus");
    if (statusEl) {
      statusEl.textContent = "⏳ Transfert en cours d'envoi...";
      statusEl.style.color = "#0d6efd"; // bleu
    }
    messageEl.textContent = '';
    messageEl.style.color = '';

    const agentEmail = document.getElementById('agentEmail')?.value;
    const transferAmount = parseFloat(document.getElementById('transferAmount')?.value || 0);

    if (!agentEmail || !transferAmount || transferAmount <= 0) {
      messageEl.style.color = 'red';
      messageEl.textContent = 'Montant ou email agent invalide.';
      return;
    }

    try {
      const response = await fetch('https://api.fondationbackupspirituel.com/api/transfert/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: document.getElementById('agentName')?.value,
          agentEmail,
          senderName: document.getElementById('senderName')?.value,
          senderCIN: document.getElementById('senderCIN')?.value,
          senderCountry: document.getElementById('senderCountry')?.value,
          senderAddress: document.getElementById('senderAddress')?.value,
          senderWhatsapp: document.getElementById('senderWhatsapp')?.value,
          receiverName: document.getElementById('receiverName')?.value,
          receiverCountry: document.getElementById('receiverCountry')?.value,
          receiverAddress: document.getElementById('receiverAddress')?.value,
          receiverWhatsapp: document.getElementById('receiverWhatsapp')?.value,
          transferAmount,
          transferCurrency: document.getElementById('transferCurrency')?.value
        })
      });

      const result = await response.json();

      if (!result.ok) {
        messageEl.style.color = 'red';
        messageEl.textContent = result.message;
        return;
      }

      // Remplissage code + expiration + status
      document.getElementById('transferCode').value = result.transferCode;
      document.getElementById('transferExpiration').value = result.transferExpiration;
      document.getElementById('transferStatus').value = 'PENDING';

      messageEl.style.color = 'green';
      messageEl.textContent = `Transfert réussi ✅\nCode: ${result.transferCode}\nExpiration: ${result.transferExpiration}`;

      // Afficher bouton VALIDER
      btnValider.style.display = 'inline-block';

    } catch(err){
      messageEl.style.color = 'red';
      messageEl.textContent = 'Erreur serveur lors de la création du transfert.';
    }
  });
}

// ========================================
// 6️⃣ BOUTON VALIDER = VALIDATION DEFINITIVE
// ========================================
if(btnValider){
  btnValider.addEventListener('click', async () => {
    const transfertData = {
      agentName: document.getElementById('agentName')?.value,
      agentEmail: document.getElementById('agentEmail')?.value,
      senderName: document.getElementById('senderName')?.value,
      senderCIN: document.getElementById('senderCIN')?.value,
      senderCountry: document.getElementById('senderCountry')?.value,
      senderAddress: document.getElementById('senderAddress')?.value,
      senderWhatsapp: document.getElementById('senderWhatsapp')?.value,
      receiverName: document.getElementById('receiverName')?.value,
      receiverCountry: document.getElementById('receiverCountry')?.value,
      receiverAddress: document.getElementById('receiverAddress')?.value,
      receiverWhatsapp: document.getElementById('receiverWhatsapp')?.value,
      transferAmount: parseFloat(document.getElementById('transferAmount')?.value || 0),
      transferCurrency: document.getElementById('transferCurrency')?.value,
      transferCode: document.getElementById('transferCode')?.value,
      transferStatus: document.getElementById('transferStatus')?.value || 'PENDING',
      transferExpiration: document.getElementById('transferExpiration')?.value
    };

    try {
      const response = await fetch('https://api.fondationbackupspirituel.com/api/transfert/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfertData)
      });

      const result = await response.json();

      if (!result.ok) {
        messageEl.style.color = 'red';
        messageEl.textContent = result.message;
        return;
      }

      messageEl.style.color = 'green';
      messageEl.textContent = 'Transfert validé et en attente de retrait ✅';

      // Reset champs client
      [
        'senderName', 'senderCIN', 'senderCountry', 'senderAddress', 'senderWhatsapp',
        'receiverName', 'receiverCountry', 'receiverAddress', 'receiverWhatsapp',
        'transferAmount', 'transferCurrency'
      ].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
      });

      btnValider.style.display = 'none';

    } catch(err){
      messageEl.style.color = 'red';
      messageEl.textContent = 'Erreur serveur lors de la validation.';
    }
  });
}
