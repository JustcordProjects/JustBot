import * as config from '@/bot/config/schema.ts';

import { PredefinedColors } from '@/util/color.ts';

export const economyCfg: config.Economy = {
    roles: [
        {
            name: "Server Booster",
            desc: "Rola za boosty",
            id: "server-booster",
            discordRoleId: "1511602639413055569",
            refund: 0, // have no idea what this is, ask maqix idk
            benefits: {
                dailyIncome: [
                    {
                        op: "add-money",
                        amount: 6500
                    }
                ],
                multipliers: []
            }
        },
        {
            name: "miniVIP",
            desc: "Mało ważny, ale jednak bardzo ważny człowiek.",
            id: "vip-mini",
            discordRoleId: "1515395600009400441",
            benefits: {
                dailyIncome: [
                    {
                        op: 'add-money',
                        amount: 500
                    }
                ],
                multipliers: [
                    {
                        multiplier: 1.1,
                        filter: "*"
                    }
                ]
            },
            refund: 3000
        },
        {
            name: "Very Important Person",
            desc: "Bardzo ważna osoba generalnie. Możesz się jej nie słuchać, ale to będzie miało konsekwencje.",
            id: "vip",
            discordRoleId: "1515394581628453026",
            benefits: {
                dailyIncome: [
                    {
                        op: 'add-money',
                        amount: 1500
                    }
                ],
                multipliers: [
                    {
                        multiplier: 1.3,
                        filter: "*"
                    }
                ]
            },
            refund: 9000
        },
        {
            id: 'cheat-hall-of-shame',
            name: "Hall of Shame access",
            desc: "W końcu odblokujesz dostęp do Hall of Shame bez wydawania hajsu na boosty!",
            refund: 350_000,
            discordRoleId: "1516486240000807022",
            benefits: {
                dailyIncome: [], multipliers: []
            }
        }
    ],
    items: [],
    offers: [
        {
            id: 'buy-mini-vip',
            name: "MiniVIP",
            desc: "Taki słabszy VIP. Nie możesz się poflexować, bo ma mini w nazwie i będą myśleli, że cię nie stać...",
            price: 15_000,
            buyOnce: true,
            onBuy: [
                { op: 'add-role', roleId: 'vip-mini' }
            ]
        },
        {
            id: 'buy-vip',
            name: "Very Important Person",
            desc: "Taki słabszy VIP. Nie możesz się poflexować, bo ma mini w nazwie i będą myśleli, że cię nie stać...",
            price: 45_000,
            buyOnce: true,
            onBuy: [
                { op: 'add-role', roleId: 'vip' }
            ]
        },
        {
            id: 'buy-cheat-hall-of-shame',
            name: "Hall of Shame access",
            desc: "W końcu odblokujesz dostęp do Hall of Shame bez wydawania hajsu na boosty!",
            price: 400_000,
            buyOnce: true,
            onBuy: [
                {
                    op: 'add-role', roleId: 'cheat-hall-of-shame'
                }
            ]
        }
    ],
    shop: [
        {
            id: 'vips',
            name: 'VIPy',
            desc: 'Tutaj znajdziesz wszelkiego rodzaju rangi prestiżu i ważności, więc jak lubisz się flexować, to jest miejsce dla Ciebie.',
            color: PredefinedColors.Yellow,
            emoji: '🔥',
            items: [ 'buy-mini-vip', 'buy-vip' ]
        },
        {
            id: 'cheats',
            name: 'Cheaty',
            desc: "Możesz odblokować coś dużo wcześniej niż normalnie, lub mniejszym kosztem.",
            color: PredefinedColors.Teal,
            emoji: '😉',
            items: [ 'buy-cheat-hall-of-shame' ]
        }
    ],
    currencySign: '$',
    currencySignPlacement: 'right',
};
