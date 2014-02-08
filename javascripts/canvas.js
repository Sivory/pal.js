(function() {
	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		_ins.game.container.style.width = PAL.REAL_WIDTH + 'px';
		_ins.game.container.style.height = PAL.REAL_HEIGHT + 'px';
		_ins.game.container.style.background = "#000";
		var canvas = document.createElement('canvas');
		_ins.game.container.appendChild(canvas);
		canvas.width = PAL.DRAW_WIDTH * PAL.DRAW_PIXAL_WIDTH;
		canvas.height = PAL.DRAW_HEIGHT * PAL.DRAW_PIXAL_HEIGHT;
		canvas.style.width = PAL.REAL_WIDTH + 'px';
		canvas.style.height = PAL.REAL_HEIGHT + 'px';
		var context = canvas.getContext('2d');
		//调色板
		var palette = new PAL_Palette();
		//绘图缓存
		var buffer = new PAL_Surface(PAL.DRAW_WIDTH, PAL.DRAW_HEIGHT, 8);

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

	_C.prototype.flush = function(rect) {
		var _ins = this;
		if (rect == null) {
			rect = {
				x: 0,
				y: 0,
				w: PAL.DRAW_WIDTH,
				h: PAL.DRAW_HEIGHT
			};
		}
		var imageData = _ins.context.getImageData(
			rect.x * PAL.DRAW_PIXAL_WIDTH,
			rect.y * PAL.DRAW_PIXAL_HEIGHT,
			rect.w * PAL.DRAW_PIXAL_WIDTH,
			rect.h * PAL.DRAW_PIXAL_HEIGHT
		);
		var pixals = imageData.data;
		for (var i = 0; i < rect.h; i++) {
			for (var j = 0; j < rect.w; j++) {
				var colorIndex = _ins.screen.getPixal(j + rect.x, i + rect.y);
				var color = _ins.palette.getColor(colorIndex);
				for (var ii = 0; ii < PAL.DRAW_PIXAL_HEIGHT; ii++) {
					for (var jj = 0; jj < PAL.DRAW_PIXAL_WIDTH; jj++) {
						var offset = ((i * PAL.DRAW_PIXAL_HEIGHT + ii) * rect.w * PAL.DRAW_PIXAL_WIDTH + j * PAL.DRAW_PIXAL_WIDTH + jj) * 4;
						pixals[offset] = color.r;
						pixals[offset + 1] = color.g;
						pixals[offset + 2] = color.b;
						pixals[offset + 3] = 255;
					}
				}
			}
		}
		_ins.context.putImageData(imageData,
			rect.x * PAL.DRAW_PIXAL_WIDTH,
			rect.y * PAL.DRAW_PIXAL_HEIGHT
		);
	}

	window.PAL_Canvas = _C;
})();