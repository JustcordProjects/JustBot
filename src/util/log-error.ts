import * as output from '@/bot/output.ts';

export default function logError(target: 'stdwarn' | 'stderr', error: unknown, from?: string) {
    const details = error instanceof Error ? (error.stack ?? error.message) : String(error);

    const fullDetails = `From ${from ? `module "${from}"` : 'general error handler'}:\n\n${details}`;

    if (target == 'stdwarn') {
        output.warn(fullDetails);
    } else {
        output.err(fullDetails);
    }

    return fullDetails;
}
