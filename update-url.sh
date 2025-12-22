#!/bin/bash

# =======================
# SCRIPT: update-url.sh
# Ranplase ansyen URL API ak nouvo VPS URL epi rekòmanse PM2
# =======================

# Ansyen URL render
OLD_URL="https://api.fondationbackupspirituel.com/api"

# Nouvo URL VPS
NEW_URL="https://fondationbackupspirituel.com/api"

echo "🔹 Ranplase tout aparisyon ansyen URL la..."
find . -type f \( -name "*.js" -o -name "*.html" \) ! -path "./node_modules/*" -exec sed -i "s|$OLD_URL|$NEW_URL|g" {} +

echo "🔹 Verifye si gen ansyen URL ki rete..."
REMAINING=$(grep -r "examen-backend-ihlx.onrender.com" . --exclude-dir=node_modules)
if [ -z "$REMAINING" ]; then
    echo "✅ Tout URL yo ranplase avèk siksè!"
else
    echo "⚠️ Gen kèk URL ki toujou rete:"
    echo "$REMAINING"
fi

echo "🔹 Rekòmanse PM2..."
pm2 restart walletfobas --update-env
echo "🚀 Deploy fini! Tout mizajou sou VPS aplike."
