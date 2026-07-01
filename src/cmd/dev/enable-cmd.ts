import { cfg, Config, overrideCfg, saveConfigurationChanges } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

export default {
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

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.configuration ??= {};
        overrideCfg.commands.configuration[name] ??= {};

        if (overrideCfg.commands.configuration[name].enabled !== false) {
            return api.log.replyError(api, 'Błąd', `Komenda **${name}** jest już włączona!`);
        }

        overrideCfg.commands.configuration[name].enabled = true;

        cfg.commands.configuration ??= {};
        cfg.commands.configuration[name] ??= {};
        cfg.commands.configuration[name].enabled = true;

        saveConfigurationChanges();

        api.log.replySuccess(api, 'Udało się!', `Włączono komendę **${name}**!`);
    },
} satisfies Command;