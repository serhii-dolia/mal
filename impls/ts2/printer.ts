import { LIST, MalType, NUMBER, SYMBOL } from "./types.js";

export type PrintableValue = string | number | MalType;
export const pr_str = (_: PrintableValue | null) => {
  if (_ === null) {
    return;
  }
  console.log(toString(_));
};

const toString = (_: PrintableValue): string => {
  if (typeof _ === "string" || typeof _ === "number") {
    return _.toString();
  }
  switch (_.type) {
    case NUMBER:
    case SYMBOL:
      return _.value.toString();
    case LIST:
      return `(${_.value.map(toString).join(" ")})`;
  }
};
