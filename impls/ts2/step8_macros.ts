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
  tcoFunction,
  VECTOR,
  TCO_FUNCTION,
  MalFunction,
  MalFunctionPrimitive,
  malSymbol,
  DEF_MACRO,
  MalTCOFunction,
} from "./types.js";
import { Env } from "./env.js";
import core, { ile } from "./core.js";

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
          ast = macroexpand(ast, env);
          if (ast.type !== LIST) {
            return eval_ast(ast, env);
          }
          const firstValue = ast.value[0];
          switch (firstValue.value) {
            // case "macroexpand": {
            //   return macroexpand(ast, env);
            // }
            case DEF_MACRO: {
              const [, varName, varValue] = ast.value as DefList;
              const evaluatedValue = EVAL(varValue, env) as MalTCOFunction;
              evaluatedValue.isMacro = true;
              env.set(varName.value, evaluatedValue);
              return evaluatedValue;
            }
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
              doListValues.slice(1, -1).map<MalType>((el) => EVAL(el, env));
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
            case FN: {
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
            }
            default:
              if (ast.value[0].value === "quote") {
                return (REPL_ENV.get("quote") as MalFunction).value(
                  ast.value[1]
                );
              } else if (ast.value[0].value === "quasiquote") {
                ast = (REPL_ENV.get("quasiquote") as MalFunction).value(
                  ast.value[1]
                );
                continue;
              }
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

REPL_ENV.set(
  DEF,
  malFunction((ast: MalType) => {
    const [, varName, varValue] = ast.value as DefList;
    const evaluatedValue = EVAL(varValue, REPL_ENV);
    REPL_ENV.set(varName.value, evaluatedValue);
    return evaluatedValue;
  })
);

REPL_ENV.set(
  LET,
  malFunction(((ast: MalList) => {
    const letEnv = new Env(REPL_ENV);
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
  }) as MalFunctionPrimitive)
);

REPL_ENV.set(
  DO,
  malFunction((ast: MalType) => {
    const doListValues = ast.value as unknown as DoList;
    const evaluatedList = doListValues
      .slice(1)
      .map<MalType>((el) => EVAL(el, REPL_ENV));
    return evaluatedList[evaluatedList.length - 1];
  })
);

REPL_ENV.set(
  IF,
  malFunction((ast: MalType) => {
    const ifListValues = ast.value as unknown as IfList;
    const evaluatedCondition = EVAL(
      eval_ast(ifListValues[1], REPL_ENV),
      REPL_ENV
    );
    if (![NIL, FALSE].includes(evaluatedCondition.type)) {
      //TCO magic
      return EVAL(ifListValues[2], REPL_ENV);
    } else {
      if (ifListValues[3]) {
        return EVAL(ifListValues[3], REPL_ENV);
      } else {
        return malNil();
      }
    }
  })
);

REPL_ENV.set(
  FN,
  malFunction((ast: MalType) => {
    const fnList = ast.value as FnList;
    const args: MalList = fnList[1] as MalList;
    //TCO magic
    return tcoFunction(
      fnList[2],
      fnList[1],
      REPL_ENV,
      malFunction((..._: MalType[]) =>
        EVAL(fnList[2], new Env(REPL_ENV, args.value as MalSymbol[], _))
      )
    );
  })
);

REPL_ENV.set(
  DEF_MACRO,
  malFunction((ast: MalType) => {
    const [, varName, varValue] = ast.value as DefList;
    const evaluatedValue = EVAL(varValue, REPL_ENV) as MalTCOFunction;
    evaluatedValue.isMacro = true;
    REPL_ENV.set(varName.value, evaluatedValue);
    return evaluatedValue;
  })
);

REPL_ENV.set(
  "macroexpand",
  malFunction((ast: MalType) => macroexpand(ast, REPL_ENV))
);

REPL_ENV.set(
  "eval",
  malFunction((value: MalType) => EVAL(value, REPL_ENV))
);

REPL_ENV.set(
  "quote",
  malFunction((value: MalType) => value)
);

REPL_ENV.set(
  "quasiquote",
  malFunction(function qq(_: MalType) {
    function processNormalList(arg: MalList | MalVector) {
      let list = malList([]);
      for (let i = arg.value.length - 1; i >= 0; i--) {
        const elt = ile(arg, i);
        if (elt.type === LIST && ile(elt, 0).value === "splice-unquote") {
          list = malList([malSymbol("concat"), ile(elt, 1), list]);
        } else {
          list = malList([malSymbol("cons"), qq(elt), list]);
        }
      }
      return list;
    }
    if (_.type === VECTOR) {
      return malList([malSymbol("vec"), processNormalList(_)]);
    }
    if (_.type === LIST) {
      if (_.value.length === 0) {
        return malList([]);
      }
      if (ile(_).value === "unquote") {
        return ile(_, 1);
      } else {
        return processNormalList(_);
        // let list = malList([]);
        // for (let i = _.value.length - 1; i >= 0; i--) {
        //   const elt = ile(_, i);
        //   if (elt.type === LIST && ile(elt, 0).value === "splice-unquote") {
        //     list = malList([malSymbol("concat"), ile(elt, 1), list]);
        //   } else {
        //     list = malList([malSymbol("cons"), qq(elt), list]);
        //   }
        // }
        // return list;
      }
    } else if (_.type === HASHMAP || _.type === SYMBOL) {
      return malList([malSymbol("quote"), _]);
    } else {
      return _;
    }
  } as MalFunctionPrimitive)
);

const is_macro_call = (ast: MalType, env: Env): ast is MalList => {
  if (ast.type === LIST) {
    if (ast.value[0] && ast.value[0].type === SYMBOL) {
      const val = env.get(ast.value[0].value);

      if (val.type === TCO_FUNCTION && val.isMacro) {
        return true;
      }
    }
  }
  return false;
};

const macroexpand = (ast: MalType, env: Env): MalType => {
  let x = ast;
  while (is_macro_call(x, env)) {
    const firstValue = x.value[0];
    if (!firstValue || firstValue.type !== SYMBOL) {
      throw new Error("macro problem");
    }
    const macroFunction = env.get(firstValue.value) as MalTCOFunction;
    x = macroFunction.value.value(...x.value.slice(1));
  }
  return x;
};

const rep = async (read: () => Promise<MalType>) => {
  PRINT(EVAL(await read(), REPL_ENV));
};

const start = async () => {
  while (true) {
    try {
      await rep(READ);
    } catch (e: any) {
      console.log(e.message);
      await start();
    }
  }
};

await rep(() =>
  Promise.resolve(read_str("(def! not (fn* (a) (if a false true)))"))
);
await rep(() =>
  Promise.resolve(
    read_str(
      `(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))`
    )
  )
);

if (process.argv.length > 2) {
  const paths = process.argv.slice(2);
  for (const path of paths) {
    await rep(() => Promise.resolve(read_str(`(load-file "${path}")`)));
  }
  process.exit(0);
} else {
  start();
}
