var os = require('os');
var nodeStatic = require('node-static');
var socketIO = require('socket.io');

/**
 * Nyobaan nambah Allow Origin
 */
var fs = require('fs');
var express = require('express')();
var http = require('http');
var path = require('path');
var url = require("url");
var req = require('request')
var pem = require('pem');
var cors = require("cors");
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
    filename = process.cwd();//D:.../v-class-room

    var stats;

    try {
        stats = fs.lstatSync(filename);
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: ' + filename + '\n');
        response.end();
        return;
    }

    if (fs.statSync(filename).isDirectory()) {
        if(request.url === "/"){
          filename += '/index.html';
        }else if(request.url === "/css/main.css"){
          filename += '/css/main.css';    
        }else if(request.url === "/js/main.js"){
          filename += '/js/main.js';
        }else if(request.url === '/js/socket.js'){
            filename +='/js/socket.js';
        }
      console.log("Request URL : " + request.url);
      console.log("filename : " + filename);
    }


    fs.readFile(filename, 'binary', function(err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n' + filename + '\n' + request.url);
            response.end();
            return;
        }
        const ext = path.parse(filename).ext;
        console.log(mimeType[ext]);
        response.writeHead(200, mimeType[ext] || 'text/plain');
        response.write(file, 'binary');
        response.end();
    });
}
var app = http.createServer(serverHandler);

app = app.listen(process.env.PORT ||  , process.env.IP || "0.0.0.0", function(){
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port); 
});

var io = socketIO.listen(app);
        
io.on('connection', function(socket) {
        
          // convenience function to log server messages on the client
          function log() {
            var array = ['Message from server:'];
            array.push.apply(array, arguments);
            socket.emit('log', array);
          }
        
          socket.on('message', function(message) {
            log('Client said: ', message);
            // for a real app, would be room-only (not broadcast)
            socket.broadcast.emit('message', message);
          });
        
          socket.on('create or join', function(room) {
            log('Received request to create or join room ' + room);
        
            var clientsInRoom = io.sockets.adapter.rooms[room];
            var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
            log('Room ' + room + ' now has ' + numClients + ' client(s)');
        
            if (numClients === 0) {
              socket.join(room);
              log('Client ID ' + socket.id + ' created room ' + room);
              socket.emit('created', room, socket.id);
        
            } else if (numClients === 1) {
              log('Client ID ' + socket.id + ' joined room ' + room);
              io.sockets.in(room).emit('join', room);
              socket.join(room);
              socket.emit('joined', room, socket.id);
              io.sockets.in(room).emit('ready');
            } else { // max two clients
              socket.emit('full', room);
            }
          });
          
          socket.on('disconnect',function(reason){
            console.log(`Peer or server disconnect. Reason: ${reason}.`);
          });
        
          socket.on('bye', function(){
            console.log('received bye');
          });
        
        });