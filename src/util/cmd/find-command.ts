import { Category, Command } from '@/bot/command.ts';
import { CommandOpts } from '@/bot/config/schema.ts';
import { cfg } from '@/bot/cfg.ts';
import { getCommandConfig } from './get-command-config.ts';

export type FindResult = { command: Command; category: Category; config: CommandOpts };

export default function findCommand(cmdName: string, cmdsMap: Map<Category, Command[]>): FindResult | null {
    for (const [cat, cmds] of cmdsMap.entries()) {
        for (const cmd of cmds) {
            const cmdCfg = getCommandConfig(cmd);
            const customConf = cfg.commands.configuration?.[cmd.name];
            const aliases = [...cmd.aliases, ...(customConf?.aliases ?? [])];
            if (cmd.name == cmdName || aliases.includes(cmdName)) {
                return { command: cmd, category: cat, config: cmdCfg };
            }
        }
    }
    return null;
}
