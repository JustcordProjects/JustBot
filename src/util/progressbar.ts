import doFmtEmoji from './fmt-emoji.ts';
import { cfg } from '@/bot/cfg.ts';

export function doMkDualProgressBar(red: number, green: number, totalLength: number = 10) {
    const maxHalf = totalLength / 2;
    red = Math.min(red, maxHalf);
    green = Math.min(green, maxHalf);

    return doFmtEmoji(cfg.emojis.darkRedBlock).repeat(maxHalf - red) +
        doFmtEmoji(cfg.emojis.lightRedBlock).repeat(red) +
        doFmtEmoji(cfg.emojis.lightGreenBlock).repeat(green) +
        doFmtEmoji(cfg.emojis.darkGreenBlock).repeat(maxHalf - green);
}

export function doMkProgressBar(fillLength: number, max: number, totalLength: number = 13) {
    const progress = Math.min(fillLength / max, 1);
    const filledLength = Math.floor(totalLength * progress);
    const emptyLength = totalLength - filledLength;

    return `${'█'.repeat(filledLength)}${'░'.repeat(emptyLength)}`;
}
