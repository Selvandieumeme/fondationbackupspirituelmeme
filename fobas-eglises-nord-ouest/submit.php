<?php
$dataFile = 'eglises_data.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newData = $_POST;
    $newData['timestamp'] = date('c');

    // Asire folder uploads la egziste
    if (!file_exists('uploads')) {
        mkdir('uploads', 0775, true);
    }

    // Upload photos
    $uploadedPhotos = [];
    if (!empty($_FILES['photos']['name'][0])) {
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpPath) {
            $fileName = basename($_FILES['photos']['name'][$index]);
            $target = 'uploads/' . $fileName;
            if (move_uploaded_file($tmpPath, $target)) {
                $uploadedPhotos[] = $fileName;
            }
        }
    }

    // Upload videos
    $uploadedVideos = [];
    if (!empty($_FILES['videos']['name'][0])) {
        foreach ($_FILES['videos']['tmp_name'] as $index => $tmpPath) {
            $fileName = basename($_FILES['videos']['name'][$index]);
            $target = 'uploads/' . $fileName;
            if (move_uploaded_file($tmpPath, $target)) {
                $uploadedVideos[] = $fileName;
            }
        }
    }

    $newData['photos'] = $uploadedPhotos;
    $newData['videos'] = $uploadedVideos;

    // Kreye fichye si li pa ekziste
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
    }

    // Chaje done ki te la deja
    $oldData = json_decode(file_get_contents($dataFile), true);

    // Ajoute nouvo done a nan tèt lis la
    array_unshift($oldData, $newData);

    // Sove li tounen
    file_put_contents($dataFile, json_encode($oldData, JSON_PRETTY_PRINT));

    echo "Success";
    exit;
}
?>
