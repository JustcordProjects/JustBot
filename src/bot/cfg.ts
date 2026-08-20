import JSON5 from 'json5';

import { deepMerge } from '@/util/objects/objects.ts';

import Config     from '@/bot/config/schema.ts';
import defaultCfg from '@/bot/config/default.ts';

export let overrideCfg: Partial<Config> = {};

function doExistsSync(path: string): boolean {
    try {
        Deno.statSync(path);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error;
    }
}

function doReadConfigurationChanges() {
    if (!doExistsSync('bot/config.js')) return {};
    let file = Deno.readTextFileSync('bot/config.js');
    file = file.trim();
    while (file.startsWith('(')) file = file.slice(1);
    while (file.endsWith(')')) file = file.slice(0, -1);
    return JSON5.parse(file);
}

export function doSaveConfigurationChanges() {
    Deno.writeTextFileSync(
        'bot/config.js',
        `(${JSON5.stringify(overrideCfg, null, 4)})`
    );
}

function doMakeConfig(): Config {
    overrideCfg = doReadConfigurationChanges();
    const chosenCfg = defaultCfg;
    return deepMerge(chosenCfg, overrideCfg);
}

export const cfg = doMakeConfig();
export type { Config };
