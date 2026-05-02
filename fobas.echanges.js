const API = "https://api.fondationbackupspirituel.com";

// ============================
// LOAD ITEMS
// ============================
async function loadItems() {
  try {
    const res = await fetch(`${API}/api/items`);
    const data = await res.json();

    const box = document.getElementById('items');
    box.innerHTML = "";

    data.forEach(item => {
      box.innerHTML += `
        <div class="card">
          <img src="${item.image || ''}">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <small>${item.category || ''}</small>
        </div>
      `;
    });

  } catch (err) {
    console.log("Load error:", err);
  }
}


// ============================
// CREATE ITEM
// ============================
async function createItem() {

  const user = document.getElementById('userId').value;
  const title = document.getElementById('title').value;
  const desc = document.getElementById('desc').value;
  const category = document.getElementById('category').value;
  const file = document.getElementById('image').files[0];

  if (!user || !title || !desc) {
    alert("Ranpli tout chan yo");
    return;
  }

  if (!file) {
    alert("Image obligatwa");
    return;
  }

  try {

    // ============================
    // UPLOAD IMAGE VIA OFFICIAL API
    // ============================
    const formData = new FormData();
    formData.append("image", file);

    const uploadRes = await fetch(`${API}/api/upload-image`, {
      method: "POST",
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.url) {
      alert("Upload echwe");
      return;
    }

    // ============================
    // CREATE EXCHANGE ITEM
    // ============================
    const item = {
      user,
      title,
      description: desc,
      category,
      image: uploadData.url,
      paid: false
    };

    const res = await fetch(`${API}/api/exchanges/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Erè");
      return;
    }

    alert("Anons pibliye!");
    loadItems();

  } catch (err) {
    console.log("Create error:", err);
    alert("Server error");
  }
}


// ============================
// PAYMENT PROOF (MANUAL NATCASH)
// ============================
function sendProof() {

  const proof = document.getElementById('proof').files[0];

  if (!proof) {
    alert("Chwazi screenshot peman");
    return;
  }

  alert(
    "Prèv peman voye bay admin ✔\n" +
    "MEME Selvandieu\n" +
    "+50943706706"
  );
}


// ============================
// INIT
// ============================
loadItems();
