import { client } from '@/features/serchat/client.ts';
import { Message } from 'serchat.ts';
import { translate } from '@/apis/translations/translate.ts';
import { cfg } from '@/bot/cfg.ts';

export default async function awaitUserConfirmation(text: string, from: string, confirmationMessage: string) {
    await client.sendMessage(cfg.channels.serchat.serverId, cfg.channels.serchat.general, confirmationMessage);

    return await new Promise((resolve, _reject) => {
        const listener = (msg: Message) => {
            if (![`\`${text}\``, text].includes(msg.text) || msg.senderId !== from) return;
            
            msg.reply(translate("Potwierdzono pomyślnie!"));
            client.off('messageCreate', listener);
            resolve(true);
        }
        client.on('messageCreate', listener);
    })
}
