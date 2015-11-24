var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/lib', express.static(__dirname + '/lib'));
app.use('/client', express.static(__dirname + '/client'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
	res.sendfile('index.html');
});
app.get('/control', function(req, res) {
	res.sendfile('control.html');
});

io.on('connection', function(socket) {
	socket
		.on('timer', function(command, time) {
			switch (command) {
			case 'start':
				io.emit('timer', 'start');
				console.log('start');
				break;
			case 'stop':
				io.emit('timer', 'stop');
				console.log('stop');
				break;
			case 'set':
				io.emit('timer', 'set', time);
				console.log(time);
				break;
			case 'countup':
				io.emit('timer', 'countup');
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
