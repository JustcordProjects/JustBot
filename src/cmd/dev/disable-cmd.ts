import { cfg, Config, overrideCfg, saveConfigurationChanges } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/apis/commands/misc.ts';

const disableCommandCmd: Command = {
    name: 'cmd-disable',
    description: {
        main: 'Wyłącz komendę. Użyteczne czasami. Często nie.',
        short: 'Wyłącza komendę.',
    },
    aliases: [],
    expectedArgs: [
        {
            name: 'arg',
            description: 'Komenda.',
            type: { base: 'command-ref' },
            optional: false,
        },
    ],
    flags: CommandFlags.Important | CommandFlags.Unsafe,
    permissions: {
        allowedRoles: cfg.hierarchy.developers.allowedRoles,
        allowedUsers: cfg.hierarchy.developers.allowedUsers,
    },

    async execute(api) {
        const cmd = api.getTypedArg('arg', 'command-ref').value;
        const name = cmd.name;

        if (cfg.commands.disabledCommands.includes(name)) {
            return api.log.replyError(api, 'Błąd', `Komenda **${name}** jest już wyłączona!`);
        }

        cfg.commands.disabledCommands.push(name);

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.disabledCommands = cfg.commands.disabledCommands;

        saveConfigurationChanges();

        api.log.replySuccess(api, 'Udało się!', `Wyłączono komendę **${name}**!`);
    },
};

export default disableCommandCmd;
