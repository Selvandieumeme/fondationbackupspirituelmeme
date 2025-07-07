<?php
header('Content-Type: application/json');

$csvFile = __DIR__ . '/amb_logs.csv';
$data = [];

if (file_exists($csvFile)) {
    $lines = array_reverse(file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
    foreach ($lines as $line) {
        $parts = explode(";", $line);
        if (count($parts) === 4) {
            $data[] = [
                "date" => trim($parts[0]),
                "nom" => trim($parts[1]),
                "page" => trim($parts[2]),
                "ip" => trim($parts[3]),
            ];
        }
    }
}

echo json_encode($data);
