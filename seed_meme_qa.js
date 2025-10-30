/**
 * seed_meme_qa.js
 * Script endepandan pou enpòte 1000 kesyon / repons inisyal pou Agent Inspecteur MEME
 * Pa modifye okenn fichye prensipal (entèdi). Ou jis lanse: node seed_meme_qa.js
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ------------------------------
// 1. CHANGEMAN RAPID
// ------------------------------
const MONGO_URI = process.env.MONGO_URI; // kenbe li sèlman nan .env
if (!MONGO_URI) {
  console.error("❌ MONGO_URI pa defini nan environment variables!");
  process.exit(1);
}

const DATA_FILE = path.join(__dirname, "meme_qa_data.json"); // fichye JSON lokal, pa gen done sansib ladan
const BATCH_SIZE = 1000; // kantite maksimòm pou entegre yon sèl fwa
// ------------------------------

// 2. DEKLARASYON SCHEMA MONGO
// ------------------------------
const MemeQASchema = new mongoose.Schema({
  question: { type: String, required: true, index: true },
  answer: { type: String, required: true },
  lang: { type: String, default: "fr" },
  tags: [String],
  createdBy: { type: String, default: "seed-script" },
  createdAt: { type: Date, default: Date.now }
});
const MemeQA = mongoose.models.MemeQA || mongoose.model("MemeQA", MemeQASchema);

// ------------------------------
// 3. MAIN EXECUTION FUNCTION
// ------------------------------
(async () => {
  console.log("🚀 [MEME-SEED] Lancement importation...");

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Fichye done manke: ${DATA_FILE}`);
    process.exit(1);
  }

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("❌ Erè lekti fichye JSON:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.error("❌ Fichye done a pa gen okenn antre valab.");
    process.exit(1);
  }

  console.log(`📚 ${data.length} kesyon/repons jwenn nan fichye a.`);

  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Koneksyon ak MongoDB reyisi.");

    const existing = await MemeQA.countDocuments();
    console.log(`🔎 ${existing} antre deja egziste nan baz done a.`);

    const freshData = data.slice(0, BATCH_SIZE);

    let inserted = 0;
    for (const entry of freshData) {
      if (!entry.question || !entry.answer) continue;
      const exists = await MemeQA.findOne({ question: entry.question });
      if (!exists) {
        await MemeQA.create(entry);
        inserted++;
      }
    }

    console.log(`🎉 ${inserted} nouvo antre ajoute avèk siksè!`);
    console.log("🧠 MEME kapab itilize Q/A sa yo imedyatman nan chat la.");
  } catch (err) {
    console.error("❌ Erè pandan enpòtasyon:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔒 Koneksyon fèmen.");
  }
})();
