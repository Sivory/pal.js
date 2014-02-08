// 定义了一些全局定量

(function() {
	var _C = function() {}

	// ----------显示终端定量----------
	_C.DRAW_WIDTH = 320;
	_C.DRAW_HEIGHT = 200;
	_C.DRAW_PIXAL_WIDTH = 1;
	_C.DRAW_PIXAL_HEIGHT = 1;
	_C.REAL_WIDTH = 640;
	_C.REAL_HEIGHT = 400;

	// ----------动画定量----------
	_C.BITMAPNUM_SPLASH_UP = 0x26;
	_C.BITMAPNUM_SPLASH_DOWN = 0x27;
	_C.SPRITENUM_SPLASH_TITLE = 0x47;
	_C.SPRITENUM_SPLASH_CRANE = 0x49;
	_C.NUM_RIX_TITLE = 0x5;

	// ----------主循环帧率----------
	_C.FPS = 10;
	_C.FRAME_TIME = Math.floor(1000 / _C.FPS);

	// ----------Global定量----------
	// maximum number of players in party
	_C.MAX_PLAYERS_IN_PARTY = 3;

	// total number of possible player roles
	_C.MAX_PLAYER_ROLES = 6;

	// totally number of playable player roles
	_C.MAX_PLAYABLE_PLAYER_ROLES = 5;

	// maximum entries of inventory
	_C.MAX_INVENTORY = 256;

	// maximum items in a store
	_C.MAX_STORE_ITEM = 9;

	// total number of magic attributes
	_C.NUM_MAGIC_ELEMENTAL = 5;

	// maximum number of enemies in a team
	_C.MAX_ENEMIES_IN_TEAM = 5;

	// maximum number of equipments for a player
	_C.MAX_PLAYER_EQUIPMENTS = 6;

	// maximum number of magics for a player
	_C.MAX_PLAYER_MAGICS = 32;

	// maximum number of scenes
	_C.MAX_SCENES = 300;

	// maximum number of objects
	_C.MAX_OBJECTS = 600;

	// maximum number of event objects (should be somewhat more than the original,
	// as there are some modified versions which has more)
	_C.MAX_EVENT_OBJECTS = 5500;

	// maximum number of effective poisons to players
	_C.MAX_POISONS = 16;

	// maximum number of level
	_C.MAX_LEVELS = 99;

	// status of characters
	_C.kStatusConfused = 0, // attack friends randomly
	_C.kStatusParalyzed = 1, // paralyzed
	_C.kStatusSleep = 2, // not allowed to move
	_C.kStatusSilence = 3, // cannot use magic
	_C.kStatusPuppet = 4, // for dead players only, continue attacking
	_C.kStatusBravery = 5, // more power for physical attacks
	_C.kStatusProtect = 6, // more defense value
	_C.kStatusHaste = 7, // faster
	_C.kStatusDualAttack = 8, // dual attack
	_C.kStatusAll = 9;

	// body parts of equipments
	_C.kBodyPartHead = 0,
	_C.kBodyPartBody = 1,
	_C.kBodyPartShoulder = 2,
	_C.kBodyPartHand = 3,
	_C.kBodyPartFeet = 4,
	_C.kBodyPartWear = 5,
	_C.kBodyPartExtra = 6;

	// state of event object, used by the sState field of the EVENTOBJECT struct
	_C.kObjStateHidden = 0,
	_C.kObjStateNormal = 1,
	_C.kObjStateBlocker = 2;

	_C.kTriggerNone = 0,
	_C.kTriggerSearchNear = 1,
	_C.kTriggerSearchNormal = 2,
	_C.kTriggerSearchFar = 3,
	_C.kTriggerTouchNear = 4,
	_C.kTriggerTouchNormal = 5,
	_C.kTriggerTouchFar = 6,
	_C.kTriggerTouchFarther = 7,
	_C.kTriggerTouchFarthest = 8;

	_C.kItemFlagUsable = (1 << 0),
	_C.kItemFlagEquipable = (1 << 1),
	_C.kItemFlagThrowable = (1 << 2),
	_C.kItemFlagConsuming = (1 << 3),
	_C.kItemFlagApplyToAll = (1 << 4),
	_C.kItemFlagSellable = (1 << 5),
	_C.kItemFlagEquipableByPlayerRole_First = (1 << 6);

	_C.kMagicFlagUsableOutsideBattle = (1 << 0),
	_C.kMagicFlagUsableInBattle = (1 << 1),
	_C.kMagicFlagUsableToEnemy = (1 << 3),
	_C.kMagicFlagApplyToAll = (1 << 4);

	_C.kMagicTypeNormal = 0,
	_C.kMagicTypeAttackAll = 1, // draw the effect on each of the enemies
	_C.kMagicTypeAttackWhole = 2, // draw the effect on the whole enemy team
	_C.kMagicTypeAttackField = 3, // draw the effect on the battle field
	_C.kMagicTypeApplyToPlayer = 4, // the magic is used on one player
	_C.kMagicTypeApplyToParty = 5, // the magic is used on the whole party
	_C.kMagicTypeTrance = 8, // trance the player
	_C.kMagicTypeSummon = 9; // summon

	// ----------键盘事件定量----------
	_C.PALK_LEFT = 37;
	_C.PALK_UP = 38;
	_C.PALK_RIGHT = 39;
	_C.PALK_DOWN = 40;

	_C.PALK_KP0 = 96;
	_C.PALK_KP1 = 97;
	_C.PALK_KP2 = 98;
	_C.PALK_KP3 = 99;
	_C.PALK_KP4 = 100;
	_C.PALK_KP5 = 101;
	_C.PALK_KP6 = 102;
	_C.PALK_KP7 = 103;
	_C.PALK_KP8 = 104;
	_C.PALK_KP9 = 105;
	_C.PALK_KP_ENTER = 108;

	_C.PALK_ESCAPE = 27;
	_C.PALK_INSERT = 45;
	_C.PALK_LALT = 18;
	_C.PALK_RALT = 18;
	_C.PALK_RETURN = 13;
	_C.PALK_SPACE = 32;
	_C.PALK_LCTRL = 17;
	_C.PALK_RCTRL = 17;
	_C.PALK_PAGEUP = 33;
	_C.PALK_PAGEDOWN = 34;

	_C.PALK_w = 87;
	_C.PALK_s = 83;
	_C.PALK_a = 65;
	_C.PALK_d = 68;
	_C.PALK_f = 70;
	_C.PALK_q = 81;
	_C.PALK_e = 69;
	_C.PALK_r = 82;

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
	_C.kDirNorth = 1;
	_C.kDirEast = 2;
	_C.kDirSouth = 3;
	_C.kDirWest = 4;

	// ----------资源文件总大小----------
	_C.FILES_TOTAL_LENGTH = 42315000;

	// ----------界面渲染定量----------
	_C.CHUNKNUM_SPRITEUI = 9;

	_C.MAINMENU_BACKGROUND_FBPNUM = 60;
	_C.RIX_NUM_OPENINGMENU = 4;
	_C.MAINMENU_LABEL_NEWGAME = 7;
	_C.MAINMENU_LABEL_LOADGAME = 8;

	_C.LOADMENU_LABEL_SLOT_FIRST = 43;

	_C.MENUITEM_COLOR = 0x4F;
	_C.MENUITEM_COLOR_INACTIVE = 0x1C;
	_C.MENUITEM_COLOR_CONFIRMED = 0x2C;
	_C.MENUITEM_COLOR_SELECTED_INACTIVE = 0x1F;
	_C.MENUITEM_COLOR_SELECTED_FIRST = 0xF9;
	_C.MENUITEM_COLOR_SELECTED_TOTALNUM = 6;
	_C.__defineGetter__('MENUITEM_COLOR_SELECTED', function() {
		var e = Math.floor(Date.now() / 100);
		return _C.MENUITEM_COLOR_SELECTED_FIRST + e % _C.MENUITEM_COLOR_SELECTED_TOTALNUM;
	});

	_C.MENUITEM_VALUE_CANCELLED = 0xFFFF;

	// ----------文字渲染定量----------
	_C.kNumColorYellow = 1;
	_C.kNumColorBlue = 2;
	_C.kNumColorCyan = 3;

	_C.kNumAlignLeft = 1;
	_C.kNumAlignMid = 2;
	_C.kNumAlignRight = 3;

	_C.WORD_LENGTH = 10;
	_C.FONT_COLOR_DEFAULT = 0x4F;
	_C.FONT_COLOR_YELLOW = 0x2D;
	_C.FONT_COLOR_RED = 0x1A;
	_C.FONT_COLOR_CYAN = 0x8D;
	_C.FONT_COLOR_CYAN_ALT = 0x8C;

	_C.kDialogUpper = 0;
	_C.kDialogCenter = 1;
	_C.kDialogLower = 2;
	_C.kDialogCenterWindow = 3;

	_C.PAL_ADDITIONAL_WORD_FIRST = 10000;

	// ----------资源管理器定量----------
	_C.kLoadScene = (1 << 0); // load a scene
	_C.kLoadPlayerSprite = (1 << 1); // load player sprites

	window.PAL = _C;
})();