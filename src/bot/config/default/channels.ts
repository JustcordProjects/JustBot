import { Config } from '@/bot/cfg.ts';

export const channelsCfg: Config['channels'] = {
    settings: {
        characters: {
            beforeEmoji: '',
            afterEmoji: '｜',
        },
        emojiPlacement: 'before-name',
        spaceReplacement: null,
    },
    serchat: {
        serverId: '0334421005076267008',
        general: '0334421005147570176'
    },
    mod: {
        modGeneral: '1510229839016230986',
        logs: '1510286821848912043',
        punishments: '1510287088258519221',
        hallOfShame: '1510287730330832969',
        automod: '1511258690156498974'
    },
    important: {
        lobby: '1510651678809002095',
        rules: '1510567451262324766',
        announcements: '1510651649692270602',
        boosts: '1510651610542375055',
        levels: '1510651575121608866',
        honeypot: '1524714770240897125'
    },
    general: {
        general: '1510282257095458846',
        commands: '1510282342374310049',
        media: '1510282421386350612',
        programming: '1510997728329728110'
    },
    other: {
        music: '1510644230119493772',
        economy: '1510644297555247115',
        polls: '1511073178355765249'
    },
    forfun: {
        counting: '1510639404618879177',
        lastLetter: '1510639387988332805',
    },
    justbot: {
        stdout: '1510287128880484535',
        stderr: '1510287214054215750',
        stdwarn: '1510287174589747371',
        email: '1510639814674874568',
        dbBackups: '1510644661515980978',
        ghBridge: '1510639799839752405',
    },
    stats: {
        bans: '1510638337390805053',
        goal: '1510638614407544913',
        people: '1510638372811706608',
    },
};
