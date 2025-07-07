<?php
/* logger.php – enregistre : date; ref; page; ip + envoi d'une alerte email */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$page = $_POST['page'] ?? 'inconnu';
$ref  = $_POST['ref']  ?? 'inconnu';
$time = $_POST['t']    ?? time();
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

$line = date('Y-m-d H:i:s', $time / 1000) . ";" . $ref . ";" . $page . ";" . $ip . "\n";
file_put_contents(__DIR__ . '/amb_logs.csv', $line, FILE_APPEND | LOCK_EX);

// ✅ Envoi d'une alerte par email
$to = "fondationbackupspirituel@gmail.com";  // 📨 Chanje imel sa si w vle
$subject = "🚨 Nouvelle visite d'un ambassadeur";
$message = "🕒 Date/Heure : " . date('Y-m-d H:i:s', $time / 1000) . "\n"
         . "👤 Ambassadeur : $ref\n"
         . "📄 Page visité : $page\n"
         . "🌐 IP visiteur : $ip\n";
$headers = "From: alerte@fobasadmin.byethost4.com\r\n" .
           "Reply-To: no-reply@fobasadmin.byethost4.com\r\n" .
           "X-Mailer: PHP/" . phpversion();

// Tente voye imèl la
@mail($to, $subject, $message, $headers);

exit;
?>
