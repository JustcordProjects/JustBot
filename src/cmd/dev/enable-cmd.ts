import { cfg, Config, overrideCfg, saveConfigurationChanges } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

const enableCommandCmd: Command = {
    name: 'cmd-enable',
    description: {
        main: 'Włącz komendę. Użyteczne czasami. Często nie.',
        short: 'Włącza komendę.',
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
    flags: CommandFlags.Important,
    permissions: {
        allowedRoles: cfg.hierarchy.developers.allowedRoles,
        allowedUsers: cfg.hierarchy.developers.allowedUsers,
    },

    async execute(api) {
        const cmd = api.getTypedArg('arg', 'command-ref').value;
        const name = cmd.name;

        if (!cfg.commands.disabledCommands.includes(name)) {
            return api.log.replyError(api, 'Błąd', `Komenda **${name}** jest już włączona!`);
        }

        cfg.commands.disabledCommands = cfg.commands.disabledCommands.filter((c) => c !== name);

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.disabledCommands = cfg.commands.disabledCommands;

        saveConfigurationChanges();

        api.log.replySuccess(api, 'Udało się!', `Włączono komendę **${name}**!`);
    },
};

export default enableCommandCmd;
