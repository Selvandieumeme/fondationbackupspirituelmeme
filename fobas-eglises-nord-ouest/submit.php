<?php
$dataFile = 'eglises_data.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newData = $_POST;
    $newData['timestamp'] = date('c');

    // Upload photos
    $uploadedPhotos = [];
    if (!empty($_FILES['photos']['name'][0])) {
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpPath) {
            $fileName = basename($_FILES['photos']['name'][$index]);
            $target = 'uploads/' . $fileName;
            move_uploaded_file($tmpPath, $target);
            $uploadedPhotos[] = $fileName;
        }
    }

    // Upload videos
    $uploadedVideos = [];
    if (!empty($_FILES['videos']['name'][0])) {
        foreach ($_FILES['videos']['tmp_name'] as $index => $tmpPath) {
            $fileName = basename($_FILES['videos']['name'][$index]);
            $target = 'uploads/' . $fileName;
            move_uploaded_file($tmpPath, $target);
            $uploadedVideos[] = $fileName;
        }
    }

    $newData['photos'] = $uploadedPhotos;
    $newData['videos'] = $uploadedVideos;

    // Load existing data
    $oldData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

    // Add new data to the beginning
    array_unshift($oldData, $newData);

    // Save all data back
    file_put_contents($dataFile, json_encode($oldData, JSON_PRETTY_PRINT));

    echo "Success";
}
?>
✅ 2. 
