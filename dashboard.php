<?php 
// dashboard.php – Affiche les données depuis amb_logs.csv
$csvFile = __DIR__ . '/amb_logs.csv';
$lines   = file_exists($csvFile)
         ? array_reverse(file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES))
         : [];

/* ░░─  Récupération automatique des noms d’ambassadeurs  ─░░ */
$ambFile   = __DIR__ . '/Nos-ambassadeurs.html';
$ambNames  = [];

if (file_exists($ambFile)) {
    $html = file_get_contents($ambFile);
    // Matche la 2e cellule <td> de chaque ligne <tr> (Nom & Prénom)
    if (preg_match_all('/<td>\s*\d+\s*<\/td>\s*<td>(.*?)<\/td>/i', $html, $m)) {
        $ambNames = array_unique(array_map('trim', $m[1]));
        sort($ambNames, SORT_LOCALE_STRING);
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Dashboard - Activité des Ambassadeurs</title>
<style>
 body{font-family:Arial,Helvetica,sans-serif;background:#f4f6fa;padding:20px}
 h1{color:#004080}
 table{border-collapse:collapse;width:100%;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.1)}
 th,td{padding:10px;border:1px solid #ccc;text-align:left}
 th{background:#004080;color:#fff}
 tr:nth-child(even){background:#eef3fb}
 tr:hover{background:#dce6f7}
 input,select{padding:8px;margin:10px 5px;width:200px;border:1px solid #ccc;border-radius:4px}
</style>
<script>
function filtrerTableau(){
  const ref  = document.getElementById("refFilter").value.toLowerCase();
  const ip   = document.getElementById("ipFilter").value.toLowerCase();
  const page = document.getElementById("pageFilter").value.toLowerCase();
  const rows = document.querySelectorAll("#amb-table tbody tr");
  rows.forEach(row=>{
     const r = row.cells[1].textContent.toLowerCase(),
           p = row.cells[2].textContent.toLowerCase(),
           i = row.cells[3].textContent.toLowerCase();
     row.style.display = (r.includes(ref) && i.includes(ip) && p.includes(page)) ? "" : "none";
  });
}
</script>
</head>
<body>
<h1>📊 Dashboard Ambassadeurs Digitaux</h1>

<label>🔍 Rechercher par nom :</label>
<input list="ambList" id="refFilter" oninput="filtrerTableau()" placeholder="Choisissez ou tapez…">
<datalist id="ambList">
  <?php foreach($ambNames as $n): ?>
    <option value="<?= htmlspecialchars($n) ?>">
  <?php endforeach; ?>
</datalist>

<label>🔍 par IP :</label>
<input type="text" id="ipFilter"  oninput="filtrerTableau()" placeholder="Ex : 192.168.0.1">
<label>🔍 par page :</label>
<input type="text" id="pageFilter" oninput="filtrerTableau()" placeholder="Ex : accueil">

<table id="amb-table">
 <thead>
   <tr><th>Date/Heure</th><th>Nom Ambassadeur</th><th>Page Visité</th><th>IP</th></tr>
 </thead>
 <tbody>
 <?php foreach ($lines as $line):
        $parts = explode(";", $line);
        if (count($parts)!==4) continue;
        [$date,$ref,$page,$ip]=$parts; ?>
   <tr>
     <td><?= htmlspecialchars($date) ?></td>
     <td><?= htmlspecialchars($ref) ?></td>
     <td><?= htmlspecialchars($page) ?></td>
     <td><?= htmlspecialchars($ip) ?></td>
   </tr>
 <?php endforeach; ?>
 </tbody>
</table>
</body>
</html>
