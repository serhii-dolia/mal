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
  StringElement,
  SYMBOL,
  TCO_FUNCTION,
  TRUE,
  VECTOR,
} from "./types.js";

export const pr_str = (_: MalType, print_readably: boolean) => {
  console.log(toString(_, print_readably));
};

export const toString = (_: MalType, print_readably: boolean): string => {
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
    case TCO_FUNCTION:
      return "#<function>";
  }
};

const readable_string = (_: MalString): string => {
  return `${_.value.map(readable_string_element).join("")}`;
};

const readable_string_element = (_: StringElement): string => {
  switch (_.type) {
    case "normalStringElement":
      return _.value;
    case "escapedDoubleQuote":
      return '\\"';
    case "escapedBackSlash":
      return "\\\\";
    case "escapedNewLine":
      return "\\n";
  }
};
