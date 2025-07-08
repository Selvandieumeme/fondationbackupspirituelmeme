<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - Activité des Ambassadeurs</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f6fa;padding:20px}
    h1{color:#004080}
    table{border-collapse:collapse;width:100%;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.1)}
    th,td{padding:10px;border:1px solid #ccc;text-align:left}
    th{background:#004080;color:#fff}
    tr:nth-child(even){background:#eef3fb}
    tr:hover{background:#dce6f7}
    select,button{padding:8px;margin:10px 5px;border:1px solid #ccc;border-radius:4px}
    button{background:#004080;color:#fff;cursor:pointer}
    button:hover{background:#003060}
    .top-controls{margin-bottom:15px}
    /* Petits boutons liste ambassadeurs */
    #ambList a{padding:6px 10px;border:1px solid #004080;border-radius:4px;font-size:14px;
               color:#004080;text-decoration:none;margin:4px 4px;display:inline-block}
    #ambList a:hover{background:#004080;color:#fff}
  </style>
</head>
<body>

<h1>📊 Dashboard Ambassadeurs Digitaux</h1>

<!-- ░░ Liste cliquable des ambassadeurs (chargée dynamiquement) ░░ -->
<div id="ambList"></div>

<div class="top-controls">
  <label>🔍 Rechercher par nom:</label>
  <select id="refFilter" onchange="filtrer()">
    <option value="">-- Tous --</option>
  </select>

  <label>🔍 par IP:</label>
  <select id="ipFilter" onchange="filtrer()">
    <option value="">-- Toutes --</option>
  </select>

  <label>🔍 par page:</label>
  <select id="pageFilter" onchange="filtrer()">
    <option value="">-- Toutes --</option>
  </select>

  <button onclick="reinitialiserFiltres()">🔄 Réinitialiser filtres</button>
  <button onclick="telechargerCSV()">⬇️ Télécharger CSV</button>
</div>

<table id="amb-table">
  <thead>
    <tr>
      <th>Date/Heure</th>
      <th>Nom Ambassadeur</th>
      <th>Page Visité</th>
      <th>IP</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<script>
let allData=[];

/* ─ 1. Charge logs CSV → tableau & dropdowns */
fetch('get_logs.php')
  .then(r=>r.json())
  .then(data=>{
    allData=data;
    updateDropdowns(data);
    displayRows(data);

    /* Pré‑filtre auto si ?i=NomAmbassadeur dans l’URL */
    const p=new URLSearchParams(location.search);
    const auto=p.get('i');
    if(auto){
      document.getElementById('refFilter').value=decodeURIComponent(auto);
      filtrer();
    }
  });

/* ─ 2. Charge la liste officielle des ambassadeurs pour les boutons cliquables */
fetch('Nos-ambassadeurs.html')
 .then(r=>r.text())
 .then(html=>{
    const names=[...html.matchAll(/<td>\s*\d+\s*<\/td>\s*<td>(.*?)<\/td>/gi)]
                 .map(m=>m[1].trim())
                 .filter(Boolean)
                 .filter((v,i,a)=>a.indexOf(v)===i)           // unicité
                 .sort((a,b)=>a.localeCompare(b,'fr'));
    const zone=document.getElementById('ambList');
    names.forEach(n=>{
        const a=document.createElement('a');
        a.textContent=n; a.href="#";
        a.onclick=e=>{e.preventDefault();
                      document.getElementById('refFilter').value=n;
                      filtrer();};
        zone.appendChild(a);
    });
 });

/* ───────── Fonctions existantes (inchangées) ───────── */
function updateDropdowns(data){
  const refSet=new Set(),ipSet=new Set(),pageSet=new Set();
  data.forEach(d=>{refSet.add(d.nom);ipSet.add(d.ip);pageSet.add(d.page);});
  populateSelect('refFilter',[...refSet]);
  populateSelect('ipFilter',[...ipSet]);
  populateSelect('pageFilter',[...pageSet]);
}
function populateSelect(id,values){
  const sel=document.getElementById(id);
  sel.innerHTML='<option value="">-- Tous --</option>';
  values.sort().forEach(v=>{
    const opt=document.createElement('option');
    opt.value=v;opt.textContent=v;sel.appendChild(opt);
  });
}
function filtrer(){
  const ref=document.getElementById('refFilter').value.toLowerCase();
  const ip=document.getElementById('ipFilter').value.toLowerCase();
  const page=document.getElementById('pageFilter').value.toLowerCase();
  const filt=allData.filter(d=>
    (!ref||d.nom.toLowerCase()===ref)&&
    (!ip||d.ip.toLowerCase()===ip)&&
    (!page||d.page.toLowerCase()===page)
  );
  displayRows(filt);
}
function displayRows(data){
  const tbody=document.querySelector("#amb-table tbody");
  tbody.innerHTML="";
  data.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.date}</td><td>${r.nom}</td><td>${r.page}</td><td>${r.ip}</td>`;
    tbody.appendChild(tr);
  });
}
function reinitialiserFiltres(){
  document.getElementById('refFilter').value="";
  document.getElementById('ipFilter').value="";
  document.getElementById('pageFilter').value="";
  filtrer();
}
function telechargerCSV(){window.location.href="amb_logs.csv";}
</script>

</body>
</html>
