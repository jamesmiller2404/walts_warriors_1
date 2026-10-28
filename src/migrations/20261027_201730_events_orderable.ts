import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "_order" varchar;
  CREATE INDEX "events__order_idx" ON "events" USING btree ("_order");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "events__order_idx";
  ALTER TABLE "events" DROP COLUMN "_order";`);
}
