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
        input[type="text"] {
            padding: 8px;
            margin: 10px 5px;
            width: 200px;
        }
    </style>
    <script>
        function filtrerTableau() {
            let refFilter = document.getElementById("refFilter").value.toLowerCase();
            let ipFilter  = document.getElementById("ipFilter").value.toLowerCase();
            let pageFilter= document.getElementById("pageFilter").value.toLowerCase();
            let rows = document.querySelectorAll("tbody tr");

            rows.forEach(row => {
                let ref  = row.cells[1].textContent.toLowerCase();
                let page = row.cells[2].textContent.toLowerCase();
                let ip   = row.cells[3].textContent.toLowerCase();

                row.style.display =
                    (ref.includes(refFilter) && ip.includes(ipFilter) && page.includes(pageFilter))
                    ? "" : "none";
            });
        }
    </script>
</head>
<body>
    <h1>📊 Dashboard Ambassadeurs Digitaux</h1>

    <label>🔍 Rechercher par nom:</label>
    <input type="text" id="refFilter" onkeyup="filtrerTableau()" placeholder="Ex: Thelus Christela">
    <label>🔍 par IP:</label>
    <input type="text" id="ipFilter" onkeyup="filtrerTableau()" placeholder="Ex: 192.168.0.1">
    <label>🔍 par page:</label>
    <input type="text" id="pageFilter" onkeyup="filtrerTableau()" placeholder="Ex: accueil, parrainez-nous...">

    <table>
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
                <?php list($date, $ref, $page, $ip) = explode(";", $line); ?>
                <tr>
                    <td><?= htmlspecialchars($date) ?></td>
                    <td><?= htmlspecialchars($ref) ?></td>
                    <td><?= htmlspecialchars($page) ?></td>
                    <td><?= htmlspecialchars($ip) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>
