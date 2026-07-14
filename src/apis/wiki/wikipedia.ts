import * as gemini from '@/apis/gemini/model.ts';

interface WikiSummaryResponse {
    type: string;
    title: string;
    displaytitle: string;
    namespace: { id: number; text: string };
    wikibase_item: string;
    titles: { canonical: string; normalized: string; display: string };
    pageid: number;
    thumbnail?: { source: string; width: number; height: number };
    originalimage?: { source: string; width: number; height: number };
    lang: string;
    dir: string;
    revision: string;
    tid: string;
    timestamp: string;
    description?: string;
    description_source?: string;
    content_urls: { desktop: { page: string }; mobile: { page: string } };
    extract: string;
    extract_html: string;
}

async function getDisambiguationTitles(title: string, lang: string): Promise<string[]> {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=links&format=json`;
    const res = await fetch(url);
    const data = await res.json() as { parse?: { links: { ns: number; '*': string }[] } };

    if (!data.parse?.links) return [];

    return data.parse.links.filter((l) => l.ns === 0).map((l) => l['*']);
}

interface WikiPageResult {
    title: string;
    extract?: string;
    index: number;
}

function bfetch(url: string) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    return fetch(`https://proxy.corsfix.com/?${(url)}`, {
        headers: {
            // oh hell nah spierdalaj z tym limitem
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0",
            "Referrer": `http://localhost/${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join('')}`,
            "Origin": "http://localhost",
        }
    });
}

async function searchWikipedia(lang: string, query: string, limit = 10) {
    const url =
        `https://${lang}.wikipedia.org/w/api.php` +
        `?action=query` +
        `&generator=search` +
        `&gsrsearch=${encodeURIComponent(query)}` +
        `&gsrlimit=${limit}` +
        `&prop=extracts` +
        `&exintro=1` +
        `&explaintext=1` +
        `&format=json` +
        `&origin=*`;

    const res = await bfetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.query?.pages) return [];

    return Object.values(data.query.pages)
        .map((p: unknown) => {
            const page = p as WikiPageResult;
            return {
                title: page.title,
                extract: page.extract || "",
                index: page.index
            };
        })
        .sort((a, b) => a.index - b.index);
}

async function downloadFromWikipedia(
    languageVersions: string[],
    args: string[]
) {
    const query = args.join(" ");
    const lowerQuery = query.toLowerCase();

    for (const lang of languageVersions) {
        const results = await searchWikipedia(lang, query);

        for (const res of results) {
            const lowerTitle = res.title.toLowerCase();
            const firstParagraph = res.extract
                .split('\n')
                .find((p: string) => p.trim().length > 0)?.toLowerCase() || "";

            if (lowerTitle.includes(lowerQuery) && firstParagraph.includes(lowerQuery)) {
                const summaryUrl =
                    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/` +
                    encodeURIComponent(res.title);

                const fetched = await bfetch(summaryUrl);

                if (fetched.ok) {
                    return { fetched, lang, title: res.title };
                }
            }
        }
    }

    return null;
}

export interface WikiError {
    success: false;
    reason: 'ai-uninitialized' | 'ai-error' | 'ai-ignore';
}

export interface WikiResponse {
    success: true;
    isDisamiguition: false;
    usedAi: boolean;
    title: string;
    description: string;
    url: string;
    thumbnail?: WikiSummaryResponse['thumbnail']
}

export interface WikiDisamiguition {
    success: true;
    isDisamiguition: true;
    queries: string[];
    url: string;
}

export default async function getWikiArticle(rawQuery: string): Promise<WikiError | WikiResponse | WikiDisamiguition> {
    const query = rawQuery == 'hubix' ? 'Niepełnosprawność intelektualna w stopniu głębokim' : rawQuery;

    const fetchedRaw = await downloadFromWikipedia(['pl', 'simple', 'en'], [query]);
    const fetched = fetchedRaw?.fetched;

    if (!fetched || !fetched.ok) {
        if (!gemini.isInitialized() || !gemini.getModels('wiki-cmd').length) {
            return { success: false, reason: 'ai-uninitialized' };
        }
        let result: gemini.GenerateContentResult;
        try {
            result = await gemini.generateContent('wiki-cmd', {
                contents: [
                    { role: 'user', parts: [{ text: query }] },
                ],
            });
        } catch {
            return { success: false, reason: 'ai-error' };
        }
        const aiResponse = result.response.text();
        if (aiResponse.toLowerCase().trim().includes('--ignore')) {
            return { success: false, reason: 'ai-ignore' };
        }
        const aiHeader = aiResponse.split('\n')[0].trim();
        const aiHasTitle = aiHeader.startsWith('# ');
        const aiDescription = aiHasTitle ? aiResponse.slice(aiHeader.length).trim() : aiResponse;
        return {
            success: true, usedAi: true, isDisamiguition: false,
            title: aiHasTitle ? aiHeader.replace('# ', '') : 'Definicja od AI',
            description: aiDescription, url: `https://google.com/search?q=${encodeURIComponent(query)}`
        };
    }

    const json = await fetched.json() as WikiSummaryResponse;

    const extrdesc = (json.extract ?? '') + (json.description ?? '');

    if (extrdesc?.includes('strona ujednoznaczniająca') || extrdesc?.includes('may refer to')) {
        const titles = await getDisambiguationTitles(json.title, fetchedRaw.lang);
        return {
            success: true, isDisamiguition: true,
            url: json.content_urls.desktop.page,
            queries: titles
        };
    }

    return {
        success: true, usedAi: false,
        isDisamiguition: false,
        title: json.titles.normalized,
        description: json.extract,
        url: json.content_urls.desktop.page,
        thumbnail: json.thumbnail
    }
}
