import * as compile from './driver.ts';
import { GodBoltCompilerDriver } from '@/apis/compile/godbolt.ts';
import { WandboxCompilerDriver } from './wandbox.ts';
import { ZapCompilerDriver } from './zapbox.ts';

import { cfg } from '@/bot/cfg.ts';

const doGetReplaceMap = () => cfg.features.compilation.replaceCompilerMap;

function doFindWandboxCompilerName(lang: string): string {
    const replaceMap = Object.entries(doGetReplaceMap());
    const langNormalized = lang.trim().toLowerCase();
    for (const [compiler, aliases] of replaceMap) {
        const compilerNormalized = compiler.toLowerCase();
        if (aliases.includes(langNormalized) || compilerNormalized == langNormalized) {
            return compiler;
        }
    }
    return lang;
}

async function doIsWandbox(lang: string): Promise<boolean> {
    const available = await WandboxCompilerDriver.fetchCompilerNames();
    const isInReplaceMap = Object.values(doGetReplaceMap()).some(s => s.includes(lang));
    return available.includes(lang) || isInReplaceMap;
}

export async function doGetCompilerForLang(lang: string): Promise<compile.Driver> {
    if (['zap', 'zp', 'zapc'].includes(lang)) {
        return new ZapCompilerDriver();
    }
    if (await doIsWandbox(lang)) {
        return new WandboxCompilerDriver({ compiler: doFindWandboxCompilerName(lang) });
    }
    return new GodBoltCompilerDriver(lang);
}
