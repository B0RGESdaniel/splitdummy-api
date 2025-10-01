CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"unit_price" numeric(5, 2) NOT NULL,
	"tab_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid,
	"tabId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tab_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"parts_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tabs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"is_closed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"service_charge" integer DEFAULT 10 NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"google_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_tab_id_tabs_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_tabId_tabs_id_fk" FOREIGN KEY ("tabId") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_tab_id_tabs_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tabs" ADD CONSTRAINT "tabs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_tab_id" ON "items" USING btree ("tab_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_tab_id_name" ON "participants" USING btree ("tabId","name");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_user_id" ON "participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "participants_tab_id" ON "participants" USING btree ("tabId");--> statement-breakpoint
CREATE UNIQUE INDEX "parts_participant_id_item_id_index" ON "parts" USING btree ("participant_id","item_id");--> statement-breakpoint
CREATE INDEX "parts_tab_id" ON "parts" USING btree ("tab_id");--> statement-breakpoint
CREATE INDEX "parts_item_id" ON "parts" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "parts_participant_id" ON "parts" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tabs_owner_id" ON "tabs" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email" ON "users" USING btree ("email");