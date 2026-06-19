import { cfg, Config, overrideCfg, saveConfigurationChanges } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

const cmdBlockCmd: Command = {
    name: 'cmd-block',
    description: {
        main: 'Zablokuj komuś możliwość używania danej komendy.',
        short: 'Zablokuj komendę dla kogoś',
    },
    aliases: ['toggle-cmd-block'],
    expectedArgs: [
        {
            name: 'op',
            description: 'Operacja którą chcesz wykonać (add/rem/toggle)',
            type: { base: 'enum', options: ['add', 'rem', 'toggle'] as const },
            optional: true,
        },
        {
            name: 'cmd',
            description: 'komenda którą chcesz zablokować',
            type: { base: 'command-ref' },
            optional: false,
        },
        {
            name: 'target',
            description: 'użytkownik lub rola do zablokowania/odblokowania',
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

        if (target.type.base === 'role-mention') {
            return api.log.replyError(api, 'Błąd', 'Blokowanie komend dla ról nie jest wspierane w nowym API (restrictedCommands wspiera tylko użytkowników).');
        }

        const cmdName = cmd.name;
        const targetUserID = target.value.id;

        const currentRestricted = cfg.commands.restrictedCommands;
        const index = currentRestricted.findIndex((r) => r.commandName === cmdName && r.targetUserID === targetUserID);

        let opText: string;
        if (op === 'add') {
            if (index !== -1) return api.log.replyError(api, 'Błąd', 'Ta blokada już istnieje!');
            currentRestricted.push({ commandName: cmdName, targetUserID });
            opText = 'Zablokowano';
        } else if (op === 'rem') {
            if (index === -1) return api.log.replyError(api, 'Błąd', 'Ta blokada nie istnieje!');
            currentRestricted.splice(index, 1);
            opText = 'Odblokowano';
        } else {
            if (index !== -1) {
                currentRestricted.splice(index, 1);
                opText = 'Odblokowano';
            } else {
                currentRestricted.push({ commandName: cmdName, targetUserID });
                opText = 'Zablokowano';
            }
        }

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.restrictedCommands = currentRestricted;

        saveConfigurationChanges();
        api.log.replySuccess(api, 'Udało się!', `**${opText}** dostęp do komendy **${cmdName}** dla podanego celu!`);
    },
};

export default cmdBlockCmd;
