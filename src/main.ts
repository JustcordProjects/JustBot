console.log('Welcome to JustBOT!');

// preparation & basic imports
import { client } from '@/client.ts';
import { output } from '@/bot/logging.ts';
import process from 'node:process';

import logError from '@/util/log-error.ts';
process.on("uncaughtException", (err) => {
    logError('stderr', err);
    if (err.message?.includes('An invalid token was provided.')) {
        output.err('Automatic shutdown. Token is invalid.');
        Deno.exit(2);
    }
});

// required libs
import * as dsc from 'discord.js';

// configuration
import { cfg } from '@/bot/cfg.ts';

// actions
import AutoModRules from '@/features/mod/automod.ts';
import { initExpiredWarnsDeleter } from '@/features/delete-expired-warns.ts';
import { sayGoodbyeAction, welcomeNewUserAction } from '@/features/others/welcomer.ts';
import { countingChannelAction } from '@/features/4fun/counting-channel.ts';
import { lastLetterChannelAction } from '@/features/4fun/last-letter-channel.ts';
import { mediaChannelAction } from '@/features/4fun/media-channel-action.ts';
import { basicMsgCreateActions } from '@/features/others/basic-msg-create-actions.ts';
import { registerTemplateChannels } from '@/features/channels/register-template-channels.ts';
import { channelAddWatcher, channelDeleteWatcher, onMuteGivenWatcher, setUpWatchdog } from '@/bot/watchdog.ts';
import { actionPing } from '@/features/4fun/ping-death-chat.ts';
import { onReceivedEmailAction } from '@/features/others/on-new-email.ts';

// events
import { registerChannelCreateDscEvents } from '@/events/client/channel-create.ts';
import { registerChannelDeleteDscEvents } from '@/events/client/channel-delete.ts';
import { registerGuildUpdateDscEvents }   from '@/events/client/guild-update.ts';

// commands
import * as slashCommands from '@/features/commands/slash.ts';
import * as prefixCommands from '@/features/commands/prefix.ts';

// integrations
import * as zapbox from '@/apis/compile/zapbox.ts';
import * as pokedex from '@/apis/pokedex/pokedex.ts';
import * as github from '@/apis/github/github.ts';
import * as gemini from '@/apis/gemini/model.ts';
import * as email from '@/apis/email/mail.ts';
import * as cache from '@/apis/cache/cache.ts';

// misc
import * as log from '@/util/log.ts';

import actionsManager from '@/features/actions.ts';
import { db } from '@/apis/db/bot-db.ts';

import { initEmailActionsIntegration } from '@/apis/email/actions.ts';
import { getChannel } from '@/features/channels/template-channels.ts';
import { initStatusGenerator } from '@/util/generate-status-quote.ts';

import { initAskCmdModel, initWikiModel } from '@/features/ei/models.ts';
import { askAction } from '@/features/4fun/ask.ts';
import { addVoiceExperience } from '@/bot/level.ts';
import { addMusicAction } from '@/features/4fun/add-content.ts';
import { registerCommands } from '@/cmd/list.ts';
import { reactionAddHandler, reactionRemoveHandler } from '@/features/4fun/reaction-handler.ts';
import { registerMsgEditDscEvents } from '@/features/logs/edit-message.ts';
import { deleteMessageAction } from '@/features/logs/delete-message.ts';
import { reminderHandler } from '@/features/reminders.ts';
import { autoUpdateAction } from './features/others/auto-update.ts';
import { pollsModerator } from '@/features/mod/polls-mod.ts';

// --------------- INIT ---------------
client.once('clientReady', async () => {
    await output.init();
    output.log(`Logged in.`);
    if (Deno.env.get('JB_DEVELOPMENT') == 'true') {
        output.verbose(
            '------------------------------------------------\n' +
            'Verbose logging enabled.\n' +
            'JustBOT will log more detailed output.\n' +
            'To disable this behaviour, please set\n' +
            'JB_DEVELOPMENT to false or unset this variable.\n' +
            '------------------------------------------------'
        );
    }
    
    await registerCommands();
    output.verbose('Commands registered');

    await db.init();
    output.verbose(`Database initialized.`);

    addVoiceExperience();

    if (!Deno.env.get('JB_EMAIL_USER') || !Deno.env.get('JB_EMAIL_PASS')) {
        output.warn('You should set JB_EMAIL_USER and JB_EMAIL_PASS enviorment variables to a GMail login and temporary password\nOtherwise, the e-mail based commands will not work');
    } else {
        await email.init();
        await initEmailActionsIntegration();
        output.verbose(`Email initialized.`);
    }

    await gemini.init();
    if (!gemini.isInitialized()) {
        output.warn('You should set JB_GEMINI_API_KEY enviroment variable to your Gemini api key\nOtherwise, the Gemini integration based commands will not work');
    } else if (cfg.features.ai.enabled) {
        initAskCmdModel();
        initWikiModel();
        output.verbose(`Gemini initialized.`);
    }

    if (!zapbox.isAvailable()) {
        output.warn('You should set JB_ZAPBOX_PATH enviroment variable to path to the zapbox executable\nOtherwise, the zapbox compiler driver will not work');
    } else {
        zapbox.init().then(() => {
            output.verbose(`Zapbox container initialized.`)
        });
    }

    await pokedex.init();
    output.verbose(`Pokedex integration initialized`);

    await github.init();
    output.verbose(`Github integration initialized`);

    await cache.init();
    output.verbose(`Cache initialized.`);

    await main();
});

// --------------- SETUP ---------------

function setUpActions() {
    actionsManager.addActions(
        // watchdog security features
        channelAddWatcher,
        channelDeleteWatcher,
        onMuteGivenWatcher,
        // lobby & users watchdog
        welcomeNewUserAction,
        sayGoodbyeAction,
        // automod
        ...AutoModRules.all(),
        pollsModerator,
        // msg-specific actions
        mediaChannelAction,
        countingChannelAction,
        lastLetterChannelAction,
        basicMsgCreateActions,
        askAction,
        // reaction handlers
        reactionAddHandler,
        reactionRemoveHandler,
        // additional features
        actionPing,
        onReceivedEmailAction,
        addMusicAction,
        autoUpdateAction,
        // logging
        deleteMessageAction
    );
    registerTemplateChannels(client);
    slashCommands.init();
    prefixCommands.init();
    actionsManager.registerEvents(client);
}

function setUpEvents() {
    registerChannelCreateDscEvents(client);
    registerChannelDeleteDscEvents(client);
    registerMsgEditDscEvents(client);
    registerGuildUpdateDscEvents(client);
    setUpWatchdog();
}

// --------------- MAIN ---------------
async function main() {
    initStatusGenerator();
    initExpiredWarnsDeleter();
    setUpActions();
    setUpEvents();

    let memoryIssuesTimes = 0;

    setInterval(() => {
        const processHeap = Deno.memoryUsage().heapUsed;
        const availableMemory = Deno.systemMemoryInfo().available;

        const treshold = 25 * 1024 * 1024; // 25MB
        if (processHeap > availableMemory - treshold) {
            output.warn(`Low on memory.\nUsing: ${processHeap} of ${availableMemory} available memory.\nJustBOT will attempt to restart if this situation occurs more than 6 times in the next 10 seconds.`);
            memoryIssuesTimes++;
            if (memoryIssuesTimes == 6) {
                output.log(`Shutting down... (reason: out of memory)`);
                Deno.exit(1); // start.hosting-only.js should catch this
            }
        }
    }, 500);

    setInterval(() => {
        memoryIssuesTimes = 0;
    }, 10_000);

    try {
        const messageId = await cache.load<string>('session', 'last-restart-command-message-id');
        const channelId = await cache.load<string>('session', 'last-restart-command-channel-id');
        if (messageId != undefined && channelId != undefined) {
            await cache.del('session', 'last-restart-command-message-id');
            await cache.del('session', 'last-restart-command-channel-id');

            const channel = await client.channels.fetch(channelId) as dsc.TextChannel;
            const message = await channel.messages.fetch(messageId);

            message.edit({
                embeds: [
                    log.getSuccessEmbed('Restart zakończony', 'Istota wyższa pomyślnie i wreszcie się zrestartowała i powinna już działać poprawnie!')
                ]
            });
        }
    } catch {}

    if (cfg.database.backups.enabled) {
        setInterval(async () => {
            let dbBackUpsChannel: dsc.GuildTextBasedChannel;
            try {
                dbBackUpsChannel = await getChannel(cfg.channels.justbot.dbBackups, client) as dsc.GuildTextBasedChannel;
            } catch {
                output.err('could not find the channel to send db backups');
                return;
            }
            if (!dbBackUpsChannel.isSendable()) {
                output.err('the channel with db backups is not sendable');
                return;
            }
            try {
                const dbPath = './bot.db';
                const backupName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;

                await dbBackUpsChannel.send({
                    content: `${cfg.database.backups.msg} (${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })})`,
                    files: [{ attachment: dbPath, name: backupName }],
                });
            } catch (e) {
                logError('stdwarn', e, "Database backups");
            }
        }, cfg.database.backups.interval);
    }

    reminderHandler();
}

globalThis.addEventListener('exit', output.deinit);
Deno.addSignalListener('SIGINT', () => {
    Deno.exit(0); // NOTE: this triggers exit listener two lines above
});

(async function () {
    if (!Deno.env.get('JB_TOKEN') && Deno.env.get('TOKEN'))
        Deno.env.set('JB_TOKEN', Deno.env.get('TOKEN')!);
    await client.login(Deno.env.get('JB_TOKEN'));
})();
