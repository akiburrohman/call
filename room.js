navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  })
  .catch(err => {
    console.error("Could not get camera/microphone:", err);
    alert("Camera or microphone access denied or not available.");
  });
