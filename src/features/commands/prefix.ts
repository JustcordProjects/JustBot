import * as log from '@/util/log.ts';
import * as dsc from 'discord.js';
import { output } from '@/bot/logging.ts';

import { cfg } from '@/bot/cfg.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { commands } from '@/cmd/list.ts';

import canExecuteCmd from '@/util/cmd/can-execute.ts';
import findCommand from '@/util/cmd/find-command.ts';
import { isCommandDisallowed } from '@/util/cmd/is-disallowed.ts';

import isCommandBlockedOnChannel from '@/util/cmd/is-blocked.ts';
import actionsManager, { PredefinedActionEventTypes } from '../actions.ts';

import { PredefinedColors } from '@/util/color.ts';

import { doHandleError } from './helpers/error-handler.ts';
import { doMakeCommandApi } from './helpers/make-command-api.ts';
import { ReplyEmbed } from '@/apis/translations/reply-embed.ts';
import { CommandTokenizer } from './helpers/tokenizer.ts';

import sleep from '@/util/sleep.ts';

function doWaitForButton(interaction: dsc.Message, buttonId: string, time = 15000) {
    return new Promise((resolve, reject) => {
        const collector = interaction.channel.createMessageComponentCollector({
            filter: function (i) {
                return i.customId == buttonId && i.user.id == interaction.author.id;
            },
            time,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            collector.stop('clicked');
            resolve(i);
        });

        collector.on('end', (_, reason) => {
            if (reason != 'clicked') {
                reject(new Error('Button not clicked in time'));
            }
        });
    });
}

async function doTempReaction(msg: dsc.Message, reaction: string) {
    const react = await msg.react(reaction);
    await sleep(2000);
    try {
        await react.remove();
    } catch {}
}

async function doPrefixCommandsMessageHandler(msg: dsc.OmitPartialGroupDMChannel<dsc.Message<boolean>>) {
    if (!(msg instanceof dsc.Message)) return;

    const content = msg.content.trimStart();

    const prefixes = [
        cfg.commands.prefix,
        ...(cfg.commands.alternativePrefixes ?? []),
    ];

    const prefix = prefixes.find((p) => content.toLowerCase().startsWith(p.toLowerCase()));

    if (!prefix) return;

    const tokenizer = new CommandTokenizer(content.slice(prefix.length));
    const argsRaw = tokenizer.tokenize();

    const cmdArg = argsRaw.shift();
    if (!cmdArg) return;
    const cmdName = cmdArg.value.toLowerCase();

    const result = findCommand(cmdName, commands);
    if (!result) {
        if (content.replaceAll(prefix, '').trim() == '') {
            return;
        }

        return await doTempReaction(msg, '❌');
    }

    const { command } = result;

    if (isCommandDisallowed(command, msg.member ?? msg.author)) {
        return await log.replyWarn(msg, 'Nie dla psa kiełbasa...', 'Niestety ktoś mądry pomyślał, by specjalnie dla ciebie wyłączyć tę komendę.');
    }

    if (!canExecuteCmd(command, msg.member ?? msg.author)) {
        log.replyError(
            msg,
            'Hej, a co ty odpie*dalasz?',
            'Wiesz że nie masz uprawnień? Poczekaj aż ktoś się tobą zajmie. Bój się...',
        );
        return;
    }

    const isBlocked = isCommandBlockedOnChannel(command, msg.channelId, !msg.inGuild());
    if (isBlocked) {
        return await doTempReaction(msg, '❌');
    }

    if (!msg.inGuild() && !(command.flags & CommandFlags.WorksInDM)) {
        log.replyError(
            msg,
            'Nie tutaj panie...',
            'Taka komenda jak \`<cmd>\` może być wykonana tylko na serwerach. Zazwyczaj jest ku temu jakiś głębszy powód niż tak, więc zaufaj mi i odpal to na serwerze.'.replace('<cmd>', cmdName.replaceAll('`', '')),
        );
        return;
    }

    if (
        (cfg.commands.confirmUnsafeCommands && (command.flags & CommandFlags.Unsafe)) ||
        (cfg.commands.confirmDeprecatedCommands && (command.flags & CommandFlags.Deprecated))
    ) {
        const row = new dsc.ActionRowBuilder<dsc.ButtonBuilder>()
            .addComponents(
                new dsc.ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Tak, uruchom')
                    .setStyle(dsc.ButtonStyle.Danger),
            );

        const reply = await msg.reply({
            embeds: [
                new ReplyEmbed()
                    .setColor(PredefinedColors.Red)
                    .setTitle('Czy na pewno chcesz uruchomić tą komendę?')
                    .setDescription(`Została ona oznaczona jako ${((command.flags & CommandFlags.Unsafe) && (command.flags & CommandFlags.Deprecated)) ? 'potencjalnie niebezpieczna i przestarzała' : (command.flags & CommandFlags.Deprecated) ? 'przestarzała' : 'potencjalnie niebezpieczna'}.`),
            ],
            components: [row],
        });

        try {
            await doWaitForButton(msg, 'confirm', 20000);
            try {
                reply.delete();
            } catch {}
        } catch {
            return;
        }
    }

    try {
        await msg.channel.sendTyping();
        const api = await doMakeCommandApi(command, argsRaw, {
            msg,
            guild: msg.guild ?? undefined,
            cmd: command,
            invokedviaalias: cmdName,
        });
        await command.execute(api);
    } catch (err) {
        doHandleError(err, msg);
    }
}

export function doInit() {
    actionsManager.addAction({
        name: 'commands/prefix',
        callbacks: [doPrefixCommandsMessageHandler],
        constraints: [
            (msg) => [cfg.commands.prefix, ...cfg.commands.alternativePrefixes].some((val) => msg.content.toLowerCase().startsWith(val.toLowerCase())),
        ],
        activatesOn: PredefinedActionEventTypes.OnMessageCreate,
        worksOutsideGuild: true,
    });
    output.verbose('Prefix commands event registered');
}
