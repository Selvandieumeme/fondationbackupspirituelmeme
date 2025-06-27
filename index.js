require('dotenv').config();
const express = require("express");
const path = require("path");
const Pusher = require("pusher");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// ✅ SESSION
app.use(
  session({
    secret: 'fobas_session_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 3600000 },
  })
);

// ✅ LOG IP
app.use((req, res, next) => {
  const logLine = `${new Date().toISOString()} | IP: ${req.ip} | Path: ${req.path}\n`;
  fs.appendFileSync("access-log.txt", logLine);
  next();
});

// ✅ USER MODEL
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token:    { type: String },
  verified: { type: Boolean, default: false }
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model("User", userSchema);

// ✅ MESSAGE MODEL
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });
const Message = mongoose.model("Message", messageSchema);

// ✅ ADMIN SEKIRITE
const SECURE_ADMIN_PATH = "/kontwol-fobas-sekirite";
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;
const ALLOWED_IP = process.env.ALLOWED_ADMIN_IP;
let failedAttempts = 0;

app.use((req, res, next) => {
  const realIP = req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  console.log("🔍 Vre IP kap eseye antre:", realIP);

  if (ALLOWED_IP !== "*" && !realIP.includes(ALLOWED_IP)) {
    return res.status(403).send("❌ Ou pa gen dwa antre isit la");
  }
  next();
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("❌ Tout chan obligatwa.");
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send("❌ Email sa deja egziste.");

  const user = new User({ username, email, password });

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  user.token = token;

  await user.save();

  const verificationLink = `https://chat-en-direct-fobas.onrender.com/verify?token=${token}`;

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: {
      name: username,
      email: email,
      token: token,
      verification_link: verificationLink,
    },
  };

  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload);
    res.status(200).send("✅ Enskripsyon fèt. Tanpri verifye email ou.");
  } catch (err) {
    console.error("❌ Erè pandan envoi email:", err);
    res.status(500).send("❌ Erè pandan envoi email.");
  }
});

// ✅ VERIFY EMAIL
app.get("/verify", async (req, res) => {
  const token = req.query.token;
  const user = await User.findOne({ token });
  if (!user) return res.status(400).send("❌ Token verifikasyon pa valab.");

  user.verified = true;
  await user.save();
  res.send("✅ Email ou konfime ak siksè !");
});

// ✅ ADMIN LOGIN
app.get(SECURE_ADMIN_PATH, (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect("/admin");
  if (failedAttempts >= 3) return res.status(403).send("❌ Ou bloke aprè 3 tantativ.");

  res.send(`
    <html><body style="font-family:sans-serif; padding:30px">
      <h2>🔐 Login Admin (3 eleman)</h2>
      <form method="POST" action="${SECURE_ADMIN_PATH}">
        <input name="username" type="text" placeholder="Non itilizatè" required /><br><br>
        <input name="password" type="password" placeholder="Modpas" required /><br><br>
        <input name="secret" type="text" placeholder="Kòd sekrè" required /><br><br>
        <button type="submit">Antre</button>
      </form>
      <p>Tantativ echwe: ${failedAttempts}/3</p>
    </body></html>
  `);
});

app.post(SECURE_ADMIN_PATH, (req, res) => {
  const { username, password, secret } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS && secret === ADMIN_SECRET_CODE) {
    req.session.isAdmin = true;
    failedAttempts = 0;
    return res.redirect("/admin");
  }
  failedAttempts++;
  if (failedAttempts >= 3) return res.status(403).send("❌ Depase 3 tantativ. Ou bloke.");
  res.status(401).send(`❌ Antre pa valid. Tantativ echwe: ${failedAttempts}/3`);
});

// ✅ ADMIN DASHBOARD
app.get("/admin", async (req, res) => {
  if (!req.session || !req.session.isAdmin) return res.status(403).send("❌ Aksè entèdi.");

  const messages = await Message.find().sort({ createdAt: -1 });
  const users = await User.find().sort({ username: 1 });

  const dashboardHtml = `<html><head><title>Admin</title></head><body>Dashboard</body></html>`;
  res.send(dashboardHtml);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.send("✅ Ou soti nan sesyon admin la."));
});

// ✅ EXPORT MESSAGE
app.get("/export", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    const header = "ID,SENDER,CONTENT,DATE\n";
    const rows = messages.map(m => `"${m._id}","${m.sender}","${m.content.replace(/"/g, '""')}","${m.createdAt.toISOString()}"`).join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("messages.csv");
    return res.send(header + rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Erè pandan ekspòtasyon CSV.");
  }
});

// ✅ DELETE MESSAGE
app.post("/delete-message", async (req, res) => {
  const { id } = req.body;
  try {
    await Message.findByIdAndDelete(id);
    res.status(200).send("✅ Mesaj efase.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Erè pandan efasman mesaj.");
  }
});

// ✅ PUBLIC CHAT
app.post("/public-chat", async (req, res) => {
  const { sender, content } = req.body;
  if (!sender || !content) return res.status(400).send("❌ Sender ak content obligatwa.");
  try {
    const newMessage = await Message.create({ sender, content });
    pusher.trigger("public-chat", "new-message", {
      _id: newMessage._id,
      sender: newMessage.sender,
      content: newMessage.content,
      createdAt: newMessage.createdAt
    });
    res.status(200).send("✅ Mesaj voye avèk siksè!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Erè entèwn.");
  }
});

// ✅ CHECK API STATUS
app.get("/", (req, res) => res.send("✅ API Chat Fobas ap mache sou Render!"));

// ✅ PUSHER
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// ✅ MONGO DB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB konekte avèk siksè!"))
  .catch(err => console.error("❌ Erè koneksyon MongoDB:", err));

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur ap koute sou le port ${PORT}`);
});
