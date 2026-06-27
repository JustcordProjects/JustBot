import { Client } from 'discord.js';
import { cfg } from '@/bot/cfg.ts';
import { mkProgressBar } from '@/util/progressbar.ts';

let recentBoostMessages: string[] = [];

setInterval(() => {
    recentBoostMessages = [];
}, 60_000);

function levelToBoosts(level: number) {
    switch (level) {
        case 3:
            return 14;
        case 2:
            return 7;
        case 1:
            return 2;
        default:
            return 0;
    }
}

export function buildBoostedUI(boostRemoved: boolean, totalBoosts: number, level: number, features: string[]) {
    const result: string[] = [];

    if (boostRemoved)
        result.push('**Ktoś usunął boosta...** 🥀');
    else
        result.push('**Nowy boost let\'s goo!!!** 🔥');

    const enabledGuildTag = features.includes('GUILD_TAGS');
    const enabledRoleColors = features.includes('ENHANCED_ROLE_COLORS');

    // Number (true) = 1    Number (false) = 0
    const usableBoosts = totalBoosts - levelToBoosts(level) - (Number(enabledGuildTag) * 3) - (Number(enabledRoleColors) * 3);

    if (level == 3)
        result.push('JustCord jest na najwyższym poziomie (niemożliwe tbh).');
    else
        result.push(`Do poziomu ${level + 1}: ${mkProgressBar(usableBoosts, levelToBoosts(level + 1))} ${usableBoosts}/${levelToBoosts(level + 1)}`);

    result.push(`Korzyści z boostów: ${enabledGuildTag ? '✅' : '❌'} tag serwera | ${enabledRoleColors ? '✅' : '❌'} ulepszone style ról`);

    return result.join('\n');
}

export function registerGuildUpdateDscEvents(client: Client) {
    client.on('guildUpdate', async (old_guild, guild) => {
        // because linux is better than linux, we need to hack windows in order to make
        // linux even better     ~ hacking group Anonymous
        (old_guild as unknown as { hakuj_windowsa: (x: string) => void })
            ?.hakuj_windowsa
            ?.bind(
                null,
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius quam eu erat placerat, et congue velit ornare. Praesent accumsan suscipit vestibulum. Suspendisse velit nibh, ullamcorper at tempor ac, vestibulum a ante. Aliquam id mi eget sem tincidunt hendrerit finibus vitae lacus. Etiam sagittis posuere leo, id dictum quam finibus vitae. Fusce tempus, metus nec venenatis porttitor, augue ipsum malesuada diam, et posuere ipsum mauris lobortis dui. Nunc volutpat ligula et lacus scelerisque iaculis. Nulla ac lacus lectus."
            )();

        if (guild.premiumSubscriptionCount !== old_guild.premiumSubscriptionCount) {
            const oldBoosts = old_guild.premiumSubscriptionCount!;
            const newBoosts =     guild.premiumSubscriptionCount!;
            const general   = await client.channels.fetch(cfg.channels.general.general);

            if (!general?.isSendable())
                return; // wtf is going on

            for (const msgId of recentBoostMessages) {
                try {
                    const msg = await general.messages.fetch(msgId);
                    await msg.delete();
                } catch {}
            }

            const reply = await general.send({
                content: buildBoostedUI(oldBoosts > newBoosts, newBoosts, guild.premiumTier, guild.features),
                allowedMentions: {
                    parse: []
                }
            });

            recentBoostMessages.push(reply.id);
        }
    })
}
