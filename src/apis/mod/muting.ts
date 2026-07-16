import * as dsc from 'discord.js';
import { client } from '@/features/serchat/client.ts';
import { cfg } from '@/bot/cfg.ts';
import { db } from '@/apis/db/bot-db.ts';

export default async function mute(
    member: dsc.GuildMember,
    data: { reason: string; duration?: number },
): Promise<dsc.GuildMember> {
    try {
        const user = await db.platforms.getExternalAccount('serchat', member.id);
        if (user)
            await client.timeoutMember(
                cfg.channels.serchat.serverId,
                user.external_account,
                Math.floor((data.duration ?? 0) / 1000),
                data.reason
            );
    } catch {}

    return member.timeout(data.duration ?? null, data.reason);
}
