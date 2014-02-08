(function() {

	var PALMAP = DEFINE_STRUCT({
		Tiles: [
			[
				["DWORD", 2], 64
			], 128
		],
		pTileSprite: "POINTER",
		iMapNum: "INT",
	});

	var _C = function(iMapNum, fpMapMKF, fpGopMKF) {
		var _ins = this;

		//
		// Check for invalid map number.
		//
		if (iMapNum >= PAL_Util.MKFGetChunkCount(fpMapMKF) ||
			iMapNum >= PAL_Util.MKFGetChunkCount(fpGopMKF) ||
			iMapNum <= 0) {
			throw "error";
		}

		//
		// Load the map tile data.
		//
		var size = PAL_Util.MKFGetChunkSize(iMapNum, fpMapMKF);

		//
		// Allocate a temporary buffer for the compressed data.
		//
		var data = new DataView(new ArrayBuffer(size));

		//
		// Create the map instance.
		//
		var map = new PALMAP();

		//
		// Read the map data.
		//
		if (PAL_Util.MKFReadChunk(data, size, iMapNum, fpMapMKF) < 0) {
			throw "error";
		}

		//
		// Decompress the tile data.
		//
		if (PAL_YJ1.Decompress(data, map.Tiles.data, map.Tiles.size) < 0) {
			throw "error";
		}

		//
		// Load the tile bitmaps.
		//
		var size = PAL_Util.MKFGetChunkSize(iMapNum, fpGopMKF);
		if (size <= 0) {
			throw "error";
		}
		map.pTileSprite = new PAL_Sprite(size);
		map.pTileSprite.loadFromChunk(iMapNum, fpGopMKF, false);

		//
		// Done.
		//
		map.iMapNum = iMapNum;

		_ins.map = map;
	}

	_C.prototype.getTileBitmap = function(x, y, h, ucLayer) {
		var _ins = this;

		//
		// Check for invalid parameters.
		//
		if (x >= 64 || y >= 128 || h > 1) {
			return null;
		}

		//
		// Get the tile data of the specified location.
		//
		var d = _ins.map.Tiles[y][x].getUint32(h * 4, true);


		if (ucLayer == 0) {
			//
			// Bottom layer
			//
			return _ins.map.pTileSprite.getFrame((d & 0xFF) | ((d >> 4) & 0x100));
		} else {
			//
			// Top layer
			//
			d >>= 16;
			return _ins.map.pTileSprite.getFrame(((d & 0xFF) | ((d >> 4) & 0x100)) - 1);
		}
	}

	_C.prototype.tileIsBlocked = function(x, y, h) {
		var _ins = this;
		//
		// Check for invalid parameters.
		//
		if (x >= 64 || y >= 128 || h > 1) {
			return true;
		}

		return (_ins.map.Tiles[y][x][h] & 0x2000) >> 13;
	}

	_C.prototype.getTileHeight = function(x, y, h, ucLayer) {
		var _ins = this;
		//
		// Check for invalid parameters.
		//
		if (y >= 128 || x >= 64 || h > 1) {
			return 0;
		}

		var d = _ins.map.Tiles[y][x][h];

		if (ucLayer) {
			d >>= 16;
		}

		d >>= 8;
		return d & 0xf;
	}

	_C.prototype.blitTo = function(lpSurface, lpSrcRect, ucLayer) {
		var _ins = this;
		//
		// Convert the coordinate
		//
		var sy = Math.floor(lpSrcRect.y / 16) - 1;
		var dy = Math.floor((lpSrcRect.y + lpSrcRect.h) / 16) + 2;
		var sx = Math.floor(lpSrcRect.x / 32) - 1;
		var dx = Math.floor((lpSrcRect.x + lpSrcRect.w) / 32) + 2;

		//
		// Do the drawing.
		//
		var yPos = sy * 16 - 8 - lpSrcRect.y;
		for (var y = sy; y < dy; y++) {
			for (var h = 0; h < 2; h++, yPos += 8) {
				var xPos = sx * 32 + h * 16 - 16 - lpSrcRect.x;
				for (var x = sx; x < dx; x++, xPos += 32) {
					var lpBitmap = _ins.getTileBitmap(x, y, h, ucLayer);
					if (lpBitmap == null) {
						if (ucLayer) {
							continue;
						}
						lpBitmap = _ins.getTileBitmap(0, 0, 0, ucLayer);
					}
					lpBitmap.blitTo(lpSurface, {
						x: xPos,
						y: yPos
					});
				}
			}
		}
	}
	window.PAL_Map = _C;
})();