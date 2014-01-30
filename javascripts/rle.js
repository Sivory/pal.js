(function() {
	var _C = function(buffer) {
		var _ins = this;
		var data = new DataView(buffer);
		_ins.__defineGetter__('buffer', function() {
			return buffer;
		});
		_ins.__defineGetter__('data', function() {
			return data;
		})
	}

	_C.prototype.blitTo = function(surface, pos) {
		var _ins = this;

		var rlePointer = 0;

		//
		// Skip the 0x00000002 in the file header.
		//
		if (_ins.data.getUint32(0, true) == 0x00000002) {
			rlePointer += 4;
		}

		//
		// Get the width and height of the bitmap.
		//
		var uiWidth = _ins.data.getUint16(rlePointer, true);
		var uiHeight = _ins.data.getUint16(rlePointer + 2, true);

		//
		// Calculate the total length of the bitmap.
		// The bitmap is 8-bpp, each pixel will use 1 byte.
		//
		var uiLen = uiWidth * uiHeight;

		//
		// Start decoding and blitting the bitmap.
		//
		rlePointer += 4;
		for (var i = 0; i < uiLen;) {
			var stopLoop = false;
			var T = _ins.data.getUint8(rlePointer++);
			if ((T & 0x80) && T <= 0x80 + uiWidth) {
				i += T - 0x80;
			} else {
				for (var j = 0; j < T; j++) {
					//
					// Calculate the destination coordination.
					// FIXME: This could be optimized
					//
					var y = Math.floor((i + j) / uiWidth) + pos.y;
					var x = (i + j) % uiWidth + pos.x;

					//
					// Skip the points which are out of the surface.
					//
					if (x < 0) {
						j += -x - 1;
						continue;
					} else if (x >= surface.width) {
						j += x - surface.width;
						continue;
					}

					if (y < 0) {
						j += -y * uiWidth - 1;
						continue;
					} else if (y >= surface.height) {
						// No more pixels needed, break out
						stopLoop = true;
						break;
					}

					//
					// Put the pixel onto the surface
					//
					surface.setPixal(x, y, _ins.data.getUint8(j + rlePointer));
				}
				if (stopLoop) break;
				rlePointer += T;
				i += T;
			}
		}
		return 0;
	}

	_C.prototype.__defineGetter__('width', function() {
		var _ins = this;
		var pointer = 0;
		//
		// Skip the 0x00000002 in the file header.
		//
		if (_ins.data.getUint32(0, true) == 0x00000002) {
			pointer += 4;
		}

		//
		// Return the width of the bitmap.
		//
		return _ins.data.getUint16(pointer, true);
	});

	_C.prototype.__defineSetter__('width', function(value) {
		var _ins = this;
		var pointer = 0;
		//
		// Skip the 0x00000002 in the file header.
		//
		if (_ins.data.getUint32(0, true) == 0x00000002) {
			pointer += 4;
		}

		_ins.data.setUint16(pointer, value, true);
	});

	_C.prototype.__defineGetter__('height', function() {
		var _ins = this;
		var pointer = 0;
		//
		// Skip the 0x00000002 in the file header.
		//
		if (_ins.data.getUint32(0, true) == 0x00000002) {
			pointer += 4;
		}

		//
		// Return the width of the bitmap.
		//
		return _ins.data.getUint16(pointer + 2, true);
	});

	_C.prototype.__defineSetter__('height', function(value) {
		var _ins = this;
		var pointer = 0;
		//
		// Skip the 0x00000002 in the file header.
		//
		if (_ins.data.getUint32(0, true) == 0x00000002) {
			pointer += 4;
		}

		_ins.data.setUint16(pointer + 2, value, true);
	});

	window.PAL_Rle = _C;
})();