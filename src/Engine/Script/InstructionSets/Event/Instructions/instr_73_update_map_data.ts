import { Game } from "@/src/Engine/Game";
import { LayerType } from "@/src/Engine/Map/Layer";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_73_update_map_data({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const x = stream.next8();
  const yp = stream.next8();
  const y = yp & 0x3f;
  const w = stream.next8();
  const h = stream.next8();
  const data = [];

  for (let i = 0; i < w * h; i++) {
    data.push(stream.next8());
  }

  // 73 xx yy rr cc data...  $C0AC45     Copy data of size rr*cc to current map's BG0 at (xx, yy) and refresh background
  // 74 xx yy rr cc data...  $C0AC62     Copy data of size rr*cc to current `'s BG0 at (xx, yy)
  SSj.log(data);
  context.disasm("update_map_data", `#${x} #${y} #${w} #${h} ...`, data.length);

  const layer = Object.values(Game.current.mapEngine.layers)[(yp & 0xc0) >> 6];

  layer.setArea(x, y, w, h, data);

  if (instr === 0x73) layer.applyPendingModifications();
}
