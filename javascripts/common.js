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

	window.PAL_Util = util;
})();