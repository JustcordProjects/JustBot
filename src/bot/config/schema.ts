import * as dsc from 'discord.js';
import {
    BlockCommandsRules, Activity, Emoji, Permission, CommandOpts
} from './schema/subtypes.ts';
import Features from './schema/features.ts';

export * from './schema/subtypes.ts';
export * as economy from './schema/economy.ts';

export type { default as Economy  } from './schema/economy.ts';
export type { default as Features } from './schema/features.ts';

export default interface Config {
    hierarchy: {
        developers: Permission;

        administration: {
            headAdmin: dsc.Snowflake;
            admin: dsc.Snowflake;
            headMod: dsc.Snowflake;
            mod: dsc.Snowflake;
            helper: dsc.Snowflake;
        };

        automodBypassRoles: dsc.Snowflake[];
    };

    commands: {
        prefix: string;
        alternativePrefixes: string[];

        confirmUnsafeCommands: boolean;
        confirmDeprecatedCommands: boolean;


        blocking: {
            full: BlockCommandsRules;
            fullExceptImportant: BlockCommandsRules;
            spammy: BlockCommandsRules;
            economy: BlockCommandsRules;
        };

        configuration?: Record<string, CommandOpts>;
        defaultConfiguration: CommandOpts;
    };

    database: {
        backups: {
            enabled: boolean;
            interval: number;
            msg: string;
        };

        path: string;
    };

    channels: {
        settings: {
            emojiPlacement: 'after-name' | 'before-name';
            characters: {
                beforeEmoji: string;
                afterEmoji: string;
            };
            /** can be null if none (default: -) */
            spaceReplacement: string | null;
        };

        stats: {
            people: dsc.Snowflake;
            bans: dsc.Snowflake;
            goal: dsc.Snowflake;
        };
        mod: {
            modGeneral: dsc.Snowflake;
            logs: dsc.Snowflake;
            punishments: dsc.Snowflake;
            hallOfShame: dsc.Snowflake;
            automod: dsc.Snowflake;
        };
        important: {
            lobby: dsc.Snowflake;
            rules: dsc.Snowflake;
            announcements: dsc.Snowflake;
            boosts: dsc.Snowflake;
            levels: dsc.Snowflake;
            honeypot: dsc.Snowflake;
        };
        general: {
            general: dsc.Snowflake;
            commands: dsc.Snowflake;
            media: dsc.Snowflake;
            programming: dsc.Snowflake;
        };
        other: {
            music: dsc.Snowflake;
            economy: dsc.Snowflake;
            polls: dsc.Snowflake;
        };
        forfun: {
            counting: dsc.Snowflake;
            lastLetter: dsc.Snowflake;
        };
        justbot: {
            stdout: dsc.Snowflake;
            stderr: dsc.Snowflake;
            stdwarn: dsc.Snowflake;
            email: dsc.Snowflake;
            dbBackups: dsc.Snowflake;
            ghBridge: dsc.Snowflake;
        };
    };

    features: Features;

    emojis: {
        darkRedBlock: Emoji;
        lightRedBlock: Emoji;
        darkGreenBlock: Emoji;
        lightGreenBlock: Emoji;

        circleProgressBar: {
            [key: `${number}/4`]: Emoji;
        };

        idkEmoji: Emoji;
        wowEmoji: Emoji;
        sadEmoji: Emoji;
        heartAttackEmoji: Emoji;
    };

    bot: {
        status: 'dnd' | 'online' | 'invisible' | 'brb';
        activities: Activity[];
        logsDirPath: string | null;
    }
}

export type Hierarchy = Config['hierarchy'];
