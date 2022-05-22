//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  //   evaluatableList,
  //   EvaluatableList,
  LIST,
  MalList,
  malList,
  malNumber,
  MalSymbol,
  MalType,
  SYMBOL,
} from "./types.js";
import { Env } from "./env.js";

const rl = readline.createInterface({ input, output });

const READ = async (): Promise<MalType> => {
  return read_str(await rl.question("input> "));
};

const EVAL = (ast: MalType, replEnv: Env) => {
  switch (ast.type) {
    case LIST: {
      if (ast.value.length === 0) {
        return ast;
      } else {
        const firstValue = ast.value[0];
        switch (firstValue.value) {
          case "def!":
            replEnv.set(ast.value[1].value, malNumber(ast.value[2].value));
            return ast.value[2];
          case "let*":
            throw new Error("wat");
          default:
            const evaluatedList = eval_ast(ast, replEnv);
            const method = evaluatedList[0];
            const args: number[] = evaluatedList.slice(1) as number[];
            return method(...args);
        }
      }
    }
    default:
      return eval_ast(ast, replEnv);
  }
};

const PRINT = (_: number | MalList | null) => {
  pr_str(_);
};

function eval_ast(
  ast: MalList,
  replEnv: Env
): [(...args: number[]) => number, ...number[]];
//   | ["def!", string, number]
//   | ["let*", ...any[]];
function eval_ast(ast: MalSymbol, replEnv: Env): (() => any) | number;
function eval_ast(ast: Exclude<MalType, MalList>, replEnv: Env): number;
function eval_ast(
  ast: MalType,
  replEnv: Env
):
  | [(...args: number[]) => number, ...number[]]
  //   | ["def!", string, number]
  //   | ["let*", ...any[]]
  | (() => {})
  | number
  | SPECIAL_SYMBOL {
  switch (ast.type) {
    case SYMBOL: {
      if (SPECIAL_SYMBOLS.includes(ast.value as any)) {
        return ast.value as SPECIAL_SYMBOL;
      }
      const x = replEnv.get(ast.value);
      if (typeof x === "function") {
        return x;
      }
      return x.value as any;
      // return replEnv.get(ast.value);
    }
    case LIST: {
      return ast.value.map((v) => EVAL(v, replEnv)) as any;
    }
    default:
      return ast.value;
  }
}

type SPECIAL_SYMBOL = "def!" | "let*";

const SPECIAL_SYMBOLS = ["def!", "let*"] as const;

///type MalEnv = { [key: string]: (...args: any[]) => {} };
const REPL_ENV = new Env(null);
REPL_ENV.set("+", (...args: number[]) =>
  args.reduce((acc, curr) => acc + curr, 0)
);
REPL_ENV.set("-", (...args: number[]) =>
  args.reduce((acc, curr, i) => {
    if (i === 0) {
      return curr;
    } else {
      return acc - curr;
    }
  }, 0)
);
REPL_ENV.set("*", (...args: number[]) =>
  args.reduce((acc, curr) => acc * curr, 1)
);
REPL_ENV.set("/", (...args: number[]) =>
  args.reduce((acc, curr, i) => {
    if (i === 0) {
      return curr;
    } else {
      return acc / curr;
    }
  }, 0)
);

const rep = async () => PRINT(EVAL(await READ(), REPL_ENV));

while (true) {
  try {
    await rep();
  } catch (e: any) {
    console.log(e.message);
    await rep();
  }
}
