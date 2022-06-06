import { pr_str } from "./printer.mjs";
import { read_str } from "./reader.mjs";
import {
  FUNCTION,
  HASHMAP,
  // evaluatableList,
  // EvaluatableList,
  LIST,
  MalSingleType,
  MalFunction,
  malFunction,
  MalFunctionPrimitive,
  malHashMap,
  malList,
  MalList,
  malNumber,
  MalNumber,
  // malList,
  MalSymbol,
  MalType,
  MalVector,
  malVector,
  SYMBOL,
  VECTOR,
} from "./types.mjs";
import { MalError } from "./mal_error.mjs";
import { rl } from "./readline.mjs";

const READ = (_: string): MalType => {
  return read_str(_);
};

const EVAL = (ast: MalType, replEnv: MalEnv) => {
  switch (ast.type) {
    case VECTOR: {
      if (ast.value.length === 0) {
        return ast;
      } else {
        return eval_ast(ast, replEnv);
      }
    }
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
  console.log(pr_str(_, true));
};

function eval_ast(ast: MalList, replEnv: MalEnv): MalList;
function eval_ast(ast: MalVector, replEnv: MalEnv): MalVector;
function eval_ast(ast: MalType, replEnv: MalEnv): MalType {
  switch (ast.type) {
    case SYMBOL: {
      if (replEnv[ast.value]) {
        return replEnv[ast.value];
      } else {
        throw new MalError("No value!");
      }
    }
    case LIST: {
      return malList(ast.value.map((v) => EVAL(v, replEnv)));
    }
    case VECTOR: {
      return malVector(ast.value.map((v) => EVAL(v, replEnv)));
    }
    case HASHMAP: {
      const newMap = new Map();
      for (const [k, v] of ast.value.entries()) {
        newMap.set(k, EVAL(v, replEnv));
      }

      return malHashMap(newMap);
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

const rep = async () => {
  while (true) {
    try {
      PRINT(EVAL(READ(await rl.question("input> ")), REPL_ENV));
    } catch (e: any) {
      console.log(e.message);
      await rep();
    }
  }
};

rep();
