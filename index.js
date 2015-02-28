var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Twitter = require('twitter');
var twitter = new Twitter(require('./twitter.json'));

app.use('/lib', express.static(__dirname + '/lib'));
app.use('/client', express.static(__dirname + '/client'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});
app.get('/control', function(req, res){
	res.sendfile('control.html');
});

io.on('connection', function(socket){
	// タイマー制御部分
	socket
		.on('timer', function(command, time) {
			switch( command ) {
				case "start":
					io.emit('timer', 'start');
					console.log("start");
					break;
				case "stop":
					io.emit('timer', 'stop');
					console.log('stop');
					break;
				case "set":
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
	// Twitter検索部分
	socket
		// Twitter検索
		.on('twitter', function(command, word) {
			switch( command ) {
				case 'search':
					var track = word || "ラブライブ";
					// 既に検索していた場合はやめる
					if ( typeof twitter.currentTwitStream !== 'undefined' ) {
						twitter.currentTwitStream.destroy();
					}
					// 検索を行う
					twitter.stream('statuses/filter', {track: track}, function(stream) {
						// Streamで流れてきたのをemit
						stream.on('data', function (tweet) {
							console.log(tweet.text);
							io.emit('twitter', 'hit', tweet);
						});
						stream.on('error', function(error) {
							throw error;
						});
						twitter.currentTwitStream = stream;
					});
					io.emit('twitter', 'search', track);
					break;
				case 'stop':
					if ( typeof twitter.currentTwitStream !== 'undefined' ) {
						twitter.currentTwitStream.destroy();
					}
					break;
				default:
					console.log(command + 'is not found.');
					break;
			}
		});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});