import { doWikitext2markdown } from './utils.ts';

export interface Image {
    title: string;
    url: string;
    width: number;
    height: number;
}
export interface Page {
    pageid: number;
    link: string;
    title: string;
    content: string;
    images: Image[];
}

interface QueryRevision {
    slots: {
        main: {
            contentmodel: string;
            contentformat: string;
            '*': string;
        }
    }
}
interface QueryPageImage {
    title: string;
}
interface QueryImage {
    url: string;
    width: number;
    height: number;
}

interface QueryResponse {
    query?: {
        pages: {
            [key: string]: {
                pageid?: number;
                missing?: '';
                ns: number;
                title: string;
                revisions?: QueryRevision[];
                images?: QueryPageImage[];
                imageinfo?: QueryImage[];
            }
        }
    },
    error?: {
        code: string;
        info: string;
    }
}

export class InternalWikiError extends Error {};
export class PageNotFoundError extends Error {
    constructor(pageTitle: string) {
        super(`page "${pageTitle}" not found`);
    }
}

export const BASE_URL   = 'https://titanfall.wiki.gg/api.php';
export const HTML_BASE  = 'https://titanfall.wiki.gg/wiki/';
export const USER_AGENT = 'JustBot/1.0';

async function doRequest<T>(params: Record<string, string>): Promise<T> {
    const queryParams = new URLSearchParams({
        ...params,
        format: 'json',
        origin: '*',
    });

    const url = `${BASE_URL}?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
        throw new InternalWikiError(response.statusText);
    }
    return response.json() as Promise<T>;
}

export async function doGetPageRaw(query: string): Promise<Page> {
    const data = await doRequest<QueryResponse>({
        action: 'query',
        prop: 'revisions|images',
        titles: query,
        rvslots: '*',
        rvprop: 'content',
        imlimit: 'max',
    });

    if (data.error) {
        throw new InternalWikiError(`[${data.error.code}]: ${data.error.info}`);
    }

    const pages = data.query?.pages;
    if (!pages) {
        throw new PageNotFoundError(query);
    }

    const targetPage = Object.values(pages).find(
        p => p.ns === 0 || p.title.toLowerCase() === query.toLowerCase(),
    );
    if (!targetPage) {
        throw new PageNotFoundError(query);
    }

    const pageId = Object.keys(pages)[0];

    const isMissing =
        pageId == '-1' ||
        // from what i understand empty string is falsy value
        // so maybe it's safer to use !== undefined
        pages[pageId].missing !== undefined;
    if (isMissing) {
        throw new PageNotFoundError(query);
    }

    const wikitext = pages[pageId].revisions?.[0]?.slots?.main?.['*'];
    if (wikitext == undefined) {
        throw new InternalWikiError('failed to extract content');
    }

    const redirectRegex = /^#redirect\s*\[\[(.+?)\]\]/i;
    const match = wikitext.match(redirectRegex);
    if (match != null) {
        const redirectToTitle = match[1].trim();
        return doGetPageRaw(redirectToTitle);
    }

    const imageTitles = pages[pageId].images?.map(i => i.title) ?? [];

    let images: Image[] = [];
    if (imageTitles.length > 0) {
        const imageData = await doRequest<QueryResponse>({
            action: 'query',
            prop: 'imageinfo',
            titles: imageTitles.join('|'),
            iiprop: 'url|size',
        });

        if (imageData.error) {
            throw new InternalWikiError(`[${imageData.error.code}]: ${imageData.error.info}`);
        }

        const imagePages = imageData.query?.pages ?? {};

        images = Object.values(imagePages)
            .filter(p => p.imageinfo?.[0])
            .map(p => ({
                title: p.title,
                url: p.imageinfo![0].url,
                width: p.imageinfo![0].width,
                height: p.imageinfo![0].height,
            }));
    }

    const url = `${HTML_BASE}${encodeURI(pages[pageId].title.replace(/ /g, '_'))}`;

    return {
        pageid: pages[pageId].pageid ?? -1,
        title: pages[pageId].title,
        content: wikitext,
        link: url,
        images,
    };
}

export async function doGetPage(query: string): Promise<Page> {
    const result = await doGetPageRaw(query);
    return {
        content: doWikitext2markdown(result.content),
        ...(({ content: _, ...args }) => args)(result),
    } satisfies Page;
}
