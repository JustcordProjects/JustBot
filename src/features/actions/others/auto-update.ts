import { sendLog } from '@/apis/log/send-log.ts';
import { PredefinedColors } from '@/util/color.ts';
import { MessageEventCtx, PredefinedActionEventTypes } from '../index.ts';
import { Action } from '../index.ts';
import { cfg } from '@/bot/cfg.ts';
import process from 'node:process';
import { output } from '@/bot/logging.ts';

export const autoUpdateAction: Action<MessageEventCtx> = {
    name: 'others/auto-update',
    activatesOn: PredefinedActionEventTypes.OnMessageCreate,
    worksOutsideGuild: true,

    constraints: [
        (ctx) => ctx.channelId == cfg.channels.justbot.ghBridge,
        (ctx) => ctx.webhookId != null,
        () => process.env.JB_AUTO_UPDATE == 'true',
    ],

    callbacks: [
        async (msg) => {
            const cmd = new Deno.Command('git', {
                args: ['pull', '--rebase'],
            });
            const out = await cmd.output();

            if (out.code != 0) {
                await msg.react('❌');
                return await sendLog({
                    title: 'Auto update się zjebał',
                    description: 'Niestety pan `git` się nas nie posłuchał i nie wykonał git pull.',
                    fields: [
                        { name: 'Exit code', value: `${out.code}` },
                        { name: 'Standard error', value: '```ansi\n' + new TextDecoder().decode(out.stderr) + '```' },
                    ],
                    color: PredefinedColors.Red,
                });
            }

            const cmd_check = new Deno.Command('make', {
                args: ['check', 'lint'],
            });
            const out_check = await cmd_check.output();

            if (out_check.code != 0) {
                await msg.react('❌');
                return await sendLog({
                    title: 'Auto update się zjebał',
                    description: 'Niestety kod który został bezmyślnie pushnięty na GitHub\'a zawiera błędy, więc postanowione zostało go nie uruchamiać.',
                    color: PredefinedColors.Red,
                });
            }

            await msg.react('✅');
            await sendLog({
                title: 'Zrobiłem ten auto update!',
                description: 'Auto update się wykonał. Teraz bot się zrestartuje, by nowe zmiany weszły w życie. Poczekaj chwilę czy coś.',
                color: PredefinedColors.Gold,
            });

            output.log("Shutting down... (reason: auto-update)");
            setTimeout(() => {
                Deno.exit(1)
            }, 250);
        },
    ],
};
