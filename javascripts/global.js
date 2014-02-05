(function() {
	// maximum number of players in party
	var MAX_PLAYERS_IN_PARTY = 3;

	// total number of possible player roles
	var MAX_PLAYER_ROLES = 6;

	// totally number of playable player roles
	var MAX_PLAYABLE_PLAYER_ROLES = 5;

	// maximum entries of inventory
	var MAX_INVENTORY = 256;

	// maximum items in a store
	var MAX_STORE_ITEM = 9;

	// total number of magic attributes
	var NUM_MAGIC_ELEMENTAL = 5;

	// maximum number of enemies in a team
	var MAX_ENEMIES_IN_TEAM = 5;

	// maximum number of equipments for a player
	var MAX_PLAYER_EQUIPMENTS = 6;

	// maximum number of magics for a player
	var MAX_PLAYER_MAGICS = 32;

	// maximum number of scenes
	var MAX_SCENES = 300;

	// maximum number of objects
	var MAX_OBJECTS = 600;

	// maximum number of event objects (should be somewhat more than the original,
	// as there are some modified versions which has more)
	var MAX_EVENT_OBJECTS = 5500;

	// maximum number of effective poisons to players
	var MAX_POISONS = 16;

	// maximum number of level
	var MAX_LEVELS = 99;

	// status of characters
	var kStatusConfused = 0, // attack friends randomly
		kStatusParalyzed = 1, // paralyzed
		kStatusSleep = 2, // not allowed to move
		kStatusSilence = 3, // cannot use magic
		kStatusPuppet = 4, // for dead players only, continue attacking
		kStatusBravery = 5, // more power for physical attacks
		kStatusProtect = 6, // more defense value
		kStatusHaste = 7, // faster
		kStatusDualAttack = 8, // dual attack
		kStatusAll = 9;

	// body parts of equipments
	var kBodyPartHead = 0,
		kBodyPartBody = 1,
		kBodyPartShoulder = 2,
		kBodyPartHand = 3,
		kBodyPartFeet = 4,
		kBodyPartWear = 5,
		kBodyPartExtra = 6;

	// state of event object, used by the sState field of the EVENTOBJECT struct
	var kObjStateHidden = 0,
		kObjStateNormal = 1,
		kObjStateBlocker = 2;

	var kTriggerNone = 0,
		kTriggerSearchNear = 1,
		kTriggerSearchNormal = 2,
		kTriggerSearchFar = 3,
		kTriggerTouchNear = 4,
		kTriggerTouchNormal = 5,
		kTriggerTouchFar = 6,
		kTriggerTouchFarther = 7,
		kTriggerTouchFarthest = 8;

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

	var kItemFlagUsable = (1 << 0),
		kItemFlagEquipable = (1 << 1),
		kItemFlagThrowable = (1 << 2),
		kItemFlagConsuming = (1 << 3),
		kItemFlagApplyToAll = (1 << 4),
		kItemFlagSellable = (1 << 5),
		kItemFlagEquipableByPlayerRole_First = (1 << 6);

	// items
	var OBJECT_ITEM = DEFINE_STRUCT({
		wBitmap: "WORD", // bitmap number in BALL.MKF
		wPrice: "WORD", // price
		wScriptOnUse: "WORD", // script executed when using this item
		wScriptOnEquip: "WORD", // script executed when equipping this item
		wScriptOnThrow: "WORD", // script executed when throwing this item to enemy
		wFlags: "WORD", // flags
	});

	var kMagicFlagUsableOutsideBattle = (1 << 0),
		kMagicFlagUsableInBattle = (1 << 1),
		kMagicFlagUsableToEnemy = (1 << 3),
		kMagicFlagApplyToAll = (1 << 4);

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
		rgwItems: ["WORD", MAX_STORE_ITEM],
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
		wElemResistance: ["WORD", NUM_MAGIC_ELEMENTAL], // resistance to elemental magics
		wPhysicalResistance: "WORD", // resistance to physical attack
		wDualMove: "WORD", // whether this enemy can do dual move or not
		wCollectValue: "WORD", // value for collecting this enemy for items
	});

	var ENEMYTEAM = DEFINE_STRUCT({
		rgwEnemy: ["WORD", MAX_ENEMIES_IN_TEAM],
	});

	var PLAYERROLES = DEFINE_STRUCT({
		rgwAvatar: ["WORD", MAX_PLAYER_ROLES], // avatar (shown in status view)
		rgwSpriteNumInBattle: ["WORD", MAX_PLAYER_ROLES], // sprite displayed in battle (in F.MKF)
		rgwSpriteNum: ["WORD", MAX_PLAYER_ROLES], // sprite displayed in normal scene (in MGO.MKF)
		rgwName: ["WORD", MAX_PLAYER_ROLES], // name of player class (in WORD.DAT)
		rgwAttackAll: ["WORD", MAX_PLAYER_ROLES], // whether player can attack everyone in a bulk or not
		rgwUnknown1: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwLevel: ["WORD", MAX_PLAYER_ROLES], // level
		rgwMaxHP: ["WORD", MAX_PLAYER_ROLES], // maximum HP
		rgwMaxMP: ["WORD", MAX_PLAYER_ROLES], // maximum MP
		rgwHP: ["WORD", MAX_PLAYER_ROLES], // current HP
		rgwMP: ["WORD", MAX_PLAYER_ROLES], // current MP
		rgwEquipment: [
			["WORD", MAX_PLAYER_ROLES], MAX_PLAYER_EQUIPMENTS
		], // equipments
		rgwAttackStrength: ["WORD", MAX_PLAYER_ROLES], // normal attack strength
		rgwMagicStrength: ["WORD", MAX_PLAYER_ROLES], // magical attack strength
		rgwDefense: ["WORD", MAX_PLAYER_ROLES], // resistance to all kinds of attacking
		rgwDexterity: ["WORD", MAX_PLAYER_ROLES], // dexterity
		rgwFleeRate: ["WORD", MAX_PLAYER_ROLES], // chance of successful fleeing
		rgwPoisonResistance: ["WORD", MAX_PLAYER_ROLES], // resistance to poison
		rgwElementalResistance: [
			["WORD", MAX_PLAYER_ROLES], NUM_MAGIC_ELEMENTAL
		], // resistance to elemental magics
		rgwUnknown2: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown3: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown4: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwCoveredBy: ["WORD", MAX_PLAYER_ROLES], // who will cover me when I am low of HP or not sane
		rgwMagic: [
			["WORD", MAX_PLAYER_ROLES], MAX_PLAYER_MAGICS
		], // magics
		rgwWalkFrames: ["WORD", MAX_PLAYER_ROLES], // walk frame (???)
		rgwCooperativeMagic: ["WORD", MAX_PLAYER_ROLES], // cooperative magic
		rgwUnknown5: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwUnknown6: ["WORD", MAX_PLAYER_ROLES], // FIXME: ???
		rgwDeathSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player dies
		rgwAttackSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player attacks
		rgwWeaponSound: ["WORD", MAX_PLAYER_ROLES], // weapon sound (???)
		rgwCriticalSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player make critical hits
		rgwMagicSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player is casting a magic
		rgwCoverSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player cover others
		rgwDyingSound: ["WORD", MAX_PLAYER_ROLES], // sound played when player is dying
	});

	var kMagicTypeNormal = 0,
		kMagicTypeAttackAll = 1, // draw the effect on each of the enemies
		kMagicTypeAttackWhole = 2, // draw the effect on the whole enemy team
		kMagicTypeAttackField = 3, // draw the effect on the battle field
		kMagicTypeApplyToPlayer = 4, // the magic is used on one player
		kMagicTypeApplyToParty = 5, // the magic is used on the whole party
		kMagicTypeTrance = 8, // trance the player
		kMagicTypeSummon = 9; // summon

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
		rgsMagicEffect: ["SHORT", NUM_MAGIC_ELEMENTAL], // effect of attributed magics
	});

	// magics learned when level up
	var LEVELUPMAGIC = DEFINE_STRUCT({
		wLevel: "WORD", // level reached
		wMagic: "WORD", // magic learned
	});

	var LEVELUPMAGIC_ALL = DEFINE_STRUCT({
		m: [LEVELUPMAGIC, MAX_PLAYABLE_PLAYER_ROLES],
	});

	var POS2D = DEFINE_STRUCT({
		x: "WORD",
		y: "WORD"
	});

	var ENEMYPOS = DEFINE_STRUCT({
		pos: [
			[POS2D, MAX_ENEMIES_IN_TEAM], MAX_ENEMIES_IN_TEAM
		],
	});

	// game data which is available in data files.
	var GAMEDATA = DEFINE_STRUCT({
		lprgEventObject: "POINTER",
		nEventObject: "INT",
		rgScene: [SCENE, MAX_SCENES],
		rgObject: [OBJECT, MAX_OBJECTS],
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
		rgLevelUpExp: ["WORD", MAX_LEVELS + 1],
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
		rgPrimaryExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgHealthExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgMagicExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgAttackExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgMagicPowerExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgDefenseExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgDexterityExp: [EXPERIENCE, MAX_PLAYER_ROLES],
		rgFleeExp: [EXPERIENCE, MAX_PLAYER_ROLES],
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

		rgEquipmentEffect: [PLAYERROLES, MAX_PLAYER_EQUIPMENTS + 1], // equipment effects
		rgPlayerStatus: [
			["WORD", kStatusAll], MAX_PLAYER_ROLES
		], // player status

		viewport: "DWORD", // viewport coordination
		partyoffset: "DWORD",
		wLayer: "WORD",
		wMaxPartyMemberIndex: "WORD", // max index of members in party (0 to MAX_PLAYERS_IN_PARTY - 1)
		rgParty: [PARTY, MAX_PLAYABLE_PLAYER_ROLES], // player party
		rgTrail: [TRAIL, MAX_PLAYABLE_PLAYER_ROLES], // player trail
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
			[POISONSTATUS, MAX_PLAYABLE_PLAYER_ROLES], MAX_POISONS
		], // poison status
		rgInventory: [INVENTORY, MAX_INVENTORY], // inventory status

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
		rgParty: [PARTY, MAX_PLAYABLE_PLAYER_ROLES], // player party
		rgTrail: [TRAIL, MAX_PLAYABLE_PLAYER_ROLES], // player trail
		Exp: ALLEXPERIENCE, // experience data
		PlayerRoles: PLAYERROLES,
		rgPoisonStatus: [
			[POISONSTATUS, MAX_PLAYABLE_PLAYER_ROLES], MAX_POISONS
		], // poison status
		rgInventory: [INVENTORY, MAX_INVENTORY], // inventory status
		rgScene: [SCENE, MAX_SCENES],
		rgObject: [OBJECT, MAX_OBJECTS],
		rgEventObject: [EVENTOBJECT, MAX_EVENT_OBJECTS],
	});

	var _C = function(game) {
		var _ins = this;
		_ins.game = game;

		_ins.bCurrentSaveSlot = 1;
	}
	_C.prototype = new GLOBALVARS();
	window.PAL_Global = _C;
})();