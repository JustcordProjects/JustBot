import * as dsc from 'discord.js';

import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { BlockCommandsRules } from '@/bot/config/schema/subtypes.ts';
import { cfg } from '@/bot/cfg.ts';

function doIsBlockedByRules(id: dsc.Snowflake, rules: BlockCommandsRules): boolean {
    if (rules.default == 'allow') {
        return rules.deny?.includes(id) ?? false;
    } else if (rules.default == 'block') {
        return !(rules.allow?.includes(id) ?? false);
    }
    // this should not happen
    return false;
}

export default function doIsCommandBlockedOnChannel(command: Command, channelID: dsc.Snowflake, dm: boolean) {
    if (dm) return false;

    let result: boolean = false;

    if (command.flags & CommandFlags.Important) {
        result ||= doIsBlockedByRules(channelID, cfg.commands.blocking.fullExceptImportant);
    } else {
        result ||= doIsBlockedByRules(channelID, cfg.commands.blocking.full);
    }

    if (command.flags & CommandFlags.Spammy) {
        result ||= doIsBlockedByRules(channelID, cfg.commands.blocking.spammy);
    }

    if (command.flags & CommandFlags.Economy) {
        result ||= doIsBlockedByRules(channelID, cfg.commands.blocking.economy);
    }

    return result;
}
