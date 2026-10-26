// Load .env if present (local dev). On hosts like Render there is no .env file
// in the repo, so real environment variables are used instead.
import 'dotenv/config';

// Fail fast with a clear message when required environment variables are
// missing during a production build (e.g. on Render), instead of failing
// deep inside Payload init / Next.js prerendering with a cryptic error.
const required = ['DATABASE_URL', 'PAYLOAD_SECRET', 'NEXT_PUBLIC_SERVER_URL'];

const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === '');

if (missing.length > 0) {
  console.log(`\n[ENV CHECK] Missing required environment variables: ${missing.join(', ')}`);
  console.log(
    '[ENV CHECK] Fix: Render Dashboard -> your service -> Environment -> add the missing variables,',
  );
  console.log(
    '[ENV CHECK] then Deployments -> "Deploy latest commit". They must be set BEFORE the build',
  );
  console.log('[ENV CHECK] starts (Next.js/Payload read them at build time).\n');
  // exitCode (not process.exit) so piped stdout flushes before exit
  process.exitCode = 1;
}

console.log('[ENV CHECK] All required environment variables are set.');
