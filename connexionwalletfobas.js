document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!email || !password) {
        errorMsg.textContent = "Tanpri ranpli tout chan yo!";
        return;
    }

    try {
        const res = await fetch("https://examen-backend-ihlx.onrender.com/api/wallet/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            // Mete enfòmasyon itilizate nan localStorage pou dashboard
            localStorage.setItem("userEmail", data.data.email);
            localStorage.setItem("userName", data.data.fullName);
            // Ou ka ajoute token JWT si backend voye li
            if(data.token) localStorage.setItem("authToken", data.token);

            // Redireksyon sou dashboard
            window.location.href = "dashboard.html";
        } else {
            errorMsg.textContent = data.message;
        }
    } catch (err) {
        console.error(err);
        errorMsg.textContent = "Erreur serveur, tanpri eseye ankò.";
    }
});
