ALTER TABLE "parts" DROP CONSTRAINT "parts_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;