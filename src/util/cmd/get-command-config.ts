import { cfg } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandOpts } from '@/bot/config/schema.ts';

export function getCommandConfig(command: Command): CommandOpts {
    const defaultConf = cfg.commands.defaultConfiguration;
    const customConf = cfg.commands.configuration?.[command.name];
    if (customConf) {
        return { ...defaultConf, ...customConf };
    }
    return defaultConf;
}
