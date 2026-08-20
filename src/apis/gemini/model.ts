import * as gemini from 'gemini';
export * from 'gemini';

class ModelNotInitializedError extends Error {
    constructor(modelId: string) {
        super(`Model ${modelId} not initialized`);
    }
}

export type BaseModelParams = Omit<gemini.GenerateContentParameters, 'contents'> & { contents?: gemini.GenerateContentParameters['contents'] };
type PromptResolvable = string | string[] | gemini.Part[] | gemini.Content[] | Omit<BaseModelParams, 'model'>;

let genai: gemini.GoogleGenAI | null = null;
let models: Record<string, BaseModelParams[]> = {};

export async function doInit() {
    const apiKey = Deno.env.get('JB_GEMINI_API_KEY');
    if (apiKey) {
        genai = new gemini.GoogleGenAI({ apiKey });
        models = {};
    }
}

export function doIsInitialized(): boolean {
    return genai != null;
}

export function doInitModel(id: string, params: BaseModelParams): BaseModelParams | null {
    if (!models[id]) models[id] = [];
    models[id].push(params);
    return params;
}

export function doGetModels(id: string): BaseModelParams[] {
    return models[id] ?? [];
}

export function doGetModel(id: string): BaseModelParams | null {
    return models[id]?.[0] ?? null;
}

// (don't ask me what this type even is)
type Payload = PromptResolvable | (Partial<gemini.GenerateContentParameters> & { contents: gemini.Content[] | string });
async function doExecuteWithFallback<T>(
    id: string,
    payload: Payload,
    action: (params: gemini.GenerateContentParameters) => Promise<T>
): Promise<T> {
    const fallbackConfigs = models[id];
    if (!fallbackConfigs?.length) {
        throw new ModelNotInitializedError(id);
    }

    // also don't ask me how this works
    const isObj = typeof payload === 'object' && payload !== null && !Array.isArray(payload) && 'contents' in payload;
    const inputParams: Partial<gemini.GenerateContentParameters> = isObj
        ? payload as Partial<gemini.GenerateContentParameters>
        : { contents: payload as gemini.GenerateContentParameters['contents'] };

    let lastError: unknown;
    for (const baseParams of fallbackConfigs) {
        try {
            const mergedParams: gemini.GenerateContentParameters = {
                ...baseParams,
                ...inputParams,
                config: { ...baseParams.config, ...(inputParams.config || {}) }
            } as gemini.GenerateContentParameters;
            return await action(mergedParams);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}

export async function doAskModel(
    id: string,
    prompt: PromptResolvable
): Promise<AsyncIterable<gemini.GenerateContentResponse>> {
    return doExecuteWithFallback(id, prompt, p => genai!.models.generateContentStream(p));
}

export async function doGenerateContent(
    id: string,
    params: PromptResolvable,
): Promise<gemini.GenerateContentResponse> {
    return doExecuteWithFallback(id, params, p => genai!.models.generateContent(p));
}
