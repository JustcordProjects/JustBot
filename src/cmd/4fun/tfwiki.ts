import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { PredefinedColors } from '@/util/color.ts';

import * as tfwiki from '@/apis/wiki/titanfall.ts';
import * as output from '@/bot/output.ts';
import * as dsc from 'discord.js';

import logError from '@/util/log-error.ts';

const MAX_LEN = 600;

function findBestImage(imgs: tfwiki.Image[], title: string): dsc.APIEmbedImage | undefined {
    if (imgs.length == 0) return undefined;

    const matches = imgs.filter(img =>
        img.title && img.title.toLowerCase().includes(title.toLowerCase())
    );

    if (matches.length > 0) {
        return matches.reduce((shortest, current) =>
            current.title.length < shortest.title.length ? current : shortest
        );
    }

    return { ...imgs[0] };
}

const tfwikiCmd: Command = {
    name: 'tfwiki',
    aliases: ['titanfall-wiki'],
    description: {
        main: 'Generalnie pobiera artykuł z Titanfall wiki. Niesamowicie użyteczne!',
        short: 'Pobiera rzecz z Titanfall wiki',
    },

    flags: CommandFlags.None | CommandFlags.WorksInDM,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'query',
            type: { base: 'string', trailing: true },
            optional: false,
            description: 'No, podaj jaki jest ten twój artykuł do pobrania!',
        },
    ],

    async execute(api) {
        const query = api.getTypedArg('query', 'string').value as string;

        let result: tfwiki.Page;
        try {
            result = await tfwiki.getPage(query);
        } catch (err: unknown) {
            if (err instanceof tfwiki.PageNotFoundError) {
                return api.log.replyError(
                    api, 'Nieznaleziono strony',
                    `Niestety ale taka strona jak ${query} nie istnieje w https://titanfall.wiki.gg!`
                )
            } else {
                logError('stderr', err, 'tfwiki command');
                return api.log.replyError(
                    api, 'Błąd',
                    'Wystąpił jakiś wewnętrzny błąd, nie wiem'
                );
            }
        }

        output.log(result);

        const desc = result.content.length > MAX_LEN-3
            ? result.content.slice(0, MAX_LEN-3) + '...'
            : result.content;

        return api.reply({
            embeds: [
                {
                    ...new ReplyEmbed()
                        .setColor(PredefinedColors.Green)
                        .setAuthor({ name: 'JustBOT' })
                        .setTitle(result.title)
                        .setURL(result.link)
                        .setDescription(desc)
                        .toJSON(),
                    thumbnail: findBestImage(result.images, result.title),
                }
            ]
        })
    },
};

export default tfwikiCmd;
