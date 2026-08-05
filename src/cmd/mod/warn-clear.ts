import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { db } from '@/apis/db/bot-db.ts';
import { PredefinedColors } from '@/util/color.ts';
import { output } from '@/bot/logging.ts';
import { sendLog } from '@/log/send-log.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { WarnRaw } from '@/apis/db/db-defs.ts';

export default {
    name: 'warn-clear',
    aliases: ['clearwarn', 'warnusun'],
    description: {
        main: 'Usuwa warna o podanym ID. W dużym skrócie...',
        short: 'Usuwa warna',
    },
    flags: CommandFlags.Important,

    expectedArgs: [
        {
            name: 'id',
            type: { base: 'float' },
            description: 'No powiedz jaki warn...',
            optional: false,
        },
    ],
    permissions: CommandPermissions.modPlus(),

    async execute(api) {
        const warnIdArg = api.getTypedArg('id', 'float');

        if (!warnIdArg || isNaN(Number(warnIdArg.value))) {
            return api.log.replyError(api, 'Nieprawidłowe ID', 'Podaj numer ID warna do usunięcia.');
        }

        const warnId = Number(warnIdArg.value);

        try {
            const row = await db.selectOne('SELECT * FROM warns WHERE id = ?', [warnId]) as WarnRaw & { user_id: string };
            if (!row) {
                return api.log.replyError(
                    api,
                    'Nie znaleziono',
                    `Jak masz warnlist, co nie? No to masz tam w nawiasie ID. Te ID potrzebujemy.`,
                );
            }

            const delResult = await db.runSql('DELETE FROM warns WHERE id = ?', [warnId]);
            if (!delResult.changes) {
                return api.log.replyError(api, 'Błąd podczas usuwania', 'Spróbuj ponownie później.');
            }

            sendLog({
                color: PredefinedColors.DarkAqua,
                title: 'Pozbyto się warna!',
                description: `Usunięto warna o ID \`${warnId}\`.`,
                fields: [
                    {
                        name: 'Powód', value: row.reason_string
                    },
                    {
                        name: 'Dla', value: `<@${row.user_id}>`, inline: true
                    },
                    {
                        name: 'Od', value: `<@${row.moderator_id}>`, inline: true
                    }
                ]
            });

            return api.reply({
                embeds: [
                    new ReplyEmbed()
                        .setAuthor({ name: 'JustBOT' })
                        .setTitle(':white_check_mark: Warn usunięty')
                        .setDescription(`Warn o ID \`${warnId}\` został pomyślnie usunięty.`)
                        .addFields([
                            {
                                name: 'Powód', value: row.reason_string
                            },
                            {
                                name: 'Dla', value: `<@${row.user_id}>`
                            },
                            {
                                name: 'Od', value: `<@${row.moderator_id}>`
                            }
                        ])
                        .setColor(PredefinedColors.Green),
                ],
            });
        } catch (err) {
            output.warn(err);
            return api.log.replyError(api, 'Błąd bazy danych', 'Spróbuj ponownie później.');
        }
    },
} satisfies Command;
