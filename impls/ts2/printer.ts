import {
  ATOM,
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

export const pr_str = (_: MalType, print_readably: boolean): string => {
  switch (_.type) {
    case NUMBER:
    case SYMBOL:
    case TRUE:
    case FALSE:
    case KEYWORD:
      return _.value.toString();
    case STRING:
      if (!print_readably) {
        return unreadable_string(_);
      } else {
        return readable_string(_);
      }
    case ATOM:
      return `@${pr_str(_.value, print_readably)}`;
    case NIL:
      return "nil";
    case LIST:
      return `(${_.value.map((x) => pr_str(x, print_readably)).join(" ")})`;
    case VECTOR:
      return `[${_.value.map((x) => pr_str(x, print_readably)).join(" ")}]`;
    case HASHMAP:
      return `{${_.value
        .map((x) => `${pr_str(x[0], true)} ${pr_str(x[1], true)}`)
        .join(" ")}}`;
    case FUNCTION:
    case TCO_FUNCTION:
      return "#<function>";
  }
};

const unreadable_string = (_: MalString): string => {
  // we know that they start with " and end with ". We don't need that printed
  return _.value.slice(1, -1).map(unreadable_string_element).join("");
};

const readable_string = (_: MalString): string => {
  return _.value.map(readable_string_element).join("");
};

const unreadable_string_element = (_: StringElement): string => {
  switch (_.type) {
    case "normalStringElement":
      return _.value;
    case "escapedDoubleQuote":
      return '"';
    case "escapedBackSlash":
      return "\\";
    case "escapedNewLine":
      return "\n";
  }
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
