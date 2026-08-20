// deno-lint-ignore-file

import util from 'node:util';

export function doDeepMerge<T>(base: T, override: Partial<T>): T {
    const result: any = { ...base };
    for (const key in override) {
        const overrideValue = override[key];
        if (overrideValue && typeof overrideValue === 'object' && !Array.isArray(overrideValue)) {
            result[key] = doDeepMerge((result as any)[key], overrideValue as any);
        } else if (overrideValue !== undefined) {
            (result as any)[key] = overrideValue;
        }
    }
    return result;
}

export function doDeepEqual<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key) || !doDeepEqual((a as any)[key], (b as any)[key])) {
            return false;
        }
    }

    return true;
}

export function doPrettyPrint(obj: any): string {
    return util.inspect(obj, { colors: true, depth: null });
}
