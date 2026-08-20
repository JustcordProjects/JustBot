import * as pokenode from 'pokenode-ts';
export type * from 'pokenode-ts';

let client: pokenode.PokemonClient | null = null;

export async function doInit() {
    client = new pokenode.PokemonClient();
}

class PokedexNotInitializedError extends Error {
    constructor() {
        super('Pokedex client not initialized');
    }
}

const api = new Proxy(
    { doInit, ...pokenode },
    {
        get(target, prop, receiver) {
            if (prop in target) {
                return Reflect.get(target, prop, receiver);
            }

            if (!client) {
                throw new PokedexNotInitializedError();
            }
            
            // deno-lint-ignore no-explicit-any
            const value = (client as any)[prop];
            if (typeof value === 'function') {
                return value.bind(client);
            }
            
            return value;
        },
    }
);

export default api as {
  init(): Promise<void>;
} & pokenode.PokemonClient & typeof pokenode;
