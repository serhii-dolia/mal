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
  tcoFunction,
  MalTCOFunction,
  VECTOR,
  TCO_FUNCTION,
} from "./types.js";
import { Env } from "./env.js";
import core from "./core.js";

const rl = readline.createInterface({ input, output });

const READ = async (): Promise<MalType> => {
  return read_str(await rl.question("input> "));
};

const EVAL = (ast: MalType, env: Env): MalType => {
  while (true) {
    switch (ast.type) {
      // case FUNCTION:
      // case TCO_FUNCTION:
      //   return ast;
      case VECTOR: {
        if (ast.value.length === 0) {
          return ast;
        } else {
          return eval_ast(ast, env);
        }
      }
      case HASHMAP: {
        if (ast.value.length === 0) {
          return ast;
        } else {
          return eval_ast(ast, env);
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
              const evaluatedValue = EVAL(varValue, env);
              env.set(varName.value, evaluatedValue);
              return evaluatedValue;
            case LET: {
              const letEnv = new Env(env);
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
              env = letEnv;
              ast = expressionToEvaluate;
              continue;
              //return EVAL(expressionToEvaluate, letEnv);
            }
            case DO: {
              const doListValues = ast.value as unknown as DoList;
              const evaluatedList = malList(
                doListValues.slice(1, -1).map<MalType>((el) => EVAL(el, env))
              );
              // TCO magic
              ast = doListValues[doListValues.length - 1];
              continue;
              // return evaluatedList.value[evaluatedList.value.length - 1];
            }
            case IF: {
              const ifListValues = ast.value as unknown as IfList;
              const evaluatedCondition = EVAL(
                eval_ast(ifListValues[1], env),
                env
              );
              if (![NIL, FALSE].includes(evaluatedCondition.type)) {
                //TCO magic
                ast = ifListValues[2]; //EVAL(ifListValues[2], env);
                continue;
              } else {
                // TCO magic
                ast = ifListValues[3] || malNil();
                continue;
                // if (ifListValues[3]) {
                //   return EVAL(ifListValues[3], env);
                // } else {
                //   return malNil();
                // }
              }
            }
            case FN:
              const fnList = ast.value as FnList;
              const args: MalList = fnList[1] as MalList;
              //TCO magic
              return tcoFunction(
                fnList[2],
                fnList[1],
                env,
                malFunction((..._: MalType[]) =>
                  EVAL(fnList[2], new Env(env, args.value as MalSymbol[], _))
                )
              );
            // return malFunction((..._: MalType[]) =>
            //   EVAL(fnList[2], new Env(env, args.value as MalSymbol[], _))
            // );

            default:
              const evaluatedList = eval_ast(ast, env);
              const firstElement = evaluatedList.value[0];
              if (firstElement.type === FUNCTION) {
                // case for (+ 1 2)
                return firstElement.value(...evaluatedList.value.slice(1));
              } else if (firstElement.type === TCO_FUNCTION) {
                ast = firstElement.ast;
                env = new Env(
                  firstElement.env,
                  firstElement.params.value as MalSymbol[],
                  evaluatedList.value.slice(1)
                );
                continue;
              } else {
                // case for things like (1, 2, 3, 4)
                return evaluatedList;
              }
          }
        }
      }
      default:
        return eval_ast(ast, env);
    }
  }
};

const PRINT = (_: MalType) => {
  console.log(pr_str(_, true));
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

PRINT(EVAL(read_str("(def! not (fn* (a) (if a false true)))"), REPL_ENV));

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
