import * as migration_20261026_192235 from './20261026_192235';
import * as migration_20261027_054717_ask_walt_questions from './20261027_054717_ask_walt_questions';

export const migrations = [
  {
    up: migration_20261026_192235.up,
    down: migration_20261026_192235.down,
    name: '20261026_192235',
  },
  {
    up: migration_20261027_054717_ask_walt_questions.up,
    down: migration_20261027_054717_ask_walt_questions.down,
    name: '20261027_054717_ask_walt_questions',
  },
];
