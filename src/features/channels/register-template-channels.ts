import * as dsc from 'discord.js';

import { PredefinedActionEventTypes } from '@/features/actions.ts';
import { OnForceReloadTemplates } from '@/events/actions/templates-events.ts';
import { doAddTemplateChannel, doGetChannel } from './template-channels.ts';
import { makeChannelName } from '@/util/make-channel-name.ts';
import { cfg } from '@/bot/cfg.ts';

const GOAL_SPLITTER = 25;

function doGetNextGoal(memberCount: number): number {
    const base = Math.floor(memberCount / GOAL_SPLITTER) * GOAL_SPLITTER;
    let goal = base + GOAL_SPLITTER;
    if (goal <= memberCount) {
        goal += GOAL_SPLITTER;
    }
    return goal;
}

export async function doRegisterTemplateChannels(client: dsc.Client) {
    const populationTemplateChannel = await doGetChannel(cfg.channels.stats.people, client) as dsc.GuildChannel;
    doAddTemplateChannel({
        channel: populationTemplateChannel,
        updateOnEvents: [
            PredefinedActionEventTypes.OnUserJoin,
            PredefinedActionEventTypes.OnUserQuit,
            OnForceReloadTemplates,
        ],
        format: (_ctx) => makeChannelName({ emoji: '👥', name: `Populacja: ${populationTemplateChannel.guild.memberCount} osób`, leaveSpaces: true }),
    });

    const templateChannelTarget = await doGetChannel(cfg.channels.stats.goal, client) as dsc.GuildChannel;
    doAddTemplateChannel({
        channel: templateChannelTarget,
        updateOnEvents: [
            PredefinedActionEventTypes.OnUserJoin,
            PredefinedActionEventTypes.OnUserQuit,
            OnForceReloadTemplates,
        ],
        format: (_ctx) => makeChannelName({ emoji: '🎯', name: `Cel: ${doGetNextGoal(templateChannelTarget.guild.memberCount)} userów`, leaveSpaces: true }),
    });

    const bansTemplateChannel = await doGetChannel(cfg.channels.stats.bans, client) as dsc.GuildChannel;
    doAddTemplateChannel({
        channel: bansTemplateChannel,
        updateOnEvents: [
            PredefinedActionEventTypes.OnUserBan,
            PredefinedActionEventTypes.OnUserUnban,
            OnForceReloadTemplates,
        ],
        format: async (_ctx) => {
            const guild = bansTemplateChannel.guild;
            const bans = await guild.bans.fetch();
            return makeChannelName({ emoji: '🚫', name: `Bany: ${bans.size} ludzi`, leaveSpaces: true });
        },
    });
}
