export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
export const STRING: unique symbol = Symbol("string");
export const EVALUATABLE_LIST: unique symbol = Symbol("evaluatable list");

export type MalAtom = MalNumber | MalSymbol;
export type MalType = MalAtom | MalList;

export const malSymbol = (value: MalSymbol["value"]): MalSymbol => ({
  type: SYMBOL,
  value,
});

export const malNumber = (value: MalNumber["value"]): MalNumber => ({
  type: NUMBER,
  value,
});

export const malList = (value: MalType[]): MalList => ({
  type: LIST,
  value,
});
export const evaluatableList = (
  value: EvaluatableList["value"]
): EvaluatableList => ({
  type: EVALUATABLE_LIST,
  value,
});
export type MalNumber = {
  type: typeof NUMBER;
  value: number;
};

export type MalSymbol = {
  type: typeof SYMBOL;
  value: string;
};

export type MalList = {
  type: typeof LIST;
  value: MalType[];
};

export type EvaluatableList = {
  type: typeof EVALUATABLE_LIST;
  value: [(...args: number[]) => number, ...number[]];
};
