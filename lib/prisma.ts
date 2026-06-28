// Primary database client: local SQLite.
//
// The app was migrated off Supabase/PostgreSQL onto a local SQLite file
// (prisma/dev.db) so that reads/writes are fast and have no network latency.
// Every data operation in the app goes through this `prisma` instance, which is
// the Prisma Client generated from prisma/schema.sqlite.prisma
// (output: @prisma/sqlite-client).
import { PrismaClient } from '@prisma/sqlite-client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
