const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('✅ A user connected');

  socket.on('join', (room) => {
    socket.join(room);
    socket.to(room).emit('joined');
    console.log(`🔐 User joined room: ${room}`);
  });

  socket.on('offer', (offer, room) => {
    socket.to(room).emit('offer', offer);
    console.log(`📡 Offer sent in room: ${room}`);
  });

  socket.on('answer', (answer, room) => {
    socket.to(room).emit('answer', answer);
    console.log(`✅ Answer sent in room: ${room}`);
  });

  socket.on('candidate', (candidate, room) => {
    socket.to(room).emit('candidate', candidate);
    console.log(`🧊 ICE candidate sent in room: ${room}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
