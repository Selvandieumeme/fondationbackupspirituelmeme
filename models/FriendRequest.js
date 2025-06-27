const mongoose = require('mongoose');
const frSchema = new mongoose.Schema({
  from: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  to:   { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('FriendRequest', frSchema);
