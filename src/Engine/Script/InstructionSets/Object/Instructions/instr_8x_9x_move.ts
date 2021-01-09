import { Speed } from "@/src/Engine/Map/NPCData";
import Tween, { Easing } from "tween";
import { DiagonalDirection, Direction } from "../../../Direction";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

interface DiagonalCommandProps {
  direction: DiagonalDirection;
  tiles: [number, number];
}

const diagonalCommandMap: Record<number, DiagonalCommandProps> = {
  0xa0: { direction: DiagonalDirection.RightUp, tiles: [1, 1] },
  0xa1: { direction: DiagonalDirection.RightDown, tiles: [1, 1] },
  0xa2: { direction: DiagonalDirection.LeftDown, tiles: [1, 1] },
  0xa3: { direction: DiagonalDirection.LeftUp, tiles: [1, 1] },
  0xa4: { direction: DiagonalDirection.RightUp, tiles: [1, 2] },
  0xa5: { direction: DiagonalDirection.RightUp, tiles: [2, 1] },
  0xa6: { direction: DiagonalDirection.RightDown, tiles: [1, 2] },
  0xa7: { direction: DiagonalDirection.RightDown, tiles: [2, 1] },
  0xa8: { direction: DiagonalDirection.LeftDown, tiles: [1, 2] },
  0xa9: { direction: DiagonalDirection.LeftDown, tiles: [2, 1] },
  0xaa: { direction: DiagonalDirection.LeftUp, tiles: [2, 1] },
  0xab: { direction: DiagonalDirection.LeftUp, tiles: [1, 2] },
};

export function instr_8x_9x_move({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  let { x, y } = object;
  let tiles = 1;

  if (instr >= 0x80 && instr <= 0x9f) {
    const direction = instr & 0x3;
    tiles = ((instr & 0x1c) >> 2) + 1;

    context.disasm("move", `@${Direction[direction].toLowerCase()} #${tiles}`);

    context.waitForPromise(object.move(direction, tiles));

    // switch (direction) {
    //   case Direction.Up:
    //     y -= 1 * tiles;
    //     break;
    //   case Direction.Down:
    //     y += 1 * tiles;
    //     break;
    //   case Direction.Left:
    //     x -= 1 * tiles;
    //     break;
    //   case Direction.Right:
    //     x += 1 * tiles;
    //     break;
    // }
  } else if (instr >= 0xa0 && instr <= 0xab) {
    const command = diagonalCommandMap[instr];

    context.disasm(
      "move",
      `@${DiagonalDirection[
        command.direction
      ].toLowerCase()} @${command.tiles.join("x")}`
    );

    const xOffset = command.tiles[0] * 1;
    const yOffset = command.tiles[1] * 1;

    switch (command.direction) {
      case DiagonalDirection.LeftDown:
        x -= xOffset;
        y += yOffset;
        break;
      case DiagonalDirection.LeftUp:
        x -= xOffset;
        y -= yOffset;
        break;
      case DiagonalDirection.RightDown:
        x += xOffset;
        y += yOffset;
        break;
      case DiagonalDirection.RightUp:
        x += xOffset;
        y -= yOffset;
        break;
    }

    let tps = 1;

    switch (object.speed) {
      case Speed.Slowest:
        tps = 1;
        break;
      case Speed.Slow:
        tps = 2;
        break;
      case Speed.Normal:
        tps = 3;
        break;
      case Speed.Fast:
        tps = 5;
        break;
      case Speed.Faster:
        tps = 8;
        break;
      case Speed.Fastest:
        tps = 12;
        break;
    }

    context.waitForPromise(
      new Tween(object, Easing.Linear).easeIn({ x, y }, (60 / tps) * tiles)
    );
  }
}
