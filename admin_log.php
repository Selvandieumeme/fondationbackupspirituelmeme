<?php  // admin_log.php – vue simple (protégez par .htaccess si besoin)
$rows = @file(__DIR__.'/amb_logs.csv', FILE_IGNORE_NEW_LINES);
echo "<h2>Logs Ambassadeurs</h2><table border=1 cellpadding=6>";
echo "<tr><th>Date &amp; heure</th><th>Ambassadeur</th><th>Page visitée</th></tr>";
if($rows) foreach(array_reverse($rows) as $r){
  [$d,$who,$pg] = explode(';',$r);
  echo "<tr><td>$d</td><td>$who</td><td>$pg</td></tr>";
}
echo "</table>";
?>
