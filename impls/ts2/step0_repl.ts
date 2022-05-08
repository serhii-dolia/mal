//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const READ = async () => {
    return await rl.question("input> ");
};

const EVAL = (_: string) => _;

const PRINT = (_: string) => console.log(_);

const rep = (input: string) => console.log(input);

while (true) {
    PRINT(EVAL(await READ()));
}
