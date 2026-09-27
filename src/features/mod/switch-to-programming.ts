import { Action, MagicSkipAllActions, MessageEventCtx, PredefinedActionEventTypes } from '@/features/actions.ts';
import { cfg } from '@/bot/cfg.ts';
import m from '@/util/mentions.ts';
import sleep from '@/util/sleep.ts';

const switchToProgrammingWords = [ 
    // programming languages
    'C++', 'Rust', 'Zap', 'Elash', 'JS', 'TS', 'Javascript', 'Typescript', 
    // tooling 
    'deno', 'gcc', 'llvm',
    // random 
    'ffi', 'abi', 'mutable', 'immutable', 
    // keywords
    'function', 'extern', 'const', 'readonly',
    'var', 'let', 'while', 'for',
    // data types
    'void', 'int', 
    'i8', 'i16', 'i32', 'i64',
    'u8', 'u16', 'u32', 'u64',
    'bool', 'boolean'
].map((w) => w.toLowerCase());

export const switchToProgrammingAction: Action<MessageEventCtx> = {
    name: 'mod/switch-to-programming',
    activatesOn: PredefinedActionEventTypes.OnMessageCreateOrEdit,
    
    constraints: [
        () => Math.random() < 0.45,
        (ctx) => ctx.channelId == cfg.channels.general.general,
        (ctx) => !!ctx.content && ctx.content.toLowerCase().split(/\s+/).some((word) => switchToProgrammingWords.includes(word))
    ],

    callbacks: [
        async (ctx) => {
            try {
                await ctx.react('🖕');
                const reply = await ctx.reply(`ty! idź na ${m.chan(cfg.channels.general.programming)} i ożyw ten kanał a nie generala misusujesz!!! w tej chwili!!`);
                await sleep(3000);
                await reply.delete();
                await ctx.delete();
            } catch {}
            return MagicSkipAllActions;
        }
    ]
};
