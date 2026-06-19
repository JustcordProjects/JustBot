import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { mkMessageReferenceEmbed } from '@/bot/templates/message-reference.ts';
import { PredefinedColors } from '@/util/color.ts';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message } from 'discord.js';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import User from '@/apis/db/user.ts';

export default {
    name: 'votepin',
    aliases: ['vpin'],
    description: {
        main: 'Robi głosowanie i jeżeli odpowiednia ilość osób się zgłosi to przypina wiadomość.',
        short: 'Tworzy głosownie aby przypiąć wiadomość.'
    },

    flags: CommandFlags.None,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'message', description: 'Link do wiadomości',
            type: { base: 'message-ref', includeRefMessage: true },
            optional: false
        }
    ],

    async execute(api) {
        const MIN_VOTES = 4;
        const TIME = 60_000;
        const EXPIRES_AT = Date.now() + TIME;

        const quotedMsg = api.getTypedArg('message', 'message-ref').value;
        const msg = await mkMessageReferenceEmbed(quotedMsg, { color: PredefinedColors.DarkRed });

        function buildVoteUI(quoted: Message, embed: ReplyEmbed, expiresAt: number, votes: number) {
            return {
                embeds: [
                    new ReplyEmbed()
                        .setTitle('📌 Przypnij wiadomość')
                        .setDescription([
                            `Użytkownik <@${api.executor.id}> chce przypiąć wiadomość od <@${quoted.author.id}>: https://discord.com/channels/${quoted.guildId}/${quoted.channelId}/${quoted.id}`,
                            '',
                            `**Głosów:** ${votes}/${MIN_VOTES}`,
                            `**Głosowanie wygasa** <t:${Math.floor(expiresAt / 1000)}:R>`
                        ].join('\n'))
                        .setColor(PredefinedColors.DarkRed),
                    embed
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setLabel('Przypinaj!')
                                .setCustomId('pin-signal')
                        )
                ]
            };
        }

        if (msg.quotedMsg.pinned)
            return await api.log.replyInfo(api, 'Nie tym razem', 'Ta wiadomość już została przez kogoś przypięta. Nie możesz jej przypiąć ponownie');

        const votes: string[] = [ api.executor.id ];
        let finished = false;
        const reply = await api.reply(buildVoteUI(msg.quotedMsg, msg.embed, EXPIRES_AT, votes.length));
        const collector = reply.createMessageComponentCollector({
            time: TIME,
            componentType: ComponentType.Button
        });
        collector.on('collect', async (interaction) => {
            if (interaction.customId !== 'pin-signal') return;
            await interaction.deferReply({ flags: ['Ephemeral'] });

            const voter = new User(interaction.user.id);
            if (votes.includes(voter.id)) {
                return await interaction.editReply({
                    embeds: [
                        api.log.getErrorEmbed('Już zagłosowałeś!', 'Jedno z Twoich kont już zagłosowało. Daj szansę innym, a po za tym to nie oszukuj.')
                    ]
                });
            }
            votes.push(voter.id);

            await interaction.editReply({
                embeds: [
                    api.log.getSuccessEmbed('Zagłosowałeś!', 'Pomyślnie zagłosowałeś w tej ankiecie!')
                ]
            });

            if (votes.length == MIN_VOTES) {
                finished = true;

                await msg.quotedMsg.fetch(true);
                if (msg.quotedMsg.pinned) {
                    return await reply.edit({
                        embeds: [ api.log.getInfoEmbed('Nie tym razem', 'Ta wiadomość już została przez kogoś przypięta. Nie możesz jej przypiąć ponownie') ],
                        components: []
                    });
                }

                await msg.quotedMsg.pin('votepin command successfull');

                await reply.edit({
                    embeds: [
                        api.log.getSuccessEmbed('Udało się!', 'Zagłosowała odpowiednia, wymagana ilość osób w wymaganym czasie, więc pomyślnie przypiąłem tę wiadomość.')
                    ],
                    components: []
                });
            } else {
                await reply.edit(buildVoteUI(msg.quotedMsg, msg.embed, EXPIRES_AT, votes.length))
            }
        });
        collector.on('end', () => {
            if (finished) return;
            reply.edit({
                embeds: [
                    api.log.getErrorEmbed('Nie udało się!', 'Zbyt mało osób zagłosowało, by można było przypiąć tę wiadomość. Możesz spróbować ponownie.')
                ],
                components: [],
            });
        })
    },
} satisfies Command;
