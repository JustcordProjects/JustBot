import { Config } from '@/bot/config/schema/config.ts';

export const hierarchyCfg: Config['hierarchy'] = {
    developers: {
        allowedRoles: [],
        allowedUsers: [
            '990959984005222410',
            '1274610053843783768',
            '931732121997959219'
        ],
    },

    administration: {
        headAdmin: '1510229918212952184',
        admin: '1510229918212952184',
        headMod: '1510229918212952184',
        mod: '1510229918212952184',
        helper: '1510229918212952184',
    },

    automodBypassRoles: ['1510229918212952184'],
};
