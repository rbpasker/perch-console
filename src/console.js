'use strict';

const express = require('express');
const http = require('http');
const uuid = require('uuid');

const WebSocket = require('ws');

const app = express();
const map = new Map();

//
// Serve static files from the 'public' folder.
//
app.use(express.static('public'));

//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws, request) {
    
    const id = setInterval(function() {
	console.log("SEND tick");
	ws.send("tick" + new Date());
    }, 1000);

    
    ws.on('message', function(message) {
	//
	// Here we can now use session parameters.
	//
	console.log(`MESSAGE ${message} `);
	const response = `echo "${message}"`;
	ws.send(response);
	console.log(`SEND "${response}"`);

    });
    
    ws.on('close', function() {
	clearInterval(id)
	console.log(`CLOSE`);
    });

    ws.on('error', function(errorEvent) {
	console.log(`ERROR ${JSON.stringify(errorEvent)}`);
    })


})
       
// Start the server.
//
server.listen(8080, function() {
    console.log('Listening on http://localhost:8080');
});

