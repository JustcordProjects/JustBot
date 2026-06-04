import * as compile from '@/bot/apis/compile/driver.ts';

export interface WandboxOptions {
    compiler: string;
    options?: string;
    compilerOptionRaw?: string;
    runtimeOptionRaw?: string;
}

interface WandboxCompiler {
    name: string;
    language: string;
    version: string;
    'display-name'?: string;

    'compiler-option-raw'?: boolean;
    'runtime-option-raw'?: boolean;

    switches?: unknown[];
}

export class WandboxCompilerDriver implements compile.Driver {
    private readonly compiler: string;
    private readonly options: string;
    private readonly compilerOptionRaw: string;
    private readonly runtimeOptionRaw: string;

    constructor(config: WandboxOptions) {
        this.compiler = config.compiler;
        this.options = config.options ?? '';
        this.compilerOptionRaw = config.compilerOptionRaw ?? '';
        this.runtimeOptionRaw = config.runtimeOptionRaw ?? '';
    }

    static async fetchCompilers() {
        const response = await fetch('https://wandbox.org/api/list.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch compiler list: ${response.status} ${response.statusText}`);
        }

        return await response.json() as WandboxCompiler[];
    }

    static async fetchCompilerNames(): Promise<string[]> {
        return (await this.fetchCompilers()).map((entry) => entry.name);
    }

    async info(): Promise<compile.Info> {
        const compilers = await WandboxCompilerDriver.fetchCompilers();
        const compiler = compilers.find((c) => c.name === this.compiler);
        if (!compiler) {
            return {
                lang: 'unknown',
                displayName: this.compiler,
                version: 'unknown',
                backend: 'Wandbox',
            };
        }

        return {
            lang: compiler.language,
            displayName: compiler['display-name'] ?? compiler.name,
            version: compiler.version,
            backend: 'Wandbox',
        };
    }

    async compile(input: compile.Input): Promise<compile.Output> {
        try {
            const body = {
                compiler: this.compiler,
                code: input.source,
                stdin: input.stdin,
                options: this.options,
                'compiler-option-raw': this.compilerOptionRaw,
                'runtime-option-raw': this.runtimeOptionRaw,
                save: false,
            };

            const response = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                return {
                    status: compile.Status.InternalError,
                    compile: {
                        messages: [{ kind: 'stderr', content: `Wandbox API error: ${response.status} ${response.statusText}` }],
                        exitcode: -1,
                    },
                    runtime: null,
                };
            }

            const data = await response.json();

            if (data.error) {
                return {
                    status: compile.Status.InternalError,
                    compile: {
                        messages: [{ kind: 'stderr', content: data.error }],
                        exitcode: -1,
                    },
                    runtime: null,
                };
            }

            if (data.signal === 'Killed' || data.signal === 'SIGKILL' || data.status === '137' || data.status === '124') {
                return {
                    status: compile.Status.TimeLimitExceeded,
                    compile: {
                        messages: [{ kind: 'stderr', content: 'Execution timed out or exceeded resource limits' }],
                        exitcode: -1,
                    },
                    runtime: null,
                };
            }

            const exitcode = parseInt(data.status ?? '0', 10);
            const compileLog = (data.compiler_message ?? `${data.compiler_output ?? ''}${data.compiler_error ?? ''}`).trim();
            const progOut = (data.program_output ?? '').trim();
            const progErr = (data.program_error ?? '').trim();

            const isCompileError = exitcode !== 0 && compileLog && !progOut && !progErr;

            const compileMessages: compile.Message[] = [
                ...(data.compiler_output?.split('\n').filter(Boolean).map((content: string) => ({ kind: 'stdout' as const, content })) ?? []),
                ...(data.compiler_error?.split('\n').filter(Boolean).map((content: string) => ({ kind: 'stderr' as const, content })) ?? []),
            ];

            let runtime: compile.ExecResult | null = null;
            if (!isCompileError) {
                runtime = {
                    messages: [
                        ...(data.program_output?.split('\n').filter(Boolean).map((content: string) => ({ kind: 'stdout' as const, content })) ?? []),
                        ...(data.program_error?.split('\n').filter(Boolean).map((content: string) => ({ kind: 'stderr' as const, content })) ?? []),
                    ],
                    exitcode,
                };
            }

            return {
                status: compile.Status.Success,
                compile: {
                    messages: compileMessages,
                    exitcode: isCompileError ? exitcode : 0,
                },
                runtime,
            };
        } catch (error: unknown) {
            return {
                status: compile.Status.InternalError,
                compile: {
                    messages: [{ kind: 'stderr', content: error instanceof Error ? error.message : String(error) }],
                    exitcode: -1,
                },
                runtime: null,
            };
        }
    }
}
