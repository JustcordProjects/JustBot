import { client } from '@/client.ts';

import actionsManager, { Action, MagicSkipAllActions, PredefinedActionEventTypes, UserEventCtx } from '../actions.ts';
export default actionsManager;

import { cfg } from '@/bot/cfg.ts';
import { watchNewMember } from '@/bot/watchdog.ts';
import { output } from '@/bot/logging.ts';

import randomElement from '@/util/random-element.ts';

const StartItId = '572906387382861835';

export const welcomeNewUserAction: Action<UserEventCtx> = {
    name: 'others/welcomer/join',
    activatesOn: PredefinedActionEventTypes.OnUserJoin,
    constraints: [
        () => cfg.features.welcomer.enabled,
    ],
    callbacks: [
        async (member) => {
            if (await watchNewMember(member) == 'kicked') return MagicSkipAllActions;

            for (const role of cfg.features.welcomer.freeRolesForEveryone) {
                try {
                    await member.roles.add(role);
                } catch {
                    output.warn("welcomer: can't apply role <@&" + role + '> to <@' + member.id + '>');
                }
            }

            const welcomeChannel = await client.channels.fetch(cfg.channels.important.lobby);
            if (welcomeChannel == null || !welcomeChannel.isSendable()) return;

            const generalChannel = await client.channels.fetch(cfg.channels.general.general);
            if (generalChannel == null || !generalChannel.isSendable()) return;

            if (member.user.id == StartItId) {
                await welcomeChannel.send('Spierdalaj ty zjebie podludzki start it nikt cię tu nie chce');
                return;
            } else {
                await welcomeChannel.send({
                    content: '<:join:1510910009368641667>' +
                        randomElement(cfg.features.welcomer.welcomeMsgs).replace('<mention>', `<@${member.user.id}>`),
                    allowedMentions: cfg.features.welcomer.mentionNewPeopleInLobby ? {} : { parse: [] },
                });
                await generalChannel.send(`witaj <@${member.user.id}>, będzie nam miło jak się przywitasz czy coś <:emoji_a_radosci_nie_bylo_konca:1510697737920839680>`);
            }
        },
    ],
};

export const sayGoodbyeAction: Action<UserEventCtx> = {
    name: 'others/welcomer/leave',
    activatesOn: PredefinedActionEventTypes.OnUserQuit,
    constraints: [
        () => cfg.features.welcomer.enabled,
    ],
    callbacks: [
        async (member) => {
            const channel = await client.channels.fetch(cfg.channels.important.lobby);
            if (!channel?.isSendable()) return;

            if (member.user.id == StartItId) {
                await channel.send('I dobrze, i tak nikt cię nie lubił start it!');
                return;
            }

            await channel.send({
                content: '<:leave:1510910039777345576>' +
                    randomElement(cfg.features.welcomer.goodbyeMsgs).replace('<mention>', `<@${member.user.id}> (${member.user.username})`),
                allowedMentions: cfg.features.welcomer.mentionNewPeopleInLobby ? {} : { parse: [] },
            });
        },
    ],
};
