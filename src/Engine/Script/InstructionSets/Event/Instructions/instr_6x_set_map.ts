import { FadingDirection } from "@/src/Engine/Fader";
import {
  OBJECT_ID_CHAR0,
  OBJECT_ID_PARTY1,
  ZLevel,
} from "@/src/Engine/Map/MapObject";
import { Direction } from "../../../Direction";
import { VehicleType } from "../../../VehicleType";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_6x_set_map({
  stream,
  game,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const mapArg = stream.next16();
  const x = stream.next8();
  const y = stream.next8();
  const options = stream.next8();
  const setParentMap = (mapArg & 0x200) !== 0;
  const zlevel = (mapArg & 0x400) !== 0 ? ZLevel.Upper : ZLevel.Lower;
  const showMapTitle = (mapArg & 0x800) !== 0;
  const mapIndex = mapArg & 0x1ff;

  const facingDirection = (mapArg & 0x3000) >> 12;

  const vehicle = options & 0x3;

  const noSizeUpdate = (options & 0x20) !== 0;
  const fadeIn = (options & 0x40) === 0;
  const enableMapEvent = (options & 0x80) !== 0;
  const fadeOut = instruction !== 0x6b;

  const disasmOpts = [];
  if (noSizeUpdate) disasmOpts.push("@no_size_update");
  if (fadeIn) disasmOpts.push("@fadein");
  if (enableMapEvent) disasmOpts.push("@enable_map_event");
  if (showMapTitle) disasmOpts.push("@show_map_title");
  if (fadeOut) disasmOpts.push("@fadeout");

  context.disasm(
    "set_map",
    `#${mapIndex} #${x} #${y} @${ZLevel[zlevel].toLowerCase()} @${Direction[
      facingDirection
    ].toLowerCase()} @${VehicleType[vehicle].toLowerCase()} ${disasmOpts.join(
      " "
    )}`
  );

  game.mapEngine.loadMap(mapIndex, enableMapEvent);
  const object = game.mapEngine.getObject(OBJECT_ID_PARTY1);
  object?.setPosition(x, y);
  object?.setZLevel(zlevel);
  game.mapEngine.updateCamera(true);

  if (fadeIn) {
    game.fader.fade(FadingDirection.In, 2);
  }
}
