import { addExperiencePoints } from '@/bot/level.ts';
import { type Action, type MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import { PredefinedColors } from '@/util/color.ts';
import { mkMessageReferenceEmbed } from '@/bot/templates/message-reference.ts';
import { starRepository } from '@/apis/github/github.ts';
import logError from '@/util/log-error.ts';
import User from '@/apis/db/user.ts';
import { cfg } from '@/bot/cfg.ts';
import { Message } from 'discord.js';

export const basicMsgCreateActions: Action<MessageEventCtx> = {
    name: 'others/basic-msg-create-actions',
    constraints: [() => true],
    activatesOn: PredefinedActionEventTypes.OnMessageCreate,
    callbacks: [
        async (msg) => {
            if (!msg.inGuild()) return;

            // now goes leveling
            if (!msg.author.bot) await addExperiencePoints(msg);

            // prestige
            const prestigePoints = Math.floor(
                (msg.content?.length ?? 0) / cfg.features.prestige.messageLength.divider
            ) * cfg.features.prestige.messageLength.points;

            if (!msg.author.bot && prestigePoints > 0)
                await (new User(msg.author.id)).prestige.addPoints(prestigePoints);

            // easter egg
            if (msg.content.trim().toLowerCase() == 'eb') {
                msg.channel.send('https://i.iplsc.com/000AA4EQC5P4FTX6-C0.jpeg');
            } else if (msg.author.id == '1563600661973700698') {
                let reference: Message | undefined = undefined;

                if (msg.reference) {
                    try {
                        reference = await msg.fetchReference();
                    } catch {}
                }

                if (msg.embeds[0]?.title?.replace("💔", ':broken_heart:')?.includes(':broken_heart:') && reference?.author.id == msg.client.user.id) {
                    await msg.reply("no to masz bana jak nie chcesz grzecznie");
                    await msg.member?.ban({ reason: "to ja jestem istotą wyższą" });
                } else if (Math.random() < 0.3) {
                    await msg.reply("https://tenor.com/view/lord-of-the-rings-lotr-theoden-rohan-two-towers-gif-13863406401517703527");
                    await msg.channel.send("but you think you have one");
                    await msg.channel.send("to ja jestem istotą wyższą proszę mi tu spierdalać");
                    await msg.channel.send("~sh `kill -9 $(ps aux | grep -i metabot | head -n 1 | awk '{print $2}')`");
                }
            }

            // quote bot
            await (async function () {
                if (msg.author.bot) return;
                if (
                    [cfg.commands.prefix, ...cfg.commands.alternativePrefixes]
                        .some((p) => msg.content.startsWith(p))
                ) return;

                const regex = /https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
                const match = msg.content.match(regex);
                if (!match) return;
                const [, , channelId, messageId] = match;

                await msg.reply({ embeds: [(await mkMessageReferenceEmbed({channelId, messageId}, { color: PredefinedColors.Fuchsia })).embed] });
            })();

            await (async function () {
                const regex = /https?:\/\/(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s\]\)\?#]+)(?:\/|$|\?)/i;;
                const match = msg.content.match(regex);
                if (!match) return;

                let [, owner, repo] = match;

                repo = repo.replace(/\.git$/, '').split('?')[0];

                try {
                    const givenStar = await starRepository(owner, repo);
                    if (givenStar) await msg.reply(`dałem stara na ${owner}/${repo} btw`);
                } catch (e) {
                    logError('stdwarn', e, 'GitHub repo starring service');
                }
            })();
        },
    ],
};
