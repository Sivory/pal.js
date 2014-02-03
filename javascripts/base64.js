(function() {
	var enKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var deKey = {};
	for (var i = 0; i < enKey.length; i++) {
		var indexCh = enKey.charAt(i);
		deKey[indexCh] = i;
	}
	var _C = {};
	_C.encodeB = function(src) {
		// 用一个数组来存放编码后的字符，效率比用字符串相加高很多。
		var str = new Array();
		var ch1, ch2, ch3;
		var pos = 0;
		// 每三个字符进行编码。
		while (pos + 3 <= src.byteLength) {
			ch1 = src.getUint8(pos++);
			ch2 = src.getUint8(pos++);
			ch3 = src.getUint8(pos++);
			str.push(enKey.charAt(ch1 >> 2), enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
			str.push(enKey.charAt(((ch2 << 2) + (ch3 >> 6)) & 0x3f), enKey.charAt(ch3 & 0x3f));
		}
		// 给剩下的字符进行编码。
		if (pos < src.byteLength) {
			ch1 = src.getUint8(pos++);
			str.push(enKey.charAt(ch1 >> 2));
			if (pos < src.length) {
				ch2 = src.getUint8(pos);
				str.push(enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
				str.push(enKey.charAt(ch2 << 2 & 0x3f), '=');
			} else {
				str.push(enKey.charAt(ch1 << 4 & 0x3f), '==');
			}
		}
		//组合各编码后的字符，连成一个字符串。
		return str.join('');
	}

	_C.decodeB = function(src) {
		//用一个数组来存放解码后的字符。
		var str = new Array();
		var ch1, ch2, ch3, ch4;
		var pos = 0;
		//过滤非法字符，并去掉'='。
		src = src.replace(/[^A-Za-z0-9\+\/]/g, '');
		//decode the source string in partition of per four characters.
		while (pos + 4 <= src.length) {
			ch1 = deKey[src.charAt(pos++)];
			ch2 = deKey[src.charAt(pos++)];
			ch3 = deKey[src.charAt(pos++)];
			ch4 = deKey[src.charAt(pos++)];
			str.push((ch1 << 2 & 0xff) + (ch2 >> 4));
			str.push((ch2 << 4 & 0xff) + (ch3 >> 2));
			str.push((ch3 << 6 & 0xff) + ch4);
		}
		//给剩下的字符进行解码。
		if (pos + 1 < src.length) {
			ch1 = deKey[src.charAt(pos++)];
			ch2 = deKey[src.charAt(pos++)];
			if (pos < src.length) {
				ch3 = deKey[src.charAt(pos)];
				str.push((ch1 << 2 & 0xff) + (ch2 >> 4));
				str.push((ch2 << 4 & 0xff) + (ch3 >> 2));
			} else {
				str.push((ch1 << 2 & 0xff) + (ch2 >> 4));
			}
		}
		var arr8 = new Uint8Array(str);
		return new DataView(arr8.buffer);
	}
	window.BASE64 = _C;
})();