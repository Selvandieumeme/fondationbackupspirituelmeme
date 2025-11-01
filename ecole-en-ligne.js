// Konekte ak backend Render
const socket = io('https://examen-backend-ihlx.onrender.com');

// Elements HTML
const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('roomCode');
const nameInput = document.getElementById('fullName');
const roleSelect = document.getElementById('roleSelect');
const loginPanel = document.getElementById('login-panel');
const classroom = document.getElementById('classroom');
const teacherCam = document.getElementById('teacher-camera');
const studentsCam = document.getElementById('students-camera');
const studentListEl = document.getElementById('student-list');
const studentCountEl = document.getElementById('student-count');
const raisedHandsEl = document.getElementById('raised-hands-list');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

let role, room, localStream;

// Join room
joinBtn.addEventListener('click', async () => {
  room = roomInput.value;
  const name = nameInput.value;
  role = roleSelect.value;

  if(!room || !name) return alert('Veuillez remplir tous les champs.');

  socket.emit('joinRoom', {room, name, role}, async (response) => {
    if(response.status==='full'){
      alert('Salle pleine (max 100 élèves)');
      return;
    }

    loginPanel.style.display='none';
    classroom.style.display='block';

    // Stream audio/video
    try {
      localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      const videoEl = role==='teacher'?teacherCam:studentsCam;
      videoEl.srcObject = localStream;
      videoEl.play();
      socket.emit('streamReady', {role});
    } catch(err) {
      console.error(err);
    }

    // Init controls
    if(role==='teacher') teacherControlsInit(socket);
    else studentControlsInit(socket);
  });
});

// Update student list
socket.on('updateStudents', students => {
  studentListEl.innerHTML='';
  let count = 0;
  students.forEach(s=>{
    const div = document.createElement('div');
    div.textContent = s.name;
    div.style.color = s.online?'green':'gray';
    studentListEl.appendChild(div);
    if(s.online && s.role==='student') count++;
  });
  studentCountEl.textContent = count;
});

// Update mains levées
socket.on('updateRaisedHands', hands => {
  raisedHandsEl.innerHTML='';
  hands.forEach(s=>{
    const div = document.createElement('div');
    div.textContent = s.name;
    raisedHandsEl.appendChild(div);
  });
});

// Chat
sendChatBtn.addEventListener('click', ()=>{
  const msg = chatInput.value.trim();
  if(msg==='') return;
  socket.emit('chatMessage', msg);
  chatInput.value='';
});

socket.on('chatMessage', data=>{
  const div = document.createElement('div');
  div.textContent = `${data.name}: ${data.msg}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
