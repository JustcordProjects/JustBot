import { cfg } from '@/bot/cfg.ts';
import { output } from '@/bot/logging.ts';

export interface ChannelName {
    name: string;
    emoji: string;
    leaveSpaces?: boolean;
}

function doMakeEmojiForChannelName(emoji: string) {
    return `${cfg.channels.settings.characters.beforeEmoji}${emoji.replace(' ', cfg.channels.settings.spaceReplacement ?? '-')}${cfg.channels.settings.characters.afterEmoji}`;
}

export function doMakeChannelName(data: ChannelName) {
    if (data.emoji.trim().length > 4) {
        output.warn(`Suspicious channel emoji at makeChannelName (data: ${JSON.stringify(data)})`);
    }
    if (data.name.length < 3) {
        output.warn(`Suspicious channel name at makeChannelName (data: ${JSON.stringify(data)})`);
    }

    let channel_name = '';

    if (cfg.channels.settings.emojiPlacement == 'before-name')
        channel_name += doMakeEmojiForChannelName(data.emoji);

    channel_name += data.name
        .replaceAll(
            ' ',
            data.leaveSpaces
                ? ' '
                : (cfg.channels.settings.spaceReplacement ?? '-')
        );

    if (cfg.channels.settings.emojiPlacement == 'after-name')
        channel_name += doMakeEmojiForChannelName(data.emoji);

    return channel_name;
}
