(function() {
	var _C = function(config) {
		var containerElement = document.getElementById(config.container);
		containerElement.style.width = config.width + 'px';
		containerElement.style.height = config.height + 'px';
		containerElement.style.background = "#000";
		this.container = containerElement;
		this.width = config.width;
		this.height = config.height;
		this.volume = config.volume == null ? 1 : config.volume;
	}

	_C.prototype.start = function() {
		var _ins = this;
		_ins.init();
	}

	_C.prototype.initResource = function(callback) {
		var _ins = this;
		_ins.resource = new PAL_Resource();
		var percent = 0;
		var drawPercent = 0;
		var opacity = 1;
		var loaded = false;
		var tick = function(e) {
			percent = e.percent;
		}
		var finish = function() {
			loaded = true;
		}
		PAL_DrawLoadingScreen(_ins.canvas.canvas, 0, opacity);
		var loadingTimer = window.setInterval(function() {
			if (drawPercent < percent) {
				PAL_DrawLoadingScreen(_ins.canvas.canvas, drawPercent, opacity);
				drawPercent += 0.02;
			} else if (loaded) {
				if (opacity < 0) {
					callback();
					window.clearInterval(loadingTimer);
				} else {
					PAL_DrawLoadingScreen(_ins.canvas.canvas, 1, opacity);
				}
				opacity -= 0.02;
			}
		}, 20);
		var error = function(e) {
			window.clearInterval(loadingTimer);
			PAL_DrawErrorScreen(_ins.canvas.canvas, '资源[' + e.target.PAL_fileData.source + ']读取失败');
		}
		_ins.resource.load(tick, finish, error);
	}

	_C.prototype.init = function() {
		var _ins = this;
		_ins.initGlobals();
		_ins.initEvent();
		_ins.initUI();
		_ins.sound = new PAL_Sound(_ins);
		_ins.initResource(function() {
			_ins.TrademarkScreen(function() {
				_ins.initGame();
			});
		});
	}

	_C.prototype.initGlobals = function() {
		var _ins = this;
		_ins.globals = {};
	}

	_C.prototype.initUI = function() {
		var _ins = this;
		_ins.canvas = new PAL_Canvas(_ins);
		_ins.ui = new PAL_UI(_ins);
		_ins.rng = new PAL_Rng(_ins);
	}

	_C.prototype.initEvent = function() {
		var _ins = this;
		window.addEventListener('keypress', function(e) {
			if (typeof _ins.onKeyPress == 'function')
				_ins.onKeyPress(e);
		}, false);
		window.addEventListener('keydown', function(e) {
			if (typeof _ins.onKeyDown == 'function')
				_ins.onKeyDown(e);
		}, false);
		window.addEventListener('keydown', function(e) {
			if (typeof _ins.onKeyDown == 'function')
				_ins.onKeyDown(e);
		}, false);
	}

	_C.prototype.initGame = function() {
		var _ins = this;
		var entry = _ins.ui.openingMenu();
	}

	// 大宇LOGO动画
	_C.prototype.TrademarkScreen = function(callback) {
		var _ins = this;
		_ins.ui.setPalette(3, false);
		_ins.rng.RNGPlay(6, 0, 1000, 25, function() {
			setTimeout(function() {
				_ins.ui.fadeOut(1, function() {
					callback();
				});
			}, 1000);
		});
	}

	window.PAL_Game = _C;
})();