import { Action, MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import capitalizeFirst from '@/util/capitalize-first.ts';
import randomElement from '@/util/random-element.ts';

import { cfg } from '@/bot/cfg.ts';
import { Hour } from '@/util/parse-timestamp.ts';
import { db } from '@/apis/db/bot-db.ts';

import m from '@/util/mentions.ts';

let deadChatTimeout: ReturnType<typeof setTimeout>;

const DEAD_CHAT_ROLE_ID = '1511009335877046364';
const DEAD_CHAT_AUTO_WAIT_INTERVAL = 2 * Hour;

const DeadChatQuestions = [
    // philosophy
    'jak myślisz, co jest przyczyną podobieństw religii powstających równocześnie w różnych miejscach na świecie?',

    // software
    'robimy system operacyjny w CMake? to przecież świetny pomysł... albo w sql jak catflare',
    'jaki meta build system jest najlepszy i dlaczego?',
    'jaki system plików jest najlepszy?',
    'czy szyfrujesz swój dysk; jak tak to na jakich urządzeniach i po co?',
    'czy uważasz, że podsystemy np. w takim Linuxie powinny być maintainowane przez losowych ludzi gdy nie ma maintainera, czy wywalone z kernela?',
    'co myślisz o używaniu Radicle zamiast GitHub (i generalnie innych serwerów Git niż GitHub)?',

    // hardware
    'co myślisz o [Itanium](https://en.wikipedia.org/wiki/Itanium)?',
    'czy RISC-V ma jakąś szansę przejąć świat (i dlaczego)?',
    'czy Intel ME i AMD PSP to twoim zdaniem backdoor NSA?',
    'czy podział rdzeni w laptopach (Efficiency Cores i Power Cores czy jakoś tak) ma jakikolwiek sens?',

    // education
    'czy komputery w szkole u was mają linuxa? jak nie, czy chciałbyś, by Twoja klasa się niego uczyła (xd)?',
    'rozwiąż równanie (x^2):(x - 1282:4)=3x (tak, wziąłem je kompletnie z dupy)',
    'czego się tam uczycie na matematyce bo wsm to nie wiem',

    // misc
    'co sądzisz o temacie: "Mistrzostwa Świata w Kolarstwie Torowym 1901" (niniejszy temat was brought to you by "Losuj artykuł" on Pl.WikiPedia.org)',
    'chciałbyś być lotnikiem / pilotem samolotu / pilotem liniowym / mechanikiem / whatever / <wklej tu nazwę dowolnego zawodu związanego z samolotami>?'
];

export const actionPing: Action<MessageEventCtx> = {
    name: '4fun/notify/dead-chat',
    activatesOn: PredefinedActionEventTypes.OnMessageCreate,
    constraints: [(msg) => msg.channelId === cfg.channels.general.general],
    callbacks: [
        async (msg) => {
            clearTimeout(deadChatTimeout);
            deadChatTimeout = setTimeout(async () => {
                if (!msg.channel.isSendable()) return;
                
                if (await db.deadchat.count() == DeadChatQuestions.length) {
                    return await msg.channel.send(`## zmień ktoś pytania deadchat lepiej, ten ${cfg.hierarchy.developers.allowedUsers.map(m.user).join(', ')}`);
                }

                const now = new Date();
                const options: Intl.DateTimeFormatOptions = {
                    timeZone: 'Europe/Warsaw',
                    hour: 'numeric',
                    hour12: false,
                };

                const hour = parseInt(
                    new Intl.DateTimeFormat('pl-PL', options)
                        .format(now), 10);

                if (hour >= 10 && hour < 20) {
                    if (await db.deadchat.count() == DeadChatQuestions.length) {
                        await msg.channel.send(`${cfg.hierarchy.developers.allowedUsers.map(m.user).join(', ')} pytania wam się skończyły kurna!!!`);
                        await msg.channel.send(`${m.role(DEAD_CHAT_ROLE_ID)} a wy matoły to wstajecie, myślicie że wam popuszczę????`);
                        return;
                    }

                    let question: string;
                    do {
                        question = randomElement(DeadChatQuestions);
                    } while (await db.deadchat.had(question));

                    await db.deadchat.add(question);
                    msg.channel.send(`${m.role(DEAD_CHAT_ROLE_ID)} ${capitalizeFirst(question)}${question.endsWith('?') ? '' : '?'}`);
                }
            }, DEAD_CHAT_AUTO_WAIT_INTERVAL * 1000);
        },
    ],
};
