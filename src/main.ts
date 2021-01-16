/*
 *  ffe
 *  (c) 2020 casiotone
 */

import Thread from "thread";
import { Game } from "./Engine/Game";
import { ExpansionRAM, ROM } from "./Engine/Data/ROM";
import { FadingDirection } from "./Engine/Fader";
import {
  OBJECT_ID_CAMERA,
  OBJECT_ID_CHAR0,
  OBJECT_ID_CHAR1,
  OBJECT_ID_PARTY1,
  ZLevel,
} from "./Engine/Map/MapObject";
import Prim from "prim";
import { Speed } from "./Engine/Map/NPCData";
import { RidingType } from "./Engine/Script/RidingType";

const ROM_PATH = "@/assets/roms/ff3u.sfc";

export default class FFE extends Thread {
  rom: ROM;

  constructor() {
    super();

    // this.rom = new ROM(ROM_PATH);
    this.rom = new ROM("@/assets/roms/Final Fantasy III (USA) (Rev 1).sfc");
    // this.rom = new ROM("@/assets/roms/ff3-skip-intro-1.sfc");
    // this.rom = new ROM("@/assets/roms/ff6mobliz.sfc");
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
    // game.mapEngine.loadMap(3);
    // game.scriptEngine.run(0x0003);

    game.mapEngine.loadMap(50);
    game.mapEngine.cameraLocked = false;
    game.journal.setPartyMembers([0x00]);
    const object = game.mapEngine.getObject(OBJECT_ID_PARTY1)!;
    object.zLevel = ZLevel.Lower;
    object.exists = true;
    object.visible = true;
    object.loadPalette(2);
    object.loadSprite(0);
    object.x = 55;
    object.y = 12;
    object.collision = true;
    object.speed = Speed.Normal;
    game.mapEngine.updateCamera(true);
    game.mapEngine.refreshObjects();
    game.fader.fade(FadingDirection.In, 2);

    Dispatch.onRender(() => {
      game.render();
    });

    Dispatch.onUpdate(() => {
      game.update();
    });
  }
}
