import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { getCompilerForLang } from '@/bot/apis/compile/auto.ts';
import * as compile from '@/bot/apis/compile/driver.ts';

const compileCmd: Command = {
    name: 'compile',
    aliases: ['exec-code'],
    flags: CommandFlags.None,
    description: {
        main: 'Tak! Teraz możesz kompilować kod w Javie, Bashu, Julii, C++ czy nawet Go!',
        short: 'Skompiluj kod w swoim ulubionym języku programowania.',
    },
    permissions: CommandPermissions.everyone(),

    expectedArgs: [
        {
            name: 'compiler',
            description: 'Daj file extension albo nazwę języka idk.',
            optional: true,
            type: { base: 'string' },
        },
        {
            name: 'code',
            description: 'No kod.',
            optional: false,
            type: { base: 'code' },
        },
        {
            name: 'stdin',
            description: 'Opcjonalne stdin przekazane do twojego programu',
            optional: true,
            type: { base: 'code' },
        },
    ],

    async execute(api) {
        const msg = await api.log.replyInfo(
            api,
            'Chwila...',
            'Przetwarzam dane',
        );

        const langArg = api.getTypedArg('compiler', 'string')?.value;
        const code = api.getTypedArg('code', 'code').value;
        const stdin = api.getTypedArg('stdin', 'code')?.value;

        const lang = langArg ?? code.lang ?? undefined;
        if (!lang) {
            return msg.edit({
                embeds: [
                    api.log.getErrorEmbed(
                        'Nie jestem jasnowidzem!',
                        'Musisz podać w jakim języku jest twój kod, albo jako argument albo na górze codeblocka.',
                    ),
                ],
            });
        }

        const driver = await getCompilerForLang(lang);
        const info = await driver.info();

        if (info.lang === 'unknown') {
            return await msg.edit({
                embeds: [
                    api.log.getWarnEmbed(
                        'Kompiler zły dałeś...',
                        `Kompilator \`${lang}\` nie jest poprawnym kompilatorem na liście.`,
                    ),
                ],
            });
        }

        const footerText = `${info.lang} | ${info.displayName} ${info.version} | ${info.backend}`;
        msg.edit({
            embeds: [
                api.log.getInfoEmbed(
                    'Kompiluje twój kod...',
                    'Proszę uzbroić się w cierpliwość bo kompilacja jest zasobożerna.',
                ).setFooter({ text: footerText }),
            ],
        });

        const result = await driver.compile({
            source: code.src,
            stdin: stdin?.src ?? '',
        });

        if (result.status != compile.Status.Success || result.runtime == null) {
            let title: string;
            let body: string;
            if (result.runtime == null) {
                title = 'Błąd kompilacji!';
                body = '```\n' + result.compile.messages.map(m => m.content).join('\n') + '```';
            } else if (result.status == compile.Status.TimeLimitExceeded) {
                title = 'Timeout!';
                body = 'Twój program działał za długo i musiał zostać zabity. Przykra strata.'
            } else if (result.status == compile.Status.MemLimitExceeded) {
                title = 'Przekroczyłeś limit pamięci!';
                body = 'Twój program zużywał za dużo pamięci, zdajesz sobie sprawe, że RAM nie rośnie na drzewach?';
            } else {
                title = 'Błąd!';
                body = 'Jakiś nieznany internal błąd czy coś. Sprawdź logi jeśli jesteś adminem a jeśli nie jesteś to chuja cie to obchodzi.';
            }

            return await msg.edit({
                embeds: [
                    api.log.getErrorEmbed(title, body)
                        .setFooter({ text: footerText }),
                ],
            });
        }

        let cmdOutput: string = '```';

        const allMessages = result.compile.messages;
        if (result.runtime) allMessages.push(...result.runtime.messages);

        const addStreamMarker = allMessages.some((m) => m.kind == 'stderr');

        for (const msg of allMessages) {
            switch (msg.kind) {
            case 'stdout':
                cmdOutput += `${addStreamMarker ? '[stdout] ' : ''}${msg.content.replaceAll('\`', '').trim()}\n`;
                break;
            case 'stderr':
                cmdOutput += `[stderr] ${msg.content.replaceAll('\`', '').trim()}\n`;
                break;
            }
        }

        cmdOutput += '```\n';
        cmdOutput += `exited with code: \`${result.runtime?.exitcode ?? result.compile.exitcode}\``;

        if (cmdOutput.length > 1500) {
            return await msg.edit({
                embeds: [
                    api.log.getWarnEmbed('Za długie', 'Result twojego programu jest za długi. Spróbuj podzielić swój kod.')
                        .setFooter({ text: footerText }),
                ],
            });
        }

        return await msg.edit({
            embeds: [
                api.log.getSuccessEmbed('Masz ten result czy coś', cmdOutput)
                    .setFooter({ text: footerText }),
            ],
        });
    },
};

export default compileCmd;
