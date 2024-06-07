const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        // Handle the incoming video stream
        // Save the video chunks or process them as needed
        fs.appendFile('video-stream.webm', message, (err) => {
            if (err) throw err;
            console.log('Received video chunk');
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket server started on ws://localhost:8080');
