import actionsManager from '@/features/actions.ts';

import * as email from './mail.ts';

export interface ReceivedNewEmail {
    email: email.ReceivedEmail;
}
export const ReceivedNewEmailEvent = actionsManager.mkEvent('ReceivedNewEmailEvent');

export async function doInitEmailActionsIntegration() {
    email.doListenForNewEmails((email) => {
        actionsManager.emit<ReceivedNewEmail>(ReceivedNewEmailEvent, { email });
    });
}

export default actionsManager;
