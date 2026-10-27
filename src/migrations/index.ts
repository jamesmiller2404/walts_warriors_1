import * as migration_20261026_192235 from './20261026_192235';
import * as migration_20261027_054717_ask_walt_questions from './20261027_054717_ask_walt_questions';
import * as migration_20261027_074540_event_rsvps_coming_up from './20261027_074540_event_rsvps_coming_up';

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
  {
    up: migration_20261027_074540_event_rsvps_coming_up.up,
    down: migration_20261027_074540_event_rsvps_coming_up.down,
    name: '20261027_074540_event_rsvps_coming_up',
  },
];
