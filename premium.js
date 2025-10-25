// 🌟 premium.js - Version final, konpatib ak premium.html + API Render/MongoDB

// --- Sélection éléments ---
const paymentButtons = document.querySelectorAll('.pay-btn');
const paymentInfoBox = document.getElementById('paymentInfo');  // kote enfòmasyon parèt
const paymentForm = document.getElementById('paymentForm');     // 1er fòm: kreye demann Premium
const responseBox = document.getElementById('responseBox');     // Mesaj repons
const submitTxnBtn = document.getElementById('submitTxnBtn');   // Bouton soumèt ID tranzaksyon

let selectedMethod = "";

// --- Tout enfòmasyon pou chak metòd peman ---
const PAYMENT_DETAILS = {
  moncash: {
    title: 'MonCash (Digicel)',
    text: 'Benefisyè : MEME Selvandieu\nNimewo : +509 46057952\nApre ou fin peye, antre ID tranzaksyon oswa upload resi.'
  },
  natcash: {
    title: 'NatCash (Natcom)',
    text: 'Benefisyè : MEME Selvandieu\nNimewo : +509 41306268\nApre ou fin peye, antre ID tranzaksyon oswa voye resi bay admin.'
  },
  western: {
    title: 'Western Union',
    text: 'Benefisyè : MEME Selvandieu\nRemake : Mete vil + non moun ki voye lajan kòm referans.'
  },
  paypal: {
    title: 'PayPal',
    text: 'Ou pral redireksyone sou PayPal pou fini tranzaksyon an.'
  },
  card: {
    title: 'Kat Bancaire',
    text: 'Pou kat kredi/debit: Stripe oswa lòt sistèm obligatwa.'
  },
  zelle: {
    title: 'Zelle',
    text: 'Kontakte admin pou detay Zelle si disponib.'
  }
};

// --- Klik sou yon bouton metòd peman ---
paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedMethod = btn.dataset.method;
    const info = PAYMENT_DETAILS[selectedMethod];

    // Mete tèks enfòmasyon yo
    if (info) {
      paymentInfoBox.innerText = `${info.title}\n\n${info.text}`;
    } else {
      paymentInfoBox.innerText = '';
    }

    // Mete mòd la nan input hidden
    const methodInput = document.getElementById('method');
    if (methodInput) methodInput.value = selectedMethod;
  });
});

// --- Soumèt premye fòm lan: Kreye demann premium ---
paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showResponse("", ""); // efase mesaj anvan

  // Ranmase done yo
  const userId = document.getElementById('userId').value.trim();
  const email = document.getElementById('email').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const method = document.getElementById('method').value;
  const txn = document.getElementById('transactionId').value.trim();

  if (!userId || !email || !amount || !method) {
    return showResponse("⚠️ Tanpri ranpli tout chan obligatwa yo.", "error");
  }

  try {
    const res = await fetch('/api/premium/create', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ userId, email, method, amount, txnId: txn || null })
    });
    const data = await res.json();

    if (!res.ok) {
      return showResponse(data.error || "❌ Erè sou sèvè.", "error");
    }

    // Mete record ID la pou 2èm fòm lan
    document.getElementById('recordId').value = data.id || "";
    return showResponse(`✅ Demann Premium kreye.\n🆔 ID: ${data.id}\n📌 Status: ${data.status}`, "pending");

  } catch (err) {
    showResponse("❌ Erè rezo: " + err.message, "error");
  }
});

// --- 2èm fòm: Soumèt ID tranzaksyon ---
submitTxnBtn.addEventListener('click', async () => {
  const recordId = document.getElementById('submitRecordId').value.trim();
  const txnId = document.getElementById('submitTxnId').value.trim();

  if (!recordId || !txnId) {
    return showResponse("⚠️ Tanpri antre Record ID + ID tranzaksyon.", "error");
  }

  try {
    const res = await fetch('/api/premium/submit-txn', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id: recordId, txnId })
    });
    const data = await res.json();

    if (!res.ok) {
      return showResponse(data.error || "❌ Erè sou sèvè.", "error");
    }

    showResponse(`✅ ID tranzaksyon soumèt.\n⏳ Admin ap verifye li...`, "pending");
  } catch (err) {
    showResponse("❌ Erè rezo: " + err.message, "error");
  }
});

// --- Fonksyon pou Afiche mesaj ti bwat repons lan ---
function showResponse(msg, type) {
  responseBox.style.display = "block";
  responseBox.textContent = msg;
  responseBox.className = "response";

  if (type === "success") responseBox.classList.add("success");
  else if (type === "pending") responseBox.classList.add("pending");
  else if (type === "error") responseBox.classList.add("error");
}
