import * as gemini from './model.ts';
import { cfg } from '@/bot/cfg.ts';

const basicTools: gemini.Tool = {
    functionDeclarations: [
        {
            name: 'list_categories',
            description: 'Zwraca listę wszystkich kategorii komend bota.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {},
            },
        },
        {
            name: 'list_commands',
            description: 'Zwraca listę wszystkich dostępnych komend bota w danej kategorii wraz z ich krótkimi opisami.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    category: {
                        type: gemini.Type.STRING,
                        description: "Kategoria do filtrowania komend (np. 'economy', 'mod', 'general').",
                    },
                },
                required: ['category'],
            },
        },
        {
            name: 'get_command_help',
            description: 'Zwraca szczegółowe informacje o konkretnej komendzie, w tym jej opis, aliasy i argumenty.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    command_name: {
                        type: gemini.Type.STRING,
                        description: 'Nazwa komendy do sprawdzenia.',
                    },
                },
                required: ['command_name'],
            },
        },
        {
            name: 'search_command',
            description: 'Szuka komendy na podstawie słowa kluczowego lub fragmentu opisu.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    query: {
                        type: gemini.Type.STRING,
                        description: 'Słowo kluczowe do wyszukania w nazwach i opisach komend.',
                    },
                },
                required: ['query'],
            },
        },
        {
            name: 'get_server_stats',
            description: 'Zwraca statystyki serwera, takie jak całkowita liczba użytkowników i liczba aktywnych osób.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {},
            },
        },
    ]
};

//const searchTools: gemini.Tool = {
//    googleSearch: {},
//};
//const codeExecTools: gemini.Tool = {
//    codeExecution: {},
//};

const redditTools: gemini.Tool = {
    functionDeclarations: [
        {
            name: 'fetch_reddit_post',
            description: 'Pobiera treść posta z Reddita na podstawie podanego linku.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    url: {
                        type: gemini.Type.STRING,
                        description: 'Link do posta na Reddicie.',
                    },
                },
                required: ['url'],
            },
        },
    ],
};

const githubTools: gemini.Tool = {
     functionDeclarations: [
        {
            name: 'github_get_repo_tree',
            description: 'Pobiera listę plików w repozytorium GitHub.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    owner: { type: gemini.Type.STRING, description: 'Właściciel repozytorium.' },
                    repo: { type: gemini.Type.STRING, description: 'Nazwa repozytorium.' },
                    branch: { type: gemini.Type.STRING, description: 'Branch (opcjonalnie, domyślnie main).' },
                },
                required: ['owner', 'repo'],
            },
        },
        {
            name: 'github_get_file_content',
            description: 'Pobiera zawartość konkretnego pliku z repozytorium GitHub.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    owner: { type: gemini.Type.STRING, description: 'Właściciel repozytorium.' },
                    repo: { type: gemini.Type.STRING, description: 'Nazwa repozytorium.' },
                    path: { type: gemini.Type.STRING, description: 'Ścieżka do pliku.' },
                    branch: { type: gemini.Type.STRING, description: 'Branch (opcjonalnie, domyślnie main).' },
                },
                required: ['owner', 'repo', 'path'],
            },
        },
        {
            name: 'github_search_code',
            description: 'Przeszukuje kod wewnątrz repozytorium GitHub.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    owner: { type: gemini.Type.STRING, description: 'Właściciel repozytorium.' },
                    repo: { type: gemini.Type.STRING, description: 'Nazwa repozytorium.' },
                    query: { type: gemini.Type.STRING, description: 'Zapytanie wyszukiwania.' },
                },
                required: ['owner', 'repo', 'query'],
            },
        },
        {
            name: 'github_get_readme',
            description: 'Pobiera zawartość pliku README z repozytorium GitHub.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    owner: { type: gemini.Type.STRING, description: 'Właściciel repozytorium.' },
                    repo: { type: gemini.Type.STRING, description: 'Nazwa repozytorium.' },
                    branch: { type: gemini.Type.STRING, description: 'Branch (opcjonalnie, domyślnie main).' },
                },
                required: ['owner', 'repo'],
            },
        },
    ],
};

const memoriesTools: gemini.Tool = {
    functionDeclarations: [
        {
            name: 'save_memory',
            description: 'Zapisuje informację o użytkowniku lub o czymś o czym zostanie poinformowany model, a co może być ważne w przuszłości.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    memory: {
                        type: gemini.Type.STRING,
                        description: 'Treść informacji do zapamiętania.',
                    },
                    associated_user_id: {
                        type: gemini.Type.STRING,
                        description: 'ID użytkownika (w formacie Discord Snowflake), z którym powiązana jest ta informacja. Jest ono opcjonalne, ale zawsze używaj jeżeli zapisujesz informację o jakimś użytkowniku.',
                    },
                },
                required: ['memory'],
            },
        },
        {
            name: 'read_memories',
            description: 'Pobiera listę wcześniej zapisanych informacji.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    limit: {
                        type: gemini.Type.NUMBER,
                        description: 'Maksymalna liczba wspomnień do pobrania (domyślnie 10).',
                    },
                    offset: {
                        type: gemini.Type.NUMBER,
                        description: 'Przesunięcie (stronicowanie).',
                    },
                },
            },
        },
    ],
};

const imageTools: gemini.Tool = {
    functionDeclarations: [
        {
            name: 'ocr_image',
            description: 'Rozpoznaje tekst z obrazu (PNG, JPG, WEBP) przy użyciu OCR.space i zwraca sam tekst.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    file_url: {
                        type: gemini.Type.STRING,
                        description: 'URL do obrazu lub base64 pliku',
                    },
                },
                required: ['file_url'],
            },
        },
        {
            name: 'generate_image',
            description: 'Generuje obraz na podstawie opisu (promptu) i proporcji/rozdzielczości.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    prompt: {
                        type: gemini.Type.STRING,
                        description: 'Opis obrazu do wygenerowania (najlepiej po angielsku).',
                    },
                    resolution: {
                        type: gemini.Type.STRING,
                        description: 'Proporcje obrazu.',
                        enum: ['1:1', '16:9'],
                        format: 'enum',
                    },
                },
                required: ['prompt', 'resolution'],
            },
        },
    ],
};

const compilerTools: gemini.Tool = {
    functionDeclarations: [
        {
            name: 'compile_code',
            description: 'Kompiluje podany kod.',
            parameters: {
                type: gemini.Type.OBJECT,
                properties: {
                    code: {
                        type: gemini.Type.STRING,
                        description: 'Kod/skrypt do skompilowania/uruchomienia.',
                    },
                    compiler: {
                        type: gemini.Type.STRING,
                        description: 'Nazwa kompilatora/języka programowania. Na przykład `bash`.',
                    },
                    stdin: {
                        type: gemini.Type.STRING,
                        description: 'Tekst który ma zostać wysłany do stdin (wejścia standardowego) programu.'
                    },
                },
                required: ['code', 'compiler'],
            },
        }
    ],
};

export function doGetTools(): gemini.Tool[] {
    const conf = cfg.features.ai;
    return [
        basicTools,
        imageTools,
        //...(conf.searchEnabled   ? [searchTools]   : []),
        //...(conf.codeExecEnabled ? [codeExecTools] : []),
        //...let the hamsters go free!
        ...(conf.redditEnabled   ? [redditTools]   : []),
        ...(conf.githubEnabled   ? [githubTools]   : []),
        ...(conf.memoriesEnabled ? [memoriesTools] : []),
        ...(conf.compilerEnabled ? [compilerTools] : []),
    ];
}
