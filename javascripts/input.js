(function() {

	var PALK_LEFT = 37;
	var PALK_UP = 38;
	var PALK_RIGHT = 39;
	var PALK_DOWN = 40;

	var PALK_KP0 = 96;
	var PALK_KP1 = 97;
	var PALK_KP2 = 98;
	var PALK_KP3 = 99;
	var PALK_KP4 = 100;
	var PALK_KP5 = 101;
	var PALK_KP6 = 102;
	var PALK_KP7 = 103;
	var PALK_KP8 = 104;
	var PALK_KP9 = 105;
	var PALK_KP_ENTER = 108;

	var PALK_ESCAPE = 27;
	var PALK_INSERT = 45;
	var PALK_LALT = 18;
	var PALK_RALT = 18;
	var PALK_RETURN = 13;
	var PALK_SPACE = 32;
	var PALK_LCTRL = 17;
	var PALK_RCTRL = 17;
	var PALK_PAGEUP = 33;
	var PALK_PAGEDOWN = 34;

	var PALK_w = 87;
	var PALK_s = 83;
	var PALK_a = 65;
	var PALK_d = 68;
	var PALK_f = 70;
	var PALK_q = 81;
	var PALK_e = 69;
	var PALK_r = 82;

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		_ins.keyPress = 0x0;
		_ins.dir = PAL_Input.kDirUnknown;
		_ins.prevdir = PAL_Input.kDirUnknown;
	}

	_C.kKeyMenu = (1 << 0);
	_C.kKeySearch = (1 << 1);
	_C.kKeyDown = (1 << 2);
	_C.kKeyLeft = (1 << 3);
	_C.kKeyUp = (1 << 4);
	_C.kKeyRight = (1 << 5);
	_C.kKeyPgUp = (1 << 6);
	_C.kKeyPgDn = (1 << 7);
	_C.kKeyRepeat = (1 << 8);
	_C.kKeyAuto = (1 << 9);
	_C.kKeyDefend = (1 << 10);
	_C.kKeyUseItem = (1 << 11);
	_C.kKeyThrowItem = (1 << 12);
	_C.kKeyFlee = (1 << 13);
	_C.kKeyStatus = (1 << 14);
	_C.kKeyForce = (1 << 15);

	_C.kDirUnknown = 0;
	_C.kDirNorth = (1 << 0);
	_C.kDirEast = (1 << 1);
	_C.kDirSouth = (1 << 2);
	_C.kDirWest = (1 << 3);

	_C.prototype.keyDownHandler = function(e) {
		var _ins = this;
		switch (e.keyCode) {

			case PALK_UP:
			case PALK_KP8:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL_Input.kDirUnknown : _ins.dir);
				_ins.dir = PAL_Input.kDirNorth;
				_ins.keyPress |= PAL_Input.kKeyUp;
				break;

			case PALK_DOWN:
			case PALK_KP2:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL_Input.kDirUnknown : _ins.dir);
				_ins.dir = PAL_Input.kDirSouth;
				_ins.keyPress |= PAL_Input.kKeyDown;
				break;

			case PALK_LEFT:
			case PALK_KP4:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL_Input.kDirUnknown : _ins.dir);
				_ins.dir = PAL_Input.kDirWest;
				_ins.keyPress |= PAL_Input.kKeyLeft;
				break;

			case PALK_RIGHT:
			case PALK_KP6:
				_ins.prevdir = (_ins.game.globals.inBattle ? PAL_Input.kDirUnknown : _ins.dir);
				_ins.dir = PAL_Input.kDirEast;
				_ins.keyPress |= PAL_Input.kKeyRight;
				break;

			case PALK_ESCAPE:
			case PALK_INSERT:
			case PALK_LALT:
			case PALK_RALT:
			case PALK_KP0:
				_ins.keyPress |= PAL_Input.kKeyMenu;
				break;

			case PALK_RETURN:
			case PALK_SPACE:
			case PALK_KP_ENTER:
			case PALK_LCTRL:
				_ins.keyPress |= PAL_Input.kKeySearch;
				break;

			case PALK_PAGEUP:
			case PALK_KP9:
				_ins.keyPress |= PAL_Input.kKeyPgUp;
				break;

			case PALK_PAGEDOWN:
			case PALK_KP3:
				_ins.keyPress |= PAL_Input.kKeyPgDn;
				break;

			case PALK_r:
				_ins.keyPress |= PAL_Input.kKeyRepeat;
				break;

			case PALK_a:
				_ins.keyPress |= PAL_Input.kKeyAuto;
				break;

			case PALK_d:
				_ins.keyPress |= PAL_Input.kKeyDefend;
				break;

			case PALK_e:
				_ins.keyPress |= PAL_Input.kKeyUseItem;
				break;

			case PALK_w:
				_ins.keyPress |= PAL_Input.kKeyThrowItem;
				break;

			case PALK_q:
				_ins.keyPress |= PAL_Input.kKeyFlee;
				break;

			case PALK_s:
				_ins.keyPress |= PAL_Input.kKeyStatus;
				break;

			case PALK_f:
				_ins.keyPress |= PAL_Input.kKeyForce;
				break;
		}
	}

	_C.prototype.keyUpHandler = function(e) {
		var _ins = this;
		switch (e.keyCode) {
			case PALK_UP:
			case PALK_KP8:
				if (_ins.dir == PAL_Input.kDirNorth) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL_Input.kDirUnknown;
				break;

			case PALK_DOWN:
			case PALK_KP2:
				if (_ins.dir == PAL_Input.kDirSouth) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL_Input.kDirUnknown;
				break;

			case PALK_LEFT:
			case PALK_KP4:
				if (_ins.dir == PAL_Input.kDirWest) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL_Input.kDirUnknown;
				break;

			case PALK_RIGHT:
			case PALK_KP6:
				if (_ins.dir == PAL_Input.kDirEast) {
					_ins.dir = _ins.prevdir;
				}
				_ins.prevdir = PAL_Input.kDirUnknown;
				break;
		}
	}

	_C.prototype.clearKeyState = function() {
		var _ins = this;
		_ins.keyPress = 0x0;
	}

	window.PAL_Input = _C;
})();