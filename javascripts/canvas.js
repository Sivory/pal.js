(function() {
	var DRAW_WIDTH = 320;
	var DRAW_HEIGHT = 200;
	var REAL_WIDTH = 960;
	var REAL_HEIGHT = 600;
	var DRAW_PIXAL_WIDTH = 3;
	var DRAW_PIXAL_HEIGHT = 3;
	var COLOR_NUM = 256;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		var canvas = document.createElement('canvas');
		_ins.game.container.appendChild(canvas);
		canvas.width = REAL_WIDTH;
		canvas.height = REAL_HEIGHT;
		var context = canvas.getContext('2d');
		//调色板
		var palette = new ArrayBuffer(COLOR_NUM * 3);
		//绘图缓存
		var buffer = new ArrayBuffer(DRAW_WIDTH * DRAW_HEIGHT);
		buffer.pitch = DRAW_WIDTH;

		_ins.__defineGetter__('canvas', function() {
			return canvas;
		});

		_ins.__defineGetter__('context', function() {
			return context;
		})

		_ins.__defineGetter__('buffer', function() {
			return buffer;
		})

		_ins.__defineGetter__('palette', function() {
			return palette;
		})
	}

	_C.prototype.FBPBlitToScreen = function(buf) {
		var _ins = this;
		var source = new Uint8Array(buf);
		var target = new Uint8Array(_ins.buffer);
		for (var i = 0; i < DRAW_WIDTH * DRAW_HEIGHT; i++) {
			target[i] = source[i];
		}
	}

	_C.prototype.setPalette = function(buf) {
		var _ins = this;
		var source = new Uint8Array(buf);
		var target = new Uint8Array(_ins.palette);
		for (var i = 0; i < COLOR_NUM * 3; i++) {
			target[i] = source[i];
		}
	}

	_C.prototype.flush = function() {
		var _ins = this;
		var bufferView = new Uint8Array(_ins.buffer);
		var paletteView = new Uint8Array(_ins.palette);
		var imageData = _ins.context.getImageData(0, 0, REAL_WIDTH, REAL_HEIGHT);
		var pixals = imageData.data;
		for (var i = 0; i < DRAW_HEIGHT; i++) {
			for (var j = 0; j < DRAW_WIDTH; j++) {
				var colorIndex = bufferView[i * DRAW_WIDTH + j];
				var r = paletteView[colorIndex * 3];
				var g = paletteView[colorIndex * 3 + 1];
				var b = paletteView[colorIndex * 3 + 2];
				for (var ii = 0; ii < DRAW_PIXAL_HEIGHT; ii++) {
					for (var jj = 0; jj < DRAW_PIXAL_WIDTH; jj++) {
						pixals[((i * DRAW_PIXAL_HEIGHT + ii) * REAL_WIDTH + j * DRAW_PIXAL_WIDTH + jj) * 4] = r;
						pixals[((i * DRAW_PIXAL_HEIGHT + ii) * REAL_WIDTH + j * DRAW_PIXAL_WIDTH + jj) * 4 + 1] = g;
						pixals[((i * DRAW_PIXAL_HEIGHT + ii) * REAL_WIDTH + j * DRAW_PIXAL_WIDTH + jj) * 4 + 2] = b;
						pixals[((i * DRAW_PIXAL_HEIGHT + ii) * REAL_WIDTH + j * DRAW_PIXAL_WIDTH + jj) * 4 + 3] = 255;
					}
				}
			}
		}
		_ins.context.putImageData(imageData, 0, 0);
	}

	window.PAL_Canvas = _C;
})();