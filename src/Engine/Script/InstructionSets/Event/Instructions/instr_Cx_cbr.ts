import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

enum ConditionOperator {
  And = 0,
  Or = 1,
}

enum ConditionType {
  Clear,
  Set,
}

export function instr_Cx_cbr({
  stream,
  game,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const conditionCount = (instruction & 0x7) + 1;
  const conditionOperator =
    (instruction & 0x8) !== 0 ? ConditionOperator.Or : ConditionOperator.And;

  const conditionDisasm = [];
  const conditions = [];

  for (let i = 0; i < conditionCount; i++) {
    let condition = stream.next16();
    let type = ConditionType.Clear;

    if ((condition & 0x8000) !== 0) {
      condition = condition & 0x7fff;
      type = ConditionType.Set;
    }

    conditionDisasm.push(
      `${type === ConditionType.Clear ? "!" : ""}e$${hex(condition, 3)}`
    );
    conditions.push({ condition, type });
  }

  const offset = stream.next24();

  context.disasm(
    `cbr`,
    `(${conditionDisasm.join(
      conditionOperator === ConditionOperator.And ? " && " : " || "
    )}) $${hex(offset, 6)}`
  );

  const shouldBranch = conditions.reduce((result, condition) => {
    let bit = game.journal.getEventBit(condition.condition);

    if (condition.type === ConditionType.Clear) {
      bit = !bit;
    }

    return conditionOperator === ConditionOperator.And
      ? result && bit
      : result || bit;
  }, true);

  if (shouldBranch) {
    context.jump(offset);
  }
}
