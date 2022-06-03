import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";
import { rl } from "./readline.js";
import { MalType } from "./types.js";

const READ = (_: string): MalType => {
  return read_str(_);
};

const EVAL = (_: MalType) => {
  return _;
};

const PRINT = (_: MalType) => {
  console.log(pr_str(_, true));
};

const rep = async () => {
  while (true) {
    try {
      PRINT(EVAL(READ(await rl.question("input> "))));
    } catch (e: any) {
      console.log(e.message);
      await rep();
    }
  }
};

rep();
