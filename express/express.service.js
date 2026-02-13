const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Transfer = require('./transferts_express.model');
const Transaction = require('./transactions_express.model');
const config = require('./express.config');

const generateTransferCode = () => 'FBS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
const generateOTP = () => Math.floor(Math.random() * 9000 + 1000).toString(); // OTP 4 chif

exports.createTransfer = async (data) => {
  try {
    const transferCode = generateTransferCode();
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    const transfer = await Transfer.create({
      ...data,
      transfer_code: transferCode,
      otp_hash: otpHash,
      otp_expires_at: new Date(Date.now() + config.OTP_EXPIRATION_MINUTES * 60000),
      status: 'pending'
    });

    await Transaction.create({
      transfer_id: transfer._id,
      action_type: 'created'
    });

    return { success: true, transfer, otp };
  } catch (err) {
    return { success: false, message: err.message || 'Erreur serveur' };
  }
};

exports.verifyOTP = async (code, otpInput) => {
  try {
    const transfer = await Transfer.findOne({ transfer_code: code });
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'pending') throw new Error('Invalid status');

    const match = await bcrypt.compare(otpInput, transfer.otp_hash);
    if (!match) throw new Error('Invalid OTP');

    transfer.status = 'otp_verified';
    await transfer.save();

    await Transaction.create({ transfer_id: transfer._id, action_type: 'otp_verified' });

    return { success: true, transfer };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

exports.markAsPaid = async (code) => {
  try {
    const transfer = await Transfer.findOne({ transfer_code: code });
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'otp_verified') throw new Error('OTP not verified');

    transfer.status = 'paid';
    await transfer.save();

    await Transaction.create({ transfer_id: transfer._id, action_type: 'paid' });

    return { success: true, transfer };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
