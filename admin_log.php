<?php
$rows = @file(__DIR__.'/amb_logs.csv', FILE_IGNORE_NEW_LINES);
echo "<h2>Logs Ambassadeurs (page, IP)</h2><table border=1 cellpadding=6>";
echo "<tr><th>Date/Heure</th><th>Ambassadeur</th><th>Page</th><th>IP</th></tr>";
if ($rows){
  foreach(array_reverse($rows) as $r){
    [$d,$who,$pg,$ip] = explode(';',$r);
    echo "<tr><td>$d</td><td>$who</td><td>$pg</td><td>$ip</td></tr>";
  }
}
echo "</table>";
?>
