(function() {

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		_ins.keyPress = 0x0;
		_ins.dir = PAL.kDirUnknown;
		_ins.prevdir = PAL.kDirUnknown;
		_ins.keyFlag = [];
	}

	_C.prototype.keyDownHandler = function(e) {
		var _ins = this;

		// 屏蔽掉键盘按住不动所产生的多余事件
		if (_ins.keyFlag[e.keyCode]) return;
		_ins.keyFlag[e.keyCode] = true;
		
		switch (e.keyCode) {

			case PAL.PALK_UP:
			case PAL.PALK_KP8:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL.kDirUnknown : _ins.dir);
				_ins.dir = PAL.kDirNorth;
				_ins.keyPress |= PAL.kKeyUp;
				break;

			case PAL.PALK_DOWN:
			case PAL.PALK_KP2:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL.kDirUnknown : _ins.dir);
				_ins.dir = PAL.kDirSouth;
				_ins.keyPress |= PAL.kKeyDown;
				break;

			case PAL.PALK_LEFT:
			case PAL.PALK_KP4:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL.kDirUnknown : _ins.dir);
				_ins.dir = PAL.kDirWest;
				_ins.keyPress |= PAL.kKeyLeft;
				break;

			case PAL.PALK_RIGHT:
			case PAL.PALK_KP6:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL.kDirUnknown : _ins.dir);
				_ins.dir = PAL.kDirEast;
				_ins.keyPress |= PAL.kKeyRight;
				break;

			case PAL.PALK_ESCAPE:
			case PAL.PALK_INSERT:
			// case PAL.PALK_LALT:
			// case PAL.PALK_RALT:
			case PAL.PALK_KP0:
				_ins.keyPress |= PAL.kKeyMenu;
				break;

			case PAL.PALK_RETURN:
			case PAL.PALK_SPACE:
			case PAL.PALK_KP_ENTER:
			// case PAL.PALK_LCTRL:
				_ins.keyPress |= PAL.kKeySearch;
				break;

			case PAL.PALK_PAGEUP:
			case PAL.PALK_KP9:
				_ins.keyPress |= PAL.kKeyPgUp;
				break;

			case PAL.PALK_PAGEDOWN:
			case PAL.PALK_KP3:
				_ins.keyPress |= PAL.kKeyPgDn;
				break;

			case PAL.PALK_r:
				_ins.keyPress |= PAL.kKeyRepeat;
				break;

			case PAL.PALK_a:
				_ins.keyPress |= PAL.kKeyAuto;
				break;

			case PAL.PALK_d:
				_ins.keyPress |= PAL.kKeyDefend;
				break;

			case PAL.PALK_e:
				_ins.keyPress |= PAL.kKeyUseItem;
				break;

			case PAL.PALK_w:
				_ins.keyPress |= PAL.kKeyThrowItem;
				break;

			case PAL.PALK_q:
				_ins.keyPress |= PAL.kKeyFlee;
				break;

			case PAL.PALK_s:
				_ins.keyPress |= PAL.kKeyStatus;
				break;

			case PAL.PALK_f:
				_ins.keyPress |= PAL.kKeyForce;
				break;
		}
	}

	_C.prototype.keyUpHandler = function(e) {
		var _ins = this;
		_ins.keyFlag[e.keyCode] = false;
		switch (e.keyCode) {
			case PAL.PALK_UP:
			case PAL.PALK_KP8:
				if (_ins.dir == PAL.kDirNorth) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL.kDirUnknown;
				break;

			case PAL.PALK_DOWN:
			case PAL.PALK_KP2:
				if (_ins.dir == PAL.kDirSouth) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL.kDirUnknown;
				break;

			case PAL.PALK_LEFT:
			case PAL.PALK_KP4:
				if (_ins.dir == PAL.kDirWest) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL.kDirUnknown;
				break;

			case PAL.PALK_RIGHT:
			case PAL.PALK_KP6:
				if (_ins.dir == PAL.kDirEast) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL.kDirUnknown;
				break;
		}
	}

	_C.prototype.clearKeyState = function() {
		var _ins = this;
		_ins.keyPress = 0x0;
	}

	window.PAL_Input = _C;
})();