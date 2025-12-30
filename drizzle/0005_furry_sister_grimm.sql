CREATE TABLE "spending_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spending_category_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"amount" numeric(19, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spending_category_entries" ADD CONSTRAINT "spending_category_entries_category_id_spending_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."spending_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spending_categories_user_id_idx" ON "spending_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spending_category_entries_category_id_idx" ON "spending_category_entries" USING btree ("category_id");