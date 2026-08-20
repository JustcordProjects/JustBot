import * as config from '@/bot/config/schema.ts';
import * as dsc from 'discord.js';

import { ContentEntry } from '@/apis/db/bot-db.ts';

function doMakeRegex(contentType: config.ContentType) {
    const domainsPattern = contentType.domains
        .map(domain => domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    return new RegExp(`https?:\\/\\/(?:www\\.)?(?:${domainsPattern})\\/[^\\s]+`, 'g');
}

function doExtractMediaLinksInternal(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern) || [];
    return matches.map((link) => link.replace(/[),.]+$/, ''));
}

export function doExtractMediaLinks(text: string, contentType: config.ContentType): string[] {
    return doExtractMediaLinksInternal(text, doMakeRegex(contentType));
}

export async function doContentDatabaseScan(channel: dsc.GuildTextBasedChannel, contentType: config.ContentType): Promise<ContentEntry[]> {
    const contentEntries: ContentEntry[] = [];
    let lastMessageId: string | undefined;

    const theRegex = doMakeRegex(contentType);

    while (true) {
        const messages = await channel.messages.fetch({
            limit: 100,
            before: lastMessageId,
        });

        if (messages.size === 0) {
            break;
        }

        for (const message of messages.values()) {
            if (message.author.bot) continue;
            for (const stuff of [message, ...message.messageSnapshots.values()]) {
                const links = doExtractMediaLinksInternal(stuff.content, theRegex);
                for (const link of links) {
                    contentEntries.push({
                        key: contentType.id,
                        authorId: stuff.author?.id ?? message.author.id,
                        contentUrl: link,
                    });
                }
            }
        }

        lastMessageId = messages.lastKey();
    }

    return contentEntries;
}
