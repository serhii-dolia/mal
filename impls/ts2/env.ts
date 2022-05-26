import { MalSymbol, MalType } from "./types";

export class Env {
  private data: { [key: string]: MalType } = {};

  constructor(
    private outer: Env | null,
    binds: MalSymbol[] = [],
    exprs: MalType[] = []
  ) {
    if (binds.length !== exprs.length) {
      throw new Error("binds and expressions should be same length");
    }
    for (let i = 0; i < binds.length; i++) {
      this.data[binds[i].value] = exprs[i];
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
      throw new Error(`${symbol} not found`);
    }
    return env.data[symbol];
  }
}
