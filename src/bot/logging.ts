import { GuildTextBasedChannel } from 'discord.js';
import { cfg } from './cfg.ts';
import { client } from '@/client.ts';

export namespace output {
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

    export async function init() {
        try {
            stdoutChannel = await client.channels.fetch(cfg.channels.justbot.stdout) as GuildTextBasedChannel;
            stderrChannel = await client.channels.fetch(cfg.channels.justbot.stderr) as GuildTextBasedChannel;
            stdwarnChannel = await client.channels.fetch(cfg.channels.justbot.stdwarn) as GuildTextBasedChannel;
        } catch {}
    }

    export function log(...args: unknown[]) {
        const data = format(args);
        const prefixed = decorate('LOG', colors.CYAN, data);
        console.log(prefixed);
        send('stdout', data);
    }

    export function warn(...args: unknown[]) {
        const data = format(args);
        const prefixed = decorate('WARN', colors.YELLOW, data);
        console.warn(prefixed);
        send('stdwarn', data);
    }

    export function err(...args: unknown[]) {
        const data = format(args);
        const prefixed = decorate('ERR', colors.RED, data);
        console.error(prefixed);
        send('stderr', data);
    }

    export function verbose(...args: unknown[]) {
        if (Deno.env.get('JB_DEVELOPMENT') != 'true') return;
        const data = format(args);
        const prefixed = decorate('VERB', colors.GRAY, data);
        console.log(prefixed);
    }

    export function forward(raw: string) {
        send('stdout', raw);
    }
}

export const ft = output.colors;
