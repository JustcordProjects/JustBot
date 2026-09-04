import { Action, MessageEventCtx, MagicSkipAllActions, PredefinedActionEventTypes } from '@/features/actions.ts'; 
import { cfg } from '@/bot/cfg.ts';

function hasGifLink(content: string) {
    const websites = cfg.features.automod.gifban.websites;

    return websites.some((website) => {
        const escaped = website.replace(/\./g, '\\.');
        const regex = new RegExp(
            `https?:\\/\\/(?:www\\.)?${escaped}`,
            'i'
        );

        return regex.test(content);
    });
}

export const gifBanAction: Action<MessageEventCtx> = {
    name: 'mod/gifban',
    activatesOn: PredefinedActionEventTypes.OnMessageCreateOrEdit,
    worksOutsideGuild: false,

    constraints: [
        () => cfg.features.automod.gifban.enabled,
        (ctx) => ctx.author.id != ctx.client.user.id,
        (ctx) => 
            cfg.features.automod.gifban.global || 
            (ctx.member?.roles.cache.has(cfg.features.automod.gifban.role) ?? false),
        (ctx) => 
            hasGifLink(ctx.content) ||
            ctx.attachments.some(
                (a) => 
                    a.contentType?.toLowerCase().trim() == 'image/gif' ||
                    a.name.endsWith('.gif')
            )
    ],
    callbacks: [
        async (msg) => {
            const reply = await msg.reply('masz bana na gify ;)');
            setTimeout(() => reply.delete(), 2000);

            await msg.delete();
            return MagicSkipAllActions;
        }
    ]
};
