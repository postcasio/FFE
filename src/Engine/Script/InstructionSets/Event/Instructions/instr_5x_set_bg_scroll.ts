import { Game } from "@/src/Engine/Game";
import { LayerType } from "@/src/Engine/Map/Layer";
import { hex, signed8 } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_5x_set_bg_scroll({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const x = stream.next8();
  const y = stream.next8();

  const layerTags: Record<number, string> = {
    0x5d: "@bg1",
    0x5e: "@bg2",
    0x5f: "@bg3",
  };

  const layers = Game.current.mapEngine.layers;
  let layer;
  switch (instruction) {
    case 0x5d:
      layer = layers[LayerType.BG1];
      break;
    case 0x5e:
      layer = layers[LayerType.BG2];
      break;
    case 0x5f:
      layer = layers[LayerType.BG3];
      break;
    default:
      throw "invalid";
  }

  layer.shiftX = signed8(x);
  layer.shiftY = signed8(y);

  context.disasm(
    "set_bg_scroll",
    `${layerTags[instruction]} #$${hex(x, 2)} #$${hex(y, 2)}`
  );
}
