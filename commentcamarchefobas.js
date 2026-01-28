const fobasPoints = [

/* 1–10 : Fondasyon & Konfyans */
["🌍 Poukisa FOBAS ?", "FOBAS se yon solisyon finansye dijital ki fèt pou reyalite Ayiti."],
["🇭🇹 Fèt pou Ayiti", "Platfòm nan adapte ak kondisyon lokal, san obligasyon bank."],
["🔐 Sekirite total", "Tout tranzaksyon pwoteje ak sistèm modèn chifreman."],
["📱 Aksesib tout kote", "Fonksyone sou telefòn, tablèt ak òdinatè."],
["💡 Senp & entelijan", "Pa bezwen konpetans teknik pou itilize."],
["🤝 Toupre popilasyon an", "Ajan lokal yo bay sipò dirèk."],
["⚖️ Transparans", "Tout mouvman parèt klè sou dashboard ou."],
["🧾 Istorik detaye", "Ou ka verifye tout tranzaksyon ou yo."],
["🚀 Vitès ekzekisyon", "Operasyon fèt an segonn."],
["🛡️ Pwoteksyon kont fwod", "Sistèm deteksyon aktivite sispèk entegre."],

/* 11–20 : Kont & Itilizasyon */
["👤 Kont pèsonèl", "Chak itilizatè gen yon espas finansye sekrè."],
["🔑 Modpas sekrè", "Ou se sèl moun ki gen aksè a kont ou."],
["📩 Verifikasyon", "Kòd sekirite asire idantite itilizatè a."],
["💰 Balance an tan reyèl", "Lajan ou toujou ajou."],
["➕ Dépôt", "Mete lajan cash via ajan otorize."],
["➖ Retrait", "Retire lajan ou san konplikasyon."],
["🔄 Transfert", "Voye lajan bay lòt itilizatè FOBAS."],
["🎁 Bonus", "Gagne rekonpans sou aktivite ou."],
["📊 Kontwòl total", "Ou jere tout operasyon ou."],
["🧠 Edikasyon itilizatè", "Platfòm nan fèt pou edike itilizatè yo."],

/* 21–30 : Ajan & Rezo */
["🏪 Ajan FOBAS", "Pwen sèvis lokal ki verifye."],
["🧾 Ajan idantifye", "Chak ajan gen idantite ofisyèl."],
["📍 Disponibilite", "Ajan yo prezan nan plizyè depatman."],
["🤝 Relasyon dirèk", "Ou kominike dirèkteman ak ajan."],
["📈 Opòtinite biznis", "Vin ajan FOBAS se sous revni."],
["🛠️ Sipò ajan", "Ajan resevwa asistans teknik."],
["📋 Règleman klè", "Tout ajan suiv pwotokòl strik."],
["🚫 Anti-manipilasyon", "Sistèm bloke move pratik."],
["🔍 Suivi ajan", "Aktivite ajan yo kontwole."],
["🏆 Ajan performan", "Ajan serye resevwa avantaj."],

/* 31–40 : Avni & Teknoloji */
["🌐 Dijitalizasyon", "FOBAS konekte Ayiti ak mond dijital la."],
["⚙️ Teknoloji modèn", "Sistèm toujou ajou."],
["📡 Disponibilite 24/7", "Platfòm la fonksyone tout tan."],
["🧩 Evolutif", "Nou ajoute nouvo fonksyon regilyèman."],
["📢 Kominikasyon klè", "Tout mizajou anonse."],
["🧠 Entèlijans sistèm", "Algoritm optimize eksperyans itilizatè."],
["📜 Konfòmite", "Règleman respekte."],
["🤍 Konfyans", "Bati sou kredibilite & disiplin."],
["🚀 Avni finans Ayiti", "Nou konstwi solisyon dirab."],
["✅ Angajman total", "FOBAS la pou pèp la."]

];

const container = document.getElementById("fobasContent");

fobasPoints.forEach(point=>{
  const div = document.createElement("div");
  div.className="fobas-card";
  div.innerHTML = `<h3>${point[0]}</h3><p>${point[1]}</p>`;
  container.appendChild(div);
});
