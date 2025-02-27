import { pr_str } from "./printer.mjs";
import { read_str } from "./reader.mjs";
import {
  DEF,
  DefList,
  DO,
  DoList,
  FALSE,
  FN,
  FUNCTION,
  HASHMAP,
  IF,
  IfList,
  LET,
  LIST,
  MalSingleType,
  malFunction,
  malHashMap,
  MalHashMap,
  MalList,
  malList,
  malNil,
  MalSymbol,
  MalType,
  malVector,
  MalVector,
  NIL,
  SYMBOL,
  VECTOR,
} from "./types.mjs";
import { Env } from "./env.mjs";
import core from "./core.mjs";
import { MalError } from "./mal_error.mjs";

import { rl } from "./readline.mjs";

const READ = (_: string): MalType => {
  return read_str(_);
};

const EVAL = (ast: MalType, replEnv: Env): MalType => {
  switch (ast.type) {
    case FUNCTION:
      return ast;
    case VECTOR: {
      if (ast.value.length === 0) {
        return ast;
      } else {
        return eval_ast(ast, replEnv);
      }
    }
    case HASHMAP: {
      const entries = Array.from(ast.value.entries());
      if (entries.length === 0) {
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
            const expressionToEvaluate = ast.value[2] as MalType;
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
          case DO: {
            const doListValues = ast.value as unknown as DoList;
            const evaluatedList = malList(
              doListValues.slice(1).map<MalType>((el) => EVAL(el, replEnv))
            );
            return evaluatedList.value[evaluatedList.value.length - 1];
          }
          case IF: {
            const ifListValues = ast.value as unknown as IfList;
            const evaluatedCondition = EVAL(
              eval_ast(ifListValues[1], replEnv),
              replEnv
            );
            if (![NIL, FALSE].includes(evaluatedCondition.type)) {
              return EVAL(ifListValues[2], replEnv);
            } else {
              if (ifListValues[3]) {
                return EVAL(ifListValues[3], replEnv);
              } else {
                return malNil();
              }
            }
          }
          case FN:
            const args: MalList = ast.value[1] as MalList;
            return malFunction((..._: MalType[]) =>
              EVAL(ast.value[2], new Env(replEnv, args.value as MalSymbol[], _))
            );

          default:
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
function eval_ast(ast: MalSingleType, replEnv: Env): MalType;
function eval_ast(ast: MalType, replEnv: Env): MalType;
function eval_ast(ast: MalType, replEnv: Env): MalType {
  switch (ast.type) {
    case SYMBOL: {
      return replEnv.get(ast.value);
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

const REPL_ENV = new Env(null);

for (const [key, value] of core) {
  REPL_ENV.set(key, value);
}

const rep = (_: string) => {
  PRINT(EVAL(READ(_), REPL_ENV));
};

rep("(def! not (fn* (a) (if a false true)))");

const start = async () => {
  while (true) {
    try {
      rep(await rl.question("input> "));
    } catch (e: any) {
      console.log(e.message);
      await start();
    }
  }
};

start();
