(function() {
	var util = {};

	util.MKFGetChunkCount = function(fBuffer) {
		var dv = new DataView(fBuffer);
		var iNumChunk = dv.getUint32(0, true);
		return iNumChunk;
	}

	util.MKFGetChunkSize = function(uiChunkNum, fBuffer) {
		var uiOffset = 0;
		var uiNextOffset = 0;
		var uiChunkCount = 0;

		//
		// Get the total number of chunks.
		//
		uiChunkCount = util.MKFGetChunkCount(fBuffer);
		if (uiChunkNum >= uiChunkCount) {
			return -1;
		}

		//
		// Get the offset of the specified chunk and the next chunk.
		//
		var dv = new DataView(fBuffer, 4 * uiChunkNum);
		uiOffset = dv.getUint32(0, true);
		uiNextOffset = dv.getUint32(4, true);

		//
		// Return the length of the chunk.
		//
		return uiNextOffset - uiOffset;
	}

	util.MKFReadChunk = function(lpDataView, uiBufferSize, uiChunkNum, fBuffer) {
		var uiOffset = 0;
		var uiNextOffset = 0;
		var uiChunkCount;
		var uiChunkLen;

		if (lpDataView == null || fBuffer == null || uiBufferSize == 0) {
			return -1;
		}

		//
		// Get the total number of chunks.
		//
		uiChunkCount = util.MKFGetChunkCount(fBuffer);
		if (uiChunkNum >= uiChunkCount) {
			return -1;
		}

		//
		// Get the offset of the chunk.
		//
		var dv = new DataView(fBuffer, 4 * uiChunkNum);
		uiOffset = dv.getUint32(0, true);
		uiNextOffset = dv.getUint32(4, true);

		//
		// Get the length of the chunk.
		//
		uiChunkLen = uiNextOffset - uiOffset;

		if (uiChunkLen > uiBufferSize) {
			return -2;
		}

		if (uiChunkLen != 0) {
			var sdv = new DataView(fBuffer, uiOffset);
			for (var i = 0; i < uiChunkLen; i++) {
				lpDataView.setUint8(i, sdv.getUint8(i));
			}
		} else {
			return -1;
		}

		return uiChunkLen;
	}

	util.MKFGetDecompressedSize = function(uiChunkNum, fBuffer)
	{
		var pointer = 0;
		var buf = [];
		var data = new DataView(fBuffer);

		if (fBuffer == null) {
			return -1;
		}

		//
		// Get the total number of chunks.
		//
		var uiChunkCount = util.MKFGetChunkCount(fBuffer);
		if (uiChunkNum >= uiChunkCount) {
			return -1;
		}

		//
		// Get the offset of the chunk.
		//
		pointer = 4 * uiChunkNum;
		var uiOffset = data.getUint32(pointer, true);

		//
		// Read the header.
		//
		pointer = uiOffset;
		buf[0] = data.getUint32(pointer, true);
		pointer += 4;
		buf[1] = data.getUint32(pointer, true);

		return (buf[0] != 0x315f4a59) ? -1 : buf[1];
	}

	util.MKFDecompressChunk = function(lpDataView, uiBufferSize, uiChunkNum, fBuffer) {
		var len = util.MKFGetChunkSize(uiChunkNum, fBuffer);
		if (len <= 0) {
			return len;
		}

		var buf = new ArrayBuffer(len);
		var bufDataView = new DataView(buf);

		util.MKFReadChunk(bufDataView, len, uiChunkNum, fBuffer);

		len = PAL_YJ1.Decompress(bufDataView, lpDataView, uiBufferSize);

		return len;
	}

	util.requestAnimationFrame = function(tick) {
		if ( !! window.requestAnimationFrame) window.requestAnimationFrame(tick);
		else if ( !! window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(tick);
		else if ( !! window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(tick);
		else if ( !! window.msRequestAnimationFrame) window.msRequestAnimationFrame(tick);
		else setTimeout(tick, 20);
	};

	util.RandomLong = function(start, end) {
		if (end <= start) return start;
		return Math.round(Math.random() * (end - start)) + start;
	}

	util.trim = function(data) {
		var pos = 0,
			dest = 0;
		// 前置空格移除
		while (data.getUint8(pos) <= 0x20 && data.getUint8(pos) > 0) {
			pos++;
		}
		while (data.getUint8(pos) > 0) {
			data.setUint8(dest++, data.getUint8(pos++));
		}
		data.setUint8(dest--, 0);
		// 后置空格移除
		while (dest >= 0 && data.getUint8(dest) <= 0x20 && data.getUint8(dest) > 0) {
			data.setUint8(dest--, 0);
		}
	}

	// 待完善：低效代码
	util.strlen = function(data) {
		var length = 0;
		while (data.getUint8(length) > 0) {
			length++;
		}
		return length;
	}

	util.memcpy = function(target, source, length) {
		for (var i = 0; i < length; i++) {
			target.setUint8(i, source.getUint8(i));
		}
	}

	// 字节交换函数
	util.SWAP16 = function(s) {
		return ((s & 0xff) << 8) | ((s >> 8) & 0xff);
	}
	util.SWAP32 = function(l) {
		return (l >> 24) | ((l & 0x00ff0000) >> 8) | ((l & 0x0000ff00) << 8) | (l << 24);
	}

	util.fgets = function(data, fBuffer) {
		if (fBuffer.__PAL__pointerpos == null)
			fBuffer.__PAL__pointerpos = 0;
		var spointer = fBuffer.__PAL__pointerpos;
		var tpointer = 0;
		var source = new Uint8Array(fBuffer);
		var target = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		//遇到回车符终止
		while (spointer < source.length && source[spointer] != 0x0d) {
			//忽略换行符
			if (source[spointer] != 0x0a) {
				target[tpointer++] = source[spointer];
			}
			spointer++;
		}
		target[tpointer] = 0;
		fBuffer.__PAL__pointerpos = spointer;
		if (tpointer == 0) return null;
		else return tpointer;
	}

	util.strchr = function(data, ch) {
		var code = ch.charCodeAt(0);
		var index = 0;
		while (index < data.byteLength && data.getUint8(index) != code)
			index++;
		if (index == data.byteLength) return -1;
		else return index;
	}

	util.getHex = function(data) {
		var res = 0;
		for (var i = 0; i < data.byteLength; i++) {
			var e = data.getUint8(i);
			if (e >= 0x30 && e <= 0x39) {
				res = res * 16 + (e - 0x30);
			} else if (e >= 0x61 && e <= 0x66) {
				res = res * 16 + (e - 0x61 + 10);
			} else
				break;
		}
		return res;
	}

	util.strdup = function(data, p) {
		var length = data.byteLength - p;
		var res = new DataView(new ArrayBuffer(length));
		for (var i = 0; i < length; i++) {
			res.setUint8(i, data.getUint8(p + i));
		}
		return res;
	}

	util.memset = function(data, value, size) {
		for (var i = 0; i < size; i++) {
			data.setUint8(i, value);
		}
	}

	util.memcpy = function(target, source, size) {
		for (var i = 0; i < size; i++) {
			target.setUint8(i, source.getUint8(i));
		}
	}

	window.PAL_Util = util;
})();