import { pr_str } from "./printer.js";
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
  malString,
  MalString,
  malSymbol,
  MalSymbol,
  malTrue,
  MalType,
  NIL,
  STRING,
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
    } else if (arg1.type === STRING) {
      return malBoolean(pr_str(arg1, true) === pr_str(arg2 as MalString, true));
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
    read_str(pr_str(_, true))) as MalFunctionPrimitive)
);

map.set(
  "slurp",
  malFunction(((fileName: MalString) => {
    const unwrappedName = pr_str(fileName, true).slice(1, -1);
    const fileContent = fs.readFileSync(unwrappedName, { encoding: "utf-8" });
    return read_string_to_mal_string(`"${fileContent}"`);
  }) as MalFunctionPrimitive)
);

map.set(
  "prn",
  malFunction((..._: MalType[]) => {
    if (_.length === 0) {
      console.log("");
      return malNil();
    }
    console.log(_.map((val) => pr_str(val, true)).join(" "));
    return malNil();
  })
);

map.set(
  "pr-str",
  malFunction(((...args: MalType[]) => {
    if (args.length === 0) {
      return read_string_to_mal_string('""');
    }
    const str = `"${args.map((a) => `${pr_str(a, true)}`).join(" ")}"`;
    // I have no goddamn idea what MAL creator wants from me with the string stuff.
    // I don't understand why tests are written this way. There's NOWHERE a mention of escaping that I have to do somewhere. But the tests for pr-str are hinting towards it
    return read_string_to_mal_string(escape_str(str));
  }) as MalFunctionPrimitive)
);

map.set(
  "println",
  malFunction(((...args: MalType[]) => {
    if (args.length === 0) {
      console.log("");
      return malNil();
    }
    // here we don't need to have additional double-quotes at the beginning and at the end, like in pr-str
    console.log(`${args.map((a) => pr_str(a, false)).join(" ")}`);
    return malNil();
  }) as MalFunctionPrimitive)
);

map.set(
  "str",
  malFunction(((...args: MalString[]) => {
    if (args.length === 0) {
      return read_string_to_mal_string(`""`);
    }
    // I have no goddamn idea what MAL creator wants from me with the string stuff.
    // I don't understand why tests are written this way. There's NOWHERE a mention of escaping that I have to do somewhere. But the tests for pr-str are hinting towards it
    const str = `"${args.map((a) => pr_str(a, false)).join("")}"`;
    return read_string_to_mal_string(escape_str(str));
  }) as MalFunctionPrimitive)
);

const escape_str = (_: string): string => {
  const elements = _.slice(1, -1).split("");
  return `"${elements
    .map((val) => {
      switch (val) {
        case '"': {
          return '\\"';
        }
        case "\\": {
          return "\\\\";
        }
        case "\n": {
          return "\\n";
        }
        default:
          return val;
      }
    })
    .join("")}"`;
};

export default map;
