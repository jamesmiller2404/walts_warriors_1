// Baseline a push-managed Postgres database into Payload's migration history.
//
// Background: if a database's schema was created by Payload's dev-mode schema
// push (drizzle-kit) instead of `payload migrate`, then `payload_migrations`
// holds only the dev marker row (batch = -1) and no real migration names. The
// next `payload migrate` treats the baseline migration as pending and tries to
// CREATE objects that already exist -> the start command exits non-zero and the
// deploy never boots. (This is the current state of the Supabase production DB.)
//
// This script records the migrations as ALREADY APPLIED, so `payload migrate`
// becomes a no-op and future migrations apply incrementally.
//
// Usage (dry run is the default and is read-only):
//   node --env-file=.env.render scripts/stamp-migrations.mjs \
//     --expect-host=aws-0-us-west-1.pooler.supabase.com
//
// Apply (deliberate, triply gated - see "Safety gates" below):
//   STAMP_ALLOW_APPLY=true node --env-file=.env.render scripts/stamp-migrations.mjs \
//     --expect-host=aws-0-us-west-1.pooler.supabase.com --apply
//
// Safety gates:
//   * No .env fallback. DATABASE_URL must come from the environment (or
//     --env-file). If it is missing the script refuses to run, instead of
//     silently falling back to whatever .env contains.
//   * --expect-host is REQUIRED on every run and must exactly match the host in
//     DATABASE_URL, so the command can never target a database you did not name.
//   * --apply additionally requires STAMP_ALLOW_APPLY=true in the environment.
//   * Footgun this guards against: an exported DATABASE_URL in your shell takes
//     precedence over BOTH --env-file and .env (Node and dotenv never override an
//     existing variable), so a command can silently target the wrong database.
//     --expect-host makes that failure loud instead of silent.
//
// Other flags: --allow-missing-tables | --allow-unknown-migrations | --help
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(dirname, '..', 'src', 'migrations');
const indexPath = path.join(migrationsDir, 'index.ts');

// Matches: CREATE TABLE "users_sessions" / CREATE TABLE "public"."x"
const TABLE_RE = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?"(?:public"\.")?([A-Za-z0-9_]+)"/gi;
// Matches the `name: '20261026_192235'` entries in src/migrations/index.ts
const NAME_RE = /name:\s*['"]([^'"]+)['"]/g;

const argv = process.argv.slice(2);
const args = new Set(argv);
const flagValue = (name) => {
  const prefix = `${name}=`;
  const match = argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : undefined;
};

const apply = args.has('--apply');
const allowApply = process.env.STAMP_ALLOW_APPLY === 'true';
const expectHost = flagValue('--expect-host');
const allowMissingTables = args.has('--allow-missing-tables');
const allowUnknownMigrations = args.has('--allow-unknown-migrations');

const log = (msg) => console.log(`[MIGRATIONS:STAMP] ${msg}`);
const fail = (msg) => {
  console.log(`[MIGRATIONS:STAMP] ERROR: ${msg}`);
  process.exitCode = 1;
};

if (args.has('--help') || args.has('-h')) {
  log(
    'Usage: node --env-file=<env-file> scripts/stamp-migrations.mjs --expect-host=<db-host> [--apply]',
  );
  log('  --expect-host=<host>         REQUIRED. Must match the DATABASE_URL host exactly.');
  log('  --apply                      write the changes (default is a read-only dry run)');
  log('                               also requires STAMP_ALLOW_APPLY=true');
  log('  --allow-missing-tables       skip the schema drift guard');
  log('  --allow-unknown-migrations   ignore unknown names in payload_migrations');
  process.exit(0);
}

// Never print credentials: host/database only.
function describeTarget(connectionString) {
  try {
    const url = new URL(connectionString);
    const host = url.hostname;
    const port = url.port || '5432';
    const db = url.pathname.replace(/^\//, '') || '(default)';
    const remote = !['localhost', '127.0.0.1', '::1'].includes(host);
    return { label: `${host}:${port}/${db} (user ${url.username})`, host, remote };
  } catch {
    return { label: '(unparseable DATABASE_URL)', host: null, remote: true };
  }
}

function migrationNames() {
  const source = fs.readFileSync(indexPath, 'utf8');
  const names = [...source.matchAll(NAME_RE)].map((m) => m[1]);
  if (!names.length) {
    throw new Error(
      `No migration names found in ${indexPath}. Is src/migrations/index.ts present?`,
    );
  }
  return names;
}

function expectedTables(names) {
  const tables = new Set();
  for (const name of names) {
    const file = path.join(migrationsDir, `${name}.ts`);
    if (!fs.existsSync(file)) {
      throw new Error(`Migration listed in index.ts but not found on disk: ${file}`);
    }
    for (const match of fs.readFileSync(file, 'utf8').matchAll(TABLE_RE)) {
      tables.add(match[1]);
    }
  }
  return [...tables].sort();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail('No DATABASE_URL set. Pass one explicitly, e.g. node --env-file=.env.render ...');
    return;
  }

  const target = describeTarget(process.env.DATABASE_URL);

  // Gate 1: the target database must be named explicitly on the command line.
  if (!expectHost) {
    fail('--expect-host=<database host> is required.');
    log(`This command would target: ${target.label}`);
    log('Re-run with --expect-host=<host> matching that database so the target is explicit:');
    log('  node --env-file=.env.render scripts/stamp-migrations.mjs --expect-host=<host>');
    return;
  }
  if (!target.host || expectHost.toLowerCase() !== target.host.toLowerCase()) {
    fail(
      `--expect-host=${expectHost} does not match the DATABASE_URL host ` +
        `(${target.host || 'unknown'}).`,
    );
    log('Refusing to continue: the database in DATABASE_URL is not the one you named.');
    return;
  }

  log(`Target database: ${target.label}`);
  log(`Target confirmed against --expect-host: ${target.host}`);
  if (target.remote) {
    log('REMOTE DATABASE - not a local dev server. The default dry run is read-only.');
  }

  const names = migrationNames();
  const tables = expectedTables(names);
  log(
    `${names.length} migration(s) in src/migrations/index.ts, creating ${tables.length} table(s).`,
  );

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
  } catch (err) {
    fail(`Could not connect to the database: ${err.message}`);
    log('Check DATABASE_URL (host, port, password). Use the session-mode pooler on port 5432.');
    return;
  }

  try {
    const exists = await client.query(
      `SELECT to_regclass('public.payload_migrations') IS NOT NULL AS present`,
    );

    if (!exists.rows[0].present) {
      log('payload_migrations does not exist: this is a fresh database.');
      log('Nothing to stamp - just run `payload migrate` (it creates the schema from scratch).');
      return;
    }

    const history = await client.query(
      'SELECT name, batch::int AS batch FROM payload_migrations ORDER BY id',
    );
    const rows = history.rows;
    const devMarkers = rows.filter((r) => r.batch < 0);
    const recorded = rows.filter((r) => r.batch >= 0);
    const recordedNames = new Set(recorded.map((r) => r.name));
    const pending = names.filter((n) => !recordedNames.has(n));
    const known = new Set(names);
    const unknownExisting = recorded.filter((r) => !known.has(r.name));

    log(
      `Recorded migrations: ${recorded.length}` +
        (recorded.length ? ` (${[...recordedNames].join(', ')})` : ''),
    );
    log(`Dev-mode marker rows (batch = -1): ${devMarkers.length}`);
    log(
      `Pending migrations to stamp: ${pending.length}` +
        (pending.length ? ` (${pending.join(', ')})` : ''),
    );

    if (unknownExisting.length) {
      const list = unknownExisting.map((r) => r.name).join(', ');
      if (!allowUnknownMigrations) {
        fail(`payload_migrations contains names not present in src/migrations: ${list}`);
        log('That means this database was migrated with an older migration set.');
        log('Stamping would leave a mixed history. Fix those rows first, or re-run with');
        log('--allow-unknown-migrations if you are certain they should be kept.');
        return;
      }
      log(`Ignoring unknown existing migration name(s): ${list}`);
    }

    const existingTables = new Set(
      (await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`)).rows.map(
        (r) => r.tablename,
      ),
    );
    const missingTables = tables.filter((t) => !existingTables.has(t));

    if (missingTables.length && !allowMissingTables) {
      fail(
        `Schema does not match the migrations: ${missingTables.length} expected table(s) missing.`,
      );
      log(`Missing: ${missingTables.join(', ')}`);
      log('Do not stamp: run `payload migrate` so the missing objects are actually created first.');
      log('Re-run with --allow-missing-tables only if you know the difference is intentional.');
      return;
    }
    if (missingTables.length) {
      log(
        `WARNING: ignoring ${missingTables.length} missing table(s): ${missingTables.join(', ')}`,
      );
    } else {
      log(`Schema check passed: all ${tables.length} expected tables exist.`);
    }

    if (!pending.length && !devMarkers.length) {
      log('Already migration-managed and up to date - nothing to do.');
      return;
    }
    // Gate 3: writing requires an explicit environment opt-in, in addition to
    // --apply and a matching --expect-host.
    if (apply && !allowApply) {
      fail('--apply also requires STAMP_ALLOW_APPLY=true in the environment.');
      log('Refusing to write: this script stays dry-run only unless you opt in explicitly.');
      return;
    }

    if (!apply) {
      log('DRY RUN - no changes written. Re-run with --apply to record the above.');
      if (devMarkers.length) {
        log(`Would delete ${devMarkers.length} dev-mode marker row(s) (batch = -1).`);
      }
      if (pending.length) {
        log(`Would insert ${pending.length} row(s) at the next batch, marking them as applied.`);
      }
      return;
    }

    const nextBatch = recorded.length ? Math.max(...recorded.map((r) => r.batch)) + 1 : 1;

    await client.query('BEGIN');
    try {
      const removed = await client.query('DELETE FROM payload_migrations WHERE batch < 0');
      log(`Deleted ${removed.rowCount} dev-mode marker row(s).`);

      for (const name of pending) {
        await client.query('INSERT INTO payload_migrations (name, batch) VALUES ($1, $2)', [
          name,
          nextBatch,
        ]);
      }
      log(`Inserted ${pending.length} migration row(s) at batch ${nextBatch}.`);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }

    const after = await client.query(
      'SELECT name, batch::int AS batch FROM payload_migrations ORDER BY id',
    );
    log(`payload_migrations now holds ${after.rowCount} row(s):`);
    for (const row of after.rows) {
      log(`  - ${row.name} | batch ${row.batch}`);
    }

    log('Done. `payload migrate` should now report no pending migrations.');
    log(
      'Verify with: npx payload migrate:status (or re-run this script - it should say "nothing to do").',
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.log(`[MIGRATIONS:STAMP] Unexpected error: ${err.message}`);
  process.exitCode = 1;
});
