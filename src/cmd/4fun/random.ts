import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { db, ContentEntry } from '@/apis/db/bot-db.ts';
import { cfg } from '@/bot/cfg.ts';

export default {
    name: 'random',
    aliases: ['rand'],
    description: {
        main: 'Odkryj losową muzykę/filmy z naszej serwerowej bazy danych!',
        short: 'Dostań losowy utwór/film',
    },
    flags: CommandFlags.Spammy,

    expectedArgs: [
        {
            name: 'kind',
            description: 'typ kontentu (music/video)',
            type: { base: 'string', trailing: true },
            optional: false,
        }
    ],

    permissions: {
        allowedRoles: null,
        allowedUsers: null,
    },

    async execute(api) {
        const kind = api.getTypedArg('kind', 'string').value!;

        const cids = cfg.features.contentDatabases.map(cdb => cdb.id);
        if (!cids.includes(kind)) {
            return api.log.replyError(
                api, 'Nieznany typ kontentu',
                `Spróbuj: ${cids.join(', ')}`
            );
        }

        let content: ContentEntry | undefined = undefined;

        for (let i = 0; i < 5; i++) {
            content = await db.content.getRandomEntry(kind);

            if (!content) break;
            if (![api.executor.id, ...(await api.executor.fetchAlternativeAccounts())].includes(content.authorId)) break;
        }

        if (!content) {
            return api.log.replyError(
                api, 'Pustka totalna',
                'No w skrócie to nasza serwerowa baza kontentu™ jest aktualnie pusta, więc nic nie dostaniesz!',
            );
        }

        return api.reply({
            content: `polecam zasugerowane przez <@${content.authorId}> ${content.contentUrl}`,
            allowedMentions: {
                parse: [],
            },
        });
    },
} satisfies Command;