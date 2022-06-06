import { rl } from "./readline.mjs";

const READ = (_: string) => {
  return _;
};

const EVAL = (_: string) => _;

const PRINT = (_: string) => console.log(_);

while (true) {
  PRINT(EVAL(READ(await rl.question("input> "))));
}
