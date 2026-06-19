import { type Action, MagicSkipAllActions, type MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions/index.ts';
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
    'Tu możecie odpowiedzi merytoryczne wysyłać',
    'Tutaj dyskusje i rozmowy na temat ankiety',
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

            await msg.reply('<@&1511009438994141194>');

            const thread = await msg.startThread({
                name: randomElement(ThreadNames),
            });
            await thread.send(randomElement(ThreadMessages));
        },
    ],
};
