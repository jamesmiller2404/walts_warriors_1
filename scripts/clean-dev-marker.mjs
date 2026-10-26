// Payload's dev mode ("push") writes a marker row (batch = -1) into the
// payload_migrations table on every dev-server startup. When that marker is
// present, `payload migrate` stops and asks an interactive question
// ("... Would you like to proceed?"). Interactive prompts hang forever on
// hosts like Render (no keyboard), stalling deploys behind
// "No open ports detected, continuing to scan...".
//
// This script removes the marker BEFORE migrations run, making `npm run start`
// fully non-interactive. Removing the marker is equivalent to answering "yes"
// to Payload's prompt — it tells Payload this database is migration-managed.
import 'dotenv/config';
import pg from 'pg';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('[MIGRATE PREP] No DATABASE_URL set; skipping dev-marker cleanup.');
    process.exitCode = 1;
    return;
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
  } catch (err) {
    console.log(`[MIGRATE PREP] Could not connect to the database: ${err.message}`);
    console.log('[MIGRATE PREP] Check DATABASE_URL (host, port, password).');
    process.exitCode = 1;
    return;
  }

  try {
    const res = await client.query('DELETE FROM payload_migrations WHERE batch = -1');
    console.log(
      `[MIGRATE PREP] Removed ${res.rowCount} dev-mode marker row(s); migrations can run non-interactively.`,
    );
  } catch (err) {
    if (err.code === '42P01') {
      // undefined_table: brand-new database, no payload_migrations yet — nothing to clean.
      console.log(
        '[MIGRATE PREP] payload_migrations table not present yet (fresh database); nothing to clean.',
      );
    } else {
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.log(`[MIGRATE PREP] Unexpected error: ${err.message}`);
  process.exitCode = 1;
});
