import * as compile from '@/apis/compile/driver.ts';
import { output } from '@/bot/logging.ts';

export function doIsAvailable(): boolean {
    return Deno.env.get('JB_ZAPBOX_PATH') != undefined;
}

let initialized: boolean = false;

export async function doInit() {
    const exePath = Deno.env.get('JB_ZAPBOX_PATH')
    if (!exePath) return;

    const cmd = new Deno.Command(exePath, {
        args: ['setup'],
    });
    const out = await cmd.output();

    if (out.code != 0) {
        output.err('failed to initialize zapbox:');
        output.err(new TextDecoder().decode(out.stderr));
    } else {
        output.verbose('zapbox initialized');
        initialized = true;
    }
}

namespace Zapbox {
    export type MessageKind = 'stdout' | 'stderr';

    export interface Message {
        kind:    MessageKind;
        content: string;
    }

    export interface ExecResult {
        messages: Message[];
        exitcode: number;
    }

    export interface Input {
        src:    string;
        stdin?: string;
    }

    export enum Status {
        Success = 'success',
        UnknownError = 'error',
        TimeLimitExceeded = 'time-limit-exceeded',
        MemLimitExceeded = 'mem-limit-exceeded',
    }

    export interface Output {
        status:   Status;
        compiler: ExecResult;
        runtime?: ExecResult;
    }
}

export class ZapCompilerDriver implements compile.Driver {
    private readonly exePath: string;

    constructor() {
        const exePath = Deno.env.get('JB_ZAPBOX_PATH');
        if (!exePath) {
            throw new Error('No zapbox path provided');
        }
        this.exePath = exePath;
    }

    async info(): Promise<compile.Info> {
        return {
            lang: 'zap',
            displayName: 'Zap',
            version: 'v0.2.0', // TODO: don't hard code version
            backend: 'Zapbox',
        };
    }

    async runZapbox(input: Zapbox.Input): Promise<Zapbox.Output | { internalError: string }> {
        const cmd = new Deno.Command(this.exePath, {
            args: ['run', JSON.stringify(input)],
            stdout: 'piped',
            stderr: 'piped',
        });
        const out = await cmd.output();

        output.log('zapbox run output:');
        output.log(out);

        if (out.code != 0) {
            const message = new TextDecoder().decode(out.stderr);
            return { internalError: message };
        }

        try {
            const outputString = new TextDecoder().decode(out.stdout);
            return JSON.parse(outputString) as Zapbox.Output;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : `${err}`;
            return { internalError: message };
        }
    }

    mapMessages(msgs: Zapbox.Message[]): { stdout: string; stderr: string; } {
        let stdout = '', stderr = '';
        for (const msg of msgs) {
            switch (msg.kind) {
            case 'stdout': stdout += msg.content; break;
            case 'stderr': stderr += msg.content; break;
            }
        }
        return { stdout, stderr };
    }

    mapStatus(s: Zapbox.Status): compile.Status {
        switch (s) {
        case Zapbox.Status.Success:
            return compile.Status.Success;
        case Zapbox.Status.UnknownError:
            return compile.Status.InternalError;
        case Zapbox.Status.TimeLimitExceeded:
            return compile.Status.TimeLimitExceeded;
        case Zapbox.Status.MemLimitExceeded:
            return compile.Status.MemLimitExceeded;
        }
    }

    async compile(input: compile.Input): Promise<compile.Output> {
        if (!initialized) {
            return {
                status: compile.Status.InternalError,
                compile: {
                    messages: [ { kind: 'stderr', content: 'zapbox not fully initialized, please wait a while and run the command again or conbtact bot developers' } ],
                    exitcode: 127
                },
                runtime: null
            }
        }

        const zapboxInput: Zapbox.Input = {
            src: input.source,
            stdin: input.stdin,
        };

        const zapboxOutput = await this.runZapbox(zapboxInput);
        output.log('zapbox compile() result:');
        output.log(zapboxOutput);

        if ('internalError' in zapboxOutput) {
            return {
                status: compile.Status.InternalError,
                compile: {
                    messages: [{ kind: 'stderr', content: zapboxOutput.internalError }],
                    exitcode: -1,
                },
                runtime: null,
            };
        }

        const compileRes: compile.ExecResult = {
            messages: zapboxOutput.compiler.messages.map(m => ({
                kind: m.kind as 'stdout' | 'stderr',
                content: m.content
            })),
            exitcode: zapboxOutput.compiler.exitcode,
        };

        let runtimeRes: compile.ExecResult | null = null;
        if (zapboxOutput.runtime) {
            runtimeRes = {
                messages: zapboxOutput.runtime.messages.map(m => ({
                    kind: m.kind as 'stdout' | 'stderr',
                    content: m.content
                })),
                exitcode: zapboxOutput.runtime.exitcode,
            };
        }

        return {
            status: this.mapStatus(zapboxOutput.status),
            compile: compileRes,
            runtime: runtimeRes,
        };
    }
}
