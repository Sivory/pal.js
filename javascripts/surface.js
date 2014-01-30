(function() {
	var _C = function(width, height) {
		var _ins = this;
		var buffer = new ArrayBuffer(width * height);
		var data = new DataView(buffer);
		_ins.__defineGetter__('buffer', function() {
			return buffer;
		});
		_ins.__defineGetter__('data', function() {
			return data;
		});
		_ins.__defineGetter__('width', function() {
			return width
		});
		_ins.__defineGetter__('height', function() {
			return height
		});
	}

	_C.prototype.loadFromChunk = function(index, fBuffer) {
		var _ins = this;
		PAL_Util.MKFDecompressChunk(_ins.data, _ins.width * _ins.height, index, fBuffer);
	}

	_C.prototype.getPixal = function(x, y) {
		var _ins = this;
		return _ins.data.getUint8(y * _ins.width + x);
	}

	_C.prototype.setPixal = function(x, y, value) {
		var _ins = this;
		try {
			_ins.data.setUint8(y * _ins.width + x, value);
		} catch (e) {
			console.log(x, y);
			throw "err";
		}
	}

	_C.prototype.blitTo = function(targetSurface, srcrect, desrect) {
		var _ins = this;
		for (var i = 0; i < srcrect.h; i++) {
			for (var j = 0; j < srcrect.w; j++) {
				var pixal = _ins.getPixal(j + srcrect.x, i + srcrect.y);
				targetSurface.setPixal(j + desrect.x, i + desrect.y, pixal);
			}
		}
	}
	window.PAL_Surface = _C;
})();