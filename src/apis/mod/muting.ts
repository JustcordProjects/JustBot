import * as dsc from 'discord.js';
import { sendLog } from '@/log/send-log.ts';
import { PredefinedColors } from '@/util/color.ts';
import { cfg } from '@/bot/cfg.ts';

export default function mute(
    member: dsc.GuildMember,
    data: { reason: string; duration?: number; moderator: string; },
): Promise<dsc.GuildMember> {
    sendLog({
        color: PredefinedColors.Purple,
        title: 'Użytkownik dostał mute',
        description: `Użytkownik <@${member.id}> został wyciszony przez <@${data.moderator}>.`,
        fields: [{ name: 'Powód', value: data.reason }, { name: 'Wygasa', value: `<t:${(Date.now() + (data.duration ?? 1))/1000}:R>` }],
    }, [ cfg.channels.mod.punishments ]);

    return member.timeout(data.duration ?? null, data.reason);
}
