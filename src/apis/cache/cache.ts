import * as path from "@std/path";

function doGetCacheDir(): string {
    const cacheHome = Deno.env.get('XDG_CACHE_HOME');
    if (cacheHome) {
        return path.join(cacheHome, 'justbot');
    }

    const home = Deno.env.get('HOME');
    if (home) {
        return path.join(home, '.cache', 'justbot');
    }

    return path.join('/', 'tmp', 'jb-cache');
}

export async function doInit() {
    await Deno.mkdir(doGetCacheDir(), { recursive: true });
}

function doGetBoxFilepath(box: string): string {
    return path.join(doGetCacheDir(), box + '.json');
}

async function doReadBox(boxpath: string): Promise<Record<string, unknown>> {
    try {
        const content = await Deno.readTextFile(boxpath);
        return JSON.parse(content);
    } catch (err: unknown) {
        if (err instanceof Deno.errors.NotFound) {
            return {};
        }
        throw err;
    }
}

export async function doStore<T>(box: string, key: string, value: T) {
    const boxpath = doGetBoxFilepath(box);

    const json = await doReadBox(boxpath);
    json[key] = value;

    await Deno.writeTextFile(boxpath, JSON.stringify(json, null, 2));
}

export async function doLoad<T>(box: string, key: string): Promise<T | undefined> {
    const boxpath = doGetBoxFilepath(box);

    const json = await doReadBox(boxpath);
    return json[key] as T | undefined;
}

export async function doDel(box: string, key: string) {
    const boxpath = doGetBoxFilepath(box);

    const json = await doReadBox(boxpath);
    delete json[key];

    await Deno.writeTextFile(boxpath, JSON.stringify(json, null, 2));
}
