// 🌟 premium.js – Vèsyon final pou nouvo premium.html

// --- Sélection éléments ---
const premiumForm = document.getElementById('premiumForm');
const responseBox = document.getElementById('responseBox');
const paymentInfoBox = document.getElementById('paymentInfo');
const methodSelect = document.getElementById('method');
const userIdInput = document.getElementById('userId');
const recordIdInput = document.getElementById('recordId');

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

// --- Chanjman metòd peman ---
methodSelect.addEventListener('change', () => {
  const method = methodSelect.value.toLowerCase();
  const info = PAYMENT_DETAILS[method];
  if (info) {
    paymentInfoBox.innerText = `${info.title}\n\n${info.text}`;
  } else {
    paymentInfoBox.innerText = '';
  }
});

// --- Fonksyon pou afiche mesaj ---
function showResponse(msg, type) {
  responseBox.style.display = 'block';
  responseBox.textContent = msg;
  responseBox.className = 'response';
  if (type === 'success') responseBox.classList.add('success');
  else if (type === 'pending') responseBox.classList.add('pending');
  else if (type === 'error') responseBox.classList.add('error');
}

// --- Soumèt fòm Premium ---
premiumForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showResponse('', ''); // efase mesaj anvan

  // Ranmase done
  const formData = new FormData(premiumForm);
  const fullname = formData.get('fullname').trim();
  const email = formData.get('email').trim();
  const emailRecovery = formData.get('emailRecovery').trim();
  const phone = formData.get('phone').trim();
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');
  const method = formData.get('method');
  const amount = formData.get('amount');
  const txnId = formData.get('txnId') || null;
  const screenshot = formData.get('screenshot');

  // Validasyon debaz
  if (!fullname || !email || !emailRecovery || !phone || !password || !passwordConfirm || !method || !amount || !screenshot) {
    return showResponse('⚠️ Tanpri ranpli tout chan obligatwa yo.', 'error');
  }
  if (password !== passwordConfirm) {
    return showResponse('⚠️ Modpas yo pa matche.', 'error');
  }

  // Montre pending
  showResponse('⏳ Demann ou an ap trete...', 'pending');

  try {
    // Kreye FormData pou backend
    const backendData = new FormData();
    backendData.append('fullname', fullname);
    backendData.append('email', email);
    backendData.append('emailRecovery', emailRecovery);
    backendData.append('phone', phone);
    backendData.append('password', password);
    backendData.append('method', method);
    backendData.append('amount', amount);
    backendData.append('txnId', txnId);
    backendData.append('screenshot', screenshot);

    // ID itilizatè (optional, si ou gen login)
    if (userIdInput) backendData.append('userId', userIdInput.value);

    const res = await fetch('/api/premium/create', {
      method: 'POST',
      body: backendData
    });

    const data = await res.json();

    if (!res.ok) {
      return showResponse(data.error || '❌ Erè sou sèvè.', 'error');
    }

    // Mete record ID pou referans
    if (recordIdInput) recordIdInput.value = data.id || '';

    showResponse(`✅ Demann Premium kreye avèk siksè!\n🆔 ID: ${data.id}\n📌 Status: Pending`, 'success');

    // Netwaye fòm (optional)
    premiumForm.reset();
    paymentInfoBox.innerText = '';

  } catch (err) {
    showResponse('❌ Erè rezo: ' + err.message, 'error');
  }
});
