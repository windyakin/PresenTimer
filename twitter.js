var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Twitter = require('twitter');
var twitter = new Twitter(require('./twitter.json'));
var options = {track: "ラブライブ"};

app.use('/lib', express.static(__dirname + '/lib'));
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(req, res){
	res.sendfile('control.html');
});

io.on('connection', function(socket) {
	socket
		// Twitter検索
		.on('twitter', function(track) {
			// 既に検索していた場合はやめる
			if ( typeof twitter.currentTwitStream !== 'undefined' ) {
				twitter.currentTwitStream.destroy();
			}
			// 検索を行う
			twitter.stream('statuses/filter', {track: track}, function(stream) {
				// Streamで流れてきたのをemit
				stream.on('data', function (tweet) {
					console.log(tweet.text);
					io.emit('tweet', tweet);
				});
				stream.on('error', function(error) {
					throw error;
				});
				twitter.currentTwitStream = stream;
			});
		});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});