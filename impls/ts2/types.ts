export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
//export const STRING: unique symbol = Symbol("string");
export const FUNCTION: unique symbol = Symbol("function");
export const NIL: unique symbol = Symbol("nil");

export type MalAtom = MalNumber | MalSymbol | MalNil;
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
