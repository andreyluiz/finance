CREATE TABLE "installment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"total_value" numeric(19, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"priority" "priority" NOT NULL,
	"installment_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "installment_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "installment_number" integer;--> statement-breakpoint
CREATE INDEX "installment_plans_user_id_idx" ON "installment_plans" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_plan_id_installment_plans_id_fk" FOREIGN KEY ("installment_plan_id") REFERENCES "public"."installment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_installment_plan_idx" ON "transactions" USING btree ("installment_plan_id");