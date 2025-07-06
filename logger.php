<?php
/* logger.php  – enregistre : date, ambassadeur, page  */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$page = $_POST['page'] ?? 'inconnu';
$ref  = $_POST['ref']  ?? 'inconnu';
$time = $_POST['t']    ?? time();

$line = date('Y-m-d H:i:s',$time/1000).";".$ref.";".$page."\n";
file_put_contents(__DIR__.'/amb_logs.csv', $line, FILE_APPEND | LOCK_EX);
exit;          // 204 No Content
?>
