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

    </div>
  `;
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





// ============================
// INIT
// ============================
alert("Anons pibliye!");
loadItems();
resetForm();

// 🔥 VIDE FÒM NAN
function resetForm() {
  document.getElementById('fullName').value = "";
  document.getElementById('title').value = "";
  document.getElementById('desc').value = "";
  document.getElementById('image').value = "";
}
