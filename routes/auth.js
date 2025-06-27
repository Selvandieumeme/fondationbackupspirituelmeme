const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "backupsecret";

// ✅ Konfigirasyon pou nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ✅ FONKSYON POU VOYE EMAIL KONFIMASYON
async function sendConfirmationEmail(user, token) {
  const confirmLink = `https://chat-en-direct-fobas.onrender.com/api/auth/confirm/${token}`;
  await transporter.sendMail({
    from: `"Fobas Sekirite" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: "✅ Konfimasyon Kont ou",
    html: `
      <p>Bonjou ${user.username},</p>
      <p>Klike sou bouton sa pou konfime kont ou:</p>
      <p><a href="${confirmLink}" target="_blank" style="background-color:#2563eb;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">Konfime Kont mwen</a></p>
      <p>Si ou pa t kreye kont sa, ou ka ignore mesaj sa.</p>
    `
  });
}

// ✅ INSCRIPTION / SIGN UP
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Tout chan obligatwa." });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "Itilizatè oswa imel deja egziste." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });
    await sendConfirmationEmail(newUser, token);

    res.status(201).json({ success: true, message: "✅ Kont kreye. Tanpri verifye imel ou." });
  } catch (err) {
    console.error("❌ Erè pandan enskripsyon:", err);
    res.status(500).json({ success: false, message: "❌ Erè pandan enskripsyon." });
  }
});

// ✅ KONFIMASYON EMAIL
router.get("/confirm/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.send("✅ Bravo! Kont ou verifye. Ou ka konekte kounya.");
  } catch (err) {
    res.status(400).send("❌ Token pa valab oswa ekspire.");
  }
});

// ✅ LOGIN / KONEKTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Imel ak modpas obligatwa." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Itilizatè pa jwenn." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Modpas pa bon." });

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Tanpri konfime imel ou avan ou konekte." });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      success: true,
      message: "✅ Login reyisi!",
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Erè login:", err);
    res.status(500).json({ success: false, message: "Erè pandan login." });
  }
});

module.exports = router;
