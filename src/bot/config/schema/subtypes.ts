import * as dsc from 'discord.js';

export type BlockCommandsRules = {
    default: 'block';
    allow: dsc.Snowflake[];
} | {
    default: 'allow';
    deny: dsc.Snowflake[];
};

export interface Emoji {
    name: string;
    id: dsc.Snowflake;
}

export interface Translation {
    input: string[] | string;
    output: string;
}

export interface Regex {
    regex: string;
    flags: `i` | undefined;
}

export interface CmdArgRulesForNums {
    allowInfinity: boolean;
    onlyIntegers: boolean;
}

export interface ContentType {
    id: string;
    channel: dsc.Snowflake;
    domains: string[];
}

export interface Activity {
    type: 'playing' | 'listening' | 'watching';
    name: string;
    description: string;
}

export interface Permission {
    allowedUsers: dsc.Snowflake[];
    allowedRoles: dsc.Snowflake[];
}

export interface CommandOpts {
    enabled?: boolean;
    aliases?: string[];

    allowedUsers?: dsc.Snowflake[] | null;
    allowedRoles?: dsc.Snowflake[] | null;
    disallowedUsers?: dsc.Snowflake[];
    disallowedRoles?: dsc.Snowflake[];
    cooldownBypassUsers?: dsc.Snowflake[];
    cooldownBypassRoles?: dsc.Snowflake[];
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
}
