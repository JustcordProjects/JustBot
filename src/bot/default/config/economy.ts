import EconomyConfig from '@/bot/definitions/config/economy.ts';

export const economyCfg: EconomyConfig = {
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
        }
    ],
    items: [],
    offers: [],
    shop: [],
    currencySign: '$',
    currencySignPlacement: 'right',
};
