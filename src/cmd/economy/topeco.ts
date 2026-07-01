import * as output from '@/bot/output.ts';
import * as dsc from 'discord.js';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

import { db } from '@/apis/db/bot-db.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { cfg } from '@/bot/cfg.ts';

const ecoRoles = cfg.features.economy.roles.filter((x) => x.id.includes('vip')).map((x) => x.discordRoleId);

const topecoCmd: Command = {
    name: 'topeco',
    aliases: ['topmoney'],
    description: {
        main: 'Janusze biznesu z Allegro. Kup procesor za 10 THz (10 tyś. GHz) za JEDYNE 10 ZŁOTYCH!',
        short: 'Janusze biznesu z Allegro.',
    },
    flags: CommandFlags.None,

    permissions: {
        allowedRoles: null,
        allowedUsers: [],
    },
    expectedArgs: [],

    async execute(api) {
        try {
            const topUsers = await db.economy.getTopTotal(12);

            if (!topUsers.length) {
                return api.log.replyError(api, 'Zero pieniędzy', 'Nie ma żadnego w bazie usera z hajsem :sob:');
            }

            const fields: dsc.APIEmbedField[] = [];
            let i = 0;

            for (const user of topUsers) {
                if (++i === 25) return;

                try {
                    const member = await api.guild!.members.fetch(user.id);
                    const userEcoRole = ecoRoles.filter((id) => member.roles.cache.has(id)).at(-1);
                    const balance = await user.economy.getBalance();

                    fields.push({
                        name: `${i} » ${member.user.username}`,
                        value: [
                            `${userEcoRole ? `<@&${userEcoRole}>` : `<@&${cfg.features.welcomer.freeRolesForEveryone[0]}>`}`,
                            `**${balance.wallet.add(balance.bank).format()}**`,
                        ].join('\n'),
                        inline: true,
                    });
                } catch {}
            }

            return api.reply({
                embeds: [
                    new ReplyEmbed()
                        .setFields(fields)
                        .setColor('#1ebfd5'),
                ],
            });
        } catch (err) {
            output.err(err);
            return api.log.replyError(api, 'Błąd pobierania topki', 'Pytaj twórców biblioteki sqlite3...');
        }
    },
};

export default topecoCmd;
