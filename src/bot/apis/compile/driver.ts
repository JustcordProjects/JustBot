export interface Info {
    lang: string;
    displayName: string;
    version: string;
    backend: string;
} 
    
export interface Input {
    source: string;
    stdin: string;
}

export enum Status {
    Success,
    InternalError,
    TimeLimitExceeded,
    MemLimitExceeded,
}

export interface Message {
    kind: 'stdout' | 'stderr';
    content: string;
}

export interface ExecResult {
    messages: Message[];
    exitcode: number;
}

export interface Output {
    status:  Status;
    compile: ExecResult;
    runtime: ExecResult | null;
}

export interface Driver {
    info(): Promise<Info>;
    compile(input: Input): Promise<Output>;
} 
