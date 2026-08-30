import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Full-schema baseline — intended for FRESH databases only. For the existing
// push-managed Supabase DB, mark this migration as applied (insert a row into
// `payload_migrations`) and apply the incremental migration instead:
// `20260829_*_phase0_existing_db.ts`. `payload_migrations` is intentionally NOT
// dropped by down() so `migrate:down`/`migrate:reset` keep the tracking table.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_programs_category" AS ENUM('nutrition', 'fitness', 'mindset', 'lifestyle', 'community', 'other');
  CREATE TYPE "public"."enum_resources_category" AS ENUM('nutrition', 'fitness', 'mindset', 'lifestyle', 'community', 'general');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_gallery_category" AS ENUM('general', 'community', 'events', 'challenges', 'nutrition', 'fitness', 'mindset');
  CREATE TYPE "public"."enum_challenges_status" AS ENUM('draft', 'upcoming', 'active', 'completed');
  CREATE TYPE "public"."enum_members_status" AS ENUM('active', 'pending', 'suspended');
  CREATE TYPE "public"."enum_badges_criteria_type" AS ENUM('checkin_count', 'streak_length');
  CREATE TYPE "public"."enum_site_settings_social_links_platform" AS ENUM('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'other');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_column_start" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_column_span" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_row_start" AS ENUM('auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_row_span" AS ENUM('auto', '1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_font_family" AS ENUM('manrope', 'manrope-semibold', 'manrope-bold', 'manrope-extrabold', 'archivo-black', 'montserrat-bold', 'montserrat-extrabold', 'eb-garamond-italic', 'eb-garamond-medium-italic', 'eb-garamond-semibold-italic');
  CREATE TYPE "public"."enum_home_page_blocks_text_block_font_color" AS ENUM('stone-900', 'stone-800', 'stone-700', 'stone-600', 'brand-900', 'brand-800', 'brand-700', 'brand-600', 'white');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_column_start" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_column_span" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_row_start" AS ENUM('auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_row_span" AS ENUM('auto', '1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_quote_font_family" AS ENUM('manrope', 'manrope-semibold', 'manrope-bold', 'manrope-extrabold', 'archivo-black', 'montserrat-bold', 'montserrat-extrabold', 'eb-garamond-italic', 'eb-garamond-medium-italic', 'eb-garamond-semibold-italic');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_quote_font_color" AS ENUM('stone-900', 'stone-800', 'stone-700', 'stone-600', 'brand-900', 'brand-800', 'brand-700', 'brand-600', 'white');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_attribution_font_family" AS ENUM('manrope', 'manrope-semibold', 'manrope-bold', 'manrope-extrabold', 'archivo-black', 'montserrat-bold', 'montserrat-extrabold', 'eb-garamond-italic', 'eb-garamond-medium-italic', 'eb-garamond-semibold-italic');
  CREATE TYPE "public"."enum_home_page_blocks_quote_block_attribution_font_color" AS ENUM('stone-900', 'stone-800', 'stone-700', 'stone-600', 'brand-900', 'brand-800', 'brand-700', 'brand-600', 'white');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_column_start" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_column_span" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_row_start" AS ENUM('auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_row_span" AS ENUM('auto', '1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_quote_font_family" AS ENUM('manrope', 'manrope-semibold', 'manrope-bold', 'manrope-extrabold', 'archivo-black', 'montserrat-bold', 'montserrat-extrabold', 'eb-garamond-italic', 'eb-garamond-medium-italic', 'eb-garamond-semibold-italic');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_quote_font_color" AS ENUM('stone-900', 'stone-800', 'stone-700', 'stone-600', 'brand-900', 'brand-800', 'brand-700', 'brand-600', 'white');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_attribution_font_family" AS ENUM('manrope', 'manrope-semibold', 'manrope-bold', 'manrope-extrabold', 'archivo-black', 'montserrat-bold', 'montserrat-extrabold', 'eb-garamond-italic', 'eb-garamond-medium-italic', 'eb-garamond-semibold-italic');
  CREATE TYPE "public"."enum_home_page_blocks_dynamic_quote_attribution_font_color" AS ENUM('stone-900', 'stone-800', 'stone-700', 'stone-600', 'brand-900', 'brand-800', 'brand-700', 'brand-600', 'white');
  CREATE TYPE "public"."enum_home_page_blocks_image_block_column_start" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_image_block_column_span" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_home_page_blocks_image_block_row_start" AS ENUM('auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
  CREATE TYPE "public"."enum_home_page_blocks_image_block_row_span" AS ENUM('auto', '1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_home_page_blocks_image_block_object_fit" AS ENUM('cover', 'contain', 'fill', 'none', 'scale-down');
  CREATE TYPE "public"."enum_quote_settings_rotation_mode" AS ENUM('page-load', 'session', 'day', 'week');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"summary" varchar,
  	"image_id" integer,
  	"category" "enum_programs_category" DEFAULT 'lifestyle',
  	"pricing_show_price" boolean DEFAULT false,
  	"pricing_price_label" varchar,
  	"pricing_price_note" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"summary" varchar,
  	"featured_image_id" integer,
  	"category" "enum_resources_category" DEFAULT 'general',
  	"published_at" timestamp(3) with time zone,
  	"status" "enum_resources_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_name" varchar NOT NULL,
  	"quote" varchar NOT NULL,
  	"role" varchar,
  	"photo_id" integer,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"summary" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"location" varchar,
  	"registration_url" varchar,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"category" "enum_gallery_category" DEFAULT 'general',
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "challenges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"summary" varchar,
  	"description" jsonb NOT NULL,
  	"image_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"status" "enum_challenges_status" DEFAULT 'upcoming' NOT NULL,
  	"join_url" varchar,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"avatar_id" integer,
  	"bio" varchar,
  	"status" "enum_members_status" DEFAULT 'active' NOT NULL,
  	"total_check_ins" numeric DEFAULT 0,
  	"current_streak" numeric DEFAULT 0,
  	"longest_streak" numeric DEFAULT 0,
  	"last_check_in_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "check_ins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"challenge_id" integer,
  	"note" varchar,
  	"check_in_date" timestamp(3) with time zone NOT NULL,
  	"check_in_day" timestamp(3) with time zone,
  	"check_in_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "badges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"icon_id" integer,
  	"criteria_type" "enum_badges_criteria_type" NOT NULL,
  	"criteria_value" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "member_badges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"badge_id" integer NOT NULL,
  	"awarded_at" timestamp(3) with time zone NOT NULL,
  	"award_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"programs_id" integer,
  	"resources_id" integer,
  	"testimonials_id" integer,
  	"quotes_id" integer,
  	"events_id" integer,
  	"gallery_id" integer,
  	"challenges_id" integer,
  	"members_id" integer,
  	"check_ins_id" integer,
  	"badges_id" integer,
  	"member_badges_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"members_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"business_name" varchar DEFAULT 'Walt''s Warriors' NOT NULL,
  	"tagline" varchar DEFAULT 'Nothing feels as good as feeling good feels!',
  	"logo_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_zip" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"column_start" "enum_home_page_blocks_text_block_column_start" DEFAULT '1',
  	"column_span" "enum_home_page_blocks_text_block_column_span" DEFAULT '6',
  	"row_start" "enum_home_page_blocks_text_block_row_start" DEFAULT 'auto',
  	"row_span" "enum_home_page_blocks_text_block_row_span" DEFAULT 'auto',
  	"font_family" "enum_home_page_blocks_text_block_font_family" DEFAULT 'manrope',
  	"font_size" varchar DEFAULT '18',
  	"font_color" "enum_home_page_blocks_text_block_font_color" DEFAULT 'stone-900',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_quote_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar,
  	"column_start" "enum_home_page_blocks_quote_block_column_start" DEFAULT '1',
  	"column_span" "enum_home_page_blocks_quote_block_column_span" DEFAULT '6',
  	"row_start" "enum_home_page_blocks_quote_block_row_start" DEFAULT 'auto',
  	"row_span" "enum_home_page_blocks_quote_block_row_span" DEFAULT 'auto',
  	"quote_font_family" "enum_home_page_blocks_quote_block_quote_font_family" DEFAULT 'eb-garamond-italic',
  	"quote_font_size" varchar DEFAULT '28',
  	"quote_font_color" "enum_home_page_blocks_quote_block_quote_font_color" DEFAULT 'stone-900',
  	"attribution_font_family" "enum_home_page_blocks_quote_block_attribution_font_family" DEFAULT 'manrope-semibold',
  	"attribution_font_size" varchar DEFAULT '18',
  	"attribution_font_color" "enum_home_page_blocks_quote_block_attribution_font_color" DEFAULT 'stone-600',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_dynamic_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"column_start" "enum_home_page_blocks_dynamic_quote_column_start" DEFAULT '1',
  	"column_span" "enum_home_page_blocks_dynamic_quote_column_span" DEFAULT '6',
  	"row_start" "enum_home_page_blocks_dynamic_quote_row_start" DEFAULT 'auto',
  	"row_span" "enum_home_page_blocks_dynamic_quote_row_span" DEFAULT 'auto',
  	"quote_font_family" "enum_home_page_blocks_dynamic_quote_quote_font_family" DEFAULT 'eb-garamond-italic',
  	"quote_font_size" varchar DEFAULT '28',
  	"quote_font_color" "enum_home_page_blocks_dynamic_quote_quote_font_color" DEFAULT 'stone-900',
  	"attribution_font_family" "enum_home_page_blocks_dynamic_quote_attribution_font_family" DEFAULT 'manrope-semibold',
  	"attribution_font_size" varchar DEFAULT '18',
  	"attribution_font_color" "enum_home_page_blocks_dynamic_quote_attribution_font_color" DEFAULT 'stone-600',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"column_start" "enum_home_page_blocks_image_block_column_start" DEFAULT '1',
  	"column_span" "enum_home_page_blocks_image_block_column_span" DEFAULT '6',
  	"row_start" "enum_home_page_blocks_image_block_row_start" DEFAULT 'auto',
  	"row_span" "enum_home_page_blocks_image_block_row_span" DEFAULT 'auto',
  	"object_fit" "enum_home_page_blocks_image_block_object_fit" DEFAULT 'cover',
  	"object_position" varchar DEFAULT 'center',
  	"alt" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"background_image_id" integer,
  	"background_opacity" numeric DEFAULT 100,
  	"headline" varchar DEFAULT 'Welcome to Walt''s Warriors' NOT NULL,
  	"subheadline" varchar DEFAULT 'A health and wellness community helping people thrive through nutrition, fitness, mindset, and healthy lifestyle habits.',
  	"introduction" jsonb,
  	"cta_heading" varchar DEFAULT 'Ready to feel good?',
  	"cta_text" varchar DEFAULT 'Join the community and start building habits that last. Nothing feels as good as feeling good feels!',
  	"cta_button_label" varchar DEFAULT 'Get in Touch',
  	"cta_button_link" varchar DEFAULT '/contact',
  	"cta_secondary_text" varchar DEFAULT 'Building discipline, one day at a time.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"programs_id" integer
  );
  
  CREATE TABLE "about_walt_focus_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_walt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'About Walt''s Warriors' NOT NULL,
  	"subheadline" varchar DEFAULT 'A health and wellness community dedicated to helping people thrive.',
  	"hero_image_id" integer,
  	"introduction" jsonb,
  	"philosophy" varchar DEFAULT 'Nothing feels as good as feeling good feels!',
  	"portrait_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Contact' NOT NULL,
  	"intro" varchar DEFAULT 'We would love to hear from you. Reach out with questions, encouragement, or to join the community.',
  	"form_note" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "community_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"total_members" numeric DEFAULT 0,
  	"total_check_ins" numeric DEFAULT 0,
  	"total_badges_awarded" numeric DEFAULT 0,
  	"last_updated" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "quote_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rotation_mode" "enum_quote_settings_rotation_mode" DEFAULT 'day',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "challenges" ADD CONSTRAINT "challenges_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "badges" ADD CONSTRAINT "badges_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_challenges_fk" FOREIGN KEY ("challenges_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_check_ins_fk" FOREIGN KEY ("check_ins_id") REFERENCES "public"."check_ins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_badges_fk" FOREIGN KEY ("badges_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_badges_fk" FOREIGN KEY ("member_badges_id") REFERENCES "public"."member_badges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_hours" ADD CONSTRAINT "site_settings_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_text_block" ADD CONSTRAINT "home_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_quote_block" ADD CONSTRAINT "home_page_blocks_quote_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_dynamic_quote" ADD CONSTRAINT "home_page_blocks_dynamic_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_image_block" ADD CONSTRAINT "home_page_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_image_block" ADD CONSTRAINT "home_page_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_walt_focus_areas" ADD CONSTRAINT "about_walt_focus_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_walt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_walt" ADD CONSTRAINT "about_walt_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_walt" ADD CONSTRAINT "about_walt_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_image_idx" ON "programs" USING btree ("image_id");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_featured_image_idx" ON "resources" USING btree ("featured_image_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "gallery_image_idx" ON "gallery" USING btree ("image_id");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE UNIQUE INDEX "challenges_slug_idx" ON "challenges" USING btree ("slug");
  CREATE INDEX "challenges_image_idx" ON "challenges" USING btree ("image_id");
  CREATE INDEX "challenges_updated_at_idx" ON "challenges" USING btree ("updated_at");
  CREATE INDEX "challenges_created_at_idx" ON "challenges" USING btree ("created_at");
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_avatar_idx" ON "members" USING btree ("avatar_id");
  CREATE INDEX "members_status_idx" ON "members" USING btree ("status");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "check_ins_member_idx" ON "check_ins" USING btree ("member_id");
  CREATE INDEX "check_ins_challenge_idx" ON "check_ins" USING btree ("challenge_id");
  CREATE INDEX "check_ins_check_in_day_idx" ON "check_ins" USING btree ("check_in_day");
  CREATE UNIQUE INDEX "check_ins_check_in_key_idx" ON "check_ins" USING btree ("check_in_key");
  CREATE INDEX "check_ins_updated_at_idx" ON "check_ins" USING btree ("updated_at");
  CREATE INDEX "check_ins_created_at_idx" ON "check_ins" USING btree ("created_at");
  CREATE INDEX "badges_icon_idx" ON "badges" USING btree ("icon_id");
  CREATE INDEX "badges_updated_at_idx" ON "badges" USING btree ("updated_at");
  CREATE INDEX "badges_created_at_idx" ON "badges" USING btree ("created_at");
  CREATE INDEX "member_badges_member_idx" ON "member_badges" USING btree ("member_id");
  CREATE INDEX "member_badges_badge_idx" ON "member_badges" USING btree ("badge_id");
  CREATE UNIQUE INDEX "member_badges_award_key_idx" ON "member_badges" USING btree ("award_key");
  CREATE INDEX "member_badges_updated_at_idx" ON "member_badges" USING btree ("updated_at");
  CREATE INDEX "member_badges_created_at_idx" ON "member_badges" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_challenges_id_idx" ON "payload_locked_documents_rels" USING btree ("challenges_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_check_ins_id_idx" ON "payload_locked_documents_rels" USING btree ("check_ins_id");
  CREATE INDEX "payload_locked_documents_rels_badges_id_idx" ON "payload_locked_documents_rels" USING btree ("badges_id");
  CREATE INDEX "payload_locked_documents_rels_member_badges_id_idx" ON "payload_locked_documents_rels" USING btree ("member_badges_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_hours_order_idx" ON "site_settings_hours" USING btree ("_order");
  CREATE INDEX "site_settings_hours_parent_id_idx" ON "site_settings_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "home_page_blocks_text_block_order_idx" ON "home_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_text_block_parent_id_idx" ON "home_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_text_block_path_idx" ON "home_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_quote_block_order_idx" ON "home_page_blocks_quote_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_quote_block_parent_id_idx" ON "home_page_blocks_quote_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_quote_block_path_idx" ON "home_page_blocks_quote_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_dynamic_quote_order_idx" ON "home_page_blocks_dynamic_quote" USING btree ("_order");
  CREATE INDEX "home_page_blocks_dynamic_quote_parent_id_idx" ON "home_page_blocks_dynamic_quote" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_dynamic_quote_path_idx" ON "home_page_blocks_dynamic_quote" USING btree ("_path");
  CREATE INDEX "home_page_blocks_image_block_order_idx" ON "home_page_blocks_image_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_image_block_parent_id_idx" ON "home_page_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_image_block_path_idx" ON "home_page_blocks_image_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_image_block_image_idx" ON "home_page_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "home_page_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page_background_image_idx" ON "home_page" USING btree ("background_image_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_programs_id_idx" ON "home_page_rels" USING btree ("programs_id");
  CREATE INDEX "about_walt_focus_areas_order_idx" ON "about_walt_focus_areas" USING btree ("_order");
  CREATE INDEX "about_walt_focus_areas_parent_id_idx" ON "about_walt_focus_areas" USING btree ("_parent_id");
  CREATE INDEX "about_walt_hero_image_idx" ON "about_walt" USING btree ("hero_image_id");
  CREATE INDEX "about_walt_portrait_idx" ON "about_walt" USING btree ("portrait_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "challenges" CASCADE;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "check_ins" CASCADE;
  DROP TABLE "badges" CASCADE;
  DROP TABLE "member_badges" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_hours" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "home_page_blocks_text_block" CASCADE;
  DROP TABLE "home_page_blocks_quote_block" CASCADE;
  DROP TABLE "home_page_blocks_dynamic_quote" CASCADE;
  DROP TABLE "home_page_blocks_image_block" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "about_walt_focus_areas" CASCADE;
  DROP TABLE "about_walt" CASCADE;
  DROP TABLE "contact_page" CASCADE;
  DROP TABLE "community_stats" CASCADE;
  DROP TABLE "quote_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_programs_category";
  DROP TYPE "public"."enum_resources_category";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum_gallery_category";
  DROP TYPE "public"."enum_challenges_status";
  DROP TYPE "public"."enum_members_status";
  DROP TYPE "public"."enum_badges_criteria_type";
  DROP TYPE "public"."enum_site_settings_social_links_platform";
  DROP TYPE "public"."enum_home_page_blocks_text_block_column_start";
  DROP TYPE "public"."enum_home_page_blocks_text_block_column_span";
  DROP TYPE "public"."enum_home_page_blocks_text_block_row_start";
  DROP TYPE "public"."enum_home_page_blocks_text_block_row_span";
  DROP TYPE "public"."enum_home_page_blocks_text_block_font_family";
  DROP TYPE "public"."enum_home_page_blocks_text_block_font_color";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_column_start";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_column_span";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_row_start";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_row_span";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_quote_font_family";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_quote_font_color";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_attribution_font_family";
  DROP TYPE "public"."enum_home_page_blocks_quote_block_attribution_font_color";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_column_start";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_column_span";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_row_start";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_row_span";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_quote_font_family";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_quote_font_color";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_attribution_font_family";
  DROP TYPE "public"."enum_home_page_blocks_dynamic_quote_attribution_font_color";
  DROP TYPE "public"."enum_home_page_blocks_image_block_column_start";
  DROP TYPE "public"."enum_home_page_blocks_image_block_column_span";
  DROP TYPE "public"."enum_home_page_blocks_image_block_row_start";
  DROP TYPE "public"."enum_home_page_blocks_image_block_row_span";
  DROP TYPE "public"."enum_home_page_blocks_image_block_object_fit";
  DROP TYPE "public"."enum_quote_settings_rotation_mode";`)
}
