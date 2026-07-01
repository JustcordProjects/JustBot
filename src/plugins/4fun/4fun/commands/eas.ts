import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { PredefinedColors } from '@/util/color.ts';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';

interface WeatherAPIReply {
    type: string; // should be FeatureCollection
    features: {
        type: string; // should be Feature
        properties: {
            messageType: string; // should be Alert or Update
            event: string; // should NOT be Test Message
            headline: string;
            description: string;
            instruction: string;
            status: string; // should be Actual
            parameters: {
                BLOCKCHANNEL: string[]; // should include EAS
            };
        };
    }[];
}

const easCmd: Command = {
    name: 'emergency-alert-system',
    aliases: ['eas'],
    description: {
        main: 'Przeglądaj sobie ostrzeżenia EAS (Emergency Alert System) ze Stanów Zjednoczonych.',
        short: 'Zobacz alerty EAS',
    },

    flags: CommandFlags.None | CommandFlags.Spammy,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [],

    async execute(api) {
        const reply = await api.log.replyInfo(api, 'Fetchuję i przetwarzam dane', 'Ilość tych danych jest masywna, więc to chwilę zajmie...');

        // for now only weather eas warnings, more will be added here if found
        const data = await fetch(`https://api.weather.gov/alerts/active`).then((r) => r.json()) as WeatherAPIReply;
        if (data.type !== 'FeatureCollection' || typeof data.features !== 'object') {
            return await reply.edit({
                embeds: [
                    api.log.getErrorEmbed('API się zjebało', 'To prawdopodobnie nie jest moja wina, tylko rząd USA coś z serwerami odwala idk'),
                ],
            });
        }

        const warnings: {
            title: string;
            headline: string;
            description: string;
            instruction: string;
        }[] = [];

        for (const warn of data.features) {
            if (
                warn.type !== 'Feature' ||
                warn.properties.status !== 'Actual' ||
                ['Test Message', 'Small Craft Advisory'].includes(warn.properties.event) ||
                !['Update', 'Actual'].includes(warn.properties.messageType) ||
                !warn.properties.parameters.BLOCKCHANNEL.includes('EAS')
            ) continue;

            warn.properties.description = warn.properties.description?.replaceAll('\n', ' ') ?? "nothing here";
            warn.properties.instruction = warn.properties.instruction?.replaceAll('\n', ' ') ?? "nothing here";

            warnings.push({
                title: warn.properties.event,
                headline: warn.properties.headline,
                description: warn.properties.description,
                instruction: warn.properties.instruction,
            });
        }

        if (warnings.length == 0) {
            return await reply.edit({
                embeds: [api.log.getSuccessEmbed('Ameryka jest szczęśliwa!', 'Aktualnie nie ma żadnych ostrzeżeń.')],
            });
        }

        let index = 0;

        const buildEmbed = (i: number) => {
            const w = warnings[i];

            return new ReplyEmbed()
                .setTitle(`🚨 ${w.title}`)
                .setDescription(`\`\`\`${w.headline}\n\n${w.description}\n\n${w.instruction}\`\`\``)
                .setColor(PredefinedColors.Red);
        };

        const buildComponents = () => [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('random')
                    .setLabel('🎲')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary),
            ),
        ];

        const message = await reply.edit({
            embeds: [  buildEmbed(index)  ],
            components: buildComponents(),
        });

        const collector = message.createMessageComponentCollector({
            time: 120000,
        });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'back') {
                index = (index - 1 + warnings.length) % warnings.length;
            }

            if (interaction.customId === 'next') {
                index = (index + 1) % warnings.length;
            }

            if (interaction.customId === 'random') {
                index = Math.floor(Math.random() * warnings.length);
            }

            await interaction.update({
                embeds: [buildEmbed(index)],
                components: buildComponents(),
            });
        });

        collector.on('end', async () => {
            await reply.edit({
                components: [],
            });
        });
    },
};

export default easCmd;
