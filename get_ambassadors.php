<?php
// get_ambassadors.php
$html = file_get_contents("Nos-Ambassadeurs.html");

// Regex pou rale non yo ki nan <li> oswa <div class="ambassadeur-name">, modifye dapre estrikti ou
preg_match_all('/<h3[^>]*>(.*?)<\/h3>/i', $html, $matches);
$ambassadeurs = array_unique(array_map('trim', $matches[1]));

header('Content-Type: application/json');
echo json_encode($ambassadeurs);
exit;
?>
