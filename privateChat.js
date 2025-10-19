// Chat-prive - FULL implementation (frontend + backend + model)
// ---------------------------------------------------------------
// IMPORTANT: This file contains the full "private chat" code that
// uses data-user attributes only (NO use of `username` variable).
// It is modular and designed to be added WITHOUT changing your
// existing public chat code (it uses the same socket instance).
//
// Sections included:
// 1) README / integration notes
// 2) CSS for private windows (paste into your main CSS)
// 3) Frontend JS module (uses data-user attributes)
// 4) Mongoose Message model (models/MessagePrivate.js)
// 5) Backend integration module (server/private-chat.js)
//
// -----------------------------------------------------------------


/*
1) QUICK INTEGRATION NOTES
---------------------------
- Make sure your HTML sets the current user's identity using the
data-user attribute on the <body> element, exactly like your
public chat does. Example:


<body data-user="Selvandieu"> ... </body>


The private chat JS reads the current user's id from
document.body.dataset.user (no global username variable used).


- Make sure your user list uses data-user on each <li>, e.g.:


<ul id="userList">
<li data-user="Selvandieu">Selvandieu <span class="status online"></span></li>
<li data-user="Ranise">Ranise <span class="status offline"></span></li>
</ul>


The public chat may already render status icons (green/red). Do not
remove them. Private chat hooks only look for li[data-user].


- This module expects an existing socket.io client instance named
`socket` on the page (e.g. `const socket = io();`). It does not
create a new socket instance.


- Paste the CSS portion into your main css file.
- Add the frontend JS module after your `socket` is created and
after the page has body[data-user]. It automatically attaches
click handlers and uses MutationObserver if the user list changes.


- Backend: import the server/private-chat.js module where you
already initialize `io` and Mongoose. It will register `register`,
`privateMessage` and `getPrivateHistory` events while coexisting
with your public chat handlers.




2) CSS (copy into your stylesheet)
----------------------------------
.private-chat-window {
position: fixed;
bottom: 10px;
right: 10px;
width: 320px;
max-width: calc(100% - 40px);
background: #ffffff;
border: 1px solid #ddd;
// you prefer: "paste files here" or "create zip".
