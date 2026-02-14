const FOBAS_API_BASE = "https://api.fondationbackupspirituel.com";

async function verifyAgent(email) {
  const res = await fetch(`${FOBAS_API_BASE}/api/verify-agent-transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return res.json();
}

async function createTransfert(payload) {
  const res = await fetch(`${FOBAS_API_BASE}/api/transfert-express/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function validateWithdraw(code) {
  const res = await fetch(`${FOBAS_API_BASE}/api/transfert-express/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ withdrawCode: code })
  });
  return res.json();
}
