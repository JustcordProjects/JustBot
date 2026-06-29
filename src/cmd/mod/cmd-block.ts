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

        const cmdName = cmd.name;
        const targetType = target.type.base === 'user-mention' ? 'user' : 'role';
        const targetID = target.value.id;

        overrideCfg.commands ??= {} as unknown as Config['commands'];
        overrideCfg.commands.configuration ??= {};
        overrideCfg.commands.configuration[cmdName] ??= {};

        cfg.commands.configuration ??= {};
        cfg.commands.configuration[cmdName] ??= {};

        const listName = targetType === 'user' ? 'disallowedUsers' : 'disallowedRoles';

        overrideCfg.commands.configuration[cmdName][listName] ??= [];
        cfg.commands.configuration[cmdName][listName] ??= [];

        const currentList = overrideCfg.commands.configuration[cmdName][listName] as string[];
        const index = currentList.indexOf(targetID);

        let opText: string;
        if (op === 'add') {
            if (index !== -1) return api.log.replyError(api, 'Błąd', 'Ta blokada już istnieje!');
            currentList.push(targetID);
            opText = 'Zablokowano';
        } else if (op === 'rem') {
            if (index === -1) return api.log.replyError(api, 'Błąd', 'Ta blokada nie istnieje!');
            currentList.splice(index, 1);
            opText = 'Odblokowano';
        } else {
            if (index !== -1) {
                currentList.splice(index, 1);
                opText = 'Odblokowano';
            } else {
                currentList.push(targetID);
                opText = 'Zablokowano';
            }
        }

        cfg.commands.configuration[cmdName][listName] = currentList;

        saveConfigurationChanges();
        api.log.replySuccess(api, 'Udało się!', `**${opText}** dostęp do komendy **${cmdName}** dla podanego celu!`);
    },
};

export default cmdBlockCmd;
