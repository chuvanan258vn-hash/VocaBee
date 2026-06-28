/**
 * Auto-sync the local SQLite database (prisma/dev.db) to GitHub.
 *
 * Why: the app runs locally on multiple machines (home / office). To keep the
 * data in sync, this watcher commits & pushes the SQLite file after every write
 * (add word, add grammar, batch import, set status, delete, ...) and pulls the
 * latest version on startup.
 *
 * IMPORTANT — single-writer rule:
 *   A .db file is binary and git cannot merge it. If you edit data on TWO
 *   machines without syncing in between, you WILL get a conflict and one side's
 *   changes are lost. Workflow: pull when you sit down (this runs on startup),
 *   let it finish pushing before you leave.
 *
 * Usage (run in a separate terminal alongside `npm run dev`):
 *   npm run db:sync           # watch + auto commit/push
 *   DB_SYNC_DRYRUN=1 npm run db:sync   # show what it WOULD do, without committing/pushing
 *
 * Tuning via env:
 *   DB_SYNC_DEBOUNCE_MS  (default 8000)  wait time after the last write before pushing
 */
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = process.cwd();
const DB_REL = 'prisma/dev.db';
const WATCH_DIR = path.join(REPO, 'prisma');
const DEBOUNCE_MS = Number(process.env.DB_SYNC_DEBOUNCE_MS || 8000);
const DRY = !!process.env.DB_SYNC_DRYRUN;
const HOST = os.hostname();

let branch = 'main';
let timer = null;
let busy = false;
let pendingWhileBusy = false;

function log(...a) {
  console.log(`[db-sync ${new Date().toLocaleTimeString()}]`, ...a);
}

function git(args) {
  return new Promise((resolve) => {
    execFile('git', args, { cwd: REPO, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } },
      (err, stdout, stderr) => resolve({ code: err && typeof err.code === 'number' ? err.code : (err ? 1 : 0), stdout: stdout || '', stderr: stderr || '' }));
  });
}

async function hasDbChange() {
  await git(['add', DB_REL]);
  // `diff --cached --quiet` exits 1 when there are staged changes.
  const d = await git(['diff', '--cached', '--quiet', '--', DB_REL]);
  return d.code !== 0;
}

async function commitDb() {
  const msg = `data: auto-sync ${new Date().toISOString()} (${HOST})`;
  // Commit ONLY the db file path — never sweeps in code changes.
  const c = await git(['commit', '-m', msg, '--', DB_REL]);
  return c.code === 0;
}

async function pull() {
  const r = await git(['pull', '--no-rebase', '--no-edit', 'origin', branch]);
  if (r.code === 0) { log('Pulled latest from origin/' + branch + '.'); return; }
  // Detect a binary conflict on the db file.
  const st = await git(['status', '--porcelain', '--', DB_REL]);
  if (/^(UU|AA|DD|U |.U)/m.test(st.stdout)) {
    log('⚠ CONFLICT on', DB_REL, '— keeping LOCAL copy. Remote edits since last sync may be lost.');
    await git(['checkout', '--ours', '--', DB_REL]);
    await git(['add', DB_REL]);
    await git(['commit', '--no-edit']);
  } else {
    log('Pull warning (continuing):', (r.stderr || r.stdout).trim().split('\n')[0]);
    // Abort any half-started merge so the working tree stays clean.
    await git(['merge', '--abort']);
  }
}

async function sync() {
  if (busy) { pendingWhileBusy = true; return; }
  busy = true;
  try {
    if (!(await hasDbChange())) { log('No DB changes.'); return; }
    if (DRY) {
      const stat = await git(['diff', '--cached', '--stat', '--', DB_REL]);
      log('[DRY] would commit + push:\n' + stat.stdout.trim());
      await git(['reset', '-q', '--', DB_REL]); // unstage
      return;
    }
    if (!(await commitDb())) { log('Nothing committed.'); return; }
    log('Committed DB snapshot. Pushing...');
    let p = await git(['push', 'origin', branch]);
    if (p.code !== 0) {
      log('Push rejected (remote moved). Pulling then retrying...');
      await pull();
      p = await git(['push', 'origin', branch]);
    }
    log(p.code === 0 ? '✅ DB pushed to GitHub.' : '❌ Push failed: ' + (p.stderr || p.stdout).trim().split('\n')[0]);
  } catch (e) {
    log('sync error:', e.message);
  } finally {
    busy = false;
    if (pendingWhileBusy) { pendingWhileBusy = false; scheduleSync(); }
  }
}

function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(() => sync(), DEBOUNCE_MS);
}

async function main() {
  const b = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
  branch = (b.stdout || 'main').trim() || 'main';
  log(`Repo: ${REPO}`);
  log(`Watching ${DB_REL} on branch "${branch}" ${DRY ? '(DRY RUN — no commit/push)' : ''}`);
  log('Pulling latest before watching...');
  await pull();

  fs.watch(WATCH_DIR, (_event, filename) => {
    if (!filename) return;
    const f = filename.toString();
    if (f === 'dev.db' || f === 'dev.db-journal') scheduleSync();
  });

  log(`Ready. Auto-sync ${DEBOUNCE_MS / 1000}s after each DB write. Press Ctrl+C to stop.`);
}

// Flush a final push on exit so you don't leave un-synced data behind.
let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(timer);
  log('Shutting down — flushing any pending changes...');
  await sync();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((e) => { log('fatal:', e.message); process.exit(1); });
