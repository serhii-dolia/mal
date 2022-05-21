import { ERROR, LIST, MalType, NUMBER, SYMBOL } from "./types.js";

export type PrintableValue = string | number | MalType;
export const pr_str = (_: PrintableValue) => {
  console.log(toString(_));
};

const toString = (_: PrintableValue): string => {
  if (typeof _ === "string" || typeof _ === "number") {
    return _.toString();
  }
  switch (_.type) {
    case NUMBER:
    case SYMBOL:
    case ERROR:
      return _.value.toString();
    case LIST:
      return `(${_.value.map(toString).join(" ")})`;
  }
};
