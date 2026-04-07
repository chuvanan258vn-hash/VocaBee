type LocalDbClient = {
    [model: string]: unknown;
    $executeRawUnsafe: (...args: unknown[]) => Promise<unknown>;
    $executeRaw: (...args: unknown[]) => Promise<unknown>;
};

const noopModel = {
    upsert: async () => null,
    delete: async () => null
};

const noopLocalDb: LocalDbClient = new Proxy(
    {
        $executeRawUnsafe: async () => null,
        $executeRaw: async () => null
    } as LocalDbClient,
    {
        get(target, prop: string | symbol) {
            if (typeof prop === 'string' && prop in target) {
                return target[prop];
            }
            return noopModel;
        }
    }
);

function createLocalDbClient(): LocalDbClient {
    try {
        const moduleName = '@prisma/' + 'sqlite-client';
        const dynamicRequire = new Function('return typeof require !== "undefined" ? require : null;')() as
            | ((id: string) => unknown)
            | null;
        if (!dynamicRequire) {
            return noopLocalDb;
        }

        const { PrismaClient } = dynamicRequire(moduleName) as { PrismaClient?: new () => LocalDbClient };
        if (PrismaClient) {
            return new PrismaClient();
        }
    } catch {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[localdb] @prisma/sqlite-client not found. Local sync is disabled.');
        }
    }
    return noopLocalDb;
}

const globalForLocalDb = globalThis as typeof globalThis & { localDb?: LocalDbClient };
export const localDb = globalForLocalDb.localDb ?? createLocalDbClient();

if (process.env.NODE_ENV !== 'production') {
    globalForLocalDb.localDb = localDb;
}
