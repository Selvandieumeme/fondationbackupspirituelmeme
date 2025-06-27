<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fondation Backup Spirituel</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .galerie img {
      width: 200px;
      height: auto;
      margin: 10px;
    }
    .retour-haut {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #333;
      color: #fff;
      padding: 10px 15px;
      border-radius: 5px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <header>
    <h1>Fondation Backup Spirituel</h1>
    <nav>
      <ul>
        <li><a href="#accueil">Accueil</a></li>
        <li><a href="#apropos">À propos</a></li>
        <li><a href="#actions">Nos actions</a></li>
        <li><a href="#galerie">Galerie</a></li>
        <li><a href="#actualites">Actualités</a></li>
        <li><a href="#soutenir">Nous soutenir</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <section id="accueil" class="hero">
    <h2>Ensemble, œuvrons pour un avenir meilleur</h2>
    <p>La Fondation Backup Spirituel s'engage pour le changement social, la paix et la justice en Haïti.</p>
  </section>

  <section id="apropos">
    <h2>À propos de la Fondation</h2>
    <p>La Fondation Backup Spirituel est une organisation à but non lucratif qui lutte pour les droits humains, l’éducation et le soutien communautaire, en particulier pour les femmes et les enfants dans le Nord-Ouest d'Haïti.</p>
  </section>

  <section id="actions">
    <h2>Nos actions</h2>
    <ul>
      <li>Formations en cybersécurité et alphabétisation numérique</li>
      <li>Soutien psychologique et spirituel aux femmes victimes de violences</li>
      <li>Projets communautaires et actions de solidarité</li>
    </ul>
  </section>

  <section id="galerie">
    <h2>Galerie</h2>
    <div class="galerie">
      <img src="image1.jpg" alt="Activité 1">
      <img src="image2.jpg" alt="Activité 2">
      <img src="image3.jpg" alt="Activité 3">
    </div>
  </section>

  <section id="actualites">
    <h2>Actualités / Événements</h2>
    <ul>
      <li>📅 5 juin 2025 : Séminaire sur la cybersécurité à Mare Rouge</li>
      <li>📢 Lancement du programme de soutien aux femmes rurales</li>
      <li>🎉 Partenariat avec ONG Search for Common Ground</li>
    </ul>
  </section>

  <section id="soutenir">
    <h2>Nous soutenir</h2>
    <p>Vous pouvez contribuer à notre mission en faisant un don ou en devenant bénévole.</p>
    <a href="#" class="don-btn">Faire un don</a>
  </section>

  <section id="contact">
    <h2>Contact</h2>
    <p>Email : fondationbackupspirituel@gmail.com</p>
    <p>Téléphone : +509 xxx xxx xxx</p>
    <p>Adresse : Nord-Ouest, Haïti</p>
  </section>

<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="nom" placeholder="Votre nom" required>
  <input type="email" name="email" placeholder="Votre email" required>
  <textarea name="message" placeholder="Votre message" required></textarea>
  <button type="submit">Envoyer</button>
</form>

  <footer>
    <p>&copy; 2025 Fondation Backup Spirituel. Tous droits réservés.</p>
  </footer>

  <a href="#accueil" class="retour-haut">↑ Haut</a>
</body>
</html>
