
// ---------- NAVIGATION ----------
document.querySelectorAll('.navbar button').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-section');

        // Kache tout seksyon
        document.querySelectorAll('.page-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Montre seksyon ki koresponn lan
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// ---------- FORMULAIRE CONTACT ----------
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault(); // anpeche reloading paj la

    const name    = this.name.value.trim();
    const email   = this.email.value.trim();
    const message = this.message.value.trim();

    // Verifikasyon rapid (ou ka elaji si ou vle)
    if (!name || !email || !message) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Similasyon de l’envoi – montre yon mesaj konfimasyon
    alert(`Merci ${name} ! Votre message a bien été reçu.\nNous vous répondrons rapidement à ${email}.`);

    // Reset fòm lan
    this.reset();
});