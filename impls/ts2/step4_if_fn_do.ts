//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import {
  DEF,
  DefList,
  DO,
  DoList,
  FALSE,
  FN,
  FnList,
  FUNCTION,
  HASHMAP,
  IF,
  IfList,
  LET,
  //   evaluatableList,
  //   EvaluatableList,
  LIST,
  MalAtom,
  MalFunction,
  malFunction,
  MalFunctionPrimitive,
  malHashMap,
  MalHashMap,
  MalKeyword,
  MalList,
  malList,
  malNil,
  MalNumber,
  malNumber,
  MalSymbol,
  MalType,
  malVector,
  MalVector,
  NIL,
  SYMBOL,
  VECTOR,
} from "./types.js";
import { Env } from "./env.js";
import core from "./core.js";

const rl = readline.createInterface({ input, output });

const READ = async (): Promise<MalType> => {
  return read_str(await rl.question("input> "));
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
            const expressionToEvaluate = ast.value[2] as MalType;
            if (bindingList.value.length % 2 === 1) {
              throw new Error("EOF");
            }
            for (let i = 0; i < bindingList.value.length; i += 2) {
              const key = bindingList.value[i];
              const value = bindingList.value[i + 1];
              if (key.type !== SYMBOL) {
                throw new Error("Must be symbol for binding");
              }
              letEnv.set(key.value, EVAL(value, letEnv));
            }
            return EVAL(expressionToEvaluate, letEnv);
          }
          case DO: {
            const doListValues = ast.value as unknown as DoList;
            const evaluatedList = malList(
              doListValues.slice(1).map<MalType>((el) => eval_ast(el, replEnv))
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
  pr_str(_, true);
};

function eval_ast(ast: MalList, replEnv: Env): MalList;
function eval_ast(ast: MalVector, replEnv: Env): MalVector;
function eval_ast(ast: MalHashMap, replEnv: Env): MalHashMap;
function eval_ast(ast: MalAtom, replEnv: Env): MalType;
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
      return malHashMap(
        ast.value.map(([key, value]) => [key, EVAL(value, replEnv)])
      );
    }
    default:
      return ast;
  }
}

const REPL_ENV = new Env(null);

for (const [key, value] of core) {
  REPL_ENV.set(key, value);
}

const rep = async () => {
  while (true) {
    try {
      PRINT(EVAL(await READ(), REPL_ENV));
    } catch (e: any) {
      console.log(e.message);
      await rep();
    }
  }
};

rep();
