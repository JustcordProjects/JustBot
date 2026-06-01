import { Config } from '@/bot/cfg.ts';
import { hierarchyCfg } from './hierarchy.ts';
import { channelsCfg } from './channels.ts';
import { featuresConfig } from './features.ts';

const commandsCfg: Config['commands']['configuration'] = {
    ban: {
        enabled: true,
        aliases: [],
        allowedRoles: [hierarchyCfg.administration.headAdmin, hierarchyCfg.administration.admin, hierarchyCfg.administration.headMod],
        allowedUsers: [],
        reasonRequired: false,
    },
    kick: {
        enabled: true,
        aliases: [],
        allowedRoles: [hierarchyCfg.administration.headAdmin, hierarchyCfg.administration.admin, hierarchyCfg.administration.headMod],
        allowedUsers: [],
        reasonRequired: false,
    },
    mute: {
        enabled: true,
        aliases: [],
        allowedRoles: [hierarchyCfg.administration.headAdmin, hierarchyCfg.administration.admin, hierarchyCfg.administration.headMod, hierarchyCfg.administration.mod, hierarchyCfg.administration.helper],
        allowedUsers: [],
        reasonRequired: false,
    },
    warn: {
        enabled: true,
        aliases: [],
        allowedRoles: [hierarchyCfg.administration.headAdmin, hierarchyCfg.administration.admin, hierarchyCfg.administration.headMod, hierarchyCfg.administration.mod, hierarchyCfg.administration.helper],
        allowedUsers: [],
        reasonRequired: false,
        maxPoints: 30,
        minPoints: 1,
    },
    izolatka: {
        aliases: [],
        enabledForNormalAdministrators: true,
        allowedRoles: [hierarchyCfg.administration.headAdmin, hierarchyCfg.administration.admin, hierarchyCfg.administration.headMod, hierarchyCfg.administration.mod, hierarchyCfg.administration.helper],
        allowedUsers: [],
        enabled: true,
    },
    reset: {
        enabled: true,
        aliases: [],
        allowedRoles: [hierarchyCfg.administration.headAdmin],
        allowedUsers: [],
    },
    crime: {
        enabled: true,
        aliases: [],
        allowedRoles: null,
        allowedUsers: null,

        cooldown: 15 * 60 * 1000,
        maximumCrimeAmount: 8000,
        minimumCrimeAmount: 2500,
        successRatio: 0.4,
    },
};

export const defaultCfg: Config = {
    hierarchy: hierarchyCfg,

    channels: channelsCfg,

    commands: {
        prefix: 'sudo ',
        alternativePrefixes: [
            '.',
        ],
        confirmUnsafeCommands: false,
        confirmDeprecatedCommands: false,

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

        configuration: commandsCfg,
        defaultConfiguration: {
            enabled: true,
            aliases: [],

            allowedUsers: null,
            allowedRoles: null,
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
