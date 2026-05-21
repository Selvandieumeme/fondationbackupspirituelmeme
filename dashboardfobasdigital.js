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

      <img src="${user.avatar || 'https://via.placeholder.com/80'}" />

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
  id,
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
  ).value = id;

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

      id:
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
// START
// ==========================
loadDashboard();
loadUsers();
