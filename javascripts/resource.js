(function() {

	var RESOURCES = DEFINE_STRUCT({
		bLoadFlags: "BYTE",
		lpMap: "POINTER", // current loaded map
		lppEventObjectSprites: "POINTER", // event object sprites
		nEventObject: "INT", // number of event objects
		rglpPlayerSprite: ["POINTER", PAL.MAX_PLAYERS_IN_PARTY + 1], // player sprites
	});

	var OBJECTDESC = DEFINE_STRUCT({
		wObjectID: "WORD",
		lpDesc: "POINTER",
		next: "POINTER"
	});

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		_ins.files = [{
			source: './resources/abc.mkf',
			buffer_name: 'ABC_BUFFER'
		}, {
			source: './resources/ball.mkf',
			buffer_name: 'BALL_BUFFER'
		}, {
			source: './resources/data.mkf',
			buffer_name: 'DATA_BUFFER'
		}, {
			source: './resources/f.mkf',
			buffer_name: 'F_BUFFER'
		}, {
			source: './resources/fbp.mkf',
			buffer_name: 'FBP_BUFFER'
		}, {
			source: './resources/fire.mkf',
			buffer_name: 'FIRE_BUFFER'
		}, {
			source: './resources/gop.mkf',
			buffer_name: 'GOP_BUFFER'
		}, {
			source: './resources/m.msg',
			buffer_name: 'MSG_BUFFER'
		}, {
			source: './resources/map.mkf',
			buffer_name: 'MAP_BUFFER'
		}, {
			source: './resources/mgo.mkf',
			buffer_name: 'MGO_BUFFER'
		}, {
			source: './resources/pat.mkf',
			buffer_name: 'PAT_BUFFER'
		}, {
			source: './resources/rgm.mkf',
			buffer_name: 'RGM_BUFFER'
		}, {
			source: './resources/rng.mkf',
			buffer_name: 'RNG_BUFFER'
		}, {
			source: './resources/sss.mkf',
			buffer_name: 'SSS_BUFFER'
		}, {
			source: './resources/voc.mkf',
			buffer_name: 'VOICE_BUFFER'
		}, {
			source: './resources/desc.dat',
			buffer_name: 'DESC_BUFFER'
		}, {
			source: './resources/word.dat',
			buffer_name: 'WORD_BUFFER'
		}, {
			source: './resources/wor16.asc',
			buffer_name: 'ASCII_BUFFER'
		}, {
			source: './resources/wor16.fon',
			buffer_name: 'FONT_BUFFER'
		}];
		for (var i = 1; i <= 87; i++) {
			if (i == 29) continue;
			var fileName = "" + i;
			while (fileName.length < 3) fileName = "0" + fileName;
			_ins.files.push({
				source: './resources/musics/' + fileName + '.mp3',
				buffer_name: 'MUSIC_' + fileName + '_BUFFER'
			});
		}
		_ins.buffers = {};
	}

	_C.prototype = new RESOURCES();

	_C.prototype.loadFiles = function(tick, finish, error) {
		var _ins = this;
		var _tick = function(e) {
			e.target.PAL_fileData.total = e.total;
			e.target.PAL_fileData.loaded = e.loaded;
			e.target.PAL_fileData.status = 'loading';
			var totalSum = PAL.FILES_TOTAL_LENGTH;
			var loadedSum = 0;
			for (var i = 0; i < _ins.files.length; i++) {
				loadedSum += _ins.files[i].loaded;
			}
			var percent = loadedSum / totalSum;
			if (typeof tick == 'function')
				tick({
					percent: percent
				});
		}
		var _finish = function(e) {
			if (e.target.status != 200) {
				_error(e);
				return;
			}
			e.target.PAL_fileData.status = 'loaded';
			e.target.PAL_fileData.loaded = e.target.PAL_fileData.total;
			_ins.buffers[e.target.PAL_fileData.buffer_name] = e.target.response;
			var allLoaded = true;
			for (var i = 0; i < _ins.files.length; i++) {
				if (_ins.files[i].status != 'loaded') {
					allLoaded = false;
					break;
				}
			}
			if (allLoaded) {
				if (typeof finish == 'function')
					finish(e);
			}
		}
		var _error = function(e) {
			for (var i = 0; i < _ins.files.length; i++) {
				_ins.files[i].xhr.abort();
			}
			error(e);
		}
		for (var i = 0; i < _ins.files.length; i++) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', _ins.files[i].source);
			xhr.responseType = "arraybuffer";
			xhr.PAL_fileData = _ins.files[i];
			xhr.PAL_fileData.status = 'unload';
			xhr.PAL_fileData.loaded = 0;
			xhr.PAL_fileData.total = 0;
			xhr.PAL_fileData.xhr = xhr;
			xhr.addEventListener('load', _finish);
			xhr.addEventListener("progress", _tick);
			xhr.addEventListener("error", _error);
			xhr.send();
		}
	}

	_C.prototype.setLoadFlags = function(bFlags) {
		var _ins = this;
		_ins.bLoadFlags |= bFlags;
	}

	_C.prototype.loadResources = function() {
		var _ins = this;

		var fpMAP = _ins.buffers.MAP_BUFFER;
		var fpGOP = _ins.buffers.GOP_BUFFER;
		var fpMGO = _ins.buffers.MGO_BUFFER;

		//
		// Load scene
		//
		if (_ins.bLoadFlags & PAL.kLoadScene) {
			if (_ins.game.globals.fEnteringScene) {
				_ins.game.globals.wScreenWave = 0;
				_ins.game.globals.sWaveProgression = 0;
			}

			//
			// Load map
			//
			var i = _ins.game.globals.wNumScene - 1;
			_ins.lpMap = new PAL_Map(_ins.game.globals.g.rgScene[i].wMapNum, fpMAP, fpGOP);

			if (_ins.lpMap == null) {
				throw "error";
			}

			//
			// Load sprites
			//
			var index = _ins.game.globals.g.rgScene[i].wEventObjectIndex;
			_ins.nEventObject = _ins.game.globals.g.rgScene[i + 1].wEventObjectIndex;
			_ins.nEventObject -= index;

			if (_ins.nEventObject > 0) {
				_ins.lppEventObjectSprites = [];
				for (var i = 0; i < _ins.nEventObject; i++) {
					_ins.lppEventObjectSprites.push(null);
				}
			}

			for (var i = 0; i < _ins.nEventObject; i++, index++) {
				var n = _ins.game.globals.g.lprgEventObject[index].wSpriteNum;
				if (n == 0) {
					//
					// this event object has no sprite
					//
					_ins.lppEventObjectSprites[i] = null;
					continue;
				}

				var l = PAL_Util.MKFGetDecompressedSize(n, fpMGO);

				_ins.lppEventObjectSprites[i] = new PAL_Sprite(l);

				if (_ins.lppEventObjectSprites[i].loadFromChunk(n, fpMGO, true) > 0) {
					_ins.game.globals.g.lprgEventObject[index].nSpriteFramesAuto =
						_ins.lppEventObjectSprites[i].frameNumber;
				}
			}

			_ins.game.globals.partyoffset = {
				x: 160,
				y: 112
			};
		}

		//
		// Load player sprites
		//
		if (_ins.bLoadFlags & PAL.kLoadPlayerSprite) {
			for (var i = 0; i <= _ins.game.globals.wMaxPartyMemberIndex; i++) {
				var wPlayerID = _ins.game.globals.rgParty[i].wPlayerRole;

				//
				// Load player sprite
				//
				var wSpriteNum = _ins.game.globals.g.PlayerRoles.rgwSpriteNum[wPlayerID];

				var l = PAL_Util.MKFGetDecompressedSize(wSpriteNum, fpMGO);

				_ins.rglpPlayerSprite[i] = new PAL_Sprite(l);
				_ins.rglpPlayerSprite[i].loadFromChunk(wSpriteNum, fpMGO, true);
			}

			if (_ins.game.globals.nFollower > 0) {
				//
				// Load the follower sprite
				//
				var wSpriteNum = _ins.game.globals.rgParty[i].wPlayerRole;

				var l = PAL_MKFGetDecompressedSize(wSpriteNum, _ins.game.globals.f.fpMGO);

				_ins.rglpPlayerSprite[i] = new PAL_Sprite(l);
				_ins.rglpPlayerSprite[i].loadFromChunk(wSpriteNum, fpMGO, true);
			}
		}

		//
		// Clear all of the load flags
		//
		_ins.bLoadFlags = 0;
	}

	_C.prototype.loadObjectDesc = function(fBuffer) {
		var _ins = this;

		var lpDesc = null,
			pNew = null;

		var data = new DataView(new ArrayBuffer(512));
		//
		// Load the description data
		//
		while (PAL_Util.fgets(data, fBuffer) != null) {
			var p = PAL_Util.strchr(data, '=');
			if (p == -1) {
				continue;
			}

			data.setUint8(p, 0);
			p++;

			var pNew = new OBJECTDESC();

			var i = PAL_Util.getHex(data);
			pNew.wObjectID = i;
			pNew.lpDesc = PAL_Util.strdup(data, p);
			pNew.next = lpDesc;
			lpDesc = pNew;
		}

		return lpDesc;
	}

	window.PAL_Resource = _C;
})();