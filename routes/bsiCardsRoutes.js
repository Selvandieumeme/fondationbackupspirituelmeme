// ==========================
// BSICARDS API CONFIG
// ==========================
import axios from "axios";

const BSI_BASE_URL = "https://cards.bsigroup.tech/api";
const PUBLIC_KEY = process.env.BSI_PUBLIC_KEY;
const SECRET_KEY = process.env.BSI_SECRET_KEY;

// ==========================
// ROUTE 1: CREATE DIGITAL VISA CARD
// ==========================
app.post("/bsi/create-visa-card", async (req, res) => {
  try {
    const { userEmail, firstname, lastname } = req.body;

    const response = await axios.post(
      `${BSI_BASE_URL}/digital-wallet-visa/create-card`,
      { useremail: userEmail, firstname, lastname },
      {
        headers: {
          publickey: PUBLIC_KEY,
          secretkey: SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("BSI VISA ERROR:", error.response?.data || error.message);
    res.status(400).json({ error: error.response?.data || "Something went wrong" });
  }
});

// ==========================
// ROUTE 2: FUND DIGITAL VISA CARD
// ==========================
app.post("/bsi/fund-visa-card", async (req, res) => {
  try {
    const { userEmail, cardId, amount } = req.body;

    const response = await axios.post(
      `${BSI_BASE_URL}/digital-wallet-visa/fund-card`,
      { useremail: userEmail, cardid: cardId, amount },
      {
        headers: {
          publickey: PUBLIC_KEY,
          secretkey: SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("BSI FUND ERROR:", error.response?.data || error.message);
    res.status(400).json({ error: error.response?.data || "Something went wrong" });
  }
});

// ==========================
// ROUTE 3: GET ALL DIGITAL VISA CARDS
// ==========================
app.post("/bsi/get-all-visa-cards", async (req, res) => {
  try {
    const { userEmail } = req.body;

    const response = await axios.post(
      `${BSI_BASE_URL}/digital-wallet-visa/get-all-cards`,
      { useremail: userEmail },
      {
        headers: {
          publickey: PUBLIC_KEY,
          secretkey: SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("BSI GET ALL ERROR:", error.response?.data || error.message);
    res.status(400).json({ error: error.response?.data || "Something went wrong" });
  }
});

// ==========================
// ROUTE 4: GET SPECIFIC DIGITAL VISA CARD
// ==========================
app.post("/bsi/get-visa-card", async (req, res) => {
  try {
    const { userEmail, cardId } = req.body;

    const response = await axios.post(
      `${BSI_BASE_URL}/digital-wallet-visa/get-card`,
      { useremail: userEmail, cardid: cardId },
      {
        headers: {
          publickey: PUBLIC_KEY,
          secretkey: SECRET_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("BSI GET CARD ERROR:", error.response?.data || error.message);
    res.status(400).json({ error: error.response?.data || "Something went wrong" });
  }
});
