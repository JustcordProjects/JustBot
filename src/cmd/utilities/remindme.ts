import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { db } from '@/apis/db/bot-db.ts';

export default {
    name: 'remind-me',
    aliases: ['remindme', 'reminder', 'remind'],
    description: {
        main: "Ustaw sobie przypomnienie i dzięki temu nigdy nie zapomnisz by coś zrobić.",
        short: "Ustawia przypomnienie."
    },

    flags: CommandFlags.None | CommandFlags.WorksInDM,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'timestamp', type: { base: 'timestamp' },
            description: "Czas w skrócie", optional: false
        },
        {
            name: 'reminder', type: { base: 'string', trailing: true },
            description: "To o czym mam Ci przypomnieć", optional: false
        }
    ],

    async execute(api) {
        const expires_at = api.getTypedArg('timestamp', 'timestamp').value * 1000 + Date.now();
        const reminder = api.getTypedArg('reminder', 'string').value;

        await db.reminders.addReminder(api.invoker.id, reminder, expires_at);

        await api.log.replySuccess(api, 'Ustawiono przypomnienie!', 'Mam nadzieję, że nie zapomnisz o kupnie snu... o zrobieniu tego, na czym Ci zależy');
    },
} satisfies Command;