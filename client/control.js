(function($, createjs, io, window, undefined){

	var controller, Controller = function() {
		controller = this;
		this.socket = io();
		this.initalized();
	};
	Controller.prototype = {
		initalized: function() {
			// Socket送信
			$(document)
				.on("change", "#first, #end", $.proxy(this.changeTime, this))
				.on("click", "#reset", $.proxy(this.resetTime, this))
				.on("click", "#start", $.proxy(this.clickStart, this))
				.on("click", "#stop", $.proxy(this.clickStop, this))
				.on("click", "#countup", $.proxy(this.countupTime, this))
				.on("click", "#countdown", $.proxy(this.countdownTime, this))
				.on("click", "#twitter", $.proxy(this.searchTwitter, this));
			// Socket受信
			this.socket
				.on("start timer", $.proxy(this.disabledTime, this))
				.on("stop timer", $.proxy(this.enabledTime, this));
		},
		changeTime: function() {
			var times = {
				first: Number($("#first").val())*60,
				end:   Number($("#end").val())*60
			};
			this.socket.emit('timer', 'set', times);
		},
		resetTime: function() {
			$("#first, #end").val("0");
			this.socket.emit('timer', 'set', {first: 0, end: 0});
		},
		clickStart: function() {
			this.changeTime();
			this.socket.emit('timer', 'start');
		},
		clickStop: function() {
			this.socket.emit('timer', 'stop');
		},
		countupTime: function() {
			this.socket.emit('timer', 'countup');
		},
		countdownTime: function() {
			this.socket.emit('timer', 'start');
		},
		disabledTime: function() {
			$("#first").attr("disabled", "disabled");
			$("#end").attr("disabled", "disabled");
		},
		enabledTime: function() {
			$("#first").removeAttr("disabled");
			$("#end").removeAttr("disabled");
		},
		searchTwitter: function() {
			var track = $("#search").val();
			this.socket.emit('twitter', track);
		}
	};

	$(document).ready(function(e){
		new Controller();
	});

}(jQuery, createjs, io, window, undefined));
