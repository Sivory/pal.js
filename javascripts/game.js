(function() {
	var BITMAPNUM_SPLASH_UP = 0x26;
	var BITMAPNUM_SPLASH_DOWN = 0x27;
	var SPRITENUM_SPLASH_TITLE = 0x47;
	var SPRITENUM_SPLASH_CRANE = 0x49;
	var NUM_RIX_TITLE = 0x5;

	var _C = function(config) {
		var containerElement = document.getElementById(config.container);
		this.container = containerElement;
	}

	_C.prototype.start = function() {
		var _ins = this;
		_ins.initGlobals();
		_ins.initInput();
		_ins.sound = new PAL_Sound(_ins);
		_ins.canvas = new PAL_Canvas(_ins);
		_ins.initResource(function() {
			_ins.initUI();
			_ins.writer = new PAL_Writer(_ins);
			_ins.TrademarkScreen(function() {
				_ins.splashScreen(function() {
					_ins.initGame();
				});
			});
		});
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

	_C.prototype.initInput = function() {
		var _ins = this;
		_ins.input = new PAL_Input(_ins);
		window.addEventListener('keydown', function(e) {
			_ins.input.keyDownHandler(e);
		}, false);

		window.addEventListener('keyup', function(e) {
			_ins.input.keyUpHandler(e);
		}, false);
	}

	_C.prototype.initGlobals = function() {
		var _ins = this;
		_ins.globals = {};
	}

	_C.prototype.initUI = function() {
		var _ins = this;
		_ins.ui = new PAL_UI(_ins);
		_ins.rng = new PAL_RngPlayer(_ins);
	}

	_C.prototype.initGame = function() {
		var _ins = this;
		_ins.ui.openingMenu(function(entry) {
			console.log(entry);
		});
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

	//开场动画
	//山水背景分上下两部分拼接
	//仙鹤9只 位置与姿态随机生成
	_C.prototype.splashScreen = function(callback) {
		var _ins = this;
		var palette = new PAL_Palette();
		palette.loadFromChunk(1, false, _ins.resource.buffers.PAT_BUFFER);
		var rgCurrentPalette = new PAL_Palette();
		var spriteCrane;
		var buf, buf2;
		var cranepos = [],
			iImgPos = 200,
			iCraneFrame = 0;
		var fUseCD = true;

		//
		// Create the surfaces
		//
		var lpBitmapDown = new PAL_Surface(320, 200);
		var lpBitmapUp = new PAL_Surface(320, 200);

		//
		// Read the bitmaps
		//
		lpBitmapUp.loadFromChunk(BITMAPNUM_SPLASH_UP, _ins.resource.buffers.FBP_BUFFER);
		lpBitmapDown.loadFromChunk(BITMAPNUM_SPLASH_DOWN, _ins.resource.buffers.FBP_BUFFER);
		var spriteTitle = new PAL_Sprite(32000);
		spriteTitle.loadFromChunk(SPRITENUM_SPLASH_TITLE, _ins.resource.buffers.MGO_BUFFER);
		var bitmapTitle = spriteTitle.getFrame(0);

		var spriteCrane = new PAL_Sprite(32000);
		spriteCrane.loadFromChunk(SPRITENUM_SPLASH_CRANE, _ins.resource.buffers.MGO_BUFFER);

		var iTitleHeight = bitmapTitle.height;
		bitmapTitle.height = 0;

		//
		// Generate the positions of the cranes
		//
		for (var i = 0; i < 9; i++) {
			cranepos.push({
				x: PAL_Util.RandomLong(300, 600),
				y: PAL_Util.RandomLong(0, 80),
				frame: PAL_Util.RandomLong(0, 8)
			});
		}

		//
		// Play the title music
		//
		_ins.sound.playMusic(NUM_RIX_TITLE, true, 2);

		_ins.input.clearKeyState();

		var dwBeginTime = Date.now();
		var dwTime = 0;
		(function tick() {
			var stopLoop = false;
			if (Date.now() - dwBeginTime >= dwTime + 85) {
				dwTime = Date.now() - dwBeginTime;
				//
				// Set the palette
				//
				if (dwTime < 15000) {
					for (var i = 0; i < 256; i++) {
						var color = palette.getColor(i);
						color.r = Math.floor(color.r * (dwTime / 15000));
						color.g = Math.floor(color.g * (dwTime / 15000));
						color.b = Math.floor(color.b * (dwTime / 15000));
						rgCurrentPalette.setColor(i, color);
					}
				}
				_ins.canvas.setPalette(rgCurrentPalette);

				//
				// Draw the screen
				//
				if (iImgPos > 1) {
					iImgPos--;
				}

				//
				// The upper part...
				//
				lpBitmapUp.blitTo(_ins.canvas.screen, {
					x: 0,
					y: iImgPos,
					w: 320,
					h: 200 - iImgPos
				}, {
					x: 0,
					y: 0,
					w: 320,
					h: 200 - iImgPos
				});

				//
				// The lower part...
				//
				lpBitmapDown.blitTo(_ins.canvas.screen, {
					x: 0,
					y: 0,
					w: 320,
					h: iImgPos
				}, {
					x: 0,
					y: 200 - iImgPos,
					w: 320,
					h: iImgPos
				});

				//
				// Draw the cranes...
				//
				for (i = 0; i < 9; i++) {
					var lpFrame = spriteCrane.getFrame(cranepos[i].frame = (cranepos[i].frame + (iCraneFrame & 1)) % 8);
					cranepos[i].y += ((iImgPos > 1) && (iImgPos & 1)) ? 1 : 0;
					lpFrame.blitTo(_ins.canvas.screen, {
						x: cranepos[i].x,
						y: cranepos[i].y
					});
					cranepos[i].x--;
				}
				iCraneFrame++;

				//
				// Draw the title...
				//
				if (bitmapTitle.height < iTitleHeight) {
					//
					// HACKHACK
					//
					var height = bitmapTitle.height;
					height++;
					bitmapTitle.height = height;
				}
				bitmapTitle.blitTo(_ins.canvas.screen, {
					x: 255,
					y: 10
				});

				_ins.canvas.flush();

				if (_ins.input.keyPress & (PAL_Input.kKeyMenu | PAL_Input.kKeySearch)) {
					//
					// User has pressed a key...
					//
					bitmapTitle.height = iTitleHeight;

					bitmapTitle.blitTo(_ins.canvas.screen, {
						x: 255,
						y: 10
					});

					_ins.canvas.flush();

					if (dwTime < 15000) {
						//
						// If the picture has not completed fading in, complete the rest
						//
						var dwTimeTemp = dwTime;
						(function tick() {
							dwTime = Date.now() - dwBeginTime;
							dwTime = dwTimeTemp + (dwTime - dwTimeTemp) * 30;
							if (dwTime >= 15000) {
								window.setTimeout(function() {
									_ins.sound.playMusic(0, false, 1);
									_ins.ui.fadeOut(1, callback);
								}, 500);
								return;
							}
							for (var i = 0; i < 256; i++) {
								var color = palette.getColor(i);
								color.r = Math.floor(color.r * (dwTime / 15000));
								color.g = Math.floor(color.g * (dwTime / 15000));
								color.b = Math.floor(color.b * (dwTime / 15000));
								rgCurrentPalette.setColor(i, color);
							}
							_ins.canvas.setPalette(rgCurrentPalette);
							_ins.canvas.flush();

							PAL_Util.requestAnimationFrame(tick);
						})();
					} else {
						window.setTimeout(function() {
							_ins.sound.playMusic(0, false, 1);
							_ins.ui.fadeOut(1, callback);
						}, 500);
					}

					//
					// Quit the splash screen
					//
					return;
				}
			}
			PAL_Util.requestAnimationFrame(tick);
		})();

	}

	window.PAL_Game = _C;
})();