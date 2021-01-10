import { ROM_OFFSET_EVENT_SCRIPTS } from "../Data/offsets";
import { ROM } from "@/src/Engine/Data/ROM";
import { hex } from "../utils";

export class InstructionStream {
  ip = 0;
  rom: ROM;
  offset: number;

  constructor(rom: ROM, offset: number) {
    this.rom = rom;
    SSj.log(`Creating instruction stream at ${hex(offset, 6)}`);
    this.offset = offset;
  }

  get rawIP() {
    return this.offset + this.ip;
  }

  set rawIP(value: number) {
    this.ip = value - this.offset;
  }

  seek(ip: number) {
    this.ip = ip;
  }

  next8() {
    return this.rom.getUint8(this.rawIP++);
  }

  peek8() {
    return this.rom.getUint8(this.rawIP);
  }

  next16() {
    const value = this.rom.getUint16(this.rawIP);
    this.rawIP += 2;

    return value;
  }

  next24() {
    const value =
      this.rom.getUint16(this.rawIP) |
      (this.rom.getUint8(this.rawIP + 2) << 16);

    this.rawIP += 3;

    return value;
  }

  peek16() {
    return this.rom.getUint16(this.rawIP);
  }
}
