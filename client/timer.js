(function($, createjs, io, window, undefined){

	// 定数定義
	var CONSTANT = {
		SIZE: {
			width: 1920,
			height: 1080
		},
		fps: 60,
		SCREEN: {
			LOADING: 0,
			TITLE:   1,
			TIMER:   2
		}
	};

	var manifest = [{}];

	var _SCREENSTATUS = CONSTANT.SCREEN.LOADING;
	var _SCREENSTATUS_OLD = null;

	var easel, Easel = function() {
		easel = this;
		this.stage = null;
		this.initalized();
	};
	Easel.prototype = {
		// 初期化
		initalized: function() {
			// 画面領域の設定(Retinaの対応)
			$("#game").attr({width: CONSTANT.SIZE.width, height: CONSTANT.SIZE.height}).css({width: CONSTANT.SIZE.width/2, height:CONSTANT.SIZE.height/2});
			// ステージの作成
			this.stage = new createjs.Stage($("#game").get(0));
			// 入力の受付
			createjs.Touch.enable(this.stage);
			// FPSの設定
			createjs.Ticker.setFPS(CONSTANT.fps);
			// ticker
			createjs.Ticker.addEventListener("tick", $.proxy(this.transitScreen, this));
		},
		transitScreen: function(event) {
			// 画面が変更されたら
			if ( _SCREENSTATUS != _SCREENSTATUS_OLD ) {
				// ローディング画面
				if ( _SCREENSTATUS == CONSTANT.SCREEN.LOADING ) {
					this.stage.removeAllChildren();
					this.stage.addChild(this.displayLoading());
				}
				// タイトル画面
				else if ( _SCREENSTATUS == CONSTANT.SCREEN.TITLE ) {
					this.stage.removeAllChildren();
					this.stage.addChild(this.displayTitle());
				}
				// タイマー
				else if ( _SCREENSTATUS == CONSTANT.SCREEN.TIMER ) {
					this.stage.removeAllChildren();
					this.stage.addChild(this.displayTimer());
				}
			}
			this.stage.update();
			_SCREENSTATUS_OLD = _SCREENSTATUS;
		},
		displayLoading: function() {

		},
		displayTitle: function() {
			var container = new createjs.Container();
			// 黒色の背景
			var back = new createjs.Shape();
			back.graphics.f("#ccc").r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});
			var text = new createjs.Text();
			text.set({
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - text.getMeasuredHeight()/2,
				text: "よみこみかんりょう",
				font: "48px PixelMplus12",
				color: "#000",
				textAlign: "center"
			});

			container.addChild(back, text);
			container.addEventListener("click", function(event) {
				_SCREENSTATUS = CONSTANT.SCREEN.TIMER;
			});

			return container;
		},
		displayTimer: function() {
			var container = new createjs.Container();
			// 黒色の背景
			var back = new createjs.Shape();
			back.graphics.f("#000").r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});
			var text = new createjs.Text("残り時間", "72px PixelMplus12", "#FFF");
			text.set({
				textAlign: "center",
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - text.getMeasuredHeight()/2 - 200
			});
			var shadow = new createjs.Text("88:88:88.88", "Italic Bold 180px DSEG7 Classic", "#222");
			shadow.set({
				textAlign: "center",
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - shadow.getMeasuredHeight()/2
			});
			var time = new createjs.Text(timer.getFormattedTimes(), "Italic Bold 180px DSEG7 Classic", "#FFD032");
			time.set({
				textAlign: "center",
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - time.getMeasuredHeight()/2,
				shadow: new createjs.Shadow("#FFD400", 0, 0, 10)
			});
			createjs.Ticker.addEventListener("tick", function(evt) {
				if ( timer.countdown ) {
					timer.decreaseTimes(evt.delta/1000);
				}
				time.set({text: timer.getFormattedTimes() });
			});
			container.addChild(back, text, shadow, time);
			return container;
		}
	};

	var timer, Timer = function() {
		timer = this;
		this.second = 0;
		this.delta = 0;
		this.countdown = false;
		this.initalized();
	};
	Timer.prototype = {
		initalized: function() {
			this.second = 0;
		},
		decreaseTimes: function(delta) {
			this.second -= delta;
			if ( this.second < 0) {
				this.stopTimeover();
			}
		},
		getTimes: function() {
			return this.second;
		},
		getFormattedTimes: function() {
			var second = this.second;
			var times = {
				hour: this.fillZero(Math.floor(second/3600)),
				min:  this.fillZero(Math.floor(second/60%60)),
				sec:  this.fillZero(Math.floor(second%60)),
				msec: this.fillZero(Math.floor(second*100%100))
			};
			
			return [ times.hour, times.min, times.sec ].join(":") + "." + times.msec;
		},
		startCount: function() {
			this.countdown = true;
		},
		stopCount: function() {
			this.countdown = false;
		},
		stopTimeover: function() {
			this.stopCount();
			this.resetCount(0);
			socketio.socket.emit("stop timer");
		},
		resetCount: function(time) {
			this.second = time;
		},
		fillZero: function(num) {
			return (("0"+num).slice(-2));
		}
	};

	// Preload.js
	var preload, Preload = function() {
		preload = this;
		this.load = null;
		this.initalized();
	};
	Preload.prototype = {
		// 初期化
		initalized: function() {
			// Preload.js
			this.load = new createjs.LoadQueue();

			// 最大並列接続数
			this.load.setMaxConnections(6);

			// 読み込みの進行状況が変化した
			this.load.addEventListener("progress", this.handleProgress);
			// 1つのファイルを読み込み終わったら
			this.load.addEventListener("fileload", this.handleFileLoadComplete);
			// 全てのファイルを読み込み終わったら
			this.load.addEventListener("complete", this.handleComplete);

			// 読み込み開始
			this.load.loadManifest(manifest);
		},
		// 読み込み中
		handleProgress: function(event) {
			// 読み込み率を0.0~1.0で取得
			var progress = event.progress;
		},
		// ファイルごとの読み込み完了イベント
		handleProgress: function(event) {
			// 読み込んだファイル
			var result = event.result;
		},
		// 読み込み完了
		handleComplete: function() {
			_SCREENSTATUS = CONSTANT.SCREEN.TITLE;
		}
	}

	var socketio, SocketIO = function() {
		socketio = this;
		this.socket = io();
		this.initalized();
	};
	SocketIO.prototype = {
		initalized: function() {
			this.socket
				.on("start timer", $.proxy(this.startTimer, this))
				.on("stop timer", $.proxy(this.stopTimer, this))
				.on("set timer", $.proxy(this.resetTimer, this));
		},
		startTimer: function() {
			timer.startCount();
		},
		stopTimer: function() {
			timer.stopCount();
		},
		resetTimer: function(sec) {
			timer.resetCount(sec);
		}

	};

	$(document).ready(function(e){
		new Preload();
		new Timer();
		new Easel();
		new SocketIO();
	});

}(jQuery, createjs, io, window, undefined));
