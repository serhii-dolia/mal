import { MalType } from "./types";

export class Env {
  private data: { [key: string]: ((...args: any[]) => any) | MalType };

  constructor(private outer: Env | null) {
    this.data = {};
  }

  set(symbol: string, value: MalType | ((...args: any[]) => any)) {
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

  get(symbol: string): MalType | ((...args: any[]) => any) {
    const env = this.find(symbol);
    if (!env) {
      throw new Error("Not found");
    }
    return env.data[symbol];
  }
}
