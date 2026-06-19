import { Category } from '@/bot/categories.ts';
export { Category };

import { Command } from './command/cmd.ts';
import { CommandAPI } from './command/api.ts';
import { CommandArgType, CommandArgument, CommandValuableArgument } from './command/arguments.ts';
import { CommandViolatedRule } from './command/misc.ts';

export type { Command, CommandAPI, CommandArgType, CommandArgument, CommandValuableArgument, CommandViolatedRule };
