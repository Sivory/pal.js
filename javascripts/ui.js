(function() {
	var MAINMENU_BACKGROUND_FBPNUM = 60;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
	}

	_C.prototype.openingMenu = function() {
		var _ins = this;
		_ins.drawOpeningMenuBackground();
		var palette = _ins.getPalette(0, false);
		_ins.game.canvas.setPalette(palette);
		_ins.game.canvas.flush();
	};

	_C.prototype.getPalette = function(iPaletteNum, fNight) {
		var _ins = this;
		var fBuffer = _ins.game.resource.buffers.PAT_BUFFER;
		var buf = new ArrayBuffer(1536);
		var bufDataView = new DataView(buf);
		var len = PAL_Util.MKFReadChunk(bufDataView, 1536, iPaletteNum, fBuffer);

		if (len < 0) {
			return null;
		} else if (len <= 256 * 3) {
			fNight = false;
		}

		var palette = new ArrayBuffer(256 * 3);
		var paletteArray = new Uint8Array(palette);
		for (var i = 0; i < 256; i++) {
			paletteArray[i * 3] = bufDataView.getUint8((fNight ? 256 * 3 : 0) + i * 3) << 2;
			paletteArray[i * 3 + 1] = bufDataView.getUint8((fNight ? 256 * 3 : 0) + i * 3 + 1) << 2;
			paletteArray[i * 3 + 2] = bufDataView.getUint8((fNight ? 256 * 3 : 0) + i * 3 + 2) << 2;
		}

		return palette;
	}

	_C.prototype.drawOpeningMenuBackground = function() {
		var _ins = this;
		var buf = new ArrayBuffer(320 * 200);
		var bufDataView = new DataView(buf);

		var res = PAL_Util.MKFDecompressChunk(bufDataView, 320 * 200, MAINMENU_BACKGROUND_FBPNUM, _ins.game.resource.buffers.FBP_BUFFER);
		_ins.game.canvas.FBPBlitToScreen(buf);

	}

	window.PAL_UI = _C;
})();