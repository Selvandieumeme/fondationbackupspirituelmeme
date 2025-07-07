<?php
session_start();
if (!isset($_SESSION['connecte'])) {
    header('Location: login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - Activité des Ambassadeurs</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f6fa;
      padding: 20px;
    }
    h1 {
      color: #004080;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background: #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 10px;
      border: 1px solid #ccc;
      text-align: left;
    }
    th {
      background-color: #004080;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #eef3fb;
    }
    tr:hover {
      background-color: #dce6f7;
    }
    select, button {
      padding: 8px;
      margin: 10px 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background-color: #004080;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #003060;
    }
    .top-controls {
      margin-bottom: 15px;
    }
  </style>
</head>
<body>


<div style="text-align: right;">
  <a href="logout.php" style="color: #004080; font-weight: bold;">🚪 Déconnexion</a>
</div>

<h1>📊 Dashboard Ambassadeurs Digitaux</h1>

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
let allData = [];

fetch('get_logs.php')
  .then(res => res.json())
  .then(data => {
    allData = data;
    updateDropdowns(data);
    displayRows(data);
  });

function updateDropdowns(data) {
  const refSet = new Set();
  const ipSet = new Set();
  const pageSet = new Set();

  data.forEach(d => {
    refSet.add(d.nom);
    ipSet.add(d.ip);
    pageSet.add(d.page);
  });

  populateSelect('refFilter', [...refSet]);
  populateSelect('ipFilter', [...ipSet]);
  populateSelect('pageFilter', [...pageSet]);
}

function populateSelect(id, values) {
  const select = document.getElementById(id);
  values.sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function filtrer() {
  const ref = document.getElementById("refFilter").value.toLowerCase();
  const ip = document.getElementById("ipFilter").value.toLowerCase();
  const page = document.getElementById("pageFilter").value.toLowerCase();

  const filtered = allData.filter(d =>
    (ref === "" || d.nom.toLowerCase() === ref) &&
    (ip === "" || d.ip.toLowerCase() === ip) &&
    (page === "" || d.page.toLowerCase() === page)
  );

  displayRows(filtered);
}

function displayRows(data) {
  const tbody = document.querySelector("#amb-table tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.nom}</td>
      <td>${row.page}</td>
      <td>${row.ip}</td>
    `;
    tbody.appendChild(tr);
  });
}

function reinitialiserFiltres() {
  document.getElementById("refFilter").value = "";
  document.getElementById("ipFilter").value = "";
  document.getElementById("pageFilter").value = "";
  filtrer();
}

function telechargerCSV() {
  window.location.href = "amb_logs.csv";
}
</script>

</body>
</html>
