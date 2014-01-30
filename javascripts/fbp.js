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

	_C.prototype.blitTo = function(surface) {
		var _ins = this;
		for (var i = 0; i < _ins.height; i++) {
			for (var j = 0; j < _ins.width; j++) {
				surface.setPixal(j, i, _ins.data.getUint8(i * _ins.width + j));
			}
		}
	}
	window.PAL_Fbp = _C;
})();