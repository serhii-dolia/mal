//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import { MalType } from "./types.js";

const rl = readline.createInterface({ input, output });

const READ = async (): Promise<MalType> => {
  return read_str(await rl.question("input> "));
};

const EVAL = (_: MalType) => {
  return _;
};

const PRINT = (_: MalType) => {
  pr_str(_);
};

const rep = (input: string) => console.log(input);

while (true) {
  PRINT(EVAL(await READ()));
}
