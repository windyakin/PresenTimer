var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var os = require('os');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/client', express.static(__dirname + '/client'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
	res.sendfile('index.html');
});
app.get('/control', function(req, res) {
	res.sendfile('control.html');
});

io.on('connection', function(socket) {
	console.log(socket.id);
	socket.emit('debug', socket.id);
	socket.on('debug', function(id, msg) {
		socket.to(id).emit('debug', msg);
	});
	socket
		.on('timer', function(id, command, time) {
			switch (command) {
			case 'start':
				socket.to(id).emit('timer', 'start');
				console.log('start');
				break;
			case 'stop':
				socket.to(id).emit('timer', 'stop');
				console.log('stop');
				break;
			case 'set':
				socket.to(id).emit('timer', 'set', time);
				console.log(time);
				break;
			case 'countup':
				socket.to(id).emit('timer', 'countup');
				console.log('countup');
				break;
			default:
				console.log(command + 'is not found.');
				break;
			}
		});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
