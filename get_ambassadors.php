<?php
header('Content-Type: application/json');

// Chemen fichye anbasadè yo
$ambFile = __DIR__ . '/Nos-ambassadeurs.html';
$ambNames = [];

if (file_exists($ambFile)) {
    $html = file_get_contents($ambFile);

    // Rechèch non yo nan <td> ki vini apre nimewo anbasadè a
    if (preg_match_all('/<td>\s*\d+\s*<\/td>\s*<td>(.*?)<\/td>/i', $html, $matches)) {
        $ambNames = array_unique(array_map('trim', $matches[1]));
        sort($ambNames, SORT_LOCALE_STRING);
    }
}

// Retounen lis anbasadè yo an JSON
echo json_encode($ambNames, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit;
?>
