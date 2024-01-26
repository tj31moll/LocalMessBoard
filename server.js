 // server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const deepEqual = require('deep-equal');

// Serve static files from the 'public' directory
app.use(express.static('public')); // Serves static files from the 'public' directory

// Encryption setup
const algorithm = 'aes-256-cbc';
const secretKey = '123456789123456189123456789000123456'; // Replace with a secure key
const iv = crypto.randomBytes(16);

function encrypt(text) {
const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()] );
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(hash.content, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Persistent storage with automatic save on change
const dataFilePath = './data.json';
let encryptedData; // Global variable to store the current encrypted data

function saveData(newEncryptedData) {
    // If the new encrypted data is different from the previous one, save it to file
    if (!deepEqual(encryptedData, newEncryptedData)) {
        const encrypted = encrypt(newEncryptedData); // Encrypt the data before saving it to file
        fs.writeFileSync(dataFilePath, JSON.stringify(encrypted), 'utf8'); // Save the encrypted data to file
        encryptedData = newEncryptedData; // Update the global variable with the new encrypted data
    }
}

function readData() {
    if (fs.existsSync(dataFilePath)) {
        const encryptedData = fs.readFileSync(dataFilePath, 'utf8'); // Read the encrypted data from the file
        const data = decrypt(JSON.parse(encryptedData)); // Decrypt and parse the data
        return data;
    } else {
        // If the file does not exist, initialize an empty object as the default value
        return {};
    }
}

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newMessage', (msg) => {
        // Check if msg is an object and stringify it
        const messageToSend = typeof msg === 'object' ? JSON.stringify(msg) : msg;

        // Emit the message
        io.emit('message', messageToSend);
        saveData(messageToSend); // Save the encrypted data after appending it to the file
        fs.appendFile(dataFilePath, JSON.stringify({ data: messageToSend }), 'utf8', (err) => {
            if (!err) {
                saveData(messageToSend); // Save the encrypted data after appending it to the file
            } else {
                console.error('Error appending data to file:', err);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const port = 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
