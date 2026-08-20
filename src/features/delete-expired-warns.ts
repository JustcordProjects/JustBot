import { db } from '@/apis/db/bot-db.ts';
import { output } from '@/bot/logging.ts';

const EXPIRED_WARNS_CHECK_INTERVAL = 10 * 60 * 1000; // 10m in ms
const SHORT_TERM_THRESHOLD = 10 * 60; // 10m in seconds

interface WarnRow {
    rowid: number;
    expires_at: number;
}

export function doInitExpiredWarnsDeleter() {
    try {
        doRestoreTimers();

        const interval = setInterval(
            doCheckLongTermWarns,
            EXPIRED_WARNS_CHECK_INTERVAL,
        );

        return interval;
    } catch (error) {
        output.err(error);
    }
}

function doCheckLongTermWarns() {
    const now = Math.floor(Date.now() / 1000);

    db.runSql(
        'DELETE FROM warns WHERE expires_at < ?',
        [now],
    );
}

export function doScheduleWarnDeletion(warnId: number, expiresAt: number) {
    const now = Math.floor(Date.now() / 1000);
    const delay = (expiresAt - now) * 1000;

    if (delay <= SHORT_TERM_THRESHOLD * 1000) {
        setTimeout(() => {
            db.runSql(
                'DELETE FROM warns WHERE rowid = ?',
                [warnId],
            );
        }, delay);
    }
}

function doRestoreTimers() {
    const now = Math.floor(Date.now() / 1000);
    const threshold = now + SHORT_TERM_THRESHOLD;

    db.selectMany<WarnRow>(
        'SELECT rowid, expires_at FROM warns WHERE expires_at BETWEEN ? AND ?',
        [now, threshold],
    );
}
