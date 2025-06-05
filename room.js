
const socket = io();
const urlParts = window.location.pathname.split('/');
const room = urlParts[urlParts.length - 1];
document.getElementById('room-name').innerText = room;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
let localStream;
let peerConnection;
let micEnabled = true;
let camEnabled = true;

const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
peerConnection = new RTCPeerConnection(config);

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  });

peerConnection.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

peerConnection.onicecandidate = event => {
  if (event.candidate) {
    socket.emit("ice-candidate", event.candidate, room);
  }
};

socket.emit("join", room);

socket.on("joined", async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, room);
});

socket.on("offer", async offer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, room);
});

socket.on("answer", async answer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", async candidate => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error("Error adding ICE candidate", e);
  }
});

function toggleMic() {
  micEnabled = !micEnabled;
  localStream.getAudioTracks()[0].enabled = micEnabled;
}

function toggleCamera() {
  camEnabled = !camEnabled;
  localStream.getVideoTracks()[0].enabled = camEnabled;
}

function endCall() {
  peerConnection.close();
  window.location.href = "/";
}
