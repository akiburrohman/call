const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peerConnection;

const servers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
    socket.emit('join', 'room1');
  });

socket.on('joined', () => {
  createPeerConnection();
  peerConnection.addStream(localStream);
  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => socket.emit('offer', peerConnection.localDescription));
});

socket.on('offer', offer => {
  createPeerConnection();
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  peerConnection.addStream(localStream);
  peerConnection.createAnswer()
    .then(answer => peerConnection.setLocalDescription(answer))
    .then(() => socket.emit('answer', peerConnection.localDescription));
});

socket.on('answer', answer => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', candidate => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(servers);
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate);
    }
  };
  peerConnection.onaddstream = event => {
    remoteVideo.srcObject = event.stream;
  };
}
