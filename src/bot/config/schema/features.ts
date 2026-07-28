import * as dsc from 'discord.js';

import { Translation, ContentType } from './subtypes.ts';
import Economy from './economy.ts';

export default interface Features {
    compilation: {
        replaceCompilerMap: Record<string, string[]>;
    };
    automod: {
        antiFloodEnabled: boolean;
        antiSpamEnabled: boolean;
    };
    welcomer: {
        enabled: boolean;
        mentionNewPeopleInLobby: boolean;
        welcomeMsgs: `${string}<mention>${string}`[];
        goodbyeMsgs: `${string}<mention>${string}`[];
        freeRolesForEveryone: `${number}`[];
    };
    forFun: {
        media: {
            addReactions: string[];
            deleteMessageIfNotMedia: boolean;
            channel: dsc.Snowflake;
            shallCreateThread: boolean;
        }[];
        lastLetterChannel: dsc.Snowflake;
        countingChannel: dsc.Snowflake;
    };
    leveling: {
        xpPerMessage: number;
        levelDivider: number;
        excludedChannels: string[];
        milestoneRoles: Record<number, dsc.Snowflake>;
        canChangeXP: dsc.Snowflake[];
        shallPingWhenNewLevel: boolean;
        currentEvent: {
            enabled: boolean;
            channels: dsc.Snowflake[];
            multiplier: number;
        };
        voice: {
            xpPerMinute: number;
            estimatedRealMembers: {
                requiredLevel: number;
                requiredPeople: number;
            };
        };
    };
    economy: Economy;
    translations: Translation[];
    watchdog: {
        kickNewMembers: boolean;
        allowNewBots: boolean;

        shallAutoDegrade: boolean;
        notForgiveAdministration: boolean;
        approveDangerousPermissions: boolean;

        limitsConfiguration: {
            maxMutes: number;
            maxWarns: number;
            maxChannelCreations: number;
            maxChannelDeletions: number;
        };
    };
    prestige: {
        reactions: {
            positive: string[],
            negative: string[],
            pointsPerReaction: number
        },
        messageLength: {
            divider: number,
            points: number
        }
    };
    ai: {
        enabled: boolean;
        allowPolitics: boolean;
        allowPhilosophy: boolean;
        contextDefaultMessages: number;
        contextMaxMessages: number;

        searchEnabled:   boolean;
        redditEnabled:   boolean;
        githubEnabled:   boolean;
        memoriesEnabled: boolean;
        compilerEnabled: boolean;
        //codeExecEnabled: boolean;
    };
    contentDatabases: ContentType[];
    actions: {
        disabled: string[];
    };
}
