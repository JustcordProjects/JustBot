import { CommandArgType } from '@/bot/command.ts';

export function doFlatTypesToUnion(type: CommandArgType): CommandArgType[] {
    if (type.base == 'union') {
        const result: CommandArgType[] = [];
        for (const variant of type.variants) {
            result.push(...doFlatTypesToUnion(variant));
        }
        return result;
    }

    return [type];
}
