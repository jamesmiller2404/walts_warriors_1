import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ask_walt_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_name" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"member_id" integer,
  	"pinned" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ask_walt_questions_id" integer;
  ALTER TABLE "ask_walt_questions" ADD CONSTRAINT "ask_walt_questions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ask_walt_questions_member_name_idx" ON "ask_walt_questions" USING btree ("member_name");
  CREATE INDEX "ask_walt_questions_member_idx" ON "ask_walt_questions" USING btree ("member_id");
  CREATE INDEX "ask_walt_questions_pinned_idx" ON "ask_walt_questions" USING btree ("pinned");
  CREATE INDEX "ask_walt_questions_updated_at_idx" ON "ask_walt_questions" USING btree ("updated_at");
  CREATE INDEX "ask_walt_questions_created_at_idx" ON "ask_walt_questions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ask_walt_questions_fk" FOREIGN KEY ("ask_walt_questions_id") REFERENCES "public"."ask_walt_questions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ask_walt_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("ask_walt_questions_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ask_walt_questions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ask_walt_questions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ask_walt_questions_fk";
  
  DROP INDEX "payload_locked_documents_rels_ask_walt_questions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ask_walt_questions_id";`);
}
