import { hirom, ROM_OFFSET_EVENT_SCRIPTS } from "../Data/offsets";
import { Slice } from "../Data/ROM";

export class Trigger {
  offset: number;
  x: number;
  y: number;
  eventPointer: number;

  constructor(slice: Slice) {
    this.offset = slice.offset;

    this.x = slice.data[0];
    this.y = slice.data[1];
    this.eventPointer =
      slice.data[2] | (slice.data[3] << 8) | (slice.data[4] << 16);
  }
}
