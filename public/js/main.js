// Establish connection with the server
const socket = io();

// Listen for messages from the server
socket.on('message', (data) => {
    document.getElementById('chat-history').innerHTML += `<p><strong>${data.user}</strong>: ${data.message}</p>`;
});

// Function to send messages
function sendMessage() {
    const user = document.getElementById('username').value;
    const message = document.getElementById('message').value;
    if(user && message) {
        socket.emit('sendMessage', { user, message });
    }
}

