export const Snes2bpp = {
  colorDepth: 2,
  colorsPerPalette: 4,
  encode: function (data: Uint8Array) {
    // 8-bit source, 8-bit destination
    const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const dest = new Uint8Array(Math.ceil(data.byteLength / 64) * 16);

    let s = 0;
    let d = 0;
    let c, r, b, bp;

    while (s < src.length) {
      for (r = 0; r < 8; r++) {
        bp = [0, 0];
        for (b = 7; b >= 0; b--) {
          c = src[s++] || 0;
          bp[0] |= (c & 1) << b;
          c >>= 1;
          bp[1] |= (c & 1) << b;
        }
        dest[d++] = bp[0];
        dest[d++] = bp[1];
      }
    }
    return new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength);
  },
  decode: function (data: Uint8Array) {
    // 16-bit source, 8-bit destination
    const src = new Uint16Array(
      data.buffer,
      data.byteOffset,
      data.byteLength >> 1
    );
    const dest = new Uint8Array(data.byteLength * 4);

    let s = 0;
    let d = 0;
    let bp, c, r, b;

    while (s < src.length) {
      for (r = 0; r < 8; r++) {
        bp = src[s++];
        for (b = 0; b < 8; b++) {
          c = bp & 0x8080;
          c >>= 7;
          c |= c >> 7;
          c &= 0x03;
          dest[d++] = c;
          bp <<= 1;
        }
      }
    }
    return dest;
  },
};
