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
				.on("change", "#hour, #min, #sec", $.proxy(this.changeTime, this))
				.on("click", "#reset", $.proxy(this.resetTime, this))
				.on("click", "#start", $.proxy(this.clickStart, this))
				.on("click", "#stop", $.proxy(this.clickStop, this))
				.on("click", "#countup", $.proxy(this.countupTime, this))
				.on("click", "#countdown", $.proxy(this.countdownTime, this));
			// Socket受信
			this.socket
				.on("start timer", $.proxy(this.disabledTime, this))
				.on("stop timer", $.proxy(this.enabledTime, this));
		},
		changeTime: function() {
			var sec = Number($("#hour").val())*3600;
			sec += Number($("#min").val())*60;
			sec += Number($("#sec").val());
			this.socket.emit('set timer', sec);
		},
		resetTime: function() {
			$("#hour, #min, #sec").val("0");
			this.socket.emit('set timer', 0);
		},
		clickStart: function() {
			this.changeTime();
			this.socket.emit('start timer');
		},
		clickStop: function() {
			this.socket.emit('stop timer');
		},
		countupTime: function() {
			this.socket.emit('countup timer');
		},
		countdownTime: function() {
			this.socket.emit('start timer');
		},
		disabledTime: function() {
			$("#hour").attr("disabled", "disabled");
			$("#min").attr("disabled", "disabled");
			$("#sec").attr("disabled", "disabled");
		},
		enabledTime: function() {
			$("#hour").removeAttr("disabled");
			$("#min").removeAttr("disabled");
			$("#sec").removeAttr("disabled");
		}
	};

	$(document).ready(function(e){
		new Controller();
	});

}(jQuery, createjs, io, window, undefined));
