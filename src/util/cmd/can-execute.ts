import { Command } from '@/bot/command.ts';
import { doGetCommandConfig } from './get-command-config.ts';
import { doIsCommandDisallowed } from './is-disallowed.ts';

import * as dsc from 'discord.js';

export default function doCanExecuteCmd(cmd: Command, user: dsc.GuildMember | dsc.User) {
    if (doIsCommandDisallowed(cmd, user)) {
        return false;
    }

    const cmdCfg = doGetCommandConfig(cmd);

    const allowedUsers = cmdCfg.allowedUsers ? cmdCfg.allowedUsers : cmd.permissions.allowedUsers;
    const allowedRoles = cmdCfg.allowedRoles ? cmdCfg.allowedRoles : cmd.permissions.allowedRoles;

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
