export const ByteSwap = {
  encode: function (data: Uint8Array, width?: number) {
    if (!width) return data.slice().reverse();
    const src = data;
    let s = 0;
    const dest = new Uint8Array(data.length);
    let d = 0;
    for (let i = 0; i < src.length; i++) {
      d = s + width - 1;
      for (let b = 0; b < width; b++) dest[d--] = src[s++];
    }
    return dest;
  },
  decode: function (data: Uint8Array, width?: number) {
    if (!width) return data.slice().reverse();
    const src = data;
    let s = 0;
    const dest = new Uint8Array(data.length);
    let d = 0;
    for (let i = 0; i < src.length; i++) {
      d = s + width - 1;
      for (let b = 0; b < width; b++) dest[d--] = src[s++];
    }
    return dest;
  },
};
