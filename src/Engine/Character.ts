import { Game } from "./Game";

export class Character {
  index: number;
  party?: number;

  name = "??????";

  constructor(index: number) {
    this.index = index;
  }

  setNameFromROM(index: number) {
    SSj.log(
      `Setting character ${
        this.index
      } name to ${index}: ${Game.current.rom.getCharacterName(index)}`
    );
    this.name = Game.current.rom.getCharacterName(index);
  }

  getName() {
    return this.name;
  }

  setParty(party: number) {
    this.party = party;
  }

  getParty() {
    return this.party;
  }
}
