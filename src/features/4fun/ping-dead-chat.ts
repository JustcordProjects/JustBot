import { Action, MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import capitalizeFirst from '@/util/capitalize-first.ts';
import randomElement from '@/util/random-element.ts';

import { cfg } from '@/bot/cfg.ts';
import { Hour } from '@/util/parse-timestamp.ts';
import { db } from '@/apis/db/bot-db.ts';

let deadChatTimeout: ReturnType<typeof setTimeout>;

const DEAD_CHAT_ROLE_ID = '1511009335877046364';
const DEAD_CHAT_AUTO_WAIT_INTERVAL = 2 * Hour;

const DeadChatQuestions = [
    // life
    'jaki byś film polecił do oglądania i dlaczego',
    'jaka była ostatnia rzecz której się nauczyłeś(/-łaś (wow baby na serwerze, impossible!!!))?',
    'czy kiedykolwiek spotkałeś się z kimś z Internetu?',

    // philosophy
    'co myślisz o mitologii greckiej?',
    'czy wierzysz w jakąś ~~propagandę~~ **religię**?',
    'czy, twoim zdaniem, świat ma jakiś określony cel, do którego dąży i z którego powodu w ogóle istnieje?',
    'kto stworzył świat? a może nikt?',
    'jaki jest sens twojego życia?',
    'co myślisz o astral projection?',
    'w jakie teorie spiskowe wierzysz? (ufo w area 51.. nie to słabe... ziemia jest płaska!!!!)',

    // maths
    'jak wyglądałby świat, gdybyśmy liczyli w systemie binarnym',
    'czy bardzo szybki algorytm na faktoryzację olbrzymich liczb całkowitych ma prawo istnieć?',
    'jaki jest, twoim zdaniem, najtrudniejszy temat w matematyce?',

    // software
    'dlaczego nie daily-driveujesz TempleOS?',
    'kto pierwszy sportuje DOOMa do JUAMPa-RPG dostaje -1 rialów irańskich!!!',
    'czy uważasz, że Linux nie powinien być POSIX-compliant?',
    'what do you think about microkernels?',
    'co myślisz o zbanowaniu wszystkich algorytmów szyfrujących poza szyfrem cezara? (fire pytanie wiem)',
    'czy uważasz, że rzeczy które robił Newag z pociagami powinny być dozwolone',

    // hardware
    'jaką masz specyfikację komputera?',
    'jak mocny był twój pierwszy komputer?',
    'do you care about estetyka in twój komputer wygląd?',
    'jaka jest idealna architektura procesora? (oczywiście że powerPC64 big endian <:emoji_szczur:1511037251352526928>)',

    // education
    'czy komputery w szkole u was mają linuxa?',
    'czy oceny 1-6 powinny być zastąpione ocenami opisowymi?',
    'czy uważasz, że w szkole wiele się zmieniło od jakiś 100 lat?',
    'co myślisz o przynoszeniu tabletów do szkoły zamiast zeszytów?',

    // misc
    'masz afantazję? jak nie masz to chciałbyś mieć?',
    'co sądzisz o temacie: "Mistrzostwa Świata w Kolarstwie Torowym 1901" (nieniejszy temat was brought to you by "Losuj artykuł" on Pl.WikiPedia.org)',
    'chciałbyś być lotnikiem / pilotem samolotu / pilotem liniowym / whatever / <wklej tu nazwę dowolnego zawodu związanego z samolotami>?'
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
                    await msg.channel.send(`${cfg.hierarchy.developers.allowedUsers.map(id => `<@${id}>`).join(', ')} pytania się wam skończyły`);
                    return;
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
                    let question: string;
                    do {
                        question = randomElement(DeadChatQuestions);
                    } while (await db.deadchat.had(question));

                    await db.deadchat.add(question);
                    msg.channel.send(`<@&${DEAD_CHAT_ROLE_ID}> ${capitalizeFirst(question)}${question.endsWith('?') ? '' : '?'}`);
                }
            }, DEAD_CHAT_AUTO_WAIT_INTERVAL * 1000);
        },
    ],
};
