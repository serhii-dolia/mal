import { MalError } from "./mal_error.mjs";
import { malList, MalSymbol, MalType } from "./types.mjs";

export class Env {
  private data: { [key: string]: MalType } = {};

  constructor(
    private outer: Env | null,
    binds: MalSymbol[] = [],
    exprs: MalType[] = []
  ) {
    const ampersandIndex = binds.findIndex((b) => b && b.value === "&");
    if (ampersandIndex === -1) {
      for (let i = 0; i < binds.length; i++) {
        this.data[binds[i].value] = exprs[i];
      }
    } else if (ampersandIndex === binds.length - 1) {
      throw new EvalError("wrong variadic type definition");
    } else {
      for (let i = 0; i < ampersandIndex; i++) {
        this.data[binds[i].value] = exprs[i];
      }
      this.data[binds[ampersandIndex + 1].value] = malList(
        exprs.slice(ampersandIndex)
      );
    }
  }

  set(symbol: string, value: MalType) {
    this.data[symbol] = value;
  }

  find(symbol: string): Env | null {
    if (this.data[symbol]) {
      return this;
    } else if (this.outer === null) {
      return null;
    } else {
      return this.outer.find(symbol);
    }
  }

  get(symbol: string): MalType {
    const env = this.find(symbol);
    if (!env) {
      throw new MalError(`'${symbol}' not found`);
    }
    return env.data[symbol];
  }
}
