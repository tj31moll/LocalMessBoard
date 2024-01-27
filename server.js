// Required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); // Importing the File System module from Node.js

// Initialize the application
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Defining a constant that holds the name of our chat history file
const chatHistoryFile = 'chatHistory.json';

// Load existing chat history
let chatHistory = [];
if (fs.existsSync(chatHistoryFile)) {
    chatHistory = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
}

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Broadcast message to all connected sockets
    socket.on('sendMessage', (data) => {
        chatHistory.push(data);
        fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory));
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Server listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
