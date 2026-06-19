import { cfg, Config, overrideCfg, saveConfigurationChanges } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

const cooldownBypassCmd: Command = {
    name: 'cooldown-bypass',
    description: {
        main: 'Dodaj użytkownika lub rolę do listy bez cooldownu dla danej komendy.',
        short: 'Dodaj bypass cooldownu.',
    },
    aliases: ['toggle-cooldown-bypass'],
    expectedArgs: [
        {
            name: 'op',
            description: 'Operacja którą chcesz wykonać (add/rem/toggle)',
            type: { base: 'enum', options: ['add', 'rem', 'toggle'] as const },
            optional: true,
        },
        {
            name: 'cmd',
            description: 'komenda dla której nałozyć bypass',
            type: { base: 'command-ref' },
            optional: false,
        },
        {
            name: 'target',
            description: 'użytkownik lub roli do nałożenia bypassa',
            type: {
                base: 'union',
                variants: [
                    { base: 'user-mention', includeRefMessageAuthor: true },
                    { base: 'role-mention' },
                ],
            },
            optional: false,
        },
    ],
    flags: CommandFlags.None,
    permissions: {
        allowedRoles: [cfg.hierarchy.administration.headMod, cfg.hierarchy.administration.admin, cfg.hierarchy.administration.headAdmin],
        allowedUsers: [],
    },

    async execute(api) {
        const op = api.getEnumArg('op', ['add', 'rem', 'toggle'])?.value ?? 'toggle';
        const cmd = api.getTypedArg('cmd', 'command-ref')?.value;
        const target = api.getTypedArg('target', ['user-mention', 'role-mention']);

        const cmdName = cmd.name;
        const targetType = target.type.base === 'user-mention' ? 'user' : 'role';
        const targetID = target.value.id;

        const currentBypasses = cfg.commands.cooldownBypasses;
        const index = currentBypasses.findIndex((b) => b.commandName === cmdName && b.targetID === targetID && b.targetType === targetType);

        let opText: string;
        if (op === 'add') {
            if (index !== -1) return api.log.replyError(api, 'Błąd', 'Ten bypass już istnieje!');
            currentBypasses.push({ commandName: cmdName, targetID, targetType });
            opText = 'Dodano';
        } else if (op === 'rem') {
            if (index === -1) return api.log.replyError(api, 'Błąd', 'Ten bypass nie istnieje!');
            currentBypasses.splice(index, 1);
            opText = 'Usunięto';
        } else {
            if (index !== -1) {
                currentBypasses.splice(index, 1);
                opText = 'Usunięto';
            } else {
                currentBypasses.push({ commandName: cmdName, targetID, targetType });
                opText = 'Dodano';
            }
        }

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.cooldownBypasses = currentBypasses;

        saveConfigurationChanges();
        return api.log.replySuccess(
            api,
            'Udało się!',
            `${opText} bypass cooldownu **${cmdName}** dla podanego celu!`,
        );
    },
};

export default cooldownBypassCmd;
