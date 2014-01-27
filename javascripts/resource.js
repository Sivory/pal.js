(function() {
	var TOTAL_LENGTH = 24067722;

	var _C = function() {
		var _ins = this;
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
			source: './resources/mus.mkf',
			buffer_name: 'MUS_BUFFER'
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
			source: './resources/word.dat',
			buffer_name: 'WORD_BUFFER'
		}];
		_ins.buffers = {};
	}

	_C.prototype.load = function(tick, finish, error) {
		var _ins = this;
		var _tick = function(e) {
			e.target.PAL_fileData.total = e.total;
			e.target.PAL_fileData.loaded = e.loaded;
			e.target.PAL_fileData.status = 'loading';
			var totalSum = TOTAL_LENGTH;
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

	window.PAL_Resource = _C;
})();