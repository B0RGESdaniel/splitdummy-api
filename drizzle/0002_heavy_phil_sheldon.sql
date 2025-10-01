ALTER TABLE "items" DROP CONSTRAINT "items_tab_id_tabs_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" DROP CONSTRAINT "participants_tabId_tabs_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" DROP CONSTRAINT "parts_tab_id_tabs_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" DROP CONSTRAINT "parts_participant_id_participants_id_fk";
--> statement-breakpoint
ALTER TABLE "tabs" DROP CONSTRAINT "tabs_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_tab_id_tabs_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."tabs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_tabId_tabs_id_fk" FOREIGN KEY ("tabId") REFERENCES "public"."tabs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_tab_id_tabs_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."tabs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tabs" ADD CONSTRAINT "tabs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;