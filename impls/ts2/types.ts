export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
export const STRING: unique symbol = Symbol("string");
export const FUNCTION: unique symbol = Symbol("function");
export const NIL: unique symbol = Symbol("nil");
export const TRUE: unique symbol = Symbol("true");
export const FALSE: unique symbol = Symbol("false");

export type MalAtom =
  | MalNumber
  | MalSymbol
  | MalNil
  | MalString
  | MalFalse
  | MalTrue;
export type MalType = MalAtom | MalList | MalFunction;

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
  value: DefList | LetList | MalType[];
};

export type DefList = [MalSymbol<typeof DEF>, MalSymbol, MalNumber];
export type LetList = [MalSymbol<typeof LET>, ...MalType[]];

export const DEF = "def!" as const;
export const LET = "let*" as const;

export type SPECIAL_SYMBOL = typeof DEF | typeof LET;

export const SPECIAL_SYMBOLS = [DEF, LET] as const;

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
