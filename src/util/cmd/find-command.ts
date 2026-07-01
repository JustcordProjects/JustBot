import { Command } from '@/bot/command.ts';
import { CommandOpts } from '@/bot/config/schema.ts';
import { cfg } from '@/bot/cfg.ts';
import { getCommandConfig } from './get-command-config.ts';

export type FindResult = { command: Command; config: CommandOpts };

export default function findCommand(cmdName: string, cmds: Command[]): FindResult | null {
    for (const cmd of cmds) {
        const cmdCfg = getCommandConfig(cmd);
        const customConf = cfg.commands.configuration?.[cmd.name];
        const aliases = [...cmd.aliases, ...(customConf?.aliases ?? [])];
        if (cmd.name == cmdName || aliases.includes(cmdName)) {
            return { command: cmd, config: cmdCfg };
        }
    }
    return null;
}
