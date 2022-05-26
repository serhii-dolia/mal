export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
export const VECTOR: unique symbol = Symbol("vector");
export const HASHMAP: unique symbol = Symbol("hashmap");
export const STRING: unique symbol = Symbol("string");
export const FUNCTION: unique symbol = Symbol("function");
export const NIL: unique symbol = Symbol("nil");
export const TRUE: unique symbol = Symbol("true");
export const FALSE: unique symbol = Symbol("false");
export const KEYWORD: unique symbol = Symbol("keyword");

export type MalAtom =
  | MalNumber
  | MalSymbol
  | MalNil
  | MalString
  | MalFalse
  | MalTrue
  | MalKeyword;

export type MalType = MalAtom | MalList | MalVector | MalHashMap | MalFunction;

export const malSymbol = (value: MalSymbol["value"]): MalSymbol => ({
  type: SYMBOL,
  value,
});

export const malNumber = (value: MalNumber["value"]): MalNumber => ({
  type: NUMBER,
  value,
});

export const malList = (value: MalList["value"]): MalList => ({
  type: LIST,
  value,
});

export const malVector = (value: MalVector["value"]): MalVector => ({
  type: VECTOR,
  value,
});

export const malHashMap = (value: MalHashMap["value"]): MalHashMap => ({
  type: HASHMAP,
  value,
});

export const malFunction = (value: MalFunction["value"]): MalFunction => ({
  type: FUNCTION,
  value,
});

export const malNil = (): MalNil => ({
  type: NIL,
  value: null,
});

export const malString = (value: MalString["value"]): MalString => ({
  type: STRING,
  value,
});

export const malTrue = (): MalTrue => ({
  type: TRUE,
  value: true,
});

export const malFalse = (): MalFalse => ({
  type: FALSE,
  value: false,
});

export const malKeyword = (value: MalKeyword["value"]): MalKeyword => ({
  type: KEYWORD,
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
};

export type MalVector = {
  type: typeof VECTOR;
  value: MalType[];
};

export type MalHashMap = {
  type: typeof HASHMAP;
  value: HashMapPair[];
};

export type HashMapPair = [MalKeyword | MalString, MalType];

export type DefList = [MalSymbol<typeof DEF>, MalSymbol, MalNumber];
export type LetList = [MalSymbol<typeof LET>, MalList, MalType];
export type DoList = [MalSymbol<typeof DO>, MalList];
export type IfList =
  | [MalSymbol<typeof IF>, MalType, MalType, MalType]
  | [MalSymbol<typeof IF>, MalType, MalType];
export type FnList = [MalSymbol<typeof FN>, MalList, MalType];

export const DEF = "def!" as const;
export const LET = "let*" as const;
export const IF = "if" as const;
export const DO = "do" as const;
export const FN = "fn*" as const;

export type SPECIAL_SYMBOL =
  | typeof DEF
  | typeof LET
  | typeof IF
  | typeof DO
  | typeof FN;

export interface MalFunction {
  type: typeof FUNCTION;
  value: MalFunctionPrimitive;
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

export type MalTrue = {
  type: typeof TRUE;
  value: true;
};

export type MalFalse = {
  type: typeof FALSE;
  value: false;
};

export type MalKeyword = {
  type: typeof KEYWORD;
  value: `:${string}`;
};
