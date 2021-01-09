import { ROM } from "@/src/Engine/Data/ROM";
import { hex } from "@/src/Engine/utils";
import { Direction } from "../Script/Direction";

export enum MovementType {
  None = 0,
  Script = 1,
  User = 2,
  Random = 3,
}

export enum Speed {
  Slowest = 0,
  Slow = 1,
  Normal = 2,
  Fast = 3,
  Faster = 4,
  Fastest = 5,
}

export const tilesPerSecondMap = {
  [Speed.Slowest]: 1,
  [Speed.Slow]: 2,
  [Speed.Normal]: 3,
  [Speed.Fast]: 4,
  [Speed.Faster]: 8,
  [Speed.Fastest]: 12,
};

export class NPCData {
  data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  static fromROM(rom: ROM, index: number) {
    const data = rom.getNPCData(index);

    const count = data.length / 0x09;

    const npcs = [];

    for (let i = 0; i < count; i++) {
      npcs.push(new NPCData(data.slice(i * 0x09, (i + 1) * 0x09)));
    }

    return npcs;
  }

  get eventAddress() {
    return (
      this.data[0x00] |
      (this.data[0x01] << 8) |
      ((this.data[0x02] & 0x03) << 16)
    );
  }

  get paletteIndex() {
    return (this.data[0x02] & 0x1c) >> 2;
  }

  get movementType(): MovementType {
    return this.data[0x07] & 0xf;
  }

  get speed() {
    return (this.data[0x05] & 0xc0) >> 6;
  }

  get spriteIndex() {
    return this.data[0x06];
  }

  get direction(): Direction {
    return this.data[0x08] & 0x03;
  }

  get showInVehicle() {
    return (this.data[0x04] & 0x80) !== 0 ? true : false;
  }

  get size() {
    return ((this.data[0x08] & 0x04) >> 2) * 16 + 16;
  }

  get x() {
    return this.data[0x04] & 0x7f;
  }

  get y() {
    return this.data[0x05] & 0x3f;
  }

  get eventBit() {
    return (((this.data[0x02] | (this.data[0x03] << 8)) & 0xffc0) >> 6) + 0x300;
  }
}
