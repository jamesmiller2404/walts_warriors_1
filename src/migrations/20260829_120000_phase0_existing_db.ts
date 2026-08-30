import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Incremental Phase 0 migration for the EXISTING push-managed Supabase DB.
// The full baseline (`20260827_054735_phase0_member_hardening`) cannot apply
// to a database that already has all tables via db.push, so for that database:
//   1. Mark the baseline as applied:
//      INSERT INTO "payload_migrations" ("name", "batch") VALUES ('20260827_054735_phase0_member_hardening', 1);
//   2. Run `npx payload migrate` — this file applies the Phase 0 additions.
// Every statement is idempotent, so it is also safe to run on fresh databases
// where the baseline has already created the schema.
//
// Existing same-day duplicate check-ins (the pre-hardening hole) are
// de-duplicated before the unique index is created, keeping the earliest
// check-in per member per day.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_members_status') THEN
       CREATE TYPE "public"."enum_members_status" AS ENUM('active', 'pending', 'suspended');
     END IF;
   END
   $$;

  ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "status" "public"."enum_members_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "check_ins" ADD COLUMN IF NOT EXISTS "check_in_day" timestamp(3) with time zone;
  ALTER TABLE "check_ins" ADD COLUMN IF NOT EXISTS "check_in_key" varchar;
  ALTER TABLE "member_badges" ADD COLUMN IF NOT EXISTS "award_key" varchar;

  UPDATE "check_ins" SET "check_in_day" = date_trunc('day', "check_in_date") WHERE "check_in_day" IS NULL;
  UPDATE "check_ins"
    SET "check_in_key" = "member_id"::text || ':' || to_char("check_in_date" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    WHERE "check_in_key" IS NULL;
  UPDATE "member_badges"
    SET "award_key" = "member_id"::text || ':' || "badge_id"::text
    WHERE "award_key" IS NULL;

  DELETE FROM "check_ins" a USING "check_ins" b
    WHERE a."id" > b."id"
      AND a."member_id" = b."member_id"
      AND a."check_in_day" = b."check_in_day";

  CREATE INDEX IF NOT EXISTS "members_status_idx" ON "members" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "check_ins_check_in_day_idx" ON "check_ins" USING btree ("check_in_day");
  CREATE UNIQUE INDEX IF NOT EXISTS "check_ins_check_in_key_idx" ON "check_ins" USING btree ("check_in_key");
  CREATE UNIQUE INDEX IF NOT EXISTS "member_badges_award_key_idx" ON "member_badges" USING btree ("award_key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "member_badges_award_key_idx";
  DROP INDEX IF EXISTS "check_ins_check_in_key_idx";
  DROP INDEX IF EXISTS "check_ins_check_in_day_idx";
  DROP INDEX IF EXISTS "members_status_idx";
  ALTER TABLE "member_badges" DROP COLUMN IF EXISTS "award_key";
  ALTER TABLE "check_ins" DROP COLUMN IF EXISTS "check_in_key";
  ALTER TABLE "check_ins" DROP COLUMN IF EXISTS "check_in_day";
  ALTER TABLE "members" DROP COLUMN IF EXISTS "status";
  DROP TYPE IF EXISTS "public"."enum_members_status";`)
}
