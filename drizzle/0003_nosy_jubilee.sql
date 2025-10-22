ALTER TABLE "installment_plans" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "installment_plans" ADD COLUMN "payment_reference_type" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_reference_type" text;