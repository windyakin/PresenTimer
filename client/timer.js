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
			back.graphics.f("#000").r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});
			var text = new createjs.Text("よみこみかんりょう！", "48px PixelMplus12", "#fff");
			text.set({
				textAlign: "center",
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - text.getMeasuredHeight()/2,
			});
			var start = new createjs.Text("クリックでスタート", "48px PixelMplus12", "#fff");
			start.set({
				textAlign: "center",
				x: CONSTANT.SIZE.width/2,
				y :CONSTANT.SIZE.height/2 - text.getMeasuredHeight()/2 + 280,
			});
			createjs.Tween.get(start, {loop: true})
				.to({alpha: 1}, 300)
				.to({alpha: 0}, 300)
				.to({alpha: 1}, 300);

			container.addChild(back, start, text);
			container.addEventListener("click", function(event) {
				_SCREENSTATUS = CONSTANT.SCREEN.TIMER;
			});

			return container;
		},
		displayTimer: function() {
			var container = new createjs.Container();
			// 黒色の背景
			var back = new createjs.Shape().set({name: "background"});
			back.graphics.f("#000").r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});

			// 非点灯セグメントの感じ
			var shadow = this.objectTime("#222", 350, "88:88.88");
			// 時間表示
			var time   = this.objectTime("#222", 350);

			// 「残り時間」という表示
			var text = new createjs.Text("残り時間", "Bold 100px A-OTF 新ゴ Pr6N", "#FFF");
			text.set({
				x: time.getChildByName("time").x,
				y: time.getChildByName("time").y - text.getMeasuredHeight() - 50
			});

			// フレームごとのイベント(これでいいのか…？)
			createjs.Ticker.addEventListener("tick", function(evt) {
				if ( timer.getStatus() != 0 ) {
					//timer.countTime(evt.delta/10000);
				}
				color = timer.getTimeColor();
				times = timer.getTimeFormatted();
				time.getChildByName("time").set({text: times.time, color: color});
				time.getChildByName("msec").set({text: times.msec, color: color});
			});

			container.addChild(back, shadow, text, time);
			return container;
		},
		objectTime: function(color, size, times) {
			var container = new createjs.Container();
			var time = new createjs.Text( "88:88", "Italic Bold "+size+"px DSEG7 Classic Mini", color ).set({name: "time"});
			var msec = new createjs.Text( "88", "Italic Bold "+(size/2)+"px DSEG7 Classic Mini", color ).set({name: "msec"});;
			time.set({
				x: CONSTANT.SIZE.width/2  - time.getMeasuredWidth()/2 - msec.getMeasuredWidth()/2,
				y :CONSTANT.SIZE.height/2 - time.getMeasuredHeight()/2
			});
			msec.set({
				x: CONSTANT.SIZE.width/2  + time.getMeasuredWidth()/2 - msec.getMeasuredWidth()/2,
				y :CONSTANT.SIZE.height/2 - msec.getMeasuredHeight()/2 + (size/4)
			});
			container.addChild(time, msec);
			return container;
		}
	};

	var timer, Timer = function() {
		timer = this;
		this.status  = 0;
		this.setting = { first: 0, end: 0, discussion: 0 };
		this.second  = 0;
		this.countdown = true;
		this.initalized();
	};
	Timer.prototype = {
		initalized: function() {
			this.status = 0;
			this.setting = { first: 0, end: 0, discussion: 0 };
			this.second = 0;
			this.delta  = 0;
			this.countdown = true;
		},
		// 経過時間
		countTime: function(delta) {
			this.second += delta;
			if ( this.second <= this.setting.end - this.setting.first ) {
				this.status = 1;
			}
			else if ( this.second <= this.setting.end ) {
				this.status = 2;
			}
			else if ( this.second <= this.setting.end + this.setting.discussion ) {
				this.status = 3;
			}
			else {
				this.second = this.setting.end + this.setting.discussion;
				this.stopCount();
			}
		},
		// タイマーの色
		getTimeColor: function() {
			var color = "#FFC107"
			if ( this.status == 1 ) {
				color = "#FFC107";
			}
			else if ( this.status == 2 ) {
				color = "#F44336";
			}
			else if ( this.status == 3 ) {
				color = "#00E5FF"
			}
			return color;
		},
		// 経過時間を取得
		getTime: function() {
			return this.second;
		},
		// フォーマット済みの経過時間を取得(表示用)
		getTimeFormatted: function() {
			var limit = 0;
			var time  = this.getTime();
			// ステータスが発表時間であればlimitは発表時間-経過時間
			if ( this.status < 3 ) {
				limit = this.setting.end - time;
			}
			// ステータスが討論時間であればlimitは討論時間-経過時間
			else if ( this.status == 3 ) {
				limit = time - this.setting.discussion;
			}

			var times = {
				min:  this.fillZero(Math.floor(limit/60)),
				sec:  this.fillZero(Math.floor(limit%60)),
				msec: this.fillZero(Math.floor(limit*100%100))
			};

			return {time: [times.min, times.sec].join(":"), msec: times.msec};
		},
		// タイマーをスタート
		startCount: function() {
			this.second = 0;
			this.status = 1;
		},
		// タイマーをストップ
		stopCount: function() {
			this.status = 0;
		},
		// タイマーの時間をセット
		setCount: function(first, end, discussion) {
			// タイマーを止める
			this.status = 0;
			// 入力チェック
			if ( end >= 6000 ) {
				end = 5999;
			}
			if ( discussion >= 6000 ) {
				discussion = 5999;
			}
			this.setting = {
				first: first,
				end: end,
				discussion: discussion
			};
		},
		getStatus: function() {
			return this.status;
		},
		stopTimeover: function() {
			this.stopCount();
			this.resetCount(0);
			socketio.socket.emit("stop timer");
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
				.on("set timer", $.proxy(this.resetTimer, this))
				.on("countup timer", $.proxy(this.countupTimer, this));
		},
		startTimer: function() {
			timer.startCount();
		},
		stopTimer: function() {
			timer.stopCount();
		},
		resetTimer: function(sec) {
			timer.resetCount(sec);
		},
		countupTimer: function() {
			timer.setCountup();
		}

	};

	$(document).ready(function(e){
		new Preload();
		new Timer();
		new Easel();
		new SocketIO();
		window.timer = timer;
	});


}(jQuery, createjs, io, window, undefined));
