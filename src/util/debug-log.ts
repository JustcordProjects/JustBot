import { prettyPrint } from '@/util/objects/objects.ts';

// deno-lint-ignore no-explicit-any
export default function debugLog(...values: any[]) {
    const encoder = new TextEncoder();
    Deno.stderr.writeSync(encoder.encode('DEBUG: '));
    for (let i = 0; i < values.length; ++i) {
        const buf = encoder.encode(prettyPrint(values[i]));
        Deno.stderr.writeSync(buf);
        if (i != values.length - 1) {
            Deno.stderr.writeSync(encoder.encode(', '));
        }
    }
    Deno.stderr.writeSync(encoder.encode('\n'));
}
