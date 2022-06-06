import core from "./core.mjs";
import { MalFunction, malString, MalType } from "./types.mjs";

export class MalError extends Error {
  constructor(..._: (MalType | string)[]) {
    super();
    const args = _.map((a) => (typeof a === "string" ? malString(a) : a));
    this.message = (core.get("str") as MalFunction)?.value(...args)
      .value as string;
  }
}
