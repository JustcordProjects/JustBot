import { Command } from '@/bot/command.ts';
import { doGetCommandConfig } from './get-command-config.ts';
import * as dsc from 'discord.js';

export function doIsCommandDisallowed(cmd: Command, user: dsc.GuildMember | dsc.User): boolean {
    const cmdCfg = doGetCommandConfig(cmd);

    if (cmdCfg.disallowedUsers?.includes(user.id)) {
        return true;
    }

    if (cmdCfg.disallowedRoles && 'roles' in user) {
        for (const roleID of cmdCfg.disallowedRoles) {
            if (user.roles.cache.has(roleID)) return true;
        }
    }

    return false;
}
