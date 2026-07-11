import * as dsc from 'discord.js';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { CommandAPI } from '@/bot/command/api.ts';

export default {
    name: 'clear',
    aliases: [],
    description: {
        main: 'Ktoś spami? Ta komenda pomoże Ci ogarnąć usuwanie wiadomości!',
        short: 'Wywala wiadomości!',
    },
    flags: CommandFlags.Important,

    expectedArgs: [
        {
            type: { base: 'int' },
            optional: false,
            name: 'amount',
            description: 'Liczba wiadomości do usunięcia',
        },
        {
            type: { base: 'user-mention' },
            optional: true,
            name: 'user',
            description: 'Opcjonalnie, usuń wiadomości tylko tego użytkownika',
        },
    ],
    permissions: CommandPermissions.modPlus(),

    async execute(api: CommandAPI) {
        const amount = Number(api.getTypedArg('amount', 'int')?.value);
        const who = api.getTypedArg('user', 'user-mention')?.value as dsc.GuildMember;

        if (!Number.isSafeInteger(amount) || amount > 98 || amount < 0) {
            return api.log.replyError(api, 'Zła ta liczba', 'Maksymalnie wolno usunąć 98 wiadomości, a minimalnie to musisz choć jedną dać.')
        }

        await api.log.replyInfo(api, 'Proszę', 'Aktualnie zaczynam się tym zajmować.');

        const channel = (api.raw.msg?.channel ?? api.raw.interaction?.channel!) as dsc.TextChannel;

        if (who) {
            const fetched = await channel.messages.fetch({ limit: 100 });
            const filtered = fetched
                .filter((m) => m.author.id === who.id && m.id !== api.invoker.id)
                .first(amount);

            await channel.bulkDelete(filtered, true);
        } else {
            const fetched = await channel.messages.fetch({ limit: amount + 2 });
            await channel.bulkDelete(fetched, true);
        }
    },
} satisfies Command;
