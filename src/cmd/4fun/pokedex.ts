import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';

import pokedex from '@/apis/pokedex/pokedex.ts';

import * as dsc from 'discord.js';

import capitalizeFirst from '@/util/capitalize-first.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { PredefinedColors } from '@/util/color.ts';

const pokedexSpeciesColorMap: Record<string, dsc.ColorResolvable> = {
    'black': PredefinedColors.NotQuiteBlack,
    'blue': PredefinedColors.Blue,
    'brown': PredefinedColors.Brown,
    'gray': PredefinedColors.DarkGrey,
    'green': PredefinedColors.Green,
    'pink': PredefinedColors.Pink,
    'purple': PredefinedColors.Purple,
    'red': PredefinedColors.Red,
    'white': PredefinedColors.White,
    'yellow': PredefinedColors.Yellow,
};

export default {
    name: 'pokedex',
    aliases: ['pokemon'],
    description: {
        main: 'Dowiedz się więcej o podanym pokemonie',
        short: 'Info o danym pokemonie',
    },
    flags: CommandFlags.None,

    expectedArgs: [
        {
            name: 'name',
            description: 'Nazwa pokemona',
            optional: false,
            type: { base: 'string', trailing: true },
        }
    ],

    permissions: {
        allowedRoles: null,
        allowedUsers: null,
    },

    async execute(api) {
        const name = api.getTypedArg('name', 'string').value.trim();

        try {
            const pokemon = await pokedex.getPokemonByName(name.toLowerCase());
            const species = await pokedex.getPokemonSpeciesByName(pokemon.species.name);

            const color = pokedexSpeciesColorMap[species.color.name] ?? PredefinedColors.Blue;

            const types = pokemon.types.map(t => `[${t.type.name}](${t.type.url})`).join(' + ');
            const stats = pokemon.stats
                .map(s => `**${capitalizeFirst(s.stat.name)}**: ${s.base_stat}`)
                .join('\n');

            const embed = new ReplyEmbed()
                .setTitle(`📊 Info o ${capitalizeFirst(pokemon.name)}`)
                .setDescription(`Typ: **${types}**`)
                .setThumbnail(pokemon.sprites.front_default ?? '')
                .addFields([
                    {
                        name: 'Wymiary',
                        value: [
                            `**Wzrost:** ${pokemon.height * 10}cm`,
                            `**Waga:**   ${pokemon.weight / 10}kg`,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: 'Statystyki',
                        value: stats,
                        inline: true
                    }
                ])
                .setColor(color);

            return api.reply({
                embeds: [embed],
            });
        } catch {
            return api.log.replyError(
                api, 'Nie znaleziono',
                `Nie ma takiego pokemona jak ${name} ty amebo`,
            );
        }
    },
} satisfies Command;