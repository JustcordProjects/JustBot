import { client } from '@/client.ts';
import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { getRandomInt } from './math/rand.ts';
import { cfg } from '@/bot/cfg.ts';

function changeStatusToRandomOne(prev?: number): number {
    while (true) {
        const idx = getRandomInt(0, cfg.bot.activities.length - 1);
        if (prev != undefined && idx == prev) continue;

        const status = cfg.bot.activities[idx];

        client.user?.setActivity({ 
            type: 
                status.type == 'playing' ?
                ActivityType.Playing :
                status.type == 'watching' ?
                ActivityType.Watching :
                status.type == 'listening' ? 
                ActivityType.Listening : 
                ActivityType.Watching, 
            name: status.name, 
            state: status.description
        });
        client.user?.setStatus(
            cfg.bot.status == 'dnd' ?
            PresenceUpdateStatus.DoNotDisturb :
            cfg.bot.status == 'brb' ?
            PresenceUpdateStatus.Idle :
            cfg.bot.status == 'online' ?
            PresenceUpdateStatus.Online :
            cfg.bot.status == 'invisible' ?
            PresenceUpdateStatus.Invisible :
            PresenceUpdateStatus.Online
        );
        return idx;
    }
}

export function initStatusGenerator() {
    let prev: number | undefined;

    setInterval(() => {
        prev = changeStatusToRandomOne(prev);
    }, 2 * 60 * 1000);

    prev = changeStatusToRandomOne();
}
