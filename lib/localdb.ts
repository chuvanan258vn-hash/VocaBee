import { PrismaClient as SqliteClient } from '@prisma/sqlite-client';

const globalForLocalDb = global as unknown as { localDb: SqliteClient };
export const localDb = globalForLocalDb.localDb || new SqliteClient();

if (process.env.NODE_ENV !== 'production') globalForLocalDb.localDb = localDb;
