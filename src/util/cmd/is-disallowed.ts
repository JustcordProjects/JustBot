import { Command } from '@/bot/command.ts';
import { getCommandConfig } from './get-command-config.ts';
import * as dsc from 'discord.js';

export function isCommandDisallowed(cmd: Command, user: dsc.GuildMember | dsc.User): boolean {
    const cmdCfg = getCommandConfig(cmd);

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
