import nm from 'nodemailer';
import im from 'imapflow';
import mp from 'mailparser';

let transporter: nm.Transporter | null = null;
let imapClient: im.ImapFlow | null = null;

export async function doInit() {
    transporter = nm.createTransport({
        service: 'gmail',
        auth: {
            user: Deno.env.get('JB_EMAIL_USER'),
            pass: Deno.env.get('JB_EMAIL_PASS'),
        },
    });

    imapClient = new im.ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: Deno.env.get('JB_EMAIL_USER')!,
            pass: Deno.env.get('JB_EMAIL_PASS')!,
        },
        logger: false,
    });
}

export interface SendEmail {
    receiver: string;
    subject: string;
    content: string;
}

export type ReceivedEmail = mp.ParsedMail;

export async function doSendMessage({ receiver, subject, content }: SendEmail) {
    if (transporter == null) {
        throw new Error('Email not initialized');
    }

    return transporter.sendMail({
        from: Deno.env.get('JB_EMAIL_USER'),
        to: receiver,
        subject: subject,
        html: content,
    });
}

export type NewMailCallback = (mail: ReceivedEmail) => void;

export async function doListenForNewEmails(onNewMail: NewMailCallback) {
    if (imapClient == null) {
        throw new Error('IMAP not initialized');
    }

    await imapClient.connect();

    const lock = await imapClient.getMailboxLock('INBOX');
    try {
        imapClient.on('exists', async (data) => {
            const message = await imapClient!.fetchOne(data.count.toString(), {
                source: true,
            });

            if (message && message.source) {
                const parsed = await mp.simpleParser(message.source);
                onNewMail(parsed);
            }
        });
    } catch (err) {
        lock.release();
        throw err;
    }

    lock.release();
}

export async function doStopListening() {
    if (imapClient) {
        await imapClient.logout();
    }
}
