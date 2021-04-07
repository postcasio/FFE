import { Character } from "./Character";
import { ROM_OFFSET_INITIAL_NPC_EVENT_BITS } from "./Data/offsets";
import { Game } from "./Game";

export const EVENT_BIT_GO_TO_NARSHE_SCENE_AFTER_MAGITEK = 0x2fe;

interface PartyState {
  index: number;
  mapIndex: number;
  x: number;
  y: number;
}

export class Journal {
  eventBits: Uint8Array;
  battleBits: Uint8Array;
  game: Game;

  partyStates: PartyState[] = new Array(16)
    .fill(0)
    .map((n, i) => ({ index: i, mapIndex: 0, x: 0, y: 0 }));

  currentParty = 1;
  defaultParty = 1;

  get party() {
    return this.characters
      .filter((c) => c.party === this.currentParty)
      .map((c) => c.index);
  }

  characters: Character[] = new Array(16)
    .fill(0)
    .map((n, i) => new Character(i));

  constructor(game: Game) {
    this.game = game;
    this.eventBits = new Uint8Array(224);
    this.battleBits = new Uint8Array(20);

    const npcBits = game.rom.getArraySlice(
      ROM_OFFSET_INITIAL_NPC_EVENT_BITS,
      ROM_OFFSET_INITIAL_NPC_EVENT_BITS + 128
    );

    this.eventBits.set(npcBits, 96);
    this.getCharacter(0).setParty(0);
  }

  setEventBit(offset: number, bitValue: number | boolean = 1) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    const value = this.eventBits[byte];

    this.eventBits[byte] = (value & (~(1 << bit) & 0xff)) | (+bitValue << bit);
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

  setBattleBit(offset: number, bitValue: number | boolean = 1) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    const value = this.battleBits[byte];

    this.battleBits[byte] = (value & (~(1 << bit) & 0xff)) | (+bitValue << bit);
  }

  getBattleBit(offset: number) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    return (this.battleBits[byte] & (1 << bit)) !== 0;
  }

  clearBattleBit(offset: number) {
    const byte = Math.floor(offset / 8);
    const bit = offset % 8;

    const value = this.battleBits[byte];

    this.battleBits[byte] = value & ~(1 << bit);
  }

  setPartyMembers(party: number[]) {
    for (const char of this.characters) {
      if (char.party === this.currentParty) {
        char.party = undefined;
      }
    }

    for (const char of party) {
      this.characters[char].party = this.currentParty;
    }
  }

  getCharacter(index: number) {
    return this.characters[index];
  }

  getEventWord(offset: number) {
    return this.eventBits[offset] | (this.eventBits[offset + 1] << 8);
  }

  setEventWord(offset: number, value: number) {
    this.eventBits[offset + 1] = (value & 0xff00) >> 8;
    this.eventBits[offset] = value & 0xff;
  }

  setCurrentParty(partyIndex: number) {
    this.currentParty = partyIndex;
  }

  getPointCharacter() {
    for (const char of this.characters) {
      if (char.party === this.currentParty) {
        return char;
      }
    }

    return undefined;
  }

  getCharacterInParty(indexInParty: number) {
    const party = this.party;

    if (party.length <= indexInParty) {
      return undefined;
    }

    return party[indexInParty];
  }

  setPartyMapIndex(party: number, map: number) {
    this.partyStates[party].mapIndex = map;
  }

  setCurrentPartyMapIndex(map: number) {
    this.partyStates[this.currentParty].mapIndex = map;
  }

  setCurrentPartyXY(x: number, y: number) {
    this.partyStates[this.currentParty].x = x;
    this.partyStates[this.currentParty].y = y;
  }

  setDefaultParty(index: number) {
    this.defaultParty = index;
  }
}
