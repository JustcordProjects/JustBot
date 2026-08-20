import logError from '@/util/log-error.ts';

const BaseUrl = 'https://api.github.com';

export class GithubError extends Error {}

export type Repo = {
    owner: string;
    repo: string;
    branch?: string; // default: main
};

let token: string | null;

export async function doInit(tok?: string) {
    token = tok ?? Deno.env.get('JB_GITHUB_TOKEN') ?? null;
}

async function doRequest(url: string, method?: string) {
    const res = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github+json',
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
        },
        ...(method ? { method } : {}),
    });

    if (!res.ok && res.status !== 404) {
        const text = await res.text();
        throw new GithubError(`GitHub API error: ${res.status} ${text}`);
    }

    const resp = await res.text();
    let resps = {};
    if (resp.trim() == '') resps = {};
    else resps = JSON.parse(resp);

    // deno-lint-ignore no-explicit-any
    return { ...resps, httpResponseCode: res.status } as Record<PropertyKey, any> & { httpResponseCode: number };
}

function doShouldIgnore(path: string): boolean {
    const ignored = [
        'node_modules/',
        '.git/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
    ];

    return ignored.some((i) => path.includes(i));
}

function doGetBranch(ref: Repo) {
    return ref.branch ?? 'main';
}

export async function doGetRepoTree(ref: Repo): Promise<string[]> {
    const branch = doGetBranch(ref);

    const data = await doRequest(
        `${BaseUrl}/repos/${ref.owner}/${ref.repo}/git/trees/${branch}?recursive=1`,
    );

    return data.tree
        .filter((item: { type: string }) => item.type == 'blob')
        .map((item: { path: string }) => item.path)
        .filter((path: string) => !doShouldIgnore(path));
}

export async function doGetFileContent(ref: Repo, path: string): Promise<string> {
    const branch = doGetBranch(ref);
    const url = `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${branch}/${path}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new GithubError(`Failed to fetch file: ${path}`);
    }

    return res.text();
}

export async function doSearch(ref: Repo, query: string) {
    const q = encodeURIComponent(`${query} repo:${ref.owner}/${ref.repo}`);
    const data = await doRequest(
        `${BaseUrl}/search/code?q=${q}`,
    );

    return data.items.map((item: { path: string; html_url: string }) => ({
        path: item.path,
        url: item.html_url,
    }));
}

export async function doGetReadme(ref: Repo): Promise<string> {
    const possiblePaths = ['README.md', 'readme.md', 'README'];

    for (const path of possiblePaths) {
        try {
            return await doGetFileContent(ref, path);
        } catch (_) {}
    }

    throw new GithubError('README not found');
}

async function doStarred(org: string, repo: string) {
    return (await doRequest(`${BaseUrl}/user/starred/${org}/${repo}`)).httpResponseCode == 204;
}

export async function doStarRepository(org: string, repo: string, unstar = false): Promise<boolean> {
    try {
        if (await doStarred(org, repo) == true) return false;
        await doRequest(`${BaseUrl}/user/starred/${org}/${repo}`, unstar ? 'DELETE' : 'PUT');
    } catch (e) {
        logError('stdwarn', e, 'GitHub repo starring service');
        return false;
    }
    return true;
}
