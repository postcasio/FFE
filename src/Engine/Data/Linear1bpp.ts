export const Linear1bpp = {
  colorDepth: 1,
  colorsPerPalette: 2,
  encode: function (data: Uint8Array, reverse = false) {
    // 8-bit source, 8-bit destination
    const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const dest = new Uint8Array(Math.ceil(data.byteLength / 8));

    let s = 0;
    let d = 0;
    let a;

    if (reverse) {
      while (s < src.length) {
        a = (src[s++] & 1) << 7;
        a |= (src[s++] & 1) << 6;
        a |= (src[s++] & 1) << 5;
        a |= (src[s++] & 1) << 4;
        a |= (src[s++] & 1) << 3;
        a |= (src[s++] & 1) << 2;
        a |= (src[s++] & 1) << 1;
        a |= src[s++] & 1;
        dest[d++] = a;
      }
    } else {
      while (s < src.length) {
        a = src[s++] & 1;
        a |= (src[s++] & 1) << 1;
        a |= (src[s++] & 1) << 2;
        a |= (src[s++] & 1) << 3;
        a |= (src[s++] & 1) << 4;
        a |= (src[s++] & 1) << 5;
        a |= (src[s++] & 1) << 6;
        a |= (src[s++] & 1) << 7;
        dest[d++] = a;
      }
    }

    return dest;
  },
  decode: function (data: Uint8Array, reverse = false) {
    // 8-bit source, 8-bit destination
    const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const dest = new Uint8Array(data.byteLength * 8);

    let s = 0;
    let d = 0;
    let c;

    if (reverse) {
      while (s < src.length) {
        c = src[s++];
        dest[d++] = (c >> 7) & 1;
        dest[d++] = (c >> 6) & 1;
        dest[d++] = (c >> 5) & 1;
        dest[d++] = (c >> 4) & 1;
        dest[d++] = (c >> 3) & 1;
        dest[d++] = (c >> 2) & 1;
        dest[d++] = (c >> 1) & 1;
        dest[d++] = (c >> 0) & 1;
      }
    } else {
      while (s < src.length) {
        c = src[s++];
        dest[d++] = (c >> 0) & 1;
        dest[d++] = (c >> 1) & 1;
        dest[d++] = (c >> 2) & 1;
        dest[d++] = (c >> 3) & 1;
        dest[d++] = (c >> 4) & 1;
        dest[d++] = (c >> 5) & 1;
        dest[d++] = (c >> 6) & 1;
        dest[d++] = (c >> 7) & 1;
      }
    }

    return dest;
  },
};
