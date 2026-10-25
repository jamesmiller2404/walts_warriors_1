// Windows command lines are limited to ~8k chars, so lint-staged must NOT
// pass 100+ staged file paths in a single command. These functions chunk the
// file list into small batches and return the commands to run in series.
const CHUNK_SIZE = 20;

const chunks = (files) =>
  Array.from({ length: Math.ceil(files.length / CHUNK_SIZE) }, (_, i) =>
    files
      .slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      .map((f) => `"${f}"`)
      .join(' '),
  );

const config = {
  '*.{ts,tsx,js,mjs,cjs}': (files) => [
    ...chunks(files).map((chunk) => `eslint --fix ${chunk}`),
    ...chunks(files).map((chunk) => `prettier --write ${chunk}`),
  ],
  '*.{css,scss,json,md}': (files) => chunks(files).map((chunk) => `prettier --write ${chunk}`),
};

export default config;
