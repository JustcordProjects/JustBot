import { cfg } from '@/bot/cfg.ts';
import { Command } from './cmd.ts';

export namespace CommandPermissions {
    export function everyone(): Command['permissions'] {
        return {
            allowedRoles: null,
            allowedUsers: null,
        };
    }

    export function none(): Command['permissions'] {
        return {
            allowedRoles: [],
            allowedUsers: [],
        };
    }

    export function devOnly(): Command['permissions'] {
        return {
            allowedRoles: [...cfg.hierarchy.developers.allowedRoles],
            allowedUsers: [...cfg.hierarchy.developers.allowedUsers],
        };
    }

    export function headAdminPlus(): Command['permissions'] {
        return {
            allowedRoles: [cfg.hierarchy.administration.headAdmin],
            allowedUsers: [],
        }
    }

    export function adminPlus(): Command['permissions'] {
        return {
            allowedRoles: [cfg.hierarchy.administration.headAdmin, cfg.hierarchy.administration.admin],
            allowedUsers: []
        }
    }

    export function headModPlus(): Command['permissions'] {
        return {
            allowedRoles: [cfg.hierarchy.administration.headAdmin, cfg.hierarchy.administration.admin, cfg.hierarchy.administration.headMod],
            allowedUsers: []
        }
    }

    export function modPlus(): Command['permissions'] {
        return {
            allowedRoles: [cfg.hierarchy.administration.headAdmin, cfg.hierarchy.administration.admin, cfg.hierarchy.administration.headMod, cfg.hierarchy.administration.mod],
            allowedUsers: []
        }
    }

    export function helperPlus(): Command['permissions'] {
        return {
            allowedRoles: [cfg.hierarchy.administration.headAdmin, cfg.hierarchy.administration.admin, cfg.hierarchy.administration.headMod, cfg.hierarchy.administration.mod, cfg.hierarchy.administration.helper],
            allowedUsers: []
        }
    }

    export function fromCommandConfig<T extends Command['permissions']>(cfg2: T): Command['permissions'] {
        return {
            allowedRoles: cfg2.allowedRoles,
            allowedUsers: cfg2.allowedUsers,
        };
    }
}
