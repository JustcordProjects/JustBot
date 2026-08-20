import { ActionCallback, ActionEventType, AnyAction, AnyEventCtx, ConstraintCallback } from '../actions.ts';
import { ChannelEventCtx } from '../actions.ts';

import actionsManager from '../actions.ts';

import { RenameableChannel } from '@/defs.ts';

import * as dsc from 'discord.js';

export async function doGetChannel(id: dsc.Snowflake, client: dsc.Client): Promise<dsc.Channel> {
    let channel = client.channels.cache.get(id);
    if (channel == null) {
        channel = await client.channels.fetch(id) ?? undefined;
    }

    return channel!;
}

export interface TemplateChannel {
    channel: RenameableChannel;
    updateOnEvents: ActionEventType[];
    format: (ctx: AnyEventCtx) => string | Promise<string>;

    additionalConstraints?: ConstraintCallback<ChannelEventCtx>[];
    additionalCallbacks?: ActionCallback<ChannelEventCtx>[];
}

export function doMkTemplateChannelUpdateAction({ channel, updateOnEvents, format, additionalConstraints, additionalCallbacks }: TemplateChannel): AnyAction {
    return {
        name: 'template-channels/' + channel.id,
        activatesOn: updateOnEvents,
        constraints: [
            ...additionalConstraints || [],
        ],
        callbacks: [
            async (ctx: AnyEventCtx) => {
                const newName: string = await format(ctx);
                channel.setName(newName);
            },
            ...additionalCallbacks || [],
        ],
    };
}

export function doAddTemplateChannel(options: TemplateChannel) {
    actionsManager.addAction(doMkTemplateChannelUpdateAction(options));
}
