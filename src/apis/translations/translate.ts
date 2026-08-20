import { cfg } from '@/bot/cfg.ts';

// deno-lint-ignore no-explicit-any
export type TranslateableObject = { [key: string | number | symbol]: any } | any[];
export type Translateable = TranslateableObject | string | number;

function doTranslatePatternToRegex(input: string): { regex: RegExp; groups: number } {
    let escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let groups = 0;
    escaped = escaped.replace(/\\\[\\\*\\\*\\\]/g, () => {
        groups++;
        return '(.*)';
    });
    escaped = escaped.replace(/\\\[\\\*\\\]/g, '.*');

    const regex = new RegExp(`^${escaped}$`, 'i');

    return { regex, groups };
}

function doTranslateString(what: string) {
    const translation = cfg.features.translations.find((val) => {
        const inputs = typeof val.input === 'string' ? [val.input] : val.input;

        return inputs.some((pattern: string) => {
            const { regex } = doTranslatePatternToRegex(pattern);
            return regex.test(what);
        });
    });

    if (!translation) return what;

    const inputs = typeof translation.input === 'string' ? [translation.input] : translation.input;

    for (const pattern of inputs) {
        const { regex, groups } = doTranslatePatternToRegex(pattern);
        const match = what.match(regex);

        if (match) {
            let output = translation.output;

            for (let i = 1; i <= groups; i++) {
                output = output.replace(new RegExp(`\\$${i}`, 'g'), match[i] ?? '');
            }

            return output;
        }
    }

    return translation.output;
}

function doTranslateObj<T extends TranslateableObject>(what: T): T {
    if (Array.isArray(what)) {
        return what.map((v) => doTranslate(v)) as T;
    }

    // deno-lint-ignore no-explicit-any
    const output: Record<string, any> = { ...what };

    for (const key of Object.keys(output)) {
        output[key] = doTranslate(output[key]);
    }

    return output as T;
}

function doTranslate(what: string): string;
function doTranslate(what: number): number;
function doTranslate<T extends TranslateableObject>(what: T): T;
function doTranslate(what: Translateable): Translateable {
    switch (typeof what) {
        case 'object':
            return doTranslateObj(what);

        case 'string':
            return doTranslateString(what);

        case 'number':
        case 'bigint':
        default:
            return what;
    }
}

export { doTranslate, doTranslate as t };
