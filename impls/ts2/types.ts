import { Env } from "./env";
import { read_string_to_mal_string } from "./reader.js";

export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
export const VECTOR: unique symbol = Symbol("vector");
export const HASHMAP: unique symbol = Symbol("hashmap");
export const STRING: unique symbol = Symbol("string");
export const FUNCTION: unique symbol = Symbol("function");
export const TCO_FUNCTION: unique symbol = Symbol("tco_function");
export const NIL: unique symbol = Symbol("nil");
export const TRUE: unique symbol = Symbol("true");
export const FALSE: unique symbol = Symbol("false");
export const KEYWORD: unique symbol = Symbol("keyword");
export const ATOM: unique symbol = Symbol("atom");

export type MalSingleType =
  | MalNumber
  | MalSymbol
  | MalNil
  | MalString
  | MalFalse
  | MalTrue
  | MalKeyword;

export type MalType =
  | MalSingleType
  | MalList
  | MalVector
  | MalHashMap
  | MalTCOFunction
  | MalFunction
  | MalAtom;

export type ValueType =
  | typeof NUMBER
  | typeof SYMBOL
  | typeof LIST
  | typeof VECTOR
  | typeof HASHMAP
  | typeof STRING
  | typeof FUNCTION
  | typeof TCO_FUNCTION
  | typeof NIL
  | typeof TRUE
  | typeof FALSE
  | typeof KEYWORD
  | typeof ATOM;

export const malSymbol = (value: MalSymbol["value"]): MalSymbol => ({
  type: SYMBOL,
  value,
});

export const malNumber = (value: MalNumber["value"]): MalNumber => ({
  type: NUMBER,
  value,
});

export const malList = (
  value: MalList["value"],
  meta: MalList["meta"] = malNil()
): MalList => ({
  type: LIST,
  value,
  meta,
});

export const malVector = (
  value: MalVector["value"],
  meta: MalVector["meta"] = malNil()
): MalVector => ({
  type: VECTOR,
  value,
  meta,
});

export const malHashMap = (
  value: MalHashMap["value"] | HashMapPair[] | [string, MalType][],
  meta: MalHashMap["meta"] = malNil()
): MalHashMap => {
  if (Array.isArray(value)) {
    const map = new Map<string, MalType>();
    for (const [k, v] of value) {
      map.set(typeof k === "string" ? k : k.value, v);
    }
    return {
      type: HASHMAP,
      value: map,
      meta,
    };
  } else {
    return {
      type: HASHMAP,
      value,
      meta,
    };
  }
};

export const malFunction = (
  value: MalFunction["value"],
  meta: MalFunction["meta"] = malNil()
): MalFunction => ({
  type: FUNCTION,
  value,
  meta,
});

export const tcoFunction = (
  ast: MalTCOFunction["ast"],
  params: MalTCOFunction["params"],
  env: MalTCOFunction["env"],
  value: MalTCOFunction["value"],
  isMacro: boolean = false,
  meta: MalTCOFunction["meta"] = malNil()
): MalTCOFunction => ({
  type: TCO_FUNCTION,
  params,
  ast,
  env,
  value,
  isMacro,
  meta,
});

export const malNil = (): MalNil => ({
  type: NIL,
  value: null,
});

export const malString = (value: MalString["value"]): MalString => {
  return { type: STRING, value };
};

export const malTrue = (): MalTrue => ({
  type: TRUE,
  value: true,
});

export const malFalse = (): MalFalse => ({
  type: FALSE,
  value: false,
});

export const malBoolean = (value: MalBoolean["value"]): MalBoolean => {
  if (value) {
    return malTrue();
  }
  return malFalse();
};

export const malKeyword = (value: MalKeyword["value"]): MalKeyword => ({
  type: KEYWORD,
  value,
});

export const malAtom = (value: MalAtom["value"]): MalAtom => ({
  type: ATOM,
  value,
});

export type MalNumber = {
  type: typeof NUMBER;
  value: number;
};

export type MalSymbol<S = string> = {
  type: typeof SYMBOL;
  value: S;
};

export type MalList = {
  type: typeof LIST;
  value: MalType[];
  meta: MalType;
};

export type MalVector = {
  type: typeof VECTOR;
  value: MalType[];
  meta: MalType;
};

export type MalHashMap = {
  type: typeof HASHMAP;
  value: Map<string, MalType>;
  meta: MalType;
};

export type HashMapPair = [MalKeyword | MalString, MalType];

export type DefList = [MalSymbol<typeof DEF>, MalSymbol, MalNumber];
export type LetList = [MalSymbol<typeof LET>, MalList, MalType];
export type DoList = [MalSymbol<typeof DO>, ...MalType[]];
export type IfList =
  | [MalSymbol<typeof IF>, MalType, MalType, MalType]
  | [MalSymbol<typeof IF>, MalType, MalType];
export type FnList = [MalSymbol<typeof FN>, MalList, MalType];
export type TryList = [MalSymbol<typeof TRY>, MalType, MalList];
export type CatchList = [MalSymbol<typeof CATCH>, MalSymbol, MalType];

export const DEF = "def!" as const;
export const LET = "let*" as const;
export const IF = "if" as const;
export const DO = "do" as const;
export const FN = "fn*" as const;
export const DEF_MACRO = "defmacro!" as const;
export const TRY = "try*" as const;
export const CATCH = "catch*" as const;

export type SPECIAL_SYMBOL =
  | typeof DEF
  | typeof LET
  | typeof IF
  | typeof DO
  | typeof FN;

export interface MalFunction {
  type: typeof FUNCTION;
  value: MalFunctionPrimitive;
  meta: MalType;
}

export interface MalTCOFunction {
  type: typeof TCO_FUNCTION;
  ast: MalType;
  params: MalList;
  env: Env;
  value: MalFunction;
  isMacro: boolean;
  meta: MalType;
}

export type MalFunctionPrimitive = (...args: MalType[]) => MalType;

export type MalNil = {
  type: typeof NIL;
  value: null;
};

export type MalString = {
  type: typeof STRING;
  value: string;
};

export type StringElement =
  | NormalStringElement
  | EscapedBackSlash
  | EscapedDoubleQuote
  | EscapedNewLine;
export type NormalStringElement = {
  type: "normalStringElement";
  value: string;
};
export type EscapedBackSlash = {
  type: "escapedBackSlash";
  value: typeof BackSlash;
};
export type EscapedDoubleQuote = {
  type: "escapedDoubleQuote";
  value: typeof DoubleQuote;
};
export type EscapedNewLine = { type: "escapedNewLine"; value: typeof LetterN };
export const BackSlash = "\\" as const;
export const DoubleQuote = `\"` as const;
export const LetterN = "n" as const;

export type MalTrue = {
  type: typeof TRUE;
  value: true;
};

export type MalFalse = {
  type: typeof FALSE;
  value: false;
};

export type MalBoolean = MalTrue | MalFalse;

export type MalKeyword = {
  type: typeof KEYWORD;
  value: `:${string}`;
};

export type MalAtom = {
  type: typeof ATOM;
  value: MalType;
};
