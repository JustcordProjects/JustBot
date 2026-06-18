import { cfg } from '@/bot/cfg.ts';
import { db } from '@/bot/apis/db/bot-db.ts';
import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/apis/commands/misc.ts';

import User from '@/bot/apis/db/user.ts';
import Money from '@/util/money.ts';

const ecomodCmd: Command = {
    name: 'ecomod',
    description: {
        main: 'Coś poszło nie tak? Naprawisz to ręcznie. Chyba...',
        short: 'Ustawia ilość pieniędzy danej osobie.',
    },
    aliases: ['moneymod', 'modeco'],
    flags: CommandFlags.Economy | CommandFlags.Unsafe,

    expectedArgs: [
        {
            name: 'who',
            description: 'Na kim chcesz wykonać tą komendę?',
            type: { base: 'user-mention', includeRefMessageAuthor: true },
            optional: false,
        },
        {
            name: 'action',
            description: 'Tu powiedz co chcesz zrobić (add/set/remove)',
            type: { base: 'enum', options: ['add', 'set', 'remove'] as const },
            optional: false,
        },
        {
            name: 'amount',
            description: 'Tu powiedz na jakiej ilości hajsu chcesz to zrobić',
            type: { base: 'money' },
            optional: false,
        },
        {
            name: 'location',
            description: 'A tu czy w banku czy nie. Domyślnie w portfelu. (wallet/bank)',
            type: { base: 'enum', options: ['bank', 'wallet'] as const },
            optional: true,
        },
    ],
    permissions: {
        allowedRoles: [cfg.hierarchy.administration.headAdmin],
        allowedUsers: [],
    },

    async execute(api) {
        function actionToString() {
            switch (action) {
                case 'add':
                    return `dodałeś mu ${after!.format()} do ${location == 'wallet' ? 'portfela' : 'banku'}`;
                case 'set':
                    return `ustawiłeś mu ${after!.format()} pieniądzy w ${location == 'wallet' ? 'portfelu' : 'banku'}`;
                case 'remove':
                    return `usunąłeś mu ${after!.format()} ${after!.format} z ${location == 'wallet' ? 'portfela' : 'banku'}`;
            }
        }

        const action = api.getEnumArg('action', ['add', 'set', 'remove'])?.value!;
        const amount = api.getTypedArg('amount', 'money')?.value!;
        const location = (api.getEnumArg('location', ['wallet', 'bank'])?.value) || 'wallet';
        const targetMember = api.getTypedArg('who', 'user-mention')?.value!;

        if (amount.isNegative()) return api.log.replyError(api, 'Nieprawidłowa kwota', 'Nie może być ona ujemna.');

        const targetId = targetMember.id;
        const targetUser = new User(targetId);

        let before: Money, after: Money;

        await db.transaction(async () => {
            const bal = await targetUser.economy.getBalance();
            const current = bal[location];
            before = current.clone();

            if (action == 'add') {
                after = current.add(amount);
            } else if (action == 'set') {
                after = amount.clone();
            } else if (action == 'remove') {
                after = current.sub(amount);
                if (after.isNegative()) after = Money.zero();
            }

            bal[location] = after;
            await targetUser.economy.setBalance(bal);
        });

        return api.log.replySuccess(api, 'Operacja zakończona!', `Pomyślnie zmodyfikowałeś balans użytkownika <@${targetId}>, tak że ${actionToString()}. Przed tą operacją w teh lokalizacji miał ${before!.format()}.`)
    },
};

export default ecomodCmd;
