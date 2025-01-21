const net = require('net');

const servers = [
    { host: process.env.SERVER1_HOST, port: parseInt(process.env.SERVER1_PORT) },
    { host: process.env.SERVER2_HOST, port: parseInt(process.env.SERVER2_PORT) }
];

let messageCounter = 1;
let serverIndex = 0;

function sendMessage() {
    const server = servers[serverIndex];
    const message = messageCounter.toString();

    const client = new net.Socket();
    client.connect(server.port, server.host, () => {
        client.write(message);
        console.log(`Client sent: ${message} to ${server.host}:${server.port}`);
        client.end();
    });

    client.on('error', (err) => {
        console.error(`Error connecting to ${server.host}:${server.port}: ${err.message}`);
    });

    messageCounter++;
    serverIndex = (serverIndex + 1) % servers.length;

    // Continue sending messages every 2 seconds
    setTimeout(sendMessage, 5000);
}

sendMessage();
