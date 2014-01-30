(function() {
	var _C = function(palette) {
		var _ins = this;
		var buffer = new ArrayBuffer(256 * 3);
		//复制
		if ( !! palette) {
			buffer = palette.buffer.slice(0);
		}
		var data = new DataView(buffer);
		_ins.__defineGetter__('buffer', function() {
			return buffer;
		});
		_ins.__defineGetter__('data', function() {
			return data;
		})
	}

	_C.prototype.getColor = function(index) {
		var _ins = this;
		var color = {};
		color.r = _ins.data.getUint8(index * 3);
		color.g = _ins.data.getUint8(index * 3 + 1);
		color.b = _ins.data.getUint8(index * 3 + 2);
		return color;
	}

	_C.prototype.setColor = function(index, color) {
		var _ins = this;
		_ins.data.setUint8(index * 3, color.r);
		_ins.data.setUint8(index * 3 + 1, color.g);
		_ins.data.setUint8(index * 3 + 2, color.b);
	}

	_C.prototype.loadFromChunk = function(index, fNight, fBuffer) {
		var _ins = this;
		var buf = new ArrayBuffer(256 * 6);
		var data = new DataView(buf);
		var len = PAL_Util.MKFReadChunk(data, 256 * 6, index, fBuffer);

		if (len < 0) {
			throw "error";
		} else if (len <= 256 * 3) {
			fNight = false;
		}

		var paletteBuffer = new ArrayBuffer(256 * 3);
		var paletteArray = new Uint8Array(paletteBuffer);
		for (var i = 0; i < 256; i++) {
			var color = {};
			color.r = data.getUint8((fNight ? 256 * 3 : 0) + i * 3) << 2;
			color.g = data.getUint8((fNight ? 256 * 3 : 0) + i * 3 + 1) << 2;
			color.b = data.getUint8((fNight ? 256 * 3 : 0) + i * 3 + 2) << 2;
			_ins.setColor(i, color);
		}
	}
	window.PAL_Palette = _C;
})();