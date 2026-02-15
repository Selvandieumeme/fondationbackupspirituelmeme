// ========================================
// JS – Transfert Express Haiti (SAFE + AUTO PREFILL + INTEGRATION DASHBOARD)
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

  // ✅ Chaje fòm sèlman nan pwòp container, pa touche lòt fòm
  fetch("transfertexpresshaiti.html")
    .then(res => {
      if (!res.ok) throw new Error("Formulaire introuvable");
      return res.text();
    })
    .then(html => {
      container.innerHTML = html; // ONLY this container

      // Initialiser fòm ak done agent la
      initTransfertExpress(container, fullName, email);
      prefillAgentFields(email);

      msg.textContent = "Agent autorisé confirmé ✅";
      msg.style.color = "green";

    }).catch(err => {
      console.error("Erreur chargement formulaire:", err);
      msg.textContent = "Erreur chargement formulaire.";
      msg.style.color = "red";
    });
}

function initTransfertExpress(container, fullName, email) {
  const nomPrenomField = container.querySelector("#agentName");
  const emailField = container.querySelector("#agentEmail");

  if (nomPrenomField) {
    nomPrenomField.value = fullName;
    nomPrenomField.readOnly = true;
  }
  if (emailField) {
    emailField.value = email;
    emailField.readOnly = true;
  }
}

function prefillAgentFields(agentEmail) {
  const agentName = document.getElementById('userName')?.textContent?.trim() || '';
  const agentEmailText = agentEmail?.trim() || document.getElementById('userEmail')?.textContent?.trim() || '';

  const agentNameField = document.getElementById('agentName');
  const agentEmailField = document.getElementById('agentEmail');
  const codeField = document.getElementById('transferCode');
  const expirationField = document.getElementById('transferExpiration');

  if (agentNameField) agentNameField.value = agentName;
  if (agentEmailField) agentEmailField.value = agentEmailText;

  // ✅ Générer code unique
  if (codeField) codeField.value = `TRF-${Date.now()}-${Math.floor(Math.random()*10000)}`;

  // ✅ Expiration 7 jours
  if (expirationField){
    const expire = new Date(Date.now() + 7*24*60*60*1000);
    expirationField.value = `${String(expire.getDate()).padStart(2,'0')}/${String(expire.getMonth()+1).padStart(2,'0')}/${expire.getFullYear()}`;
  }

  if(messageEl){
    messageEl.style.color = 'green';
    messageEl.textContent = `Agent autorisé confirmé ✅\nNom: ${agentName}\nEmail: ${agentEmailText}\nCode: ${codeField?.value}\nExpiration: ${expirationField?.value}`;
  }

  // Reset sèlman chan kliyan, pa touche agent
  [
    'senderName','senderCIN','senderCountry','senderAddress','senderWhatsapp',
    'receiverName','receiverCountry','receiverAddress','receiverWhatsapp',
    'transferAmount','transferCurrency'
  ].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
}

// ========================================
// 4️⃣ Trigger bouton Transfert Express Haiti
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const btnTransfertExpress = document.getElementById('btnTransfertExpress');
  if(btnTransfertExpress){
    btnTransfertExpress.addEventListener('click', verifyCurrentAgent);
  }
});

// ========================================
// 5️⃣ Submit FORMULAIRE = TRANSFERER
// ========================================
if(formTransfert){
  formTransfert.addEventListener('submit', async (e)=>{
    e.preventDefault();

    if(messageEl){ messageEl.textContent=''; messageEl.style.color=''; }

    const agentNameField = document.getElementById('agentName');
    const agentEmailField = document.getElementById('agentEmail');
    const transferAmount = parseFloat(document.getElementById('transferAmount')?.value || 0);
    const transferCurrency = document.getElementById('transferCurrency')?.value || '';

    if(!agentEmailField?.value || !transferAmount || transferAmount<=0){
      if(messageEl){
        messageEl.style.color='red';
        messageEl.textContent='Montant ou email agent invalide.';
      }
      return;
    }

    // 🔹 Submit data
    try {
      const response = await fetch('https://api.fondationbackupspirituel.com/api/transfert/create',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          agentName:agentNameField.value,
          agentEmail:agentEmailField.value,
          senderName:document.getElementById('senderName')?.value||'',
          senderCIN:document.getElementById('senderCIN')?.value||'',
          senderCountry:document.getElementById('senderCountry')?.value||'',
          senderAddress:document.getElementById('senderAddress')?.value||'',
          senderWhatsapp:document.getElementById('senderWhatsapp')?.value||'',
          receiverName:document.getElementById('receiverName')?.value||'',
          receiverCountry:document.getElementById('receiverCountry')?.value||'',
          receiverAddress:document.getElementById('receiverAddress')?.value||'',
          receiverWhatsapp:document.getElementById('receiverWhatsapp')?.value||'',
          transferAmount,
          transferCurrency
        })
      });

      const result = await response.json();

      if(!result.ok){
        if(messageEl){ messageEl.style.color='red'; messageEl.textContent=result.message||'Erreur création transfert'; }
        return;
      }

      // Remplissage code + expiration
      const codeField = document.getElementById('transferCode');
      const expirationField = document.getElementById('transferExpiration');
      const statusField = document.getElementById('transferStatus');
      if(codeField) codeField.value = result.transferCode||'';
      if(expirationField) expirationField.value = result.transferExpiration||'';
      if(statusField) statusField.value = 'PENDING';
      if(messageEl) messageEl.style.color='green';
      if(messageEl) messageEl.textContent=`Transfert réussi ✅\nCode: ${result.transferCode||''}\nExpiration: ${result.transferExpiration||''}`;

      if(btnValider) btnValider.style.display='inline-block';

    } catch(err){
      console.error('❌ Erreur fetch /api/transfert/create:', err);
      if(messageEl){ messageEl.style.color='red'; messageEl.textContent='Erreur serveur lors de la création du transfert.'; }
    }
  });
}

// ========================================
// 6️⃣ BOUTON VALIDER = VALIDATION DEFINITIVE
// ========================================
if(btnValider){
  btnValider.addEventListener('click', async ()=>{
    const transfertData = {
      agentName:document.getElementById('agentName')?.value,
      agentEmail:document.getElementById('agentEmail')?.value,
      senderName:document.getElementById('senderName')?.value,
      senderCIN:document.getElementById('senderCIN')?.value,
      senderCountry:document.getElementById('senderCountry')?.value,
      senderAddress:document.getElementById('senderAddress')?.value,
      senderWhatsapp:document.getElementById('senderWhatsapp')?.value,
      receiverName:document.getElementById('receiverName')?.value,
      receiverCountry:document.getElementById('receiverCountry')?.value,
      receiverAddress:document.getElementById('receiverAddress')?.value,
      receiverWhatsapp:document.getElementById('receiverWhatsapp')?.value,
      transferAmount:parseFloat(document.getElementById('transferAmount')?.value||0),
      transferCurrency:document.getElementById('transferCurrency')?.value,
      transferCode:document.getElementById('transferCode')?.value,
      transferStatus:document.getElementById('transferStatus')?.value||'PENDING',
      transferExpiration:document.getElementById('transferExpiration')?.value
    };

    try{
      const response = await fetch('https://api.fondationbackupspirituel.com/api/transfert/validate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(transfertData)
      });
      const result = await response.json();

      if(!result.ok){
        messageEl.style.color='red';
        messageEl.textContent=result.message;
        return;
      }

      messageEl.style.color='green';
      messageEl.textContent='Transfert validé et en attente de retrait ✅';

      // Reset chan client
      [
        'senderName','senderCIN','senderCountry','senderAddress','senderWhatsapp',
        'receiverName','receiverCountry','receiverAddress','receiverWhatsapp',
        'transferAmount','transferCurrency'
      ].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.value='';
      });

      if(btnValider) btnValider.style.display='none';

    }catch(err){
      messageEl.style.color='red';
      messageEl.textContent='Erreur serveur lors de la validation.';
    }
  });
}
