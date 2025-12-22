const fs = require("fs");
const path = require("path");

// ========== KONFIG ==========
const OLD_URL = "https://fondationbackupspirituel.com/api";
const NEW_URL = "https://fondationbackupspirituel.com/api";
const ROOT_DIR = "./"; // repèrtwar pwojè w la

// ========== FONKSYON POU TRETE FICHYE ==========
function processFile(filePath) {
  const ext = path.extname(filePath);
  if (![".js", ".html"].includes(ext)) return;

  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(OLD_URL)) {
    content = content.split(OLD_URL).join(NEW_URL);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Ranplase URL nan: ${filePath}`);
  }
}

// ========== FONKSYON POU TRETE REPÈRTWAR REKIRSIV ==========
function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== "node_modules") {
      walkDir(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// ========== KÒD MAIN ==========
walkDir(ROOT_DIR);
console.log("🚀 Tout URL ansyen ranplase ak nouvo URL VPS la!");
