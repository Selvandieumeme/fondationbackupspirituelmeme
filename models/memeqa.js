// models/memeqa.js
const mongoose = require('mongoose');

// --- Schema ---
const MemeQASchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  lang: { type: String, default: 'ht' },
  tags: { type: [String], default: [] }
}, { timestamps: true });

// --- Text index pou rechèch ---
MemeQASchema.index({ question: 'text', answer: 'text' });

// --- Model konekte ak koleksyon egzistan "memeqas" ---
const MemeQA = mongoose.model('memeqa', MemeQASchema, 'memeqas');

// --- Export pou itilize nan lòt fichye (server.js, API routes, elatriye) ---
module.exports = MemeQA;
