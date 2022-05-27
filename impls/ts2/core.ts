import { pr_str } from "./printer.js";
import {
  FALSE,
  LIST,
  MalBoolean,
  malBoolean,
  malFalse,
  malFunction,
  MalFunction,
  MalFunctionPrimitive,
  MalList,
  malList,
  malNil,
  malNumber,
  MalNumber,
  malSymbol,
  MalSymbol,
  malTrue,
  MalType,
} from "./types.js";

const map = new Map<string, MalFunction>();

map.set(
  "+",
  malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value + curr.value),
      malNumber(0)
    )) as MalFunctionPrimitive)
);

map.set(
  "-",
  malFunction(((...args: MalNumber[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return malNumber(acc.value - curr.value);
      }
    }, malNumber(0))) as MalFunctionPrimitive)
);

map.set(
  "*",
  malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value * curr.value),
      malNumber(1)
    )) as MalFunctionPrimitive)
);

map.set(
  "/",
  malFunction(((...args: MalNumber[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return malNumber(acc.value / curr.value);
      }
    }, malNumber(0))) as MalFunctionPrimitive)
);

map.set(
  "prn",
  malFunction((_: MalType) => {
    pr_str(_, true);
    return malNil();
  })
);

map.set(
  "list",
  malFunction((...args: MalType[]) => malList(args))
);

map.set(
  "list?",
  malFunction((_: MalType) => (_.type === LIST ? malTrue() : malFalse()))
);

map.set(
  "empty?",
  malFunction(((_: MalList) =>
    _.value.length === 0 ? malTrue() : malFalse()) as MalFunctionPrimitive)
);

map.set(
  "count",
  malFunction(((_: MalList) =>
    malNumber(_.value.length)) as MalFunctionPrimitive)
);

map.set(
  "=",
  malFunction(function compare(arg1: MalType, arg2: MalType): MalBoolean {
    if (arg1.type !== arg2.type) {
      return malFalse();
    } else if (arg1.type === LIST) {
      if (arg1.value.length !== (arg2 as MalList).value.length) {
        return malFalse();
      } else {
        for (let i = 0; i < arg1.value.length; i++) {
          if (
            compare(arg1.value[i], (arg2 as MalList).value[i]).type === FALSE
          ) {
            return malFalse();
          }
        }
        return malTrue();
      }
    } else {
      return malBoolean(arg1.value === arg2.value);
    }
  })
);

map.set(
  "<",
  malFunction(
    ((arg1: MalNumber, arg2: MalNumber): MalBoolean =>
      arg1.value < arg2.value ? malTrue() : malFalse()) as MalFunctionPrimitive
  )
);

map.set(
  "<=",
  malFunction(
    ((arg1: MalNumber, arg2: MalNumber): MalBoolean =>
      arg1.value <= arg2.value ? malTrue() : malFalse()) as MalFunctionPrimitive
  )
);

map.set(
  ">",
  malFunction(
    ((arg1: MalNumber, arg2: MalNumber): MalBoolean =>
      arg1.value > arg2.value ? malTrue() : malFalse()) as MalFunctionPrimitive
  )
);

map.set(
  ">=",
  malFunction(
    ((arg1: MalNumber, arg2: MalNumber): MalBoolean =>
      arg1.value >= arg2.value ? malTrue() : malFalse()) as MalFunctionPrimitive
  )
);

export default map;
