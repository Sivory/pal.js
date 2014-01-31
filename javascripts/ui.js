(function() {
	var MAINMENU_BACKGROUND_FBPNUM = 60;
	var RIX_NUM_OPENINGMENU = 4;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
	}

	_C.prototype.openingMenu = function() {
		var _ins = this;
		_ins.game.sound.playMusic(RIX_NUM_OPENINGMENU, true, 1);
		_ins.drawOpeningMenuBackground();
		var palette = new PAL_Palette();
		palette.loadFromChunk(0, false, _ins.game.resource.buffers.PAT_BUFFER);
		_ins.fadeIn(palette, 1, function() {
			console.log('done');
		});
	};

	_C.prototype.setPalette = function(iPaletteNum, fNight) {
		var _ins = this;
		var palette = new PAL_Palette();
		palette.loadFromChunk(iPaletteNum, fNight, _ins.game.resource.buffers.PAT_BUFFER);
		_ins.game.canvas.setPalette(palette);
	}

	_C.prototype.fadeIn = function(palette, iDelay, callback) {
		var _ins = this;
		//
		// Start fading out...
		//
		var paletteTemp = new PAL_Palette(palette);
		var time = Date.now() + iDelay * 10 * 60;

		(function tick() {
			//
			// Set the current palette...
			//
			var j = Math.floor((time - Date.now()) / iDelay / 10);
			if (j < 0) {
				_ins.game.canvas.setPalette(palette);
				_ins.game.canvas.flush();
				callback();
				return;
			}
			j = 60 - j;
			for (var i = 0; i < 256; i++) {
				var _color = paletteTemp.getColor(i);
				var color = {
					r: Math.floor(_color.r * j) >> 6,
					g: Math.floor(_color.g * j) >> 6,
					b: Math.floor(_color.b * j) >> 6
				};
				palette.setColor(i, color);
			}
			_ins.game.canvas.setPalette(palette);
			_ins.game.canvas.flush();
			PAL_Util.requestAnimationFrame(tick);
		})();
	}

	_C.prototype.fadeOut = function(iDelay, callback) {
		var _ins = this;
		//
		// Get the original palette...
		//
		var palette = _ins.game.canvas.palette;
		var paletteTemp = new PAL_Palette(palette);

		//
		// Start fading out...
		//
		var time = Date.now() + iDelay * 10 * 60;

		(function tick() {
			//
			// Set the current palette...
			//
			var j = Math.floor((time - Date.now()) / iDelay / 10);
			if (j < 0) {
				for (var i = 0; i < palette.length; i++) {
					var color = {
						r: 0,
						g: 0,
						b: 0
					};
					palette.setColor(i, color);
				}
				_ins.game.canvas.flush();
				callback();
				return;
			}
			for (var i = 0; i < 256; i++) {
				var _color = paletteTemp.getColor(i);
				var color = {
					r: Math.floor(_color.r * j) >> 6,
					g: Math.floor(_color.g * j) >> 6,
					b: Math.floor(_color.b * j) >> 6
				};
				palette.setColor(i, color);
			}
			_ins.game.canvas.flush();
			PAL_Util.requestAnimationFrame(tick);
		})();

	}


	_C.prototype.drawOpeningMenuBackground = function() {
		var _ins = this;
		var fbp = new PAL_Fbp(320, 200);
		fbp.loadFromChunk(MAINMENU_BACKGROUND_FBPNUM, _ins.game.resource.buffers.FBP_BUFFER);
		fbp.blitTo(_ins.game.canvas.screen);

	}

	window.PAL_UI = _C;
})();