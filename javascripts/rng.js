//RNG过场动画播放器

(function() {

	var _C = function(game) {
		this.game = game;
	};

	_C.prototype.RNGReadFrame = function(bufferDataView, uiBufferSize, uiRngNum, uiFrameNum, fBuffer) {
		var uiSubOffset = 0;

		//
		// Get the total number of chunks.
		//
		var uiChunkCount = PAL_Util.MKFGetChunkCount(fBuffer);
		if (uiRngNum >= uiChunkCount) {
			return -1;
		}

		//
		// Get the offset of the chunk.
		//
		var fBufferDataView = new DataView(fBuffer);
		var uiOffset = fBufferDataView.getUint32(4 * uiRngNum, true);
		var uiNextOffset = fBufferDataView.getUint32(4 * uiRngNum + 4, true);

		//
		// Get the length of the chunk.
		//
		var iChunkLen = uiNextOffset - uiOffset;
		if (iChunkLen == 0) {
			return -1;
		}

		//
		// Get the number of sub chunks.
		//
		uiChunkCount = (fBufferDataView.getUint32(uiOffset, true) - 4) >> 2;
		if (uiFrameNum >= uiChunkCount) {
			return -1;
		}

		//
		// Get the offset of the sub chunk.
		//
		var uiSubOffset = fBufferDataView.getUint32(uiOffset + 4 * uiFrameNum, true);
		var uiNextOffset = fBufferDataView.getUint32(uiOffset + 4 * uiFrameNum + 4, true);

		//
		// Get the length of the sub chunk.
		//
		iChunkLen = uiNextOffset - uiSubOffset;
		if (iChunkLen > uiBufferSize) {
			return -2;
		}

		if (iChunkLen != 0) {
			for (var i = 0; i < iChunkLen; i++) {
				bufferDataView.setUint8(i, fBufferDataView.getUint8(uiOffset + uiSubOffset + i));
			}
		} else {
			return -1;
		}

		return iChunkLen;
	}

	_C.prototype.RNGBlitToCanvas = function(iNumRNG, iNumFrame, surface, fBuffer) {
		var ptr = 0;
		var dst_ptr = 0;
		var data = 0;
		var wdata = 0;
		var x, y, i, n;

		//
		// Check for invalid parameters.
		//
		if (surface == null || iNumRNG < 0 || iNumFrame < 0) {
			return -1;
		}

		var buf = new ArrayBuffer(65000);
		var bufDataView = new DataView(buf);

		//
		// Read the frame.
		//
		if (this.RNGReadFrame(bufDataView, 65000, iNumRNG, iNumFrame, fBuffer) < 0) {
			return -1;
		}

		//
		// Decompress the frame.
		//
		var rng = new ArrayBuffer(65000);
		var rngDataView = new DataView(rng);
		PAL_YJ1.Decompress(bufDataView, rngDataView, 65000);

		//
		// Draw the frame to the surface.
		//
		var stopLoop = false;
		while (true) {
			data = rngDataView.getUint8(ptr++);
			switch (data) {
				case 0x00:
				case 0x13:
					stopLoop = true;
					break;

				case 0x02:
					dst_ptr += 2;
					break;

				case 0x03:
					data = rngDataView.getUint8(ptr++);
					dst_ptr += (data + 1) * 2;
					break;

				case 0x04:
					wdata = rngDataView.getUint8(ptr) | (rngDataView.getUint8(ptr + 1) << 8);
					ptr += 2;
					dst_ptr += (wdata + 1) * 2;
					break;

				case 0x0a:
					x = dst_ptr % 320;
					y = Math.floor(dst_ptr / 320);
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					if (++x >= 320) {
						x = 0;
						++y;
					}
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					dst_ptr += 2;

				case 0x09:
					x = dst_ptr % 320;
					y = Math.floor(dst_ptr / 320);
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					if (++x >= 320) {
						x = 0;
						++y;
					}
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					dst_ptr += 2;

				case 0x08:
					x = dst_ptr % 320;
					y = Math.floor(dst_ptr / 320);
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					if (++x >= 320) {
						x = 0;
						++y;
					}
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					dst_ptr += 2;

				case 0x07:
					x = dst_ptr % 320;
					y = Math.floor(dst_ptr / 320);
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					if (++x >= 320) {
						x = 0;
						++y;
					}
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					dst_ptr += 2;

				case 0x06:
					x = dst_ptr % 320;
					y = Math.floor(dst_ptr / 320);
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					if (++x >= 320) {
						x = 0;
						++y;
					}
					surface.setPixal(x, y, rngDataView.getUint8(ptr++));
					dst_ptr += 2;
					break;

				case 0x0b:
					data = rngDataView.getUint8(ptr++);
					for (i = 0; i <= data; i++) {
						x = dst_ptr % 320;
						y = Math.floor(dst_ptr / 320);
						surface.setPixal(x, y, rngDataView.getUint8(ptr++));
						if (++x >= 320) {
							x = 0;
							++y;
						}
						surface.setPixal(x, y, rngDataView.getUint8(ptr++));
						dst_ptr += 2;
					}
					break;

				case 0x0c:
					wdata = rngDataView.getUint8(ptr) | (rngDataView.getUint8(ptr + 1) << 8);
					ptr += 2;
					for (i = 0; i <= wdata; i++) {
						x = dst_ptr % 320;
						y = Math.floor(dst_ptr / 320);
						surface.setPixal(x, y, rngDataView.getUint8(ptr++));
						if (++x >= 320) {
							x = 0;
							++y;
						}
						surface.setPixal(x, y, rngDataView.getUint8(ptr++));
						dst_ptr += 2;
					}
					break;

				case 0x0d:
				case 0x0e:
				case 0x0f:
				case 0x10:
					for (i = 0; i < data - (0x0d - 2); i++) {
						x = dst_ptr % 320;
						y = Math.floor(dst_ptr / 320);
						surface.setPixal(x, y, rngDataView.getUint8(ptr));
						if ((++x) >= 320) {
							x = 0;
							++y;
						}
						surface.setPixal(x, y, rngDataView.getUint8(ptr + 1));
						dst_ptr += 2;
					}
					ptr += 2;
					break;

				case 0x11:
					data = rngDataView.getUint8(ptr++);
					for (i = 0; i <= data; i++) {
						x = dst_ptr % 320;
						y = Math.floor(dst_ptr / 320);
						surface.setPixal(x, y, rngDataView.getUint8(ptr));
						if ((++x) >= 320) {
							x = 0;
							++y;
						}
						surface.setPixal(x, y, rngDataView.getUint8(ptr + 1));
						dst_ptr += 2;
					}
					ptr += 2;
					break;

				case 0x12:
					n = (rngDataView.getUint8(ptr) | (rngDataView.getUint8(ptr + 1) << 8)) + 1;
					ptr += 2;
					for (i = 0; i < n; i++) {
						x = dst_ptr % 320;
						y = Math.floor(dst_ptr / 320);
						surface.setPixal(x, y, rngDataView.getUint8(ptr));
						if ((++x) >= 320) {
							x = 0;
							++y;
						}
						surface.setPixal(x, y, rngDataView.getUint8(ptr + 1));
						dst_ptr += 2;
					}
					ptr += 2;
					break;
			}
			if (stopLoop) break;
		}

		return 0;
	}

	_C.prototype.RNGPlay = function(iNumRNG, iStartFrame, iEndFrame, iSpeed, callback) {
		var _ins = this;
		var iDelay = Math.floor(800 / (iSpeed == 0 ? 16 : iSpeed));

		var fBuffer = _ins.game.resource.buffers.RNG_BUFFER;

		var iTime = (new Date()).getTime();
		var waitCount = 0;
		var totalCount = 0;
		(function tick() {
			totalCount++;
			if ((new Date()).getTime() >= iTime) {
				iTime = (new Date()).getTime() + iDelay;
				if (_ins.RNGBlitToCanvas(iNumRNG, iStartFrame, _ins.game.canvas.screen, fBuffer) == -1) {
					callback();
					return;
				}

				//
				// Update the screen
				//
				_ins.game.canvas.flush();

				iStartFrame++;
			} else waitCount++;

			//
			// Fade in the screen if needed
			//
			if (_ins.game.globals.fNeedToFadeIn) {
				_ins.game.ui.fadeIn(_ins.game.globals.wNumPalette, _ins.game.globals.fNightPalette, 1, function() {
					_ins.game.globals.fNeedToFadeIn = FALSE;
					if (iStartFrame <= iEndFrame)
						PAL_Util.requestAnimationFrame(tick);
					else
						callback();
				});
			} else if (iStartFrame <= iEndFrame) {
				PAL_Util.requestAnimationFrame(tick);
			} else {
				callback();
			}
		})();
	}

	window.PAL_RngPlayer = _C;
})();