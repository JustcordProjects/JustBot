import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { PredefinedColors } from '@/util/color.ts';

export default {
    name: 'weather',
    description: {
        main: 'W skrócie no to wyświetla pogodę w danej lokalizacji co sobie wybierzesz.',
        short: 'Wyświetla prognozę pogody'
    },
    aliases: [],

    flags: CommandFlags.None | CommandFlags.WorksInDM,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'location', type: { base: 'string', allowCodeBlock: true },
            description: "Lokalizacja", optional: true
        }
    ],

    async execute(api) {
        const location = api.getTypedArg('location', 'string').value?.toLowerCase() ?? 'poland';

        const schema = {
            condition: "%c %C",
            temperature: {
                actual: "%t",
                feelsLike: "%f"
            },
            wind: "%w",
            pressure: "%P",
            precipitation: "%p",
            moonPhase: "%m",
            moonDay: "%M"
        } satisfies object;

        const data = await fetch(
            `https://wttr.in/${encodeURIComponent(location)}?lang=pl&format=${encodeURIComponent(JSON.stringify(schema))}`,
            {
                headers: {
                    "Accept-Language": "pl"
                }
            }
        ).then((r) => r.text())

        if (data.toLowerCase().startsWith('location not found'))
            return await api.log.replyError(api, 'Zła ta lokalizacja', 'Mogę wiedzieć coś Ty podał? Wiesz że taka lokalizacja nie istnieje? Nie? No to teraz się dowiedziałeś...')
        else if (data.toLowerCase().includes('error'))
            return await api.log.replyError(api, 'Masz problem', 'Niestety pojawił się jakiś błąd i nie możemy Ci teraz wyświetlić pogody. To prawdopodobnie nie jest moja wina, więc idź krytykować za to twórcę API czy coś.')

        const result: typeof schema = JSON.parse(data);

        await api.reply({ embeds: [
            new ReplyEmbed()
                .setTitle(result.condition)
                .setFields([
                    {
                        name: `Temperatura`, value: result.temperature.actual, inline: true
                    },
                    {
                        name: 'Temp. odczuwalna', value: result.temperature.feelsLike, inline: true
                    },
                    {
                        name: `Ciśnienie`, value: result.pressure.replace('hPa', ' hPa'), inline: true
                    },
                    {
                        name: 'Wiatr', value: result.wind, inline: true
                    },
                    {
                        name: 'Opady', value: result.precipitation.replace('mm', ' mm'), inline: true
                    },
                    {
                        name: 'Faza księżyca', value: `${result.moonPhase} (dzień księżycowy: ${result.moonDay})`, inline: true
                    }
                ])
                .setColor(PredefinedColors.Blue)
        ] })
    }
} satisfies Command;