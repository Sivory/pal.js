(function() {
	_C = function(size) {
		if (!size) size = 32000;
		var _ins = this;
		var buffer = new ArrayBuffer(size);
		var data = new DataView(buffer);
		_ins.__defineGetter__('data', function() {
			return data;
		});
		_ins.__defineGetter__('buffer', function() {
			return buffer;
		});
		_ins.__defineGetter__('size', function() {
			return size;
		});
	}

	_C.prototype.getFrame = function(index) {
		var _ins = this;

		var imagecount = _ins.data.getUint16(0, true);

		if (index < 0 || index >= imagecount) {
			//
			// The frame does not exist
			//
			return null;
		}

		//
		// Get the offset of the frame
		//
		index <<= 1;
		var offset = _ins.data.getUint16(index, true) << 1;
		var rleBuffer = _ins.buffer.slice(offset);
		var frame = new PAL_Rle(rleBuffer);
		return frame;
	}

	_C.prototype.loadFromChunk = function(index, fBuffer, compressed) {
		var _ins = this;
		//默认执行解压操作
		if (compressed == null)
			compressed = true;
		if (compressed) {
			return PAL_Util.MKFDecompressChunk(_ins.data, _ins.size, index, fBuffer);
		} else {
			return PAL_Util.MKFReadChunk(_ins.data, _ins.size, index, fBuffer);
		}
	}

	_C.prototype.__defineGetter__('frameNumber', function() {
		var _ins = this;
		return _ins.data.getUint16(0, true) - 1;
	});

	window.PAL_Sprite = _C;
})();