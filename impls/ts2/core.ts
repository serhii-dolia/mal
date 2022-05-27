import { pr_str, toString } from "./printer.js";
import { read_str, read_string_to_mal_string } from "./reader.js";
import * as fs from "node:fs";
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
  MalNil,
  malNil,
  malNumber,
  MalNumber,
  MalString,
  malSymbol,
  MalSymbol,
  malTrue,
  MalType,
  NIL,
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
  malFunction(
    ((_: MalList | MalNil): MalNumber =>
      _.type === NIL
        ? malNumber(0)
        : malNumber(_.value.length)) as MalFunctionPrimitive
  )
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

map.set(
  "read-string",
  malFunction(((_: MalString) =>
    read_str(toString(_, true))) as MalFunctionPrimitive)
);

map.set(
  "slurp",
  malFunction(((fileName: MalString) => {
    const unwrappedName = toString(fileName, true).slice(1, -1);
    const fileContent = fs.readFileSync(unwrappedName, { encoding: "utf-8" });
    return read_string_to_mal_string(`"${fileContent}"`);
  }) as MalFunctionPrimitive)
);

// map.set(
//   "pr-str",
//   malFunction(((...args: MalString[]) => {
//     if (args.length === 0) {
//       return read_string('""');
//     }
//     const str = args.map((a) => `"${toString(a, true)}"`).join("");
//     return read_string(str);
//   }) as MalFunctionPrimitive)
// );

export default map;
