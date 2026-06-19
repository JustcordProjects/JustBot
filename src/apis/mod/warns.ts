import * as dsc from 'discord.js';

import { scheduleWarnDeletion } from '@/features/delete-expired-warns.ts';
import User from '@/apis/db/user.ts';
import { client } from '@/client.ts';
import { PredefinedColors } from '@/util/color.ts';
import { sendLog } from '@/apis/log/send-log.ts';
import { cfg } from '@/bot/cfg.ts';
import { registerWarnInWatchdog } from '@/bot/watchdog.ts';

export default async function warn(
    member: dsc.GuildMember,
    data: { reason: string; expiresAt: number | null; points: number; mod?: dsc.Snowflake },
): Promise<{ id: number }> {
    const user = new User(member.id);
    const result = await user.warns.add({
        moderatorId: data.mod ?? client.user!.id,
        reason: data.reason, points: data.points,
        expiresAt: data.expiresAt ?? undefined
    });

    const warnId = result.lastID!;

    if (data.expiresAt) {
        scheduleWarnDeletion(warnId, data.expiresAt);
    }

    sendLog({
        title: 'Użytkownik dostał warna',
        color: PredefinedColors.Orange,
        description: `Użytkownik <@${user.id}> dostał warna w wysokości ${data.points} pkt od ${data.mod ? `moderatora <@${data.mod}>` : 'nieznanego moderatora'}.`,
        fields: [
            {
                name: 'Powód',
                value: data.reason,
            },
            {
                name: 'Wygasa',
                value: data.expiresAt ? `<t:${data.expiresAt?.toString()}:R>` : 'nigdy',
            },
        ],
    }, [cfg.channels.mod.punishments]);

    if (data.mod)
        registerWarnInWatchdog(data.mod);

    return { id: warnId };
}
