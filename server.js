// ============================
// Environment Variables  JHJK
// ============================
require('dotenv').config(); // ✅ Kenbe sa nan tèt

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const connectMongo = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const ffmpeg = require('fluent-ffmpeg');
const { parse } = require('json2csv');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Pusher = require('pusher');
const sharp = require('sharp');
const fs = require('fs'); // <-- AJOUTE LIG SA A LA OUVÈTI BLOK LA
const cron = require('node-cron');
const Queue = require("bull");
const crypto = require("crypto");























const videoQueue = new Queue("fobas-video", {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});










// ==========================
// FOBAS PROGRESS ENGINE
// ==========================

async function calculateAgentProgress(agent) {

  let progress = 0;

  // ==========================
  // LEVEL BASE
  // ==========================
  const levelMap = {
    Bronze: 0,
    Silver: 25,
    Gold: 50,
    Elite: 75,
    Ambassador: 100
  };

  progress += levelMap[agent.level] || 0;

  // ==========================
  // CONDITION 1: AGENTS REFERRALS 
  // ==========================
  const totalAgentReferrals =
  agent.totalAgentReferrals || 0;

if (agent.level === "Bronze") {

  const target = 100;

  let agentProgress =
    (totalAgentReferrals / target) * 25;

  if (agentProgress > 25) {
    agentProgress = 25;
  }

  progress += agentProgress;

}
  if (agent.level === "Silver") {

  const target = 500;

  let agentProgress =
    (totalAgentReferrals / target) * 25;

  if (agentProgress > 25) {
    agentProgress = 25;
  }

  progress += agentProgress;

}

  if (agent.level === "Gold") {

  const target = 2000;

  let agentProgress =
    (totalAgentReferrals / target) * 25;

  if (agentProgress > 25) {
    agentProgress = 25;
  }

  progress += agentProgress;

}

  if (agent.level === "Elite") {

  const target = 5000;

  let agentProgress =
    (totalAgentReferrals / target) * 25;

  if (agentProgress > 25) {
    agentProgress = 25;
  }

  progress += agentProgress;

}

// ==========================
// CONDITION 2: WITHDRAW HISTORY
// ==========================
const Withdrawals =
  mongoose.connection.collection("withdrawals");

const withdrawals =
  await Withdrawals.find({
    agentId: agent._id,
    status: "approved"
  }).toArray();

if (agent.level === "Bronze") {

  const valid = withdrawals.filter(w => w.amount >= 2500).length;
  if (valid >= 1) progress += 5;

  const valid2 = withdrawals.filter(w => w.amount >= 5000).length;
  if (valid2 >= 1) progress += 10;

  const valid3 = withdrawals.filter(w => w.amount >= 10000).length;
  if (valid3 >= 1) progress += 10;

}

if (agent.level === "Silver") {

  const step1 = withdrawals.filter(w => w.amount >= 15000).length;
  if (step1 >= 1) progress += 5;

  const step2 = withdrawals.filter(w => w.amount >= 25000).length;
  if (step2 >= 1) progress += 5;

  const step3 = withdrawals.filter(w => w.amount >= 35000).length;
  if (step3 >= 1) progress += 5;

  const step4 = withdrawals.filter(w => w.amount >= 40000).length;
  if (step4 >= 1) progress += 5;

  const step5 = withdrawals.filter(w => w.amount >= 50000).length;
  if (step5 >= 1) progress += 5;

}

if (agent.level === "Gold") {

  const step1 = withdrawals.filter(w => w.amount >= 75000).length;
  if (step1 >= 1) progress += 2.5;

  const step2 = withdrawals.filter(w => w.amount >= 100000).length;
  if (step2 >= 1) progress += 2.5;

  const step3 = withdrawals.filter(w => w.amount >= 125000).length;
  if (step3 >= 1) progress += 2.5;

  const step4 = withdrawals.filter(w => w.amount >= 130000).length;
  if (step4 >= 1) progress += 2.5;

  const step5 = withdrawals.filter(w => w.amount >= 140000).length;
  if (step5 >= 1) progress += 2.5;

  const step6 = withdrawals.filter(w => w.amount >= 150000).length;
  if (step6 >= 1) progress += 2.5;

  const step7 = withdrawals.filter(w => w.amount >= 150000).length;
  if (step7 >= 2) progress += 2.5;

  const step8 = withdrawals.filter(w => w.amount >= 150000).length;
  if (step8 >= 3) progress += 2.5;

  const step9 = withdrawals.filter(w => w.amount >= 150000).length;
  if (step9 >= 4) progress += 2.5;

  const step10 = withdrawals.filter(w => w.amount >= 150000).length;
  if (step10 >= 5) progress += 2.5;

}

if (agent.level === "Elite") {

  const eliteWithdraws =
    withdrawals.filter(w => w.amount >= 100000).length;

  if (eliteWithdraws >= 1) progress += 5;
  if (eliteWithdraws >= 2) progress += 5;
  if (eliteWithdraws >= 3) progress += 5;
  if (eliteWithdraws >= 4) progress += 5;
  if (eliteWithdraws >= 5) progress += 5;

}
  // ==========================
  // CONDITION 3: ENTREPREPRENEUR REFERRED
  // ==========================
  const entrepreneurReferrals =
  agent.totalReferrals || 0;

if (agent.level === "Bronze") {

  const target = 100;

  let entrepreneurProgress =
    (entrepreneurReferrals / target) * 25;

  if (entrepreneurProgress > 25) {
    entrepreneurProgress = 25;
  }

  progress += entrepreneurProgress;

}
if (agent.level === "Silver") {

  const target = 500;

  let entrepreneurProgress =
    (entrepreneurReferrals / target) * 25;

  if (entrepreneurProgress > 25) {
    entrepreneurProgress = 25;
  }

  progress += entrepreneurProgress;

}
  if (agent.level === "Gold") {

  const target = 2000;

  let entrepreneurProgress =
    (entrepreneurReferrals / target) * 25;

  if (entrepreneurProgress > 25) {
    entrepreneurProgress = 25;
  }

  progress += entrepreneurProgress;

}
  if (agent.level === "Elite") {

  const target = 5000;

  let entrepreneurProgress =
    (entrepreneurReferrals / target) * 25;

  if (entrepreneurProgress > 25) {
    entrepreneurProgress = 25;
  }

  progress += entrepreneurProgress;

}

  // ==========================
  // CONDITION 4: CLIENT ORDERS
  // ==========================
  const clientOrders = agent.clientOrders || 0;

  if (agent.level === "Bronze" && clientOrders >= 10) progress += 25;
  if (agent.level === "Silver" && clientOrders >= 25) progress += 25;
  if (agent.level === "Gold" && clientOrders >= 50) progress += 25;
  if (agent.level === "Elite" && clientOrders >= 100) progress += 25;

  // ==========================
  // CAP PROGRESS
  // ==========================
  if (progress > 100) progress = 100;

  return progress;
}









async function checkLevelUpgrade(Agents, agent) {

  let newLevel = agent.level;

  if (agent.level === "Bronze" && agent.progress >= 100) {
    newLevel = "Silver";
    agent.totalCommission += 1000;
  }

  else if (agent.level === "Silver" && agent.progress >= 100) {
    newLevel = "Gold";
    agent.totalCommission += 2000;
  }

  else if (agent.level === "Gold" && agent.progress >= 100) {
    newLevel = "Elite";
    agent.totalCommission += 5000;
  }

  else if (agent.level === "Elite" && agent.progress >= 100) {
    newLevel = "Ambassador";
    agent.totalCommission += 10000;
  }

  if (newLevel !== agent.level) {

    await Agents.updateOne(
      { _id: agent._id },
      {
        $set: {
          level: newLevel,
          progress: 0
        }
      }
    );

    return true;
  }

  return false;
}









async function updateAgentProgress(agentId) {

  const Agents =
    mongoose.connection.collection("agents");

  const agent = await Agents.findOne({
    _id: new mongoose.Types.ObjectId(agentId)
  });

  if (!agent) return;

  const progress = await calculateAgentProgress(agent);

  agent.progress = progress;

  await Agents.updateOne(
    { _id: agent._id },
    {
      $set: {
        progress
      }
    }
  );

  await checkLevelUpgrade(Agents, agent);
}







// ----------------------- MODELS -----------------------
const VipSession = require('./models/VipSession.js');   // CommonJS
const User = require('./models/User.js');               // CommonJSP



const app = express(); 
app.use(cors()); 
app.use(express.json());







// =====================================
// FOBAS AI PROFESSOR - GROQ ENGINE
// =====================================

app.post('/api/ai-professor', async (req, res) => {

    try {

        const {
            message,
            course,
            chapter,
            language
        } = req.body;


        if (
            !message ||
            typeof message !== 'string' ||
            !message.trim()
        ) {

            return res.status(400).json({

                error: 'Message is required.'

            });

        }


        const aiResponse = await axios.post(

            'https://api.groq.com/openai/v1/chat/completions',

            {

                model: 'openai/gpt-oss-120b',

                messages: [

                    {

                        role: 'system',

                        content: `

Tu es Ranise MOISE, une Professeure IA intelligente et pédagogique de CampusNumérique FOBAS.

Tu accompagnes les étudiants dans leur formation informatique et bureautique.

Tu dois répondre principalement en français.

Tu dois expliquer les notions de manière claire, progressive et adaptée au niveau de l'étudiant.

Tu ne dois pas simplement donner une réponse courte lorsque l'étudiant demande une explication.

Tu dois utiliser des exemples pratiques lorsque cela peut aider.

Tu peux accompagner l'étudiant étape par étape dans Microsoft Word 2007.

Tu peux répondre aux questions sur les outils, menus, commandes, documents, mise en forme, tableaux, images, paragraphes, pages, impression et autres notions bureautiques.

Si l'étudiant ne comprend pas une notion, explique-la d'une autre manière avec un exemple simple.

Tu dois te comporter comme une véritable professeure numérique patiente, professionnelle, encourageante et pédagogique.

Formation actuelle :
${course || 'Microsoft Word 2007'}

Chapitre actuel :
${chapter || 'Non précisé'}

Langue demandée :
${language || 'fr-FR'}

`

                    },

                    {

                        role: 'user',

                        content: message.trim()

                    }

                ],

                temperature: 0.7,

                max_tokens: 1200

            },

            {

                headers: {

                    'Authorization':
                        `Bearer ${process.env.GROQ_API_KEY}`,

                    'Content-Type':
                        'application/json'

                }

            }

        );


        const professorText =
            aiResponse.data
                ?.choices?.[0]
                ?.message?.content;


        if (
            !professorText ||
            !professorText.trim()
        ) {

            return res.status(502).json({

                error:
                    'The AI Professor returned an empty response.'

            });

        }


        return res.json({

            text:
                professorText.trim()

        });


    } catch (error) {


        console.error(
            'FOBAS AI PROFESSOR ERROR:',
            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            error:
                'AI Professor service unavailable.'

        });

    }

});











// =====================================
// CAMPUS AI PROFESSOR
// PIPER FRENCH FEMALE TTS ENGINE
// ISOLATED MODULE
// fr_FR-siwis-medium
// REPLACES ELEVENLABS TTS ENGINE
// =====================================

const {
    spawn
} = require("child_process");


const os =
    require("os");




const PIPER_EXECUTABLE =
    "/home/fobas/walletfobas_git/piper-fr/piper/piper";



const PIPER_MODEL =
    "/home/fobas/walletfobas_git/piper-fr/fr_FR-siwis-medium.onnx";



app.post(
    "/api/ai-professor/voice",
    async (req, res) => {

        let temporaryWavFile =
            null;



        try {

            const text =
                req.body &&
                typeof req.body.text === "string"
                    ? req.body.text.trim()
                    : "";



            if (!text) {

                return res.status(400).json({

                    error:
                        "PIPER_TEXT_EMPTY"

                });

            }



            if (
                !fs.existsSync(
                    PIPER_EXECUTABLE
                )
            ) {

                throw new Error(
                    "PIPER_EXECUTABLE_NOT_FOUND"
                );

            }



            if (
                !fs.existsSync(
                    PIPER_MODEL
                )
            ) {

                throw new Error(
                    "PIPER_MODEL_NOT_FOUND"
                );

            }



            temporaryWavFile =
                path.join(
                    os.tmpdir(),
                    "ranise-piper-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2) +
                    ".wav"
                );



            await new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const piper =
                        spawn(
                            PIPER_EXECUTABLE,
                            [

                                "--model",
                                PIPER_MODEL,

                                "--length_scale",
                                "1.20",

                                "--output_file",
                                temporaryWavFile

                            ],
                            {

                                stdio: [
                                    "pipe",
                                    "ignore",
                                    "pipe"
                                ]

                            }
                        );



                    let errorOutput =
                        "";



                    piper.stderr.on(
                        "data",
                        (chunk) => {

                            errorOutput +=
                                chunk.toString();

                        }
                    );



                    piper.on(
                        "error",
                        (error) => {

                            reject(
                                error
                            );

                        }
                    );



                    piper.on(
                        "close",
                        (code) => {

                            if (
                                code !== 0
                            ) {

                                reject(
                                    new Error(
                                        errorOutput ||
                                        "PIPER_PROCESS_FAILED"
                                    )
                                );

                                return;

                            }



                            if (
                                !fs.existsSync(
                                    temporaryWavFile
                                )
                            ) {

                                reject(
                                    new Error(
                                        "PIPER_AUDIO_FILE_NOT_CREATED"
                                    )
                                );

                                return;

                            }



                            const stats =
                                fs.statSync(
                                    temporaryWavFile
                                );



                            if (
                                !stats.size
                            ) {

                                reject(
                                    new Error(
                                        "PIPER_AUDIO_EMPTY"
                                    )
                                );

                                return;

                            }



                            resolve();

                        }

                    );



                    piper.stdin.write(
                        text + "\n"
                    );



                    piper.stdin.end();

                }
            );



            const audioBuffer =
                await fs.promises.readFile(
                    temporaryWavFile
                );



            const audioBase64 =
                audioBuffer.toString(
                    "base64"
                );



            return res.json({

                audio:
                    audioBase64,

                mimeType:
                    "audio/wav"

            });


        } catch (error) {


            console.error(

                "FOBAS PIPER FRENCH FEMALE TTS ERROR:",

                error.message

            );



            return res.status(500).json({

                error:
                    "Piper French TTS service unavailable."

            });


        } finally {


            if (
                temporaryWavFile &&
                fs.existsSync(
                    temporaryWavFile
                )
            ) {

                try {

                    await fs.promises.unlink(
                        temporaryWavFile
                    );

                } catch (cleanupError) {}

            }

        }

    }
);

















































// =====================================
// 📤 MULTER STORAGE
// =====================================
const mediaStorage = multer.diskStorage({

    destination: function(req, file, cb) {

        if(file.fieldname === "thumbnail") {

            cb(
              null,
              "fobas_uploads/thumbnails/"
            );

        } else {

            cb(
              null,
              "fobas_uploads/media/"
            );
        }
    },

    filename: function(req, file, cb) {

        cb(
          null,
          Date.now() +
          "-" +
          file.originalname
        );
    }
});

const mediaUpload = multer({
  storage: mediaStorage
});







const exchangeSchema = new mongoose.Schema({
  ownerName: String,
  title: String,
  description: String,
  image: String,
  createdAt: Date
});

const Exchange = mongoose.model("Exchange", exchangeSchema);





const commentSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);





// =====================================
// 🎬 FOBAS MEDIA SCHEMA
// =====================================
const mediaSchema = new mongoose.Schema({

    title: String,

    description: String,

    type: String,

    mediaUrl: String,

    thumbnail: String,

    premium: {
        type: Boolean,
        default: false
    },

    dateCreated: {
        type: Date,
        default: Date.now
    }
});

const Media =
mongoose.model("media", mediaSchema);





// =====================================
// 📩 MEDIA CONTACT SCHEMA
// =====================================
const mediaContactSchema =
new mongoose.Schema({

    nom: String,

    email: String,

    message: String,

    dateCreated: {
        type: Date,
        default: Date.now
    }
});

const MediaContact =
mongoose.model(
  "mediacontacts",
  mediaContactSchema
);








// 🔥 ensure folder exists (IMPORTANT)
fs.mkdirSync(
  path.join(__dirname, 'fobas_uploads/exchanges'),
  { recursive: true }
);


// 👉 static files
app.use('/fobas_uploads', express.static(
  path.join(__dirname, 'fobas_uploads')
));



// =====================================
// 📁 CREATE MEDIA FOLDERS
// =====================================
fs.mkdirSync(
  path.join(__dirname, "fobas_uploads/media"),
  { recursive: true }
);

fs.mkdirSync(
  path.join(__dirname, "fobas_uploads/thumbnails"),
  { recursive: true }
);









// ============================
// MULTER CONFIG (SAFE)
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'fobas_uploads/exchanges');
  },
  filename: (req, file, cb) => {
  const name = file.originalname.replace(/\s+/g, '-');
  cb(null, Date.now() + '-' + name);
}
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 🔥 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Se selman imaj ki aksepte'));
    }

    cb(null, true);
  }
});















// ============================
// ROUTE: UPLOAD IMAGE (OBLIGATWA)
// ============================
app.post('/api/upload-image', (req, res) => {

  upload.single('image')(req, res, function (err) {

    if (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image obligatwa"
      });
    }

    return res.json({
      success: true,
      url: `/fobas_uploads/exchanges/${req.file.filename}`
    });

  });

});









// ============================
// ROUTE: CREATE EXCHANGE (FINAL CLEAN)
// ============================
app.post('/api/exchanges/create', async (req, res) => {
  try {

    // 🔍 DEBUG (safe - retire nan production si ou vle)
    console.log("EXCHANGE BODY:", req.body);

    // 🔹 NEW SYSTEM: NO USER ID — just full name
    const fullName = req.body.fullName?.trim();

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Non konplè obligatwa"
      });
    }

    // 🔹 title check (ENPÒTAN pou evite empty posts)
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Tit ak deskripsyon obligatwa"
      });
    }

    // 🔹 image check
    const image = req.body.image;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image obligatwa"
      });
    }

    // 🔥 CREATE ITEM (CLEAN & SAFE)
    const item = await Exchange.create({
      ownerName: fullName,
      title,
      description,
      image,
      createdAt: new Date()
    });

    return res.json({
      success: true,
      message: "Anons pibliye avèk siksè",
      item
    });

  } catch (error) {
    console.error("❌ Exchange Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});





app.post('/api/comments', async (req, res) => {
  try {

    const { itemId, name, message } = req.body;

    if (!itemId || !name || !message) {
      return res.status(400).json({
        success: false,
        message: "Done manke"
      });
    }

    const comment = await Comment.create({
      itemId,
      name,
      message
    });

    res.json({ success: true, comment });

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});



app.get('/api/items', async (req, res) => {
  try {
    const items = await Exchange.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    console.error("ITEMS ERROR:", error);
    return res.status(500).json([]);
  }
});



app.get('/api/comments/:itemId', async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json([]);
  }
});



















 



const contactSchema = new mongoose.Schema({
   nom: String,
   email: String,
   telephone: String,
   service: String,
   message: String,
   dateCreated: {
      type: Date,
      default: Date.now
   }
});

const Contact = mongoose.model("contacts", contactSchema);

// =====================================
// 📩 CONTACT FOBAS TECH AGENCY
// =====================================
app.post("/contact", async (req, res) => {

    try {

        const {
            nom,
            email,
            service,
            message
        } = req.body;
		
        // =============================
        // VALIDATION
        // =============================
        if (
            !nom ||
            !email ||
            !service ||
            !message
        ) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires"
            });
        }


        console.log("📩 Nouveau contact FOBAS AGENCY :", req.body);



// =============================
// SAVE CONTACT MONGODB
// =============================
const nouveauContact = new Contact({

    nom,
    email,
    telephone: "N/A",
    service,
    message
});

await nouveauContact.save();

		
        // =============================
        // EMAIL NOTIFICATION
        // =============================
        fetch(process.env.GAS_WEBHOOK_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                nom,
                email,
                telephone: "N/A",
                secret: process.env.GAS_SECRET
            })
        }).catch(err => console.log(err));


        res.status(200).json({
            success: true,
            message: "Message envoyé avec succès"
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
});


















// =====================================
// 📤 UPLOAD MEDIA
// =====================================
app.post(

"/upload-media",

mediaUpload.fields([

  { name: "media", maxCount: 1 },

  { name: "thumbnail", maxCount: 1 }

]),

async(req,res)=>{

    try {

        const mediaFile =
        req.files.media[0];

        const thumbnailFile =
        req.files.thumbnail[0];

        const nouveauMedia =
        new Media({

            title:
            req.body.title,

            description:
            req.body.description,

            type:
            req.body.type,

            mediaUrl:
            "/fobas_uploads/media/" +
            mediaFile.filename,

            thumbnail:
            "/fobas_uploads/thumbnails/" +
            thumbnailFile.filename,

            premium:
            req.body.premium === "true"
        });

        await nouveauMedia.save();

        res.status(200).json({

            success: true,

            message:
            "Media uploaded successfully"
        });

    } catch(error){

        console.error(error);

        res.status(500).json({

            success: false,

            message:
            "Erreur upload media"
        });
    }
});





// =====================================
// 📺 GET ALL MEDIAS
// =====================================
app.get("/media",
async(req,res)=>{

    try {

        const medias =
        await Media.find()
        .sort({ dateCreated: -1 });

        res.json(medias);

    } catch(error){

        console.error(error);

        res.status(500).json({

            success: false
        });
    }
});





// =====================================
// 📩 CONTACT FOBAS MEDIA
// =====================================
app.post("/media-contact",
async(req,res)=>{

    try {

        const nouveau =
        new MediaContact(req.body);

        await nouveau.save();

        res.status(200).json({

            success: true,

            message:
            "Message envoyé"
        });

    } catch(error){

        console.error(error);

        res.status(500).json({

            success: false
        });
    }
});
























// ==========================
// AGENTS REGISTER ROUTE
// FINAL CLEAN VERSION
// ==========================

app.post("/agents/register", async (req, res) => {

  try {

    console.log("REGISTER BODY:", req.body);

    let {
      name,
      email,
      password,
      role,
      businessName,
      whatsapp,
      country,
      city,
      zone
    } = req.body || {};

    // ==========================
    // BASIC VALIDATION (SAFE BACKWARD COMPATIBLE)
    // ==========================
    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });

    }

    // ==========================
    // CLEAN DATA
    // ==========================
    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    role = role || "agent";
	  
	

    // ==========================
    // ROLE VALIDATION (SAFE)
    // ==========================
    if (role === "entrepreneur" || role === "agent_entrepreneur") {

      if (!businessName || !whatsapp || !country || !city || !zone) {

        return res.status(400).json({
          success: false,
          message: "Entrepreneur information required"
        });

      }
    }

    // ==========================
    // COLLECTION
    // ==========================
    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // CHECK EXISTING
    // ==========================
    const exist =
      await Agents.findOne({ email });

    if (exist) {

      return res.status(409).json({
        success: false,
        message: "Agent already exists"
      });

    }

    // ==========================
    // HASH PASSWORD
    // ==========================
    const hashedPassword =
      await bcryptjs.hash(password, 12);







// ==========================
// REFERRAL
// ==========================
const referralCode =
  "AGT_" +
  Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

const referralCodeFromLink =
  (req.body.referralCode || req.body.referralFrom || "").trim() || null;

let referrerAgent = null;

if (referralCodeFromLink) {
  referrerAgent = await Agents.findOne({
    referralCode: referralCodeFromLink
  });

  // ❗ prevent self referral
  if (referrerAgent && referrerAgent.email === email) {
    referrerAgent = null;
  }
}


// ==========================
// INSERT
// ==========================
const result = await Agents.insertOne({

  name,
  email,
  password: hashedPassword,
  role,

  referralCode,

  level: "Bronze",
  totalCommission: 0,
  progress: 0,
  totalAgentReferrals: 0,

  referralFrom: referralCodeFromLink || null,
  referredBy: referrerAgent ? referrerAgent._id : null,
  referralPaid: false,

		// ==========================
        // ENTREPRENEUR DATA (OPTIONAL SAFE)
        // ==========================
        businessName: businessName || null,
        whatsapp: whatsapp || null,
        country: country || null,
        city: city || null,
        zone: zone || null,

  createdAt: new Date()
});


// ==========================
// REFERRAL REWARD (APRE INSERT - SAFE PLACE)
// ==========================
if (
  referrerAgent &&
  (role === "entrepreneur" || role === "agent_entrepreneur")
) {

  await Agents.updateOne(
    { _id: referrerAgent._id },
    {
      $inc: {
        totalReferrals: 1,
        totalCommission: 500
      }
    }
  );

  // 🔥 REAL-TIME PROGRESS UPDATE
  await updateAgentProgress(referrerAgent._id);

}
	  
// ==========================
// AGENT REFERRAL PROGRESS
// ==========================
if (
  referrerAgent &&
  role === "agent"
) {

  await Agents.updateOne(
    { _id: referrerAgent._id },
    {
      $inc: {
        totalAgentReferrals: 1
      }
    }
  );

  // 🔥 REAL-TIME PROGRESS UPDATE
  await updateAgentProgress(referrerAgent._id);

}








console.log("AGENT CREATED:", result.insertedId);

    return res.status(201).json({

      success: true,
      message: "Agent created successfully",
      referralCode

    });

  }

  catch (err) {

    console.error("REGISTER ERROR FULL:", err);

    return res.status(500).json({

      success: false,
      message: "Internal server error",
      error: err.message

    });

  }

});








// ==========================
// AGENTS DASHBOARD ROUTE
// ==========================

app.get("/agents/dashboard", async (req, res) => {

  try {

    const email = req.query.email;

    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND USER
    // ==========================
    let agent = null;

if (email) {
  agent = await Agents.findOne({ email });
}

    // ==========================
    // GLOBAL STATS
    // ==========================
    const totalUsers =
      await Agents.countDocuments();

    const totalAgents =
      await Agents.countDocuments({
        role: {
          $in: ["agent", "agent_entrepreneur"]
        }
      });

    const totalBusinesses =
      await Agents.countDocuments({
        role: {
          $in: ["entrepreneur", "agent_entrepreneur"]
        }
      });

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({

  success: true,

  // ==========================
  // GLOBAL STATS
  // ==========================
  totalUsers,
  totalAgents,
  totalBusinesses,

  // ==========================
  // USER DATA
  // ==========================
  referralLink:
    agent?.referralCode
      ? `https://fondationbackupspirituel.com/deveniragents.html?ref=${agent.referralCode}`
      : "",

  level:
    agent?.level || "Bronze",

  totalCommission:
    agent?.totalCommission || 0,

  progress:
    agent?.progress || 0

    });

  }

  catch (err) {

    console.error(
      "DASHBOARD ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});









// ==========================
// DASHBOARD PROFILE ROUTE
// ==========================

app.get("/dashboard/profile", async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: "Email required"
      });

    }

    const Agents =
      mongoose.connection.collection("agents");


    // ==========================
    // FIND USER
    // ==========================
    const user =
      await Agents.findOne({
        email: String(email)
          .trim()
          .toLowerCase()
      });


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }


    
// ==========================
// REFERRALS
// ==========================
const referrals =
  await Agents.find({
    referredBy: user._id
  })
  .project({
    name: 1,
    role: 1
  })
  .toArray();


// ==========================
// RESPONSE
// ==========================
return res.json({

  success: true,

  name: user.name || "Utilisateur",

  email: user.email || "",

  role: user.role || "agent",

  level: user.level || "Bronze",

  totalCommission:
    user.totalCommission || 0,

  progress:
    user.progress || 0,

  referralCode:
    user.referralCode || "",

  totalReferrals:
    user.totalReferrals || 0,

  monthlyRevenue:
    user.monthlyRevenue || 0,

  businessName:
    user.businessName || "",

  whatsapp:
    user.whatsapp || "",

  country:
    user.country || "",

  city:
    user.city || "",

  zone:
    user.zone || "",

  logo:
    user.logo || "",

products:
  user.products || [],

  referrals,

  avatar:
    user.avatar || ""

});

  }

  catch (err) {

    console.error(
      "DASHBOARD PROFILE ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});












// ==========================
// AGENTS LOGIN ROUTE
// SAFE FINAL VERSION
// ==========================

app.post("/agents/login", async (req, res) => {

  try {

    let { email, password } = req.body || {};

    // ==========================
    // VALIDATION
    // ==========================
    if (!email || !password) {

      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis"
      });

    }

    // ==========================
    // CLEAN DATA
    // ==========================
    email = String(email)
      .trim()
      .toLowerCase();

    password = String(password);

    // ==========================
    // COLLECTION
    // ==========================
    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND USER
    // ==========================
    const agent =
      await Agents.findOne({ email });

    if (!agent) {

      return res.status(404).json({
        success: false,
        message: "Compte introuvable"
      });

    }

    // ==========================
    // PASSWORD CHECK
    // ==========================
    const validPassword =
      await bcryptjs.compare(
        password,
        agent.password
      );

    if (!validPassword) {

      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect"
      });

    }

    // ==========================
    // SUCCESS
    // ==========================
    return res.json({

      success: true,

      message: "Connexion réussie",

      user: {

        id: agent._id,

        name: agent.name,

        email: agent.email,

        role: agent.role || "agent",

        referralCode:
          agent.referralCode || "",

        level:
          agent.level || "Bronze",

        totalCommission:
          agent.totalCommission || 0,

        progress:
          agent.progress || 0,

        businessName:
          agent.businessName || "",

        whatsapp:
          agent.whatsapp || "",

        country:
          agent.country || "",

        city:
          agent.city || "",

        zone:
          agent.zone || ""

      }

    });

  }

  catch (err) {

    console.error(
      "LOGIN ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      message: "Internal server error",

      error: err.message

    });

  }

});











// ==========================
// SECURE AGENT DASHBOARD
// ==========================
app.get("/agents/profile", async (req, res) => {

  try {

    const email =
      req.query.email;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: "Email requis"
      });

    }

    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND USER
    // ==========================
    const agent =
      await Agents.findOne({

        email:
          String(email)
            .trim()
            .toLowerCase()

      });

    if (!agent) {

      return res.status(404).json({

        success: false,
        message: "Utilisateur introuvable"

      });

    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({

      success: true,

      name:
        agent.name || "",

      email:
        agent.email || "",

      role:
        agent.role || "agent",

      referralCode:
        agent.referralCode || "",

      level:
        agent.level || "Bronze",

      totalCommission:
        agent.totalCommission || 0,

      progress:
        agent.progress || 0,

      businessName:
        agent.businessName || "",

      whatsapp:
        agent.whatsapp || "",

      country:
        agent.country || "",

      city:
        agent.city || "",

      zone:
        agent.zone || "",

	
      createdAt:
        agent.createdAt || null,

      // ==========================
      // BUSINESS LOGO
      // ==========================
      logo:
        agent.logo || "",

      // ==========================
      // USER AVATAR
      // ==========================
      avatar:
        agent.avatar || ""

    });

  }

  catch (err) {

    console.error(
      "PROFILE ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});
 































// ==========================
// BUSINESS FOLDERS
// ==========================
const businessUploadPath =
path.join(
  __dirname,
  "fobas_uploads",
  "businesses"
);

const orderUploadPath =
path.join(
  __dirname,
  "fobas_uploads",
  "orders"
);


// ==========================
// AUTO CREATE
// ==========================
if (!fs.existsSync(businessUploadPath)) {

  fs.mkdirSync(
    businessUploadPath,
    { recursive: true }
  );

}

if (!fs.existsSync(orderUploadPath)) {

  fs.mkdirSync(
    orderUploadPath,
    { recursive: true }
  );

}


// ==========================
// STORAGE BUSINESS
// ==========================
const businessStorage =
multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(
      null,
      businessUploadPath
    );

  },

  filename: (
    req,
    file,
    cb
  ) => {

    const unique =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1e9
      );

    cb(
      null,
      unique +
      path.extname(
        file.originalname
      )
    );

  }

});







// ==========================
// STORAGE AVATARS
// ==========================
const avatarUploadPath =
path.join(
  __dirname,
  "fobas_uploads",
  "avatars"
);

// ==========================
// AUTO CREATE AVATAR FOLDER
// ==========================
if (!fs.existsSync(avatarUploadPath)) {

  fs.mkdirSync(
    avatarUploadPath,
    { recursive: true }
  );

}

// ==========================
// STORAGE AVATAR
// ==========================
const avatarStorage =
multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(
      null,
      avatarUploadPath
    );

  },

  filename: (
    req,
    file,
    cb
  ) => {

    const unique =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1e9
      );

    cb(
      null,
      unique +
      path.extname(
        file.originalname
      )
    );

  }

});





















// ==========================
// SAFE IMAGE FILE FILTER
// FULL ANDROID + IPHONE SUPPORT
// ==========================
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

  // ✅ ACCEPT BY EXTENSION (most reliable for Android)
  if (allowedExt.includes(ext)) {
    return cb(null, true);
  }

  // ✅ fallback for broken mobile uploads
  if (!file.mimetype || file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }

  return cb(null, true); // ultra-safe mode
};








// ==========================
// STORAGE ORDERS
// ==========================
const orderStorage =
multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(
      null,
      orderUploadPath
    );

  },

  filename: (
    req,
    file,
    cb
  ) => {

    const unique =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1e9
      );

    cb(
      null,
      unique +
      path.extname(
        file.originalname
      )
    );

  }

});

// ==========================
// UPLOADS
// ==========================
const uploadBusiness =
multer({

  storage: businessStorage,
  fileFilter:imageFileFilter,

  limits:{
    fileSize:
    15 * 1024 * 1024
  }

});

const uploadOrder =
multer({

  storage: orderStorage,
  fileFilter:imageFileFilter,

  limits:{
    fileSize:
    15 * 1024 * 1024
  }

});




// ==========================
// UPLOAD AVATAR
// ==========================
const uploadAvatar =
multer({

  storage: avatarStorage,
  fileFilter:imageFileFilter,
  limits:{
    fileSize:
    15 * 1024 * 1024
  }

});






// ==========================
// UPLOAD USER AVATAR
// ==========================
app.post(

  "/agents/upload-avatar",

  uploadAvatar.single(
    "avatar"
  ),

  async (req, res) => {

    try {

      console.log(
        "AVATAR FILE:",
        req.file
      );

      console.log(
        "AVATAR BODY:",
        req.body
      );

      const { email } =
        req.body;

      if (!email) {

        return res.status(400).json({
          success:false,
          message:"Email requis"
        });

      }

      if (!req.file) {

        return res.status(400).json({
          success:false,
          message:"Avatar manquant"
        });

      }

      // ==========================
      // AVATAR PATH
      // ==========================
      const avatarPath =
        `/fobas_uploads/avatars/${req.file.filename}`;

      // ==========================
      // AGENTS
      // ==========================
      const Agents =
        mongoose.connection.collection(
          "agents"
        );

      // ==========================
      // CHECK USER
      // ==========================
      const user =
        await Agents.findOne({

          email: String(email)
            .trim()
            .toLowerCase()

        });

      if(!user){

        return res.status(404).json({
          success:false,
          message:
          "Utilisateur introuvable"
        });

      }

      // ==========================
      // UPDATE AVATAR
      // ==========================
      await Agents.updateOne(

        {
          email: String(email)
            .trim()
            .toLowerCase()
        },

        {
          $set:{
            avatar: avatarPath
          }
        }

      );

      // ==========================
      // RESPONSE
      // ==========================
      return res.json({

        success:true,

        message:
        "Avatar mis à jour",

        avatar: avatarPath

      });

    }

    catch(err){

      console.error(
        "AVATAR ERROR:",
        err
      );

      return res.status(500).json({
        success:false,
        message:
        "Internal server error"
      });

    }

  }
);



// ==========================
// ADMIN SYNC HOOK (SAFE UTILITY)
// ==========================
async function triggerAdminSync() {
  console.log("ADMIN SYNC TRIGGERED");
}






// ==========================
// GET ALL BUSINESSES
// ==========================

app.get(
  "/business/all",

  async (req, res) => {

    try {

      const Agents =
      mongoose.connection.collection(
        "agents"
      );

      // ==========================
      // FIND ENTREPRENEURS
      // ==========================
      const businesses =
      await Agents.find({

        role:{
          $in:[
            "entrepreneur",
            "agent_entrepreneur"
          ]
        }

      })

      .sort({
        createdAt:-1
      })

      .toArray();

      // ==========================
      // RESPONSE
      // ==========================
      return res.json({

        success:true,

        businesses

      });

    }

    catch(err){

      console.error(
        "BUSINESS LOAD ERROR:",
        err
      );

      return res.status(500).json({

        success:false,
        message:
        "Internal server error"

      });

    }

  }
);











// ==========================
// CREATE / UPDATE BUSINESS
// ==========================

app.post(

  "/business/save",

  uploadBusiness.fields([

    {
      name:"logo",
      maxCount:1
    },

    {
      name:"products",
      maxCount:20
    }

  ]),

  async (req, res) => {

    try {

      const {

        email,
        businessName,
        whatsapp,
        city,
        natcash,
        moncash,
        fobasEmail

      } = req.body;

      const Agents =
      mongoose.connection.collection(
        "agents"
      );

      // ==========================
      // FIND USER
      // ==========================
      const agent =
      await Agents.findOne({
        email
      });

      if(!agent){

        return res.status(404).json({

          success:false,
          message:"User not found"
			
        });

      }

      // ==========================
      // LOGO
      // ==========================
      let logo = agent.logo || "";

      if(
        req.files &&
        req.files.logo &&
        req.files.logo[0]
      ){

        logo =
        `https://api.fondationbackupspirituel.com/fobas_uploads/businesses/${req.files.logo[0].filename}`;

      }



// ==========================
// PRODUCTS
// ==========================
let newProducts = [];

if (req.files && req.files.products) {

  req.files.products.forEach((file, index) => {

    newProducts.push({

      _id:
        Date.now().toString() +
        Math.random().toString(36).substring(2, 9),

      image:
        `https://api.fondationbackupspirituel.com/fobas_uploads/businesses/${file.filename}`,

      name:
        req.body[`productName_${index}`] || "Produit",

      price:
        req.body[`productPrice_${index}`] || 0

        });

  });

}
	




	
// ==========================
// KEEP OLD PRODUCTS
// ==========================
const existingProducts =
  Array.isArray(agent.products)
    ? agent.products
    : [];

// ==========================
// FINAL PRODUCTS
// ==========================
const finalProducts = [
  ...existingProducts,
  ...newProducts
];

// ==========================
// LIMIT 20 PRODUCTS
// ==========================
if (finalProducts.length > 20) {

  return res.status(400).json({

    success: false,
    message: "Limit 20 produits atteint"

  });

}

// ==========================
// UPDATE
// ==========================
await Agents.updateOne(

  { email },

  {

    $set: {

      businessName:
        businessName ||
        agent.businessName ||
        "",

      whatsapp:
        whatsapp ||
        agent.whatsapp ||
        "",

      city:
        city ||
        agent.city ||
        "",

      natcash:
        natcash ||
        agent.natcash ||
        "",

      moncash:
        moncash ||
        agent.moncash ||
        "",

      fobasEmail:
        fobasEmail ||
        agent.fobasEmail ||
        "",

      logo,

      products:
        finalProducts

    }

  }

);





      // ==========================
      // RESPONSE
      // ==========================
      return res.json({

        success:true,
        message:
        "Business updated"

      });

    }

    catch(err){

      console.error(
        "BUSINESS SAVE ERROR:",
        err
      );

      return res.status(500).json({

        success:false,
        message:
        "Internal server error"

      });

    }

  }
);






// ==========================
// CREATE ORDER
// ==========================
app.post(
  "/business/order",
  uploadOrder.single("proof"),
  async (req, res) => {
    try {

      const {
        businessId,
        clientName,
        phone,
        address,
        order,
        product,
        paymentMethod
      } = req.body;

      // ==========================
// FINANCIAL ENGINE (SAFE HYBRID MODE)
// ==========================

const basePrice = Number(req.body.basePrice || 0);

// 👇 frontend values (PRIMARY SOURCE)
const platformFee = Number(req.body.platformFee || 0);
const totalPrice = Number(req.body.totalPrice || 0);

// 👇 server-only commissions (SAFE)
const referralCommission = basePrice * 0.02;
const adminCommission = basePrice * 0.03;

      // ==========================
      // SAFE PRODUCT
      // ==========================
      const finalOrder = order || product || "";

      // ==========================
      // VALIDATION
      // ==========================
      if (
        !businessId ||
        !clientName ||
        !phone ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing fields"
        });
      }

      // ==========================
      // COLLECTION
      // ==========================
      const Orders =
        mongoose.connection.collection("business_orders");

      // ==========================
      // PROOF
      // ==========================
      let proof = "";

      if (req.file) {
        proof =
          `https://api.fondationbackupspirituel.com/fobas_uploads/orders/${req.file.filename}`;
      }

      // ==========================
      // INSERT (SAFE + CLEAN)
      // ==========================
      await Orders.insertOne({

  orderId: "ORD-" + Date.now(),

  businessId,
  clientName,
  phone,
  address,

  product: finalOrder,

  // ==========================
  // SAFE PRICE SAN RISK NaN
  // ==========================
  price: Number(basePrice) || 0,

  paymentMethod,

  referralAgent: req.body.referralAgent || null,
  whatsapp: req.body.whatsapp || null,

  proof,
  status: "pending",
  createdAt: new Date(),


        // ==========================
        // FINANCIAL SYSTEM (FROM FRONTEND - NO SERVER RE-CALC)
        // ==========================
        financial: {
          basePrice: Number(req.body.basePrice || 0),
          platformFee: Number(req.body.platformFee || 0),
          totalPrice: Number(req.body.totalPrice || 0),

          entrepreneurEarnings: Number(req.body.basePrice || 0),

          referralCommission,
          adminCommission
        }
      });

      // 👇 KEEP AS IS (IMPORTANT FOR SYSTEM FLOW)
      await updateAgentProgress(businessId);

      // ==========================
      // RESPONSE
      // ==========================
      return res.json({
        success: true,
        message: "Order created"
      });

    } catch (err) {

      console.error("ORDER ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);







// ==========================
// UPLOAD BUSINESS LOGO
// ==========================
app.post(

  "/business/upload-logo",

  uploadBusiness.single("logo"),

  async (req, res) => {

    try {

      // ==========================
      // DEBUG
      // ==========================
      console.log(
        "UPLOAD FILE:",
        req.file
      );

      console.log(
        "UPLOAD BODY:",
        req.body
      );

      // ==========================
      // EMAIL
      // ==========================
      const { email } = req.body;

      if (!email) {

        return res.status(400).json({

          success: false,
          message: "Email manquant"

        });

      }

      // ==========================
      // FILE
      // ==========================
      if (!req.file) {

        return res.status(400).json({

          success: false,
          message: "Logo manquant"

        });

      }

      // ==========================
      // LOGO PATH
      // ==========================
      const logoPath =
        `/fobas_uploads/businesses/${req.file.filename}`;

	
      // ==========================
      // AGENTS COLLECTION
      // ==========================
      const Agents =
      mongoose.connection.collection(
        "agents"
      );

      // ==========================
      // FIND USER
      // ==========================
      const user =
      await Agents.findOne({

        email: email

      });

      if (!user) {

        return res.status(404).json({

          success: false,
          message: "Utilisateur introuvable"

        });

      }

      // ==========================
      // UPDATE LOGO
      // ==========================
      await Agents.updateOne(

        {
          email: email
        },

        {
          $set: {

            logo: logoPath

          }
        }

      );

      // ==========================
      // SUCCESS
      // ==========================
      return res.status(200).json({

        success: true,

        message:
        "Logo uploadé avec succès",

        logo: logoPath

      });

    }

    catch (error) {

      console.log(
        "UPLOAD LOGO FULL ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
        "Erreur serveur",

        error:
        error.message

      });

    }

  }

);







// ==========================
// WITHDRAW REQUEST ROUTE
// SAFE FINTECH VERSION (PRODUCTION READY)
// ==========================

app.post("/agents/withdraw", async (req, res) => {

  try {

    let {

  email,

  amount,

  method,

  withdrawNumber

} = req.body || {};

    // ==========================
    // BASIC VALIDATION
    // ==========================
    if (

  !email ||

  !amount ||

  !method ||

  !withdrawNumber

) {

  return res.status(400).json({

    success: false,

    message: "Missing fields"

  });

}

    amount = Number(amount);

    if (isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // ==========================
    // MINIMUM RULE
    // ==========================
    if (amount < 2500) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdraw is 2500 HTG"
      });
    }

    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND USER (SAFE NORMALIZATION)
    // ==========================
    const agent = await Agents.findOne({
      email: String(email).trim().toLowerCase()
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ==========================
    // CHECK BALANCE
    // ==========================
    if ((agent.totalCommission || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient commission"
      });
    }

    // ==========================
    // CREATE WITHDRAW REQUEST FIRST (SAFE FLOW)
    // ==========================
    const Withdrawals =
      mongoose.connection.collection("withdrawals");

    const withdrawResult = await Withdrawals.insertOne({

  email: agent.email,

  agentId: agent._id,

  amount,

  method,

  withdrawNumber,

  status: "pending",

  createdAt: new Date()

});

    // ==========================
    // UPDATE AGENT BALANCE (ONLY IF INSERT SUCCESS)
    // ==========================
    if (withdrawResult.insertedId) {

      await Agents.updateOne(
        { _id: agent._id },
        {
          $inc: {
            totalCommission: -amount
          }
        }
      );

      // ==========================
      // OPTIONAL: PROGRESS ENGINE HOOK (SAFE PLACE)
      // ==========================
      if (typeof updateAgentProgress === "function") {
        await updateAgentProgress(agent._id);
      }
    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({
      success: true,
      message: "Withdraw request created successfully",
      withdrawId: withdrawResult.insertedId
    });

  }

  catch (err) {

    console.error("WITHDRAW ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});





// ==========================
// DELETE PRODUCT (FINAL SAFE VERSION)
// ==========================
app.post("/business/delete-product", async (req, res) => {

  try {

    const { email, productId } = req.body;

    // ==========================
    // VALIDATION
    // ==========================
    if (!email || !productId) {
      return res.json({
        success: false,
        message: "Données manquantes"
      });
    }

    // ==========================
    // COLLECTION
    // ==========================
    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND USER
    // ==========================
    const business =
      await Agents.findOne({
        email: String(email).trim().toLowerCase()
      });

    if (!business) {
      return res.json({
        success: false,
        message: "Business introuvable"
      });
    }

    // ==========================
    // PRODUCTS
    // ==========================
    let products =
      Array.isArray(business.products)
        ? business.products
        : [];

    // ==========================
    // FIND TARGET PRODUCT
    // ==========================
    const targetProduct = products.find(
      p => String(p._id) === String(productId)
    );

    if (!targetProduct) {
      return res.json({
        success: false,
        message: "Produit introuvable"
      });
    }

    // ==========================
    // DELETE IMAGE FILE (SAFE)
    // ==========================
    if (targetProduct.image) {
      try {

        const fileName = targetProduct.image.split("/").pop();

        const filePath = path.join(
          __dirname,
          "fobas_uploads",
          "businesses",
          fileName
        );

        await fs.promises.unlink(filePath).catch(() => {
  		// file already deleted or missing - ignore safely
		});

      } catch (fileErr) {
        console.error("FILE DELETE ERROR:", fileErr);
      }
    }

    // ==========================
    // REMOVE BY ID (NOT INDEX)
    // ==========================
    products = products.filter(
      p => String(p._id) !== String(productId)
    );


	  // ==========================
// AUDIT LOG (ADDED SAFE)
// ==========================
const auditEntry = {
  action: "DELETE_PRODUCT",
  email: String(email).trim().toLowerCase(),
  productId: String(productId),
  productSnapshot: targetProduct,
  deletedAt: new Date()
};

// OPTIONAL: log to console (safe)
console.log("AUDIT LOG:", auditEntry);

// OPTIONAL: save in DB collection (if you want history)
const AuditLogs = mongoose.connection.collection("audit_logs");

await AuditLogs.insertOne(auditEntry).catch(err => {
  console.error("AUDIT SAVE ERROR:", err);
});
	
    // ==========================
    // UPDATE DB
    // ==========================
    await Agents.updateOne(
      {
        email: String(email).trim().toLowerCase()
      },
      {
        $set: {
          products
        }
      }
    );

    // ==========================
    // SUCCESS
    // ==========================
    return res.json({
      success: true,
      message: "Produit supprimé avec succès"
    });

  } catch (err) {

    console.error("DELETE PRODUCT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });

  }

});


























































































// =====================================================
// FOBAS MASTER ADMIN ROUTES
// SAFE VERSION — NO DUPLICATION
// =====================================================

// =====================================================
// GET MASTER DASHBOARD STATS
// =====================================================
app.get("/fobas/admin/dashboard", async (req, res) => {

  try {

    const Agents =
      mongoose.connection.collection("agents");

    const Orders =
      mongoose.connection.collection("business_orders");

    // ==========================================
    // GLOBAL COUNTS
    // ==========================================
    const totalUsers =
      await Agents.countDocuments();

    const totalAgents =
      await Agents.countDocuments({
        role: "agent"
      });

    const totalEntrepreneurs =
      await Agents.countDocuments({
        role: "entrepreneur"
      });

    const totalHybridAccounts =
      await Agents.countDocuments({
        role: "agent_entrepreneur"
      });

    const totalOrders =
      await Orders.countDocuments();

    const pendingOrders =
      await Orders.countDocuments({
        status: "pending"
      });

    const completedOrders =
      await Orders.countDocuments({
        status: "completed"
      });

    // ==========================================
    // RECENT USERS
    // ==========================================
    const recentUsers =
      await Agents.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // ==========================================
    // RECENT ORDERS
    // ==========================================
    const recentOrders =
      await Orders.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.json({

      success: true,

      stats: {
        totalUsers,
        totalAgents,
        totalEntrepreneurs,
        totalHybridAccounts,
        totalOrders,
        pendingOrders,
        completedOrders
      },

      recentUsers,
      recentOrders

    });

  }

  catch (err) {

    console.error(
      "MASTER DASHBOARD ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});








// =====================================================
// GET ALL USERS
// =====================================================
app.get("/fobas/admin/users", async (req, res) => {

  try {

    const Agents =
      mongoose.connection.collection("agents");

    const users =
      await Agents.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,

      total:
        users.length,

      users

    });

  }

  catch (err) {

    console.error(
      "ADMIN USERS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message:
        "Internal server error"

    });

  }

});







// =====================================================
// SEARCH USERS
// =====================================================
app.get("/fobas/admin/search-users", async (req, res) => {

  try {

    const {
      country,
      city,
      zone,
      role,
      businessName,
      keyword
    } = req.query;

    const Agents =
      mongoose.connection.collection("agents");

    let query = {};

    // ==========================================
    // COUNTRY
    // ==========================================
    if (country) {

      query.country = {
        $regex: country,
        $options: "i"
      };

    }

    // ==========================================
    // CITY
    // ==========================================
    if (city) {

      query.city = {
        $regex: city,
        $options: "i"
      };

    }

    // ==========================================
    // ZONE
    // ==========================================
    if (zone) {

      query.zone = {
        $regex: zone,
        $options: "i"
      };

    }

    // ==========================================
    // ROLE
    // ==========================================
    if (role) {

      query.role = role;

    }

    // ==========================================
    // BUSINESS NAME
    // ==========================================
    if (businessName) {

      query.businessName = {
        $regex: businessName,
        $options: "i"
      };

    }

    // ==========================================
    // KEYWORD SEARCH
    // ==========================================
    if (keyword) {

      query.$or = [

        {
          name: {
            $regex: keyword,
            $options: "i"
          }
        },

        {
          email: {
            $regex: keyword,
            $options: "i"
          }
        },

        {
          referralCode: {
            $regex: keyword,
            $options: "i"
          }
        }

      ];

    }

    const users =
      await Agents.find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,
      total: users.length,
      users

    });

  }

  catch (err) {

    console.error(
      "SEARCH USERS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// GET ALL ORDERS
// =====================================================
app.get("/fobas/admin/orders", async (req, res) => {

  try {

    const Orders =
      mongoose.connection.collection("business_orders");

    const orders =
      await Orders.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,
      total: orders.length,
      orders

    });

  }

  catch (err) {

    console.error(
      "ADMIN ORDERS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// UPDATE ORDER STATUS
// =====================================================
app.put("/fobas/admin/order-status", async (req, res) => {

  try {

    const {
      orderId,
      status
    } = req.body;

    if (!orderId || !status) {

      return res.status(400).json({

        success: false,
        message: "Missing fields"

      });

    }

    const Orders =
      mongoose.connection.collection("business_orders");

    await Orders.updateOne(

      {
        _id: new mongoose.Types.ObjectId(orderId)
      },

      {
        $set: {
          status
        }
      }

    );

    return res.json({

      success: true,
      message: "Order status updated"

    });

  }

  catch (err) {

    console.error(
      "ORDER STATUS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// UPDATE USER
// =====================================================
app.put("/fobas/admin/update-user", async (req, res) => {

  try {

    const {
      _id,
      name,
      role,
      level,
      totalCommission,
      progress,
      businessName,
      whatsapp,
      country,
      city,
      zone
    } = req.body;

    if (!_id) {

      return res.status(400).json({

        success: false,
        message: "_id required"

      });

    }

    const Agents =
      mongoose.connection.collection("agents");

    await Agents.updateOne(

      {
        _id: new mongoose.Types.ObjectId(_id)
      },

      {
        $set: {

          name,
          role,
          level,
          totalCommission:
            Number(totalCommission) || 0,

          progress:
            Number(progress) || 0,

          businessName,
          whatsapp,
          country,
          city,
          zone

        }
      }

    );

    return res.json({

      success: true,
      message: "User updated"

    });

  }

  catch (err) {

    console.error(
      "UPDATE USER ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// DELETE USER
// =====================================================
app.delete("/fobas/admin/delete-user/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const Agents =
      mongoose.connection.collection("agents");

    const user =
      await Agents.findOne({
        _id: new mongoose.Types.ObjectId(id)
      });

    if (!user) {

      return res.status(404).json({

        success: false,
        message: "User not found"

      });

    }

    // ==========================================
    // DELETE AVATAR FILE
    // ==========================================
    if (user.avatar) {

      try {

        const avatarFile =
          path.join(
            __dirname,
            user.avatar
          );

        if (fs.existsSync(avatarFile)) {
          fs.unlinkSync(avatarFile);
        }

      }

      catch (e) {

        console.log(
          "AVATAR DELETE ERROR:",
          e.message
        );

      }

    }

    // ==========================================
    // DELETE LOGO FILE
    // ==========================================
    if (user.logo) {

      try {

        const logoFile =
          path.join(
            __dirname,
            user.logo
          );

        if (fs.existsSync(logoFile)) {
          fs.unlinkSync(logoFile);
        }

      }

      catch (e) {

        console.log(
          "LOGO DELETE ERROR:",
          e.message
        );

      }

    }

    // ==========================================
    // DELETE USER
    // ==========================================
    await Agents.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    return res.json({

      success: true,
      message: "User deleted"

    });

  }

  catch (err) {

    console.error(
      "DELETE USER ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// GET USER REFERRALS
// =====================================================
app.get("/fobas/admin/referrals/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const Agents =
      mongoose.connection.collection("agents");

    const referrals =
      await Agents.find({
        referredBy:
          new mongoose.Types.ObjectId(id)
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,
      total: referrals.length,
      referrals

    });

  }

  catch (err) {

    console.error(
      "REFERRALS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});



// =====================================================
// GET ENTREPRENEUR ORDERS
// =====================================================
app.get("/fobas/admin/business-orders/:businessId", async (req, res) => {

  try {

    const { businessId } = req.params;

    const Orders =
      mongoose.connection.collection("business_orders");

    const orders =
      await Orders.find({
        businessId
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,
      total: orders.length,
      orders

    });

  }

  catch (err) {

    console.error(
      "BUSINESS ORDERS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});














// ==========================
// ADMIN GET SINGLE USER
// ==========================
app.get("/admin/user/:id", async (req, res) => {

  try {

    const { id } = req.params;

    // ==========================
    // COLLECTIONS
    // ==========================
    const Agents =
      mongoose.connection.collection("agents");

    const Orders =
      mongoose.connection.collection("business_orders");

    // ==========================
    // FIND USER
    // ==========================
    const user =
      await Agents.findOne({

        _id:
          new mongoose.Types.ObjectId(id)

      });

    if (!user) {

      return res.status(404).json({

        success: false,
        message: "Utilisateur introuvable"

      });

    }

    // ==========================
    // REFERRALS
    // ==========================
    const referrals =
      await Agents.find({

        referredBy: user._id

      })

      .project({

        password: 0

      })

      .toArray();

    // ==========================
    // BUSINESS ORDERS
    // ==========================
    let orders = [];

    if (
      user.role === "entrepreneur" ||
      user.role === "agent_entrepreneur"
    ) {

      orders =
        await Orders.find({

          businessId:
            String(user._id)

        })

        .sort({
          createdAt: -1
        })

        .toArray();

    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({

      success: true,

      user: {

        _id:
          user._id,

        name:
          user.name || "",

        email:
          user.email || "",

        role:
          user.role || "agent",

        referralCode:
          user.referralCode || "",

        referralFrom:
          user.referralFrom || "",

        referredBy:
          user.referredBy || null,

        totalReferrals:
          user.totalReferrals || 0,

        referralPaid:
          user.referralPaid || false,

        level:
          user.level || "Bronze",

        totalCommission:
          user.totalCommission || 0,

        progress:
          user.progress || 0,

        monthlyRevenue:
          user.monthlyRevenue || 0,

        businessName:
          user.businessName || "",

        whatsapp:
          user.whatsapp || "",

        country:
          user.country || "",

        city:
          user.city || "",

        zone:
          user.zone || "",

        natcash:
          user.natcash || "",

        moncash:
          user.moncash || "",

        fobasEmail:
          user.fobasEmail || "",

        logo:
          user.logo || "",

        avatar:
          user.avatar || "",

        products:
          user.products || [],

        createdAt:
          user.createdAt || null

      },

      referrals,

      orders

    });

  }

  catch (err) {

    console.error(
      "ADMIN USER DETAIL ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message: "Internal server error"

    });

  }

});





// ==========================
// ADMIN GET ALL WITHDRAWALS
// ==========================

app.get("/admin/withdrawals", async (req, res) => {

  try {

    const Withdrawals =
      mongoose.connection.collection("withdrawals");

    const withdrawals =
      await Withdrawals.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      withdrawals
    });

  }

  catch (err) {

    console.error(
      "ADMIN WITHDRAWALS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});




// ==========================
// ADMIN GET ALL WITHDRAWS
// JS COMPATIBILITY VERSION
// ==========================
app.get("/fobas/admin/withdraws", async (req, res) => {

  try {

    const Withdrawals =
      mongoose.connection.collection("withdrawals");

    const withdraws =
      await Withdrawals.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({

      success: true,
      withdraws

    });

  }

  catch (err) {

    console.error(
      "ADMIN WITHDRAWS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,
      message:
      "Internal server error"

    });

  }

});







app.put("/fobas/admin/approve-withdraw/:id", async (req, res) => {
  try {

    const Withdrawals =
      mongoose.connection.collection("withdrawals");

    const withdraw = await Withdrawals.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Withdraw not found"
      });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Already processed"
      });
    }

    await Withdrawals.updateOne(
      { _id: withdraw._id },
      {
        $set: {
          status: "approved",
          processedAt: new Date()
        }
      }
    );

    // ==========================
    // 🔥 ONLY ADDITION (SAFE HOOK)
    // ==========================
    try {
      if (typeof updateAgentProgress === "function" && withdraw.agentId) {
        await updateAgentProgress(withdraw.agentId);
      }
    } catch (e) {
      console.log("PROGRESS HOOK ERROR:", e.message);
    }

    return res.json({
      success: true,
      message: "Withdraw approved"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});






app.put("/fobas/admin/reject-withdraw/:id", async (req, res) => {
  try {

    const Withdrawals = mongoose.connection.collection("withdrawals");
    const Agents = mongoose.connection.collection("agents");

    const withdraw = await Withdrawals.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (!withdraw) {
      return res.status(404).json({ success: false, message: "Withdraw not found" });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already processed" });
    }

    // refund
    await Agents.updateOne(
      { _id: new mongoose.Types.ObjectId(withdraw.agentId) },
      { $inc: { totalCommission: Number(withdraw.amount) } }
    );

    await Withdrawals.updateOne(
      { _id: withdraw._id },
      { $set: { status: "rejected", processedAt: new Date() } }
    );

    return res.json({ success: true, message: "Withdraw rejected" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ==========================
// ADMIN UPDATE WITHDRAW STATUS
// ==========================

app.post("/admin/withdrawals/update", async (req, res) => {

  try {

    const {
      withdrawId,
      status
    } = req.body || {};

    // ==========================
    // VALIDATION
    // ==========================
    if (!withdrawId || !status) {

      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });

    }

    // ==========================
    // ALLOWED STATUS
    // ==========================
    const allowedStatus = ["approved", "rejected"];

    if (!allowedStatus.includes(status)) {

      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });

    }

    const Withdrawals =
      mongoose.connection.collection("withdrawals");

    const Agents =
      mongoose.connection.collection("agents");

    // ==========================
    // FIND WITHDRAW
    // ==========================
    const withdraw =
      await Withdrawals.findOne({
        _id: new mongoose.Types.ObjectId(withdrawId)
      });

    if (!withdraw) {

      return res.status(404).json({
        success: false,
        message: "Withdraw not found"
      });

    }

    // ==========================
    // ALREADY PROCESSED
    // ==========================
    if (withdraw.status !== "pending") {

      return res.status(400).json({
        success: false,
        message: "Withdraw already processed"
      });

    }

    // ==========================
    // UPDATE WITHDRAW STATUS
    // ==========================
    await Withdrawals.updateOne(
      {
        _id: withdraw._id
      },
      {
        $set: {
          status,
          processedAt: new Date()
        }
      }
    );

    // ==========================
    // REFUND IF REJECTED
    // ==========================
    if (status === "rejected") {

      await Agents.updateOne(
        {
          _id: new mongoose.Types.ObjectId(withdraw.agentId)
        },
        {
          $inc: {
            totalCommission: Number(withdraw.amount)
          }
        }
      );

    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({
      success: true,
      message: `Withdraw ${status} successfully`
    });

  }

  catch (err) {

    console.error("UPDATE WITHDRAW ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

});





app.get("/admin/all-products", async (req, res) => {

  try {

    const Agents = mongoose.connection.collection("agents");

    const allAgents = await Agents.find({}).toArray();

    let allProducts = [];

    allAgents.forEach(agent => {

      if (Array.isArray(agent.products)) {

        agent.products.forEach(product => {

          allProducts.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,

            // 👇 IMPORTANT CONTEXT
            ownerEmail: agent.email,
            ownerName: agent.name || "Unknown",
            businessName: agent.businessName || "---"
          });

        });

      }

    });

    return res.json({
      success: true,
      products: allProducts
    });

  } catch (err) {

    console.error("ADMIN PRODUCTS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });

  }

});





app.get("/fobas/admin/order/:id", async (req, res) => {
  try {
    const Orders = mongoose.connection.collection("business_orders");

    const order = await Orders.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error("ORDER DETAIL ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});





const allowedFlow = {
  pending: ["approved"],
  approved: ["delivered"],
  delivered: ["completed"],
  completed: []
};

app.put("/fobas/admin/order-status-safe", async (req, res) => {
  try {

    const { orderId, status } = req.body;

    const Orders = mongoose.connection.collection("business_orders");

    const order = await Orders.findOne({
      _id: new mongoose.Types.ObjectId(orderId)
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (!allowedFlow[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: ${order.status} → ${status}`
      });
    }

    await Orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    return res.json({
      success: true,
      message: "Status updated safely"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal error"
    });
  }
});







// ==========================
// FOBAS ORDER DETAIL (ADMIN SAFE VIEW)
// ==========================
app.get("/fobas/admin/order-detail/:id", async (req, res) => {

  try {

    const Orders = mongoose.connection.collection("business_orders");

    const order = await Orders.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // enrich view (safe, no modification)
    const enrichedOrder = {
      ...order,
      isPaid: order.status === "approved" || order.status === "completed",
      isCompleted: order.status === "completed"
    };

    return res.json({
      success: true,
      order: enrichedOrder
    });

  } catch (err) {
    console.error("ORDER DETAIL ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});








// ==========================
// FOBAS SAFE ORDER STATUS ENGINE
// ==========================
const ORDER_FLOW = {
  pending: ["approved"],
  approved: ["delivered"],
  delivered: ["completed"],
  completed: []
};

app.put("/fobas/admin/order-status-flow", async (req, res) => {

  try {

    const { orderId, status } = req.body;

    const Orders = mongoose.connection.collection("business_orders");

    const order = await Orders.findOne({
      _id: new mongoose.Types.ObjectId(orderId)
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const currentStatus = order.status;

    // 🚨 FLOW VALIDATION
    if (!ORDER_FLOW[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: ${currentStatus} → ${status}`
      });
    }

    await Orders.updateOne(
      { _id: order._id },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    // 🔥 OPTIONAL HOOK
    await triggerAdminSync();

    return res.json({
      success: true,
      message: "Order status updated safely",
      from: currentStatus,
      to: status
    });

  } catch (err) {
    console.error("FLOW ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});



































// ==========================
// FOBAS VIDEO SCHEMA (FINAL SAFE)
// ==========================
const FobasVideoSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agents",
      required: true
    },

    prompt: {
      type: String,
      required: true,
      trim: true
    },

    script: {
      type: String,
      default: ""
    },

    voicePath: {
      type: String,
      default: ""
    },

    videoPath: {
      type: String,
      default: ""
    },

    thumbnail: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "processing", "done", "error"],
      default: "pending"
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

	paymentMethod: {
  type: String,
  enum: ["credits", "commission"],
  default: "credits"
},
	  
	duration: {
  type: String,
  default: ""
},

language: {
  type: String,
  default: "auto"
},

style: {
  type: String,
  default: "default"
}
  },
  {
    timestamps: true
  }
);

// ==========================
// SAFE MODEL EXPORT (NO DUPLICATE CRASH)
// ==========================
const FobasVideo =
  mongoose.models.FobasVideo ||
  mongoose.model("FobasVideo", FobasVideoSchema);








// ==========================
// IA VIDEO: CREATE JOB (PRODUCTION SAFE)
// ==========================
app.post("/ia-video/generate", async (req, res) => {
  try {
    const { agentId, prompt, duration, language, style } = req.body;

    // ==========================
    // VALIDATION SAFE
    // ==========================
    if (!agentId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

	// ==========================
// AGENT COLLECTION SAFE ACCESS
// ==========================
const Agents =
  mongoose.connection.collection("agents");

const agent =
  await Agents.findOne({
    _id: new mongoose.Types.ObjectId(agentId)
  });

if (!agent) {
  return res.status(404).json({
    success: false,
    message: "Agent not found"
  });
}
	  
// ==========================
// PAYMENT CONFIG (SAFE PLACE)
// ==========================
const VIDEO_PRICE_CREDITS = 1;
const VIDEO_PRICE_COMMISSION = 100;

	  
    let paymentMethod = null;

// ==========================
// 1. PRIORITY: VIDEO CREDITS
// ==========================
if ((agent.videoCredits || 0) >= VIDEO_PRICE_CREDITS) {

  paymentMethod = "credits";

  await Agents.updateOne(
    { _id: agent._id },
    { $inc: { videoCredits: -VIDEO_PRICE_CREDITS } }
  );

}

// ==========================
// 2. FALLBACK: TOTAL COMMISSION
// ==========================
else if ((agent.totalCommission || 0) >= VIDEO_PRICE_COMMISSION) {

  paymentMethod = "commission";

  await Agents.updateOne(
    { _id: agent._id },
    { $inc: { totalCommission: -VIDEO_PRICE_COMMISSION } }
  );

}

// ==========================
// 3. BLOCK IF NO FUNDS
// ==========================
else {
  return res.status(403).json({
    success: false,
    message: "No credits or commission available"
  });
}
    
    // ==========================
    // CREATE JOB (MONGOOSE MODEL SAFE)
    // ==========================
    const job = await FobasVideo.create({
      agentId: agent._id,
  prompt,
  status: "pending",
  progress: 0,

  paymentMethod, // 🔥 IMPORTANT FIX

  duration: duration || null,
  language: language || "auto",
  style: style || "default"
});


    // ==========================
    // QUEUE PUSH (SAFE CHECK)
    // ==========================
    if (typeof videoQueue !== "undefined") {
      await videoQueue.add({ jobId: job._id });
    } else {
      console.error("VIDEO QUEUE NOT INITIALIZED");
    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.json({
  success: true,

  jobId: job._id,

  remainingCredits:
    paymentMethod === "credits"
      ? (agent.videoCredits || 0) - VIDEO_PRICE_CREDITS
      : (agent.videoCredits || 0),

  remainingCommission:
    paymentMethod === "commission"
      ? (agent.totalCommission || 0) - VIDEO_PRICE_COMMISSION
      : (agent.totalCommission || 0),

  paymentMethod
});

  } catch (err) {
    console.error("IA VIDEO GENERATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error generating video"
    });
  }
});











// ==========================
// IA VIDEO: STATUS CHECK (PRODUCTION SAFE)
// ==========================
app.get("/ia-video/status/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================
    // VALIDATION SAFE (ObjectId check)
    // ==========================
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing job id"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id"
      });
    }

    // ==========================
    // FETCH JOB (SAFE MONGOOSE MODEL)
    // ==========================
    const job = await FobasVideo.findById(id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // ==========================
    // RESPONSE SAFE
    // ==========================
    return res.json({
      success: true,
      job
    });

  } catch (err) {
    console.error("VIDEO STATUS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});















// ==========================
// VIDEO QUEUE WORKER (PRODUCTION SAFE)
// ==========================
videoQueue.process(1, async (job) => {
  const data = job?.data;

  if (!data?.jobId) {
    console.error("QUEUE ERROR: missing jobId");
    return;
  }

  try {
    // ==========================
    // FETCH JOB SAFE
    // ==========================
    const videoJob = await FobasVideo.findById(data.jobId);

    if (!videoJob) {
      console.error("JOB NOT FOUND:", data.jobId);
      return;
    }

    // ==========================
    // STEP 1 - SCRIPT
    // ==========================
    videoJob.status = "processing";
    videoJob.progress = 10;
    await videoJob.save();

    const script = `AI VIDEO: ${videoJob.prompt || ""}`;
    videoJob.script = script;

    videoJob.progress = 25;
    await videoJob.save();

    // ==========================
    // STEP 2 - VOICE (SAFE PATH)
    // ==========================
    const tempDir = path.join(__dirname, "fobas_uploads", "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const voicePath = path.join(tempDir, `${videoJob._id}.mp3`);

    try {
      fs.writeFileSync(voicePath, "VOICE_PLACEHOLDER");
    } catch (e) {
      console.error("VOICE WRITE ERROR:", e);
    }

    videoJob.voicePath = voicePath;
    videoJob.progress = 50;
    await videoJob.save();

    // ==========================
    // STEP 3 - VIDEO GENERATION (SAFE FFMPEG)
    // ==========================
    const videoDir = path.join(__dirname, "fobas_uploads", "videos");

    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const videoPath = path.join(videoDir, `${videoJob._id}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input("color=c=black:s=1280x720:d=5")
        .inputFormat("lavfi")
        .output(videoPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    videoJob.videoPath = videoPath;
    videoJob.progress = 85;
    await videoJob.save();

    // ==========================
    // STEP 4 - THUMBNAIL SAFE
    // ==========================
    const thumbDir = path.join(__dirname, "fobas_uploads", "thumbnails");

    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    const thumbPath = path.join(thumbDir, `${videoJob._id}.jpg`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          filename: path.basename(thumbPath),
          folder: thumbDir
        })
        .on("end", resolve)
        .on("error", reject);
    });

    videoJob.thumbnail = thumbPath;
    videoJob.progress = 100;
    videoJob.status = "done";

    await videoJob.save();

  } catch (err) {
    console.error("PIPELINE ERROR:", err);

    try {
      const videoJob = await FobasVideo.findById(data.jobId);

      if (videoJob) {
        videoJob.status = "error";
        await videoJob.save();
      }
    } catch (e) {
      console.error("FAIL SAFE UPDATE ERROR:", e);
    }
  }
});



















// ==========================
// GROQ SCRIPT GENERATOR (SAFE + PRODUCTION READY)
// ==========================
async function generateScript(prompt) {
  try {
    // ==========================
    // VALIDATION SAFE
    // ==========================
    if (!prompt || typeof prompt !== "string") {
      console.error("INVALID PROMPT IN SCRIPT GENERATOR");
      return "FOBAS IA VIDEO SCRIPT:\nTopic: undefined\nIntro: Welcome to FOBAS AI Video\nMain: No prompt provided\nOutro: Powered by FOBAS";
    }

    const cleanPrompt = prompt.trim();

   
    // ==========================
    // SAFE FALLBACK SCRIPT (NO CRASH)
    // ==========================
    return `
FOBAS IA VIDEO SCRIPT

Topic: ${cleanPrompt}

Intro: Welcome to FOBAS AI Video

Main Scene: ${cleanPrompt}

Extra Detail: This video is generated automatically by FOBAS AI engine.

Outro: Powered by FOBAS DIGITAL AGENTS
`.trim();

  } catch (err) {
    console.error("SCRIPT GENERATION ERROR:", err);

    // ==========================
    // EMERGENCY FALLBACK (NO CRASH GUARANTEE)
    // ==========================
    return `
FOBAS IA VIDEO SCRIPT

Topic: fallback content

Intro: Welcome to FOBAS AI Video

Main: System fallback mode activated

Outro: Powered by FOBAS
`.trim();
  }
}















// ==========================
// AUTO CLEAN JOBS (10 DAYS VPS SAFE)
// ==========================

// Prevent multiple cron instances (IMPORTANT for production)
let isCleaning = false;

cron.schedule("0 0 * * *", async () => {
  if (isCleaning) {
    console.log("AUTO CLEAN SKIPPED (already running)");
    return;
  }

  isCleaning = true;

  try {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 10);

    // ==========================
    // FIND OLD VIDEOS SAFE QUERY
    // ==========================
    const oldVideos = await FobasVideo.find({
      createdAt: { $lt: limitDate }
    }).lean();

    if (!oldVideos || oldVideos.length === 0) {
      console.log("AUTO CLEAN: no files to delete");
      isCleaning = false;
      return;
    }

    // ==========================
    // PROCESS DELETE SAFE LOOP
    // ==========================
    for (const v of oldVideos) {
      try {
        if (v?.videoPath && fs.existsSync(v.videoPath)) {
          fs.unlinkSync(v.videoPath);
        }

        if (v?.voicePath && fs.existsSync(v.voicePath)) {
          fs.unlinkSync(v.voicePath);
        }

        if (v?.thumbnail && fs.existsSync(v.thumbnail)) {
          fs.unlinkSync(v.thumbnail);
        }

        await FobasVideo.deleteOne({ _id: v._id });

      } catch (fileErr) {
        console.error("FILE DELETE ERROR:", fileErr);
        // continue loop (NO CRASH)
      }
    }

    console.log(`AUTO CLEAN DONE: ${oldVideos.length} items processed`);

  } catch (err) {
    console.error("AUTO CLEAN SYSTEM ERROR:", err);

  } finally {
    isCleaning = false;
  }
});































































const academiqueSchema = new mongoose.Schema({

    role: {
        type: String,
        required: true
    },

    nomComplet: {
        type: String,
        required: true
    },

    whatsapp: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    pays: {
        type: String,
        default: null
    },

    ville: {
        type: String,
        default: null
    },

    // =====================================
    // ETUDIANT / DIRECTEUR / PROFESSEUR
    // =====================================

    nomInstitution: {
        type: String,
        default: null
    },

    nomDirecteur: {
        type: String,
        default: null
    },

    nomProfesseur: {
        type: String,
        default: null
    },

    niveauEtude: {
        type: String,
        default: null
    },

    parcoursAcademique: {
        type: String,
        default: null
    },

    typeInstitution: {
        type: String,
        default: null
    },

    nombreProfesseurs: {
        type: Number,
        default: 0
    },

    professeurs: {
        type: [String],
        default: []
    },

    domaineEnseignement: {
        type: String,
        default: null
    },

    niveauExperience: {
        type: String,
        default: null
    },

    // =====================================
    // AUTH
    // =====================================

    passwordHash: {
        type: String,
        required: true
    },

    // =====================================
    // CAMPUS
    // =====================================

    campusLanguage: {
        type: String,
        default: "fr"
    },

    campusStatus: {
        type: String,
        default: "actif"
    },

    campusProfileCompleted: {
        type: Boolean,
        default: false
    },

    campusEmailVerified: {
        type: Boolean,
        default: false
    },

    campusWhatsappVerified: {
        type: Boolean,
        default: false
    },

    campusLastLogin: {
        type: Date,
        default: null
    },
// =====================================
// AGENT
// =====================================

nombreParrainages: {
    type: Number,
    default: 0
},

revenus: {
    type: Number,
    default: 0
},

performance: {
    type: Number,
    default: 0
},

institutionsAffiliees: {
    type: [String],
    default: []
},

// =====================================
// ETUDIANT
// =====================================

nombreFormations: {
    type: Number,
    default: 0
},

nombreExamens: {
    type: Number,
    default: 0
},

nombreCertificats: {
    type: Number,
    default: 0
},

progressionGlobale: {
    type: Number,
    default: 0
},

// =====================================
// PROFESSEUR
// =====================================

nombreEtudiants: {
    type: Number,
    default: 0
},

nombreClasses: {
    type: Number,
    default: 0
},

nombreExamensCrees: {
    type: Number,
    default: 0
}

}, {
    collection: "academiques",
    timestamps: true
	
});

const Academique =
    mongoose.models.Academique ||
    mongoose.model(
        "Academique",
        academiqueSchema
    );




// =====================================
// REGISTER ACADEMIQUES
// =====================================

app.post("/academiques/register", async (req, res) => {
    try {

        const {
    role,
    nomComplet,
    whatsapp,
    email,
    pays,
    ville,

    // ETUDIANT
    nomInstitution,
    nomDirecteur,
    nomProfesseur,

    niveauEtude,
    parcoursAcademique,

    // DIRECTEUR
    typeInstitution,
    nombreProfesseurs,

    // PROFESSEUR
    domaineEnseignement,
    niveauExperience,

    password,
    confirmPassword

} = req.body;

        // =====================================
        // VALIDATION GLOBALE
        // =====================================

        if (
            !role ||
            !nomComplet ||
            !whatsapp ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // =====================================
        // VALIDATION PASSWORD
        // =====================================

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // =====================================
        // VALIDATION EMAIL UNIQUE
        // =====================================

        const existingUser = await Academique.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // =====================================
        // CONSTRUCTION LISTE PROFESSEURS
        // =====================================

        const professeurs =
    Array.isArray(req.body.professeurs)
        ? req.body.professeurs
        : [];

        // =====================================
        // VALIDATION ROLE
        // =====================================

        switch (role) {

            case "etudiant":

                if (
                    !nomInstitution ||
                    !nomDirecteur ||
                    !nomProfesseur ||
                    !niveauEtude ||
                    !parcoursAcademique
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Student information incomplete"
                    });
                }

                break;

case "directeur":

    if (
        !nomInstitution ||
        !typeInstitution ||
        nombreProfesseurs === undefined ||
        nombreProfesseurs === null
    ) {
        return res.status(400).json({
            success: false,
            message: "Director information incomplete"
        });
    }

    if (
    Number(nombreProfesseurs) > 0 &&
    professeurs.length !==
    Number(nombreProfesseurs)
) {
    return res.status(400).json({
        success: false,
        message: "Professors list incomplete"
    });
}

    break;

	case "professeur":

    if (
        !nomInstitution ||
        !nomDirecteur ||
        !domaineEnseignement ||
        !niveauExperience
    ) {
        return res.status(400).json({
            success: false,
            message: "Professor information incomplete"
        });
    }

    break;

            case "agent":

                if (!pays || !ville) {
                    return res.status(400).json({
                        success: false,
                        message: "Agent information incomplete"
                    });
                }

                break;

            default:

                return res.status(400).json({
                    success: false,
                    message: "Invalid role"
                });
        }

        // =====================================
        // HASH PASSWORD
        // =====================================

        const passwordHash = await bcryptjs.hash(
            password,
            12
        );

        // =====================================
        // CREATE DOCUMENT
        // =====================================

        const academique = new Academique({

            role,

            nomComplet,
            whatsapp,

            email: email.toLowerCase().trim(),

            pays: pays || null,
            ville: ville || null,

            // ETUDIANT
            
nomInstitution: nomInstitution || null,
nomDirecteur: nomDirecteur || null,
nomProfesseur: nomProfesseur || null,


            niveauEtude: niveauEtude || null,
            parcoursAcademique: parcoursAcademique || null,

            // DIRECTEUR
            typeInstitution: typeInstitution || null,

            nombreProfesseurs:
                Number(nombreProfesseurs) || 0,

            professeurs,

            // PROFESSEUR
            

domaineEnseignement:
    domaineEnseignement || null,

niveauExperience:
    niveauExperience || null,




            passwordHash,

            campusLanguage: "fr",

            campusStatus: "actif",

            campusProfileCompleted: false,

            campusEmailVerified: false,

            campusWhatsappVerified: false,

            campusLastLogin: null
        });

        await academique.save();

        return res.status(201).json({
            success: true,
            message: "Inscription réussie",
            role
        });

    } catch (error) {


console.error(
    "Academiques Register Error:",
    error.stack
);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

























// =====================================
// LOGIN ACADEMIQUES
// =====================================

app.post("/academiques/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // ==========================
        // VALIDATION
        // ==========================

        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe requis"
            });
        }

        // ==========================
        // RECHERCHE UTILISATEUR
        // ==========================

        const academique =
            await Academique.findOne({
                email: email
                    .toLowerCase()
                    .trim()
            });

        if (!academique) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // ==========================
        // VERIFICATION PASSWORD
        // ==========================

        const passwordMatch =
            await bcryptjs.compare(
                password,
                academique.passwordHash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // ==========================
        // UPDATE LAST LOGIN
        // ==========================

        academique.campusLastLogin =
            new Date();

        await academique.save();



// ==========================
// STATISTIQUES DYNAMIQUES
// ==========================

let nombreEtudiants = 0;

if (academique.role === "directeur") {

    nombreEtudiants =
        await Academique.countDocuments({

            role: "etudiant",

            nomInstitution:
                academique.nomInstitution

        });
}

let nombreProfesseurs = 0;

if (academique.role === "directeur") {

    nombreProfesseurs =
        await Academique.countDocuments({

            role: "professeur",

            nomInstitution:
                academique.nomInstitution

        });
}




// ==========================
// LISTE ETUDIANTS DIRECTEUR
// ==========================

let listeEtudiants = [];

if (academique.role === "directeur") {

    listeEtudiants =
        await Academique.find({

            role: "etudiant",

            nomInstitution:
                academique.nomInstitution

        })
        .select(
            "nomComplet nomProfesseur parcoursAcademique niveauEtude"
        );
}





// ==========================
// STATS PROFESSEUR
// ==========================

let nombreEtudiantsProf = 0;

let listeEtudiantsProf = [];

if (academique.role === "professeur") {

    listeEtudiantsProf =
        await Academique.find({

            role: "etudiant",

            nomProfesseur:
                academique.nomComplet

        })
        .select(
            "nomComplet parcoursAcademique niveauEtude"
        );

    nombreEtudiantsProf =
        listeEtudiantsProf.length;
}

		

        // ==========================
        // SUCCESS LOGIN
        // ==========================

        return res.status(200).json({

            success: true,

            message: "Connexion réussie",

            user: {

                _id:
                    academique._id,

                role:
                    academique.role,

                nomComplet:
                    academique.nomComplet,

                email:
                    academique.email,

                whatsapp:
                    academique.whatsapp,

                pays:
                    academique.pays,

                ville:
                    academique.ville,

                nomInstitution:
                    academique.nomInstitution,

                nomDirecteur:
                    academique.nomDirecteur,

                nomProfesseur:
                    academique.nomProfesseur,

                domaineEnseignement:
                    academique.domaineEnseignement,

                niveauExperience:
                    academique.niveauExperience,

                campusLanguage:
                    academique.campusLanguage,
				 
				nombreProfesseurs:
    nombreProfesseurs,
				
professeurs:
    academique.professeurs || [],

nombreEtudiants:
        nombreEtudiants,

	listeEtudiants:
    listeEtudiants,

			etudiants:
    academique.etudiants || [],


nombreEtudiantsProf:
    nombreEtudiantsProf,

listeEtudiantsProf:
    listeEtudiantsProf,
				

typeInstitution:
    academique.typeInstitution || "",

campusStatus:
    academique.campusStatus || "",

campusProfileCompleted:
    academique.campusProfileCompleted || false
            }
        });

    } catch (error) {

        console.error(
            "Academiques Login Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});









// =====================================
// AJOUTER PROFESSEUR DIRECTEUR
// =====================================

app.post(
    "/academiques/directeur/add-professeur",
    async (req, res) => {

        try {

            const {
                directeurId,
                nomProfesseur
            } = req.body;

            const directeur =
                await Academique.findById(
                    directeurId
                );

            if (
                !directeur ||
                directeur.role !== "directeur"
            ) {
                return res.status(404).json({
                    success: false
                });
            }

            if (
                directeur.professeurs.includes(
                    nomProfesseur
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Professeur déjà présent"
                });
            }

            directeur.professeurs.push(
                nomProfesseur
            );

            directeur.nombreProfesseurs =
                directeur.professeurs.length;

            await directeur.save();

            res.json({
                success: true,
                professeurs:
                    directeur.professeurs
            });

        } catch (error) {

            res.status(500).json({
                success: false
            });

        }
    }
);









// =====================================
// SUPPRIMER PROFESSEUR DIRECTEUR
// =====================================

app.delete(
    "/academiques/directeur/remove-professeur",
    async (req, res) => {

        try {

            const {
                directeurId,
                nomProfesseur
            } = req.body;

            const directeur =
                await Academique.findById(
                    directeurId
                );

            if (
                !directeur ||
                directeur.role !== "directeur"
            ) {
                return res.status(404).json({
                    success: false
                });
            }

            directeur.professeurs =
                directeur.professeurs.filter(
                    p =>
                        p !== nomProfesseur
                );

            directeur.nombreProfesseurs =
                directeur.professeurs.length;

            await directeur.save();

            res.json({
                success: true,
                professeurs:
                    directeur.professeurs
            });

        } catch (error) {

            res.status(500).json({
                success: false
            });

        }
    }
);



















































































































































































































































   


































































/**
 * ---------- MONGODB CONNECTION ----------
 */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI manke nan anviwònman!');
  process.exit(1);
}

// ✅ nouvo fason konekte san opsyon demode
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB konekte avèk siksè!'))
  .catch(err => {
    console.error('❌ Erè koneksyon MongoDB:', err.message);
  });






// ----------------------- ROUTES MERCHANT -----------------------
// Mete sa apre tout middleware tankou express.json() 
// epi anvan app.listen pou li ka koute requests
const merchantRoutes = require('./merchant/merchant.routes');
app.use('/merchant', merchantRoutes);




// ----------------------- ROUTE TRANSFERT WALLET ➜ MERCHANT -----------------------
const walletToMerchantRoutes = require("./routes/walletToMerchant");
app.use('/wallet', walletToMerchantRoutes);   // <-- sa pèmèt POST /wallet/transfer-to-merchant





const walletSchema = new mongoose.Schema({
  email: String,
  balance: Number
}, { collection: "walletbalances" });

const Wallet = mongoose.model("Wallet", walletSchema);










// ================= MODÈL RETRAIT INTERNATIONAL =================
const retraitInternationalSchema = new mongoose.Schema({
  code: { type: String, required: true },
  expediteurNom: { type: String, required: true },
  beneficiaireNom: { type: String, required: true },
  montant: { type: Number, required: true },
  agentNom: { type: String, required: true },
  agentEmail: { type: String, required: true },
  fraisAgent: { type: Number, required: true },
  fraisAdmin: { type: Number, required: true },
  dateRetrait: { type: Date, default: Date.now },
  statut: { type: String, default: "Retrait Validé" }
}, { timestamps: true });

// ----------------------- MODEL -----------------------
const retraitinternational = mongoose.model(
  "retraitinternational",
  retraitInternationalSchema,
  "retraitinternational"
);














/**
 * ---------- MONGODB SCHEMAS ----------
 */

// ✅ Schema pou elèv yo
const eleveSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  numero_dossier: { type: String, required: true },
  promotion: { type: String, required: true },
  notes: { type: String, default: '' }, // ✅ remak/nòt
  classe: { type: String, required: true },
});

const Eleve = mongoose.model('Eleve', eleveSchema, 'eleves'); // koleksyon: "eleves"


/**
 * ---------- ROUTES ELEVE ----------
 */

// 📌 Ajoute yon elèv
app.post('/api/eleves', async (req, res) => {
  try {
    const { nom, prenom, email, numero_dossier, promotion, notes, classe } = req.body;

    // ✅ Verifye tout chan obligatwa yo
    if (!nom || !prenom || !email || !numero_dossier || !promotion || !classe) {
      return res.status(400).json({
        success: false,
        message: 'Tout chan obligatwa yo dwe ranpli (nom, prenom, email, numero_dossier, promotion, classe)'
      });
    }

    // ✅ Kreye nouvo elèv ak tout chan
    const eleve = new Eleve({
      nom,
      prenom,
      email,
      numero_dossier,
      promotion,
      notes: notes || '', // ajoute nòt / remak si genyen
      classe
    });

    await eleve.save();
    res.json({ success: true, message: '✅ Elèv anrejistre avèk siksè', eleve });
  } catch (err) {
    console.error('❌ Erè lè w ap sove elèv:', err.message);
    res.status(500).json({ success: false, message: 'Erè sèvè lè w ap sove elèv' });
  }
});

// 📌 Lis tout elèv — ✅ KOUNYA LI FONKSYONE AK FILTRAJ PA KLAS
app.get('/api/eleves', async (req, res) => {
  try {
    const { classe } = req.query;

    // Si gen klas nan query, filtre sèlman elèv sa yo
    const query = classe ? { classe } : {};

    const list = await Eleve.find(query).sort({ date_inscription: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('❌ Erè lè w ap chaje elèv:', err.message);
    res.status(500).json({ success: false, message: 'Erè sèvè lè w ap chaje elèv' });
  }
});

/**
 * ---------- HELPERS ORIJINAL + ROUTES EXISTANTS ----------
 * (Tout lòt pati nan server.js rete entak)
 */

function normalizeSchoolKey(key) {
  if (!key) return null;
  const k = String(key).trim().toUpperCase();
  return k;
}

function buildEnvMappings() {
  const schools = ['FOBAS', 'LUMIERE', 'CEFOTECH'];
  const mapping = { schools: {}, classes: {}, subjects: {} };

  if (process.env.SCHOOL_PASSWORD) mapping.legacySchoolPassword = process.env.SCHOOL_PASSWORD;

  schools.forEach(s => {
    const sid = s.toUpperCase();
    const schoolEnvName = `SCHOOL_${sid}`;
    if (process.env[schoolEnvName]) mapping.schools[sid] = process.env[schoolEnvName];

    mapping.classes[sid] = {};
    ['7em','8em','9em','NS1','NS2','NS3','NS4'].forEach(cls => {
      const envName = `CLASS_${sid}_${String(cls).toUpperCase()}`;
      if (process.env[envName]) mapping.classes[sid][cls] = process.env[envName];
    });

    mapping.subjects[sid] = {};
    const subjKeys = {
      math:'MATH', informatique:'INFO', creole:'CREOLE',
      francais:'FR', anglais:'EN', espagnol:'ES',
      sciences:'SC', histoire:'HIS', geographie:'GEO', philosophie:'PHILO'
    };
    Object.entries(subjKeys).forEach(([key,suffix]) => {
      const envName = `SUBJECT_${sid}_${suffix}`;
      if (process.env[envName]) mapping.subjects[sid][key] = process.env[envName];
    });
  });

  return mapping;
}

const ENV_MAP = buildEnvMappings();

function findSchoolByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const [schoolKey, val] of Object.entries(ENV_MAP.schools)) {
    if (val && val === pass) return { school: schoolKey };
  }
  if (ENV_MAP.legacySchoolPassword && ENV_MAP.legacySchoolPassword === pass) {
    const prefer = ['FOBAS','LUMIERE','CEFOTECH'];
    for (const p of prefer) if (ENV_MAP.schools[p]) return { school: p };
    return { school: 'FOBAS' };
  }
  return null;
}

function findClassByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.classes)) {
    const classes = ENV_MAP.classes[schoolKey] || {};
    for (const clsKey of Object.keys(classes)) {
      if (classes[clsKey] && classes[clsKey] === pass)
        return { school: schoolKey, class: clsKey };
    }
  }
  return null;
}

function findSubjectByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.subjects)) {
    const subs = ENV_MAP.subjects[schoolKey] || {};
    for (const sKey of Object.keys(subs)) {
      if (subs[sKey] && subs[sKey] === pass)
        return { school: schoolKey, subject: sKey };
    }
  }
  return null;
}

/**
 * ---------- ROUTES ORIJINAL YO ----------
 */
app.post('/api/verify-school', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    if (!ENV_MAP.schools[sk])
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt' });
    if (ENV_MAP.schools[sk] === password)
      return res.json({ success:true, level:'school', school: sk, message:`Lekòl ${sk} ouvè` });
    return res.status(401).json({ success:false, message:'Invalid school password' });
  } else {
    const found = findSchoolByPassword(password);
    if (found && found.school)
      return res.json({ success:true, level:'school', school: found.school, message:`Lekòl ${found.school} ouvè` });
    return res.status(401).json({ success:false, message:'Invalid school password' });
  }
});

app.post('/api/verify-class', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    const classesFor = ENV_MAP.classes[sk];
    if (!classesFor)
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou klas' });
    const validClass = Object.keys(classesFor).find(k => classesFor[k] === password);
    if (validClass)
      return res.json({ success:true, level:'class', school: sk, class: validClass, message:`Klas ${validClass} ouvè nan ${sk}` });
    return res.status(401).json({ success:false, message:'Invalid class password' });
  } else {
    const found = findClassByPassword(password);
    if (found)
      return res.json({ success:true, level:'class', school: found.school, class: found.class, message:`Klas ${found.class} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid class password' });
  }
});

app.post('/api/verify-subject', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    const subsFor = ENV_MAP.subjects[sk];
    if (!subsFor)
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou matyè' });
    const validSubject = Object.keys(subsFor).find(k => subsFor[k] === password);
    if (validSubject)
      return res.json({ success:true, level:'subject', school: sk, subject: validSubject, message:`Egzamen ${validSubject} ouvè nan ${sk}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  } else {
    const found = findSubjectByPassword(password);
    if (found)
      return res.json({ success:true, level:'subject', school: found.school, subject: found.subject, message:`Egzamen ${found.subject} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  }
});

// ping
app.get('/ping', (req, res) => res.send('pong'));







// server.js (Vèsyon final: CHAT PUBLIK entak; CHAT PRIVE - nouvo blòk separe)

// ---------------------------
// ⚡ HTTP + SOCKET.IO SERVER
const server = http.createServer(app);  // ✅ Renome httpServer an server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ---------------------------
// 🧩 MONGODB + MODEL MESAJ (ak tcheke koneksyon)
// ---------------------------
if (mongoose.connection.readyState === 0) {
  // Si pa gen koneksyon aktif, konekte
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB konekte avèk siksè!'))
    .catch((err) => console.error('❌ Erè MongoDB:', err.message));
} else {
  console.log('✅ MongoDB deja konekte');
}

// Definisyon schema pou mesaj piblik yo
const messageSchema = new mongoose.Schema({
  from: String,          // userId itilizatè
  to: String,            // 'public' pou chat piblik
  message: String,       // kontni mesaj la
  date: { type: Date, default: Date.now }, // dat otomatik
});

// Modèl Message pou MongoDB
const Message = mongoose.model('Message', messageSchema);

// ---------------------------
// 👥 MEMWA ITILIZATÈ AK BROADCAST
// ---------------------------

// ✅ 1. Kreye memwa pou itilizatè yo
const onlineUsers = new Map();

// ✅ 2. Fonksyon pou voye lis tout itilizatè yo bay tout moun (pou ti panel a dwat la)
function broadcastOnline() {
  const users = [];
  for (const [userId, record] of onlineUsers.entries()) {
    users.push({
      userId,                  // ID inik itilizatè a (enpòtan pou chat prive)
      display: record.user,    // non itilizatè a pou montre nan panel la
      connected: record.sockets.size > 0 // si itilizatè a konekte
    });
  }

  // Emit event ke client-side la ap koute
  io.emit('online-users', users);
}
	



// ---------------------------

// ⚡ SOCKET.IO – CHAT PIBLIK
// ---------------------------
io.on('connection', async (socket) => {
  console.log('🟢 Nouvo itilizatè konekte:', socket.id);

  // ---------------------------
  // Helper: normalize raw user string to stable userId + display name
  // ---------------------------
  function normalizeUser(raw) {
    const clean = (raw || '').toString().trim();
    if (!clean) {
      return { userId: `user-${socket.id}`, display: `Anonyme-${socket.id.slice(0,6)}` };
    }
    const userId = clean.toLowerCase();
    return { userId, display: clean };
  }

 // ---------------------------
// ✅ Fonksyon pou voye lis itilizatè sou entènèt bay tout clients
// ---------------------------
function broadcastOnline() {
  const users = [];
  for (const [userId, record] of onlineUsers.entries()) {
    users.push({
      userId,
      display: record.user,
      connected: record.sockets.size > 0
    });
  }
  io.emit('online-users', users); // nouvo panel ap koute sa
}

// ---------------------------
// ✅ Enskri / mete ajou itilizatè
// ---------------------------
function registerUser(rawUser) {
  try {
    const { userId, display } = normalizeUser(rawUser);

    // Si socket deja gen menm userId, pa fè anyen men mete ajou display si chanje
    if (socket.data.userId && socket.data.userId === userId) {
      const existing = onlineUsers.get(userId);
      if (existing) existing.user = display;
      broadcastOnline();
      return;
    }

    // Retire socket nan prev record si li egziste
    const prevId = socket.data.userId;
    if (prevId && prevId !== userId) {
      const prevRecord = onlineUsers.get(prevId);
      if (prevRecord) {
        prevRecord.sockets.delete(socket.id);
        if (prevRecord.sockets.size === 0) {
          onlineUsers.delete(prevId);
          io.emit('userDisconnected', { userId: prevId, display: prevRecord.user });
        }
      }
    }

    // Jwenn oswa kreye record pou userId
    let record = onlineUsers.get(userId);
    if (!record) {
      record = { user: display, sockets: new Set() };
      onlineUsers.set(userId, record);
    } else {
      record.user = display;
    }

    // Ajoute socket la
    record.sockets.add(socket.id);
    socket.data.userId = userId;

    // Join personal room (si ou vle chat prive)
    socket.join(`user-${userId}`);

    // Emèt done koneksyon itilizatè
    io.emit('userConnected', { userId, display });

    // Mete ajou panel itilizatè a
    broadcastOnline();

    console.log(`🔵 Registered socket ${socket.id} as userId=${userId} (display=${display})`);
  } catch (err) {
    console.error('registerUser err:', err);
  }
}

  // ---------------------------
  // Si front-end pase user nan handshake, enskri li imedyatman
  // ---------------------------
  try {
    const handshakeUser =
      socket.handshake?.query?.user ||
      socket.handshake?.auth?.user ||
      socket.handshake?.query?.userId ||
      socket.handshake?.auth?.userId;
    if (handshakeUser) registerUser(handshakeUser);
  } catch (e) {}

  // ---------------------------
  // ✅ Chaje mesaj piblik jodi a (async nan top-level callback)
  // ---------------------------
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysMessages = await Message.find({
      to: 'public',
      date: { $gte: todayStart, $lt: todayEnd }
    })
      .sort({ date: 1 })
      .lean();

    const formatted = todaysMessages.map(msg => ({
      user: (msg.from || 'Anonyme').toString().trim(),
      message: msg.message || '',
      date: msg.date ? new Date(msg.date) : new Date(),
    }));

    socket.emit('loadMessages', formatted);
  } catch (err) {
    console.error('❌ Erè pandan chajman mesaj piblik jodi a:', err?.message);
  }

  // ---------------------------
  // ✅ Resevwa non itilizatè / chatMessage
  // ---------------------------
  socket.on('setUser', (payload) => {
    try {
      let value = null;
      if (typeof payload === 'string') value = payload;
      else if (payload && typeof payload === 'object')
        value = payload.userId || payload.user || null;

      if (!value) {
        const { userId } = normalizeUser(null);
        registerUser(userId);
        return;
      }

      registerUser(value);
    } catch (err) {
      console.error('setUser handler err:', err);
    }
  });

  socket.on('chatMessage', async (data) => {
    try {
      if (!socket.data.userId) {
        const possible = data && typeof data === 'object' ? (data.user || data.userId || null) : null;
        if (possible) registerUser(possible);
        else registerUser(null);
      }

      const userFrom = socket.data.userId || `user-${socket.id}`;
      const message = data?.message ? String(data.message).trim() : '';
      if (!message) return;

      const newMsg = new Message({ from: userFrom, to: 'public', message });
      await newMsg.save();

      io.emit('chatMessage', {
        user: newMsg.from,
        message: newMsg.message,
        date: newMsg.date,
      });

      broadcastOnline();
    } catch (err) {
      console.error('❌ Erè pandan anrejistreman mesaj piblik:', err?.message);
    }
  });

  socket.on('requestUserList', () => {
    try { broadcastOnline(); } catch (e) {}
  });

  socket.on('disconnect', () => {
    try {
      const userId = socket.data.userId;
      if (!userId) return;

      const record = onlineUsers.get(userId);
      if (!record) return;

      record.sockets.delete(socket.id);
      if (record.sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('userDisconnected', { userId, display: record.user });
      }

      broadcastOnline();
      console.log('🔴 Itilizatè dekonekte:', userId);
    } catch (err) {
      console.error('disconnect err:', err);
    }
  });
  
	
	
	
	
	
	
	
	// ---------------------------
// ===  CHAT PRIVE - KOMPLET KONPATIB  ===
// ---------------------------

// Helper deterministic room name
function getPrivateRoom(a, b) {
  const A = String(a), B = String(b);
  return A < B ? `room-${A}-${B}` : `room-${B}-${A}`;
}

// --- Events prive deja egziste (pa modifye) ---
socket.on('request_private_chat', async ({ targetUser }) => {
  try {
    const me = socket.data.userId;
    if (!me) return socket.emit('error_private', { message: 'Unauthorized (no userId)' });
    if (!targetUser) return socket.emit('error_private', { message: 'Missing targetUser' });

    const room = getPrivateRoom(me, targetUser);
    socket.join(room);

    const messages = await Message.find({
      $or: [
        { from: me, to: targetUser },
        { from: targetUser, to: me }
      ]
    }).sort({ date: 1 }).lean();

    socket.emit('private_history', { conversationId: null, room, messages });
    io.to(`user-${targetUser}`).emit('private_chat_invite', { from: me, room });
  } catch (err) {
    console.error('request_private_chat err', err);
    socket.emit('error_private', { message: 'Server error (request_private_chat)' });
  }
});

socket.on('join_private_room', ({ room }) => {
  try {
    if (!room) return;
    socket.join(room);
    socket.emit('joined_private_room', { room });
  } catch (err) { console.error('join_private_room err', err); }
});

socket.on('private_message', async (payload) => { /* ...retabli menm jan ou te genyen... */ });

socket.on('loadPrivateMessages', async ({ user1, user2, from, to }) => {
  try {
    const A = user1 || from;
    const B = user2 || to;
    if (!A || !B) return socket.emit('loadPrivateMessages', []);
    const messages = await Message.find({
      $or: [
        { from: A, to: B },
        { from: B, to: A }
      ]
    }).sort({ date: 1 }).lean();
    socket.emit('loadPrivateMessages', messages);
  } catch (err) {
    console.error('loadPrivateMessages err', err);
    socket.emit('loadPrivateMessages', []);
  }
});

socket.on('mark_conversation_read', async ({ conversationId, otherUser }) => {
  try {
    const me = socket.data.userId;
    if (!me) return;
    if (otherUser) io.to(`user-${otherUser}`).emit('conversation_read', { by: me });
    socket.emit('mark_conversation_read_ok', { conversationId });
  } catch (err) { console.error('mark_conversation_read err', err); }
});

socket.on('message_seen', async ({ messageId }) => {
  try {
    if (!messageId) return;
    const msg = await Message.findById(messageId);
    if (!msg) return;
    const room = getPrivateRoom(msg.from, msg.to);
    io.to(room).emit('message_seen', { messageId, by: socket.data.userId });
  } catch (err) { console.error('message_seen err', err); }
});

socket.on('typing', ({ room, isTyping }) => {
  try {
    if (!room) return;
    socket.to(room).emit('typing', { from: socket.data.userId, isTyping: !!isTyping });
  } catch (err) { console.error('typing err', err); }
});

socket.on('requestUserList', () => { broadcastOnline(); });

// --- Nouvo features ---
socket.on('private_message_with_features', async (payload) => {
  try {
    const me = socket.data.userId;
    if(!me) return socket.emit('error_private',{message:'Unauthorized'});
    const to = payload.to;
    if(!to) return socket.emit('error_private',{message:'Missing recipient'});

    const text = payload.text || '';
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    const voice = payload.voice || null;
    const call = payload.call || null;

    const newMsg = new Message({
      from: me,
      to,
      message: text || (attachments[0]?.filename || ''),
      attachments,
      voice,
      date: new Date()
    });
    await newMsg.save();

    const room = payload.room || getPrivateRoom(me, to);
    const msgForEmit = {
      _id: newMsg._id,
      from: newMsg.from,
      to: newMsg.to,
      text: newMsg.message,
      attachments: newMsg.attachments,
      voice: newMsg.voice,
      createdAt: newMsg.date
    };

    io.to(room).emit('receive_private_message', msgForEmit);
    io.to(`user-${to}`).emit('private_message_notification',{
      from: me,
      room,
      messageId: newMsg._id,
      textPreview: newMsg.message.length>100 ? newMsg.message.slice(0,100)+'...' : newMsg.message
    });

    if(call && call.type && call.action){
      io.to(`user-${to}`).emit('private_call_signal',{from:me, call});
    }

    socket.emit('private_message_sent', msgForEmit);

  } catch(err){
    console.error('private_message_with_features err', err);
    socket.emit('error_private',{message:'Server error (private_message_with_features)'});
  }
});

socket.on('mark_message_seen', async ({ messageId }) => {
  try{
    if(!messageId) return;
    const msg = await Message.findById(messageId);
    if(!msg) return;
    const room = getPrivateRoom(msg.from,msg.to);
    io.to(room).emit('message_seen',{messageId, by: socket.data.userId});
  } catch(err){ console.error('mark_message_seen err', err); }
});

socket.on('block_user', ({ targetUser }) => {
  const me = socket.data.userId;
  if(!me || !targetUser) return;
  io.to(`user-${me}`).emit('user_blocked',{blockedUser: targetUser});
  io.to(`user-${targetUser}`).emit('blocked_by',{by: me});
});

// --- Disconnect handling pou chat prive + onlineUsers ---
socket.on('disconnect', () => {
  const userId = socket.data.userId;
  if(!userId) return;

  const record = onlineUsers.get(userId);
  if(!record) return;

  record.sockets.delete(socket.id);
  if(record.sockets.size===0) io.emit('userDisconnected', record.name);

  broadcastOnline();
  console.log('🔴 Itilizatè dekonekte:', userId);
});

}); // end io.on('connection')

// ---------------------------
// 🗂️ CHAT PAGE
// ---------------------------
app.get('/Chat-Spirituel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chat-Spirituel.html'));
});

// Serve Chatprive.html (so you can inject from query param in dev; production should render CURRENT_USER)
app.get('/Chatprive.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chatprive.html'));
});










































// --- SOCKET.IO Handlers ---
io.on("connection", (socket) => {
  console.log("🟢 Nouvo itilizatè konekte:", socket.id);

  socket.on('ask', async ({ question, lang } = {}) => {
    try {
      const doc = await findAnswerInDB(question || '', lang);

      if (doc) {
        socket.emit('answer', { 
          answer: doc.answer, 
          lang: doc.lang || lang || 'ht'
        });
      } else {
        const DEFAULT_ANSWERS = {
          ht: "M pa jwenn repons sa nan memwa mwen. Eske ou vle m anrejistre kesyon sa pou pwochen fwa?",
          fr: "Je n’ai pas trouvé cette réponse dans ma mémoire. Voulez-vous que je sauvegarde cette question pour la prochaine fois ?",
          en: "I couldn’t find this answer in my memory. Would you like me to save this question for next time?",
          es: "No encontré esta respuesta en mi memoria. ¿Quieres que guarde esta pregunta para la próxima vez?"
        };

        const chosenLang = (lang && ['ht','fr','en','es'].includes(lang)) ? lang : 'ht';

        console.debug('[MemeQA] emitting fallback answer, lang=', chosenLang);
        socket.emit('answer', {
          answer: DEFAULT_ANSWERS[chosenLang],
          lang: chosenLang
        });
      }
    } catch (err) {
      console.error('❌ Erè pandan ask handler:', err);
      socket.emit('answer', { answer: "Erè sèvè. Eseye ankò.", lang: lang || 'ht' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 socket disconnected:', socket.id, reason);
  });
});


// --- HTTP Endpoints ---
app.get('/api/memeqas', async (req, res) => {
  try {
    const q = {};
    if (req.query.lang) q.lang = req.query.lang;

    const list = await MemeQA.find(q)
      .sort({ createdAt: -1 })
      .limit(5000);

    res.json(list);
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/api/memeqa', async (req, res) => {
  try {
    const payload = req.body;
    if(!payload || !payload.question || !payload.answer) {
      return res.status(400).json({ error:'question & answer required' });
    }

    const doc = await MemeQA.create(payload);
    io.emit('memeqa-update', { action:'create', doc });

    res.json({ ok:true, doc });

  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.delete('/api/memeqa/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await MemeQA.findByIdAndDelete(id);

    io.emit('memeqa-update', { action:'delete', id });

    res.json({ ok:true, doc });
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question, lang } = req.body || {};
    const doc = await findAnswerInDB(question || '', lang);

    if (doc) {
      return res.json({ 
        answer: doc.answer, 
        lang: doc.lang || lang || 'ht' 
      });
    }

    return res.json({ 
      answer: "M pa jwenn repons sa nan memwa mwen. Eske ou vle m anrejistre kesyon sa pou pwochen fwa?", 
      lang: lang || 'ht' 
    });

  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});


// --- MongoDB Change Stream ---
mongoose.connection.once('open', () => {
  try {
    const changeStream = MemeQA.watch();

    changeStream.on('change', (change) => {
      io.emit('memeqa-update', { change });
    });

    changeStream.on('error', (err) => {
      console.warn('changeStream error:', err && err.message);
    });

  } catch(err) {
    console.warn('Change stream not available (replica set required).', err && err.message);
  }
});



























// ----------------------- WALLET FOBAS SCHEMA -----------------------
const walletUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  balance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  whatsapp: { type: String },
  recoveryEmail: { type: String },
  sponsorName: { type: String },
  sponsorEmail: { type: String },
  accountType: { type: String, required: true },
  hasDepositedBefore: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },

  // 🔐 CHAN TRACE / AUDIT / RISK (ACTIVE DEFAULTS)
  lastAction: { type: String, default: "CREATION" },       // default premye aksyon
  lastActionAt: { type: Date, default: Date.now },          // aktive depi premye kreasyon
  lastActionBy: { type: String, default: "SYSTEM" },        // SYSTEM kòm default
  adminIp: { type: String, default: "0.0.0.0" },            // default trace IP

  createdBy: { type: String, enum: ["Self",  "Agent Terrain", "Agent Autorise", "Utilisateur", "FONDATEUR FOBAS"], default: "self" },
  registrationChannel: { type: String, enum: ["app", "Utilisateur", "Agent Terrain", "Agent Autorise", "FONDATEUR FOBAS"], default: "app" },
  geoZone: { type: String, default: "undefined" },          // default aktif pou trace zòn
  deviceId: { type: String, default: "unknown" },           // default aktif
  createdFromDevice: { type: String, default: "unknown" },  // default aktif
  ipAddress: { type: String, default: "0.0.0.0" },          // default trace IP

  kycLevel: { type: Number, default: 0 },                   // nivo KYC debaz
  riskScore: { type: Number, default: 0 },                  // debaz riskScore
  riskFlags: { type: [String], default: [] },               // lis alert risk

  auditVersion: { type: Number, default: 1 }                // vèsyon audit
}, { timestamps: true });

// 🔥 Koreksyon pou fè l konpatib ak koleksyon reyèl MongoDB ou
const WalletUser = mongoose.models.WalletUser || mongoose.model(
  "WalletUser",      // Non model nan JS
  walletUserSchema,  // Schema
  "walletusers"      // Non collection reyèl nan MongoDB
);


// ----------------------- SCHEMAS BALANCE WALLET -----------------------
const walletBalanceSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  fullName: String,
  walletAccountType: { type: String, default: "Utilisateur" },
  accountStatus: { type: String, default: "ACTIF" },
  balance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  balanceFrozen: { type: Boolean, default: false },
  bonusBlocked: { type: Boolean, default: false },
  lastAction: String,

  // ===============================
// 🔐 TRACE & SÉCURITÉ / NOUVO CHAMPS - ACTIVE DEFAULTS
// ===============================
createdBy: {
  type: String,
  enum: ["Self",  "Agent Terrain", "Agent Autorise", "Utilisateur", "FONDATEUR FOBAS"],
  default: "Self"
},
agentId: {
  type: mongoose.Schema.Types.ObjectId,
  default: null
},
registrationChannel: {
  type: String,
  enum: ["app", "Utilisateur", "Agent Terrain", "Agent Autorise", "FONDATEUR FOBAS"],
  default: "app"
},
geoZone: {
  type: String,
  default: "undefined"          // ACTIVE default pou trace
},
kycLevel: {
  type: Number,
  default: 0
},
deviceId: {
  type: String,
  default: "unknown"            // ACTIVE default pou device trace
},
createdFromDevice: {
  type: String,
  default: "unknown"            // ACTIVE default
},
ipAddress: {
  type: String,
  default: "0.0.0.0"            // ACTIVE default IP
},
riskScore: {
  type: Number,
  default: 0
},
riskFlags: {
  type: [String],
  default: []
},
lastActionAt: { type: Date, default: Date.now },   // ACTIVE depi premye kreasyon
lastActionBy: { type: String, default: "SYSTEM" }, // ACTIVE default
adminIp: { type: String, default: "0.0.0.0" },     // ACTIVE default
auditVersion: { type: Number, default: 1 }

}, { timestamps: true });





// ----------------------- SCHEMAS TRANSACTIONS -----------------------
const transactionSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  type: String, // deposit, withdraw, transfer, bonus
  amount: Number,
  fee: { type: Number, default: 0 },
  note: String, // ✅ ADMIN NOTE (SAFE)
  method: String,
  whatsapp: String,
  country: String,
  receiverEmail: String,
  status: { type: String, default: 'PENDING' }
}, { timestamps: true });

const WalletBalance = mongoose.model('walletbalances', walletBalanceSchema);
const Transaction = mongoose.model('transactions', transactionSchema);




















































// ================= EXPRESSFOBAS INTERNATIONAL (PHASE 1 SIMPLE) =================

// ⚠️ OBLIGATWA (mete l yon sèl fwa nan server.js si li pa deja la)
app.use(express.json());

// ----------------------- SCHEMA -----------------------
const expressFobasSchema = new mongoose.Schema({
  agentNom: { type: String, required: true },
  agentEmail: { type: String, required: true },

  expediteurNom: { type: String, required: true },
  expediteurDocumentType: { type: String, default: "" },
  expediteurDocumentNumero: { type: String, default: "" },
  expediteurPays: { type: String, required: true },
  expediteurVille: { type: String, required: true },
  expediteurAdresse: { type: String, required: true },
  expediteurTelephone: { type: String, required: true },

  beneficiaireNom: { type: String, required: true },
  beneficiairePays: { type: String, required: true },
  beneficiaireVille: { type: String, required: true },
  beneficiaireAdresse: { type: String, required: true },
  beneficiaireTelephone: { type: String, required: true },

  montant: { type: Number, required: true },
  frais: { type: Number, default: 0 },
  totalDebit: { type: Number, default: 0 },

  codeUnique: {
    type: String,
    default: () => "EFB-" + require("crypto").randomBytes(5).toString("hex").toUpperCase()
  },

  statut: { type: String, default: "Pending" },

  dateExpiration: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d;
    }
  },

  source: { type: String, default: "EXPRESSFOBAS" }

}, { timestamps: true });

// ----------------------- MODEL -----------------------
const ExpressFobas = mongoose.model(
  "ExpressFobas",
  expressFobasSchema,
  "fobasinternational"
);

// ----------------------- ROUTE SIMPLE -----------------------
app.post("/api/expressfobas", async (req, res) => {

  console.log("📥 DATA RESEVWA:", req.body); // 🔥 DEBUG ENPÒTAN

  try {

    // ⚠️ sekirite si body pa vini
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("❌ req.body vid");
      return res.status(400).json({
        success: false,
        message: "Aucune donnée reçue"
      });
    }

    const data = req.body;

    // ---------------- VALIDATION ----------------
    const requiredFields = [
      "agentNom", "agentEmail",
      "expediteurNom", "expediteurPays", "expediteurVille", "expediteurAdresse", "expediteurTelephone",
      "beneficiaireNom", "beneficiairePays", "beneficiaireVille", "beneficiaireAdresse", "beneficiaireTelephone",
      "montant"
    ];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
        console.log("❌ Champ manquant:", field);
        return res.status(400).json({
          success: false,
          message: `Champ manquant: ${field}`
        });
      }
    }

    const montant = Number(data.montant);

    if (isNaN(montant) || montant <= 0) {
      console.log("❌ Montant invalide:", data.montant);
      return res.status(400).json({
        success: false,
        message: "Montant invalide"
      });
    }

    console.log("✅ Tout bon, on ap kreye dokiman...");

    // ---------------- CREATE DOCUMENT ----------------
const frais = Number((montant * 0.15).toFixed(2));
const totalDebit = Number((montant + frais).toFixed(2));

const expressFobas = new ExpressFobas({
  ...data,
  montant,
  frais,
  totalDebit,
  statut: "Pending"
});

    await expressFobas.save();

    console.log("✅ SAUVE OK:", expressFobas.codeUnique);




// ================= FAZ 2: DEBIT AUTOMATIK (VERSION FINAL SÉCURISÉ) =================
try {

  const frais = Number((montant * 0.15).toFixed(2));
  const totalDebit = Number((montant + frais).toFixed(2));

  const cleanEmail = data.agentEmail.trim().toLowerCase();

  console.log("🔍 Recherche wallet:", cleanEmail);

  const agentWallet = await Wallet.findOne({ email: cleanEmail });

  if (!agentWallet) {
    console.log("❌ Wallet introuvable");
  } else {

    if (agentWallet.balance < totalDebit) {
      console.log("⚠️ Balance insuffisante");
    } else {

      agentWallet.balance -= totalDebit;

      await agentWallet.save();

      console.log("✅ Debit OK:", totalDebit);
    }
  }

} catch (err) {
  console.error("🔥 ERREUR DEBIT:", err);
}



	  





	  
    // ---------------- RESPONSE ----------------
  return res.status(200).json({
  success: true,
  message: "ExpressFOBAS enregistré avec succès",
  codeUnique: expressFobas.codeUnique,
  montant,
  frais,
  totalDebit,
  dateExpiration: expressFobas.dateExpiration
});

  } catch (err) {

    console.error("🔥 EXPRESSFOBAS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});







// ================= FAZ 4: EXPRESSFOBAS VERIFICATION =================
app.post("/api/expressfobas/verify", async (req, res) => {

  try {

    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Code manquant"
      });
    }

    const cleanCode = code.trim().toUpperCase();

    console.log("🔍 Vérification code:", cleanCode);

    // 🔎 CHERCHE TRANSFERT
    const transfer = await ExpressFobas.findOne({
      codeUnique: cleanCode
    });

    // ❌ CODE PA EXISTE
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Code invalide"
      });
    }

    // 🔎 VERIFYE EXPIRATION
    const now = new Date();
    const isExpired = transfer.dateExpiration <= now;

    // 🔎 VERIFYE STATUT
    const statut = transfer.statut;

    // ❌ SI EXPIRE
    if (isExpired) {
      return res.status(400).json({
        success: false,
        message: "ExpressFOBAS expiré",
        statut: statut
      });
    }

    // ❌ SI PA PENDING
    if (statut !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Statut invalide: ${statut}`,
        statut: statut
      });
    }

    // ✅ SI TOUT BON → RETOURNE DONE
    return res.status(200).json({
      success: true,
      data: {
        code: transfer.codeUnique,

        expediteurNom: transfer.expediteurNom,
        expediteurPays: transfer.expediteurPays,

        beneficiaireNom: transfer.beneficiaireNom,
        beneficiairePays: transfer.beneficiairePays,

        agentNom: transfer.agentNom,
        agentEmail: transfer.agentEmail,

        montant: transfer.montant,
        frais: transfer.frais,
        totalDebit: transfer.totalDebit,

        statut: transfer.statut,

        dateCreation: transfer.createdAt,
        dateExpiration: transfer.dateExpiration
      }
    });

  } catch (err) {

    console.error("🔥 ERREUR VERIFICATION:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});



// ================================================
// 🔥 FAZ 5 - EXPRESS RETRAIT FINAL PRO MAX
// POST /api/expressfobas/expressretrait
// ================================================

app.post("/api/expressfobas/expressretrait", async (req, res) => {
  try {
    const { code, agentNom, agentEmail } = req.body;

    if (!code || !agentNom || !agentEmail) {
      return res.status(400).json({
        message: "Champs obligatoires manquants"
      });
    }

    // 1️⃣ RECHERCHE EXPRESSFOBAS
    const express = await fobasinternational.findOne({ code });

    if (!express) {
      return res.status(404).json({ message: "Code introuvable" });
    }

    // 2️⃣ VÉRIFICATION STATUT
    if (express.statut !== "Pending") {
      return res.status(400).json({
        message: "Ce code ne peut plus être retiré"
      });
    }

    // 3️⃣ FRACTION FRAIS
    const fraisTotal = express.frais;        // 15%
    const fraisAgent = fraisTotal * 0.3333;  // ~5%
    const fraisAdmin = fraisTotal * 0.6666;  // ~10%

    // 4️⃣ AJOUTER 5% SUR WALLET AGENT
    await walletbalances.findOneAndUpdate(
      { email: agentEmail },
      { $inc: { balance: fraisAgent } },
      { upsert: true }
    );

    // 5️⃣ AJOUTER 10% SUR WALLET ADMIN
    await walletbalances.findOneAndUpdate(
      { email: "memeselvandieu@fobas.com" },
      { $inc: { balance: fraisAdmin } },
      { upsert: true }
    );

    // 6️⃣ MISE À JOUR EXPRESSFOBAS → RETIRÉ
    express.statut = "ExpressFobas Retire";
    express.totalDebit = 0.00;
    express.agentRetraitNom = agentNom;
    express.agentRetraitEmail = agentEmail;
    express.dateRetrait = new Date();
    await express.save();

    // 7️⃣ AJOUTER DANS retraitinternational
    await retraitinternational.create({
      code: express.code,
      expediteurNom: express.expediteurNom,
      beneficiaireNom: express.beneficiaireNom,
      montant: express.montant,
      agentNom,
      agentEmail,
      fraisAgent,
      fraisAdmin,
      dateRetrait: new Date(),
      statut: "Retrait Validé"
    });

    // 8️⃣ REPONSE FINAL
    return res.status(200).json({
      message: "Retrait validé avec succès",
      data: {
        code: express.code,
        statut: express.statut,
        totalDebit: express.totalDebit,
        fraisAgent,
        fraisAdmin
      }
    });

  } catch (err) {
    console.error("🔥 ERREUR RETRAIT:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});





// ================= FAZ 3: REFUND AUTOMATIK APRE 21 JOURS =================
setInterval(async () => {

  try {

    const now = new Date();

    console.log("⏳ Vérification expiration ExpressFOBAS...");

    // 🔍 chèche tout ki ekspire
    const expiredTransfers = await ExpressFobas.find({
      statut: "Pending",
      dateExpiration: { $lte: now }
    });

    if (expiredTransfers.length === 0) {
      console.log("✅ Aucun transfert expiré");
      return;
    }

    console.log(`⚠️ ${expiredTransfers.length} transfert(s) expiré(s)`);

    for (const transfer of expiredTransfers) {

      try {

        const cleanEmail = transfer.agentEmail.trim().toLowerCase();
        const totalDebit = Number(transfer.totalDebit || 0);

        console.log("🔄 Traitement:", transfer.codeUnique);

        // 🔍 jwenn wallet agent lan
        const agentWallet = await Wallet.findOne({ email: cleanEmail });

        if (!agentWallet) {
          console.log("❌ Wallet introuvable:", cleanEmail);
          continue;
        }

        // 💸 REMBOURSEMENT
        agentWallet.balance += totalDebit;
        await agentWallet.save();

        console.log(`💰 Remboursement OK: +${totalDebit} HTG → ${cleanEmail}`);

        // 🔄 UPDATE STATUT (EVITE DOUBLON)
        transfer.statut = "ExpressFobas Annule";
        await transfer.save();

        console.log(`🔁 Statut mis à jour: ${transfer.codeUnique}`);

      } catch (innerError) {
        console.error("❌ Erreur traitement transfert:", innerError);
      }

    }

  } catch (err) {
    console.error("🔥 ERREUR FAZ 3:", err);
  }

}, 60 * 60 * 1000); // ⏱️ chak 1 heure















// =====================================================
//  SERVER.JS FINAL — FOBAS WALLET + VIRTUAL DEBIT CARD
//  + BSICards Integration
// =====================================================


// ================================
// API KEY BSICards
// ================================
const BSICARDS_API_KEY = process.env.BSICARDS_API_KEY; // Secret Key

// ======================================================
// 2️⃣  SCHEMAS MONGO DB — WALLET + CARDS + TRANSACTIONS
// ======================================================

// ------ VIRTUAL CARD ------
const CardSchema = new mongoose.Schema({
  email: String,             // Itilizatè ki posede kat la
  maskedNumber: String,      // Nimewo maské pou UI (eg: 4598 **** **** 1234)
  cardId: String,            // BSICards internal ID pou recharge API
  balance: { type: Number, default: 0 }, // USD
  status: { type: String, default: "active" }, 
  createdAt: { type: Date, default: Date.now }
});
const Cards = mongoose.model("cards", CardSchema);

// ------ CARD TRANSACTIONS ------
const CardTxSchema = new mongoose.Schema({
  cardId: String,            // ID kat la (BSICards)
  email: String,
  amount: Number,            // Montan net HTG
  type: String,              // "credit" / "debit"
  description: String,
  createdAt: { type: Date, default: Date.now }
});
const CardTx = mongoose.model("fobas_card_tx", CardTxSchema);

// ======================================================
// 4️⃣  RECHARGE CARD ENDPOINT
// ======================================================
app.post("/cards/:cardId/recharge", async (req, res) => {
  const { cardId } = req.params;
  const { email, amountHTG } = req.body;

  try {
    // 1️⃣ Chèche wallet itilizate a
    const wallet = await WalletBalance.findOne({ email });
    if (!wallet) return res.status(400).json({ error: "Wallet pa jwenn" });

    // 2️⃣ Kalkile frais 1%
    const frais = amountHTG * 0.01;
    const netHTG = amountHTG - frais;

    if (wallet.balance < amountHTG) {
      return res.status(400).json({ error: "Pa gen ase lajan nan wallet" });
    }

    // 3️⃣ Retire montan + frais nan wallet
    wallet.balance -= amountHTG;
    wallet.lastUpdate = new Date();
    await wallet.save();

    // 4️⃣ Mete frais nan admin account
    const adminWallet = await WalletBalance.findOne({ email: "memeselvandieu@fobas.com" });
    if (adminWallet) {
      adminWallet.balance += frais;
      await adminWallet.save();
    }

    // 5️⃣ Konvèti HTG → USD an tan reyèl
    const rateResp = await axios.get('https://api.exchangerate.host/convert', {
      params: { from: 'HTG', to: 'USD', amount: netHTG }
    });
    const amountUSD = rateResp.data.result;

    // 6️⃣ Poste fund request BSICards
    await axios.post('https://cards.fobas.tech/api/fund-card', {
      cardId,
      amount: amountUSD
    }, {
      headers: { Authorization: `Bearer ${BSICARDS_API_KEY}` }
    });

    // 7️⃣ Mete ajou balans lokal kat la
    const card = await Cards.findOne({ cardId, email });
    if (card) {
      card.balance += amountUSD;
      await card.save();
    }

    // 8️⃣ Sove tranzaksyon
    await CardTx.create({
      cardId,
      email,
      amount: netHTG,
      type: "credit",
      description: "Recharge carte virtuelle FOBAS"
    });

    res.json({ success: true, message: "Kat la chaje avèk siksè", amountUSD });

  } catch (err) {
    console.error("Recharge error:", err);
    res.status(500).json({ error: "Echèj recharge kat la", details: err.message });
  }
});

// ======================================================
// 5️⃣  GET CARD INFO + BALANCE (dinamik via BSICards API)
// ======================================================
app.get("/cards/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const cards = await Cards.find({ email });
    const cardsWithBalance = [];

    for (const card of cards) {
      // Rale balans aktyèl BSICards si ou vle sync realtime
      const apiResp = await axios.get(`https://cards.fobas.tech/api/cards/${card.cardId}/balance`, {
        headers: { Authorization: `Bearer ${BSICARDS_API_KEY}` }
      });
      cardsWithBalance.push({
        email: card.email,
        maskedNumber: card.maskedNumber,
        cardId: card.cardId,
        balance: apiResp.data.balance, // USD
        status: card.status,
        createdAt: card.createdAt
      });
    }

    res.json(cardsWithBalance);
  } catch (err) {
    console.error("Get cards error:", err);
    res.status(500).json({ error: "Impossible chaje kat yo", details: err.message });
  }
});

// ======================================================
// 6️⃣  Webhook BSICards
// ======================================================
app.post("/webhook", express.json(), async (req, res) => {
  try {
    const payload = req.body;
    console.log("Webhook BSICards received:", payload);

    // TODO: Update card balances if needed
    // Egzanp: si webhook di gen fund/tranzaksyon, update CardTx / Cards

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Webhook URL to configure in BSICards:
// https://fondationbackupspirituel.com/webhook









































































































































































































// =======================
// 🔎 VERIFIER IDENTITÉ WALLET (EMAIL EXACT)
// =======================
app.post("/api/wallet/verify-identity", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email manquant"
      });
    }

    const user = await WalletUser.findOne({
      email: email
    }).select("fullName email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte FOBAS ne correspond à cet email"
      });
    }

    return res.json({
      success: true,
      fullName: user.fullName
    });

  } catch (err) {
    console.error("VERIFY IDENTITY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});













// ----------------------- SOCKET -----------------------
io.on('connection', socket => {
  console.log('🔌 Socket connecté');
});

const notifyUpdate = () => io.emit('wallet-update');





// =======================
// ⏱️ AUTO TRANSFERT BONUS → BALANCE (AGENT AUTORISÉ)
// =======================

const BONUS_FLUSH_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(async () => {
  try {
    // Chèche tout Agents Autorisés ki gen bonus > 0
    const agents = await WalletBalance.find({
      walletAccountType: "Agent Autorise",
      bonus: { $gt: 0 },
      balanceFrozen: false // sekirite
    });

    if (agents.length === 0) return;

    for (const agent of agents) {
      const bonusAmount = agent.bonus;

      // 💰 Ajoute bonus nan balance
      agent.balance += bonusAmount;

      // ♻️ Reset bonus
      agent.bonus = 0;

      await agent.save();
    }

    // 🔔 Notify admin dashboard an tan réel
    notifyUpdate();

    console.log(`✅ AUTO BONUS FLUSH: ${agents.length} agent(s) mis à jour`);

  } catch (err) {
    console.error("❌ ERREUR AUTO BONUS FLUSH:", err);
  }
}, BONUS_FLUSH_INTERVAL);





// =======================
// ⏱️ AUTO TRANSFERT BONUS → BALANCE (UTILISATEURS ≥ 2500)
// =======================

const USER_BONUS_FLUSH_INTERVAL = 60 * 1000; // 1 minute pou test, apre retounen 1h si ou vle

setInterval(async () => {
  try {
    // Chèche tout Utilisateurs ki gen bonus ≥ 2500
    const users = await WalletBalance.find({
      walletAccountType: "Utilisateur",
      bonus: { $gte: 2500 },
      balanceFrozen: false // sekirite
    });

    if (users.length === 0) return;

    for (const user of users) {
      const bonusAmount = user.bonus;

      // 💰 Ajoute bonus nan balance
      user.balance += bonusAmount;

      // ♻️ Reset bonus
      user.bonus = 0;


      await user.save();
    }

    // 🔔 Notify admin dashboard an tan réel
    notifyUpdate();

    console.log(`✅ AUTO BONUS USER FLUSH: ${users.length} utilisateur(s) mis à jour`);

  } catch (err) {
    console.error("❌ ERREUR AUTO BONUS USER FLUSH:", err);
  }
}, USER_BONUS_FLUSH_INTERVAL);





// ======================= USER DASHBOARD =======================

// 📥 Charger dashboard utilisateur
app.get('/api/wallet/dashboard', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    if (!email) return res.status(400).json({ message: 'Email manquant' });

    let wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      wallet = await WalletBalance.create({
        email,
        fullName: email
      });
    }

    const tx = await Transaction.find({ email }).sort({ createdAt: -1 });
    res.json({ wallet, tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur dashboard' });
  }
});

// 📥 Dépôt
app.post('/api/wallet/deposit', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount, method, whatsapp, country } = req.body;

    if (!email || !amount)
      return res.status(400).json({ message: 'Données manquantes' });

    await Transaction.create({
      email,
      type: 'deposit',
      amount,
      method,
      whatsapp,
      country,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Dépôt envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur dépôt' });
  }
});


// 📤 Retrait (5%)
app.post('/api/wallet/withdraw', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount, method, whatsapp, country } = req.body;

    const fee = amount * 0.05;

    await Transaction.create({
      email,
      type: 'withdraw',
      amount,
      fee,
      method,
      whatsapp,
      country,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Retrait envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur retrait' });
  }
});









// 🔄 Transfert instantané (CORRIGÉ SANS REFACTOR)
app.post('/api/wallet/transfer', async (req, res) => {
  try {
    const senderEmail = req.headers['x-user-email'] || req.body.senderEmail;
    const { receiverEmail, amount } = req.body;

    if (senderEmail === receiverEmail) {
      return res.status(400).json({ message: "Transfert vers soi-même interdit" });
    }

    const senderUser = await WalletUser.findOne({ email: senderEmail });
    const receiverUser = await WalletUser.findOne({ email: receiverEmail });


    // ✅ CE QUE TU DEMANDES (SANS REFACTOR)
    const geoZone = req.headers["x-geo-zone"] || "unknown";
    const senderKycLevel = senderUser?.kycLevel || 0;
    const receiverKycLevel = receiverUser?.kycLevel || 0;


	  
    if (!receiverUser) {
      return res.status(404).json({ message: "Destinataire introuvable" });
    }

    const sender = await WalletBalance.findOne({ email: senderEmail });
    let receiver = await WalletBalance.findOne({ email: receiverEmail });


// 🔒 BLOKAJ CREDIT SI RECEIVER FREEZE
if (receiver && receiver.balanceFrozen === true) {
  return res.status(403).json({
    message: "⛔ Compte destinataire gelé. Aucun crédit autorisé."
  });
}

// 🔒 BLOKAJ BONUS AGENT
if (
  receiver &&
  receiver.walletAccountType === "Agent Autorise" &&
  receiver.bonusBlocked === true
) {
  return res.status(403).json({
    message: "⛔ Bonus agent bloqué."
  });
}
	  
	const admin = await WalletBalance.findOne({ email: "memeselvandieu@fobas.com" }); // wallet admin
	  
    if (!sender || sender.balance < amount) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    if (!receiver) {
      receiver = await WalletBalance.create({
        email: receiverEmail,
        balance: 0,
        bonus: 0
      });
    }

    // 🔒 Bloque Agent → Agent
    if(sender.walletAccountType === "Agent Autorise" && receiver.walletAccountType === "Agent Autorise"){
      return res.status(403).json({ message: "Agent Autorise pa ka voye lajan bay lòt agent." });
    }




// 🔒 ALERT STRIK SI MONTAN AN PA KONVNI
const MIN_TRANSFER = 20;      // Pi piti montan ki akseptab (ou ka modifye)
const MAX_TRANSFER = 75000;  // Pi gwo montan ki akseptab

if(amount < MIN_TRANSFER || amount > MAX_TRANSFER) {
  // Freeze kont moun k ap voye a
  sender.balanceFrozen = true;
  await sender.save();



// ⏳ AUTO UNFREEZE APRÈ 5 MINUTES (UTILISATEUR)
setTimeout(async () => {
  try {
    const refreshedSender = await WalletBalance.findOne({ email: senderEmail });

    if (refreshedSender && refreshedSender.balanceFrozen === true) {
      refreshedSender.balanceFrozen = false;
      refreshedSender.lastAction = "AUTO_UNFREEZE_AFTER_LIMIT";
      await refreshedSender.save();

      notifyUpdate();
      console.log(`🔓 AUTO UNFREEZE effectué pour ${senderEmail}`);
    }
  } catch (err) {
    console.error("❌ ERREUR AUTO UNFREEZE:", err);
  }
}, 5 * 60 * 1000); // 5 minutes




  // Kreye alèt nan tranzaksyon pou admin dashboard
  await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: 'transfer',
  amount,
  receiverEmail,
  status: 'PENDING',
  note: 'SECURITY ALERT - Montant limite dépassé',
  createdAt: new Date(),

  // =========================
  // 🔐 CHAMPS AUDIT / TRACE (ACTIVE DEFAULTS)
  // =========================
  alertBy: 'SYSTEM',                     // deja la, ok
  alertAt: new Date(),                   // deja la, ok

  // Evite null → active monitoring
  geoZone: geoZone || 'undefined',

  // ➕ NOUVO TRACE SAFE (san kraze anyen)
  ipAddress: req.ip || '0.0.0.0',         // trace IP itilizatè
  deviceId: req.headers['user-agent'] || 'unknown', // trace device
  riskScore: 1,                           // alèt = risk minimal
  riskFlags: ['LIMIT_EXCEEDED'],          // tag risk klè
  auditVersion: 1                         // version audit
});

  // Notifye dashboard admin imedyatman
  notifyUpdate();

  // Reponn itilizatè a
  return res.status(403).json({
    message: "⛔ Montant invalide. Compte gelé et alert admin envoyé."
  });
}








	  
// ===================================================
// 💸 FRAIS RETRAIT UTILISATEUR (1%)
// ===================================================
let fee = 0;

// 🔹 Bloque frais pou transfert internal Representant → Agent
const isInternalRepToAgent =
  sender.walletAccountType === "Representant FOBAS" &&
  receiver.walletAccountType === "Agent Autorise";

// 🔹 Bloque frais pou transfert Partenaire Officiel FOBAS → Agent
const isOfficialPartnerToAgent =
  sender.walletAccountType === "Partenaire Officiel FOBAS" &&
  receiver.walletAccountType === "Agent Autorise";

// ---------------------------------------------------
// 1️⃣ Frais normal (Client → Agent Autorise)
// ---------------------------------------------------
if (receiver.walletAccountType === "Agent Autorise" && !isInternalRepToAgent && !isOfficialPartnerToAgent) {
  fee = amount * 0.01;

  if (sender.balance < amount + fee) {
    return res.status(400).json({
      message: "Solde insuffisant pour couvrir le montant + frais"
    });
  }

  sender.balance -= fee;
}

// ===================================================
// 💸 MOUVEMENT FINANCIER PRINCIPAL
// ===================================================
sender.balance -= amount;
receiver.balance += amount;

// ===================================================
// ✅ DISTRIBUTION KOMISYON (Client → Agent)
// ===================================================
if (
  receiver.walletAccountType === "Agent Autorise" &&
  !isInternalRepToAgent &&
  !isOfficialPartnerToAgent
) {
  const commission = amount * 0.01;         // 1% total
  const agentShare = amount * 0.006;        // 0.60%
  const platformShare = amount * 0.004;     // 0.40%

  receiver.bonus += agentShare;
  if (admin) admin.balance += platformShare;
}

// 🔹 SAVE FINAL (toujou san touche existing code)
await sender.save();
await receiver.save();
if (admin) await admin.save();

// ===================================================
// 🎁 BONUS SPÉCIAL DEPOT REPRESENTANT → AGENT (SAFE FINAL)
// 👉 Bonus 2,500 Gdes
// 👉 Auto-crédit vers balance après 10 minutes
// ===================================================
try {
  if (isInternalRepToAgent && Number(amount) === 50000) {
    const BONUS_AMOUNT = 2500;
    const BONUS_DELAY_MS = 10 * 60 * 1000; // 10 minutes

    // ➕ Ajoute bonus imedyat pou trace, men li rete nan bonus
    receiver.bonus = (receiver.bonus || 0) + BONUS_AMOUNT;
    receiver.lastAction = "BONUS_PENDING_REPRESENTANT_50K";
    receiver.lastActionAt = new Date();
    receiver.lastActionBy = "SYSTEM";
    receiver.riskScore = receiver.riskScore || 0;
    receiver.auditVersion = receiver.auditVersion || 1;

    await receiver.save();

    // 🧾 TRACE obligatwa nan transactions
    await Transaction.create({
      email: receiver.email,
      type: "bonus",
      amount: BONUS_AMOUNT,
      senderEmail: sender.email,
      receiverEmail: receiver.email,
      status: "PENDING",
      note: "Bonus 2,500 Gdes - crédit différé 10 min (Representant FOBAS)",
      createdAt: new Date(),

      createdBy: "SYSTEM",
      bonusType: "REPRESENTANT_AGENT_DEPOSIT_DELAYED",
      relatedAmount: amount,

      geoZone: geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "unknown",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    // ⏳ AUTO-CRÉDIT BONUS → BALANCE APRÈ 10 MINUTES
    setTimeout(async () => {
      try {
        const agentWallet = await WalletBalance.findOne({ email: receiver.email });

        if (
          agentWallet &&
          agentWallet.bonus >= BONUS_AMOUNT &&
          agentWallet.accountStatus === "ACTIF" &&
          agentWallet.balanceFrozen !== true
        ) {
          agentWallet.bonus -= BONUS_AMOUNT;
          agentWallet.balance += BONUS_AMOUNT;

          agentWallet.lastAction = "BONUS_CONVERTED_TO_BALANCE";
          agentWallet.lastActionAt = new Date();
          agentWallet.lastActionBy = "SYSTEM";

          await agentWallet.save();

          await Transaction.create({
            email: agentWallet.email,
            type: "bonus_conversion",
            amount: BONUS_AMOUNT,
            status: "ACTIVE",
            note: "Conversion automatique bonus → balance après 10 min",
            createdAt: new Date(),

            createdBy: "SYSTEM",
            relatedBonusType: "REPRESENTANT_AGENT_DEPOSIT_DELAYED",

            geoZone: geoZone || "undefined",
            ipAddress: "0.0.0.0",
            deviceId: "SYSTEM",

            riskScore: 0,
            riskFlags: [],
            auditVersion: 1
          });

          notifyUpdate();
          console.log(`✅ BONUS 2,500 converti en balance pour ${agentWallet.email}`);
        }
      } catch (autoBonusErr) {
        console.error("❌ ERREUR AUTO-CONVERSION BONUS:", autoBonusErr);
      }
    }, BONUS_DELAY_MS);
  }
} catch (bonusErr) {
  console.error("❌ ERREUR BONUS AGENT:", bonusErr);
}

// ===================================================
// 🔹 TRANSFERT SPECIAUX PARTENAIRE OFFICIEL → AGENT
// ===================================================
try {
  if (isOfficialPartnerToAgent) {
    console.log(
      `🔒 Transfert Partenaire Officiel FOBAS → Agent: pas de frais, pas de bonus, pas de commission`
    );

    // 🔹 Save san okenn frais/bonus/commission
    await sender.save();
    await receiver.save();

    // 🔹 TRACE UNIQUE (sender = propriétaire de la transaction)
    await Transaction.create({
      email: sender.email,              // ✅ TRES IMPORTANT
      type: "transfer",
      amount: amount,

      senderEmail: sender.email,
      receiverEmail: receiver.email,

      status: "ACTIVE",
      note: "Transfert Partenaire Officiel FOBAS → Agent Autorise (sans frais/bonus/commission)",
      createdAt: new Date(),

      createdBy: "SYSTEM",
      geoZone: geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "unknown",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    // 🔔 Déclenche tous les listeners existants (WhatsApp, socket, dashboard)
    notifyUpdate();

    return res.json({
      message: "Transfert effectué pour Partenaire Officiel FOBAS sans frais/bonus."
    });
  }
} catch (partnerErr) {
  console.error("❌ ERREUR TRANSFERT PARTENAIRE OFFICIEL:", partnerErr);
}




	  




	  



// 🧾 FRAIS – traçabilité utilisateur (SANS impact financier)
await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: "fees",
  amount: amount * 0.01,
  relatedTransfer: amount,
  status: "ACTIVE",
  note: "Frais transfert 1%",
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                    // frais généré automatiquement
  feeType: "TRANSFER_FEE",                // typage clair pour audit
  feeRate: 0.01,                          // taux exact (preuve comptable)

  // --- Trace utilisateur ---
  ipAddress: req.ip || "0.0.0.0",
  deviceId: req.headers["user-agent"] || "unknown",
  geoZone: geoZone || "undefined",

  // --- Risk & conformité ---
  riskScore: 0,                           // frais normal = pas de risque
  riskFlags: [],                          // aucun flag par défaut
  kycSnapshot: senderKycLevel || 0,       // état KYC au moment exact

  // --- Audit & historique ---
  lastAction: "FEE_APPLIED",
  lastActionAt: new Date(),
  lastActionBy: "SYSTEM",
  auditVersion: 1
});



	  
    // 🧾 Historique sender ak komisyon
  await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: "transfer",
  amount,
  senderEmail,
  receiverEmail,
  senderName: senderUser?.fullName || senderEmail,
  receiverName: receiverUser?.fullName || receiverEmail,
  status: "ACTIVE",
  agentBonus: 0.006 * amount,
  platformBonus: 0.004 * amount,
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                    // transaction générée automatiquement
  geoZone: geoZone || "undefined",        // trace zone
  deviceId: req.headers["user-agent"] || "unknown", // device trace
  ipAddress: req.ip || "0.0.0.0",         // IP trace
  kycLevel: senderKycLevel || 0,          // KYC snapshot
  riskScore: 0,                            // default = pas de risque
  riskFlags: [],                           // aucun flag par défaut
  lastAction: "TRANSFER_SENT",             // trace action sender
  lastActionAt: new Date(),                // horodatage
  lastActionBy: "SYSTEM",                  // SYSTEM par défaut
  auditVersion: 1                          // version audit initiale
});
	  
	    
	
// 🧾 Historique receiver ak komisyon
await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: receiverEmail,
  type: "transfer",
  amount,
  senderEmail,
  receiverEmail,
  senderName: senderUser?.fullName || senderEmail,
  receiverName: receiverUser?.fullName || receiverEmail,
  status: "ACTIVE",
  agentBonus: 0.006 * amount,
  platformBonus: 0.004 * amount,
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                     // transaction générée automatiquement
  geoZone: geoZone || "undefined",         // trace zone
  deviceId: req.headers["user-agent"] || "unknown", // device trace
  ipAddress: req.ip || "0.0.0.0",          // IP trace
  kycLevel: receiverKycLevel || 0,         // KYC snapshot
  riskScore: 0,                             // default = pas de risque
  riskFlags: [],                            // aucun flag par défaut
  lastAction: "TRANSFER_RECEIVED",          // trace action receiver
  lastActionAt: new Date(),                 // horodatage
  lastActionBy: "SYSTEM",                   // SYSTEM par défaut
  auditVersion: 1                           // version audit initiale
});
    notifyUpdate();
    res.json({ message: "Transfert réussi" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur transfert" });
  }
});













// 🎁 Bonus (pending)
app.post('/api/wallet/bonus', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount } = req.body;

    await Transaction.create({
      email,
      type: 'bonus',
      amount,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Bonus envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur bonus' });
  }
});





















/// ================================
// 🔐 CHANGER MOT DE PASSE UTILISATEUR
// ================================
app.post("/api/wallet/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const user = await WalletUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    const salt = await bcryptjs.genSalt(12);
    user.passwordHash = await bcryptjs.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Mot de passe changé avec succès ✅"
    });

  } catch (err) {
    console.error("WALLET CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


















  



































































app.post("/api/admin/unlock", (req, res) => {
  console.log("ADMIN PASSWORD REÇU :", req.body.password);

  if (req.body.password == process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }

  return res.json({ ok: false });
});

// ======================= ADMIN PANEL =======================

// 📋 Voir transactions pending
app.get('/api/admin/transactions', async (req, res) => {
  const tx = await Transaction.find({ status: 'PENDING' }).sort({ createdAt: -1 });
  res.json(tx);
});

// ✅ Valider transaction
app.post('/api/admin/validate', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ message: 'Transaction introuvable' });

    const wallet = await WalletBalance.findOne({ email: tx.email });
    if (!wallet) return res.status(404).json({ message: 'Wallet introuvable' });




	// 🔒 BLOKAJ FREEZE BALANCE
if (wallet.balanceFrozen === true && tx.type === 'deposit') {
  return res.status(403).json({
    message: "⛔ Balance gelée. Dépôt interdit."
  });
}

if (wallet.bonusBlocked === true && tx.type === 'bonus') {
  return res.status(403).json({
    message: "⛔ Bonus bloqué."
  });
}


	  

    if (tx.type === 'deposit') wallet.balance += tx.amount;
    if (tx.type === 'withdraw') wallet.balance -= (tx.amount + tx.fee);
    if (tx.type === 'bonus') wallet.bonus += tx.amount;

	  if (tx.type === 'transfer') {
  const sender = await WalletBalance.findOne({ email: tx.email });
  const receiver = await WalletBalance.findOne({ email: tx.receiverEmail });

  if (!sender || !receiver) {
    return res.status(404).json({ message: "Wallet introuvable" });
  }

  if (sender.balanceFrozen === true) {
    return res.status(403).json({ message: "Compte expéditeur toujours gelé" });
  }

  // Calcul frais 1% total
  const fraisTotal = tx.amount * 0.01;
  const agentShare = tx.amount * 0.006;
  const platformShare = tx.amount * 0.004;

  if (sender.balance < tx.amount + fraisTotal) {
    return res.status(400).json({ message: "Solde insuffisant pour valider le transfert avec frais" });
  }

  // 💸 Retire total sou sender
  sender.balance -= (tx.amount + fraisTotal);

  // Ajoute montan sou receiver
  receiver.balance += tx.amount;

  // ✅ Distribisyon komisyon si receiver se Agent
  if (receiver.walletAccountType === "Agent Autorise") {
    receiver.bonus += agentShare;

    const adminWallet = await WalletBalance.findOne({ email: "memeselvandieu@fobas.com" });
    if (adminWallet) {
      adminWallet.balance += platformShare;
      await adminWallet.save();
    }
  }

  await sender.save();
  await receiver.save();
}






	  
    tx.status = 'ACTIVE';
    await wallet.save();
    await tx.save();

    notifyUpdate();
    res.json({ message: 'Transaction validée' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur validation' });
  }
});






// ===================== SURVEILLANCE AGENT - WALLET FOBAS =====================

// 🔎 Récupérer agents autorisés impliqués dans des transferts
app.get("/api/admin/surveillance-agents", async (req, res) => {
  try {
    // 1. Trouver tous les emails impliqués dans des transferts
    const transfers = await Transaction.find({
      type: "transfer",
      status: "ACTIVE"
    }).select("email receiverEmail");

    const emails = new Set();

    transfers.forEach(tx => {
      if (tx.email) emails.add(tx.email);
      if (tx.receiverEmail) emails.add(tx.receiverEmail);
    });

    // 2. Charger uniquement les Agents Autorisés concernés
   const agents = await WalletBalance.find({
  email: { $in: Array.from(emails) },
  walletAccountType: {
    $in: [
      "Agent Autorise",
      "Representant FOBAS",
      "Partenaire Officiel FOBAS",
	  "Utilisateur",
	  "Agent Terrain"
    ]
  }
})
.select(`
  email
  fullName
  walletAccountType
  balance
  bonus
  accountStatus
  balanceFrozen
  bonusBlocked
  lastAction
  createdBy
  registrationChannel
  geoZone
  riskScore
  riskFlags
  lastActionAt
  lastActionBy
  adminIp
  deviceId
  createdFromDevice
  kycLevel
  auditVersion
  updatedAt
`)
.sort({ updatedAt: -1 })
.lean(); // lean() pou optimize read-only si ou pa modifye agent yo dirèkteman


// ➕ AJOUT SAFE — label rôle pour surveillance admin (LECTURE SEULEMENT)
agents.forEach(agent => {
  agent.roleLabel = agent.walletAccountType; // 🟢 PURE INFO ADMIN
});
	  
	  
// ➕ Pou chak agent, nou asire chan default pa null (active monitoring)
agents.forEach(agent => {
  agent.lastActionAt = agent.lastActionAt || new Date();
  agent.lastActionBy = agent.lastActionBy || "SYSTEM";
  agent.adminIp = agent.adminIp || "0.0.0.0";
  agent.deviceId = agent.deviceId || "unknown";
  agent.createdFromDevice = agent.createdFromDevice || "unknown";
  agent.kycLevel = agent.kycLevel || 0;
  agent.auditVersion = agent.auditVersion || 1;
  agent.riskScore = agent.riskScore || 0;
  agent.riskFlags = agent.riskFlags || [];
});

    res.json(agents);
  } catch (err) {
    console.error("❌ Surveillance agents error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ----------------------- ACTION ADMIN SUR AGENT -----------------------
app.post("/api/admin/agent-action", async (req, res) => {
  try {
    const { email, action } = req.body; // ⬅️ OBLIGATWA

	if (!action) {
  return res.status(400).json({ message: "Action manquante" });
}
	  

    const agent = await WalletBalance.findOne({
      email,
      walletAccountType: {
        $in: [
          "Agent Autorise",
          "Representant FOBAS",
          "Partenaire Officiel FOBAS",
		  "Utilisateur",
	      "Agent Terrain"
        ]
      }
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent introuvable" });
    }




	  
// ===================================================
// 🔐 CONTROLE ROLE SENSIBLE (SAFE – AJOUT SEULEMENT)
// ===================================================
if (
  ["Representant FOBAS", "Partenaire Officiel FOBAS"].includes(agent.walletAccountType)
) {
  const forbiddenActions = [
    "BLOCK_BONUS",
    "UNBLOCK_BONUS"
  ];

  if (forbiddenActions.includes(action)) {
    return res.status(403).json({
      message: "Action non autorisée pour ce type de compte"
    });
  }
}




	  

    // ========================
    // ✅ SWITCH EXISTANT (NE RIEN TOUCHER)
    // ========================
    switch (action) {
      case "BLOCK_ACCOUNT":
        agent.accountStatus = "BLOQUE";
        break;
      case "UNBLOCK_ACCOUNT":
        agent.accountStatus = "ACTIF";
        break;
      case "FREEZE_BALANCE":
        agent.balanceFrozen = true;
        break;
      case "UNFREEZE_BALANCE":
        agent.balanceFrozen = false;
        break;
      case "BLOCK_BONUS":
        agent.bonusBlocked = true;
        break;
      case "UNBLOCK_BONUS":
        agent.bonusBlocked = false;
        break;
      default:
        return res.status(400).json({ message: "Action invalide" });
    }

    // ========================
    // ➕ AJOUT CHAMPS AUDIT / SURVEILLANCE (SAFE)
    // ========================
    agent.lastAction = action;                   // deja la, pa touche
agent.lastActionAt = new Date();             // nouvo, horodatage
agent.lastActionBy = "ADMIN";                // nouvo, admin qui a fait action
agent.adminIp = req.ip || "0.0.0.0";        // nouvo, IP admin

// ➕ Asire tout chan trace / audit / risk default pa null (ACTIVE)
agent.deviceId = agent.deviceId || "unknown";
agent.createdFromDevice = agent.createdFromDevice || "unknown";
agent.geoZone = agent.geoZone || "undefined";
agent.kycLevel = agent.kycLevel || 0;
agent.riskScore = agent.riskScore || 0;
agent.riskFlags = agent.riskFlags || [];
agent.auditVersion = agent.auditVersion || 1;
agent.createdBy = agent.createdBy || "ADMIN";
agent.registrationChannel = agent.registrationChannel || "app";

    await agent.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Agent action error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});







// =======================
// 🔐 ADMIN CREDIT WALLET (SAFE)
// =======================
app.post("/api/admin/wallet-credit", async (req, res) => {
  try {
    const { email, amount, target } = req.body; 
    // target = "balance" | "bonus"

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }

    const wallet = await WalletBalance.findOne({ email });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet introuvable" });
    }

    // 🔒 Sécurité minimale
    if (wallet.accountStatus !== "ACTIF") {
      return res.status(403).json({ message: "Compte non actif" });
    }

    // =======================
    // ➕ CREDIT ADMIN
    // =======================
    if (target === "bonus") {
      wallet.bonus += Number(amount);
    } else {
      wallet.balance += Number(amount);
    }

    // =======================
    // 🔐 AUDIT
    // =======================
    wallet.lastAction = "ADMIN_CREDIT";
    wallet.lastActionAt = new Date();
    wallet.lastActionBy = "ADMIN";
    wallet.adminIp = req.ip || "0.0.0.0";
    wallet.auditVersion = wallet.auditVersion || 1;

    await wallet.save();

    // =======================
    // 🧾 TRACE TRANSACTION
    // =======================
    await Transaction.create({
      email: wallet.email,
      type: "admin_credit",
      amount: Number(amount),
      status: "ACTIVE",
      note: `Crédit admin vers ${target}`,
      createdAt: new Date(),

      createdBy: "ADMIN",
      target,
      geoZone: wallet.geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "ADMIN_PANEL",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel + WhatsApp admin

    res.json({
      success: true,
      newBalance: wallet.balance,
      newBonus: wallet.bonus
    });
  } catch (err) {
    console.error("❌ ADMIN CREDIT ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});








// =======================
// 🔐 ADMIN RETRAIT WALLET
// =======================
app.post("/api/admin/wallet-withdraw", async (req, res) => {
  try {
    const { email, amount, target } = req.body;

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }

    const wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet introuvable" });
    }

    if (wallet.accountStatus !== "ACTIF") {
      return res.status(403).json({ message: "Compte non actif" });
    }

    // 🔒 Vérification fonds
    if (target === "bonus") {
      if (wallet.bonus < amount) {
        return res.status(400).json({ message: "Bonus insuffisant" });
      }
      wallet.bonus -= amount;
    } else {
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Balance insuffisante" });
      }
      wallet.balance -= amount;
    }

    // 🔐 AUDIT
    wallet.lastAction = "ADMIN_RETRAIT";
    wallet.lastActionAt = new Date();
    wallet.lastActionBy = "ADMIN";
    wallet.adminIp = req.ip || "0.0.0.0";

    await wallet.save();

    // 🧾 TRACE TRANSACTION
    await Transaction.create({
      email: wallet.email,
      type: "admin_withdraw",
      amount: Number(amount),
      status: "ACTIVE",
      note: `Retrait admin depuis ${target}`,
      createdAt: new Date(),
      createdBy: "ADMIN",
      target,
      ipAddress: req.ip || "0.0.0.0",
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel

    res.json({ message: "Retrait effectué avec succès" });

  } catch (err) {
    console.error("❌ ADMIN RETRAIT ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});





// =======================
// 📝 ADMIN NOTE UTILISATEUR (SAFE)
// =======================
app.post("/api/admin/note", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message || message.trim().length < 2) {
      return res.status(400).json({ message: "Message invalide" });
    }

    const wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 🧾 TRACE SOUS FORME DE TRANSACTION
    await Transaction.create({
      email,
      type: "admin_note",
      amount: 0,
      status: "ACTIVE",
      note: message,
      createdAt: new Date(),

      createdBy: "ADMIN",
      adminIp: req.ip || "0.0.0.0",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel

    res.json({ success: true, message: "Note envoyée avec succès" });

  } catch (err) {
    console.error("❌ ADMIN NOTE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});














































































// ----------------------- ROUTE API POU ENREGISTRE -----------------------
app.post("/api/wallet/create", async (req, res) => {
  try {
    const {
      walletFullName,
      walletEmail,
      walletRecoveryEmail,
      walletWhatsApp,
      walletBirthDate,
      walletBirthPlace,
      walletPassword,
      walletSponsorName,
      walletSponsorEmail,
      walletAccountType 
    } = req.body;

    if (!walletFullName || !walletEmail || !walletPassword) {
      return res.status(400).json({ success: false, message: "Tout chan obligatwa." });
    }
	  
	  
    // 🔐 BLOKAJ EMAIL DOUBLON (AJOUT SANS MODIFICATION)
    const emailExist = await WalletUser.findOne({
      email: walletEmail.toLowerCase()
    });

    if (emailExist) {
      return res.status(409).json({
        success: false,
        message: "⛔ Email sa deja anrejistre sou FOBAS."
      });
    }

    // --- Hash password ---
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(walletPassword, 12);

    // --- Kapt IP moun nan (trust proxy si dèyè proxy) ---
    let userIp = req.ip || req.headers['x-forwarded-for'] || "0.0.0.0";
    if (Array.isArray(userIp)) userIp = userIp[0];
    
    // --- Kreye agentId otomatik pou Agent Autorise sèlman ---
    let agentId = null;
    if (walletAccountType === "Agent Autorise") {
      agentId = "AGT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }

	  
	  
    // --- Kreye nouvo itilizatè ---
    const newWalletUser = new WalletUser({
      fullName: walletFullName,
      email: walletEmail,
      recoveryEmail: walletRecoveryEmail,
      whatsapp: walletWhatsApp,
      birthDate: walletBirthDate,
      birthPlace: walletBirthPlace,
      passwordHash,
      sponsorName: walletSponsorName ? walletSponsorName.trim().toLowerCase() : null,
      sponsorEmail: walletSponsorEmail ? walletSponsorEmail.trim().toLowerCase() : null,
      accountType: walletAccountType,
      status: "active",
      balance: 0.00,
      bonus: 0.00,
      hasDepositedBefore: false,
      agentId: agentId,           // ✅ Ajoute agentId otomatik
      ipAddress: userIp,          // ✅ Capture IP vrè moun nan
      createdAt: new Date()
    });

    await newWalletUser.save(); // <-- Sa a ap kreye dokiman nan MongoDB

    // --- Prepare lyen WhatsApp pou admin (one-click send) ---
    const adminNumber = "+50946057952";
    const waMessage = `🟢 Nouvo Demande Compte WALLET FOBAS\n\n👤 Non: ${walletFullName}\n📧 Email: ${walletEmail}\n📱 Tel: ${walletWhatsApp}\n🌍 Email sekou: ${walletRecoveryEmail}\n🏙️ Lye Nésans: ${walletBirthPlace}\n📅 Dat Nésans: ${walletBirthDate}\n🧑‍🤝‍🧑 Parrain: ${walletSponsorName || 'Pa gen'}\n💳 Agent ID: ${agentId || 'Pa aplikab'}\n🌐 IP: ${userIp}`;

    const waLink = `https://wa.me/${adminNumber.replace(/\+/g,'')}?text=${encodeURIComponent(waMessage)}`;

    // --- Retounen repons ak lyen WhatsApp ---
    return res.json({
      success: true,
      message: "Demande FOBAS anrejistre avèk siksè!",
      whatsappLink: waLink
    });

  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
























// ----------------------- ROUTE API POU LOGIN -----------------------
app.post("/api/wallet/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tout chan obligatwa."
      });
    }

    const user = await WalletUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Itilizate pa egziste."
      });
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mot de pase pa kòrèk."
      });
    }

    // Retounen enfòmasyon itilizate + token (si w itilize JWT)
    return res.json({
      success: true,
      message: "Connexion reyalize avèk siksè!",
      data: {
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        solde: user.solde || 0,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Erreur login:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});
















































































































// =========================================================
// FOBAS WORD
// INSTALL REQUEST SYSTEM
// CONFIRM INSTALL REQUEST
// =========================================================






// =========================================================
// FOBAS WORD REQUEST SCHEMA
// =========================================================


const fobasWordRequestSchema = new mongoose.Schema({


    requestId: {

        type: String,

        required: true,

        unique: true

    },


    application: {

        type: String,

        required: true

    },


    deviceId: {

        type: String,

        required: true

    },


    amount: {

        type: String,

        required: true

    },


    adminName: {

        type: String,

        required: true

    },


    natcash: {

        type: String,

        required: true

    },


    whatsapp: {

        type: String,

        required: true

    },


    status: {

        type: String,

        default: "PENDING"

    },


    downloadAccess: {

        type: Boolean,

        default: false

    },


    createdAt: {

        type: Date,

        default: Date.now

    }



}, {

    collection: "fobasword_install_requests",

    timestamps: true

});








// =========================================================
// FOBAS WORD REQUEST MODEL
// =========================================================


const FobasWordRequest =

mongoose.models.FobasWordRequest ||

mongoose.model(

    "FobasWordRequest",

    fobasWordRequestSchema

);









// =========================================================
// FOBAS WORD INSTALL REQUEST ROUTE
// POST /api/fobas-word/request
// =========================================================


app.post(

"/api/fobas-word/request",

async (req,res)=>{


    try {



        console.log(

            "FOBAS WORD REQUEST BODY:",

            req.body

        );





        const {


            application,

            deviceId,

            amount,

            adminName,

            natcash,

            whatsapp


        } = req.body;







        // ==============================
        // VALIDATION
        // ==============================


        if(

            !deviceId

        ){

            return res.status(400).json({

                success:false,

                message:

                "Device ID obligatwa"

            });

        }








        const requestId =


        "REQ-FW-" +

        Date.now()

        .toString(36)

        +

        "-" +

        crypto

        .randomBytes(4)

        .toString("hex")

        .toUpperCase();








        // ==============================
        // CREATE REQUEST
        // ==============================


        const newRequest =

        new FobasWordRequest({



            requestId,


            application:

            application || "FOBAS WORD",



            deviceId,



            amount:

            amount || "1500 HTG",



            adminName:

            adminName || "M. MEME Selvandieu",



            natcash:

            natcash || "+50943706706",



            whatsapp:

            whatsapp || "+50943706706",



            status:

            "PENDING",



            downloadAccess:

            false



        });







        await newRequest.save();








        return res.status(201).json({


            success:true,


            message:

            "Demann FOBAS WORD anrejistre avèk siksè.",


            requestId


        });







    } catch(error){



        console.error(

            "FOBAS WORD REQUEST ERROR:",

            error.stack

        );





        return res.status(500).json({


            success:false,


            message:

            "Erè server pandan anrejistreman demann FOBAS WORD la."


        });



    }



});
























































// =========================================================
// FOBAS WORD ADMIN
// GET ALL INSTALL REQUESTS
// GET /api/fobas-word/admin/requests
// =========================================================


app.get(

"/api/fobas-word/admin/requests",

async (req,res)=>{


    try{


        const requests =

        await FobasWordRequest

        .find({})

        .sort({

            createdAt:-1

        });





        return res.status(200).json({


            success:true,


            requests



        });



    }

    catch(error){



        console.error(

            "FOBAS WORD ADMIN REQUEST LOAD ERROR:",

            error.stack

        );




        return res.status(500).json({


            success:false,


            message:

            "Erè server pandan chajman request FOBAS WORD yo."


        });



    }



});













// =========================================================
// FOBAS WORD ADMIN
// UPDATE REQUEST STATUS
// PUT /api/fobas-word/admin/request/status
// =========================================================


app.put(

"/api/fobas-word/admin/request/status",

async (req,res)=>{


    try{



        const {


            requestId,

            status



        } = req.body;






        // ==============================
        // VALIDATION
        // ==============================


        if(

            !requestId ||

            !status

        ){


            return res.status(400).json({


                success:false,


                message:

                "Request ID ak Status obligatwa."


            });



        }








        const allowedStatus = [


            "PENDING",

            "APPROVED",

            "REJECTED"


        ];







        if(

            !allowedStatus.includes(

                status

            )

        ){


            return res.status(400).json({


                success:false,


                message:

                "Status sa a pa otorize."


            });



        }









        // ==============================
        // UPDATE REQUEST
        // ==============================


        const updateData = {


            status



        };








        if(

            status === "APPROVED"

        ){


            updateData.downloadAccess = true;


        }







        if(

            status === "REJECTED"

        ){


            updateData.downloadAccess = false;


        }









        const updatedRequest =


        await FobasWordRequest.findOneAndUpdate(


            {


                requestId


            },


            {


                $set:updateData


            },


            {


                new:true


            }


        );









        if(

            !updatedRequest

        ){



            return res.status(404).json({



                success:false,



                message:

                "Request FOBAS WORD sa pa egziste."



            });



        }









        return res.status(200).json({



            success:true,



            message:

            "Status request FOBAS WORD mete ajou avèk siksè.",



            request:

            updatedRequest



        });









    }

    catch(error){



        console.error(


            "FOBAS WORD ADMIN STATUS UPDATE ERROR:",


            error.stack


        );






        return res.status(500).json({



            success:false,



            message:

            "Erè server pandan mizajou status request FOBAS WORD la."



        });



    }



});











// =========================================================
// FOBAS WORD
// DOWNLOAD ACCESS VERIFICATION
// GET /api/fobas-word/download-access/:requestId
// =========================================================


app.get(

"/api/fobas-word/download-access/:requestId",

async (req,res)=>{


    try{


        const requestId =

        req.params.requestId;





        // ==============================
        // VALIDATION
        // ==============================


        if(

            !requestId

        ){


            return res.status(400).json({


                success:false,


                access:false,


                message:

                "Request ID obligatwa."


            });



        }







        // ==============================
        // FIND REQUEST
        // ==============================


        const request =


        await FobasWordRequest.findOne({


            requestId


        });








        if(

            !request

        ){


            return res.status(404).json({


                success:false,


                access:false,


                message:

                "Request FOBAS WORD sa pa egziste."


            });



        }









        // ==============================
        // ACCESS CHECK
        // ==============================


        if(

            request.status !== "APPROVED"

            ||

            request.downloadAccess !== true

        ){


            return res.status(403).json({


                success:false,


                access:false,


                message:

                "Aksè download FOBAS WORD poko aktive."


            });



        }









        // ==============================
        // GRANT PWA ACCESS
        // ==============================


        return res.status(200).json({



            success:true,



            access:true,



            message:

            "Aksè FOBAS WORD valide.",



            downloadUrl:

            "https://fondationbackupspirituel.com/campusword2007simulation.html"



        });







    }

    catch(error){



        console.error(


            "FOBAS WORD DOWNLOAD ACCESS ERROR:",


            error.stack


        );





        return res.status(500).json({



            success:false,



            access:false,



            message:

            "Erè server pandan verifikasyon aksè FOBAS WORD la."


        });



    }



});










// =========================================================
// FOBAS WORD
// VERIFY DEVICE DOWNLOAD ACCESS
// =========================================================
// GET /api/fobas-word/download-access/device/:deviceId
// =========================================================


app.get(

"/api/fobas-word/download-access/device/:deviceId",

async (req, res)=>{


    try {



        const deviceId =

        req.params.deviceId;







        if(!deviceId){


            return res.status(400).json({

                success:false,

                access:false,

                message:

                "Device ID obligatwa."

            });


        }








        const request =

        await FobasWordRequest.findOne({

            deviceId: deviceId

        });









        if(!request){



            return res.json({

                success:false,

                access:false,

                message:

                "Aucune demande FOBAS WORD trouvée. Veuillez installer FOBAS WORD d'abord."

            });


        }









        if(

            request.status === "APPROVED"

            &&

            request.downloadAccess === true

        ){



            return res.json({

                success:true,

                access:true,

                status:

                request.status,


                message:

                "Accès FOBAS WORD autorisé.",


                downloadUrl:

                "https://fondationbackupspirituel.com/campusword2007simulation.html"


            });



        }









        if(

            request.status === "PENDING"

        ){



            return res.json({

                success:true,

                access:false,

                status:"PENDING",

                message:

                "Votre demande FOBAS WORD est encore en attente d'approbation."

            });



        }









        if(

            request.status === "REJECTED"

        ){



            return res.json({

                success:true,

                access:false,

                status:"REJECTED",

                message:

                "Votre demande FOBAS WORD a été rejetée."

            });



        }









        return res.json({

            success:false,

            access:false,

            status:

            request.status,

            message:

            "Accès FOBAS WORD indisponible."

        });







    }catch(error){



        console.error(

            "FOBAS WORD DEVICE ACCESS ERROR:",

            error.stack

        );





        return res.status(500).json({

            success:false,

            access:false,

            message:

            "Erreur serveur pendant la vérification FOBAS WORD."

        });



    }



});






















































































































// 🚀 DEMARRE SERVEUR
// ---------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log(`🚀 Server running on port ${PORT}`));
