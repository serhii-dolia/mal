export const NUMBER: unique symbol = Symbol("number");
export const STRING: unique symbol = Symbol("string");
export const LIST: unique symbol = Symbol("list");
export const ERROR: unique symbol = Symbol("error");
export type MalAtom = MalNumber | MalString;
export type MalType = MalAtom | MalList | MalError;
export type MalError = {
  type: typeof ERROR;
  value: "EOF";
};

export const malError = (value: MalError["value"]): MalError => ({
  type: ERROR,
  value,
});

export const malString = (value: MalString["value"]): MalString => ({
  type: STRING,
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

export type MalString = {
  type: typeof STRING;
  value: string;
};

export type MalList = {
  type: typeof LIST;
  value: MalType[];
};
