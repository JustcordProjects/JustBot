import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { db } from '@/bot/apis/db/bot-db.ts';
import User from '@/bot/apis/db/user.ts';

export default {
    name: 'pay',
    description: {
        main: "Zapłać komuś haracz i otrzymaj ~~nic~~ **coś** w zamian!",
        short: "Zapłać komuś."
    },
    aliases: [],

    flags: CommandFlags.Economy,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'target-user', description: "Dla kogo ten hajs",
            type: { base: 'user-mention', includeRefMessageAuthor: true }, optional: false
        },
        {
            name: 'amount', description: "Wariacie, jaka kwota zamówienia?",
            type: {base: 'money', source: 'wallet'}, optional: false
        }
    ],

    async execute(api) {
        const toPay = api.getTypedArg('amount', 'money').value;
        const target = api.getTypedArg('target-user', 'user-mention').value;

        if ((await api.executor.economy.getBalance()).wallet.lessThan(toPay)) {
            return api.log.replyError(api, 'Za mało kasy masz!', "Nie możesz wysłać tylu pieniędzy ponieważ jesteś biedakiem i nie masz.")
        }

        await db.transaction(async () => {
            await api.executor.economy.deductWalletMoney(toPay);
            await (new User(target.id)).economy.addWalletMoney(toPay);
        });

        return api.log.replySuccess(api, 'Zapłacono', 'Ten user ma teraz więcej hajsu od Ciebie hihi. Nie no nie, nie sprawdzałem. Ale zapłaciłeś pomyślnie.');
    },
} satisfies Command;
