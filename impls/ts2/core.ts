import { pr_str } from "./printer.js";
import { read_str, read_string_to_mal_string } from "./reader.js";

import {
  ATOM,
  createHMKey,
  FALSE,
  FUNCTION,
  HASHMAP,
  HashMapPair,
  KEYWORD,
  LIST,
  MalAtom,
  malAtom,
  MalBoolean,
  malBoolean,
  malFalse,
  malFunction,
  MalFunction,
  MalFunctionPrimitive,
  MalHashMap,
  malHashMap,
  MalHashMapValue,
  malKeyword,
  MalKeyword,
  MalList,
  malList,
  MalNil,
  malNil,
  malNumber,
  MalNumber,
  MalSingleType,
  malString,
  MalString,
  malSymbol,
  MalSymbol,
  MalTCOFunction,
  malTrue,
  MalType,
  malVector,
  MalVector,
  NIL,
  NUMBER,
  STRING,
  SYMBOL,
  tcoFunction,
  TCO_FUNCTION,
  TRUE,
  ValueType,
  VECTOR,
} from "./types.js";
import { MalError } from "./mal_error.js";

import * as fs from "node:fs";
import { rl } from "./readline.js";

const getCheckFunction = (type: ValueType[]): MalFunction =>
  malFunction((_: MalType) => {
    return type.includes(_.type) ? malTrue() : malFalse();
  });

const malStringToString = (_: MalString): string => _.value;

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
    const compare_list_or_vector = (
      arg1: MalList | MalVector,
      arg2: MalList | MalVector
    ): MalBoolean => {
      if (arg1.value.length !== arg2.value.length) {
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
    };
    if (arg1.type !== arg2.type) {
      if (
        (arg1.type === LIST && arg2.type === VECTOR) ||
        (arg1.type === VECTOR && arg2.type === LIST)
      ) {
        return compare_list_or_vector(arg1, arg2);
      }
      return malFalse();
    } else if (arg1.type === LIST || arg1.type === VECTOR) {
      return compare_list_or_vector(arg1, arg2 as MalList | MalVector);
    } else if (arg1.type === HASHMAP) {
      const hm1 = arg1.value;
      const hm2 = (arg2 as MalHashMap).value;
      const e1 = Array.from(hm1.entries());
      const e2 = Array.from(hm2.entries());
      if (e1.length === e2.length) {
        for (const [k1, v1] of e1) {
          const v2 = hm2.get(k1);
          if (!v2) {
            return malFalse();
          }
          if (compare(v2, v1).type === FALSE) {
            return malFalse();
          }
        }
        return malTrue();
      }
      return malFalse();
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
    read_str(pr_str(_, false))) as MalFunctionPrimitive)
);

map.set(
  "slurp",
  malFunction(((fileName: MalString) => {
    const unwrappedName = pr_str(fileName, true).slice(1, -1);
    const fileContent = fs.readFileSync(unwrappedName, { encoding: "utf-8" });
    return read_string_to_mal_string(escape_str(fileContent));
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
    const str = `${args.map((a) => `${pr_str(a, true)}`).join(" ")}`;
    // I have no goddamn idea what MAL creator wants from me with the string stuff.
    // I don't understand why tests are written this way. There's NOWHERE a mention of escaping that I have to do somewhere. But the tests for pr-str are hinting towards it
    return read_string_to_mal_string(escape_str(str) as `"${string}"`);
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

//str: calls pr_str on each argument with print_readably set to false, concatenates the results together ("" separator), and returns the new string.
map.set(
  "str",
  malFunction(((...args: MalString[]) => {
    if (args.length === 0) {
      return read_string_to_mal_string(`""`);
    }
    // I have no goddamn idea what MAL creator wants from me with the string stuff.
    // I don't understand why tests are written this way. There's NOWHERE a mention of escaping that I have to do somewhere. But the tests for pr-str are hinting towards it
    const str = `${args.map((a) => pr_str(a, false)).join("")}`;
    const a = read_string_to_mal_string(escape_str(str) as `"${string}"`);
    return a;
  }) as MalFunctionPrimitive)
);

map.set(
  "atom",
  malFunction((arg: MalType) => malAtom(arg))
);

map.set(
  "atom?",
  malFunction((arg: MalType) => malBoolean(arg.type === ATOM))
);

map.set(
  "deref",
  malFunction(((arg: MalAtom) => arg.value) as MalFunctionPrimitive)
);

map.set(
  "reset!",
  malFunction(((atom: MalAtom, value: MalType) => {
    atom.value = value;
    return value;
  }) as MalFunctionPrimitive)
);

map.set(
  "swap!",
  malFunction(((
    atom: MalAtom,
    f: MalTCOFunction | MalFunction,
    ...args: MalType[]
  ) => {
    if (f.type === TCO_FUNCTION) {
      atom.value = f.value.value(atom.value, ...args);
    } else {
      atom.value = f.value(atom.value, ...args);
    }
    return atom.value;
  }) as MalFunctionPrimitive)
);

map.set(
  "cons",
  malFunction(((a: MalType, b: MalList | MalVector) => {
    return malList([a, ...b.value]);
  }) as MalFunctionPrimitive)
);

map.set(
  "concat",
  malFunction(((...args: (MalList | MalVector)[]) => {
    return malList(args.flatMap((_) => _.value));
  }) as MalFunctionPrimitive)
);

map.set(
  "vec",
  malFunction(((_: MalList | MalVector) => {
    if (_.type === VECTOR) {
      return _;
    }
    return malVector(_.value);
  }) as MalFunctionPrimitive)
);

map.set(
  "nth",
  malFunction(((_: MalList | MalVector, i: MalNumber) => {
    const value = _.value[i.value];
    if (!value) {
      throw new MalError("out of list range");
    }
    return value;
  }) as MalFunctionPrimitive)
);

map.set(
  "first",
  malFunction(((_: MalList | MalVector | MalNil) => {
    if (_.type === NIL || _.value.length === 0) {
      return malNil();
    }
    return _.value[0];
  }) as MalFunctionPrimitive)
);

map.set(
  "rest",
  malFunction(((_: MalList | MalVector | MalNil) => {
    if (_.type === NIL || _.value.length <= 1) {
      return malList([]);
    }
    return malList(_.value.slice(1));
  }) as MalFunctionPrimitive)
);

map.set(
  "throw",
  malFunction(((_: MalType) => {
    throw new MalError(_);
  }) as MalFunctionPrimitive)
);

map.set(
  "apply",
  malFunction(((func: MalTCOFunction | MalFunction, ...args: MalType[]) => {
    if (
      args[args.length - 1].type !== LIST &&
      args[args.length - 1].type !== VECTOR
    ) {
      throw new MalError("not a list for apply!");
    }
    const lastList = args[args.length - 1] as MalList | MalVector;
    if (func.type === FUNCTION) {
      return func.value(...args.slice(0, -1), ...lastList.value);
    } else {
      return func.value.value(...args.slice(0, -1), ...lastList.value);
    }
  }) as MalFunctionPrimitive)
);

map.set(
  "map",
  malFunction(((
    func: MalTCOFunction | MalFunction,
    list: MalList | MalVector
  ) => {
    if (func.type === FUNCTION) {
      return malList(list.value.map((t) => func.value(t)));
    } else {
      return malList(list.value.map((t) => func.value.value(t)));
    }
  }) as MalFunctionPrimitive)
);

map.set(
  "nil?",
  malFunction((_: MalType) => {
    return _.type === NIL ? malTrue() : malFalse();
  })
);

map.set(
  "true?",
  malFunction((_: MalType) => {
    return _.type === TRUE ? malTrue() : malFalse();
  })
);

map.set(
  "false?",
  malFunction((_: MalType) => {
    return _.type === FALSE ? malTrue() : malFalse();
  })
);

map.set(
  "symbol?",
  malFunction((_: MalType) => {
    return _.type === SYMBOL ? malTrue() : malFalse();
  })
);

map.set(
  "symbol",
  malFunction(((_: MalString): MalSymbol => {
    return malSymbol(malStringToString(_));
  }) as MalFunctionPrimitive)
);

map.set(
  "keyword",
  malFunction(((_: MalString | MalKeyword): MalKeyword => {
    if (_.type === KEYWORD) {
      return _;
    }
    return malKeyword(`:${malStringToString(_)}`);
  }) as MalFunctionPrimitive)
);

map.set("keyword?", getCheckFunction([KEYWORD]));

map.set(
  "vector",
  malFunction((...args: MalType[]) => malVector(args))
);

map.set("vector?", getCheckFunction([VECTOR]));

map.set("sequential?", getCheckFunction([VECTOR, LIST]));

map.set(
  "hash-map",
  malFunction((...args: MalType[]) => {
    if (args.length % 2 !== 0) {
      throw new MalError("odd number of arguments for hash-map");
    }
    const pairs: HashMapPair[] = [];
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];

      if (![KEYWORD, STRING].includes(key.type)) {
        throw new MalError("Wrong hashmap key type");
      }
      pairs.push([key as MalKeyword | MalString, value]);
    }
    return malHashMap(pairs);
  })
);

map.set("map?", getCheckFunction([HASHMAP]));

map.set(
  "assoc",
  malFunction(((hm: MalHashMap, ...args: MalType[]) => {
    if (args.length === 0) {
      return hm;
    }
    if (args.length % 2 !== 0) {
      throw new MalError("assoc: uneven number of args!!!");
    }
    const newMap: MalHashMapValue = new Map();
    for (const [k, v] of hm.value.entries()) {
      newMap.set(k, v);
    }

    for (let i = 0; i < args.length; i += 2) {
      if (args[i].type !== STRING && args[i].type !== KEYWORD) {
        throw new MalError("Hashmap key should be string or keyword");
      }
      newMap.set(createHMKey(args[i] as MalString | MalKeyword), args[i + 1]);
    }
    return malHashMap(newMap);
  }) as MalFunctionPrimitive)
);

map.set(
  "dissoc",
  malFunction(((hm: MalHashMap, ...args: (MalString | MalKeyword)[]) => {
    const newMap: MalHashMapValue = new Map();
    for (const [k, v] of hm.value.entries()) {
      newMap.set(k, v);
    }

    for (const arg of args) {
      if (newMap.get(createHMKey(arg))) {
        newMap.delete(createHMKey(arg));
      }
    }

    return malHashMap(newMap);
  }) as MalFunctionPrimitive)
);

map.set(
  "get",
  malFunction(((hm: MalHashMap, key: MalString | MalKeyword) => {
    if ((hm as unknown as MalNil).type === NIL) {
      return malNil();
    }
    const res = hm.value.get(createHMKey(key));
    return res ?? malNil();
  }) as MalFunctionPrimitive)
);

map.set(
  "contains?",
  malFunction(((hm: MalHashMap, key: MalString | MalKeyword) => {
    const value = hm.value.get(createHMKey(key));
    if (value) {
      return malTrue();
    }
    return malFalse();
  }) as MalFunctionPrimitive)
);

map.set(
  "keys",
  malFunction(((hm: MalHashMap) =>
    malList(
      Array.from(hm.value.keys()).map((v) => {
        const [value, end] = v.split("-");
        if (end === "keyword") {
          return malKeyword(value as `:${string}`);
        } else {
          return malString(value);
        }
      })
    )) as MalFunctionPrimitive)
);

map.set(
  "vals",
  malFunction(((hm: MalHashMap) =>
    malList(Array.from(hm.value.values()))) as MalFunctionPrimitive)
);

map.set(
  "readline",
  malFunction(((_: MalString) => {
    const runOtherFile = (global as any)["run_other_file"] || false;
    // rl.pause();
    const query = malStringToString(_);
    //process.stdin.pause();
    const fd = fs.openSync(`/proc/${process.pid}/fd/0`, "r");

    let buf = Buffer.alloc(1);
    let str = "";

    process.stdout.write(query + " ");

    while (true) {
      fs.readSync(fd, buf, 0, 1, null);
      //ctr-c
      if (buf[0] == 3) {
        if (runOtherFile) {
          process.exit(0);
        }
        process.stdout.write("\n");
        break;
      }
      //new line for tests
      if (buf[0] == 10) {
        process.stdout.write("\n");
        break;
      }

      // catch a ^D and exit
      if (buf[0] == 4) {
        if (runOtherFile) {
          process.exit(0);
        }
        process.stdout.write("\n");
        break;
      }

      // catch the terminating character
      if (buf[0] === 13) {
        break;
      }
      const new_str = buf.toString();
      process.stdout.write(new_str);
      str = str + buf.toString();
      str = str.replace(/\0/g, "");
      //https://github.com/heapwolf/prompt-sync/blob/master/index.js
      buf = Buffer.alloc(1);
    }
    process.stdout.write("\n");
    fs.closeSync(fd);
    return read_string_to_mal_string(`${escape_str(`${str}`)}`);
  }) as MalFunctionPrimitive)
);

map.set(
  "meta",
  malFunction(((
    _: MalList | MalVector | MalHashMap | MalFunction | MalTCOFunction
  ): MalType => {
    return _.meta;
  }) as MalFunctionPrimitive)
);

map.set(
  "with-meta",
  malFunction(((
    _: MalList | MalVector | MalHashMap | MalFunction | MalTCOFunction,
    meta: MalType
  ) => {
    switch (_.type) {
      case LIST:
        return malList(_.value, meta);
      case VECTOR:
        return malVector(_.value, meta);
      case HASHMAP:
        return malHashMap(_.value, meta);
      // .bind "clones" a function
      case FUNCTION:
        return malFunction(_.value.bind(null), meta);
      case TCO_FUNCTION:
        return tcoFunction(
          _.ast,
          _.params,
          _.env,
          malFunction(_.value.value.bind(null)),
          _.isMacro,
          meta
        );
    }
  }) as MalFunctionPrimitive)
);

map.set(
  "time-ms",
  malFunction((): MalNumber => {
    return malNumber(Date.now());
  })
);

map.set(
  "conj",
  malFunction(((_: MalList | MalVector, ...args: MalType[]) => {
    switch (_.type) {
      case LIST:
        return malList([...args.reverse(), ..._.value]);
      case VECTOR:
        return malVector([..._.value, ...args]);
    }
  }) as MalFunctionPrimitive)
);

map.set("string?", getCheckFunction([STRING]));
map.set("number?", getCheckFunction([NUMBER]));
map.set(
  "fn?",
  malFunction(
    (_: MalType): MalBoolean =>
      malBoolean(_.type === FUNCTION || (_.type === TCO_FUNCTION && !_.isMacro))
  )
); //getCheckFunction([FUNCTION, TCO_FUNCTION]));

map.set(
  "macro?",
  malFunction(
    (_: MalType): MalBoolean => malBoolean(_.type === TCO_FUNCTION && _.isMacro)
  )
);

map.set(
  "seq",
  malFunction(((_: MalList | MalVector | MalString | MalNil) => {
    switch (_.type) {
      case LIST:
        if (_.value.length === 0) {
          return malNil();
        }
        return _;
      case VECTOR:
        if (_.value.length === 0) {
          return malNil();
        }
        return malList(_.value);
      case STRING:
        if (_.value === "") {
          return malNil();
        }
        return malList(_.value.split("").map(malString));
      case NIL:
        return _;
    }
  }) as MalFunctionPrimitive)
);

const escape_str = (_: string): `"${string}"` => {
  const elements = _.split("");
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

// ith list element
export const ile = (_: MalList | MalVector, i: number = 0) => {
  const result = _.value[i];
  if (!result) {
    return malNil();
  }
  return _.value[i];
};

export default map;
