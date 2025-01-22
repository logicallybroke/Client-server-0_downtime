const net = require('net');
const fs = require('fs');
const path = process.env.MESSAGE_STATE_FILE || '/data/message-state.json'; // Path to the state file

const servers = [
    { host: process.env.SERVER1_HOST, port: parseInt(process.env.SERVER1_PORT) },
    { host: process.env.SERVER2_HOST, port: parseInt(process.env.SERVER2_PORT) }
];

// Default values for message counter and server index
let messageCounter = 1;
let serverIndex = 0;

// Load state from file
if (fs.existsSync(path)) {
    try {
        const state = JSON.parse(fs.readFileSync(path, 'utf8'));
        messageCounter = state.messageCounter || messageCounter;
        serverIndex = state.serverIndex || serverIndex;
        console.log(`Resumed from state: messageCounter=${messageCounter}, serverIndex=${serverIndex}`);
    } catch (err) {
        console.error(`Error reading state file: ${err.message}`);
    }
}

function sendMessage() {
    const server = servers[serverIndex];
    const message = fun(messageCounter);

    const client = new net.Socket();
    client.connect(server.port, server.host, () => {
        client.write(message);
        console.log(`Client sent: ${message} to ${server.host}:${server.port}`);
        client.end();
    });

    client.on('error', (err) => {
        console.error(`Error connecting to ${server.host}:${server.port}: ${err.message}`);
    });

    // Update counters
    messageCounter++;
    serverIndex = (serverIndex + 1) % servers.length;

    // Save state to file
    const state = { messageCounter, serverIndex };
    try {
        fs.writeFileSync(path, JSON.stringify(state), 'utf8');
    } catch (err) {
        console.error(`Error saving state: ${err.message}`);
    }

    // Continue sending messages every 5 seconds
    setTimeout(sendMessage, 5000);
}

function fun(num) {
    if (num === 0) return 'zero';

    const belowTwenty = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen'
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion'];

    const helper = (n) => {
        if (n === 0) return '';
        else if (n < 20) return belowTwenty[n];
        else if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + belowTwenty[n % 10] : '');
        else return belowTwenty[Math.floor(n / 100)] + ' hundred' +
            (n % 100 !== 0 ? ' and ' + helper(n % 100) : '');
    };

    let result = '';
    let chunkCount = 0;

    while (num > 0) {
        const chunk = num % 1000;
        if (chunk !== 0) {
            const chunkWords = helper(chunk) + (thousands[chunkCount] ? ' ' + thousands[chunkCount] : '');
            result = chunkWords + (result ? ' ' + result : '');
        }
        num = Math.floor(num / 1000);
        chunkCount++;
    }

    return result.trim();
}

// Start sending messages
sendMessage();
