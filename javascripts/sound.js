(function() {
	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		var AudioContext = _ins.getAudioContext();
		_ins.context = new AudioContext();
		_ins.music = null;
		_ins.channel = [];
	}

	_C.prototype.getAudioContext = function() {
		if ( !! window.AudioContext) return window.AudioContext;
		if ( !! window.webkitAudioContext) return window.webkitAudioContext;
		if ( !! window.mozAudioContext) return window.mozAudioContext;
		if ( !! window.msAudioContext) return window.msAudioContext;
		if ( !! window.oAudioContext) return window.oAudioContext;
	}

	_C.prototype.playMusic = function(musicId, loop, fadeTime) {
		var _ins = this;
		var musicId = "" + musicId;
		while (musicId.length < 3)
			musicId = "0" + musicId;
		var musicBufferName = "MUSIC_" + musicId + "_BUFFER";
		var musicBuffer = _ins.game.resource.buffers[musicBufferName];
		if ( !! musicBuffer) {
			var startMusic = function() {
				_ins.context.decodeAudioData(musicBuffer, function(audioBuffer) {
					var music = {};
					music.sourceNode = _ins.context.createBufferSource();
					music.sourceNode.buffer = audioBuffer;
					music.gainNode = _ins.context.createGain();
					music.sourceNode.connect(music.gainNode);
					music.gainNode.connect(_ins.context.destination);
					if ( !! loop) music.sourceNode.loop = true;
					music.sourceNode.start(0);
				}, function() {
					alert("音频解析错误");
				})
			}
			startMusic();
		} else {

		}
	}
	window.PAL_Sound = _C;
})();