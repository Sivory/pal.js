(function() {

	var LOAD_DATA = function(data, size, chunknum, fp) {
		if (data == null || size == null || chunknum == null || fp == null) throw "error";
		PAL_Util.MKFReadChunk(data, size, chunknum, fp);
	}

	var EVENTOBJECT = DEFINE_STRUCT({
		sVanishTime: "SHORT", // vanish time (?)
		x: "WORD", // X coordinate on the map
		y: "WORD", // Y coordinate on the map
		sLayer: "SHORT", // layer value
		wTriggerScript: "WORD", // Trigger script entry
		wAutoScript: "WORD", // Auto script entry
		sState: "SHORT", // state of this object
		wTriggerMode: "WORD", // trigger mode
		wSpriteNum: "WORD", // number of the sprite
		nSpriteFrames: "USHORT", // total number of frames of the sprite
		wDirection: "WORD", // direction
		wCurrentFrameNum: "WORD", // current frame number
		nScriptIdleFrame: "USHORT", // count of idle frames, used by trigger script
		wSpritePtrOffset: "WORD", // FIXME: ???
		nSpriteFramesAuto: "USHORT", // total number of frames of the sprite, used by auto script
		wScriptIdleFrameCountAuto: "WORD", // count of idle frames, used by auto script
	});

	var SCENE = DEFINE_STRUCT({
		wMapNum: "WORD", // number of the map
		wScriptOnEnter: "WORD", // when entering this scene, execute script from here
		wScriptOnTeleport: "WORD", // when teleporting out of this scene, execute script from here
		wEventObjectIndex: "WORD", // event objects in this scene begins from number wEventObjectIndex + 1
	});

	// object including system strings, players, items, magics, enemies and poison scripts.

	// system strings and players
	var OBJECT_PLAYER = DEFINE_STRUCT({
		wReserved: ["WORD", 2], // always zero
		wScriptOnFriendDeath: "WORD", // when friends in party dies, execute script from here
		wScriptOnDying: "WORD", // when dying, execute script from here
	});

	// items
	var OBJECT_ITEM = DEFINE_STRUCT({
		wBitmap: "WORD", // bitmap number in BALL.MKF
		wPrice: "WORD", // price
		wScriptOnUse: "WORD", // script executed when using this item
		wScriptOnEquip: "WORD", // script executed when equipping this item
		wScriptOnThrow: "WORD", // script executed when throwing this item to enemy
		wFlags: "WORD", // flags
	});

	// magics
	var OBJECT_MAGIC = DEFINE_STRUCT({
		wMagicNumber: "WORD", // magic number, according to DATA.MKF #3
		wReserved1: "WORD", // always zero
		wScriptOnSuccess: "WORD", // when magic succeed, execute script from here
		wScriptOnUse: "WORD", // when use this magic, execute script from here
		wReserved2: "WORD", // always zero
		wFlags: "WORD", // flags
	});

	// enemies
	var OBJECT_ENEMY = DEFINE_STRUCT({
		wEnemyID: "WORD", // ID of the enemy, according to DATA.MKF #1.
		// Also indicates the bitmap number in ABC.MKF.
		wResistanceToSorcery: "WORD", // resistance to sorcery and poison (0 min, 10 max)
		wScriptOnTurnStart: "WORD", // script executed when turn starts
		wScriptOnBattleEnd: "WORD", // script executed when battle ends
		wScriptOnReady: "WORD", // script executed when the enemy is ready
	});

	// poisons (scripts executed in each round)
	var OBJECT_POISON = DEFINE_STRUCT({
		wPoisonLevel: "WORD", // level of the poison
		wColor: "WORD", // color of avatars
		wPlayerScript: "WORD", // script executed when player has this poison (per round)
		wReserved: "WORD", // always zero
		wEnemyScript: "WORD", // script executed when enemy has this poison (per round)
	});

	var OBJECT = DEFINE_UNION({
		rgwData: ["WORD", 6],
		player: OBJECT_PLAYER,
		item: OBJECT_ITEM,
		magic: OBJECT_MAGIC,
		enemy: OBJECT_ENEMY,
		poison: OBJECT_POISON,
	});

	var SCRIPTENTRY = DEFINE_STRUCT({
		wOperation: "WORD", // operation code
		rgwOperand: ["WORD", 3], // operands
	});

	var INVENTORY = DEFINE_STRUCT({
		wItem: "WORD", // item object code
		nAmount: "USHORT", // amount of this item
		nAmountInUse: "USHORT", // in-use amount of this item
	});

	var STORE = DEFINE_STRUCT({
		rgwItems: ["WORD", PAL.MAX_STORE_ITEM],
	});

	var ENEMY = DEFINE_STRUCT({
		wIdleFrames: "WORD", // total number of frames when idle
		wMagicFrames: "WORD", // total number of frames when using magics
		wAttackFrames: "WORD", // total number of frames when doing normal attack
		wIdleAnimSpeed: "WORD", // speed of the animation when idle
		wActWaitFrames: "WORD", // FIXME: ???
		wYPosOffset: "WORD",
		wAttackSound: "WORD", // sound played when this enemy uses normal attack
		wActionSound: "WORD", // FIXME: ???
		wMagicSound: "WORD", // sound played when this enemy uses magic
		wDeathSound: "WORD", // sound played when this enemy dies
		wCallSound: "WORD", // sound played when entering the battle
		wHealth: "WORD", // total HP of the enemy
		wExp: "WORD", // How many EXPs we'll get for beating this enemy
		wCash: "WORD", // how many cashes we'll get for beating this enemy
		wLevel: "WORD", // this enemy's level
		wMagic: "WORD", // this enemy's magic number
		wMagicRate: "WORD", // chance for this enemy to use magic
		wAttackEquivItem: "WORD", // equivalence item of this enemy's normal attack
		wAttackEquivItemRate: "WORD", // chance for equivalence item
		wStealItem: "WORD", // which item we'll get when stealing from this enemy
		nStealItem: "USHORT", // total amount of the items which can be stolen
		wAttackStrength: "WORD", // normal attack strength
		wMagicStrength: "WORD", // magical attack strength
		wDefense: "WORD", // resistance to all kinds of attacking
		wDexterity: "WORD", // dexterity
		wFleeRate: "WORD", // chance for successful fleeing
		wPoisonResistance: "WORD", // resistance to poison
		wElemResistance: ["WORD", PAL.NUM_MAGIC_ELEMENTAL], // resistance to elemental magics
		wPhysicalResistance: "WORD", // resistance to physical attack
		wDualMove: "WORD", // whether this enemy can do dual move or not
		wCollectValue: "WORD", // value for collecting this enemy for items
	});

	var ENEMYTEAM = DEFINE_STRUCT({
		rgwEnemy: ["WORD", PAL.MAX_ENEMIES_IN_TEAM],
	});

	var PLAYERROLES = DEFINE_STRUCT({
		rgwAvatar: ["WORD", PAL.MAX_PLAYER_ROLES], // avatar (shown in status view)
		rgwSpriteNumInBattle: ["WORD", PAL.MAX_PLAYER_ROLES], // sprite displayed in battle (in F.MKF)
		rgwSpriteNum: ["WORD", PAL.MAX_PLAYER_ROLES], // sprite displayed in normal scene (in MGO.MKF)
		rgwName: ["WORD", PAL.MAX_PLAYER_ROLES], // name of player class (in WORD.DAT)
		rgwAttackAll: ["WORD", PAL.MAX_PLAYER_ROLES], // whether player can attack everyone in a bulk or not
		rgwUnknown1: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwLevel: ["WORD", PAL.MAX_PLAYER_ROLES], // level
		rgwMaxHP: ["WORD", PAL.MAX_PLAYER_ROLES], // maximum HP
		rgwMaxMP: ["WORD", PAL.MAX_PLAYER_ROLES], // maximum MP
		rgwHP: ["WORD", PAL.MAX_PLAYER_ROLES], // current HP
		rgwMP: ["WORD", PAL.MAX_PLAYER_ROLES], // current MP
		rgwEquipment: [
			["WORD", PAL.MAX_PLAYER_ROLES], PAL.MAX_PLAYER_EQUIPMENTS
		], // equipments
		rgwAttackStrength: ["WORD", PAL.MAX_PLAYER_ROLES], // normal attack strength
		rgwMagicStrength: ["WORD", PAL.MAX_PLAYER_ROLES], // magical attack strength
		rgwDefense: ["WORD", PAL.MAX_PLAYER_ROLES], // resistance to all kinds of attacking
		rgwDexterity: ["WORD", PAL.MAX_PLAYER_ROLES], // dexterity
		rgwFleeRate: ["WORD", PAL.MAX_PLAYER_ROLES], // chance of successful fleeing
		rgwPoisonResistance: ["WORD", PAL.MAX_PLAYER_ROLES], // resistance to poison
		rgwElementalResistance: [
			["WORD", PAL.MAX_PLAYER_ROLES], PAL.NUM_MAGIC_ELEMENTAL
		], // resistance to elemental magics
		rgwUnknown2: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown3: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown4: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwCoveredBy: ["WORD", PAL.MAX_PLAYER_ROLES], // who will cover me when I am low of HP or not sane
		rgwMagic: [
			["WORD", PAL.MAX_PLAYER_ROLES], PAL.MAX_PLAYER_MAGICS
		], // magics
		rgwWalkFrames: ["WORD", PAL.MAX_PLAYER_ROLES], // walk frame (???)
		rgwCooperativeMagic: ["WORD", PAL.MAX_PLAYER_ROLES], // cooperative magic
		rgwUnknown5: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown6: ["WORD", PAL.MAX_PLAYER_ROLES], // FIXME: ???
		rgwDeathSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player dies
		rgwAttackSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player attacks
		rgwWeaponSound: ["WORD", PAL.MAX_PLAYER_ROLES], // weapon sound (???)
		rgwCriticalSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player make critical hits
		rgwMagicSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player is casting a magic
		rgwCoverSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player cover others
		rgwDyingSound: ["WORD", PAL.MAX_PLAYER_ROLES], // sound played when player is dying
	});

	var MAGIC = DEFINE_STRUCT({
		wEffect: "WORD", // effect sprite
		wType: "WORD", // type of this magic
		wXOffset: "WORD",
		wYOffset: "WORD",
		wSummonEffect: "WORD", // summon effect sprite (in F.MKF)
		wSpeed: "WORD", // speed of the effect
		wKeepEffect: "WORD", // FIXME: ???
		wSoundDelay: "WORD", // delay of the SFX
		wEffectTimes: "WORD", // total times of effect
		wShake: "WORD", // shake screen
		wWave: "WORD", // wave screen
		wUnknown: "WORD", // FIXME: ???
		wCostMP: "WORD", // MP cost
		wBaseDamage: "WORD", // base damage
		wElemental: "WORD", // elemental (0 = No Elemental, last = poison)
		wSound: "WORD", // sound played when using this magic
	});

	var BATTLEFIELD = DEFINE_STRUCT({
		wScreenWave: "WORD", // level of screen waving
		rgsMagicEffect: ["SHORT", PAL.NUM_MAGIC_ELEMENTAL], // effect of attributed magics
	});

	// magics learned when level up
	var LEVELUPMAGIC = DEFINE_STRUCT({
		wLevel: "WORD", // level reached
		wMagic: "WORD", // magic learned
	});

	var LEVELUPMAGIC_ALL = DEFINE_STRUCT({
		m: [LEVELUPMAGIC, PAL.MAX_PLAYABLE_PLAYER_ROLES],
	});

	var POS2D = DEFINE_STRUCT({
		x: "WORD",
		y: "WORD"
	});

	var ENEMYPOS = DEFINE_STRUCT({
		pos: [
			[POS2D, PAL.MAX_ENEMIES_IN_TEAM], PAL.MAX_ENEMIES_IN_TEAM
		],
	});

	// game data which is available in data files.
	var GAMEDATA = DEFINE_STRUCT({
		lprgEventObject: "POINTER",
		nEventObject: "INT",
		rgScene: [SCENE, PAL.MAX_SCENES],
		rgObject: [OBJECT, PAL.MAX_OBJECTS],
		lprgScriptEntry: "POINTER",
		nScriptEntry: "INT",
		lprgStore: "POINTER",
		nStore: "INT",
		lprgEnemy: "POINTER",
		nEnemy: "INT",
		lprgEnemyTeam: "POINTER",
		nEnemyTeam: "INT",
		PlayerRoles: PLAYERROLES,
		lprgMagic: "POINTER",
		nMagic: "INT",
		lprgBattleField: "POINTER",
		nBattleField: "INT",
		lprgLevelUpMagic: "POINTER",
		nLevelUpMagic: "INT",
		EnemyPos: ENEMYPOS,
		rgLevelUpExp: ["WORD", PAL.MAX_LEVELS + 1],
		rgwBattleEffectIndex: [
			["WORD", 2], 10
		],
	});

	// player party
	var PARTY = DEFINE_STRUCT({
		wPlayerRole: "WORD", // player role
		x: "SHORT",
		y: "SHORT", // position
		wFrame: "WORD", // current frame number
		wImageOffset: "WORD", // FIXME: ???
	});

	// player trail, used for other party members to follow the main party member
	var TRAIL = DEFINE_STRUCT({
		x: "WORD",
		y: "WORD", // position
		wDirection: "WORD", // direction
	});

	var EXPERIENCE = DEFINE_STRUCT({
		wExp: "WORD", // current experience points
		wReserved: "WORD",
		wLevel: "WORD", // current level
		wCount: "WORD",
	});

	var ALLEXPERIENCE = DEFINE_STRUCT({
		rgPrimaryExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgHealthExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgMagicExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgAttackExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgMagicPowerExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgDefenseExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgDexterityExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
		rgFleeExp: [EXPERIENCE, PAL.MAX_PLAYER_ROLES],
	});

	var POISONSTATUS = DEFINE_STRUCT({
		wPoisonID: "WORD", // kind of the poison
		wPoisonScript: "WORD", // script entry
	});

	var GLOBALVARS = DEFINE_STRUCT({
		g: GAMEDATA,

		bCurrentSaveSlot: "BYTE", // current save slot (1-5)
		iCurMainMenuItem: "INT", // current main menu item number
		iCurSystemMenuItem: "INT", // current system menu item number
		iCurInvMenuItem: "INT", // current inventory menu item number
		iCurPlayingRNG: "INT", // current playing RNG animation
		fGameStart: "BOOL", // TRUE if the has just started
		fEnteringScene: "BOOL", // TRUE if entering a new scene
		fNeedToFadeIn: "BOOL", // TRUE if need to fade in when drawing scene
		fInBattle: "BOOL", // TRUE if in battle
		fAutoBattle: "BOOL", // TRUE if auto-battle
		wLastUnequippedItem: "WORD", // last unequipped item

		rgEquipmentEffect: [PLAYERROLES, PAL.MAX_PLAYER_EQUIPMENTS + 1], // equipment effects
		rgPlayerStatus: [
			["WORD", PAL.kStatusAll], PAL.MAX_PLAYER_ROLES
		], // player status

		viewport: "POINTER", // viewport coordination
		partyoffset: "DWORD",
		wLayer: "WORD",
		wMaxPartyMemberIndex: "WORD", // max index of members in party (0 to MAX_PLAYERS_IN_PARTY - 1)
		rgParty: [PARTY, PAL.MAX_PLAYABLE_PLAYER_ROLES], // player party
		rgTrail: [TRAIL, PAL.MAX_PLAYABLE_PLAYER_ROLES], // player trail
		wPartyDirection: "WORD", // direction of the party
		wNumScene: "WORD", // current scene number
		wNumPalette: "WORD", // current palette number
		fNightPalette: "BOOL", // TRUE if use the darker night palette
		wNumMusic: "WORD", // current music number
		wNumBattleMusic: "WORD", // current music number in battle
		wNumBattleField: "WORD", // current battle field number
		wCollectValue: "WORD", // value of "collected" items
		wScreenWave: "WORD", // level of screen waving
		sWaveProgression: "SHORT",
		wChaseRange: "WORD",
		wChasespeedChangeCycles: "WORD",
		nFollower: "USHORT",

		dwCash: "DWORD", // amount of cash

		Exp: ALLEXPERIENCE, // experience status
		rgPoisonStatus: [
			[POISONSTATUS, PAL.MAX_PLAYABLE_PLAYER_ROLES], PAL.MAX_POISONS
		], // poison status
		rgInventory: [INVENTORY, PAL.MAX_INVENTORY], // inventory status

		lpObjectDesc: "POINTER",

		dwFrameNum: "DWORD"
	});

	var SAVEDGAME = DEFINE_STRUCT({
		wSavedTimes: "WORD", // saved times
		wViewportX: "WORD",
		wViewportY: "WORD", // viewport location
		nPartyMember: "WORD", // number of members in party
		wNumScene: "WORD", // scene number
		wPaletteOffset: "WORD",
		wPartyDirection: "WORD", // party direction
		wNumMusic: "WORD", // music number
		wNumBattleMusic: "WORD", // battle music number
		wNumBattleField: "WORD", // battle field number
		wScreenWave: "WORD", // level of screen waving
		wBattleSpeed: "WORD", // battle speed
		wCollectValue: "WORD", // value of "collected" items
		wLayer: "WORD",
		wChaseRange: "WORD",
		wChasespeedChangeCycles: "WORD",
		nFollower: "WORD",
		rgwReserved2: ["WORD", 3], // unused
		dwCash: "DWORD", // amount of cash
		rgParty: [PARTY, PAL.MAX_PLAYABLE_PLAYER_ROLES], // player party
		rgTrail: [TRAIL, PAL.MAX_PLAYABLE_PLAYER_ROLES], // player trail
		Exp: ALLEXPERIENCE, // experience data
		PlayerRoles: PLAYERROLES,
		rgPoisonStatus: [
			[POISONSTATUS, PAL.MAX_PLAYABLE_PLAYER_ROLES], PAL.MAX_POISONS
		], // poison status
		rgInventory: [INVENTORY, PAL.MAX_INVENTORY], // inventory status
		rgScene: [SCENE, PAL.MAX_SCENES],
		rgObject: [OBJECT, PAL.MAX_OBJECTS],
		rgEventObject: [EVENTOBJECT, PAL.MAX_EVENT_OBJECTS],
	});

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;
		_ins.lpObjectDesc = _ins.game.resource.loadObjectDesc(_ins.game.resource.buffers.DESC_BUFFER);
		_ins.bCurrentSaveSlot = 1;
	}
	_C.prototype = new GLOBALVARS();
	_C.prototype.initGameData = function(iSaveSlot) {
		var _ins = this;
		_ins.initGlobalGameData();
		_ins.bCurrentSaveSlot = iSaveSlot;

		//
		// try loading from the saved game file.
		//
		if (iSaveSlot == 0 || _ins.loadGame(iSaveSlot + ".rpg") != 0) {
			//
			// Cannot load the saved game file. Load the defaults.
			//
			_ins.loadDefaultGame();
		}

		_ins.fGameStart = true;
		_ins.fNeedToFadeIn = false;
		_ins.iCurInvMenuItem = 0;
		_ins.fInBattle = false;

		PAL_Util.memset(_ins.rgPlayerStatus.data, 0, _ins.rgPlayerStatus.size);
		_ins.updateEquipments();
	}

	_C.prototype.initGlobalGameData = function() {
		var _ins = this;
		var PAL_DOALLOCATE = function(fp, num, type, parent, ptr, n) {
			var len = PAL_Util.MKFGetChunkSize(num, fp);
			var data = new DataView(new ArrayBuffer(len));
			parent[n] = Math.floor(len / type.prototype.size);
			parent[ptr] = new STRUCT_ARRAY(data, type, parent[n]);
		}

		//
		// If the memory has not been allocated, allocate first.
		//
		if (_ins.g.lprgEventObject == null) {

			PAL_DOALLOCATE(_ins.game.resource.buffers.SSS_BUFFER, 0, EVENTOBJECT,
				_ins.g, 'lprgEventObject', 'nEventObject');

			PAL_DOALLOCATE(_ins.game.resource.buffers.SSS_BUFFER, 4, SCRIPTENTRY,
				_ins.g, 'lprgScriptEntry', 'nScriptEntry');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 0, STORE,
				_ins.g, 'lprgStore', 'nStore');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 1, ENEMY,
				_ins.g, 'lprgEnemy', 'nEnemy');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 2, ENEMYTEAM,
				_ins.g, 'lprgEnemyTeam', 'nEnemyTeam');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 4, MAGIC,
				_ins.g, 'lprgMagic', 'nMagic');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 5, BATTLEFIELD,
				_ins.g, 'lprgBattleField', 'nBattleField');

			PAL_DOALLOCATE(_ins.game.resource.buffers.DATA_BUFFER, 6, LEVELUPMAGIC_ALL,
				_ins.g, 'lprgLevelUpMagic', 'nLevelUpMagic');

			_ins.readGlobalGameData();
		}
	}

	_C.prototype.readGlobalGameData = function() {
		var _ins = this;
		LOAD_DATA(_ins.g.lprgScriptEntry.data, _ins.g.nScriptEntry * SCRIPTENTRY.prototype.size,
			4, _ins.game.resource.buffers.SSS_BUFFER);

		LOAD_DATA(_ins.g.lprgStore.data, _ins.g.nStore * STORE.prototype.size,
			0, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.lprgEnemy.data, _ins.g.nEnemy * ENEMY.prototype.size,
			1, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.lprgEnemyTeam.data, _ins.g.nEnemyTeam * ENEMYTEAM.prototype.size,
			2, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.lprgMagic.data, _ins.g.nMagic * MAGIC.prototype.size,
			4, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.lprgBattleField.data, _ins.g.nBattleField * BATTLEFIELD.prototype.size,
			5, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.lprgLevelUpMagic.data, _ins.g.nLevelUpMagic * LEVELUPMAGIC_ALL.prototype.size,
			6, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.rgwBattleEffectIndex.data, _ins.g.rgwBattleEffectIndex.size,
			11, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.EnemyPos.data, _ins.g.EnemyPos.size,
			13, _ins.game.resource.buffers.DATA_BUFFER);
		LOAD_DATA(_ins.g.rgLevelUpExp.data, _ins.g.rgLevelUpExp.size,
			14, _ins.game.resource.buffers.DATA_BUFFER);
	}

	_C.prototype.loadDefaultGame = function() {
		var _ins = this;
		var p = _ins.g;

		//
		// Load the default data from the game data files.
		//
		LOAD_DATA(p.lprgEventObject.data, p.nEventObject * EVENTOBJECT.prototype.size, 0, _ins.game.resource.buffers.SSS_BUFFER);
		LOAD_DATA(p.rgScene.data, p.rgScene.size, 1, _ins.game.resource.buffers.SSS_BUFFER);
		LOAD_DATA(p.rgObject.data, p.rgObject.size, 2, _ins.game.resource.buffers.SSS_BUFFER);
		LOAD_DATA(p.PlayerRoles.data, PLAYERROLES.prototype.size, 3, _ins.game.resource.buffers.DATA_BUFFER);

		//
		// Set some other default data.
		//
		_ins.dwCash = 0;
		_ins.wNumMusic = 0;
		_ins.wNumPalette = 0;
		_ins.wNumScene = 1;
		_ins.wCollectValue = 0;
		_ins.fNightPalette = false;
		_ins.wMaxPartyMemberIndex = 0;
		_ins.viewport = {
			x: 0,
			y: 0
		};
		_ins.wLayer = 0;
		_ins.wChaseRange = 1;

		PAL_Util.memset(_ins.rgInventory.data, 0, _ins.rgInventory.size);
		PAL_Util.memset(_ins.rgPoisonStatus.data, 0, _ins.rgPoisonStatus.size);
		PAL_Util.memset(_ins.rgParty.data, 0, _ins.rgParty.size);
		PAL_Util.memset(_ins.rgTrail.data, 0, _ins.rgTrail.size);
		PAL_Util.memset(_ins.Exp.data, 0, _ins.Exp.size);

		for (var i = 0; i < PAL.MAX_PLAYER_ROLES; i++) {
			_ins.Exp.rgPrimaryExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgHealthExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgMagicExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgAttackExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgMagicPowerExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgDefenseExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgDexterityExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
			_ins.Exp.rgFleeExp[i].wLevel = p.PlayerRoles.rgwLevel[i];
		}

		_ins.fEnteringScene = true;
	}

	_C.prototype.loadGame = function(savename) {
		//
		// Try to open the specified file
		//
		var fp = localStorage.getItem(savename);
		if (fp == null) {
			return -1;
		}

		//
		// Read all data from the file.
		//
		var data = BASE64.decodeB(fp);
		var s = new SAVEDGAME(data);

		//
		// Cash amount is in DWORD, so do a wordswap in Big-Endian.
		//
		s.dwCash = PAL_Util.SWAP16(s.dwCash);

		//
		// Get all the data from the saved game struct.
		//
		_ins.viewport = {
			x: s.wViewportX,
			y: s.wViewportY
		};
		_ins.wMaxPartyMemberIndex = s.nPartyMember;
		_ins.wNumScene = s.wNumScene;
		_ins.fNightPalette = (s.wPaletteOffset != 0);
		_ins.wPartyDirection = s.wPartyDirection;
		_ins.wNumMusic = s.wNumMusic;
		_ins.wNumBattleMusic = s.wNumBattleMusic;
		_ins.wNumBattleField = s.wNumBattleField;
		_ins.wScreenWave = s.wScreenWave;
		_ins.sWaveProgression = 0;
		_ins.wCollectValue = s.wCollectValue;
		_ins.wLayer = s.wLayer;
		_ins.wChaseRange = s.wChaseRange;
		_ins.wChasespeedChangeCycles = s.wChasespeedChangeCycles;
		_ins.nFollower = s.nFollower;
		_ins.dwCash = s.dwCash;

		PAL_Util.memcpy(_ins.rgParty.data, s.rgParty.data, _ins.rgParty.size);
		PAL_Util.memcpy(_ins.rgTrail.data, s.rgTrail.data, _ins.rgTrail.size);
		_ins.Exp = s.Exp;
		_ins.g.PlayerRoles = s.PlayerRoles;
		PAL_Util.memset(_ins.rgPoisonStatus.data, 0, _ins.rgPoisonStatus.size);
		PAL_Util.memcpy(_ins.rgInventory.data, s.rgInventory.data, _ins.rgInventory.size);
		PAL_Util.memcpy(_ins.g.rgScene.data, s.rgScene.data, _ins.g.rgScene.size);
		PAL_Util.memcpy(_ins.g.rgObject.data, s.rgObject.data, _ins.g.rgObject.size);
		PAL_Util.memcpy(_ins.g.lprgEventObject.data, s.rgEventObject.data, EVENTOBJECT.prototype.size * _ins.g.nEventObject);

		_ins.fEnteringScene = false;

		_ins.compressInventory();

		//
		// Success
		//
		return 0;
	}

	_C.prototype.compressInventory = function() {
		var _ins = this;
		var j = 0;

		for (var i = 0; i < PAL.MAX_INVENTORY; i++) {
			if (_ins.rgInventory[i].wItem == 0) {
				break;
			}

			if (_ins.rgInventory[i].nAmount > 0) {
				_ins.rgInventory[j] = _ins.rgInventory[i];
				j++;
			}
		}

		for (; j < PAL.MAX_INVENTORY; j++) {
			_ins.rgInventory[j].nAmount = 0;
			_ins.rgInventory[j].nAmountInUse = 0;
			_ins.rgInventory[j].wItem = 0;
		}
	}

	_C.prototype.updateEquipments = function() {
		var _ins = this;

		PAL_Util.memset(_ins.rgEquipmentEffect.data, 0, _ins.rgEquipmentEffect.size);

		for (var i = 0; i < PAL.MAX_PLAYER_ROLES; i++) {
			for (var j = 0; j < PAL.MAX_PLAYER_EQUIPMENTS; j++) {
				var w = _ins.g.PlayerRoles.rgwEquipment[j][i];
				if (w != 0) {
					// fix me when script.js ready
					// _ins.g.rgObject[w].item.wScriptOnEquip = PAL_RunTriggerScript(_ins.g.rgObject[w].item.wScriptOnEquip, i);
				}
			}
		}
	}

	window.PAL_Global = _C;
})();