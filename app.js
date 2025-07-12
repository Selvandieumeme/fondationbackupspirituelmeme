document.getElementById("egliseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    pasteur: e.target.pasteur.value,
    legliz: e.target.legliz.value,
    mesaj: e.target.mesaj.value,
  };

  try {
    const res = await fetch("/api/eglises", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("✅ Fòm lan anrejistre avèk siksè!");
      e.target.reset();
    } else {
      alert("⚠️ Gen yon erè. Tanpri verifye enfòmasyon yo.");
    }
  } catch (err) {
    console.error("⚠️ Erè rezo:", err);
    alert("❌ Erè rezo.");
  }
});
