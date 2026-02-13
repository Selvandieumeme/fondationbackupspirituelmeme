// /express/express.validation.js

const config = require('./express.config');

exports.validateCreateTransfer = (data) => {
  if (!data.sender_name || !data.receiver_name)
    throw new Error('Sender and Receiver names are required');

  if (data.amount <= 0 || data.amount > config.MAX_AMOUNT)
    throw new Error(`Amount must be between 1 and ${config.MAX_AMOUNT}`);

  if (data.sender_whatsapp.length < 8 || data.receiver_whatsapp.length < 8)
    throw new Error('Invalid WhatsApp number length');

  if (data.sender_id === data.receiver_id)
    throw new Error('Sender and Receiver cannot be the same person');
};
