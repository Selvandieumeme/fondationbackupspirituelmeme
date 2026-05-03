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

          <div class="image-box">
            <img src="${item.image ? (item.image.startsWith('http') ? item.image : API + item.image) : ''}" alt="image">
          </div>

          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
          <small>Par: ${item.ownerName || ''}</small>

          <!-- 💬 COMMENT BOX -->
          <div class="comment-box">

            <input id="name-${item._id}" placeholder="Non ou">
            <input id="msg-${item._id}" placeholder="Poze kestyon...">
            <button onclick="sendComment('${item._id}')">Voye</button>

            <div id="comments-${item._id}"></div>

          </div>

        </div>
      `;

      // ✅ SA DWE LA (DEYÒ HTML)
      loadComments(item._id);
    });

  } catch (err) {
    console.log("Load error:", err);
  }
}

// ============================
// CREATE ITEM (FIXED)
// ============================
async function createItem() {

  const fullName = document.getElementById('fullName').value;
  const title = document.getElementById('title').value;
  const desc = document.getElementById('desc').value;
  const file = document.getElementById('image').files[0];

  if (!fullName || !title || !desc) {
    alert("Ranpli tout chan yo");
    return;
  }

  if (!file) {
    alert("Image obligatwa");
    return;
  }

  try {

    // UPLOAD IMAGE
    const formData = new FormData();
    formData.append("image", file);

    const uploadRes = await fetch(`${API}/api/upload-image`, {
      method: "POST",
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      alert(uploadData.message || "Upload echwe");
      return;
    }

    // SEND TO SERVER (MATCH SERVER FORMAT EXACT)
    const item = {
      fullName,
      title,
      description: desc,
      image: uploadData.url
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
    resetForm(); // ✅ mete li LA SELMAN
    loadItems();
    

  } catch (err) {
    console.log("Create error:", err);
    alert("Server error");
  }
}





// ============================
// IMAGE PREVIEW
// ============================
document.getElementById('image').addEventListener('change', function () {

  const file = this.files[0];

  if (!file) return;

  const preview = document.getElementById('preview');

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

});






async function sendComment(itemId) {
  const name = document.getElementById(`name-${itemId}`).value;
  const message = document.getElementById(`msg-${itemId}`).value;

  if (!name || !message) {
    alert("Ranpli chan yo");
    return;
  }

  const res = await fetch(`${API}/api/comments`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    itemId,
    name,
    message
  })
});

const data = await res.json();

if (!data.success) {
  alert("Comment pa voye");
  return;
}

document.getElementById(`msg-${itemId}`).value = "";

loadComments(itemId);






  // ============================
// LOAD COMMENTS
// ============================
async function loadComments(itemId) {
  try {
    const res = await fetch(`${API}/api/comments/${itemId}`);
    const data = await res.json();

    const box = document.getElementById(`comments-${itemId}`);
    if (!box) return;

    box.innerHTML = "";

    data.forEach(c => {
      box.innerHTML += `
        <div><b>${c.name}:</b> ${c.message}</div>
      `;
    });

  } catch (err) {
    console.log("Comment load error:", err);
  }
}


// ============================
// INIT
// ============================
loadItems();


// 🔥 VIDE FÒM NAN
function resetForm() {
  document.getElementById('fullName').value = "";
  document.getElementById('title').value = "";
  document.getElementById('desc').value = "";
  document.getElementById('image').value = "";
}
