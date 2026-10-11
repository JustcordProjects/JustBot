import { client } from '@/client.ts';
import { db } from '@/apis/db/bot-db.ts';
import { Day } from '@/util/parse-timestamp.ts';

import randomElement from '@/util/random-element.ts';
import logError from '@/util/log-error.ts';

export function decode(base64: string): string {
    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

async function callback() {
    try {
        const guild = client.guilds.cache.first();
        const topUsers = await db.leveling.getTop(30);
        if (guild != null && topUsers.length > 0) {
            const selectedUser = randomElement(topUsers);
            const member = await guild.members.fetch(selectedUser.id);
            if (member != null && member.manageable) {
                await member.setNickname(decode('TGV0IHRoZSBoYW1zdGVycyBnbyBmcmVlIQ=='));
            }
        }
    } catch (err) {
        logError('stdwarn', err);
    }

    scheduleSpecialFeature();
}

export function scheduleSpecialFeature() {
    const randomDays = Math.floor(Math.random() * 5) + 1;
    const delay = randomDays * Day;
    setTimeout(callback, delay * 1000);
}
