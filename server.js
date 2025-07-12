// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');

const app = express();

// Konekte ak MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// Tcheke si tout ap mache
app.get('/', (req, res) => {
  res.send('✅ API legliz la mache byen sou Render!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sèvè a koute sou http://localhost:${PORT}`);
});
