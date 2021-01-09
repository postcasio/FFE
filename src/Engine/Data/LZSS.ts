export function encodeLZSS(data: Uint8Array) {
  // create a source buffer preceded by 2K of empty space (this increases compression for some data)
  const src = new Uint8Array(0x0800 + data.length);
  src.set(data, 0x0800);
  let s = 0x0800; // start at 0x0800 to ignore the 2K of empty space

  const dest = new Uint8Array(0x10000);
  let d = 2; // start at 2 so we can fill in the length at the end

  let header = 0;
  const line = new Uint8Array(17);

  let l = 1; // start at 1 so we can fill in the header at the end
  let b = 0x07de; // buffer position
  let p = 0;
  let pMax, len, lenMax;

  let w;
  let mask = 1;

  while (s < src.length) {
    // find the longest sequence that matches the decompression buffer
    lenMax = 0;
    pMax = 0;
    for (p = 1; p <= 0x0800; p++) {
      len = 0;

      while (
        len < 34 &&
        s + len < src.length &&
        src[s + len - p] === src[s + len]
      )
        len++;

      if (len > lenMax) {
        // this sequence is longer than any others that have been found so far
        lenMax = len;
        pMax = (b - p) & 0x07ff;
      }
    }

    // check if the longest sequence is compressible
    if (lenMax >= 3) {
      // sequence is compressible - add compressed data to line buffer
      w = ((lenMax - 3) << 11) | pMax;
      line[l++] = w & 0xff;
      w >>= 8;
      line[l++] = w & 0xff;
      s += lenMax;
      b += lenMax;
    } else {
      // sequence is not compressible - update header byte and add byte to line buffer
      header |= mask;
      line[l++] = src[s];
      s++;
      b++;
    }

    b &= 0x07ff;
    mask <<= 1;

    if (mask == 0x0100) {
      // finished a line, copy it to the destination
      line[0] = header;

      dest.set(line.subarray(0, l), d);
      d += l;
      header = 0;
      l = 1;
      mask = 1;
    }
  }

  if (mask !== 1) {
    // we're done with all the data but we're still in the middle of a line
    line[0] = header;
    dest.set(line.subarray(0, l), d);
    d += l;
  }

  // fill in the length
  dest[0] = d & 0xff;
  dest[1] = (d >> 8) & 0xff;

  return [dest.slice(0, d), s - 0x0800];
}

export function decodeLZSS(
  data: Uint8Array
): { data: Uint8Array; compressedLength: number; error?: string } {
  const src = data;
  let s = 0; // source pointer
  const dest = new Uint8Array(0x10000);
  let d = 0; // destination pointer
  const buffer = new Uint8Array(0x0800);
  let b = 0x07de;
  const line = new Uint8Array(34);
  let header, pass, r, w, c, i, l;

  const length = src[s++] | (src[s++] << 8);

  while (s < length) {
    // read header
    header = src[s++];

    for (pass = 0; pass < 8; pass++, header >>= 1) {
      l = 0;
      if (header & 1) {
        // single byte (uncompressed)
        c = src[s++];
        line[l++] = c;
        buffer[b++] = c;
        b &= 0x07ff;
      } else {
        // 2-bytes (compressed)
        w = src[s++];
        w |= src[s++] << 8;
        r = (w >> 11) + 3;
        w &= 0x07ff;

        for (i = 0; i < r; i++) {
          c = buffer[(w + i) & 0x07ff];
          line[l++] = c;
          buffer[b++] = c;
          b &= 0x07ff;
        }
      }
      if (d + l > dest.length) {
        // maximum buffer length exceeded
        dest.set(line.subarray(0, dest.length - d), d);
        return {
          data: dest.slice(0, d),
          compressedLength: s,
          error: "max-buffer-len-exceeded",
        };
      } else {
        // copy this pass to the destination buffer
        dest.set(line.subarray(0, l), d);
        d += l;
      }

      // reached end of compressed data
      if (s >= length) break;
    }
  }

  data = data.subarray(0, s);

  return {
    data: dest.slice(0, d),
    compressedLength: s,
  };
}
