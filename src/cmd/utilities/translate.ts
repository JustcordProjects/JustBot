import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';

import { translate } from '@vitalets/google-translate-api';
import logError from '@/util/log-error.ts';

function parseOpts(str: string): { from?: string; to?: string } {
    let from: string | undefined, to: string | undefined;

    if (str.includes(':')) {
        const parts = str.split(':');
        from = parts[0] || undefined;
        to = parts[1] || undefined;
    } else {
        from = undefined;
        to = str || undefined;
    }

    return { from, to };
}

export default {
    name: 'translate',
    aliases: ['tr'],
    description: {
        main: 'Przetłumacz tekst na jaki język ci się podoba!',
        short: 'Tłumacz'
    },

    flags: CommandFlags.None | CommandFlags.WorksInDM,
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'opts',
            description: '`from:to`, lub samo `to` (wtedy `from` = auto)',
            optional: false,
            type: { base: 'string' }
        },
        {
            name: 'text',
            description: "Tekst który chcesz przetłumaczyć",
            optional: false,
            type: { base: 'string', trailing: true, allowCodeBlock: true },
        }
    ],

    async execute(api) {
        const optsString = api.getTypedArg('opts', 'string').value;
        const text = api.getTypedArg('text', 'string').value;
        const opts = parseOpts(optsString);

        if (opts.to && opts.to == opts.from) {
            return api.log.replyError(api, 'Co to ma być?', 'Wydaje się że tłumaczysz z języka x na język x? To nie ma sensu? Dlaczego tłumaczysz z jednego języka na ten sam?');
        }

        if (
            (opts.to
                ? !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(opts.to)
                : false) ||
            (opts.from
                ? !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(opts.from)
                : false)
        ) {
            return api.log.replyError(api, 'To jest język w ogóle?', 'Wydaje mi się, że źle podałeś języki. Generalnie według różnych specyfikacji powinieneś je podawać tak: `xx` lub `xx-XX`.')
        }

        try {
            const result = await translate(text, { to: opts.to, from: opts.from });

            if (result.text.trim() == text.trim()) {
                return api.log.replyWarn(api, 'Ten sam tekst', 'Po tłumaczeniu wyszedł ten sam tekst co wkleiłeś. Prawdopodobnie w języku do którego tłumaczysz ma on takie sao odzwierciedlenie.');
            }

            return api.log.replyInfo(
                api, 'Tłumaczenie',
                `Twój tekst w tłumaczeniu to:\n\n\`\`\`${result.text}\`\`\``
            );
        } catch (err: unknown) {
            logError('stdwarn', err);
            return api.log.replyError(
                api, 'Błąd tłumaczenia',
                'Nie udało się przetłumaczyć twojego tekstu. Nie wiem czemu.',
            )
        }
    }
} satisfies Command;