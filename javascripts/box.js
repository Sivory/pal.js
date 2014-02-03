(function() {
	var __createSingleLineBox = function(pos, nLen, fSaveScreen) {
		var _ins = this;

		var iNumLeftSprite = 44;
		var iNumMidSprite = 45;
		var iNumRightSprite = 46;

		//
		// Get the bitmaps
		//
		var lpBitmapLeft = _ins.game.ui.spriteUI.getFrame(iNumLeftSprite);
		var lpBitmapMid = _ins.game.ui.spriteUI.getFrame(iNumMidSprite);
		var lpBitmapRight = _ins.game.ui.spriteUI.getFrame(iNumRightSprite);

		var rect = {};
		rect.x = pos.x;
		rect.y = pos.y;

		//
		// Get the total width and total height of the box
		//
		rect.w = lpBitmapLeft.width + lpBitmapRight.width;
		rect.w += lpBitmapMid.width * nLen;
		rect.h = lpBitmapLeft.height;

		if (fSaveScreen) {
			//
			// Save the used part of the screen
			//
			var save = new PAL_Surface(rect.w, rect.h);

			_ins.game.canvas.screen.blitTo(save, rect, null);
			_ins.pos = pos;
			_ins.lpSavedArea = save;
			_ins.wHeight = rect.h;
			_ins.wWidth = rect.w;
		}

		//
		// Draw the box
		//
		lpBitmapLeft.blitTo(_ins.game.canvas.screen, pos);

		rect.x += lpBitmapLeft.width;
		for (var i = 0; i < nLen; i++) {
			lpBitmapMid.blitTo(_ins.game.canvas.screen, {
				x: rect.x,
				y: rect.y
			});
			rect.x += lpBitmapMid.width;
		}

		lpBitmapRight.blitTo(_ins.game.canvas.screen, {
			x: rect.x,
			y: rect.y
		});
	}

	var __createBox = function(pos, nRows, nColumns, iStyle, fSaveScreen) {
		var _ins = this;
		var rglpBorderBitmap = [
			[null, null, null],
			[null, null, null],
			[null, null, null]
		];
		//
		// Get the bitmaps
		//
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				rglpBorderBitmap[i][j] = _ins.spriteUI.getFrame(i * 3 + j + iStyle * 9);
			}
		}

		var rect = {};
		rect.x = pos.x;
		rect.y = pos.y;
		rect.w = 0;
		rect.h = 0;

		//
		// Get the total width and total height of the box
		//
		for (i = 0; i < 3; i++) {
			if (i == 1) {
				rect.w += rglpBorderBitmap[0][i].width * nColumns;
				rect.h += rglpBorderBitmap[i][0].height * nRows;
			} else {
				rect.w += rglpBorderBitmap[0][i].width;
				rect.h += rglpBorderBitmap[i][0].height;
			}
		}

		if (fSaveScreen) {
			//
			// Save the used part of the screen
			//
			var save = new PAL_Surface(rect.w, rect.h);

			_ins.game.canvas.screen.blitTo(save, rect, null);
			_ins.pos = pos;
			_ins.lpSavedArea = save;
			_ins.wHeight = rect.w;
			_ins.wWidth = rect.h;
		}

		//
		// Border takes 2 additional rows and columns...
		//
		nRows += 2;
		nColumns += 2;

		//
		// Draw the box
		//
		for (var i = 0; i < nRows; i++) {
			var x = rect.x;
			var m = (i == 0) ? 0 : ((i == nRows - 1) ? 2 : 1);

			for (var j = 0; j < nColumns; j++) {
				var n = (j == 0) ? 0 : ((j == nColumns - 1) ? 2 : 1);
				rglpBorderBitmap[m][n].blitTo(_ins.game.canvas.screen, {
					x: x,
					y: rect.y
				});
				x += rglpBorderBitmap[m][n].width;
			}

			rect.y += rglpBorderBitmap[m][0].height;
		}
	}

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		if (arguments.length == 4) {
			__createSingleLineBox.call(_ins, arguments[1], arguments[2], arguments[3]);
		} else if (arguments.length == 6) {
			__createBox.call(_ins, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		}
	}

	_C.prototype.delete = function() {
		var _ins = this;
		//
		// Restore the saved screen part
		//
		var rect = {};
		rect.x = _ins.pos.x;
		rect.y = _ins.pos.y;
		rect.w = _ins.wWidth;
		rect.h = _ins.wHeight;

		_ins.lpSavedArea.blitTo(_ins.game.canvas.screen, null, rect);
		delete _ins.pos;
		delete _ins.lpSavedArea;
		delete _ins.wHeight;
		delete _ins.wWidth;
	}

	window.PAL_Box = _C;

})();