require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./db');

const app = express();

// Koneksyon ak MongoDB
connectDB();

// Pèmèt aksè fichye uploads (foto/videyo)
app.use('/uploads', express.static('uploads'));

// CORS: GitHub Pages sèlman
app.use(cors({
  origin: 'https://fondationbackupspirituelmeme.github.io'
}));

// Body parser pou JSON & forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// Serve fichye HTML prensipal si bezwen (pa nesesè sou GitHub Pages)
app.get('/eglises-nord-ouest-haiti.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'eglises-nord-ouest-haiti.html'));
});

// Rasin API a
app.get('/', (req, res) => {
  res.send('✅ API legliz la mache byen sou Render!');
});

// Port deployman
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sèvè a koute sou http://localhost:${PORT}`);
});
