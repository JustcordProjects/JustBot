import { Category, Command } from '@/bot/command.ts';

export type FindResult = { command: Command; category: Category };

export default function findCommand(cmdName: string, cmdsMap: Map<Category, Command[]>): FindResult | null {
    for (const [cat, cmds] of cmdsMap.entries()) {
        for (const cmd of cmds) {
            if (cmd.name == cmdName || cmd.aliases.includes(cmdName)) {
                return { command: cmd, category: cat };
            }
        }
    }
    return null;
}
