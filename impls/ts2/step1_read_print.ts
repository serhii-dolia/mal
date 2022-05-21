//@ts-ignore
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pr_str } from "./printer.js";
import { read_str } from "./reader.js";

const rl = readline.createInterface({ input, output });

const READ = async () => {
    return read_str(await rl.question("input> "));
};

const EVAL = (_) => _;

const PRINT = (_: string) => pr_str(_);

const rep = (input: string) => console.log(input);

while (true) {
    PRINT(EVAL(await READ()));
}
