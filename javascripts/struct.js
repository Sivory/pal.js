//模拟C语言中的结构体 与联合体

(function() {
	var sizeOf = function(type) {
		switch (type) {
			case 'SHORT':
				return 1;
			case 'WORD':
				return 2;
			case 'DWORD':
				return 4;
			case 'BYTE':
			case 'BOOL':
			case 'USHORT':
				return 1;
			case 'INT':
				return 4;
			case 'POINTER':
				return 0;
			default:
				if (type.prototype instanceof PAL_STRUCT || type.prototype instanceof PAL_UNION)
					return type.prototype.size; //结构体或联合体的尺寸
				else if (type instanceof Array)
					return sizeOf(type[0]) * type[1]; //数组的尺寸
				else
					throw "error! unknow type as \"" + type + "\"";
		};
	}

	var MAKE_ARRAY = function(data, offset, type, size) {
		var resarray = null;
		switch (type) {
			case 'SHORT':
				resarray = new Int8Array(data.buffer, data.byteOffset + offset, size);
				break;
			case 'WORD':
				resarray = new Uint16Array(data.buffer, data.byteOffset + offset, size);
				break;
			case 'DWORD':
				resarray = new Uint32Array(data.buffer, data.byteOffset + offset, size);
				break;
			case 'BYTE':
			case 'BOOL':
			case 'USHORT':
				resarray = new Uint8Array(data.buffer, data.byteOffset + offset, size);
				break;
			case 'INT':
				resarray = new Int32Array(data.buffer, data.byteOffset + offset, size);
				break;
			case 'POINTER':
				resarray = [];
				for (var i = 0; i < size; i++) {
					resarray.push(null);
				}
				break;
			default:
				if (type.prototype instanceof PAL_STRUCT || type.prototype instanceof PAL_UNION) {
					// 结构体 或 联合体数组
					var structConstructor = type;
					var structarray = [];
					var structoffset = 0;
					var structsize = structConstructor.prototype.size;
					for (var i = 0; i < size; i++) {
						var newStructData = new DataView(data.buffer, data.byteOffset + offset + structoffset, structsize);
						structarray.push(new structConstructor(newStructData));
						structoffset += structsize;
					}
					resarray = structarray;
				} else if (type instanceof Array) {
					//多维数组
					var arrayarray = [];
					var arrayoffset = 0;
					var arraysize = sizeOf(type);
					for (var i = 0; i < size; i++) {
						arrayarray.push(MAKE_ARRAY(data, offset + arrayoffset, type[0], type[1]));
						arrayoffset += arraysize;
					}
					resarray = arrayarray;
				} else {
					throw "error! unknow type as \"" + type + "\"";
				}
		}
		return resarray;
	}

	window.PAL_STRUCT = function() {
		this.className = "PAL_STRUCT";
	};

	window.DEFINE_STRUCT = function(map) {
		var _C = function(data) {
			var _ins = this;
			if (data == null) {
				data = new DataView(new ArrayBuffer(_ins.size));
			}
			_ins.__defineGetter__('data', function() {
				return data;
			});
			_ins.structlist = {};
			_ins.arraylist = {};
			_ins.pointerlist = {};
			for (var key in _ins.typelist) {
				if (_ins.typelist.hasOwnProperty(key)) {
					var type = _ins.typelist[key];
					var offset = _ins.offsetlist[key];
					var size = _ins.sizelist[key];
					(function(key, type, offset, size) {
						switch (type) {
							case 'SHORT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getInt8(offset);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getInt8(offset, value);
								});
								break;
							case 'WORD':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint16(offset, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getUint16(offset, value, true);
								});
								break;
							case 'DWORD':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint32(offset, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getUint32(offset, value, true);
								});
								break;
							case 'BYTE':
							case 'BOOL':
							case 'USHORT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint8(offset);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.setUint8(offset, value);
								});
								break;
							case 'INT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getInt32(offset, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.setInt32(offset, value, true);
								});
								break;
							case 'POINTER':
								_ins.__defineGetter__(key, function() {
									return _ins.pointerlist[key];
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.pointerlist[key] = value;
								});
								break;
							default:
								if (type.prototype instanceof PAL_STRUCT || type.prototype instanceof PAL_UNION) {
									// 嵌套一个结构体或联合体的情况
									// 为新结构体/联合体分配空间
									var newStructData = new DataView(_ins.data.buffer, _ins.data.byteOffset + offset, size);
									_ins.structlist[key] = new type(newStructData);
									_ins.__defineGetter__(key, function() {
										return _ins.structlist[key];
									});
								} else if (type instanceof Array) { // 如果是数组
									_ins.arraylist[key] = MAKE_ARRAY(data, offset, type[0], type[1]);
									_ins.__defineGetter__(key, function() {
										return _ins.arraylist[key];
									});
								} else {
									throw "error! unknow type as \"" + type + "\"";
								}
								break;
						}
					})(key, type, offset, size);
				}
			}
		}
		_C.prototype = new PAL_STRUCT();
		_C.prototype.typelist = map;
		_C.prototype.offsetlist = {};
		_C.prototype.sizelist = {};
		var offset = 0;
		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				var type = map[key];
				var size = sizeOf(type);
				_C.prototype.offsetlist[key] = offset;
				_C.prototype.sizelist[key] = size;
				offset += size;
			}
		}
		_C.prototype.size = offset;
		return _C;
	}

	window.PAL_UNION = function() {
		this.className = "PAL_UNION";
	};

	window.DEFINE_UNION = function(map) {
		var _C = function(data) {
			var _ins = this;
			if (data == null) {
				data = new DataView(new ArrayBuffer(_ins.size));
			}
			_ins.__defineGetter__('data', function() {
				return data;
			});
			_ins.structlist = {};
			_ins.arraylist = {};
			_ins.pointerlist = {};
			for (var key in _ins.typelist) {
				if (_ins.typelist.hasOwnProperty(key)) {
					var type = _ins.typelist[key];
					var size = _ins.sizelist[key];
					(function(key, type, size) {
						switch (type) {
							case 'SHORT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getInt8(0);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getInt8(0, value);
								});
								break;
							case 'WORD':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint16(0, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getUint16(0, value, true);
								});
								break;
							case 'DWORD':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint32(0, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.getUint32(0, value, true);
								});
								break;
							case 'BYTE':
							case 'BOOL':
							case 'USHORT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getUint8(0);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.setUint8(0, value);
								});
								break;
							case 'INT':
								_ins.__defineGetter__(key, function() {
									return _ins.data.getInt32(0, true);
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.data.setInt32(0, value, true);
								});
								break;
							case 'POINTER':
								_ins.__defineGetter__(key, function() {
									return _ins.pointerlist[key];
								});
								_ins.__defineSetter__(key, function(value) {
									_ins.pointerlist[key] = value;
								});
								break;
							default:
								if (type.prototype instanceof PAL_STRUCT || type.prototype instanceof PAL_UNION) {
									// 嵌套一个结构体或联合体的情况
									// 为新结构体/联合体分配空间
									var newStructData = new DataView(_ins.data.buffer, _ins.data.byteOffset, size);
									_ins.structlist[key] = new type(newStructData);
									_ins.__defineGetter__(key, function() {
										return _ins.structlist[key];
									});
								} else if (type instanceof Array) { // 如果是数组
									_ins.arraylist[key] = MAKE_ARRAY(data, 0, type[0], type[1]);
									_ins.__defineGetter__(key, function() {
										return _ins.arraylist[key];
									});
								} else {
									throw "error! unknow type as \"" + type + "\"";
								}
								break;
						}
					})(key, type, size);
				}
			}
		}
		_C.prototype = new PAL_UNION();
		_C.prototype.typelist = map;
		_C.prototype.sizelist = {};
		var maxsize = 0;
		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				var type = map[key];
				var size = sizeOf(type);
				_C.prototype.sizelist[key] = size;
				if (size > maxsize) maxsize = size;
			}
		}
		_C.prototype.size = maxsize;
		return _C;
	}
})();