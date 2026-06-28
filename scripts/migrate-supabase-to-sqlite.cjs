/**
 * One-time data migration: Supabase (PostgreSQL) -> local SQLite.
 *
 * Reads every row from the Supabase database (via the default @prisma/client,
 * generated from prisma/schema.prisma) and writes it into the local SQLite
 * database (via @prisma/sqlite-client, generated from prisma/schema.sqlite.prisma).
 *
 * Safe to re-run: it wipes the SQLite tables first, then re-copies everything,
 * so the SQLite file always becomes an exact snapshot of Supabase.
 *
 * Usage:  node scripts/migrate-supabase-to-sqlite.cjs
 */
require('dotenv').config();

const { PrismaClient: PgClient } = require('@prisma/client');
const { PrismaClient: SqliteClient } = require('@prisma/sqlite-client');

const pg = new PgClient();
const lite = new SqliteClient();

// Insert order respects foreign keys (parents before children).
// Delete order is the reverse (children before parents).
const MODELS = [
  'user',
  'account',
  'session',
  'verificationToken',
  'vocabulary',
  'grammarCard',
  'passwordResetToken',
];

const BATCH = 500;

async function copyModel(model) {
  const rows = await pg[model].findMany();
  if (rows.length === 0) {
    console.log(`  ${model}: 0 rows (skip)`);
    return 0;
  }
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const res = await lite[model].createMany({ data: chunk });
    inserted += res.count ?? chunk.length;
  }
  console.log(`  ${model}: copied ${inserted}/${rows.length}`);
  return inserted;
}

async function main() {
  console.log('--- Wiping SQLite tables (children -> parents) ---');
  for (const model of [...MODELS].reverse()) {
    try {
      const res = await lite[model].deleteMany();
      console.log(`  ${model}: deleted ${res.count}`);
    } catch (e) {
      console.log(`  ${model}: delete skipped (${e.message.split('\n')[0]})`);
    }
  }

  console.log('--- Copying Supabase -> SQLite (parents -> children) ---');
  for (const model of MODELS) {
    await copyModel(model);
  }

  console.log('--- Verifying counts (pg vs sqlite) ---');
  let ok = true;
  for (const model of MODELS) {
    const a = await pg[model].count();
    const b = await lite[model].count();
    const match = a === b ? 'OK' : 'MISMATCH';
    if (a !== b) ok = false;
    console.log(`  ${model.padEnd(20)} pg=${a}  sqlite=${b}  ${match}`);
  }
  console.log(ok ? '\nMigration complete: all counts match.' : '\nMigration finished with MISMATCHES — review above.');
}

main()
  .catch((e) => { console.error('Migration failed:', e); process.exitCode = 1; })
  .finally(async () => { await pg.$disconnect(); await lite.$disconnect(); });
