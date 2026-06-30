import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

import { db } from '@/apis/db/bot-db.ts';
import User from '@/apis/db/user.ts';

export const rankCmd: Command = {
    name: 'rank',
    aliases: [],
    description: {
        main: 'Sprawdź swoje miejsce w rankingu levela, jeśli nie jesteś w topce (looser btw)',
        short: 'Sprawdź swoje miejsce w rankingu xp',
    },
    flags: CommandFlags.None,

    expectedArgs: [
        {
            name: 'user',
            description: 'Użytkownik którego ranking chcesz sprawdzić',
            type: { base: 'user-mention' },
            optional: true,
        }
    ],

    permissions: {
        allowedRoles: null,
        allowedUsers: null,
    },

    async execute(api) {
        const userArg = api.getTypedArg('user', 'user-mention')?.value;
        const user = userArg?.user ?? api.invoker.user;

        const dbUser = new User(user.id);
        dbUser.ensureExists();

        const topLevel = await db.leveling.getTop();
        const levelRank = topLevel.findIndex((value) => value.id == dbUser.id);

        const topRep = await db.prestige.getTop();
        const repRank = topRep.findIndex((value) => value.id == dbUser.id);

        const topEco = await db.economy.getTopTotal();
        const ecoRank = topEco.findIndex((value) => value.id == dbUser.id);

        api.reply({
            embeds: [
                (api.log.getInfoEmbed(
                    'Twoje miejsce w rankingach',
                    `Aktualnie znajdujesz się:\n` +
                    `- na miejscu **${levelRank + 1}** w rankingu poziomów\n` +
                    `- na miejscu **${repRank + 1}** w rankingu prestiżu\n` +
                    `- na miejscu **${ecoRank + 1}** w rankingu ekonomii`
                ))
                .setThumbnail(user.displayAvatarURL())
            ]
        });
    }
};

export default rankCmd;
