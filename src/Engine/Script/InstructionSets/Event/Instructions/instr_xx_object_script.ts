import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_xx_object_script({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const index = stream.next8();

  const arg = stream.next8();

  const wait = (arg & 0x80) !== 0;
  const count = arg & 0x7f;

  const ip = stream.ip;

  for (let i = 0; i < count; i++) {
    stream.next8();
  }

  context.disasm(
    "object_script",
    `#$${hex(index, 2)}${wait ? " @wait" : ""} ; ${count} instructions`,
    count
  );

  const object = game.mapEngine.getObject(index)!;

  object.loadObjectScript(Game.current.createObjectScriptContext(ip, object));

  if (wait) {
    context.waitForObject(object);
  }
}
