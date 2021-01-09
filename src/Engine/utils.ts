export function hex(value: number, len: number) {
  return value.toString(16).padStart(len, "0");
}

export function signed8(byte: number) {
  return byte & 0x80 ? byte - 0x100 : byte;
}
