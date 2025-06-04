
const socket = io();
const room = "room1";
socket.emit("join", room);

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const peerConnection = new RTCPeerConnection();

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  });

peerConnection.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

peerConnection.onicecandidate = event => {
  if (event.candidate) {
    socket.emit("ice-candidate", event.candidate);
  }
};

socket.on("joined", async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
});

socket.on("offer", async offer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", async answer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", async candidate => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error('Error adding received ice candidate', e);
  }
});
