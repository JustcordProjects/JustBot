import * as config from '@/bot/config/schema.ts';
import * as dsc from 'discord.js';

import { ContentEntry } from '@/apis/db/bot-db.ts';

function makeRegex(contentType: config.ContentType) {
    const domainsPattern = contentType.domains
        .map(domain => domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    return new RegExp(`https?:\\/\\/(?:www\\.)?(?:${domainsPattern})\\/[^\\s]+`, 'g');
}

function extractMediaLinksInternal(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern) || [];
    return matches.map((link) => link.replace(/[),.]+$/, ''));
}

export function extractMediaLinks(text: string, contentType: config.ContentType): string[] {
    return extractMediaLinksInternal(text, makeRegex(contentType));
}

export async function contentDatabaseScan(channel: dsc.GuildTextBasedChannel, contentType: config.ContentType): Promise<ContentEntry[]> {
    const contentEntries: ContentEntry[] = [];
    let lastMessageId: string | undefined;

    const theRegex = makeRegex(contentType);

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

            const links = extractMediaLinksInternal(message.content, theRegex);
            for (const link of links) {
                contentEntries.push({
                    key: contentType.id,
                    authorId: message.author.id,
                    contentUrl: link,
                });
            }
        }

        lastMessageId = messages.lastKey();
    }

    return contentEntries;
}
