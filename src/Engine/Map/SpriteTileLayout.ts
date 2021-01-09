import { ROM } from "@/src/Engine/Data/ROM";

export class SpriteTileLayout {
  data: Uint8Array;
  tiles: Uint16Array = new Uint16Array(6);

  constructor(data: Uint8Array) {
    this.data = data;
    for (let i = 0; i < this.tiles?.length; i++) {
      this.tiles[i] = (data[i * 2] | (data[i * 2 + 1] << 8)) / 32;
    }
  }

  getTile(index: number) {
    return this.tiles[index];
  }

  static fromROM(rom: ROM, index: number) {
    return new SpriteTileLayout(rom.getSpriteTileLayout(index));
  }
}
