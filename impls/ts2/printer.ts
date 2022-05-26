import {
  FALSE,
  FUNCTION,
  HASHMAP,
  KEYWORD,
  LIST,
  MalString,
  MalType,
  NIL,
  NUMBER,
  STRING,
  SYMBOL,
  TRUE,
  VECTOR,
} from "./types.js";

export const pr_str = (_: MalType, print_readably: boolean) => {
  console.log(toString(_, print_readably));
};

const toString = (_: MalType, print_readably: boolean): string => {
  switch (_.type) {
    case NUMBER:
    case SYMBOL:
    case TRUE:
    case FALSE:
    case KEYWORD:
      return _.value.toString();
    case STRING:
      if (!print_readably) {
        return `"${_.value}"`;
      } else {
        return readable_string(_);
      }
    case NIL:
      return "nil";
    case LIST:
      return `(${_.value.map((x) => toString(x, print_readably)).join(" ")})`;
    case VECTOR:
      return `[${_.value.map((x) => toString(x, print_readably)).join(" ")}]`;
    case HASHMAP:
      return `{${_.value
        .map((x) => `${toString(x[0], true)} ${toString(x[1], true)}`)
        .join(" ")}}`;
    case FUNCTION:
      return _.value.toString();
  }
};

const readable_string = (_: MalString): string => {
  return `"${_.value.replaceAll(`\"`, `"`)}"`;
};
