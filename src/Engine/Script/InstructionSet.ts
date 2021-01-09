import { ROM } from "@/src/Engine/Data/ROM";
import { Game } from "../Game";
import { InstructionStream } from "./InstructionStream";
import { ScriptContext } from "./ScriptContext";

export interface InstructionHandlerPayload<
  T extends InstructionSet = InstructionSet,
  P extends any = any
> {
  game: Game;
  context: ScriptContext<T, P>;
  stream: InstructionStream;
  payload: P;
}

export type InstructionHandler<
  T extends InstructionSet = InstructionSet,
  P extends any = any
> = (args: InstructionHandlerPayload<T, P>) => void;

export interface InstructionSet<P extends any = any> {
  disasmPrefix: string;
  getInstructionHandler(
    instruction: number
  ): InstructionHandler<InstructionSet, P> | undefined;
  createInstructionStream(rom: ROM): InstructionStream;
}
