// premium-submit.js
// Independent frontend handler for premium.html form submission
// Sends multipart/form-data (fields + file) to /api/premium/register
// Shows clear green confirmation message on success.
//
// NOTE: backend (/api/premium/register) must accept multipart/form-data
// and already send mail to admin (nodemailer). This script only posts to backend.

(function () {
  const form = document.getElementById('premiumForm') || document.getElementById('paymentForm') || document.querySelector('form#premiumForm') || document.querySelector('form#paymentForm');
  const statusMessage = document.getElementById('statusMessage') || document.getElementById('responseBox');
  const confirmBtn = document.getElementById('confirmBtn') || form && form.querySelector('button[type="submit"]');

  if (!form) {
    console.warn('premium-submit.js: premium form not found on page.');
    return;
  }

  // Helper: show status
  function showStatus(text, type = 'info') {
    if (!statusMessage) {
      alert(text);
      return;
    }
    statusMessage.textContent = text;
    statusMessage.className = 'status-msg'; // keep base class
    if (type === 'success') {
      statusMessage.style.color = '#2ECC71';
      statusMessage.style.fontWeight = '700';
    } else if (type === 'error') {
      statusMessage.style.color = '#E74C3C';
      statusMessage.style.fontWeight = '700';
    } else if (type === 'pending') {
      statusMessage.style.color = '#f5c55a';
      statusMessage.style.fontWeight = '700';
    } else {
      statusMessage.style.color = '#222';
      statusMessage.style.fontWeight = '600';
    }
  }

  // Disable/enable controls during submit
  function setSubmitting(active) {
    if (confirmBtn) confirmBtn.disabled = active;
    // disable inputs
    Array.from(form.elements).forEach(el => {
      if (el.tagName !== 'BUTTON') el.disabled = active;
    });
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showStatus('', 'info');

    // Collect form data
    const fd = new FormData(form);

    // Basic client-side validation (ensure required fields present)
    const required = ['fullname','email','emailRecovery','password','passwordConfirm','method','amount'];
    // note: some forms may have different names, try common alternatives
    // We check presence loosely:
    const missing = [];
    required.forEach(name => {
      if (form.querySelector(`[name="${name}"]`) && !String(form.querySelector(`[name="${name}"]`).value).trim()) {
        missing.push(name);
      }
    });
    if (missing.length > 0) {
      showStatus('Tanpri ranpli tout chan obligatwa yo: ' + missing.join(', '), 'error');
      return;
    }

    // Password match check (if fields exist)
    const p = form.querySelector('[name="password"]');
    const pc = form.querySelector('[name="passwordConfirm"]');
    if (p && pc && p.value !== pc.value) {
      showStatus('Modpas yo pa matche. Tanpri verifye.', 'error');
      return;
    }

    // Ensure screenshot present when required
    const screenshotInput = form.querySelector('input[type="file"][name="screenshot"], input[type="file"]');
    if (screenshotInput && screenshotInput.required && (!screenshotInput.files || screenshotInput.files.length === 0)) {
      showStatus('Tanpri telechaje screenshot peman ou an.', 'error');
      return;
    }

    // Start submit
    setSubmitting(true);
    showStatus('⏳ Ap voye demann nan — tanpri rete sou paj la...', 'pending');

    try {
      const res = await fetch('/api/premium/register', {
        method: 'POST',
        body: fd
      });

      const resJson = await res.json().catch(() => null);

      if (!res.ok) {
        const errMsg = (resJson && (resJson.error || resJson.message)) || `Erè sèvè: ${res.status}`;
        showStatus(errMsg, 'error');
        setSubmitting(false);
        return;
      }

      // Success path: show green confirmation and instructions
      showStatus('✅ Merci — fom premium ou an ale avèk siksè ak screenshot peman. W ap resevwa yon mesaj konfimasyon sou email ou nan 24-48 èdtan.', 'success');

      // Optionally reset form inputs but keep fields if you want:
      try {
        // keep certain fields but clear sensitive
        if (form.querySelector('[name="password"]')) form.querySelector('[name="password"]').value = '';
        if (form.querySelector('[name="passwordConfirm"]')) form.querySelector('[name="passwordConfirm"]').value = '';
        if (screenshotInput) screenshotInput.value = '';
        // set record id if returned (for user's record)
        if (resJson && resJson.id) {
          const rid = form.querySelector('#recordId') || document.getElementById('recordId');
          if (rid) rid.value = resJson.id;
        }
      } catch (e) { /* swallow */ }

      // Optionally: send a backup copy via FormSubmit (commented out by default)
      /*
      try {
        // If you want to also send the form content to formsubmit.co as a backup,
        // uncomment and replace the email endpoint if needed.
        const fsForm = new FormData();
        fsForm.append('fullname', form.querySelector('[name="fullname"]').value || '');
        fsForm.append('email', form.querySelector('[name="email"]').value || '');
        fsForm.append('method', form.querySelector('[name="method"]').value || '');
        fsForm.append('txnId', form.querySelector('[name="txnId"]').value || '');
        fsForm.append('message', 'Backup copy from premium form');
        // Note: formsubmit requires a form-specific action url like: https://formsubmit.co/YOUR_EMAIL
        await fetch('https://formsubmit.co/ajax/infos@fondationbackupspirituel.com', {
          method: 'POST',
          body: fsForm
        });
      } catch (e) {
        console.warn('FormSubmit backup failed', e);
      }
      */

      // leave the success message visible; re-enable controls after small delay so user can read
      setTimeout(() => setSubmitting(false), 800);
    } catch (err) {
      console.error('premium submit error', err);
      showStatus('Erè rezo lè w ap voye demann nan: ' + (err.message || err), 'error');
      setSubmitting(false);
    }
  });
})();
