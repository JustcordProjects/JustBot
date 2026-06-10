import { Config } from '@/bot/cfg.ts';
import { hierarchyCfg } from './hierarchy.ts';
import { channelsCfg } from './channels.ts';
import { featuresConfig } from './features.ts';

export const defaultCfg: Config = {
    bot: {
        status: 'dnd',
        activities: [
            {
                type: 'listening',
                name: 'Merytoryczne konwersacje na Justcord',
                description: 'Nie są merotoryczne, ale udaję, że są.'
            },
            {
                type: 'playing',
                name: 'Windows 11',
                description: 'Absolutnie denerwujący system, odinstaluję zaraz.'
            },
            {
                type: 'playing',
                name: 'Arch Linux',
                description: 'Próbuję zainstalować ten system operacyjny.'
            },
            {
                type: 'watching',
                name: 'Serwer Justcord',
                description: 'Zastanawiam się co się tu dzieje.'
            }
        ]
    },

    hierarchy: hierarchyCfg,
    channels: channelsCfg,

    commands: {
        prefix: 'sudo ',
        alternativePrefixes: [
            '.', 'justbot, '
        ],
        confirmUnsafeCommands: false,
        confirmDeprecatedCommands: false,

        restrictedCommands: [],
        disabledCommands: [],
        cooldownBypasses: [],

        blocking: {
            full: {
                default: 'allow',
                deny: [],
            },
            fullExceptImportant: {
                default: 'allow',
                deny: [...Object.values(channelsCfg.forfun), channelsCfg.general.media],
            },
            spammy: {
                default: 'block',
                allow: [channelsCfg.general.commands, channelsCfg.mod.modGeneral],
            },
            economy: {
                default: 'block',
                allow: [channelsCfg.other.economy],
            },
        },
    },

    database: {
        path: 'bot.db',

        backups: {
            enabled: true,
            msg: '🗄️ automatyczny backup masz tutaj',
            interval: 2 * 60 * 60 * 1000,
        },
    },

    features: featuresConfig,

    emojis: {
        darkRedBlock: { name: 'dark_red_block', id: '1510910262868447293' },
        lightRedBlock: { name: 'light_red_block', id: '1510910293235073074' },
        darkGreenBlock: { name: 'dark_green_block', id: '1510910240902611014' },
        lightGreenBlock: { name: 'light_green_block', id: '1510910281222455347' },

        circleProgressBar: {
            '0/4': { name: 'circle_progress_bar_04', id: '1510910145884983326' },
            '1/4': { name: 'circle_progress_bar_14', id: '1510910162020601919' },
            '2/4': { name: 'circle_progress_bar_24', id: '1510910188347981885' },
            '3/4': { name: 'circle_progress_bar_34', id: '1510910132492435456' },
        },

        heartAttackEmoji: { name: 'joe_zatrzymanie_akcji_serca', id: '1510990624382259361' },
        sadEmoji: { name: 'joe_smutny', id: '1510990698424569916' },
        wowEmoji: { name: 'joe_wow', id: '1510990747011125450' },
        idkEmoji: { name: 'joe_no_trudno', id: '1510694676158742770' },
    },
};
