import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  DEF,
  DefList,
  FUNCTION,
  HASHMAP,
  LET,
  //   evaluatableList,
  //   EvaluatableList,
  LIST,
  malFunction,
  MalFunctionPrimitive,
  malHashMap,
  MalHashMap,
  MalList,
  malList,
  MalNumber,
  malNumber,
  MalSymbol,
  MalType,
  malVector,
  MalVector,
  SYMBOL,
  VECTOR,
} from "./types.js";
import { Env } from "./env.js";
import { MalError } from "./mal_error.js";
import { rl } from "./readline.js";

const READ = (_: string): MalType => {
  return read_str(_);
};

const EVAL = (ast: MalType, replEnv: Env): MalType => {
  switch (ast.type) {
    case VECTOR: {
      if (ast.value.length === 0) {
        return ast;
      } else {
        return eval_ast(ast, replEnv);
      }
    }
    case HASHMAP: {
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
        const firstValue = ast.value[0];
        switch (firstValue.value) {
          case DEF:
            const [, varName, varValue] = ast.value as DefList;
            const evaluatedValue = EVAL(varValue, replEnv);
            replEnv.set(varName.value, evaluatedValue);
            return evaluatedValue;
          case LET: {
            const letEnv = new Env(replEnv);
            const bindingList = ast.value[1] as MalList;
            const expressionToEvaluate = ast.value[2];
            if (bindingList.value.length % 2 === 1) {
              throw new MalError("EOF");
            }
            for (let i = 0; i < bindingList.value.length; i += 2) {
              const key = bindingList.value[i];
              const value = bindingList.value[i + 1];
              if (key.type !== SYMBOL) {
                throw new MalError("Must be symbol for binding");
              }
              letEnv.set(key.value, EVAL(value, letEnv));
            }
            return EVAL(expressionToEvaluate, letEnv);
          }
          default:
            // check if the type is number
            const evaluatedList = eval_ast(ast, replEnv);
            const firstElement = evaluatedList.value[0];
            if (firstElement.type === FUNCTION) {
              // case for (+ 1 2)
              return firstElement.value(...evaluatedList.value.slice(1));
            } else {
              // case for things like (1, 2, 3, 4)
              return evaluatedList;
            }
        }
      }
    }
    default:
      return eval_ast(ast, replEnv);
  }
};

const PRINT = (_: MalType) => {
  console.log(pr_str(_, true));
};

function eval_ast(ast: MalList, replEnv: Env): MalList;
function eval_ast(ast: MalVector, replEnv: Env): MalVector;
function eval_ast(ast: MalHashMap, replEnv: Env): MalHashMap;
function eval_ast(
  ast: Exclude<MalType, MalList | MalVector | MalHashMap>,
  replEnv: Env
): MalType;
function eval_ast(ast: MalType, replEnv: Env): MalType {
  switch (ast.type) {
    case SYMBOL: {
      // if (SPECIAL_SYMBOLS.includes(ast.value as SPECIAL_SYMBOL)) {
      //   return ast;
      // }
      return replEnv.get(ast.value);
      // return replEnv.get(ast.value);
    }
    case LIST: {
      return malList(ast.value.map((v) => EVAL(v, replEnv)));
    }
    case VECTOR: {
      return malVector(ast.value.map((v) => EVAL(v, replEnv)));
    }
    case HASHMAP: {
      return malHashMap(
        ast.value.map(([key, value]) => [key, EVAL(value, replEnv)])
      );
    }
    default:
      return ast;
  }
}

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
