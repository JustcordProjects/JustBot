export type char = string;

export function doIsValid(ch: char): boolean {
    return ch.length == 1;
}

export function doIsDigit(ch: char): boolean {
    return ch >= '0' && ch <= '9';
}

export function doIsAlpha(ch: char): boolean {
    return /^\p{L}$/u.test(ch);
}

export function doIsAlnum(ch: string): boolean {
    return /^\p{L}$|^\p{N}$/u.test(ch);
}

export function doIsIdentch(ch: string): boolean {
    return doIsAlnum(ch) || ch == '_';
}
