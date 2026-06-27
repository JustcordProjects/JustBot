import * as dsc from 'discord.js';

import { cfg } from '@/bot/cfg.ts';
import actionsManager, { Action, MessageEventCtx, PredefinedActionEventTypes } from '../actions.ts';
export default actionsManager;

import { extractMediaLinks } from '@/features/cdb-scan.ts';
import { db } from '@/apis/db/bot-db.ts';

export const addMusicAction: Action<MessageEventCtx> = {
    name: '4fun/add-content',
    activatesOn: PredefinedActionEventTypes.OnMessageCreateOrEdit,
    constraints: [
        (msg: dsc.Message) => {
            if (msg.author.bot) return false;
            return cfg.features.contentDatabases.some(cdb => cdb.channel === msg.channelId);
        },
    ],
    callbacks: [
        async (msg: dsc.Message) => {
            for (const cdb of cfg.features.contentDatabases) {
                if (cdb.channel !== msg.channelId) continue;

                const links = extractMediaLinks(msg.content, cdb);

                for (const link of links) {
                    db.content.addEntry(msg.author.id, link, cdb.id);
                }
            }
        },
    ],
};
