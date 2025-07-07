<?php 
// dashboard.php – Affiche les données depuis amb_logs.csv
$csvFile = __DIR__ . '/amb_logs.csv';
$lines = [];

if (file_exists($csvFile)) {
    $lines = array_reverse(file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Activité des Ambassadeurs</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f6fa;
            padding: 20px;
        }
        h1 {
            color: #004080;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 10px;
            border: 1px solid #ccc;
            text-align: left;
        }
        th {
            background-color: #004080;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #eef3fb;
        }
        tr:hover {
            background-color: #dce6f7;
        }
        input[type="text"] {
            padding: 8px;
            margin: 10px 5px;
            width: 200px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
    </style>
    <script>
        function filtrerTableau() {
            const refFilter = document.getElementById("refFilter").value.toLowerCase();
            const ipFilter = document.getElementById("ipFilter").value.toLowerCase();
            const pageFilter = document.getElementById("pageFilter").value.toLowerCase();
            const rows = document.querySelectorAll("#amb-table tbody tr");

            rows.forEach(row => {
                const ref  = row.cells[1].textContent.toLowerCase();
                const page = row.cells[2].textContent.toLowerCase();
                const ip   = row.cells[3].textContent.toLowerCase();

                const match = 
                    ref.includes(refFilter) &&
                    ip.includes(ipFilter) &&
                    page.includes(pageFilter);

                row.style.display = match ? "" : "none";
            });
        }
    </script>
</head>
<body>
    <h1>📊 Dashboard Ambassadeurs Digitaux</h1>

    <label>🔍 Rechercher par nom:</label>
    <input type="text" id="refFilter" oninput="filtrerTableau()" placeholder="Ex: Thelus Christela">
    <label>🔍 par IP:</label>
    <input type="text" id="ipFilter" oninput="filtrerTableau()" placeholder="Ex: 192.168.0.1">
    <label>🔍 par page:</label>
    <input type="text" id="pageFilter" oninput="filtrerTableau()" placeholder="Ex: accueil, parrainez-nous...">

    <table id="amb-table">
        <thead>
            <tr>
                <th>Date/Heure</th>
                <th>Nom Ambassadeur</th>
                <th>Page Visité</th>
                <th>IP</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($lines as $line): ?>
                <?php
                    $parts = explode(";", $line);
                    if (count($parts) === 4) {
                        [$date, $ref, $page, $ip] = $parts;
                    } else {
                        continue; // si gen erè nan liy CSV la
                    }
                ?>
                <tr>
                    <td><?= htmlspecialchars(utf8_encode($date)) ?></td>
                    <td><?= htmlspecialchars(utf8_encode($ref)) ?></td>
                    <td><?= htmlspecialchars(utf8_encode($page)) ?></td>
                    <td><?= htmlspecialchars(utf8_encode($ip)) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>
