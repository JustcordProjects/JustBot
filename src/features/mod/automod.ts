import { Action, AnyAction, MessageEventCtx, PredefinedActionCallbacks } from '../actions.ts';

import { doMkAutoreplyAction } from '../autoreply.ts';

import { cfg } from '@/bot/cfg.ts';
import { client } from '@/client.ts';

export default class AutoModRules {
    static readonly msgAuthorIsNotImmuneToAutomod = (msg: MessageEventCtx) => {
        for (const role of [...cfg.hierarchy.automodBypassRoles, cfg.hierarchy.administration.headAdmin]) {
            if (msg.member!.roles.cache.has(role)) return false;
        }

        return msg.author.id !== client.user!.id;
    };

    static readonly EveryoneAutoreply: Action<MessageEventCtx> = doMkAutoreplyAction({
        activationOptions: [
            { type: 'contains', keyword: '@everyone' },
            { type: 'contains', keyword: 'małpa everyone' },
            { type: 'contains', keyword: '@here' },
            { type: 'contains', keyword: 'małpa here' },
        ],
        reply: (msg) => `Upomnienie dla <@${msg.author.id}> za próbe pingu everyone!!11!1@!!`,
        additionalConstraints: [AutoModRules.msgAuthorIsNotImmuneToAutomod],
        additionalCallbacks: [PredefinedActionCallbacks.deleteMsgAutomod],
    });

    static readonly BlockInvites: Action<MessageEventCtx> = doMkAutoreplyAction({
        activationOptions: [
            {
                type: 'matches-regex',
                keyword: '(?:https?:\\/\\/)?(?:www\\.)?(?:discord\\.gg|discord\\.com\\/invite)\\/[A-Za-z0-9]+',
            },
            {
                type: 'matches-regex',
                keyword: '(?:discord\\.gg|discord\\.com\\/invite)\\/[A-Za-z0-9]{4,}',
            },
        ],
        reply: (msg) => `<@${msg.author.id}> ładnie proszę, wypier*alaj ze swoją reklamą na serwery reklamowe ;)'`,
        additionalCallbacks: [PredefinedActionCallbacks.deleteMsgAutomod],
        additionalConstraints: [AutoModRules.msgAuthorIsNotImmuneToAutomod, (ctx) => !(ctx.channel.isThread() && ctx.channel.parentId == '1510999452192866485')],
    });

    static readonly BlockNWords: Action<MessageEventCtx> = doMkAutoreplyAction({
        activationOptions: [
            { type: 'contains', keyword: 'nigger' },
            { type: 'contains', keyword: 'nigga' },
            { type: 'contains', keyword: 'czarnuch' },
        ],
        reply: 'osoba na którą wiadomość odpowiadam jest gejem 🥀',
        additionalConstraints: [AutoModRules.msgAuthorIsNotImmuneToAutomod],
    });

    static readonly GitHubAutoreply: Action<MessageEventCtx> = doMkAutoreplyAction({
        activationOptions: [
            { type: 'is-equal-to', keyword: 'git' },
        ],
        reply: 'hub',
    });

    static all(): AnyAction[] {
        const rules = [
            AutoModRules.EveryoneAutoreply,
            AutoModRules.GitHubAutoreply,
            AutoModRules.BlockInvites,
            AutoModRules.BlockNWords
        ];
        return rules;
    }
}
