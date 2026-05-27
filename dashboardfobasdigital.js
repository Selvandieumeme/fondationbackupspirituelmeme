const API = "https://api.fondationbackupspirituel.com";


// ==========================
// MENU
// ==========================
const menuBtns = document.querySelectorAll(".menuBtn");
const pages = document.querySelectorAll(".page");

menuBtns.forEach((btn) => {

  btn.addEventListener("click", () => {

    menuBtns.forEach((b) =>
      b.classList.remove("active")
    );

    pages.forEach((page) =>
      page.classList.remove("activePage")
    );

    btn.classList.add("active");

    document
      .getElementById(btn.dataset.page)
      .classList.add("activePage");

  });

});


// ==========================
// LOAD DASHBOARD
// ==========================
async function loadDashboard() {

  try {

    const res = await fetch(
      `${API}/fobas/admin/dashboard`
    );

    const data = await res.json();

  document.getElementById(
  "totalUsers"
).innerText =
  data.stats?.totalUsers || 0;

document.getElementById(
  "totalAgents"
).innerText =
  data.stats?.totalAgents || 0;

document.getElementById(
  "totalEntrepreneurs"
).innerText =
  data.stats?.totalEntrepreneurs || 0;

document.getElementById(
  "totalOrders"
).innerText =
  data.stats?.totalOrders || 0;

    loadRecentUsers(
      data.recentUsers || []
    );

    loadRecentOrders(
      data.recentOrders || []
    );

  }

  catch (err) {

    console.error(
      "DASHBOARD ERROR:",
      err
    );

  }

}


// ==========================
// RECENT USERS
// ==========================
function loadRecentUsers(users) {

  const box =
    document.getElementById(
      "recentUsers"
    );

  box.innerHTML = "";

  users.forEach((user) => {

    box.innerHTML += `
      <div class="listItem">
        <strong>${user.name}</strong>
        <p>${user.role}</p>
      </div>
    `;

  });

}


// ==========================
// RECENT ORDERS
// ==========================
function loadRecentOrders(orders) {

  const box =
    document.getElementById(
      "recentOrders"
    );

  box.innerHTML = "";

  orders.forEach((order) => {

    box.innerHTML += `
      <div class="listItem">
        <strong>${order.clientName}</strong>
        <p>${order.status}</p>
      </div>
    `;

  });

}


// ==========================
// LOAD USERS
// ==========================
async function loadUsers() {

  try {

    const res = await fetch(
      `${API}/fobas/admin/users`
    );

    const data = await res.json();

    renderUsers(data.users || []);

  }

  catch (err) {

    console.error(
      "USERS ERROR:",
      err
    );

  }

}





// ==========================
// LOAD WITHDRAWS
// ==========================
async function loadWithdraws() {

  try {

    const res = await fetch(
      `${API}/fobas/admin/withdraws`
    );

    const data = await res.json();

    renderWithdraws(
      data.withdraws || []
    );

  }

  catch (err) {

    console.error(
      "WITHDRAW LOAD ERROR:",
      err
    );

  }

}





// ==========================
// RENDER USERS
// ==========================
function renderUsers(users) {

  const agentsContainer =
    document.getElementById(
      "agentsContainer"
    );

  const entrepreneursContainer =
    document.getElementById(
      "entrepreneursContainer"
    );

  agentsContainer.innerHTML = "";
  entrepreneursContainer.innerHTML = "";

  users.forEach((user) => {

    const card = document.createElement("div");

    card.className = "userCard";

   card.setAttribute(
  "onclick",
  `openUser('${user._id}')`
);

    card.innerHTML = `

      <img 
  src="${
    user.avatar
      ? `${API}${user.avatar}`
      : 'https://via.placeholder.com/80'
  }" 
/>

      <h3>${user.name}</h3>

      <p>${user.email}</p>

      <p><strong>Role:</strong> ${user.role}</p>

      <p><strong>Commission:</strong> ${user.totalCommission || 0}</p>

      <p><strong>Country:</strong> ${user.country || '-'}</p>

      <div class="actionBtns">

        <button
          class="editBtn"
          onclick="openEdit('${user._id}','${user.name}','${user.email}','${user.role}','${user.totalCommission || 0}','${user.level || 'Bronze'}')"
        >
          Edit
        </button>

        <button
          class="deleteBtn"
          onclick="deleteUser('${user._id}')"
        >
          Delete
        </button>

      </div>

    `;

    if (
      user.role === "agent" ||
      user.role === "agent_entrepreneur"
    ) {

      agentsContainer.appendChild(card);

    }

    if (
      user.role === "entrepreneur" ||
      user.role === "agent_entrepreneur"
    ) {

      entrepreneursContainer.appendChild(card);

    }

  });

}



// ==========================
// RENDER WITHDRAWS
// ==========================
function renderWithdraws(withdraws) {

  const container =
    document.getElementById(
      "withdrawsContainer"
    );

  if (!container) return;

  container.innerHTML = "";

  withdraws.forEach((withdraw) => {

    const card =
      document.createElement("div");

    card.className =
      "userCard";

    card.innerHTML = `

      <h3>${withdraw.email}</h3>

      <p>
        <strong>Amount:</strong>
        ${withdraw.amount} HTG
      </p>

      <p>
        <strong>Method:</strong>
        ${withdraw.method || "-"}
      </p>

      <p>
  <strong>Withdraw Info:</strong>
  ${withdraw.withdrawNumber || "-"}
</p>

      <p>
        <strong>Status:</strong>
        ${withdraw.status}
      </p>

      <div class="actionBtns">

        <button
          class="editBtn"
          onclick="approveWithdraw('${withdraw._id}')"
        >
          Approve
        </button>

        <button
          class="deleteBtn"
          onclick="rejectWithdraw('${withdraw._id}')"
        >
          Reject
        </button>

      </div>

    `;

    container.appendChild(card);

  });

}





// ==========================
// DELETE USER
// ==========================
async function deleteUser(id) {

  const confirmation = confirm(
    "Delete this account permanently?"
  );

  if (!confirmation) return;

  try {

    const res = await fetch(
      `${API}/fobas/admin/delete-user/${id}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    alert(data.message);

    loadUsers();
    loadDashboard();

  }

  catch (err) {

    console.error(
      "DELETE ERROR:",
      err
    );

  }

}





// ==========================
// APPROVE WITHDRAW
// ==========================
async function approveWithdraw(id) {

  const confirmation =
    confirm(
      "Approve this withdraw?"
    );

  if (!confirmation) return;

  try {

    const res = await fetch(

      `${API}/fobas/admin/approve-withdraw/${id}`,

      {
        method: "PUT"
      }

    );

    const data =
      await res.json();

    alert(data.message);

    loadWithdraws();

  }

  catch (err) {

    console.error(
      "APPROVE ERROR:",
      err
    );

  }

}



// ==========================
// REJECT WITHDRAW
// ==========================
async function rejectWithdraw(id) {

  const confirmation =
    confirm(
      "Reject this withdraw?"
    );

  if (!confirmation) return;

  try {

    const res = await fetch(

      `${API}/fobas/admin/reject-withdraw/${id}`,

      {
        method: "PUT"
      }

    );

    const data =
      await res.json();

    alert(data.message);

    loadWithdraws();

  }

  catch (err) {

    console.error(
      "REJECT ERROR:",
      err
    );

  }

}






// ==========================
// OPEN USER DETAILS
// ==========================
async function openUser(id) {

  try {

    const res =
      await fetch(
        `${API}/admin/user/${id}`
      );

    const data =
      await res.json();

    const user = data.user;
    console.log("REFERRALS:", data.referrals);
    console.log("ORDERS:", data.orders);

alert(

`Nom: ${user.name}

Email: ${user.email}

Role: ${user.role}

ReferralCode:
${user.referralCode || "-"}

Commission:
${user.totalCommission || 0}

Pays:
${user.country || "-"}

Ville:
${user.city || "-"}

Zone:
${user.zone || "-"}

Business:
${user.businessName || "-"}

WhatsApp:
${user.whatsapp || "-"}`

);

  }

  catch (err) {

    console.error(
      "OPEN USER ERROR:",
      err
    );

  }

}




// ==========================
// OPEN EDIT
// ==========================
function openEdit(
  _id,
  name,
  email,
  role,
  commission,
  level
) {

  document.getElementById(
    "editModal"
  ).style.display = "flex";

  document.getElementById(
    "editId"
  ).value = _id;

  document.getElementById(
    "editName"
  ).value = name;

  document.getElementById(
    "editEmail"
  ).value = email;

  document.getElementById(
    "editRole"
  ).value = role;

  document.getElementById(
    "editCommission"
  ).value = commission;

  document.getElementById(
    "editLevel"
  ).value = level;

}


// ==========================
// CLOSE MODAL
// ==========================
document.querySelector(
  ".closeModal"
).addEventListener("click", () => {

  document.getElementById(
    "editModal"
  ).style.display = "none";

});


// ==========================
// SAVE EDIT
// ==========================
document.getElementById(
  "saveEditBtn"
).addEventListener("click", async () => {

  try {

    const body = {

      _id:
        document.getElementById(
          "editId"
        ).value,

      name:
        document.getElementById(
          "editName"
        ).value,

      email:
        document.getElementById(
          "editEmail"
        ).value,

      role:
        document.getElementById(
          "editRole"
        ).value,

      totalCommission:
        document.getElementById(
          "editCommission"
        ).value,

      level:
        document.getElementById(
          "editLevel"
        ).value

    };

    const res = await fetch(
      `${API}/fobas/admin/update-user`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    alert(data.message);

    document.getElementById(
      "editModal"
    ).style.display = "none";

    loadUsers();
    loadDashboard();

  }

  catch (err) {

    console.error(
      "UPDATE ERROR:",
      err
    );

  }

});


// ==========================
// SEARCH FILTER
// ==========================
document.getElementById(
  "searchAgent"
).addEventListener("input", filterUsers);

function filterUsers() {

  const value =
    document.getElementById(
      "searchAgent"
    ).value.toLowerCase();

  document
    .querySelectorAll(".userCard")
    .forEach((card) => {

      const text =
        card.innerText.toLowerCase();

      card.style.display =
        text.includes(value)
          ? "block"
          : "none";

    });

}






// ==========================
// LOAD ALL ORDERS
// ==========================
async function loadOrders() {

  try {

    const container =
      document.getElementById(
        "ordersContainer"
      );

    if (!container) return;

    const res =
      await fetch(
        `${API}/fobas/admin/orders`
      );

    const data =
      await res.json();

    renderOrders(
      data.orders || []
    );

  }

  catch (err) {

    console.error(
      "LOAD ORDERS ERROR:",
      err
    );

  }

}



// ==========================
// RENDER ORDERS
// ==========================
function renderOrders(orders) {

  const container =
    document.getElementById(
      "ordersContainer"
    );

  if (!container) return;

  container.innerHTML = "";

  // ==========================
  // EMPTY
  // ==========================
  if (orders.length === 0) {

    container.innerHTML =
      "<p>Aucune commande trouvée</p>";

    return;

  }

  // ==========================
  // LOOP
  // ==========================
  orders.forEach((order) => {

    const card =
      document.createElement("div");

    card.className =
      "userCard";

    const base = order.financial?.basePrice || 0;
const fee = order.financial?.fee || 0;
const total = order.financial?.totalPrice || (base + fee);

    card.innerHTML = `

      ${
        order.proof
        ?
        `
        <img
          src="${order.proof}"
          style="
            width:100%;
            height:220px;
            object-fit:cover;
            border-radius:10px;
            margin-bottom:10px;
          "
        >
        `
        :
        ""
      }

      <h3>
        ${order.clientName || "-"}
      </h3>

      <p>
        <strong>Phone:</strong>
        ${order.phone || "-"}
      </p>

      <p>
        <strong>Address:</strong>
        ${order.address || "-"}
      </p>

      <p>
        <strong>Product:</strong>
        ${order.product || order.order || "-"}
      </p>

      <p>
        <strong>Payment:</strong>
        ${order.paymentMethod || "-"}
      </p>

      <p>
        <strong>Status:</strong>
        ${order.status || "pending"}
      </p>

      <p><strong>Base:</strong> ${base} HTG</p>

      <p><strong>Fee (5%):</strong> ${fee} HTG</p>

      <p><strong>Total:</strong> ${total} HTG</p>

      <div class="actionBtns">

        <button
          class="editBtn"
          onclick="
            updateOrderStatus(
              '${order._id}',
              'confirmed'
            )
          "
        >
          Confirm
        </button>

        <button
          class="editBtn"
          onclick="
            updateOrderStatus(
              '${order._id}',
              'shipping'
            )
          "
        >
          Shipping
        </button>

        <button
          class="editBtn"
          onclick="
            updateOrderStatus(
              '${order._id}',
              'completed'
            )
          "
        >
          Complete
        </button>

        <button
          class="deleteBtn"
          onclick="
            updateOrderStatus(
              '${order._id}',
              'cancelled'
            )
          "
        >
          Cancel
        </button>

      </div>

    `;

    container.appendChild(card);

  });

}



// ==========================
// UPDATE ORDER STATUS
// ==========================
async function updateOrderStatus(
  orderId,
  status
) {

  try {

    const res =
      await fetch(

        `${API}/fobas/admin/order-status`,

        {
          method: "PUT",

          headers: {
            "Content-Type":
            "application/json"
          },

          body: JSON.stringify({

            orderId,
            status

          })

        }

      );

    const data =
      await res.json();

    alert(
      data.message
    );

    // ==========================
    // AUTO REFRESH
    // ==========================
    loadOrders();

    loadDashboard();

  }

  catch (err) {

    console.error(
      "UPDATE ORDER ERROR:",
      err
    );

  }

}


// ==========================
// START
// ==========================
loadDashboard();
loadUsers();
loadWithdraws();
loadOrders();






// ==========================
// LOAD ALL PRODUCTS
// ==========================
async function loadAdminProducts() {

  try {

    const container =
      document.getElementById(
        "productsContainer"
      );

    if (!container) return;

    const res = await fetch(
      `${API}/admin/all-products`
    );

    const data = await res.json();

    container.innerHTML = "";

    if (
      !data.products ||
      data.products.length === 0
    ) {

      container.innerHTML =
        "<p>Aucun produit trouvé</p>";

      return;

    }

    data.products.forEach((product) => {

      const card =
        document.createElement("div");

      card.className = "userCard";

      card.innerHTML = `

        <img
          src="${product.image}"
          style="
            width:100%;
            height:180px;
            object-fit:cover;
            border-radius:10px;
          "
        >

        <h3>
          ${product.name || "Produit"}
        </h3>

        <p>
          <strong>Prix:</strong>
          ${product.price || 0} HTG
        </p>

        <p>
          <strong>Owner:</strong>
          ${product.ownerName || "-"}
        </p>

        <p>
          <strong>Email:</strong>
          ${product.ownerEmail || "-"}
        </p>

        <p>
          <strong>Business:</strong>
          ${product.businessName || "-"}
        </p>

        <div class="actionBtns">

          <button
            class="editBtn"
            onclick="
              adminEditProduct(
                '${product.ownerEmail}',
                '${product.productId}',
                \`${product.name || ""}\`,
                '${product.price || 0}'
              )
            "
          >
            Modifier
          </button>

          <button
            class="deleteBtn"
            onclick="
              adminDeleteProduct(
                '${product.ownerEmail}',
                '${product.productId}'
              )
            "
          >
            Supprimer
          </button>

        </div>

      `;

      container.appendChild(card);

    });

  }

  catch (err) {

    console.error(
      "LOAD PRODUCTS ERROR:",
      err
    );

  }

}





// ==========================
// ADMIN DELETE PRODUCT
// ==========================
window.adminDeleteProduct =
async function(email, productId) {

  try {

    const confirmDelete =
      confirm("Delete this product ?");

    if (!confirmDelete) return;

    const res = await fetch(

      `${API}/business/delete-product`,

      {

        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email,
          productId

        })

      }

    );

    const data =
      await res.json();

    if (data.success) {

      alert("Produit supprimé");

      loadAdminProducts();

    }

    else {

      alert(
        data.message ||
        "Erreur delete"
      );

    }

  }

  catch (err) {

    console.error(
      "ADMIN DELETE ERROR:",
      err
    );

    alert("Erreur serveur");

  }

};




// ==========================
// ADMIN EDIT PRODUCT
// ==========================
window.adminEditProduct =
async function(
  email,
  productId,
  currentName,
  currentPrice
) {

  try {

    const newName =
      prompt(
        "Nouveau nom",
        currentName
      );

    if (newName === null) return;

    const newPrice =
      prompt(
        "Nouveau prix",
        currentPrice
      );

    if (newPrice === null) return;

    const res = await fetch(

      `${API}/admin/update-product`,

      {

        method: "PUT",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          email,
          productId,
          name:newName,
          price:newPrice

        })

      }

    );

    const data =
      await res.json();

    if (data.success) {

      alert("Produit modifié");

      loadAdminProducts();

    }

    else {

      alert(
        data.message ||
        "Erreur modification"
      );

    }

  }

  catch (err) {

    console.error(
      "ADMIN EDIT ERROR:",
      err
    );

    alert("Erreur serveur");

  }

};




// ==========================
// AUTO LOAD PRODUCTS
// ==========================
loadAdminProducts();
