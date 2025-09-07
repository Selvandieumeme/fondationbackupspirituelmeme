
<?php
// --- SCRIPT: Allow Googlebot & Bingbot ---
// Script endepandan, pa afekte lòt kòd sou sit la

function isAllowedBot($userAgent, $ip) {
    // Lis bot yo ak domèn yo
    $allowedBots = [
        'Googlebot' => 'googlebot.com',
        'Bingbot'   => 'bing.com',
    ];

    foreach ($allowedBots as $bot => $hostSuffix) {
        if (stripos($userAgent, $bot) !== false) {
            // Verifye si IP a soti nan domèn ofisyèl Google/Bing
            $hostname = gethostbyaddr($ip);
            if ($hostname && substr($hostname, -strlen($hostSuffix)) === $hostSuffix) {
                return true; // Se vre bot
            }
        }
    }
    return false; // Pa Google/Bing vre
}

// --- Ranmase done vizitè a ---
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$ip        = $_SERVER['REMOTE_ADDR'] ?? '';

// --- Si se yon bot pèmèt ---
if (isAllowedBot($userAgent, $ip)) {
    // Pa janm bloke Googlebot/Bingbot
    header("X-Robots-Tag: all");
    // Ou ka log si ou vle:
    // error_log("Allowed bot: $userAgent from $ip");
}
?>
