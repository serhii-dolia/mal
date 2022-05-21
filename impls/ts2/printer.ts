import { ERROR, LIST, MalType, NUMBER, STRING } from "./types.js";

export const pr_str = (_: MalType) => {
  console.log(toString(_));
};

const toString = (_: MalType): string => {
  switch (_.type) {
    case NUMBER:
    case STRING:
    case ERROR:
      return _.value.toString();
    case LIST:
      return `(${_.value.map(toString).join(" ")})`;
  }
};
