import { ROM_OFFSET_INITIAL_NPC_EVENT_BITS } from "./Data/offsets";
import { Game } from "./Game";

export const EVENT_BIT_GO_TO_NARSHE_SCENE_AFTER_MAGITEK = 0x2fe;

export class Journal {
  eventBits: Uint8Array;
  game: Game;
  party: [number, number, number, number] = [0xff, 0xff, 0xff, 0xff];

  constructor(game: Game) {
    this.game = game;
    this.eventBits = new Uint8Array(224);

    const npcBits = game.rom.getArraySlice(
      ROM_OFFSET_INITIAL_NPC_EVENT_BITS,
      ROM_OFFSET_INITIAL_NPC_EVENT_BITS + 128
    );

    this.eventBits.set(npcBits, 96);
  }

  setEventBit(offset: number) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    const value = this.eventBits[byte];

    this.eventBits[byte] = value | (1 << bit);
  }

  getEventBit(offset: number) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    return (this.eventBits[byte] & (1 << bit)) !== 0;
  }

  clearEventBit(offset: number) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    const value = this.eventBits[byte];

    this.eventBits[byte] = value & ~(1 << bit);
  }

  setPartyMembers(party: [number, number, number, number]) {
    this.party = party;
  }
}
