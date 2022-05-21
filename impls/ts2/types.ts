export const NUMBER: unique symbol = Symbol("number");
export const SYMBOL: unique symbol = Symbol("symbol");
export const LIST: unique symbol = Symbol("list");
export const ERROR: unique symbol = Symbol("error");
export type MalAtom = MalNumber | MalSymbol;
export type MalType = MalAtom | MalList | MalError;
export type MalError = {
  type: typeof ERROR;
  value: "EOF";
};

export const malError = (value: MalError["value"]): MalError => ({
  type: ERROR,
  value,
});

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
