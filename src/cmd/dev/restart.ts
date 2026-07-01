import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { output } from '@/bot/logging.ts';

import * as cache from '@/apis/cache/cache.ts';

export default {
    name: 'restart',
    description: {
        main: 'Restartuje bota... Nie tykaj!',
        short: 'Szybki restart bota!',
    },
    flags: CommandFlags.Important,
    expectedArgs: [],
    aliases: [],
    permissions: CommandPermissions.devOnly(),

    async execute(api) {
        if (api.raw.msg) {
            const msg = await api.log.replyInfo(api, 'Zaczekaj chwilę...', 'JustBOT powinien być za chwilę gotowy. Gdy się zrestartuje, ta wiadomość zmieni się na wiadomość sukcesu.');
            await cache.store('session', 'last-restart-command-message-id', msg.id);
            await cache.store('session', 'last-restart-command-channel-id', (api.raw.msg?.channel ?? api.raw.interaction?.channel!).id);
        } else {
            await api.log.replySuccess(api, 'Wysłano sygnał restartu!', 'JustBOT za chwilę powinien wstać ponownie. Niestety komenda nie została wywołana używając prefix commands, więc nie mogę Ci wyświetlić kiedy dokładnie powrócę do życia (sprawdź to sam).')
        }

        output.log('Shutting down... (reason: restart command)');
        Deno.exit(1);
    },
} satisfies Command;