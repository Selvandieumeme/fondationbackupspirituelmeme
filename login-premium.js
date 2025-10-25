// login-premium.js

const premiumLoginForm = document.getElementById('premiumLoginForm');
const recoverForm = document.getElementById('recoverForm');
const statusMessage = document.getElementById('statusMessage');

// Login Premium
premiumLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusMessage.textContent = '';
  
  const email = premiumLoginForm.email.value.trim();
  const password = premiumLoginForm.password.value.trim();

  if (!email || !password) {
    statusMessage.textContent = 'Tanpri ranpli tout chan yo.';
    return;
  }

  try {
    const res = await fetch('/api/premium/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      statusMessage.textContent = data.error || 'Erè sou sèvè';
      return;
    }

    // Save token optionally
    localStorage.setItem('premiumToken', data.token);

    // Redirect to ChatPrive
    window.location.href = 'Chatprive.html';

  } catch (err) {
    statusMessage.textContent = 'Erè rezo: ' + (err.message || err);
  }
});

// Recover Password via 2em email
recoverForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusMessage.textContent = '';

  const emailRecovery = recoverForm.emailRecovery.value.trim();
  if (!emailRecovery) {
    statusMessage.textContent = 'Antre dezyèm email pou rekiperasyon.';
    return;
  }

  try {
    const res = await fetch('/api/premium/recover-password', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ emailRecovery })
    });
    const data = await res.json();
    if (!res.ok) {
      statusMessage.textContent = data.error || 'Erè sou sèvè';
      return;
    }
    statusMessage.style.color = '#2ECC71';
    statusMessage.textContent = '✅ Nouvo modpas voye sou email rekiperasyon ou.';
  } catch (err) {
    statusMessage.textContent = 'Erè rezo: ' + err.message;
  }
});
