const service = require('./express.service');
const validation = require('./express.validation');

exports.createTransfer = async (req, res) => {
  try {
    validation.validateCreateTransfer(req.body);
    const result = await service.createTransfer(req.body);
    res.json(result);
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const result = await service.verifyOTP(req.body.transfer_code, req.body.otp);
    res.json(result);
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const result = await service.markAsPaid(req.body.transfer_code);
    res.json(result);
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
