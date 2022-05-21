//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  evaluatableList,
  EvaluatableList,
  LIST,
  MalList,
  malList,
  MalSymbol,
  MalType,
  SYMBOL,
} from "./types.js";

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
        return evaluatedList.value[0](
          ...(evaluatedList.value.slice(1) as number[])
        );
      }
    }
    default:
      return eval_ast(ast, replEnv);
  }
};

const PRINT = (_: number | MalList) => {
  pr_str(_);
};

function eval_ast(ast: MalList, replEnv: MalEnv): EvaluatableList;
function eval_ast(ast: MalSymbol, replEnv: MalEnv): () => {};
function eval_ast(ast: Exclude<MalType, MalList>, replEnv: MalEnv): number;
function eval_ast(
  ast: MalType,
  replEnv: MalEnv
): EvaluatableList | (() => {}) | number {
  switch (ast.type) {
    case SYMBOL: {
      if (replEnv[ast.value]) {
        return replEnv[ast.value];
      } else {
        throw new Error("No value!");
      }
    }
    case LIST: {
      return evaluatableList(ast.value.map((v) => EVAL(v, replEnv)) as any);
    }
    default:
      return ast.value;
  }
}

type MalEnv = { [key: string]: (...args: any[]) => {} };
const REPL_ENV: MalEnv = {
  "+": (...args: number[]) => args.reduce((acc, curr) => acc + curr, 0),
  "-": (...args: number[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return acc - curr;
      }
    }, 0),
  "*": (...args: number[]) => args.reduce((acc, curr) => acc * curr, 1),
  "/": (...args: number[]) =>
    args.reduce((acc, curr, i) => {
      if (i === 0) {
        return curr;
      } else {
        return acc / curr;
      }
    }, 0),
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
