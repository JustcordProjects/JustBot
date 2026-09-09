import { type Action, MagicSkipAllActions, type MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import { cfg } from '@/bot/cfg.ts';
import { replyWarn } from '@/util/log.ts';

import randomElement from '@/util/random-element.ts';
import sleep from '@/util/sleep.ts';

const ThreadNames = [
    'Kanał commentary na YT',
    'Odpowiedzi', 'Komentarze',
    'Merytoryczne dyskusje na temat ankiety',
    'Dyskusja i debaty', 'Sekcja komentarzy',
];

const ThreadMessages = [
    'No napiszcie tu coś bo nudno ok?',
    'Ja uważam, że prawidłową odpowiedzią jest żadna z nich',
    'Czy autor tej ankiety w ogóle wie o czym mówi?',
    'Co panowie szanowni myślą o ankiecie?'
];

export const pollsModerator: Action<MessageEventCtx> = {
    name: 'mod/polls-mod',
    activatesOn: PredefinedActionEventTypes.OnMessageCreate,

    constraints: [
        (ctx) => ctx.author.id != ctx.client.user.id,
        (ctx) => !ctx.channel.isThread(),
        (ctx) => ctx.channel.id == cfg.channels.other.polls,
    ],
    callbacks: [
        async (msg) => {
            if (!msg.poll && (msg.content.length > 0 || msg.attachments.size > 0) && !msg.content.toLowerCase().includes("ankieta otwarta")) {
                const reply = await replyWarn(msg, 'To nie do tego kanał', 'Możesz tu tylko wysyłać Discordowe ankiety, ewentualnie ankiety otwarte.');
                await sleep(2500);
                await reply.delete();
                await msg.delete();
                return MagicSkipAllActions;
            }

            if (!msg.poll && !msg.content) return;
            if (!msg.channel.isSendable()) return;

            const lastMessage = (await msg.channel.messages.fetch({ limit: 2 })).at(1);
            if (
                !lastMessage ||
                Date.now() - lastMessage.createdTimestamp >= 30 * 60 * 1000
            ) {
                await msg.channel.send(
                    `${msg.poll?.question.text ?? 'nowa ankieta guys! ^^^'} <@&1511009438994141194>`
                );
            }

            const thread = await msg.startThread({
                name: 
                    (msg.poll?.question.text ?? randomElement(ThreadNames))
                        .slice(0, 100),
                reason: 'yes bum bum bum bum'
            });
            await thread.send(randomElement(ThreadMessages));
        },
    ],
};
