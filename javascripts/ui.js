(function() {
	var MAINMENU_BACKGROUND_FBPNUM = 60;
	var RIX_NUM_OPENINGMENU = 4;
	var MAINMENU_LABEL_NEWGAME = 7;
	var MAINMENU_LABEL_LOADGAME = 8;

	var MENUITEM_COLOR = 0x4F;
	var MENUITEM_COLOR_INACTIVE = 0x1C;
	var MENUITEM_COLOR_CONFIRMED = 0x2C;
	var MENUITEM_COLOR_SELECTED_INACTIVE = 0x1F;
	var MENUITEM_COLOR_SELECTED_FIRST = 0xF9;
	var MENUITEM_COLOR_SELECTED_TOTALNUM = 6;
	window.__defineGetter__('MENUITEM_COLOR_SELECTED', function() {
		var e = Math.floor(Date.now() / 100);
		return MENUITEM_COLOR_SELECTED_FIRST + e % MENUITEM_COLOR_SELECTED_TOTALNUM;
	});

	var MENUITEM_VALUE_CANCELLED = 0xFFFF;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
	}

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


	_C.prototype.openingMenu = function() {
		var _ins = this;
		var wDefaultItem = 0;
		var rgMainMenuItem = [{
			wValue: 0,
			wNumWord: MAINMENU_LABEL_NEWGAME,
			fEnabled: true,
			pos: {
				x: 125,
				y: 95
			}
		}, {
			wValue: 1,
			wNumWord: MAINMENU_LABEL_LOADGAME,
			fEnabled: true,
			pos: {
				x: 125,
				y: 112
			}
		}];
		_ins.game.sound.playMusic(RIX_NUM_OPENINGMENU, true, 1);
		_ins.drawOpeningMenuBackground();
		var palette = new PAL_Palette();
		palette.loadFromChunk(0, false, _ins.game.resource.buffers.PAT_BUFFER);
		_ins.fadeIn(palette, 1, function() {
			_ins.readMenu(null, rgMainMenuItem, 2, wDefaultItem, MENUITEM_COLOR, function(selectItem) {
				console.log(selectItem);
			});
		});
	};

	_C.prototype.drawOpeningMenuBackground = function() {
		var _ins = this;
		var fbp = new PAL_Fbp(320, 200);
		fbp.loadFromChunk(MAINMENU_BACKGROUND_FBPNUM, _ins.game.resource.buffers.FBP_BUFFER);
		fbp.blitTo(_ins.game.canvas.screen);
	}

	_C.prototype.readMenu = function(change, menu, number, defaultItem, labelColor, callback) {
		var _ins = this;
		var current = (defaultItem < number) ? defaultItem : 0;
		//
		// Draw all the menu texts.
		//
		for (var i = 0; i < number; i++) {
			var bColor = labelColor;

			if (!menu[i].fEnabled) {
				if (i == current) {
					bColor = MENUITEM_COLOR_SELECTED_INACTIVE;
				} else {
					bColor = MENUITEM_COLOR_INACTIVE;
				}
			}

			_ins.game.writer.drawText(_ins.game.writer.getWord(menu[i].wNumWord), menu[i].pos, bColor, true, true);
		}

		if (typeof change == 'function') {
			change(menu[current].wValue);
		}

		_ins.game.input.clearKeyState();
		(function tick() {

			//
			// Redraw the selected item if needed.
			//
			if (menu[current].fEnabled) {
				_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
					menu[current].pos, MENUITEM_COLOR_SELECTED, false, true);
			}

			if (_ins.game.input.keyPress & (PAL_Input.kKeyDown | PAL_Input.kKeyRight)) {
				//
				// User pressed the down or right arrow key
				//
				if (menu[current].fEnabled) {
					//
					// Dehighlight the unselected item.
					//
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, labelColor, false, true);
				} else {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_INACTIVE, false, true);
				}

				current++;

				if (current >= number) {
					current = 0;
				}

				//
				// Highlight the selected item.
				//
				if (menu[current].fEnabled) {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_SELECTED, false, true);
				} else {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_SELECTED_INACTIVE, false, true);
				}

				if (typeof change == 'function') {
					change(menu[current].wValue);
				}
			} else if (_ins.game.input.keyPress & (PAL_Input.kKeyUp | PAL_Input.kKeyLeft)) {
				//
				// User pressed the up or left arrow key
				//
				if (menu[current].fEnabled) {
					//
					// Dehighlight the unselected item.
					//
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, labelColor, false, true);
				} else {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_INACTIVE, false, true);
				}

				if (current > 0) {
					current--;
				} else {
					current = number - 1;
				}

				//
				// Highlight the selected item.
				//
				if (menu[current].fEnabled) {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_SELECTED, false, true);
				} else {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_SELECTED_INACTIVE, false, true);
				}

				if (typeof change == 'function') {
					change(menu[current].wValue);
				}
			} else if (_ins.game.input.keyPress & PAL_Input.kKeyMenu) {
				//
				// User cancelled
				//
				if (menu[current].fEnabled) {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, labelColor, false, true);
				} else {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_INACTIVE, false, true);
				}
				if (typeof callback == 'function')
					callback(MENUITEM_VALUE_CANCELLED);
				return;
			} else if (_ins.game.input.keyPress & PAL_Input.kKeySearch) {
				//
				// User pressed Enter
				//
				if (menu[current].fEnabled) {
					_ins.game.writer.drawText(_ins.game.writer.getWord(menu[current].wNumWord),
						menu[current].pos, MENUITEM_COLOR_CONFIRMED, false, true);

					if (typeof callback == 'function')
						callback(menu[current].wValue);
					return;
				}
			}

			_ins.game.input.clearKeyState();
			setTimeout(tick, 50);
		})();

	}


	window.PAL_UI = _C;
})();