<?php
$dataFile = 'eglises_data.json';

// Asire dosye uploads egziste
if (!is_dir('uploads')) {
    mkdir('uploads', 0775, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newData = $_POST;
    $newData['timestamp'] = date('c');

    // Upload photos
    $uploadedPhotos = [];
    if (!empty($_FILES['photos']['name'][0])) {
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpPath) {
            if ($_FILES['photos']['error'][$index] === UPLOAD_ERR_OK) {
                $extension = pathinfo($_FILES['photos']['name'][$index], PATHINFO_EXTENSION);
                $uniqueName = time() . '_' . uniqid() . '.' . $extension;
                $target = 'uploads/' . $uniqueName;
                if (move_uploaded_file($tmpPath, $target)) {
                    $uploadedPhotos[] = $uniqueName;
                }
            }
        }
    }

    // Upload videos
    $uploadedVideos = [];
    if (!empty($_FILES['videos']['name'][0])) {
        foreach ($_FILES['videos']['tmp_name'] as $index => $tmpPath) {
            if ($_FILES['videos']['error'][$index] === UPLOAD_ERR_OK) {
                $extension = pathinfo($_FILES['videos']['name'][$index], PATHINFO_EXTENSION);
                $uniqueName = time() . '_' . uniqid() . '.' . $extension;
                $target = 'uploads/' . $uniqueName;
                if (move_uploaded_file($tmpPath, $target)) {
                    $uploadedVideos[] = $uniqueName;
                }
            }
        }
    }

    $newData['photos'] = $uploadedPhotos;
    $newData['videos'] = $uploadedVideos;

    // Chaje done ki deja la
    $oldData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
    if (!is_array($oldData)) {
        $oldData = [];
    }

    // Mete nouvo done a anwo lis la
    array_unshift($oldData, $newData);

    // Rekri dosye a
    file_put_contents($dataFile, json_encode($oldData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Retounen repons pou JavaScript
    echo "✅ Fòm lan voye avèk siksè!";
}
?>
