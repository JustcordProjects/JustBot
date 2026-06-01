import { output } from '../../logging.ts';
import { CompilerDriver, CompilerErrorKind, CompilerInfo, CompilerInput, CompilerOutput } from './driver.ts';

export function isAvailable(): boolean {
    return Deno.env.get('JB_ZAPBOX_PATH') != undefined;
}

export async function init() {
    const exePath = Deno.env.get('JB_ZAPBOX_PATH')
    if (!exePath) return;
    
    const cmd = new Deno.Command(exePath, {
        args: ['build'],
    });
    const out = await cmd.output();

    if (out.code != 0) {
        output.err('failed to build zapbox image:');
        output.err(new TextDecoder().decode(out.stderr));
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
        InternalError = 'internal',
        TimeLimitExceeded = 'time-limit-exceeded',
        MemLimitExceeded = 'mem-limit-exceeded',
    }

    export type Output = {
        status:   Exclude<Status, Status.InternalError>;
        compiler: ExecResult;
        runtime?: ExecResult;
    } | {
        status: Status.InternalError,
        message: string;
    };
}

export class ZapCompilerDriver implements CompilerDriver {
    private readonly exePath: string;

    constructor() {
        const exePath = Deno.env.get('JB_ZAPBOX_PATH');
        if (!exePath) {
            throw new Error('No zapbox path provided');
        }
        this.exePath = exePath;
    }

    async info(): Promise<CompilerInfo> {
        return {
            lang: 'zap',
            displayName: 'Zap',
            version: 'v0.2.0', // TODO: don't hard code version
            backend: 'Zapbox',
        };
    }

    async runZapbox(input: Zapbox.Input): Promise<Zapbox.Output> {
        const cmd = new Deno.Command(this.exePath, {
            args: ['run', JSON.stringify(input)],
            stdout: 'piped',
            stderr: 'piped',
        });
        const out = await cmd.output();

        if (out.code != 0) {
            const message = new TextDecoder().decode(out.stderr);
            return { status: Zapbox.Status.InternalError, message };
        }

        try {
            const outputString = new TextDecoder().decode(out.stdout);
            return JSON.parse(outputString) as Zapbox.Output;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : `${err}`;
            return { status: Zapbox.Status.InternalError, message };
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

    mapErr(s: Zapbox.Status, r: boolean): CompilerErrorKind {
        if (!r) return CompilerErrorKind.Compile;
        switch (s) {
        case Zapbox.Status.Success:
        case Zapbox.Status.InternalError:
            throw Error("invalid argument passed to mapErr");

        case Zapbox.Status.UnknownError:
            return CompilerErrorKind.Internal;
        case Zapbox.Status.TimeLimitExceeded:
            return CompilerErrorKind.Timeout;
        case Zapbox.Status.MemLimitExceeded:
            return CompilerErrorKind.Memory;
        }
    }

    async compile(input: CompilerInput): Promise<CompilerOutput> {
        const zapboxInput: Zapbox.Input = {
            src: input.source,
            stdin: input.stdin,
        };
        
        const zapboxOutput = await this.runZapbox(zapboxInput);
        if (zapboxOutput.status == Zapbox.Status.InternalError) {
            return {
                ok: false, errKind: CompilerErrorKind.Internal,
                errMessage: zapboxOutput.message,
            };
        }

        let { stdout, stderr } = this.mapMessages(zapboxOutput.compiler.messages);
        let exitcode = zapboxOutput.compiler.exitcode;

        if (zapboxOutput.runtime) {
            const mapped = this.mapMessages(zapboxOutput.runtime.messages);
            stdout += mapped.stdout; stderr += mapped.stderr;
            exitcode = zapboxOutput.runtime.exitcode;
        }

        if (zapboxOutput.status == Zapbox.Status.Success) {
            return {
                ok: true,
                exitcode,
                stdout, stderr,
            };
        } else {
            return {
                ok: false,
                errKind: this.mapErr(zapboxOutput.status, !!zapboxOutput.runtime),
                errMessage: stderr,
            }
        }
    }
}
