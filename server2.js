const net = require('net');
const fs = require('fs');
const path = require('path');

const dataFilePath = './data/server2_messages.txt';

const dataDir = path.dirname(dataFilePath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const message = data.toString().trim();
        fs.appendFileSync(dataFilePath, message + '\n'); 
        console.log(`Server 2 received and saved: ${message}`);
    });

    socket.on('error', (err) => {
        console.error('Server 2 socket error:', err.message);
    });
});

server.listen(10000, '0.0.0.0', () => {
    console.log('Server 2 listening on port 10000');
});
