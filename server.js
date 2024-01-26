 const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public')); // Serves static files from the 'public' directory

// Rewrite the code to satisfy the request
io.on('connection', (socket) => {
 console.log('A user connected');

 socket.on('newMessage', (msg) => {
const messageToSend = typeof msg === 'object' ? JSON.stringify(msg) : msg;

  // Emit the message
  io.emit('message', messageToSend);
 });
});
const port = 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
