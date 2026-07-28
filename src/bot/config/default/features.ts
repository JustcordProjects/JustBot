import * as config from '@/bot/config/schema.ts';

import { channelsCfg } from './channels.ts';
import { economyCfg } from './economy.ts';
import { hierarchyCfg } from './hierarchy.ts';

export const featuresCfg: config.Features = {
    compilation: {
        replaceCompilerMap: {
            'gcc-head-c': ['c', 'gcc'],
            'gcc-head': ['cpp', 'c++', 'g++'],
            'dmd-2.109.1': ['d', 'dmd'],
            'bash': ['bash', 'sh'],
            'openjdk-jdk-22+36': ['java', 'bloat'],
            'zig-head': ['zig'],
            'go-1.23.2': ['golang', 'go'],
            'ghc-9.10.1': ['haskell', 'ghc'],
            'php-8.3.12': ['php', 'vulnerability'],
            'sqlite 3.46.1': ['sql', 'sqlite'],
            'cpython-head': ['python', 'py'],
            'nodejs-20.17.0': ['js', 'javascript'],
            'typescript-5.6.2': ['ts', 'typescript', 'bloatscript'],
            'vim-9.1.0758': ['vim', 'vimscript'],
        },
    },
    automod: {
        antiFloodEnabled: false,
        antiSpamEnabled: false,
    },
    welcomer: {
        enabled: true,
        mentionNewPeopleInLobby: false,
        welcomeMsgs: [
            `witaj szanowny użytkowniku <mention>!`,
            `siema, ale przystojny jesteś <mention> ngl`,
            `kocham cię <mention>`,
            `c-cczęsto masz tak na imie <mention>?`,
            `nie chce mi się, <mention>`,
            `<mention>, lubimy cie (chyba)`,
        ],
        goodbyeMsgs: [
            `do widzenia <mention>!`,
            `żegnaj <mention>, będziemy za tobą tęsknić! (chyba)`,
            `<mention> opuścił nasz serwer, ale zawsze może wrócić! (nie wróci)`,
        ],
        freeRolesForEveryone: [
            '1510682337690652812',
        ],
    },
    forFun: {
        media: [
            {
                channel: channelsCfg.general.media,
                addReactions: ['👍', '👎', '😭', '🙏', '🤣'],
                deleteMessageIfNotMedia: true,
                shallCreateThread: true,
            },
            {
                channel: channelsCfg.mod.hallOfShame,
                addReactions: ['🙏'],
                deleteMessageIfNotMedia: false,
                shallCreateThread: false,
            },
        ],
        countingChannel: channelsCfg.forfun.counting,
        lastLetterChannel: channelsCfg.forfun.lastLetter,
    },
    leveling: {
        xpPerMessage: 4,
        levelDivider: 100,
        excludedChannels: [],
        canChangeXP: [hierarchyCfg.administration.headAdmin],
        milestoneRoles: {
            3: '1510641841299787917',
            5: '1510641882953420831',
            10: '1510641919699587083',
            15: '1510641968244330506',
            20: '1510642003728142457',
            25: '1510642032991797468',
            30: '1510642089723957481',
            50: '1510642125015093331',
            75: '1510642160293249085',
            100: '1510642196909527194',
        },
        shallPingWhenNewLevel: false,
        currentEvent: {
            enabled: false,
            channels: [],
            multiplier: 2,
        },
        voice: {
            xpPerMinute: 16,
            estimatedRealMembers: {
                requiredLevel: 5,
                requiredPeople: 3,
            },
        },
    },
    prestige: {
        reactions: {
            positive: [
                '👍', '❤️', '🔥'
            ],
            negative: [
                '👎'
            ],
            pointsPerReaction: 1
        },
        messageLength: {
            divider: 200,
            points: 5
        }
    },
    economy: economyCfg,
    translations: [],
    watchdog: {
        kickNewMembers: false,
        allowNewBots: false,
        shallAutoDegrade: true,
        notForgiveAdministration: false,
        limitsConfiguration: {
            maxMutes: 6,
            maxWarns: 4,
            maxChannelCreations: 10,
            maxChannelDeletions: 2,
        },
        approveDangerousPermissions: false,
    },
    ai: {
        enabled: true,
        allowPolitics: false,
        allowPhilosophy: true,
        contextDefaultMessages: 15,
        contextMaxMessages: 30,

        redditEnabled:   true,
        githubEnabled:   true,
        memoriesEnabled: false,
        compilerEnabled: true,
        //searchEnabled:   true,
        //codeExecEnabled: true,
    },
    contentDatabases: [
        {
            id: 'music',
            channel: channelsCfg.other.music,
            domains: [
                'youtube.com',
                'youtu.be',
                'music.youtube.com',
                'open.spotify.com',
            ],
        },
        {
            id: 'video',
            channel: channelsCfg.general.media,
            domains: [
                'youtube.com',
                'youtu.be',
                'netflix.com', // lmao
            ],
        }
    ],
    actions: {
        disabled: [],
    },
};
