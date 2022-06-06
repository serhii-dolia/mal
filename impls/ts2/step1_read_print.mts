import { pr_str } from "./printer.mjs";
import { read_str } from "./reader.mjs";
import { rl } from "./readline.mjs";
import { MalType } from "./types.mjs";

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
