
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/room/:room', (req, res) => {
  res.sendFile(path.join(__dirname, 'room.html'));
});

io.on('connection', socket => {
  socket.on('join', room => {
    socket.join(room);
    socket.to(room).emit('joined');
  });

  socket.on('offer', (data, room) => {
    socket.to(room).emit('offer', data);
  });

  socket.on('answer', (data, room) => {
    socket.to(room).emit('answer', data);
  });

  socket.on('ice-candidate', (data, room) => {
    socket.to(room).emit('ice-candidate', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
