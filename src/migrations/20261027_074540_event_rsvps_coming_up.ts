import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_rsvps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"member_id" integer NOT NULL,
  	"rsvp_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_coming_up_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "rsvp_enabled" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_rsvps_id" integer;
  ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_coming_up_events" ADD CONSTRAINT "home_page_coming_up_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_coming_up_events" ADD CONSTRAINT "home_page_coming_up_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_rsvps_event_idx" ON "event_rsvps" USING btree ("event_id");
  CREATE INDEX "event_rsvps_member_idx" ON "event_rsvps" USING btree ("member_id");
  CREATE UNIQUE INDEX "event_rsvps_rsvp_key_idx" ON "event_rsvps" USING btree ("rsvp_key");
  CREATE INDEX "event_rsvps_updated_at_idx" ON "event_rsvps" USING btree ("updated_at");
  CREATE INDEX "event_rsvps_created_at_idx" ON "event_rsvps" USING btree ("created_at");
  CREATE INDEX "home_page_coming_up_events_order_idx" ON "home_page_coming_up_events" USING btree ("_order");
  CREATE INDEX "home_page_coming_up_events_parent_id_idx" ON "home_page_coming_up_events" USING btree ("_parent_id");
  CREATE INDEX "home_page_coming_up_events_event_idx" ON "home_page_coming_up_events" USING btree ("event_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_rsvps_fk" FOREIGN KEY ("event_rsvps_id") REFERENCES "public"."event_rsvps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_event_rsvps_id_idx" ON "payload_locked_documents_rels" USING btree ("event_rsvps_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_rsvps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_coming_up_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_rsvps" CASCADE;
  DROP TABLE "home_page_coming_up_events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_rsvps_fk";
  
  DROP INDEX "payload_locked_documents_rels_event_rsvps_id_idx";
  ALTER TABLE "events" DROP COLUMN "rsvp_enabled";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_rsvps_id";`);
}
