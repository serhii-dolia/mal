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
  reviveHMKey,
  STRING,
  SYMBOL,
  TCO_FUNCTION,
  TRUE,
  VECTOR,
} from "./types.mjs";

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
      return `(atom ${pr_str(_.value, print_readably)})`;
    case NIL:
      return "nil";
    case LIST:
      return `(${_.value.map((x) => pr_str(x, print_readably)).join(" ")})`;
    case VECTOR:
      return `[${_.value.map((x) => pr_str(x, print_readably)).join(" ")}]`;
    case HASHMAP:
      return `{${Array.from(_.value.entries())
        .map(
          (x) =>
            `${pr_str(reviveHMKey(x[0]), print_readably)} ${pr_str(
              x[1],
              print_readably
            )}`
        )
        .join(" ")}}`;
    case FUNCTION:
    case TCO_FUNCTION:
      return "#<function>";
  }
};

const unreadable_string = (_: MalString): string => {
  // we know that they start with " and end with ". We don't need that printed
  return `${_.value}`;
};

const readable_string = (_: MalString): string => {
  return `"${_.value.split("").map(readable_string_element).join("")}"`;
};

const readable_string_element = (_: string): string => {
  switch (_) {
    case "\\":
      return "\\\\";
    case '"':
      return '\\"';
    case "\n":
      return "\\n";
    default:
      return _;
  }
};
