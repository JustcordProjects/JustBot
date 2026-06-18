import * as dsc from 'discord.js';
import actionsManager from '@/features/actions/index.ts';

import { cfg } from '@/bot/cfg.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/apis/commands/misc.ts';
import { CommandAPI } from '@/bot/apis/commands/api.ts';
import { levelToXp, OnSetXpEvent } from '@/bot/level.ts';

const xpCmd: Command = {
    name: 'xpmod',
    aliases: ['lvlmod'],
    description: {
        main: 'Dodaj komuś levela... Jak nadużyjesz, no to, chyba nie wiesz z jaką siłą igrasz! Pospólstwo jak pomyśli, że sobie za darmoszkę doda poziomów, no to nie! Do widzenia.',
        short: 'Komenda dla adminów, by bawić się levelem...',
    },
    flags: CommandFlags.None | CommandFlags.Unsafe,

    permissions: {
        allowedRoles: cfg.features.leveling.canChangeXP,
        allowedUsers: [],
    },
    expectedArgs: [
        {
            type: { base: 'user-mention' },
            optional: false,
            name: 'user',
            description: 'Użytkownik, którego chcesz zjeść... lub mu delikatnie pomóc z levelem.',
        },
        {
            type: { base: 'enum', options: [ 'add', 'set', 'delete' ] },
            optional: false,
            name: 'action',
            description: 'Co chcesz zrobić z levelem? `add`, `set` lub `delete`',
        },
        {
            type: { base: 'float' },
            optional: false,
            name: 'amount',
            description: 'Ile levela lub XP chcesz dodać/ustawić/usunąć',
        },
        {
            type: { base: 'enum', options: [ 'xp', 'levels' ] },
            optional: true,
            name: 'affect',
            description: 'Czy dotyczy `levels` czy `xp` (domyślnie levels)',
        },
    ],

    async execute(api: CommandAPI) {
        const targetUser = api.getTypedArg('user', 'user-mention')?.value as dsc.GuildMember ?? api.invoker.member;
        const action = api.getEnumArg('action', ['add', 'set', 'delete'])?.value as string;
        let amount = api.getTypedArg('amount', 'float')?.value as number;
        const affect = api.getEnumArg('affect', ['xp', 'levels'])?.value ?? ('levels' as const);

        const shouldLeveler = affect === 'levels';
        if (shouldLeveler) {
            amount = levelToXp(amount, cfg.features.leveling.levelDivider);
        }

        await actionsManager.emit(OnSetXpEvent, {
            userID: targetUser.id,
            user: targetUser,
            guild: api.guild,
            action: action,
            amount: amount,
        });

        api.log.replySuccess(api, 'Udało się!', `Wykonałem akcję na użytkowniku **${targetUser.user.tag}**`);
    },
};

export default xpCmd;
