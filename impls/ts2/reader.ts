import {
  HashMapPair,
  KEYWORD,
  MalAtom,
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
  MalType,
  MalVector,
  malVector,
  STRING,
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
  //   throw new Error("Parents are not matching!");
  // }
  return read_form(new Reader(tokenize(_)));
};

const tokenize = (_: string) => {
  return _.split(
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/
  ).filter((_) => _ !== "");
};

const read_form = (_: Reader): MalList | MalVector | MalHashMap | MalAtom => {
  switch (_.peek()) {
    case LEFT_PAREN:
      return read_list(_, ")", malList);
    case LEFT_SQUARE_BRACKET:
      return read_list(_, "]", malVector);
    case LEFT_FIGURE_BRACKET:
      return read_hashmap(_);
    default:
      return read_atom(_);
  }
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
    throw new Error(EOF);
  }
  let keyValue = read_form(_);
  if (keyValue.value === "}") {
    return null;
  }
  if (![KEYWORD, STRING].includes(keyValue.type)) {
    throw new Error("Wrong hashmap key type");
  }

  let valueSymbol = _.next();
  if (valueSymbol === EOF) {
    throw new Error(EOF);
  }
  let valueValue = read_form(_);
  if (valueValue.value === "}") {
    throw new Error(EOF);
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
      throw new Error(EOF);
    }
    currentValue = read_form(_);
    if (currentValue.value === closingValue) {
      break;
    }
    values.push(currentValue);
  }
  return wrapper(values);
};

const read_atom = (_: Reader): MalAtom => determine_atom(_.peek());

const determine_atom = (_: string): MalAtom => {
  if (_.startsWith(":")) {
    return malKeyword(_ as MalKeyword["value"]);
  }
  if (_.startsWith('"')) {
    return read_string(_);
  }
  const number = parseInt(_);
  if (Number.isNaN(number)) {
    return malSymbol(_);
  } else {
    return malNumber(number);
  }
};

//we know it starts with `"`
const read_string = (_: string): MalString => {
  if (_.length === 1) {
    throw new Error(EOF);
  }
  if (_.endsWith(`"`)) {
    return malString(_.slice(1, -1));
  } else {
    throw new Error(EOF);
  }
};
