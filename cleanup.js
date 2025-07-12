const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

fs.readdir(uploadsDir, (err, files) => {
  if (err) return console.error('Erreur lecture dossier uploads:', err);

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);

    fs.stat(filePath, (err, stats) => {
      if (err) return console.error(`Erreur infos ${file}:`, err);

      const now = Date.now();
      const modifiedTime = new Date(stats.mtime).getTime();

      if (now - modifiedTime > THIRTY_DAYS) {
        fs.unlink(filePath, err => {
          if (err) return console.error(`Erreur suppression ${file}:`, err);
          console.log(`🗑️ ${file} supprimé après 30 jours.`);
        });
      }
    });
  });
});
