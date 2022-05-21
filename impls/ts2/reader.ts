import {
  MalAtom,
  malList,
  MalList,
  malNumber,
  malSymbol,
  MalType,
} from "./types.js";

const LEFT_PAREN = "(";
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
  return read_form(new Reader(tokenize(_)));
};

const tokenize = (_: string) => {
  const a = _.split(
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/
  ).filter((_) => _ !== "");
  return a;
};

const read_form = (_: Reader): MalList | MalAtom => {
  switch (_.peek()) {
    case LEFT_PAREN:
      return read_list(_);
    default:
      return read_atom(_);
  }
};

const read_list = (_: Reader): MalList => {
  let currentSymbol = _.next();
  let currentValue: MalType = read_form(_);
  // case for the empty lists
  if (currentValue.value === ")") {
    return malList([]);
  }
  const values: MalType[] = [currentValue];
  while (currentValue.value !== ")") {
    currentSymbol = _.next();
    if (currentSymbol === EOF) {
      throw new Error(EOF);
    }
    currentValue = read_form(_);
    if (currentValue.value === ")") {
      break;
    }
    values.push(currentValue);
  }
  return malList(values);
};

const read_atom = (_: Reader): MalAtom => determine_atom(_.peek());

const determine_atom = (_: string): MalAtom => {
  const number = parseInt(_);
  if (Number.isNaN(number)) {
    return malSymbol(_);
  } else {
    return malNumber(number);
  }
};
