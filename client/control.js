(function($, createjs, io, window, undefined) {

	var controller, Controller = function() {
		controller = this;
		this.socket = io();
		this.initalized();
	};
	Controller.prototype = {
		initalized: function() {
			// Socket送信
			$(document)
				.on('change', '#first, #end', $.proxy(this.changeTime, this))
				.on('click', '#reset', $.proxy(this.resetTime, this))
				.on('click', '#start', $.proxy(this.clickStart, this))
				.on('click', '#stop', $.proxy(this.clickStop, this))
				.on('click', '#countup', $.proxy(this.countupTime, this))
				.on('click', '#countdown', $.proxy(this.countdownTime, this))
				.on('click', '#twitter', $.proxy(this.searchTwitter, this));
			// Socket受信
			this.socket
				.on('start timer', $.proxy(this.disabledTime, this))
				.on('stop timer', $.proxy(this.enabledTime, this));
			// 操作するタイマー
			this.timerID = (window.location.search.split('?'))[1];
		},
		changeTime: function() {
			var times = this.getInputTimes();
			this.socket.emit('timer', this.timerID, 'set', times);
		},
		resetTime: function() {
			var times = this.getInputTimes();
			this.socket.emit('timer', this.timerID, 'set', times);
		},
		clickStart: function() {
			// this.changeTime();
			this.socket.emit('timer', this.timerID, 'start');
		},
		clickStop: function() {
			this.socket.emit('timer', this.timerID, 'stop');
		},
		countupTime: function() {
			this.socket.emit('timer', this.timer.id, 'countup');
		},
		countdownTime: function() {
			this.socket.emit('timer', this.timer.id, 'start');
		},
		disabledTime: function() {
			$('#first').attr('disabled', 'disabled');
			$('#end').attr('disabled', 'disabled');
		},
		enabledTime: function() {
			$('#first').removeAttr('disabled');
			$('#end').removeAttr('disabled');
		},
		getInputTimes: function() {
			var times = {
				first: Number($('#first').val()) * 10,
				end:   Number($('#end').val()) * 10
			};
			return times;
		}
	};

	$(document).ready(function(e) {
		new Controller();
		window.ctrl = controller;
	});

}(jQuery, createjs, io, window, undefined));
