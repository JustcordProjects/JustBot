import { Emoji } from '@/bot/config/schema/subtypes.ts';

export default function fmtEmoji(emoji: Emoji) {
    return `<:${emoji.name}:${emoji.id}>`;
}
