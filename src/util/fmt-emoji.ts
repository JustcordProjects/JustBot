import { Emoji } from '@/bot/config/schema/subtypes.ts';

export default function doFmtEmoji(emoji: Emoji) {
    return `<:${emoji.name}:${emoji.id}>`;
}
