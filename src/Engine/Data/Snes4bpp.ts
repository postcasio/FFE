function makeLong(a: number, b: number) {
  return (a & 0xffff) | ((b & 0xffff) << 16);
}

export const Snes4bpp = {
  colorDepth: 4,
  colorsPerPalette: 16,
  encode: function (data: Uint8Array) {
    // 8-bit source, 8-bit destination
    const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const dest = new Uint8Array(Math.ceil(data.byteLength / 64) * 32);

    let s = 0;
    let d = 0;
    let c, bp;

    while (s < src.length) {
      for (let r = 0; r < 8; r++) {
        bp = [0, 0, 0, 0];
        for (let b = 7; b >= 0; b--) {
          c = src[s++] || 0;
          bp[0] |= (c & 1) << b;
          c >>= 1;
          bp[1] |= (c & 1) << b;
          c >>= 1;
          bp[2] |= (c & 1) << b;
          c >>= 1;
          bp[3] |= (c & 1) << b;
        }
        dest[d] = bp[0];
        dest[d + 1] = bp[1];
        dest[d + 16] = bp[2];
        dest[d + 17] = bp[3];
        d += 2;
      }
      d += 16;
    }
    return dest;
  },
  decode: function (data: Uint8Array) {
    // 16-bit source, 8-bit destination
    const src = new Uint16Array(
      data.buffer,
      data.byteOffset,
      data.byteLength >> 1
    );
    const dest = new Uint8Array(data.byteLength * 2);

    let s = 0;
    let d = 0;
    let bp12: number, bp34: number, bp: number, c: number, r: number, b: number;

    while (s < src.length) {
      for (r = 0; r < 8; r++) {
        bp34 = src[s + 8] || 0;
        bp12 = src[s++] || 0;
        bp = makeLong(bp12, bp34);
        for (b = 0; b < 8; b++) {
          c = bp & 0x80808080;
          c >>= 7;
          c |= c >> 7;
          c |= c >> 14;
          c &= 0x0f;
          dest[d++] = c;
          bp <<= 1;
        }
      }
      s += 8;
    }
    return dest;
  },
};
