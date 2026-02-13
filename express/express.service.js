// /express/express.service.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Transfer = require('./transferts_express.model');
const Transaction = require('./transactions_express.model');
const config = require('./express.config');

const generateTransferCode = () => 'FBS-' + crypto.randomBytes(4).toString('hex').toUpperCase();

const generateOTP = () => Math.floor(
  10 ** (config.OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (config.OTP_LENGTH - 1)
).toString();

exports.createTransfer = async (data, agent, ip) => {
  const transferCode = generateTransferCode();
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);

  const otpExpires = new Date(Date.now() + config.OTP_EXPIRATION_MINUTES * 60000);

  const transfer = await Transfer.create({
    ...data,
    transfer_code: transferCode,
    otp_hash: otpHash,
    otp_expires_at: otpExpires,
    agent_id: agent._id
  });

  await Transaction.create({
    transfer_id: transfer._id,
    action_type: 'created',
    performed_by: agent._id,
    ip_address: ip
  });

  return { transfer, otp };
};

exports.verifyOTP = async (code, otpInput, agent, ip) => {
  const transfer = await Transfer.findOne({ transfer_code: code });

  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status !== 'pending') throw new Error('Invalid status');
  if (transfer.otp_expires_at < new Date()) throw new Error('OTP expired');
  if (transfer.otp_attempts >= config.MAX_OTP_ATTEMPTS) throw new Error('Too many attempts');

  const match = await bcrypt.compare(otpInput, transfer.otp_hash);

  if (!match) {
    transfer.otp_attempts += 1;
    await transfer.save();
    throw new Error('Invalid OTP');
  }

  transfer.status = 'otp_verified';
  await transfer.save();

  await Transaction.create({
    transfer_id: transfer._id,
    action_type: 'otp_verified',
    performed_by: agent._id,
    ip_address: ip
  });

  return transfer;
};

exports.markAsPaid = async (code, agent, ip) => {
  const transfer = await Transfer.findOne({ transfer_code: code });

  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status !== 'otp_verified') throw new Error('OTP not verified');

  transfer.status = 'paid';
  await transfer.save();

  await Transaction.create({
    transfer_id: transfer._id,
    action_type: 'paid',
    performed_by: agent._id,
    ip_address: ip
  });

  return transfer;
};
