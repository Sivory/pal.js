(function() {
	var DRAW_WIDTH = 320;
	var DRAW_HEIGHT = 200;
	var DRAW_PIXAL_WIDTH = 3;
	var DRAW_PIXAL_HEIGHT = 3;
	var REAL_WIDTH = 960;
	var REAL_HEIGHT = 600;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		var canvas = document.createElement('canvas');
		_ins.game.container.appendChild(canvas);
		canvas.width = REAL_WIDTH;
		canvas.height = REAL_HEIGHT;
		var context = canvas.getContext('2d');
		//调色板
		var palette = new PAL_Palette();
		//绘图缓存
		var buffer = new PAL_Surface(DRAW_WIDTH, DRAW_HEIGHT, 8);

		_ins.__defineGetter__('canvas', function() {
			return canvas;
		});

		_ins.__defineGetter__('context', function() {
			return context;
		})

		_ins.__defineGetter__('screen', function() {
			return buffer;
		})

		_ins.__defineGetter__('palette', function() {
			return palette;
		})
	}

	_C.prototype.setPalette = function(palette) {
		var _ins = this;
		for (var i = 0; i < 256; i++) {
			_ins.palette.setColor(i, palette.getColor(i));
		}
	}

	_C.prototype.flush = function() {
		var _ins = this;
		var imageData = _ins.context.getImageData(0, 0, REAL_WIDTH, REAL_HEIGHT);
		var pixals = imageData.data;
		for (var i = 0; i < DRAW_HEIGHT; i++) {
			for (var j = 0; j < DRAW_WIDTH; j++) {
				var colorIndex = _ins.screen.getPixal(j, i);
				var color = _ins.palette.getColor(colorIndex);
				for (var ii = 0; ii < DRAW_PIXAL_HEIGHT; ii++) {
					for (var jj = 0; jj < DRAW_PIXAL_WIDTH; jj++) {
						var offset = ((i * DRAW_PIXAL_HEIGHT + ii) * REAL_WIDTH + j * DRAW_PIXAL_WIDTH + jj) * 4;
						pixals[offset] = color.r;
						pixals[offset + 1] = color.g;
						pixals[offset + 2] = color.b;
						pixals[offset + 3] = 255;
					}
				}
			}
		}
		_ins.context.putImageData(imageData, 0, 0);
	}

	window.PAL_Canvas = _C;
})();