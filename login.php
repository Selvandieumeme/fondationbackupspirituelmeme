<?php
session_start();

$erreur = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';

    // Antre modpas ou vle a
    if ($user === "admin" && $pass === "backup2025") {
        $_SESSION['connecte'] = true;
        header("Location: dashboard.php");
        exit;
    } else {
        $erreur = "Nom d'utilisateur ou mot de passe incorrect.";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Connexion - Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f6fa;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .login-box {
      background: #fff;
      padding: 30px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border-radius: 8px;
      width: 300px;
    }
    h2 {
      text-align: center;
      color: #004080;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #004080;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: red;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>

<div class="login-box">
  <h2>🔐 Connexion</h2>
  <?php if ($erreur): ?>
    <p class="error"><?= htmlspecialchars($erreur) ?></p>
  <?php endif; ?>
  <form method="post">
    <input type="text" name="username" placeholder="Nom d'utilisateur" required>
    <input type="password" name="password" placeholder="Mot de passe" required>
    <button type="submit">Se connecter</button>
  </form>
</div>

</body>
</html>
✅ 2
