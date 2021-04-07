import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_47_create_party_object({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  context.disasm("create_party_object", "");

  SSj.log(Game.current.journal.party);

  const player = Game.current.mapEngine.getPlayerObject()!;

  for (const charIndex of Game.current.journal.party) {
    const char = Game.current.journal.getCharacter(charIndex);

    const map = Game.current.mapEngine;
    const object = map.getObject(charIndex)!;
    object.setExists(true);
    object.loadPalette(0);
    object.loadSprite(charIndex);
    object.setPosition(player.x, player.y);
    object.setZLevel(player.zLevel);
    object.setVisible(true);
  }
}
