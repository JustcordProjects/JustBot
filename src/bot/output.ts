import { GuildTextBasedChannel } from 'discord.js';
import { cfg } from './cfg.ts';
import { client } from '@/client.ts';

function getLogFileName(): string {
    return new Date().toISOString().replaceAll(':', '-').replace('T', '_').split('.')[0] + '.log';
}

export namespace colors {
    export const RESET = '\x1b[0m';
    export const RED = '\x1b[31m';
    export const YELLOW = '\x1b[33m';
    export const CYAN = '\x1b[36m';
    export const GRAY = '\x1b[90m';
}

let stdoutChannel: GuildTextBasedChannel;
let stderrChannel: GuildTextBasedChannel;
let stdwarnChannel: GuildTextBasedChannel;

let logFile: Deno.FsFile | null = null;

function format(args: unknown[]): string {
    return args
        .map((arg) => {
            if (typeof arg == 'string')
                return arg.trim();

            return Deno.inspect(arg, {
                colors: false,
                depth: 4,
                compact: true,
            });
        }).join(', ').trimEnd();
}

function decorate(level: 'LOG' | 'WARN' | 'ERR' | 'VERB', color: string, msg: string): string {
    return msg
        .split('\n')
        .map((line) => `${colors.RESET}[${color} ${level} ${colors.RESET}] ${line}${colors.RESET}`)
        .join('\n');
}

async function send(where: 'stdout' | 'stderr' | 'stdwarn', msg: string) {
    let target: GuildTextBasedChannel | undefined;
    switch (where) {
    case 'stdout':
        target = stdoutChannel;
        break;
    case 'stderr':
        target = stderrChannel;
        break;
    case 'stdwarn':
        target = stdwarnChannel;
        break;
    }
    if (target) {
        try {
            await target.send(`at ${where}:\n\`\`\`ansi\n${msg.replaceAll('```', '`[second char]`')}\`\`\``);
        } catch {}
    }
}

function writeToFile(level: string, msg: string) {
    if (logFile == null) return;

    const text = msg
        .split('\n')
        .map(line => `[${new Date().toISOString()}] [${level}] ${line}\n`)
        .join('');

    try {
        const encoder = new TextEncoder();

        // NOTE: this IS an unawaited promise. I don't know if
        //       it's good, but  i guess there is no better way
        //       for now, because i don't want to make whole logger
        //       api async, and writeSync would affect performance
        logFile.write(encoder.encode(text))
            .catch(e => Deno.stderr.write(encoder.encode(e instanceof Error ? e.message : `${e}`)));
    } catch {}
}

export async function init() {
    try {
        if (cfg.bot.logsDirPath != null) {
            await Deno.mkdir(cfg.bot.logsDirPath, { recursive: true });
            logFile = await Deno.open(`${cfg.bot.logsDirPath}/${getLogFileName()}`, {
                create: true,
                write: true,
                append: true,
            });
        }
    } catch {}

    try {
        stdoutChannel = await client.channels.fetch(cfg.channels.justbot.stdout) as GuildTextBasedChannel;
        stderrChannel = await client.channels.fetch(cfg.channels.justbot.stderr) as GuildTextBasedChannel;
        stdwarnChannel = await client.channels.fetch(cfg.channels.justbot.stdwarn) as GuildTextBasedChannel;
    } catch {}
}

export function deinit() {
    if (logFile != null) {
        try {
            logFile.close();
        } catch {}
    }
}

export function log(...args: unknown[]) {
    const data = format(args);
    const prefixed = decorate('LOG', colors.CYAN, data);
    console.log(prefixed);
    send('stdout', data);
    writeToFile('INFO', data);
}

export function warn(...args: unknown[]) {
    const data = format(args);
    const prefixed = decorate('WARN', colors.YELLOW, data);
    console.warn(prefixed);
    send('stdwarn', data);
    writeToFile('WARN', data);
}

export function err(...args: unknown[]) {
    const data = format(args);
    const prefixed = decorate('ERR', colors.RED, data);
    console.error(prefixed);
    send('stderr', data);
    writeToFile('ERRR', data);
}

export function verbose(...args: unknown[]) {
    const active = Deno.env.get('JB_DEVELOPMENT') == 'true';

    const data = format(args);
    const prefixed = decorate('VERB', colors.GRAY, data);

    if (active) console.log(prefixed);
    if (active) send('stdwarn', data);
    writeToFile('VERB', data);
}

export function forward(raw: string) {
    send('stdout', raw);
}
