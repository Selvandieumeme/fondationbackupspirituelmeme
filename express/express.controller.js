// /express/express.controller.js

const service = require('./express.service');
const validation = require('./express.validation');

exports.createTransfer = async (req, res) => {
  try {
    validation.validateCreateTransfer(req.body);
    const result = await service.createTransfer(req.body, req.user, req.ip);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const result = await service.verifyOTP(req.body.transfer_code, req.body.otp, req.user, req.ip);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const result = await service.markAsPaid(req.body.transfer_code, req.user, req.ip);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
