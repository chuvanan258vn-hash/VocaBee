import { PrismaClient } from '@prisma/client'
import { localDb } from './localdb'

function createSyncPrisma() {
    const basePrisma = new PrismaClient();
    
    // Create an extended client that intercepts all model operations
    const extendedPrisma = basePrisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    const result = await query(args);
                    
                    const mutations = ['create', 'update', 'upsert', 'delete'];
                    if (mutations.includes(operation) && result && (result as any).id) {
                        try {
                            if (operation === 'delete') {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                await localDb[model].delete({ where: { id: (result as any).id } }).catch(() => {});
                            } else {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                await localDb[model].upsert({
                                    where: { id: (result as any).id },
                                    create: result,
                                    update: result
                                }).catch((e: any) => console.log(`[Sync] LocalDB upsert error on ${model}: ${e.message}`));
                            }
                        } catch (err) {
                            // Suppress sync errors so main flow isn't interrupted
                        }
                    }
                    return result;
                }
            }
        }
    });

    // Proxy the extended client to intercept $executeRawUnsafe and $executeRaw
    return new Proxy(extendedPrisma, {
        get(target: any, prop) {
            if (prop === '$executeRawUnsafe') {
                return async (...args: any[]) => {
                    const res = await target.$executeRawUnsafe(...args);
                    try {
                        await localDb.$executeRawUnsafe(args[0], ...args.slice(1)).catch((e: any) => console.log('[Sync] localDb executeRawUnsafe error:', e.message));
                    } catch (e) {}
                    return res;
                };
            }
            if (prop === '$executeRaw') {
                return async (...args: any[]) => {
                    const res = await target.$executeRaw(...args);
                    try {
                        await localDb.$executeRaw(args[0], ...args.slice(1)).catch((e: any) => console.log('[Sync] localDb executeRaw error:', e.message));
                    } catch (e) {}
                    return res;
                };
            }
            return target[prop];
        }
    }) as unknown as PrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createSyncPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;