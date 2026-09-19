import * as dsc from 'discord.js';
import * as config from '@/bot/config/schema.ts';

import { CommandAPI } from '@/bot/command.ts';
import User from '@/apis/db/user.ts';

export type UserIdResolvable = dsc.Snowflake | dsc.User | dsc.GuildMember | CommandAPI['invoker'] | User;
export type RoleIdResolvable = dsc.Snowflake | dsc.Role | config.economy.Role;
export type ChanIdResolvable = dsc.Snowflake | dsc.BaseChannel;

function mentionUser(user: UserIdResolvable): dsc.UserMention {
    const id: string =
        user instanceof dsc.User || user instanceof User
        ? user.id
        : user instanceof dsc.GuildMember
            ? user.user.id
            : typeof user == 'object' && 'id' in user
                ? user.id
                : user;

    return `<@${id}>`;
}

function mentionRole(role: RoleIdResolvable): dsc.RoleMention {
    const id: string =
        role instanceof dsc.Role
        ? role.id
        : typeof role == 'object' && 'discordRoleId' in role
            ? role.discordRoleId
            : role;

    return `<@&${id}>`;
}

function mentionChannel(chan: ChanIdResolvable): dsc.ChannelMention {
    const id: string =
        chan instanceof dsc.BaseChannel
            ? chan.id
            : chan;

    return `<#${id}>`;
}

const m = {
    user: mentionUser,
    role: mentionRole,
    chan: mentionChannel,
} as const;

export default m;

