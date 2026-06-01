import { sendLog } from '@/bot/apis/log/send-log.ts';
import { PredefinedColors } from '@/util/color.ts';
import { MessageEventCtx, PredefinedActionEventTypes } from '../index.ts';

import { Action } from '../index.ts';
import { cfg } from '@/bot/cfg.ts';
import { output } from '../../../bot/logging.ts';

const enabled = Deno.env.get('JB_AUTO_UPDATE') == 'true';

export const autoUpdateAction: Action<MessageEventCtx> = {
    name: 'others/auto-update',
    activatesOn: [PredefinedActionEventTypes.OnMessageCreate],

    constraints: [
        (ctx) => ctx.channelId == cfg.channels.justbot.ghBridge,
        () => enabled,
    ],

    callbacks: [
        async () => {
            const cmd = new Deno.Command('git', {
                args: ['pull', '--rebase'],
            });
            const out = await cmd.output();

            output.log('executing fucking auto update action');

            if (out.code != 0) {
                return sendLog({
                    title: 'Auto update się zjebał',
                    description: 'Niestety pan `git` się nas nie posłuchał i nie wykonał git pull.',
                    fields: [
                        { name: 'Exit code', value: `${out.code}` },
                        { name: 'Standard error', value: new TextDecoder().decode(out.stderr) },
                    ],
                    color: PredefinedColors.Red,
                });
            }

            sendLog({
                title: 'Zrobiłem ten auto update!',
                description: 'Auto update się wykonał. Teraz bot się zrestartuje, by nowe zmiany weszły w życie. Poczekaj chwilę czy coś.',
                color: PredefinedColors.Gold,
            });
            Deno.exit(1);
        },
    ],
};
