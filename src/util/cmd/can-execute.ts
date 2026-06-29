import { Command } from '@/bot/command.ts';
import { getCommandConfig } from './get-command-config.ts';
import { isCommandDisallowed } from './is-disallowed.ts';

import * as dsc from 'discord.js';

export default function canExecuteCmd(cmd: Command, user: dsc.GuildMember | dsc.User) {
    if (isCommandDisallowed(cmd, user)) {
        return false;
    }

    const cmdCfg = getCommandConfig(cmd);

    const allowedUsers = cmdCfg.allowedUsers !== undefined ? cmdCfg.allowedUsers : cmd.permissions.allowedUsers;
    const allowedRoles = cmdCfg.allowedRoles !== undefined ? cmdCfg.allowedRoles : cmd.permissions.allowedRoles;

    if (allowedUsers == null || allowedRoles == null) return true;

    if (allowedRoles) {
        for (const allowedRoleID of allowedRoles) {
            if ('roles' in user) { if (user.roles.cache.has(allowedRoleID)) return true; }
        }
    }

    if (allowedUsers) {
        for (const allowedUserID of allowedUsers) {
            if (user.id == allowedUserID) return true;
        }
    }

    return false;
}
