import { MalError } from "./mal_error.js";
import {
  HashMapPair,
  KEYWORD,
  MalSingleType,
  malFalse,
  malHashMap,
  MalHashMap,
  MalKeyword,
  malKeyword,
  malList,
  MalList,
  malNil,
  MalNil,
  malNumber,
  MalString,
  malString,
  malSymbol,
  malTrue,
  MalType,
  MalVector,
  malVector,
  STRING,
  StringElement,
  BackSlash,
  LetterN,
  DoubleQuote,
} from "./types.js";

const LEFT_PAREN = "(";
const LEFT_SQUARE_BRACKET = "[";
const LEFT_FIGURE_BRACKET = "{";
const EOF = "EOF";
class Reader {
  private currentPosition = 0;
  private eof: boolean = false;
  constructor(private tokens: string[]) {}
  next(): string {
    if (this.eof) {
      return EOF;
    }
    this.currentPosition++;
    if (this.currentPosition >= this.tokens.length) {
      this.eof = true;
      return EOF;
    }
    return this.peek();
  }
  peek(): string {
    if (this.eof) {
      return EOF;
    }
    return this.tokens[this.currentPosition];
  }
}

export const read_str = (_: string) => {
  // let leftParensCount = 0;
  // let rightParensCount = 0;
  // for (let i = 0; i < _.length; i++) {
  //   if (_[i] === "(") leftParensCount++;
  //   if (_[i] === ")") rightParensCount++;
  // }
  // if (leftParensCount !== rightParensCount) {
  //   throw new MalError("Parents are not matching!");
  // }
  const x = read_form(new Reader(tokenize(_)));
  return x;
};

const tokenize = (_: string) => {
  return _.split(
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/
  ).filter((_) => _ !== "" && !_.startsWith(";"));
};

const read_form = (
  _: Reader
): MalList | MalVector | MalHashMap | MalSingleType => {
  switch (_.peek()) {
    case LEFT_PAREN:
      return read_list(_, ")", malList);
    case LEFT_SQUARE_BRACKET:
      return read_list(_, "]", malVector);
    case LEFT_FIGURE_BRACKET:
      return read_hashmap(_);
    case "'":
      return read_quote(_);
    case "`":
      return read_quasi_quote(_);
    case "~":
      return read_unquote(_);
    case "~@":
      return read_splice_unquote(_);
    case "@":
      return read_deref(_);
    default:
      return read_atom(_);
  }
};

const read_deref = (_: Reader): MalList => {
  _.next();
  return malList([malSymbol("deref"), read_form(_)]);
};

const read_quote = (_: Reader): MalList => {
  _.next();
  return malList([malSymbol("quote"), read_form(_)]);
};

const read_quasi_quote = (_: Reader): MalList => {
  _.next();
  return malList([malSymbol("quasiquote"), read_form(_)]);
};

const read_unquote = (_: Reader): MalList => {
  _.next();
  return malList([malSymbol("unquote"), read_form(_)]);
};

const read_splice_unquote = (_: Reader): MalList => {
  _.next();
  return malList([malSymbol("splice-unquote"), read_form(_)]);
};
const read_hashmap = (_: Reader): MalHashMap => {
  const values: HashMapPair[] = [];
  while (true) {
    const result = read_next_hasmap_pair(_);
    if (result === null) {
      break;
    }
    values.push(result);
  }

  return malHashMap(values);
};

const read_next_hasmap_pair = (_: Reader): HashMapPair | null => {
  let keySymbol = _.next();
  if (keySymbol === EOF) {
    throw new MalError(EOF);
  }
  let keyValue = read_form(_);
  if (keyValue.value === "}") {
    return null;
  }
  if (![KEYWORD, STRING].includes(keyValue.type)) {
    throw new MalError("Wrong hashmap key type");
  }

  let valueSymbol = _.next();
  if (valueSymbol === EOF) {
    throw new MalError(EOF);
  }
  let valueValue = read_form(_);
  if (valueValue.value === "}") {
    throw new MalError(EOF);
  }
  return [keyValue as MalKeyword | MalString, valueValue];
};

const read_list = (
  _: Reader,
  closingValue: ")" | "]",
  wrapper: typeof malList | typeof malVector
): MalList | MalVector => {
  let currentSymbol = _.next();
  let currentValue: MalType = read_form(_);
  // case for the empty lists
  if (currentValue.value === closingValue) {
    return wrapper([]);
  }
  const values: MalType[] = [currentValue];
  while (currentValue.value !== closingValue) {
    currentSymbol = _.next();
    if (currentSymbol === EOF) {
      throw new MalError(EOF);
    }
    currentValue = read_form(_);
    if (currentValue.value === closingValue) {
      break;
    }
    values.push(currentValue);
  }
  return wrapper(values);
};

const read_atom = (_: Reader): MalSingleType => determine_atom(_.peek());

export const determine_atom = (_: string): MalSingleType => {
  if (_.startsWith(":")) {
    return malKeyword(_ as MalKeyword["value"]);
  }
  if (_.startsWith('"')) {
    return read_string_to_mal_string(_ as `"${string}`);
  }
  if (_.startsWith(";")) {
    //handling comments somehow. TODO: improve
    return malNil();
  }
  const number = parseInt(_);
  if (Number.isNaN(number)) {
    if (_ === "true") {
      return malTrue();
    }
    if (_ === "false") {
      return malFalse();
    }
    if (_ === "nil") {
      return malNil();
    }
    return malSymbol(_);
  } else {
    return malNumber(number);
  }
};

//we know it starts with `"`
export const read_string_to_mal_string = (_: `"${string}`): MalString => {
  if (_.length === 1) {
    throw new MalError(EOF);
  }

  const primitives: StringElement[] = [];
  //we know that 0th element is " and last is supposed to be "
  for (let i = 0; i < _.length; i++) {
    if (i === 0 || i === _.length - 1) {
      primitives.push({ type: "normalStringElement", value: _[i] });
    } else if (_[i] === BackSlash) {
      if (_[i + 1] === BackSlash) {
        primitives.push({ type: "escapedBackSlash", value: BackSlash });
        i += 1;
        continue;
      }
      if (_[i + 1] === "n") {
        primitives.push({ type: "escapedNewLine", value: LetterN });
        i += 1;
        continue;
      }
      if (_[i + 1] === DoubleQuote) {
        primitives.push({ type: "escapedDoubleQuote", value: DoubleQuote });
        i += 1;
        continue;
      }
    } else if (_[i] === "\n") {
      primitives.push({ type: "escapedNewLine", value: "n" });
    } else {
      primitives.push({ type: "normalStringElement", value: _[i] });
    }
  }
  const last = primitives[primitives.length - 1];
  if (last.type !== "normalStringElement" || last.value !== '"') {
    throw new MalError(EOF);
  }
  return malString(
    primitives
      .slice(1, -1)
      .map((el) => {
        switch (el.type) {
          case "escapedBackSlash":
            return "\\";
          case "escapedDoubleQuote":
            return '"';
          case "escapedNewLine":
            return "\n";
          case "normalStringElement":
            return el.value;
        }
      })
      .join("")
  );
};
