(function(){
// Elements
const form = document.getElementById('registerForm');
const email = document.getElementById('email');
const recovery = document.getElementById('recoveryEmail');
const password = document.getElementById('password');
const confirm = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');
const pwMeterBar = document.getElementById('pwMeterBar');
const pwScore = document.getElementById('pwScore');
const togglePwd = document.getElementById('togglePwd');


// validators
function isValidEmail(v){
try { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); } catch(e){ return false; }
}


function updateSubmitState(){
const ready = isValidEmail(email.value) && isValidEmail(recovery.value)
&& password.value.length >= 12 && password.value === confirm.value
&& document.getElementById('terms').checked;
submitBtn.disabled = !ready;
}


togglePwd.addEventListener('click', ()=>{
const t = password.type === 'password' ? 'text' : 'password';
password.type = t;
togglePwd.textContent = t === 'password' ? 'Montrer' : 'Cacher';
});


function scorePassword(pw){
if(window.zxcvbn){
try{ return zxcvbn(pw).score; } catch(e){ return 0; }
}
let score = 0;
if(pw.length >= 12) score++;
if(/[A-Z]/.test(pw)) score++;
if(/[0-9]/.test(pw)) score++;
if(/[^A-Za-z0-9]/.test(pw)) score++;
return Math.min(score,4);
}


function renderPwMeter(){
const s = scorePassword(password.value);
pwScore.textContent = `${s}/4`;
const pct = (s/4)*100;
pwMeterBar.style.width = pct + '%';
}


[email,recovery,password,confirm].forEach(el=>el.addEventListener('input', ()=>{
document.getElementById(el.id+'Error')?.classList.add('hidden');
renderPwMeter();
updateSubmitState();
}));


document.getElementById('terms').addEventListener('change', updateSubmitState);


confirm.addEventListener('input', ()=>{
const err = document.getElementById('confirmError');
if(confirm.value && confirm.value !== password.value){
err.textContent = 'Les mots de passe ne correspondent pas.'; err.classList.remove('hidden');
} else { err.classList.add('hidden'); }
updateSubmitState();
