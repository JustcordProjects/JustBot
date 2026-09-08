import { Action, MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import capitalizeFirst from '@/util/capitalize-first.ts';
import { cfg } from '@/bot/cfg.ts';
import randomElement from '@/util/random-element.ts';

let deathChatTimeout: ReturnType<typeof setTimeout>;

export interface PingAPI {
    roleId: `${number}`;
    questions: string[] | null;
    automatic: boolean;
    automaticWaitUntilLastMsgInterval: number;
}

export const pings: Record<string, PingAPI> = {
    'death-chat': {
        roleId: '1511009335877046364',
        questions: [
            // life
            'jaki byś film polecił do oglądania i dlaczego',
            'jaka była ostatnia rzecz której się nauczyłeś(/-łaś (wow baby na serwerze, impossible!!!))?',
            'czy kiedykolwiek spotkałeś się z kimś z Internetu?',

            // philosophy
            'co myślisz o mitologii greckiej?',
            'czy wierzysz w jakąś ~~propagandę~~ **religię**?',
            'czy, twoim zdaniem, świat ma jakiś określony cel, do któego dąży i z którego powodu w ogóle istnieje?',
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
        ],
        automatic: true,
        automaticWaitUntilLastMsgInterval: 2 * 60 * 60 * 1000,
    },
};

export const actionPing: Action<MessageEventCtx> = {
    name: '4fun/notify/death-chat',
    activatesOn: PredefinedActionEventTypes.OnMessageCreate,
    constraints: [(msg) => msg.channelId === cfg.channels.general.general],
    callbacks: [
        (msg) => {
            clearTimeout(deathChatTimeout);
            deathChatTimeout = setTimeout(() => {
                const now = new Date();
                const options: Intl.DateTimeFormatOptions = {
                    timeZone: 'Europe/Warsaw',
                    hour: 'numeric',
                    hour12: false,
                };
                const hour = parseInt(new Intl.DateTimeFormat('pl-PL', options).format(now), 10);

                if (hour >= 10 && hour < 20) {
                    const pingConfig = pings['death-chat'];
                    if (pingConfig?.questions && msg.channel.isSendable()) {
                        const question = randomElement(pingConfig.questions);
                        msg.channel.send(`<@&${pingConfig.roleId}> ${capitalizeFirst(question)}${question.endsWith('?') ? '' : '?'}`);
                    }
                }
            }, pings['death-chat'].automaticWaitUntilLastMsgInterval);
        },
    ],
};
