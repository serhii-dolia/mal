import { pr_str } from "./printer.js";
import { malString, MalType } from "./types.js";

export class MalError extends Error {
  constructor(arg: MalType | string) {
    super();
    if (typeof arg === "string") {
      this.message = pr_str(malString(arg), true);
    } else {
      this.message = pr_str(arg, true);
    }
  }
}
