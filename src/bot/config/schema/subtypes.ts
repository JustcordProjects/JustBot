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

export interface ConfigTranslation {
    input: string[] | string;
    output: string;
}

export interface RegexExpressionDefinition {
    regex: string;
    flags: `i` | undefined;
}

export interface ConfigCommandArgumentRulesForNumbers {
    allowInfinity: boolean;
    onlyIntegers: boolean;
}

export interface ContentConfig {
    id: string;
    channel: dsc.Snowflake;
    domains: string[];
}

export interface ConfigActivity {
    type: 'playing' | 'listening' | 'watching';
    name: string;
    description: string;
}

////////////// permissions ///////////////
export interface PermissionDefinitionConfig {
    allowedUsers: dsc.Snowflake[];
    allowedRoles: dsc.Snowflake[];
}
