/*
 *  ffe
 *  (c) 2020 casiotone
 */

import Thread from "thread";
import { Game } from "./Engine/Game";
import { ExpansionRAM, ROM } from "./Engine/Data/ROM";

const ROM_PATH = "@/assets/roms/ff3u.sfc";

export default class FFE extends Thread {
  rom: ROM;

  constructor() {
    super();

    this.rom = new ROM(ROM_PATH);
  }

  async start() {
    SSj.log(
      `${this.rom.getName()} (${(this.rom.getSize() / 1024).toFixed(2)} KB)`
    );
    SSj.log(
      `Maker: ${this.rom.makerCode
        .toString(16)
        .padStart(4, "0")} Game: ${this.rom.gameCode
        .toString(16)
        .padStart(8, "0")} Expansion RAM: ${
        ExpansionRAM[this.rom.expansionRam]
      }`
    );

    const game = new Game(this.rom);

    await game.init();

    // Load 'darkness' map
    game.mapEngine.loadMap(3);

    // Load game start script. This will trigger the title scene.
    game.scriptEngine.currentScript = game.createScriptContext(0x0003);

    Dispatch.onRender(() => {
      game.render();
    });

    Dispatch.onUpdate(() => {
      game.update();
    });
  }
}
