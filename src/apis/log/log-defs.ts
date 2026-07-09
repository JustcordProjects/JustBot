import * as dsc from 'discord.js';
import type { ReplyEmbed } from '@/apis/translations/reply-embed.ts';

export interface LogData {
    title: string;
    description: string;
    attachments?: (dsc.Attachment | dsc.AttachmentBuilder)[];
    fields?: dsc.APIEmbedField[];
    color?: dsc.ColorResolvable;
    where?: dsc.Snowflake;
    additionalEmbeds?: ReplyEmbed[];
}
