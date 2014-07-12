
var express = require('express');
var path = require('path');

var app = express();

var game = require('./game');

app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').createServer(app).listen(8000);

var io = require('socket.io').listen(server);

io.set('log level', 1);

io.sockets.on('connection', function(socket) {
  game.initGame(io, socket);
});
