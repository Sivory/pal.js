//仙剑中的一种文件压缩算法 具体逻辑我也不知道，我只是简单的翻译成了javascript

(function() {

	var getFileHeader = function(source) {
		return {
			Signature: source.getUint32(0, true),
			UncompressedLength: source.getUint32(4, true),
			CompressedLength: source.getUint32(8, true),
			BlockCount: source.getUint16(12, true),
			Unknown: source.getUint8(14),
			HuffmanTreeLength: source.getUint8(15)
		};
	}

	var getBlockHeader = function(source) {
		return {
			UncompressedLength: source.getUint16(0, true),
			CompressedLength: source.getUint16(2, true),
			LZSSRepeatTable: [
				source.getUint16(4, true),
				source.getUint16(6, true),
				source.getUint16(8, true),
				source.getUint16(10, true)
			],
			LZSSOffsetCodeLengthTable: [
				source.getUint8(12),
				source.getUint8(13),
				source.getUint8(14),
				source.getUint8(15)
			],
			LZSSRepeatCodeLengthTable: [
				source.getUint8(16),
				source.getUint8(17),
				source.getUint8(18)
			],
			CodeCountCodeLengthTable: [
				source.getUint8(19),
				source.getUint8(20),
				source.getUint8(21)
			],
			CodeCountTable: [
				source.getUint8(22),
				source.getUint8(23)
			]
		};
	}

	var get_bits = function(src, bitptr, count) {
		var temp = new Uint8Array(src.buffer, src.byteOffset + ((bitptr[0] >> 4) << 1));
		var bptr = bitptr[0] & 0xf;
		var mask;
		bitptr[0] += count;
		if (count > 16 - bptr) {
			count = count + bptr - 16;
			mask = 0xffff >> bptr;
			var res = (((temp[0] | (temp[1] << 8)) & mask) << count) | ((temp[2] | (temp[3] << 8)) >> (16 - count));
			return res;
		} else {
			var e = (temp[0] | (temp[1] << 8)) << bptr;
			var res = ((e & 0xffff) >> (16 - count));
			return res;
		}
	}

	var get_loop = function(src, bitptr, header) {
		if (get_bits(src, bitptr, 1)) {
			return header.CodeCountTable[0];
		} else {
			var temp = get_bits(src, bitptr, 2);
			if (temp)
				return get_bits(src, bitptr, header.CodeCountCodeLengthTable[temp - 1]);
			else
				return header.CodeCountTable[1];
		}
	}

	var get_count = function(src, bitptr, header) {
		var temp;
		if ((temp = get_bits(src, bitptr, 2)) != 0) {
			if (get_bits(src, bitptr, 1))
				return get_bits(src, bitptr, header.LZSSRepeatCodeLengthTable[temp - 1]);
			else
				return header.LZSSRepeatTable[temp];
		} else
			return header.LZSSRepeatTable[0];
	}

	var Decompress = function(Source, Destination, DestSize) {
		var hdr = getFileHeader(Source);

		var src = 0,
			dest = 0;

		if (Source == null)
			return -1;
		if (hdr.Signature != 0x315f4a59)
			return -1;
		if (hdr.UncompressedLength > DestSize)
			return -1;

		var tree_len = hdr.HuffmanTreeLength * 2;
		var bitptr = [0];
		var flag = new DataView(Source.buffer, Source.byteOffset + src + 16 + tree_len);

		var tree = [];
		for (var i = 0; i < tree_len + 1; i++) {
			tree.push({
				value: 0,
				lear: 0,
				level: 0,
				weight: 0,
				left: null,
				right: null
			});
		}
		tree[0].leaf = 0;
		tree[0].value = 0;
		tree[0].left = 1;
		tree[0].right = 2;
		for (var i = 1; i <= tree_len; i++) {
			tree[i].leaf = !get_bits(flag, bitptr, 1);
			tree[i].value = Source.getUint8(src + 15 + i);
			if (tree[i].leaf)
				tree[i].left = tree[i].right = null;
			else {
				tree[i].left = (tree[i].value << 1) + 1;
				tree[i].right = tree[i].left + 1;
			}
		}
		src += 16 + tree_len + (((tree_len & 0xf) ? (tree_len >> 4) + 1 : (tree_len >> 4)) << 1);

		for (i = 0; i < hdr.BlockCount; i++) {

			var header = getBlockHeader(new DataView(Source.buffer, Source.byteOffset + src));
			var headerPos = src;
			src += 4;
			if (!header.CompressedLength) {
				var hul = header.UncompressedLength;
				while (hul--) {
					Destination.setUint8(dest++, Source.getUint8(src++));
				}
				continue;
			}
			src += 20;
			bitptr = [0];
			for (;;) {
				var loop;
				if ((loop = get_loop(new DataView(Source.buffer, Source.byteOffset + src), bitptr, header)) == 0)
					break;
				while (loop--) {
					var nodeIndex = 0;
					for (; !tree[nodeIndex].leaf;) {
						if (get_bits(new DataView(Source.buffer, Source.byteOffset + src), bitptr, 1))
							nodeIndex = tree[nodeIndex].right;
						else
							nodeIndex = tree[nodeIndex].left;
					}
					Destination.setUint8(dest++, tree[nodeIndex].value);
				}

				if ((loop = get_loop(new DataView(Source.buffer, Source.byteOffset + src), bitptr, header)) == 0)
					break;

				while (loop--) {
					var count = get_count(new DataView(Source.buffer, Source.byteOffset + src), bitptr, header);
					var pos = get_bits(new DataView(Source.buffer, Source.byteOffset + src), bitptr, 2);
					pos = get_bits(new DataView(Source.buffer, Source.byteOffset + src), bitptr, header.LZSSOffsetCodeLengthTable[pos]);
					while (count--) {
						Destination.setUint8(dest, Destination.getUint8(dest - pos));
						dest++;
					}
				}
			}
			src = headerPos + header.CompressedLength;
		}

		return hdr.UncompressedLength;
	}


	window.PAL_YJ1 = {
		Decompress: Decompress
	};
})();