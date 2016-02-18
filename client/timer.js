(function($, createjs, io, QRCode, window, undefined) {

	// 定数定義
	var CONSTANT = {
		SIZE: {
			width: 1920,
			height: 1080
		},
		fps: 30,
		SCREEN: {
			LOADING: 0,
			TITLE:   1,
			TIMER:   2
		}
	};

	var manifest = [
		{id: 'Gong', src: '/assets/Gong.ogg'},
		{id: 'bell', src: '/assets/bell.ogg'}
	];

	var _SCREENSTATUS = CONSTANT.SCREEN.LOADING;
	var _SCREENSTATUS_OLD = null;

	var preload, timer, easel, socketio;

	var Easel = function() {
		this.stage = null;
		this.initalized();
		return this;
	};
	Easel.prototype = {
		// 初期化
		initalized: function() {
			// 画面領域の設定(Retinaの対応)
			$('#game').attr({
				width: CONSTANT.SIZE.width,
				height: CONSTANT.SIZE.height
			})
			.css({
				width: CONSTANT.SIZE.width / 2,
				height: CONSTANT.SIZE.height / 2
			});
			// ステージの作成
			this.stage = new createjs.Stage($('#game').get(0));
			// 入力の受付
			createjs.Touch.enable(this.stage);
			// FPSの設定
			createjs.Ticker.setFPS(CONSTANT.fps);
			// ticker
			createjs.Ticker.addEventListener('tick', $.proxy(this.transitScreen, this));
		},
		transitScreen: function(event) {
			// 画面が変更されたら
			if (_SCREENSTATUS !== _SCREENSTATUS_OLD) {
				// ローディング画面
				if (_SCREENSTATUS === CONSTANT.SCREEN.LOADING) {
					this.stage.removeAllChildren();
					this.stage.addChild(this.displayLoading());
				}
				// タイトル画面
				else if (_SCREENSTATUS === CONSTANT.SCREEN.TITLE) {
					this.stage.removeAllChildren();
					this.stage.addChild(this.displayTitle());
				}
				// タイマー
				else if (_SCREENSTATUS === CONSTANT.SCREEN.TIMER) {
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
			back.graphics.f('#000').r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});
			var text = new createjs.Text('よみこみかんりょう！', '48px PixelMplus12', '#fff');
			text.set({
				textAlign: 'center',
				x: CONSTANT.SIZE.width / 2,
				y :CONSTANT.SIZE.height / 2 - text.getMeasuredHeight() / 2,
			});
			var start = new createjs.Text('クリックでスタート', '48px PixelMplus12', '#fff');
			start.set({
				textAlign: 'center',
				x: CONSTANT.SIZE.width / 2,
				y :CONSTANT.SIZE.height / 2 - text.getMeasuredHeight() / 2 + 280,
			});
			createjs.Tween.get(start, {loop: true})
				.to({alpha: 1}, 300)
				.to({alpha: 0}, 300)
				.to({alpha: 1}, 300);

			container.addChild(back, start, text);
			container.addEventListener('click', function(event) {
				_SCREENSTATUS = CONSTANT.SCREEN.TIMER;
				// $('#game').get(0).mozRequestFullScreen();
			});

			return container;
		},
		displayTimer: function() {
			var container = new createjs.Container();
			// 黒色の背景
			var back = new createjs.Shape().set({name: 'background'});
			back.graphics.f('#000').r(0, 0, CONSTANT.SIZE.width, CONSTANT.SIZE.height);
			back.set({x: 0, y: 0});

			// 非点灯セグメントの感じ
			var shadow = this.objectTime('#222', 350, '88:88.88');
			// 時間表示
			var time   = this.objectTime('#222', 350);

			var status = new createjs.Container().set({name: 'status'});

			// 「残り時間」という表示
			var text = new createjs.Text('残り時間', 'Bold 100px A-OTF 新ゴ Pr6N', '#FFF').set({name: 'text'});
			text.set({
				x: time.getChildByName('time').x,
				y: time.getChildByName('time').y - text.getMeasuredHeight() - 50
			});

			container.addEventListener('click', function(evt) {
				timer.toggleCountArrow();
				container.getChildByName('text').set({text: (timer.countdown ? '残り時間' : '経過時間')});
			});

			// フレームごとのイベント(これでいいのか…？)
			createjs.Ticker.addEventListener('tick', function(evt) {
				if (timer.getStatus() > 0) {
					timer.countTime(evt.delta / 1000);
				}
				var color = timer.getTimeColor();
				var times = timer.getTimeFormatted();
				time.getChildByName('time').set({text: times.time, color: color});
				time.getChildByName('msec').set({text: times.msec, color: color});
			});

			container.addChild(back, shadow, text, time, status);
			return container;
		},
		objectTime: function(color, size, times) {
			var container = new createjs.Container();
			var time = new createjs.Text('88:88', 'Italic Bold ' + size + 'px DSEG7 Classic Mini', color).set({name: 'time'});
			var msec = new createjs.Text('88', 'Italic Bold ' + (size / 2) + 'px DSEG7 Classic Mini', color).set({name: 'msec'});;
			time.set({
				x: CONSTANT.SIZE.width / 2  - time.getMeasuredWidth() / 2 - msec.getMeasuredWidth() / 2,
				y :CONSTANT.SIZE.height / 2 - time.getMeasuredHeight() / 2
			});
			msec.set({
				x: CONSTANT.SIZE.width / 2  + time.getMeasuredWidth() / 2 - msec.getMeasuredWidth() / 2,
				y :CONSTANT.SIZE.height / 2 - msec.getMeasuredHeight() / 2 + (size / 4)
			});
			container.addChild(time, msec);
			return container;
		}
	};

	var Timer = function() {
		this.status  = 0;
		this.setting = { first: 0, end: 0 };
		this.modelt  = true;
		this.second  = 0;
		this.countdown = true;
		this.initalized();
		return this;
	};
	Timer.prototype = {
		initalized: function() {
			this.status = 0;
			this.setting = { first: 0, end: 0 };
			this.modelt = false;
			this.second = 0;
			this.countdown = true;
		},
		// 経過時間
		countTime: function(delta) {

			var status = this.getStatus();

			if (status <= 3) {
				var second = this.getTime();
				second += delta;
				this.setTime(second);
			}

			var setting = this.getSetting();
			var change = false;

			if (second <= setting.first) {
				change = this.setStatus(1);
			}
			else if (second <= setting.end) {
				change = this.setStatus(2);
			}
			else if (second > setting.end && second < 6000) {
				change = this.setStatus(3);
				// LTモードだったら別処理
				if (this.modelt) {
					this.stopTimeover();
				}
			}
			if (change) {
				this.playBell(status);
			}
		},
		// タイマーの色
		getTimeColor: function() {
			var status = this.getStatus();
			var color  = '#CDDC39';
			if (status === 1) {
				// 緑
				color = '#CDDC39';
			}
			else if (status === 2) {
				// オレンジ
				color = '#FFC107';
			}
			else if (status === 3) {
				// 赤
				color = '#F44336';
			}
			else if (status < 0) {
				color = '#F44336';
			}
			return color;
		},
		// フォーマット済みの経過時間を取得(表示用)
		getTimeFormatted: function() {
			var limit   = 0;
			var status  = this.getStatus();
			var setting = this.getSetting();
			var time    = this.getTime();
			if (this.countdown) {
				// ステータスが発表時間であればlimitは発表時間-経過時間
				switch (status) {
				case -1:
					limit = 0;
					break;
				case 0:
					limit = setting.end;
					break;
				case 1:
				case 2:
					limit = setting.end - time;
					break;
				case 3:
				// case 4:
					limit = time - setting.end;
					break;
				default:
					limit = setting.end - time;
					break;
				}
			}
			else {
				limit = time;
			}

			var times = {
				min:  this.fillZero(Math.floor(limit / 60)),
				sec:  this.fillZero(Math.floor(limit % 60)),
				msec: this.fillZero(Math.floor(limit * 100 % 100))
			};

			return {time: [times.min, times.sec].join(':'), msec: times.msec};
		},
		// タイマーをスタート
		startCount: function() {
			if (this.status !== 4) {
				this.second = 0;
			}
			this.status = 1;
		},
		// タイマーをストップ
		stopCount: function() {
			this.status = 4;
		},
		// タイムオーバーの処理
		stopTimeover: function() {
			this.status = -1;
			this.second = this.setting.end;
			// createjs.Sound.play('Gong');
		},
		// 残り時間表示と経過時間表示を切り替え
		toggleCountArrow: function() {
			if (this.countdown) {
				this.countdown = false;
			}
			else {
				this.countdown = true;
			}
		},
		toggleLTMode: function() {
			if (this.modelet) {
				this.modelet = false;
			}
			else {
				this.modelet = true;
			}
		},
		// 経過時間を取得
		getTime: function() {
			return this.second;
		},
		// 経過時間をセット
		setTime: function(time) {
			this.second = time;
		},
		// ステータスを取得
		getStatus: function() {
			return this.status;
		},
		// ステータスをセット
		setStatus: function(status) {
			var oldStatus = this.status;
			this.status = status;
			if (status !== oldStatus) {
				return true;
			}
			else {
				return false;
			}
		},
		// タイマーの設定を取得
		getSetting: function() {
			return this.setting;
		},
		// タイマーの設定をセット
		setSetting: function(times) {
			// タイマーを止める
			this.setStatus(0);
			this.setTime(0);
			// 入力チェック
			if (times.end >= 6000) {
				times.end = 5999;
			}
			if (times.discussion >= 6000) {
				times.discussion = 5999;
			}
			this.setting = times;
		},
		fillZero: function(num) {
			return (('0' + num).slice(-2));
		},
		playBell: function(call) {
			for (var i = 0; i < call; i++) {
				createjs.Sound.play('bell', {delay: 200 * i});
			}
		}
	};

	// Preload.js
	var Preload = function() {
		this.load = null;
		this.initalized();
		return this;
	};
	Preload.prototype = {
		// 初期化
		initalized: function() {
			// Preload.js
			this.load = new createjs.LoadQueue();

			createjs.Sound.alternateExtensions = ['mp3'];

			// 最大並列接続数
			this.load.setMaxConnections(6);

			// Sound.jsのインストール
			this.load.installPlugin(createjs.Sound);

			// 読み込みの進行状況が変化した
			this.load.addEventListener('progress', this.handleProgress);
			// 1つのファイルを読み込み終わったら
			// this.load.addEventListener('fileload', this.handleFileLoadComplete);
			// 全てのファイルを読み込み終わったら
			this.load.addEventListener('complete', this.handleComplete);

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
	};

	var SocketIO = function() {
		this.socket = io();
		this.initalized();
		return this;
	};
	SocketIO.prototype = {
		initalized: function() {
			this.socket.on('connect', $.proxy(function(d) {
				var ctrlURL = 'http://127.0.0.1:3000/control?' + this.socket.id;
				new QRCode(document.getElementById('qrcode'), ctrlURL);
				$('#qrcode').attr({'href': ctrlURL});
				console.log(this.socket.id);
			}, this));
			this.socket.on('debug', $.proxy(function(msg) {
				console.log(msg);
			}, this));
			this.socket.on('timer', $.proxy(function(command, times) {
				switch (command) {
				case 'start':
					this.startTimer();
					break;
				case 'stop':
					this.stopTimer();
					break;
				case 'set':
					this.setTimer(times);
					break;
				case 'countup':
					this.countup();
					break;
				case 'ltmode':
					this.toggleLTmode();
					break;
				default:
					console.log(command + 'is not found.');
					break;
				}
			}, this));
		},
		startTimer: function() {
			timer.startCount();
		},
		stopTimer: function() {
			timer.stopCount();
		},
		setTimer: function(times) {
			timer.setSetting(times);
		},
		countupTimer: function() {
			timer.toggleCountArrow();
		},
		toggleLTmode: function() {
			timer.toggleLTmode();
		}
	};

	$(document).ready(function(e) {
		preload = new Preload();
		timer = new Timer();
		easel = new Easel();
		socketio = new SocketIO();
		window.timer = timer;
		window.socketio = socketio;
		$('#enterFullScreen').click(function() {
			$('#game').get(0).mozRequestFullScreen();
		});
	});


}(jQuery, createjs, io, QRCode, window, undefined));
