CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"unitPrice" numeric(5, 2) NOT NULL,
	"tabId" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"userId" uuid,
	"tabId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tabId" uuid NOT NULL,
	"participantId" uuid NOT NULL,
	"itemId" uuid NOT NULL,
	"partsCount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tabs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"title" text NOT NULL,
	"isClosed" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"serviceCharge" integer DEFAULT 10 NOT NULL,
	"closedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"googleId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_tabId_tabs_id_fk" FOREIGN KEY ("tabId") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_tabId_tabs_id_fk" FOREIGN KEY ("tabId") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_tabId_tabs_id_fk" FOREIGN KEY ("tabId") REFERENCES "public"."tabs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_participantId_participants_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_itemId_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tabs" ADD CONSTRAINT "tabs_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_tabid" ON "items" USING btree ("tabId");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_tabid_name" ON "participants" USING btree ("tabId","name");--> statement-breakpoint
CREATE INDEX "participants_tabid" ON "participants" USING btree ("tabId");--> statement-breakpoint
CREATE UNIQUE INDEX "parts_participantId_itemId_index" ON "parts" USING btree ("participantId","itemId");--> statement-breakpoint
CREATE INDEX "parts_tabid" ON "parts" USING btree ("tabId");--> statement-breakpoint
CREATE INDEX "parts_itemid" ON "parts" USING btree ("itemId");--> statement-breakpoint
CREATE INDEX "parts_participantid" ON "parts" USING btree ("participantId");--> statement-breakpoint
CREATE UNIQUE INDEX "tabs_ownerid" ON "tabs" USING btree ("ownerId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_googleId" ON "users" USING btree ("googleId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email" ON "users" USING btree ("email");