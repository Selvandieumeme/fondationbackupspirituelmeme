// ================== INITIALISATION ==================
const socket = io("https://examen-backend-ihlx.onrender.com");

let localStream, recorder, chunks = [];
let role = null;
let room = null;
let username = null;
const MAX_STUDENTS = 100;

const joinBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');
const usernameInput = document.getElementById('username');
const roleSelect = document.getElementById('role');
const teacherControls = document.getElementById('teacher-controls');
const teacherVideo = document.getElementById('teacher-video');
const muteAllBtn = document.getElementById('mute-all');
const stopAllBtn = document.getElementById('stop-all-video');
const startRecBtn = document.getElementById('start-rec');
const stopRecBtn = document.getElementById('stop-rec');
const uploadDoc = document.getElementById('upload-doc');
const shareScreenBtn = document.getElementById('share-screen');
const studentVideos = document.getElementById('student-videos');
const pendingStudentsDiv = document.getElementById('pending-students');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('send');

// ================== JOIN ROOM ==================
joinBtn.onclick = async () => {
    room = roomCodeInput.value.trim();
    username = usernameInput.value.trim();
    role = roleSelect.value;

    if (!room || !username) return alert('Remplissez tous les champs');

    socket.emit('setUser', { username, role });

    if(role === 'teacher'){
        teacherControls.style.display = 'block';
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        teacherVideo.srcObject = localStream;
        socket.emit('join-room', { room, role, username });
    } else {
        socket.emit('request-join', { room, username });
    }
};

// ================== TEACHER CONTROLS ==================
muteAllBtn.onclick = () => socket.emit('teacher-mute-all', { room });
stopAllBtn.onclick = () => socket.emit('teacher-stop-all-video', { room });

startRecBtn.onclick = () => {
    if (!localStream) return alert('Pas de flux local');
    recorder = new MediaRecorder(localStream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start(1000);
};

stopRecBtn.onclick = async () => {
    if(!recorder) return;
    recorder.stop();
    const blob = new Blob(chunks, { type: 'video/webm' });
    const form = new FormData();
    form.append('file', blob, 'session.webm');
    await fetch('https://examen-backend-ihlx.onrender.com/upload-recording', { method: 'POST', body: form });
    chunks = [];
};

// Upload document
uploadDoc.onchange = async () => {
    const file = uploadDoc.files[0];
    const form = new FormData();
    form.append('document', file);
    await fetch('https://examen-backend-ihlx.onrender.com/upload-doc', { method: 'POST', body: form });
};

// Partage écran
shareScreenBtn.onclick = async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenVideo = document.createElement('video');
        screenVideo.srcObject = screenStream;
        screenVideo.autoplay = true;
        screenVideo.muted = true;
        screenVideo.style.border = '4px solid #ffd700';
        screenVideo.style.borderRadius = '12px';
        screenVideo.style.width = '80vw';
        screenVideo.style.height = '80vw';
        screenVideo.style.margin = '10px auto';
        document.getElementById('video-section').appendChild(screenVideo);

        socket.emit('teacher-share-screen', { room });

        const track = screenStream.getVideoTracks()[0];
        track.onended = () => {
            screenVideo.remove();
            socket.emit('teacher-stop-screen', { room });
        };
    } catch(err){
        alert('Erreur partage écran: ' + err.message);
    }
};

// ================== STUDENT ACCEPT/REJECT ==================
socket.on('student-pending', data => {
    // Ajoute elev k ap tann
    const div = document.createElement('div');
    div.id = `pending-${data.username}`;
    div.innerHTML = `
        <span>${data.username}</span>
        <button class="accept">Accepter</button>
        <button class="reject">Rejeter</button>
    `;
    pendingStudentsDiv.appendChild(div);

    div.querySelector('.accept').onclick = () => {
        socket.emit('teacher-accept', { room, username: data.username });
        div.remove();
    };
    div.querySelector('.reject').onclick = () => {
        socket.emit('teacher-reject', { room, username: data.username });
        div.remove();
    };
});

// ================== STUDENT VIDEO ==================
socket.on('student-joined', data => {
    if(studentVideos.children.length >= MAX_STUDENTS){
        socket.emit('teacher-reject', { room, username: data.username });
        return;
    }
    const videoEl = document.createElement('video');
    videoEl.id = `student-${data.username}`;
    videoEl.autoplay = true;
    videoEl.srcObject = data.stream || null;
    studentVideos.appendChild(videoEl);
});

// ================== MUTE / CAMERA ==================
socket.on('teacher-mute-all', () => {
    if(localStream) localStream.getAudioTracks().forEach(track => track.enabled = false);
});

socket.on('teacher-stop-all-video', () => {
    if(localStream) localStream.getVideoTracks().forEach(track => track.enabled = false);
});

socket.on('teacher-toggle-mic', data => {
    if(data.username === username && localStream)
        localStream.getAudioTracks().forEach(track => track.enabled = data.enabled);
});

socket.on('teacher-toggle-video', data => {
    if(data.username === username && localStream)
        localStream.getVideoTracks().forEach(track => track.enabled = data.enabled);
});

socket.on('teacher-block-student', data => {
    if(data.username === username) {
        alert('Vous avez été retiré de la classe');
        location.reload();
    }
});

// ================== MAIN LEVÉE ==================
socket.on('teacher-lower-hand', data => {
    if(data.username === username){
        alert('Votre main a été baissée par le professeur');
    }
});

// ================== CHAT ==================
sendBtn.onclick = () => {
    const text = msgInput.value.trim();
    if(!text) return;
    socket.emit('chat-message', { room, from: username, message: text });
    const li = document.createElement('li');
    li.textContent = `Vous: ${text}`;
    messages.appendChild(li);
    msgInput.value = '';
};

socket.on('chat-message', data => {
    const li = document.createElement('li');
    li.textContent = `${data.from}: ${data.message}`;
    messages.appendChild(li);
});

// ================== SCREEN SHARE REMOTE ==================
socket.on('screen-shared', data => {
    const remoteScreen = document.createElement('video');
    remoteScreen.id = `remote-screen-${data.id}`;
    remoteScreen.autoplay = true;
    remoteScreen.style.border = '4px solid #0d6efd';
    remoteScreen.style.borderRadius = '12px';
    remoteScreen.style.width = '80vw';
    remoteScreen.style.height = '80vw';
    remoteScreen.style.margin = '10px auto';
    studentVideos.appendChild(remoteScreen);
});

socket.on('screen-stopped', data => {
    const el = document.getElementById(`remote-screen-${data.id}`);
    if(el) el.remove();
});
