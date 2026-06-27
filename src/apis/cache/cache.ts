import * as path from "@std/path";

function getCacheDir(): string {
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

export async function init() {
    await Deno.mkdir(getCacheDir(), { recursive: true });
}

function getBoxFilepath(box: string): string {
    return path.join(getCacheDir(), box + '.json');
}

async function readBox(boxpath: string): Promise<Record<string, unknown>> {
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

export async function store<T>(box: string, key: string, value: T) {
    const boxpath = getBoxFilepath(box);

    const json = await readBox(boxpath);
    json[key] = value;

    await Deno.writeTextFile(boxpath, JSON.stringify(json, null, 2));
}

export async function load<T>(box: string, key: string): Promise<T | undefined> {
    const boxpath = getBoxFilepath(box);

    const json = await readBox(boxpath);
    return json[key] as T | undefined;
}

export async function del(box: string, key: string) {
    const boxpath = getBoxFilepath(box);

    const json = await readBox(boxpath);
    delete json[key];

    await Deno.writeTextFile(boxpath, JSON.stringify(json, null, 2));
}
