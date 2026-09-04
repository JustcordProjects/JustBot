import { Command } from '@/bot/command.ts';
import { CommandFlags } from '@/bot/command/misc.ts';
import { CommandPermissions } from '@/bot/command/permissions.ts';
import { cfg } from '@/bot/cfg.ts';

export default {
    name: 'gifban',
    description: {
        main: 'Czy ktoś wk*rwia Cię gifami? Chcesz dla niego bana na GIFy? Proszę bardzo!',
        short: 'Daj komuś bana na GIFy'
    },
    aliases: [],

    flags: CommandFlags.Important,
    permissions: CommandPermissions.adminPlus(),
    
    expectedArgs: [
        {
            name: 'action', type: { base: 'enum', options: [ 'rem', 'add', 'global-rem', 'global-add' ] },
            description: "Usunąć or dodać?", optional: false
        },
        {
            name: 'user', type: { base: 'user-mention', includeRefMessageAuthor: true },
            optional: true, description: "Komu brother?"
        }
    ],

    async execute(api) {
        const action = api.getEnumArg('action', ['rem', 'add', 'global-rem', 'global-add']).value;
        const user = api.getTypedArg('user', 'user-mention').value;
        const role = cfg.features.automod.gifban.role;

        if (!user && !action.startsWith('global')) {
            return api.log.replyError(api, "Masz problem", "Wszystko co nie jest globalne, wymaga użytkownika.");
        }

        const forTime: string = 
            action.startsWith('global')
                ? `do ponownego uruchomienia bota` 
                : `do momentu usunięcia roli <@&${role}> przez adminów`;

        const userName: string = 
            action.startsWith('global')
                ? `każdy użytkownik na serwerze`
                : `użytkownik <@${user.id}>`;

        switch (action) {
        case 'rem':
            await user.roles.add(role); break;
        case 'add':
            await user.roles.remove(role); break;
        case 'global-rem':
            cfg.features.automod.gifban.global = false;
            break;
        case 'global-add':
            cfg.features.automod.gifban.global = true;
            break;
        }
        
        return api.log.replySuccess(
            api, "Sukces guys!",
            `Od teraz ${userName} będzie torturowany banem na GIFy ${forTime}! To świetnie, wiem.`
        )
    },
} satisfies Command;
