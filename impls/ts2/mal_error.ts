import core from "./core.js";
import { pr_str } from "./printer.js";
import { MalFunction, malString, MalType } from "./types.js";

export class MalError extends Error {
  constructor(..._: (MalType | string)[]) {
    super();
    const args = _.map((a) => (typeof a === "string" ? malString(a) : a));
    this.message = (core.get("str") as MalFunction)?.value(...args)
      .value as string;
  }
}
