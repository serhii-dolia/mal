import { FUNCTION, LIST, MalType, NIL, NUMBER, SYMBOL } from "./types.js";

export const pr_str = (_: MalType) => {
  if (_ === null) {
    return;
  }
  console.log(toString(_));
};

const toString = (_: MalType): string => {
  switch (_.type) {
    case NUMBER:
    case SYMBOL:
      return _.value.toString();
    case NIL:
      return "nil";
    case LIST:
      return `(${_.value.map(toString).join(" ")})`;
    case FUNCTION:
      return _.value.toString();
  }
};
