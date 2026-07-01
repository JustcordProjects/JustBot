import * as dsc from 'discord.js';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { output } from '@/bot/logging.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { db } from '@/apis/db/bot-db.ts';

export default {
    name: 'topprestige',
    aliases: ['top-prestige', 'top-prestiżu'],
    description: {
        main: 'Czas popatrzeć na najbardziej renomowanych, dobrych i fajnych użytkowników serwera...',
        short: 'Topka prestiżu.',
    },
    flags: CommandFlags.None,

    permissions: {
        allowedRoles: null,
        allowedUsers: [],
    },
    expectedArgs: [],

    async execute(api) {
        const rows = await db.prestige.getTop(50);

        if (rows.length == 0) {
            await api.reply('Nie ma żadnego w bazie prestiżu :sob:');
        }

        const fields: dsc.APIEmbedField[] = [];
        let absCounter = 0;
        let realCounter = 0;

        for (const row of rows) {
            absCounter++;
            if (++realCounter > 12) break;

            try {
                const member = await api.guild?.members.fetch(row.id);
                if (!member) {
                    realCounter--;
                    continue;
                }

                fields.push({
                    name: `${absCounter} » ${member.user.username}`,
                    value: `Punktów prestiżu: ${await row.prestige.getPoints()}`,
                    inline: true,
                });
            } catch (e) {
                output.warn(e);
                realCounter--;
                continue;
            }
        }

        await api.reply({
            embeds: [
                new ReplyEmbed()
                    .setColor('#1ebfd5')
                    .setImage('https://raw.githubusercontent.com/JustcordProjects/JustBot/refs/heads/main/assets/top-lvl.png'),
                new ReplyEmbed()
                    .setFields(fields)
                    .setColor('#1ebfd5')
            ],
        });
    },
} satisfies Command;