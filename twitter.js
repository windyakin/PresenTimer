var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Twitter = require('twitter');
var twitter = new Twitter(require('./twitter.json'));
var options = {track: "DASH"};

twitter.stream('statuses/filter', options, function(stream) {
  stream.on('data', function (data) {
    //io.sockets.emit('msg', data.text);
    console.log(data);
  });
});
