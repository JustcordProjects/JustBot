import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/apis/commands/misc.ts';
import { CommandAPI } from '@/bot/apis/commands/api.ts';
import { cfg } from '@/bot/cfg.ts';

import { PredefinedColors } from '@/util/color.ts';
import capitalizeFirst from '@/util/capitalize-first.ts';
import canExecuteCmd from '@/util/cmd/canExecuteCmd.ts';

import * as dsc from 'discord.js';
import { ReplyEmbed } from '@/bot/apis/translations/reply-embed.ts';
import { Category } from '../../bot/categories.ts';

function buildSelectMenu(commands: Map<Category, Command[]>): dsc.StringSelectMenuBuilder {
    return new dsc.StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('⚡ Wybierz kategorię...')
        .addOptions(
            [...commands.keys()].map((category: Category) => ({
                label: capitalizeFirst(category.name),
                value: category.name,
                emoji: category.emoji ?? undefined,
                description: category.shortDesc ?? undefined,
            })),
        );
}

function buildIntroEmbed(): ReplyEmbed {
    return new ReplyEmbed()
        .setTitle('📢 Moje komendy, władzco!')
        .setDescription(
            'Wybierz kategorię z menu poniżej, aby zobaczyć jej komendy!'
        )
        .setColor(PredefinedColors.Cyan);
}

function buildCategoryEmbed(
    category: Category,
    cmds: Command[],
    blockedCmds: string[] = [],
): ReplyEmbed {
    const embed = new ReplyEmbed()
        .setTitle(`${category.emoji} ${category.name}`)
        .setDescription(category.longDesc)
        .setColor(category.color);

    for (const cmd of cmds) {
        if (blockedCmds.includes(cmd.name)) continue;

        let formattedName = cmd.name;

        if (cmd.aliases.length === 1) {
            formattedName += ` *(a.k.a. \`${cfg.commands.prefix}${cmd.aliases[0]}\`)*`;
        } else if (cmd.aliases.length >= 2) {
            formattedName += ` *(a.k.a. \`${cfg.commands.prefix}${cmd.aliases[0]}\` i \`${cfg.commands.prefix}${cmd.aliases[1]}\`)*`;
        }

        embed.addFields({
            name: '',
            value: `**:star: ${cfg.commands.prefix}${formattedName}:** ${cmd.description.main}`,
            inline: false,
        });
    }

    if (!embed.toJSON().fields || !embed.toJSON().fields?.[0]) {
        embed.addFields({
            name: '',
            value: `W tej kategorii nic nie ma. Lub jest przestrzała.`,
            inline: false,
        });
    }

    return embed;
}

function getBlockedCommands(
    commands: Map<Category, Command[]>,
    categories: Set<Category>,
    member: dsc.GuildMember | dsc.User,
): string[] {
    const blocked: string[] = [];

    for (const category of categories) {
        const cmds = commands.get(category) ?? [];

        for (const cmd of cmds) {
            if (!canExecuteCmd(cmd, member)) blocked.push(cmd.name);
            else if (cmd.flags & CommandFlags.Deprecated) blocked.push(cmd.name);
        }
    }

    return blocked;
}

const helpCmd: Command = {
    name: 'help',
    aliases: ['pomoc', 'kolo-ratunkowe'],
    description: {
        main: 'Pokazuje losowe komendy z bota wraz z opisami, by w końcu nauczyć Twojego zapyziałego mózgu jego używania.',
        short: 'Ukazuje listę komend',
    },
    flags: CommandFlags.WorksInDM | CommandFlags.Spammy,

    permissions: {
        allowedRoles: null,
        allowedUsers: [],
    },

    expectedArgs: [
        {
            name: 'category',
            description: 'Kategoria',
            type: { base: 'string' },
            optional: true,
        },
    ],

    async execute(api: CommandAPI) {
        const { commands } = api;

        const argCategory = api.getTypedArg('category', 'string');

        const sendInteractiveMenu = async () => {
            const selectMenu = buildSelectMenu(commands);
            const row = new dsc.ActionRowBuilder<dsc.StringSelectMenuBuilder>().addComponents(selectMenu);

            const introEmbed = buildIntroEmbed();
            const replyMsg = await api.reply({ embeds: [introEmbed], components: [row] });

            const collector = replyMsg.createMessageComponentCollector({
                componentType: dsc.ComponentType.StringSelect,
                time: 60000,
                filter: (i) => i.user.id == api.invoker.id
            });

            collector.on('collect', async (interaction: dsc.StringSelectMenuInteraction) => {
                const chosenCategory = [...commands.keys()].find((c) => c.name === interaction.values[0]);

                if (!chosenCategory) 
                    return;

                const cmds = commands.get(chosenCategory) ?? [];
                const embed = buildCategoryEmbed(chosenCategory, cmds, []);

                await interaction.update({ embeds: [embed], components: [row] });
            });

            collector.on('end', async () => {
                const disabledRow = new dsc.ActionRowBuilder<dsc.StringSelectMenuBuilder>()
                    .addComponents(selectMenu.setDisabled(true));

                await replyMsg.edit({ components: [disabledRow] }).catch(() => {});
            });
        };

        if (!argCategory?.value) {
            await sendInteractiveMenu();
            return;
        }

        const val = argCategory.value;
        const categoriesToShow: Set<Category> = new Set();
 
        const category = Category.fromString(val);

        if (!category) {
            api.log.replyError(api, 'Nieznana kategoria', `Nie znam kategorii ${val}. Czy możesz powtórzyć?`);
            return;
        }

        categoriesToShow.add(category);

        const blockedCmds = getBlockedCommands(commands, categoriesToShow, api.invoker.member ?? api.invoker.user);

        const introEmbed = buildIntroEmbed();

        if (blockedCmds.length > 0) {
            introEmbed.addFields({
                name: ':confused: Mała informacja na początek!',
                value: `Pominąłem niektóre komendy, ponieważ nie możesz ich użyć lub są przestarzałe. Te komendy to: ${blockedCmds.join(', ')}.`,
            });
        }

        const allEmbeds: ReplyEmbed[] = [introEmbed];

        for (const category of categoriesToShow) {
            const cmds = commands.get(category) ?? [];
            allEmbeds.push(buildCategoryEmbed(category, cmds, blockedCmds));
        }

        await api.reply({ embeds: allEmbeds });
    },
};

export default helpCmd;
