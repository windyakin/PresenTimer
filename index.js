var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/lib', express.static(__dirname + '/lib'));
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});
app.get('/control', function(req, res){
	res.sendfile('control.html');
});

io.on('connection', function(socket){
	socket
		.on('start timer', function(){
			io.emit('start timer');
			console.log("start");
		})
		.on('stop timer', function(){
			io.emit('stop timer');
			console.log("stop");
		})
		.on('set timer', function(sec) {
			io.emit('set timer', sec)
			console.log("set "+sec+"sec");
		})
		.on('countup timer', function(sec) {
			io.emit('countup timer', sec)
			console.log("countup");
		});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});