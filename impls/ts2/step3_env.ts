//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  //   evaluatableList,
  //   EvaluatableList,
  LIST,
  malFunction,
  MalFunctionPrimitive,
  MalList,
  malList,
  MalNumber,
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
            // check if the type is number
            const evaluatedList = eval_ast(ast, replEnv);
            const method = evaluatedList[0];
            const args = evaluatedList.slice(1) as MalNumber[];
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

function eval_ast(ast: MalType, replEnv: Env): MalType {
  switch (ast.type) {
    case SYMBOL: {
      if (SPECIAL_SYMBOLS.includes(ast.value as SPECIAL_SYMBOL)) {
        return ast;
      }
      const x = replEnv.get(ast.value);
      if (typeof x === "function") {
        return x;
      }
      return x.value as any;
      // return replEnv.get(ast.value);
    }
    case LIST: {
      return ast.value.map((v) => EVAL(v, replEnv));
    }
    default:
      return ast;
  }
}

type SPECIAL_SYMBOL = "def!" | "let*";

const SPECIAL_SYMBOLS = ["def!", "let*"] as const;

const REPL_ENV = new Env(null);

REPL_ENV.set(
  "+",
  malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value + curr.value),
      malNumber(0)
    )) as MalFunctionPrimitive)
);
REPL_ENV.set(
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
REPL_ENV.set(
  "*",
  malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value * curr.value),
      malNumber(1)
    )) as MalFunctionPrimitive)
);
REPL_ENV.set(
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

const rep = async () => PRINT(EVAL(await READ(), REPL_ENV));

while (true) {
  try {
    await rep();
  } catch (e: any) {
    console.log(e.message);
    await rep();
  }
}
