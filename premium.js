// premium.js
// Frontend pou premium.html — konekte ak /api endpoints (pa itilize localStorage)

// Chwazi eleman
const paymentButtons = document.querySelectorAll('.pay-btn');
const paymentForm = document.getElementById('paymentForm');
const paymentInfo = document.getElementById('paymentInfo');
const responseBox = document.getElementById('responseBox');
const submitTxnForm = document.getElementById('submitTxnForm');
const submitTxnBtn = document.getElementById('submitTxnBtn');

// Kontni fiks pou MonCash/NatCash/Western
const PAYMENT_DETAILS = {
  moncash: {
    title: 'MonCash (Vodafone/Digicel)',
    text: 'MonCash - MEME Selvandieu — Nimewo: +509 46057952\nApre ou fè peman, antre ID tranzaksyon oubyen voye resi bay admin.'
  },
  natcash: {
    title: 'NatCash (Natcom)',
    text: 'NatCash - MEME Selvandieu — Nimewo: +509 41306268\nApre ou fè peman, antre ID tranzaksyon oubyen voye resi bay admin.'
  },
  western: {
    title: 'Western Union',
    text: 'Western Union - Benefisyè: MEME Selvandieu\nRemake: Mandew ajoute vil + non moun ki voye lajan an kòm ref.'
  },
  paypal: {
    title: 'PayPal',
    text: 'PayPal instructions: You will be redirected to PayPal checkout.'
  },
  card: {
    title: 'Kat Kredi/Debit',
    text: 'Kart chechout: (integ. stripe/similar required)'
  },
  zelle: {
    title: 'Zelle',
    text: 'Zelle instructions - contact admin for details.'
  }
};

let selectedMethod = '';

// Metòd: lè itilizatè chwazi bouton
paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedMethod = btn.dataset.method;
    const info = PAYMENT_DETAILS[selectedMethod];
    paymentInfo.innerText = info ? `${info.title}\n\n${info.text}` : '';
    document.getElementById('method').value = selectedMethod;
  });
});

// Soumèt kreye record
paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  responseBox.style.display = 'none';
  const userId = document.getElementById('userId').value.trim();
  const email = document.getElementById('email').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const method = document.getElementById('method').value;
  const txn = document.getElementById('transactionId').value.trim();

  if (!userId || !email || !amount || !method) {
    showResponse('Tanpri ranpli tout chan obligatwa yo.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/premium/create', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId, email, method, amount, txnId: txn || null })
    });
    const data = await res.json();
    if (!res.ok) {
      showResponse(data.error || 'Erè sou sèvè', 'error');
      return;
    }

    // si ok: resevwa record id, montre li itilizatè a
    document.getElementById('recordId').value = data.id || '';
    showResponse(`✅ Demand peman kreye. Record ID: ${data.id}. Si w fè peman, soumèt ID tranzaksyon an anba seksyon "Soumèt ID Tranzaksyon". Status: ${data.status}`, 'pending');
  } catch (err) {
    showResponse('Erè rezo: ' + (err.message || err), 'error');
  }
});

// Soumèt txn (user) pou verify
submitTxnBtn.addEventListener('click', async () => {
  const id = document.getElementById('submitRecordId').value.trim();
  const txn = document.getElementById('submitTxnId').value.trim();
  if (!id || !txn) {
    showResponse('Tanpri bay Record ID ak ID tranzaksyon an.', 'error');
    return;
  }
  try {
    const res = await fetch('/api/premium/submit-txn', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id, txnId: txn })
    });
    const data = await res.json();
    if (!res.ok) return showResponse(data.error || 'Erè sou sèvè', 'error');
    showResponse(`✅ Tranzaksyon soumèt pou verifikasyon. Record ${id} mete ajou. Lè admin konfime li, w ap gen aksè.`, 'pending');
  } catch (err) {
    showResponse('Erè rezo: ' + err.message, 'error');
  }
});

// Helper UI
function showResponse(msg, type) {
  responseBox.style.display = 'block';
  responseBox.textContent = msg;
  responseBox.className = 'response';
  if (type === 'success') responseBox.classList.add('success');
  else if (type === 'pending') responseBox.classList.add('pending');
  else responseBox.classList.add('error');
}
