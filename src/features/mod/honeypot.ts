import { PredefinedActionEventTypes, type Action, type MessageEventCtx } from '@/features/actions.ts';
import AutoModRules from '@/features/mod/automod.ts';
import { cfg } from '@/bot/cfg.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { PredefinedColors } from '@/util/color.ts';
import { sendLog } from '@/apis/log/send-log.ts';
import warn from '@/apis/mod/warns.ts';
import { mkMessageReferenceEmbed } from '@/bot/templates/message-reference.ts';
import { client } from '@/client.ts';
import { GuildTextBasedChannel } from 'discord.js';

async function internal() {
    const channel = await client.channels.fetch(cfg.channels.important.honeypot) as GuildTextBasedChannel;
    const lastMsg = (await channel.messages.fetch({ limit: 1 })).first();
    if (lastMsg?.author.id != client.user?.id) channel.send({
        embeds: [
            new ReplyEmbed()
                .setDescription([
                    '# NIE WYSYŁAJ WIADOMOŚCI NA TYM KANALE',
                    'Ten kanał jest używany by łapać boty. Pisanie tutaj skończy się **natychmiastowym mute na 24 godziny**!',
                    `Zamiast tego, napisz na <#${cfg.channels.general.general}> lub <#${cfg.channels.general.programming}>.`
                ].join('\n'))
        ]
    });
}

export default function setupHoneypotAction() {
    internal();
    return {
        name: 'mod/honeypot',
        activatesOn: PredefinedActionEventTypes.OnMessageCreate,
        worksOutsideGuild: false,

        constraints: [
            (ctx) => ctx.channelId == cfg.channels.important.honeypot,
            AutoModRules.msgAuthorIsNotImmuneToAutomod
        ],
        callbacks: [
            async (msg) => {
                await msg.member!.timeout(24 * 60 * 60 * 1000);
                if (msg.deletable) await msg.delete();

                await warn(msg.member!, {
                    mod: msg.client.user.id,
                    reason: 'honeypot',
                    points: 2,
                    expiresAt: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000)
                });
                
                let dmSendSuccessfull = true;
                try {
                    const dmChannel = await msg.author.createDM();
                    await dmChannel.send({
                        embeds: [
                            new ReplyEmbed()
                                .setTitle('📢 Masz mute za triggerowanie honeypota!')
                                .setDescription(`Dostałeś mute na serwerze **Justcord** na **24 godziny**, ponieważ **wysłałeś wiadomość na kanale *honeypot***! Jest to zabezpieczenie przed self-botami spamiącymi różnego rodzaju scamami na serwerach Discord. Możesz zawsze skontaktować się z administracją pisząc na tego maila: \`${Deno.env.get('JB_EMAIL_USER')}\`.`)
                                .setColor(PredefinedColors.Red)
                        ]   
                    });
                } catch {
                    dmSendSuccessfull = false;
                }

                sendLog({
                    title: 'Kolejny spam-bot wysłał coś na honeypocie',
                    fields: [
                        { name: 'Użytkownik', value: `<@${msg.member!.id}>`, inline: true },
                        { name: 'Wysłano DM', value: dmSendSuccessfull ? 'Tak' : 'Nie', inline: true }
                    ],
                    color: PredefinedColors.Red,
                    description: 'W skrócie to ten user dostał mute na 24 godziny za trigerrnięcie tego, trzeba było tak nie robić ig.',
                    additionalEmbeds: [ (await mkMessageReferenceEmbed(msg, { color: PredefinedColors.Red })).embed ]
                }, [cfg.channels.mod.automod]);
            }
        ]
    } satisfies Action<MessageEventCtx>;
}
