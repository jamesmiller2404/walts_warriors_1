import * as migration_20260827_054735_phase0_member_hardening from './20260827_054735_phase0_member_hardening';
import * as migration_20260829_120000_phase0_existing_db from './20260829_120000_phase0_existing_db';

export const migrations = [
  {
    up: migration_20260827_054735_phase0_member_hardening.up,
    down: migration_20260827_054735_phase0_member_hardening.down,
    name: '20260827_054735_phase0_member_hardening'
  },
  {
    up: migration_20260829_120000_phase0_existing_db.up,
    down: migration_20260829_120000_phase0_existing_db.down,
    name: '20260829_120000_phase0_existing_db'
  },
];
