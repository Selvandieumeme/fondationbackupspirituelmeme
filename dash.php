<?php
/* dash.php  –  Tableau de bord Ambassadeurs  */
$data = @file(__DIR__.'/amb_logs.csv', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$ambCount = []; $pageCount=[]; $today = date('Y-m-d');

foreach ($data as $row){
  [$dt,$amb,$pg,$ip] = explode(';', $row);
  $ambCount[$amb] = ($ambCount[$amb] ?? 0) +1;
  $pageCount[$pg] = ($pageCount[$pg] ?? 0) +1;
}
arsort($ambCount); arsort($pageCount);

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><title>DASH – Ambassadeurs</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#f5f7fa;margin:0;padding:20px;color:#333}
h2{color:#003366;margin-top:40px}
table{border-collapse:collapse;width:100%;background:#fff;margin-top:10px}
th,td{border:1px solid #ccc;padding:8px;text-align:left}
th{background:#003366;color:#fff}
tr:nth-child(even){background:#f0f4fa}
small{color:#666}
</style>
<script src="dash.js"></script>
</head><body>
<h1>Tableau de bord – Ambassadeurs (temps réel)</h1>
<p><small>Fichier : amb_logs.csv – MAJ auto 30 s</small></p>

<h2>Visites par Ambassadeur</h2>
<table>
<tr><th>Ambassadeur</th><th>Pages visitées</th></tr>
<?php foreach($ambCount as $a=>$n){echo "<tr><td>$a</td><td>$n</td></tr>";}?>
</table>

<h2>Pages les plus visitées</h2>
<table>
<tr><th>Page</th><th>Nb</th></tr>
<?php foreach($pageCount as $p=>$n){echo "<tr><td>$p</td><td>$n</td></tr>";}?>
</table>

<h2>Journal complet (<?php echo count($data)?> lignes)</h2>
<table>
<tr><th>Date/heure</th><th>Ambassadeur</th><th>Page</th><th>IP</th></tr>
<?php
foreach(array_reverse($data) as $row){
  echo '<tr><td>'.str_replace(';','</td><td>',$row).'</td></tr>';
}
?>
</table>
</body></html>
