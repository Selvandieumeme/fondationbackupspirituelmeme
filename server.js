// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Pusher = require('pusher');
const cors = require('cors');

// Init app
const app = express();
app.use(express.json());
app.use(cors());

// Pusher config
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('✅ MongoDB Connected');

  const msgCollection = db.collection('messages');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('chat-channel', 'new-message', {
        username: messageDetails.username,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp
      });
    }
  });
});

// Mongo Schema
const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: String
});

const Message = mongoose.model('Message', MessageSchema);

// Routes
app.post('/api/messages', async (req, res) => {
  const { username, message } = req.body;

  try {
    const newMsg = new Message({
      username,
      message,
      timestamp: new Date().toISOString()
    });

    await newMsg.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false });
  }
});

app.get('/', (req, res) => {
  res.send('Chat API is running...');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
