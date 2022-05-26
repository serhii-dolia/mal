//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  FUNCTION,
  // evaluatableList,
  // EvaluatableList,
  LIST,
  MalAtom,
  MalFunction,
  malFunction,
  MalFunctionPrimitive,
  malList,
  MalList,
  malNumber,
  MalNumber,
  // malList,
  MalSymbol,
  MalType,
  SYMBOL,
} from "./types.js";
import { Env } from "./env.js";

const rl = readline.createInterface({ input, output });

const READ = async (): Promise<MalType> => {
  return read_str(await rl.question("input> "));
};

const EVAL = (ast: MalType, replEnv: MalEnv) => {
  switch (ast.type) {
    case LIST: {
      if (ast.value.length === 0) {
        return ast;
      } else {
        const evaluatedList = eval_ast(ast, replEnv);
        const method = evaluatedList.value[0];
        if (method.type === FUNCTION) {
          return method.value(...evaluatedList.value.slice(1));
        } else {
          return evaluatedList;
        }
      }
    }
    default:
      return eval_ast(ast as any, replEnv);
  }
};

const PRINT = (_: MalType) => {
  pr_str(_, true);
};

function eval_ast(ast: MalList, replEnv: MalEnv): MalList;
function eval_ast(ast: MalType, replEnv: MalEnv): MalType {
  switch (ast.type) {
    case SYMBOL: {
      if (replEnv[ast.value]) {
        return replEnv[ast.value];
      } else {
        throw new Error("No value!");
      }
    }
    case LIST: {
      return malList(ast.value.map((v) => EVAL(v, replEnv)));
    }
    default:
      return ast;
  }
}

type MalEnv = { [key: string]: MalType };
const REPL_ENV: MalEnv = {
  "+": malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value + curr.value),
      malNumber(0)
    )) as MalFunctionPrimitive),
  "-": malFunction(((...args: MalNumber[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return malNumber(acc.value - curr.value);
      }
    }, malNumber(0))) as MalFunctionPrimitive),
  "*": malFunction(((...args: MalNumber[]) =>
    args.reduce(
      (acc, curr) => malNumber(acc.value * curr.value),
      malNumber(1)
    )) as MalFunctionPrimitive),
  "/": malFunction(((...args: MalNumber[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return malNumber(acc.value / curr.value);
      }
    }, malNumber(0))) as MalFunctionPrimitive),
};

const rep = async () => PRINT(EVAL(await READ(), REPL_ENV));

while (true) {
  try {
    await rep();
  } catch (e: any) {
    console.log(e.message);
    await rep();
  }
}
