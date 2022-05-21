const LEFT_PAREN = "(";
class Reader {
    private currentPosition = 0;
    constructor(private tokens: string[]) {}
    next(): string {
        this.currentPosition++;
        return this.peek();
    }
    peek(): string {
        return this.tokens[this.currentPosition];
    }
}

export const read_str = (_: string) => read_form(new Reader(tokenize(_)));

const tokenize = (_: string) =>
    _.split(
        /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/
    ).filter((_) => _ !== "");

const read_form = (_: Reader) => {
    switch (_.peek()) {
        case LEFT_PAREN:
            return read_list(_);
        default:
            return read_atom(_);
    }
};

const read_list = (_: Reader) => {};

const read_atom = (_: Reader) => {};
