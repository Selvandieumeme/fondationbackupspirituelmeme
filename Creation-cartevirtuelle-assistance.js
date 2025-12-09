document.addEventListener('DOMContentLoaded', () => {
const form = document.getElementById('cardForm');
const errorMsg = document.getElementById('errorMsg');


form.addEventListener('submit', (e) => {
e.preventDefault();
errorMsg.textContent = '';


const fullName = form.fullName.value.trim();
const email = form.email.value.trim();
const country = form.country.value.trim();
const amount = form.amount.value.trim();
const purpose = form.purpose.value.trim();
const serviceType = form.serviceType.value;
const acceptTerms = form.acceptTerms.checked;


if (!fullName) { errorMsg.textContent = 'Nom complet requis.'; return; }
if (!email) { errorMsg.textContent = 'Email requis.'; return; }
if (!country) { errorMsg.textContent = 'Pays requis.'; return; }
if (!amount || isNaN(amount) || Number(amount) <= 0) { errorMsg.textContent = 'Montant valide requis.'; return; }
if (!acceptTerms) { errorMsg.textContent = 'Ou dwe aksepte kondisyon yo anvan ou kontinye.'; return; }


const phone = '50946057952';
const lines = [];
lines.push(`Nouvo demann soti nan site: ${window.location.hostname}`);
lines.push('---');
lines.push(`Sèvis: ${serviceType === 'virtual' ? 'Demande carte virtuelle' : 'Achat assisté / Service d'achat'}`);
lines.push(`Non: ${fullName}`);
lines.push(`Email: ${email}`);
lines.push(`Peyi: ${country}`);
lines.push(`Montant/oswa valè estimé: ${amount}`);
if (purpose) lines.push(`Objè demann: ${purpose}`);
lines.push('Mwen dakò ak kondisyon yo: Wi');


const text = encodeURIComponent(lines.join('\n'));
const waUrl = `https://wa.me/${phone}?text=${text}`;


window.open(waUrl, '_blank');
});
});
